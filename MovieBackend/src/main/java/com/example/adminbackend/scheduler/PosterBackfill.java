package com.example.adminbackend.scheduler;

import com.example.adminbackend.config.PublicReadCache;
import com.example.adminbackend.entity.Movie;
import com.example.adminbackend.repository.MovieRepository;
import com.example.adminbackend.service.TmdbService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Films imported from TMDB used to have their posters downloaded into uploads/,
 * which hosting services wipe on every deploy. At startup, switch any such film
 * to TMDB's own poster URL. Films already switched are left alone, so this does
 * nothing after the first run.
 */
@Component
public class PosterBackfill {

    private static final Logger log = LoggerFactory.getLogger(PosterBackfill.class);
    private static final String OLD_PREFIX = "/uploads/movie-posters/tmdb-";

    private final MovieRepository movies;
    private final TmdbService tmdb;
    private final PublicReadCache cache;

    public PosterBackfill(MovieRepository movies, TmdbService tmdb, PublicReadCache cache) {
        this.movies = movies;
        this.tmdb = tmdb;
        this.cache = cache;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void run() {
        if (!tmdb.isConfigured()) return;
        int switched = 0;
        for (Movie m : movies.findAll()) {
            if (m.getTmdbId() == null || m.getPosterUrl() == null || !m.getPosterUrl().startsWith(OLD_PREFIX)) continue;
            try {
                String url = tmdb.posterUrlFor(m.getTmdbId());
                if (url == null) continue;
                m.setPosterUrl(url);
                movies.save(m);
                switched++;
            } catch (RuntimeException e) {
                log.warn("Couldn't switch the poster for {} to TMDB: {}", m.getTitle(), e.getMessage());
            }
        }
        if (switched > 0) {
            log.info("Switched {} film posters to TMDB image URLs", switched);
            cache.clear();
        }
    }
}
