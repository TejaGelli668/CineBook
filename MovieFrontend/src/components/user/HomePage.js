import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, MapPin, Play } from "lucide-react";
import {
  getMovies,
  formatMovieData,
  getComingSoon,
  getShowsByMovie,
} from "../../utils/movieAPI";
import "./HomePage.css";
import { tmdbSize, tmdbSrcSet } from "../../utils/tmdbImage";
import { getSeatPrices, fromPrice } from "../../utils/seatPrices";

// "Pushpa 2 - The Rule" → ["Pushpa 2", "The Rule"]
const splitTitle = (title = "") => {
  const m = title.match(/^(.+?)\s*(?:\s-\s|:\s)\s*(.+)$/);
  return m ? [m[1], m[2]] : [title, null];
};

// "2026-09-24T18:45:00.000Z" is stored as the cinema's local time, not UTC
const localStart = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso || "");
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : null;
};

const dayLabel = (d) => {
  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

const isNowShowing = (m) =>
  !["inactive", "coming soon"].includes((m.status || "").toLowerCase());

const hasPoster = (m) => m.posterUrl && !m.poster.includes("placeholder");

const formatDay = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return {
    day: d.getDate(),
    month: d.toLocaleString("en-IN", { month: "short" }),
    weekday: d.toLocaleString("en-IN", { weekday: "long" }),
  };
};

const CertBadge = ({ cert }) =>
  cert ? (
    <span className="cb-cert" title={`Certified ${cert} by CBFC`}>
      {cert}
    </span>
  ) : null;

// The signature element: a Hyderabad cinema ticket that prints out of the slot
const Ticket = ({ movie, onBook, priceFrom }) => {
  const [main, sub] = splitTitle(movie.title);
  const serial = String(movie.tmdbId || movie.id).padStart(10, "0");
  return (
    <div className="cb-slot">
      <article className="cb-ticket" aria-label={`Ticket for ${movie.title}`}>
        <div className="cb-ticket__main">
          <div className="cb-ticket__head">
            <span className="cb-ticket__brand">CineBook</span>
            <span className="cb-ticket__te" lang="te">
              సినిమా టికెట్
            </span>
          </div>
          <p className="cb-ticket__admit">Admit one</p>
          <h2 className="cb-ticket__film">
            {main}
            {sub && <span>{sub}</span>}
          </h2>
          <dl className="cb-ticket__fields">
            <div>
              <dt>Language</dt>
              <dd>{movie.language || "—"}</dd>
            </div>
            <div>
              <dt>Rated</dt>
              <dd>{movie.certificate || "—"}</dd>
            </div>
            <div>
              <dt>Runtime</dt>
              <dd>{movie.duration !== "N/A" ? movie.duration : "—"}</dd>
            </div>
            <div>
              <dt>Seats from</dt>
              <dd>{priceFrom ? `₹${priceFrom}` : "—"}</dd>
            </div>
            <span className="cb-stamp" aria-hidden="true">
              Now showing
            </span>
          </dl>
          <div className="cb-ticket__actions">
            <button
              type="button"
              className="cb-btn cb-btn--stamp"
              onClick={() => onBook(movie)}
            >
              Book tickets
            </button>
            {movie.trailer && (
              <a
                className="cb-btn cb-btn--ink"
                href={movie.trailer}
                target="_blank"
                rel="noreferrer"
              >
                <Play size={15} aria-hidden="true" />
                Watch trailer
              </a>
            )}
          </div>
        </div>
        <div className="cb-ticket__stub" aria-hidden="true">
          <span className="cb-ticket__serial">No. {serial}</span>
          <span className="cb-ticket__city">Hyderabad</span>
        </div>
      </article>
    </div>
  );
};

const readSaved = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the page still works, just without the head start */
  }
};

