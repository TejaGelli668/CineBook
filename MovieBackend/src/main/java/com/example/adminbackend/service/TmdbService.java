package com.example.adminbackend.service;

import com.example.adminbackend.entity.Movie;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.util.UriBuilder;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;

/**
 * Talks to The Movie Database (TMDB) API and maps its data onto our Movie entity.
 * The API key never leaves the backend; posters are downloaded into uploads/movie-posters
 * so they are served the same way as manually uploaded posters.
 */
@Service
public class TmdbService {

    private static final Logger log = LoggerFactory.getLogger(TmdbService.class);
    private static final String IMAGE_BASE = "https://image.tmdb.org/t/p/";
    private static final String POSTER_DIR = "uploads/movie-posters";

    private final WebClient webClient;
    private final WebClient imageClient;

    @Value("${tmdb.api.key:}")
    private String apiKey;

    @Value("${tmdb.region:IN}")
    private String region;

    @Value("${tmdb.language:en-US}")
    private String language;

    public TmdbService(WebClient.Builder builder) {
        this.webClient = builder.clone()
                .baseUrl("https://api.themoviedb.org/3")
                .build();
        this.imageClient = builder.clone()
                .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    // ─── Listing / search ──────────────────────────────────────────────────────

    public Map<String, Object> search(String query, int page) {
        return toResultPage(get("/search/movie", b -> b
                .queryParam("query", query)
                .queryParam("page", page)
                .queryParam("include_adult", false)
                .queryParam("region", region)));
    }

    public Map<String, Object> nowPlaying(int page) {
        return toResultPage(get("/movie/now_playing", b -> b
                .queryParam("page", page)
                .queryParam("region", region)));
    }

    public Map<String, Object> upcoming(int page) {
        return toResultPage(get("/movie/upcoming", b -> b
                .queryParam("page", page)
                .queryParam("region", region)));
    }

    // ─── Public "coming soon" (cached) ─────────────────────────────────────────

    private static final long COMING_SOON_TTL_MS = 60 * 60 * 1000;
    private volatile List<Map<String, Object>> comingSoonCache = List.of();
    private volatile long comingSoonFetchedAt = 0;

    /** Future regional releases, soonest first. Empty when TMDB is unavailable. */
    public List<Map<String, Object>> comingSoon(int limit) {
        if (!isConfigured()) return List.of();
        long now = System.currentTimeMillis();
        if (now - comingSoonFetchedAt > COMING_SOON_TTL_MS) {
            try {
                String today = LocalDate.now().toString();
                List<Map<String, Object>> merged = new ArrayList<>();
                java.util.Set<Object> seen = new java.util.HashSet<>();
                for (int page = 1; page <= 2; page++) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> results = (List<Map<String, Object>>) upcoming(page).get("results");
                    for (Map<String, Object> r : results) {
                        String date = (String) r.get("releaseDate");
                        if (date != null && date.compareTo(today) > 0 && r.get("posterThumbUrl") != null
                                && seen.add(r.get("tmdbId"))) {
                            r.put("posterUrl", ((String) r.get("posterThumbUrl")).replace("/w185/", "/w342/"));
                            merged.add(r);
                        }
                    }
                }
                merged.sort(java.util.Comparator.comparing(r -> (String) r.get("releaseDate")));
                comingSoonCache = merged;
                comingSoonFetchedAt = now;
            } catch (TmdbException e) {
                log.warn("Could not refresh coming soon list: {}", e.getMessage());
                comingSoonFetchedAt = now - COMING_SOON_TTL_MS + 5 * 60 * 1000; // retry in 5 min
            }
        }
        return comingSoonCache.subList(0, Math.min(limit, comingSoonCache.size()));
    }

    // ─── Details → Movie ───────────────────────────────────────────────────────

