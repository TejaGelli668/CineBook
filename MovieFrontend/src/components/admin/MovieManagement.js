import React, { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Showing" },
  { id: "coming soon", label: "Coming soon" },
  { id: "inactive", label: "Inactive" },
];

const statusTone = (status = "") => {
  const s = status.toLowerCase();
  if (s === "active") return "ok";
  if (s === "coming soon") return "warn";
  return "quiet";
};

const MovieManagement = ({
  movies,
  searchTerm = "",
  onAddMovie,
  onEditMovie,
  onDeleteMovie,
}) => {
  const [filter, setFilter] = useState("all");
  const q = searchTerm.toLowerCase();

  const filteredMovies = movies.filter(
    (movie) =>
      (filter === "all" || (movie.status || "").toLowerCase() === filter) &&
      (movie.title.toLowerCase().includes(q) ||
        (movie.genre || "").toLowerCase().includes(q))
  );

  const count = (id) =>
    id === "all"
      ? movies.length
      : movies.filter((m) => (m.status || "").toLowerCase() === id).length;

  const handleDeleteClick = (movie) => {
    if (
      window.confirm(
        `Delete "${movie.title}"? Its shows will be removed and it disappears from the site.`
      )
    ) {
      onDeleteMovie && onDeleteMovie(movie.id);
    }
  };

  const hasPoster = (m) => m.posterUrl && !String(m.poster).includes("placeholder");

  return (
    <section aria-label="Film catalogue">
      <div className="cb-desk-bar">
        <div className="cb-chips" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="cb-chip"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label} <span className="cb-muted">{count(f.id)}</span>
            </button>
          ))}
        </div>
        <button type="button" className="cb-btn cb-btn--stamp" onClick={onAddMovie}>
          <Plus size={16} aria-hidden="true" /> Add a film
        </button>
      </div>

      {filteredMovies.length === 0 ? (
        <div className="cb-empty">
          <h2 className="cb-h2">
            {movies.length === 0 ? "No films yet" : "Nothing matches"}
          </h2>
          <p>
            {movies.length === 0
              ? "Add your first film. Importing it from TMDB fills in the poster, cast and trailer for you."
              : searchTerm
              ? `No films match "${searchTerm}"${filter !== "all" ? " with this status" : ""}.`
              : "No films have this status."}
          </p>
          {movies.length === 0 ? (
            <button type="button" className="cb-btn cb-btn--stamp" onClick={onAddMovie}>
              <Plus size={16} aria-hidden="true" /> Add a film
            </button>
          ) : (
            <button type="button" className="cb-btn cb-btn--ghost" onClick={() => setFilter("all")}>
              Show all films
            </button>
          )}
        </div>
      ) : (
        <div className="cb-table-wrap">
          <table className="cb-table">
            <thead>
              <tr>
                <th scope="col">Film</th>
                <th scope="col" className="cb-hide-sm">Details</th>
                <th scope="col" className="cb-hide-sm">Release</th>
                <th scope="col">Status</th>
                <th scope="col" className="cb-hide-sm">From</th>
                <th scope="col">
                  <span className="cb-sr">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map((movie) => (
                <tr key={movie.id}>
                  <td>
                    <div className="cb-filmcell">
                      <span className="cb-thumb">
                        {hasPoster(movie) && <img src={movie.poster} alt="" />}
                      </span>
                      <div>
                        <p className="cb-filmrow__title">{movie.title}</p>
                        <p className="cb-muted cb-small">{movie.genre !== "N/A" ? movie.genre : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="cb-hide-sm">
                    <div className="cb-filmcell__meta">
                      {movie.certificate && <span className="cb-cert">{movie.certificate}</span>}
                      <span>{movie.language}</span>
                      {movie.duration !== "N/A" && <span className="cb-muted">{movie.duration}</span>}
                    </div>
                  </td>
                  <td className="cb-hide-sm cb-num">{movie.releaseDate || "—"}</td>
                  <td>
                    <span className={`cb-badge cb-badge--${statusTone(movie.status)}`}>
                      {movie.status}
                    </span>
                  </td>
                  <td className="cb-hide-sm cb-num">₹{movie.price}</td>
                  <td>
                    <div className="cb-row-actions">
                      <button
                        type="button"
                        className="cb-iconbtn"
                        onClick={() => onEditMovie && onEditMovie(movie)}
                        aria-label={`Edit ${movie.title}`}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        className="cb-iconbtn cb-iconbtn--danger"
                        onClick={() => handleDeleteClick(movie)}
                        aria-label={`Delete ${movie.title}`}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default MovieManagement;