const HomePage = ({
  onMovieSelect,
  onLoginClick,
  isUserLoggedIn,
  currentUser,
  onUserLogout,
  onDashboardClick,
}) => {
  // Last list seen, so the hero paints instantly on return visits
  const [movies, setMovies] = useState(() => readSaved("cb:movies") || []);
  const [loaded, setLoaded] = useState(() => !!readSaved("cb:movies"));
  const [comingSoon, setComingSoon] = useState([]);
  const [featuredId, setFeaturedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("All");
  const wallRef = useRef(null);
  const [theaters, setTheaters] = useState(() => readSaved("cb:theaters") || []);
  const [seatPrices, setSeatPrices] = useState({});

  useEffect(() => {
    getSeatPrices().then(setSeatPrices);
  }, []);
  const [shows, setShows] = useState([]); // [{ show, movie, start }]
  const [boardDay, setBoardDay] = useState(null);

  useEffect(() => {
    getMovies()
      .then((raw) => {
        const list = raw.map(formatMovieData);
        setMovies(list);
        save("cb:movies", list);
      })
      .catch((err) => console.error("Failed to load movies:", err))
      .finally(() => setLoaded(true));
    getComingSoon(16).then(setComingSoon);
    fetch("http://localhost:8080/api/theaters")
      .then((r) => r.json())
      .then((d) => {
        setTheaters(d.data || []);
        save("cb:theaters", d.data || []);
      })
      .catch(() => {});
  }, []);

  // Warm the browser cache with every banner, so switching films (and the
  // booking page backdrop) shows the image straight away
  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    const handle = idle(() =>
      movies.forEach((m) => {
        if (!m.backdropUrl) return;
        new Image().src = tmdbSize(m.backdropUrl, "w300"); // booking-page backdrop
        new Image().src = m.backdropUrl;
      })
    );
    return () => (window.cancelIdleCallback || clearTimeout)(handle);
  }, [movies]);

  // Every show for the films on screen, with a local start time
  useEffect(() => {
    const onScreen = movies.filter(isNowShowing);
    if (!onScreen.length) return;
    Promise.all(
      onScreen.map((m) =>
        getShowsByMovie(m.id).then((list) =>
          (Array.isArray(list) ? list : []).map((show) => ({ show, movie: m, start: localStart(show.showTime) }))
        )
      )
    ).then((all) => setShows(all.flat().filter((x) => x.start)));
  }, [movies]);

  const nowShowing = useMemo(() => movies.filter(isNowShowing), [movies]);

  const featured = useMemo(() => {
    if (!nowShowing.length) return null;
    return (
      nowShowing.find((m) => m.id === featuredId) ||
      nowShowing.find((m) => m.backdropUrl) ||
      nowShowing[0]
    );
  }, [nowShowing, featuredId]);

  const languages = useMemo(() => {
    const counts = {};
    nowShowing.forEach((m) => {
      if (m.language) counts[m.language] = (counts[m.language] || 0) + 1;
    });
    // Local-language films first for a Hyderabad audience, then by count
    const order = ["Telugu", "Hindi", "Tamil", "English"];
    return Object.keys(counts).sort((a, b) => {
      const ia = order.indexOf(a) === -1 ? 99 : order.indexOf(a);
      const ib = order.indexOf(b) === -1 ? 99 : order.indexOf(b);
      return ia - ib || counts[b] - counts[a];
    });
  }, [nowShowing]);

  const wall = nowShowing.filter(
    (m) =>
      (language === "All" || m.language === language) &&
      m.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const soonByDate = useMemo(() => {
    const groups = [];
    comingSoon.forEach((m) => {
      const last = groups[groups.length - 1];
      if (last && last.date === m.releaseDate) last.movies.push(m);
      else groups.push({ date: m.releaseDate, movies: [m] });
    });
    return groups;
  }, [comingSoon]);

  const now = new Date();
  const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Days on the board: today and the next days that have shows
  const boardDays = [...new Set(shows.filter((x) => x.start > now || dayKey(x.start) === dayKey(now)).map((x) => dayKey(x.start)))]
    .sort()
    .slice(0, 4)
    .map((key) => {
      const d = new Date(`${key}T00:00:00`);
      return { key, top: dayLabel(d).split(",")[0], day: d.getDate() };
    });
  const boardDayKey = boardDays.some((d) => d.key === boardDay) ? boardDay : boardDays[0]?.key;
  const boardDayLabel = (() => {
    const d = boardDays.find((x) => x.key === boardDayKey);
    return !d ? "today" : d.top === "Today" ? "today" : d.top === "Tomorrow" ? "tomorrow" : `on ${d.top} ${d.day}`;
  })();

  // A film's shows for the chosen day, grouped by cinema
  const boardShowsFor = (movieId) => {
    const map = new Map();
    shows
      .filter((x) => x.movie.id === movieId && dayKey(x.start) === boardDayKey)
      .sort((a, b) => a.start - b.start)
      .forEach((x) => {
        const t = x.show.theater || { id: 0, name: "Cinema" };
        if (!map.has(t.id)) map.set(t.id, { theater: t, list: [] });
        map.get(t.id).list.push(x);
      });
    return [...map.values()];
  };

  const bookShow = (x) =>
    onMovieSelect({ ...x.movie, preselect: { showId: x.show.id, date: dayKey(x.start) } });
  const todayAt = (theaterId) =>
    shows
      .filter(
        (x) =>
          x.show.theater?.id === theaterId &&
          x.start.toDateString() === now.toDateString() &&
          x.start > now
      )
      .sort((a, b) => a.start - b.start);

  const handleSearch = (e) => {
    const value = e.target.value;
    // Bring the results into view as soon as someone starts typing
    if (!searchQuery && value && wallRef.current) {
      const top = wallRef.current.getBoundingClientRect().top;
      if (top > window.innerHeight * 0.6) {
        wallRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setSearchQuery(value);
  };

  const userName = currentUser?.email ? currentUser.email.split("@")[0] : null;
  const [featMain, featSub] = featured ? splitTitle(featured.title) : [];
  const heroImage = featured && (featured.backdropUrl || featured.poster);

  return (
    <div className="cb cb-app">
      <header className="cb-nav">
        <a className="cb-logo" href="/" aria-label="CineBook home">
          Cine<span>Book</span>
        </a>

        <form
          className="cb-search"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search films playing in Hyderabad"
            aria-label="Search films"
          />
        </form>

        <label className="cb-city">
          <MapPin size={16} aria-hidden="true" />
          <span className="cb-sr">City</span>
          <select defaultValue="Hyderabad">
            <option value="Hyderabad">Hyderabad</option>
            <option disabled>More cities soon</option>
          </select>
        </label>

        <div className="cb-auth">
          {isUserLoggedIn && currentUser ? (
            <>
              <button
                type="button"
                className="cb-btn cb-btn--pink"
                onClick={() => onDashboardClick && onDashboardClick()}
              >
                My bookings
              </button>
              <button
                type="button"
                className="cb-link"
                onClick={onUserLogout}
                title={userName ? `Signed in as ${userName}` : undefined}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              className="cb-btn cb-btn--pink"
              onClick={onLoginClick}
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      <section className="cb-hero" aria-labelledby="cb-hero-title">
        {heroImage && (
          <img
            key={heroImage}
            className="cb-hero__backdrop"
            src={heroImage}
            srcSet={tmdbSrcSet(heroImage)}
            sizes="100vw"
            fetchpriority="high"
            decoding="async"
            alt=""
          />
        )}

        <div className="cb-hero__inner">
          {featured ? (
            <>
              <div className="cb-hero__copy">
                <p className="cb-hero__where">
                  {userName
                    ? `Welcome back, ${userName}. Playing in Hyderabad this week`
                    : "Playing in Hyderabad this week"}
                </p>
                <h1
                  id="cb-hero-title"
                  className={`cb-hero__title ${
                    featMain.length > 12 ? "cb-hero__title--long" : ""
                  }`}
                >
                  {featMain}
                  {featSub && <span>{featSub}</span>}
                </h1>
                {featured.description && (
                  <p className="cb-hero__story">{featured.description}</p>
                )}

                {nowShowing.length > 1 && (
                  <div className="cb-reel" aria-label="Choose a film">
                    {nowShowing.slice(0, 8).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="cb-reel__item"
                        aria-pressed={m.id === featured.id}
                        aria-label={m.title}
                        title={m.title}
                        onClick={() => setFeaturedId(m.id)}
                      >
                        {hasPoster(m) ? (
                          <img src={m.poster} alt="" />
                        ) : (
                          <span>{m.title.slice(0, 1)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Ticket
                key={featured.id}
                movie={featured}
                onBook={onMovieSelect}
                priceFrom={fromPrice(seatPrices)}
              />
            </>
          ) : (
            <div className="cb-hero__copy cb-hero__copy--empty">
              <h1 id="cb-hero-title" className="cb-hero__title">
                {loaded ? "The screens are dark tonight" : "Loading shows"}
              </h1>
              {loaded && (
                <p className="cb-hero__story">
                  No films are listed in Hyderabad right now. New shows are
                  added every week, so see what's releasing soon below.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="cb-below">
        {nowShowing.length > 0 && (
          <section className="cb-boardwrap" id="now-showing" ref={wallRef} aria-labelledby="cb-board-title">
            <div className="cb-board">
              <span className="cb-board__bulbs" aria-hidden="true" />
              <header className="cb-board__head">
                <div>
                  <p className="cb-board__te" lang="te">
                    ఈరోజు ప్రదర్శనలు
                  </p>
                  <h2 id="cb-board-title" className="cb-board__title">
                    Now showing
                  </h2>
                </div>
                {boardDays.length > 0 && (
                  <div className="cb-board__days" role="group" aria-label="Choose a day">
                    {boardDays.map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        aria-pressed={boardDayKey === d.key}
                        onClick={() => setBoardDay(d.key)}
                      >
                        <span>{d.top}</span>
                        <strong>{d.day}</strong>
                      </button>
                    ))}
                  </div>
                )}
              </header>

              {languages.length > 1 && (
                <div className="cb-board__langs" role="group" aria-label="Filter by language">
                  {["All", ...languages].map((l) => (
                    <button
                      key={l}
                      type="button"
                      aria-pressed={language === l}
                      onClick={() => setLanguage(l)}
                    >
                      {l === "All" ? "Every language" : l}
                    </button>
                  ))}
                </div>
              )}

              {wall.length > 0 ? (
                <ol className="cb-board__rows">
                  {wall.map((m) => {
                    const byCinema = boardShowsFor(m.id);
                    return (
                      <li key={m.id} className="cb-brow">
                        <button
                          type="button"
                          className="cb-brow__poster"
                          onClick={() => onMovieSelect(m)}
                          aria-label={`All showtimes for ${m.title}`}
                        >
                          {hasPoster(m) ? <img src={m.poster} alt="" loading="lazy" /> : <span>{m.title[0]}</span>}
                        </button>
                        <div className="cb-brow__film">
                          <h3>{m.title}</h3>
                          <p>
                            <CertBadge cert={m.certificate} />
                            <span>{m.language}</span>
                            {m.duration !== "N/A" && <span>{m.duration}</span>}
                          </p>
                          {m.genre && m.genre !== "N/A" && <p className="cb-brow__genre">{m.genre}</p>}
                        </div>
                        <div className="cb-brow__times">
                          {byCinema.length === 0 ? (
                            <p className="cb-brow__none">
                              No shows {boardDayLabel}.{" "}
                              <button type="button" onClick={() => onMovieSelect(m)}>
                                See other days
                              </button>
                            </p>
                          ) : (
                            byCinema.map(({ theater, list }) => (
                              <div key={theater.id} className="cb-brow__cinema">
                                <span className="cb-brow__cname">{theater.name}</span>
                                <div className="cb-brow__tiles">
                                  {list.map((x) => (
                                    <button
                                      key={x.show.id}
                                      type="button"
                                      className="cb-tile"
                                      disabled={x.start < now}
                                      onClick={() => bookShow(x)}
                                      title={
                                        x.start < now
                                          ? "Already started"
                                          : `${fromPrice(seatPrices, theater.id) ? `Seats from ₹${fromPrice(seatPrices, theater.id)}` : "Book"} at ${theater.name}`
                                      }
                                    >
                                      {x.start
                                        .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
                                        .toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="cb-board__empty">
                  <p>
                    No films match “{searchQuery}”
                    {language !== "All" ? ` in ${language}` : ""}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setLanguage("All");
                    }}
                  >
                    Show every film
                  </button>
                </div>
              )}
              <p className="cb-board__foot">
                Press a time to book that show. Greyed-out times have already started.
              </p>
            </div>
          </section>
        )}

        {soonByDate.length > 0 && (
          <section className="cb-notice" id="coming-soon" aria-labelledby="cb-soon-title">
            <h2 id="cb-soon-title" className="cb-notice__banner">
              Coming soon
              <span>release dates in India</span>
            </h2>
            <ol className="cb-notice__board">
              {soonByDate.map((g, gi) => {
                const d = formatDay(g.date);
                return (
                  <li key={g.date} className="cb-notice__day">
                    <p className="cb-notice__leaf" aria-label={`${d.weekday} ${d.day} ${d.month}`}>
                      <span>{d.weekday}</span>
                      <strong>{d.day}</strong>
                      <span>{d.month}</span>
                    </p>
                    <ul className="cb-notice__posters">
                      {g.movies.map((m, i) => (
                        <li key={m.tmdbId} style={{ "--tilt": `${(((gi + i) % 3) - 1) * 1.6}deg` }}>
                          <span className="cb-notice__tape" aria-hidden="true" />
                          <img src={m.posterUrl} alt="" loading="lazy" />
                          <p className="cb-notice__title">{m.title}</p>
                          <p className="cb-notice__lang">{m.language}</p>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {theaters.length > 0 && (
          <section className="cb-halls" id="cinemas" aria-labelledby="cb-halls-title">
            <h2 id="cb-halls-title" className="cb-halls__title">
              Where to watch
              <span>
                {theaters.length} {theaters.length === 1 ? "cinema" : "cinemas"} in Hyderabad
              </span>
            </h2>
            <ul className="cb-halls__list">
              {theaters.map((t) => {
                const today = todayAt(t.id);
                const films = [...new Map(today.map((x) => [x.movie.id, x.movie])).values()];
                const next = today[0];
                return (
                  <li key={t.id} className="cb-hall">
                    <div className="cb-hall__sign">
                      <span className="cb-hall__bulbs" aria-hidden="true" />
                      <h3>{t.name}</h3>
                    </div>
                    <div className="cb-hall__body">
                      <p className="cb-hall__where">
                        <MapPin size={14} aria-hidden="true" /> {t.location}, {t.city}
                      </p>
                      {t.facilities?.length > 0 && (
                        <p className="cb-hall__facilities">{t.facilities.slice(0, 5).join(", ")}</p>
                      )}
                      <div className="cb-hall__today">
                        {next ? (
                          <p>
                            Next show
                            <strong>
                              {next.start
                                .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
                                .toUpperCase()}
                            </strong>
                            <span>{next.movie.title}</span>
                          </p>
                        ) : (
                          <p className="cb-hall__closed">No more shows today</p>
                        )}
                        {films.length > 0 && (
                          <ul className="cb-hall__films" aria-label="Playing here today">
                            {films.slice(0, 5).map((m) => (
                              <li key={m.id}>
                                <button type="button" onClick={() => onMovieSelect(m)} title={`Book ${m.title}`}>
                                  <img src={m.poster} alt={m.title} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <footer className="cb-footer">
        <div className="cb-footer__marquee" aria-hidden="true">
          <span>CineBook</span>
          <span lang="te">సినిమా</span>
        </div>

        <div className="cb-footer__cols">
          <div className="cb-footer__about">
            <p className="cb-logo">
              Cine<span>Book</span>
            </p>
            <p>
              Tickets for Hyderabad's cinemas, from first-day-first-show to the
              late show. Pick your seats, pre-order chai and popcorn, and walk
              in with your ticket on your phone.
            </p>
          </div>

          <nav aria-label="Films">
            <h3>Films</h3>
            <ul>
              <li>
                <a href="#now-showing">Now showing</a>
              </li>
              <li>
                <a href="#coming-soon">Coming soon</a>
              </li>
              {languages.slice(0, 4).map((l) => (
                <li key={l}>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage(l);
                      wallRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {l} films
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Cinemas">
            <h3>Cinemas</h3>
            <ul>
              {theaters.slice(0, 5).map((t) => (
                <li key={t.id}>
                  <a href="#cinemas">
                    {t.name}
                    <span>{t.location}</span>
                  </a>
                </li>
              ))}
              {theaters.length === 0 && <li className="cb-muted">Listing soon</li>}
            </ul>
          </nav>

          <nav aria-label="Your account">
            <h3>Your account</h3>
            <ul>
              {isUserLoggedIn ? (
                <>
                  <li>
                    <button type="button" onClick={() => onDashboardClick && onDashboardClick()}>
                      My tickets
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={onUserLogout}>
                      Sign out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button type="button" onClick={onLoginClick}>
                      Sign in
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={onLoginClick}>
                      Create an account
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div className="cb-footer__help">
            <h3>Good to know</h3>
            <dl>
              <div>
                <dt>Cancelling</dt>
                <dd>Full refund until 2 hours before the show, half after that.</dd>
              </div>
              <div>
                <dt>Seat holds</dt>
                <dd>Seats you pick are held for 10 minutes while you pay.</dd>
              </div>
              <div>
                <dt>Snacks</dt>
                <dd>Pre-order while booking and collect at the canteen counter.</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="cb-footer__base">
          <p>© {new Date().getFullYear()} CineBook, Hyderabad</p>
          <p>Card payments are processed securely by Stripe.</p>
          <p>
            Film details and images from{" "}
            <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
              TMDB
            </a>
            . This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