    /**
     * Fetches full details for a TMDB movie and maps them onto an unsaved Movie.
     * The poster is downloaded locally so posterUrl is a normal /uploads/... path.
     */
    public Movie buildMovie(long tmdbId) {
        // Videos are filtered by request language by default; Indian films often only have
        // trailers tagged in their regional language, so widen the filter.
        JsonNode d = get("/movie/" + tmdbId, b -> b
                .queryParam("append_to_response", "credits,videos,release_dates")
                .queryParam("include_video_language", "en,hi,te,ta,ml,kn,null"));

        Movie m = new Movie();
        m.setTmdbId(d.path("id").asLong());
        m.setTitle(d.path("title").asText(null));
        m.setDescription(truncate(d.path("overview").asText(""), 2000));
        m.setGenre(joinNames(d.path("genres"), 3));
        m.setDuration(formatRuntime(d.path("runtime").asInt(0)));
        m.setLanguage(languageName(d.path("original_language").asText("")));

        double vote = d.path("vote_average").asDouble(0);
        m.setRating(Math.round(vote * 10) / 10.0);

        LocalDate releaseDate = regionalReleaseDate(d);
        m.setReleaseDate(releaseDate);
        m.setStatus(releaseDate != null && releaseDate.isAfter(LocalDate.now()) ? "Coming Soon" : "Active");
        m.setCertificate(certificate(d));

        m.setDirector(director(d.path("credits").path("crew")));
        m.setCast(topCast(d.path("credits").path("cast"), 10));
        m.setTrailer(trailerUrl(d.path("videos").path("results")));

        String backdropPath = d.path("backdrop_path").asText(null);
        if (backdropPath != null) {
            m.setBackdropUrl(IMAGE_BASE + "w1280" + backdropPath);
        }
        String posterPath = d.path("poster_path").asText(null);
        if (posterPath != null) {
            m.setPosterUrl(downloadPoster(tmdbId, posterPath));
        }
        m.setFormat(new ArrayList<>(List.of("2D")));
        return m;
    }

    // ─── HTTP ──────────────────────────────────────────────────────────────────

    private JsonNode get(String path, Function<UriBuilder, UriBuilder> params) {
        if (!isConfigured()) {
            throw new TmdbException("TMDB API key is not configured. Set the TMDB_API_KEY environment variable.", 503);
        }
        // v4 "API Read Access Tokens" are JWTs; v3 keys are 32-char hex strings
        boolean bearer = apiKey.startsWith("eyJ");
        try {
            JsonNode body = webClient.get()
                    .uri(b -> {
                        UriBuilder ub = params.apply(b.path(path)).queryParam("language", language);
                        if (!bearer) ub.queryParam("api_key", apiKey);
                        return ub.build();
                    })
                    .headers(h -> { if (bearer) h.setBearerAuth(apiKey); })
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
            if (body == null) throw new TmdbException("Empty response from TMDB", 502);
            return body;
        } catch (WebClientResponseException e) {
            int status = e.getStatusCode().value();
            log.warn("TMDB {} failed: {} {}", path, status, e.getResponseBodyAsString());
            if (status == 401) throw new TmdbException("TMDB rejected the API key (401). Check TMDB_API_KEY.", 502);
            if (status == 404) throw new TmdbException("Movie not found on TMDB", 404);
            if (status == 429) throw new TmdbException("TMDB rate limit reached, try again shortly", 429);
            throw new TmdbException("TMDB request failed with status " + status, 502);
        } catch (TmdbException e) {
            throw e;
        } catch (Exception e) {
            log.warn("TMDB {} failed", path, e);
            throw new TmdbException("Could not reach TMDB: " + e.getMessage(), 502);
        }
    }

    private String downloadPoster(long tmdbId, String posterPath) {
        String filename = "tmdb-" + tmdbId + ".jpg";
        String publicUrl = "/uploads/movie-posters/" + filename;
        try {
            Path dir = Paths.get(POSTER_DIR);
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            if (Files.exists(target)) return publicUrl;

            byte[] bytes = imageClient.get()
                    .uri(URI.create(IMAGE_BASE + "w500" + posterPath))
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block();
            if (bytes == null || bytes.length == 0) return null;
            Files.write(target, bytes);
            return publicUrl;
        } catch (IOException | RuntimeException e) {
            log.warn("Failed to download poster for TMDB movie {}", tmdbId, e);
            return null;
        }
    }

    // ─── Mapping helpers ───────────────────────────────────────────────────────

