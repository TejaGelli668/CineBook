package com.example.adminbackend.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.event.EventListener;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.DefaultCorsProcessor;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Pattern;

/**
 * Keeps the public catalogue (films, show times, theaters, canteen) in memory.
 *
 * The database is a network hop away, so building these lists costs a second
 * or more. They change only when staff edit something, so: serve them from
 * memory, drop everything when staff change the catalogue, and rebuild in the background
 * (at startup, after writes, and every few minutes) so visitors never wait.
 * Nothing per-customer (bookings, seats, payments) is ever cached.
 *
 * Runs ahead of Spring Security: these lists are public and identical for
 * everyone, so a hit skips the per-request sign-in lookup (another database
 * round trip). CORS for hits is applied here from the app's own CORS rules.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class PublicReadCache extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(PublicReadCache.class);
    private static final String REFRESH_HEADER = "X-Cache-Refresh";
    private static final Duration TTL = Duration.ofMinutes(10);
    private static final Set<String> READ_METHODS = Set.of("GET", "HEAD", "OPTIONS");

    private static final Pattern CACHEABLE = Pattern.compile(
            "^/(api/)?movies(/\\d+(/shows)?)?$"
                    + "|^/api/movies/coming-soon$"
                    + "|^/api/theaters(/\\d+|/seat-prices)?$"
                    + "|^/api/food-items(/.*)?$");

    /** Writes that change the catalogue; customer actions (seat holds, bookings, payments) don't. */
    private static final Pattern CATALOGUE_WRITE = Pattern.compile(
            "^/(api/)?(admin|movies|shows|theaters|food-items|upload|seats/admin)(/.*)?$");

    private record Entry(byte[] body, String contentType, long storedAt) {
        boolean fresh() {
            return System.currentTimeMillis() - storedAt < TTL.toMillis();
        }
    }

    private final Map<String, Entry> entries = new ConcurrentHashMap<>();
    private final AtomicBoolean warming = new AtomicBoolean(false);
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final ObjectMapper json = new ObjectMapper();

    private final DefaultCorsProcessor cors = new DefaultCorsProcessor();
    private final ObjectProvider<CorsConfigurationSource> corsSource;

    @Value("${server.port:8080}")
    private int port;

    public PublicReadCache(@Qualifier("corsConfigurationSource") ObjectProvider<CorsConfigurationSource> corsSource) {
        this.corsSource = corsSource;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String method = request.getMethod();
        String path = request.getRequestURI();

        if (!READ_METHODS.contains(method)) {
            chain.doFilter(request, response);
            if (response.getStatus() < 400 && CATALOGUE_WRITE.matcher(path).matches() && !entries.isEmpty()) {
                entries.clear();
                warmSoon();
            }
            return;
        }

        if (!"GET".equals(method) || !CACHEABLE.matcher(path).matches()) {
            chain.doFilter(request, response);
            return;
        }

        String key = request.getQueryString() == null ? path : path + "?" + request.getQueryString();
        boolean forceRefresh = request.getHeader(REFRESH_HEADER) != null && isLoopback(request);
        Entry hit = forceRefresh ? null : entries.get(key);
        if (hit != null && hit.fresh()) {
            CorsConfigurationSource source = corsSource.getIfAvailable();
            CorsConfiguration config = source == null ? null : source.getCorsConfiguration(request);
            if (config != null && !cors.processRequest(config, request, response)) {
                return; // origin not allowed: the processor has already answered 403
            }
            response.setStatus(200);
            response.setContentType(hit.contentType());
            response.setContentLength(hit.body().length);
            response.setHeader("X-Cache", "HIT");
            response.getOutputStream().write(hit.body());
            return;
        }

        ContentCachingResponseWrapper wrapper = new ContentCachingResponseWrapper(response);
        chain.doFilter(request, wrapper);
        if (wrapper.getStatus() == 200 && wrapper.getContentType() != null
                && wrapper.getContentType().contains("json")) {
            entries.put(key, new Entry(wrapper.getContentAsByteArray(), wrapper.getContentType(),
                    System.currentTimeMillis()));
        }
        wrapper.copyBodyToResponse();
    }

    /** Drops everything and rebuilds, for changes made without an HTTP write (e.g. startup jobs). */
    public void clear() {
        entries.clear();
        warmSoon();
    }

    private static boolean isLoopback(HttpServletRequest request) {
        String addr = request.getRemoteAddr();
        return "127.0.0.1".equals(addr) || "0:0:0:0:0:0:0:1".equals(addr) || "::1".equals(addr);
    }

    // ─── Background warming ───────────────────────────────────────────────

    @EventListener(ApplicationReadyEvent.class)
    public void warmOnStartup() {
        new Thread(this::warm, "read-cache-warm").start();
    }

    /** Rebuild shortly before entries go stale, so visitors keep getting hits. */
    @Scheduled(fixedDelay = 8 * 60 * 1000, initialDelay = 8 * 60 * 1000)
    public void warmPeriodically() {
        warm();
    }

    private void warmSoon() {
        new Thread(this::warm, "read-cache-warm").start();
    }

    private void warm() {
        if (!warming.compareAndSet(false, true)) return;
        long started = System.currentTimeMillis();
        try {
            List<String> paths = new ArrayList<>(List.of(
                    "/movies", "/api/movies", "/api/movies/coming-soon",
                    "/api/theaters", "/api/theaters/seat-prices", "/api/food-items"));
            JsonNode movies = fetch("/api/movies");
            JsonNode list = movies == null ? null : movies.path("data");
            if (list != null && list.isArray()) {
                for (JsonNode m : list) {
                    if (m.hasNonNull("id")) paths.add("/api/movies/" + m.get("id").asLong() + "/shows");
                }
            }
            paths.remove("/api/movies"); // already fetched above
            paths.parallelStream().forEach(this::fetch);
            log.info("Public read cache warmed: {} lists in {} ms", paths.size() + 1,
                    System.currentTimeMillis() - started);
        } catch (Exception e) {
            log.warn("Public read cache warm-up failed: {}", e.getMessage());
        } finally {
            warming.set(false);
        }
    }

    private JsonNode fetch(String path) {
        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                    .header(REFRESH_HEADER, "1")
                    .timeout(Duration.ofSeconds(30))
                    .GET()
                    .build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            return res.statusCode() == 200 ? json.readTree(res.body()) : null;
        } catch (Exception e) {
            return null;
        }
    }
}
