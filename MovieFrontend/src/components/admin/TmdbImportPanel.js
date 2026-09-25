import React, { useState, useEffect, useCallback } from "react";
import { Search, Star, Film, AlertCircle, ChevronDown } from "lucide-react";
import {
  getTmdbStatus,
  searchTmdb,
  getTmdbNowPlaying,
  getTmdbUpcoming,
  getTmdbMovie,
} from "../../utils/tmdbAPI";

const TABS = [
  { id: "search", label: "Search" },
  { id: "now", label: "Now Playing (India)" },
  { id: "upcoming", label: "Upcoming" },
];

// Lets an admin find a movie on TMDB and pre-fill the movie form with its details.
const TmdbImportPanel = ({ onImport, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [configured, setConfigured] = useState(null);
  const [tab, setTab] = useState("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getTmdbStatus()
      .then((s) => setConfigured(!!s?.configured))
      .catch(() => setConfigured(false));
  }, []);

  const load = useCallback(async () => {
    setError("");
    if (tab === "search" && query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const page =
        tab === "search"
          ? await searchTmdb(query.trim())
          : tab === "now"
          ? await getTmdbNowPlaying()
          : await getTmdbUpcoming();
      setResults(page?.results || []);
    } catch (e) {
      setError(e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [tab, query]);

  // Debounce typing in the search box; load lists immediately
  useEffect(() => {
    if (!open || !configured) return;
    const t = setTimeout(load, tab === "search" ? 400 : 0);
    return () => clearTimeout(t);
  }, [load, open, configured, tab]);

  const handlePick = async (item) => {
    setImportingId(item.tmdbId);
    setError("");
    setNotice("");
    try {
      const { movie, existingMovieId } = await getTmdbMovie(item.tmdbId);
      onImport(movie);
      setNotice(
        existingMovieId
          ? `"${movie.title}" is already in your catalogue (movie #${existingMovieId}). Saving will create a duplicate — edit the existing movie instead.`
          : `Filled the form with "${movie.title}". Review the details, set the price and showtimes, then save.`
      );
      setOpen(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <section className="cb-tmdb">
      <button
        type="button"
        className="cb-tmdb__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <Film size={18} aria-hidden="true" />
        <span>
          <strong>Import from TMDB</strong>
          <span className="cb-muted cb-small">
            Fills in the title, cast, poster, trailer and more
          </span>
        </span>
        <ChevronDown size={18} aria-hidden="true" className="cb-tmdb__chev" data-open={open} />
      </button>

      {notice && (
        <div className="cb-alert cb-alert--ok cb-tmdb__notice" role="status">
          {notice}
        </div>
      )}

      {open && (
        <div className="cb-tmdb__body">
          {configured === false ? (
            <div className="cb-alert cb-alert--warn">
              <AlertCircle size={18} aria-hidden="true" />
              <span>
                TMDB isn't connected. Get a free API key at themoviedb.org
                (Settings, then API), add <code>TMDB_API_KEY</code> to the
                backend's .env file, and restart the backend.
              </span>
            </div>
          ) : (
            <>
              <div className="cb-chips" role="group" aria-label="TMDB lists" style={{ marginBottom: 14 }}>
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="cb-chip"
                    aria-pressed={tab === t.id}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "search" && (
                <label className="cb-desk__search cb-tmdb__search">
                  <Search size={16} aria-hidden="true" />
                  <span className="cb-sr">Search TMDB</span>
                  <input
                    type="search"
                    className="cb-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    placeholder="Search a title, e.g. Pushpa"
                  />
                </label>
              )}

              {error && (
                <div className="cb-alert cb-alert--error" style={{ marginBottom: 12 }}>
                  {error}
                </div>
              )}

              {loading || configured === null ? (
                <div className="cb-loading" style={{ minHeight: 160 }}>
                  <div className="cb-spinner" />
                </div>
              ) : results.length === 0 ? (
                <p className="cb-muted cb-small" style={{ padding: "18px 0" }}>
                  {tab === "search"
                    ? query.trim().length < 2
                      ? "Type at least 2 letters to search."
                      : "No films found. Try another spelling."
                    : "Nothing listed right now."}
                </p>
              ) : (
                <ul className="cb-tmdb__grid">
                  {results.map((m) => (
                    <li key={m.tmdbId}>
                      <button
                        type="button"
                        disabled={importingId !== null}
                        onClick={() => handlePick(m)}
                        title={m.overview}
                      >
                        <span className="cb-thumb">
                          {m.posterThumbUrl ? (
                            <img src={m.posterThumbUrl} alt="" loading="lazy" />
                          ) : null}
                          {importingId === m.tmdbId && (
                            <span className="cb-tmdb__busy">
                              <span className="cb-spinner" />
                            </span>
                          )}
                        </span>
                        <span className="cb-tmdb__title">{m.title}</span>
                        <span className="cb-muted cb-small">
                          {m.releaseDate?.slice(0, 4) || "Year unknown"}
                          {m.rating > 0 && (
                            <>
                              {", "}
                              <Star size={11} aria-hidden="true" className="cb-tmdb__star" /> {m.rating}
                            </>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <p className="cb-muted cb-small" style={{ marginTop: 14 }}>
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default TmdbImportPanel;