    private Map<String, Object> toResultPage(JsonNode body) {
        List<Map<String, Object>> results = new ArrayList<>();
        for (JsonNode r : body.path("results")) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("tmdbId", r.path("id").asLong());
            item.put("title", r.path("title").asText(""));
            item.put("originalTitle", r.path("original_title").asText(""));
            item.put("overview", r.path("overview").asText(""));
            item.put("releaseDate", r.path("release_date").asText(""));
            item.put("rating", Math.round(r.path("vote_average").asDouble(0) * 10) / 10.0);
            item.put("language", languageName(r.path("original_language").asText("")));
            String poster = r.path("poster_path").asText(null);
            item.put("posterThumbUrl", poster == null ? null : IMAGE_BASE + "w185" + poster);
            results.add(item);
        }
        Map<String, Object> page = new LinkedHashMap<>();
        page.put("page", body.path("page").asInt(1));
        page.put("totalPages", body.path("total_pages").asInt(1));
        page.put("totalResults", body.path("total_results").asInt(results.size()));
        page.put("results", results);
        return page;
    }

    private LocalDate regionalReleaseDate(JsonNode d) {
        // Prefer the regional theatrical release (type 3), then any regional date, then the global date
        JsonNode regional = regionalReleases(d);
        String fallback = null;
        for (JsonNode rd : regional) {
            String date = rd.path("release_date").asText("");
            if (date.length() >= 10) {
                if (rd.path("type").asInt() == 3) return parseDate(date.substring(0, 10));
                if (fallback == null) fallback = date.substring(0, 10);
            }
        }
        return parseDate(fallback != null ? fallback : d.path("release_date").asText(""));
    }

    private String certificate(JsonNode d) {
        for (JsonNode rd : regionalReleases(d)) {
            String cert = rd.path("certification").asText("").trim().toUpperCase(Locale.ROOT);
            if (cert.isEmpty()) continue;
            if (cert.startsWith("U/A") || cert.startsWith("UA")) return "UA";
            if (cert.equals("U") || cert.equals("A") || cert.equals("S")) return cert;
        }
        return "UA";
    }

    private JsonNode regionalReleases(JsonNode d) {
        for (JsonNode r : d.path("release_dates").path("results")) {
            if (region.equalsIgnoreCase(r.path("iso_3166_1").asText())) {
                return r.path("release_dates");
            }
        }
        return com.fasterxml.jackson.databind.node.MissingNode.getInstance();
    }

    private static String director(JsonNode crew) {
        List<String> directors = new ArrayList<>();
        for (JsonNode c : crew) {
            if ("Director".equals(c.path("job").asText())) directors.add(c.path("name").asText());
        }
        return directors.isEmpty() ? null : String.join(", ", directors);
    }

    private static List<String> topCast(JsonNode cast, int limit) {
        List<String> names = new ArrayList<>();
        for (JsonNode c : cast) {
            if (names.size() >= limit) break;
            names.add(c.path("name").asText());
        }
        return names;
    }

    private static String trailerUrl(JsonNode videos) {
        String best = null;
        for (JsonNode v : videos) {
            if (!"YouTube".equals(v.path("site").asText())) continue;
            String type = v.path("type").asText();
            String url = "https://www.youtube.com/watch?v=" + v.path("key").asText();
            if ("Trailer".equals(type) && v.path("official").asBoolean(false)) return url;
            if (best == null && ("Trailer".equals(type) || "Teaser".equals(type))) best = url;
        }
        return best;
    }

    private static String joinNames(JsonNode arr, int limit) {
        List<String> names = new ArrayList<>();
        for (JsonNode n : arr) {
            if (names.size() >= limit) break;
            names.add(n.path("name").asText());
        }
        return names.isEmpty() ? null : String.join(", ", names);
    }

    private static String formatRuntime(int minutes) {
        if (minutes <= 0) return null;
        return (minutes / 60) + "h " + (minutes % 60) + "m";
    }

    private static String languageName(String isoCode) {
        if (isoCode == null || isoCode.isBlank()) return null;
        String name = Locale.forLanguageTag(isoCode).getDisplayLanguage(Locale.ENGLISH);
        return name.isBlank() ? isoCode : name;
    }

    private static LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDate.parse(s);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private static String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max - 1) + "…";
    }

    /** Error carrying the HTTP status the controller should return. */
    public static class TmdbException extends RuntimeException {
        private final int status;

        public TmdbException(String message, int status) {
            super(message);
            this.status = status;
        }

        public int getStatus() {
            return status;
        }
    }
}
