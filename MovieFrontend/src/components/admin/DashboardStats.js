import React, { useState, useEffect } from "react";
import { Film, Building2, Wrench, MapPin } from "lucide-react";
import { Loading } from "../ui/Chrome";
import { API_URL } from "../../config";

// Admin overview: real numbers only, written like a box-office ledger
const DashboardStats = ({
  movies = [],
  foodItems = [],
  onNavigateToMovies,
  onNavigateToTheaters,
  onNavigateToFoodItems,
  onNavigateToFixShows,
}) => {
  const [theaterData, setTheaterData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/theaters`, {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("adminToken") ||
              localStorage.getItem("userToken")
            }`,
          },
        });
        const data = await response.json();
        setTheaterData(data.data || data || []);
      } catch (error) {
        console.error("Failed to fetch theaters:", error);
        setTheaterData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTheaters();
  }, []);

  const showing = movies.filter(
    (m) => !["inactive", "coming soon"].includes((m.status || "").toLowerCase())
  );
  const comingSoon = movies.filter(
    (m) => (m.status || "").toLowerCase() === "coming soon"
  );
  const activeTheaters = theaterData.filter((t) => t.status === "ACTIVE");
  const screens = theaterData.reduce((n, t) => n + (t.numberOfScreens || 0), 0);
  const seats = theaterData.reduce((n, t) => n + (t.totalSeats || 0), 0);
  const languages = new Set(movies.map((m) => m.language).filter(Boolean));
  const hasPoster = (m) => m.posterUrl && !String(m.poster).includes("placeholder");

  return (
    <div className="cb-stack cb-overview">
      <dl className="cb-ledger">
        <div>
          <dt>Films showing</dt>
          <dd>{showing.length}</dd>
          <small>
            {comingSoon.length} coming soon, {languages.size}{" "}
            {languages.size === 1 ? "language" : "languages"}
          </small>
        </div>
        <div>
          <dt>Theaters open</dt>
          <dd>{loading ? "…" : activeTheaters.length}</dd>
          <small>{theaterData.length} in total</small>
        </div>
        <div>
          <dt>Screens</dt>
          <dd>{loading ? "…" : screens}</dd>
          <small>{seats.toLocaleString("en-IN")} seats</small>
        </div>
        <div>
          <dt>Canteen items</dt>
          <dd>{foodItems.length}</dd>
          <small>
            {foodItems.filter((f) => f.isAvailable !== false).length} on sale
          </small>
        </div>
      </dl>

      <section className="cb-overview__block">
        <div className="cb-panel__head">
          <h2 className="cb-h2">On screen now</h2>
          <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm" onClick={onNavigateToMovies}>
            Manage films
          </button>
        </div>
        {showing.length === 0 ? (
          <div className="cb-empty">
            <p>No films are showing. Add one from TMDB in a few clicks.</p>
            <button type="button" className="cb-btn cb-btn--stamp" onClick={onNavigateToMovies}>
              <Film size={16} aria-hidden="true" /> Add a film
            </button>
          </div>
        ) : (
          <ul className="cb-overview__posters">
            {showing.slice(0, 8).map((m) => (
              <li key={m.id}>
                <button type="button" onClick={onNavigateToMovies} title={m.title}>
                  <span className="cb-thumb">
                    {hasPoster(m) ? <img src={m.poster} alt="" /> : null}
                  </span>
                  <span className="cb-overview__ptitle">{m.title}</span>
                  <span className="cb-muted cb-small">
                    {[m.language, m.certificate].filter(Boolean).join(", ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="cb-overview__two">
        <section className="cb-panel">
          <div className="cb-panel__head">
            <h2 className="cb-h3">Theaters</h2>
            <button type="button" className="cb-link" onClick={onNavigateToTheaters}>
              Manage
            </button>
          </div>
          {loading ? (
            <Loading label="Loading theaters" />
          ) : theaterData.length === 0 ? (
            <p className="cb-muted">
              No theaters yet.{" "}
              <button type="button" className="cb-link" onClick={onNavigateToTheaters}>
                Add your first theater
              </button>
            </p>
          ) : (
            <ul className="cb-overview__list">
              {theaterData.slice(0, 5).map((t) => (
                <li key={t.id}>
                  <div>
                    <p className="cb-overview__ptitle">{t.name}</p>
                    <p className="cb-muted cb-small">
                      <MapPin size={12} aria-hidden="true" /> {t.location || t.city},{" "}
                      {t.numberOfScreens || 0} screens, {t.totalSeats || 0} seats
                    </p>
                  </div>
                  <span className={`cb-badge ${t.status === "ACTIVE" ? "cb-badge--ok" : "cb-badge--quiet"}`}>
                    {(t.status || "").toLowerCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="cb-panel">
          <h2 className="cb-h3" style={{ marginBottom: 14 }}>
            Jobs
          </h2>
          <ul className="cb-overview__jobs">
            <li>
              <button type="button" onClick={onNavigateToMovies}>
                <Film size={18} aria-hidden="true" />
                <span>
                  <strong>Add a film</strong>
                  <span className="cb-muted cb-small">Import it from TMDB, then schedule shows.</span>
                </span>
              </button>
            </li>
            <li>
              <button type="button" onClick={onNavigateToTheaters}>
                <Building2 size={18} aria-hidden="true" />
                <span>
                  <strong>Add a theater</strong>
                  <span className="cb-muted cb-small">Screens, seats and ticket prices.</span>
                </span>
              </button>
            </li>
            {onNavigateToFoodItems && (
              <li>
                <button type="button" onClick={onNavigateToFoodItems}>
                  <span aria-hidden="true" className="cb-overview__glyph">₹</span>
                  <span>
                    <strong>Update the canteen menu</strong>
                    <span className="cb-muted cb-small">Prices and what's on sale.</span>
                  </span>
                </button>
              </li>
            )}
            <li>
              <button type="button" onClick={onNavigateToFixShows}>
                <Wrench size={18} aria-hidden="true" />
                <span>
                  <strong>Repair seat maps</strong>
                  <span className="cb-muted cb-small">When a show has no seats or duplicates.</span>
                </span>
              </button>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DashboardStats;
