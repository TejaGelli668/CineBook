import React, { useState, useEffect } from "react";
import { API_URL } from "../../config";

const apiCall = async (url, options = {}) => {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return await response.json();
};

const withAuth = () => {
  const token = localStorage.getItem("adminToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const AdminFixShows = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [statistics, setStatistics] = useState("");
  const [layoutPreview, setLayoutPreview] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [shows, setShows] = useState([]);
  const [theaters, setTheaters] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadStatistics(),
      loadLayoutPreview(),
      loadDuplicates(),
      loadShows(),
      loadTheaters(),
    ]);
  };

  const loadStatistics = async () => {
    try {
      const response = await apiCall("/api/shows/seats-statistics", {
        method: "GET",
        headers: withAuth(),
      });
      setStatistics(response.data);
    } catch (err) {
      console.error("Error loading statistics:", err);
    }
  };

  const loadLayoutPreview = async () => {
    try {
      const response = await apiCall("/api/shows/layout-preview", {
        method: "GET",
        headers: withAuth(),
      });
      setLayoutPreview(response);
    } catch (err) {
      console.error("Error loading layout preview:", err);
    }
  };

  const loadDuplicates = async () => {
    try {
      const response = await apiCall("/api/seats/debug/find-duplicates", {
        method: "GET",
        headers: withAuth(),
      });
      setDuplicates(response.duplicates || []);
    } catch (err) {
      console.error("Error loading duplicates:", err);
    }
  };

  const loadShows = async () => {
    try {
      const response = await apiCall("/api/shows", {
        method: "GET",
        headers: withAuth(),
      });
      setShows(response.data || []);
    } catch (err) {
      console.error("Error loading shows:", err);
    }
  };

  const loadTheaters = async () => {
    try {
      const response = await apiCall("/api/theaters", {
        method: "GET",
        headers: withAuth(),
      });
      setTheaters(response.data || []);
    } catch (err) {
      console.error("Error loading theaters:", err);
    }
  };

  const executeAction = async (actionName, apiCallFunction) => {
    try {
      setLoading(true);
      setError("");
      setResult("");

      const response = await apiCallFunction();
      setResult(`${actionName}: ${response.message || "done"}`);

      // Refresh data after successful action
      await loadInitialData();
    } catch (err) {
      setError(`${actionName} failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 NUCLEAR OPTION: Complete Reset
  const completeReset = () =>
    window.confirm(
      "Delete every seat map and rebuild them? Held seats are released. Use only if seat maps are badly broken."
    ) &&
    executeAction("Complete Reset", async () => {
      // Delete all seats
      const deleteResponse = await apiCall(
        "/api/seats/debug/delete-all-base-seats",
        {
          method: "DELETE",
          headers: withAuth(),
        }
      );

      // Fix all shows
      const fixResponse = await apiCall("/api/shows/fix-all-shows", {
        method: "POST",
        headers: withAuth(),
      });

      return {
        message: `Reset complete: ${deleteResponse.message} + ${fixResponse.message}`,
      };
    });

  // 🏢 Fix All Theaters
  const fixAllTheaters = () =>
    executeAction("Fix All Theaters", async () => {
      return await apiCall("/api/shows/fix-all-shows", {
        method: "POST",
        headers: withAuth(),
      });
    });

  // 🎭 Fix All Shows
  const fixAllShows = () =>
    executeAction("Fix All Shows", async () => {
      return await apiCall("/api/shows/fix-seats", {
        method: "POST",
        headers: withAuth(),
      });
    });

  // ✅ Make All Seats Available
  const makeAllSeatsAvailable = () =>
    window.confirm(
      "Release every held seat across all shows? Customers mid-checkout lose their hold. Sold seats stay sold."
    ) &&
    executeAction("Make All Seats Available", async () => {
      return await apiCall("/api/shows/make-all-seats-available", {
        method: "POST",
        headers: withAuth(),
      });
    });

  // 🧹 Clean Up Duplicates
  const cleanupDuplicates = () =>
    window.confirm("Rebuild seat maps to remove the duplicates?") &&
    executeAction("Cleanup Duplicates", async () => {
      if (duplicates.length === 0) {
        return { message: "No duplicates found to clean up" };
      }

      // Delete all seats and regenerate clean
      const deleteResponse = await apiCall(
        "/api/seats/debug/delete-all-base-seats",
        {
          method: "DELETE",
          headers: withAuth(),
        }
      );

      const fixResponse = await apiCall("/api/shows/fix-seats", {
        method: "POST",
        headers: withAuth(),
      });

      return {
        message: `Cleaned ${duplicates.length} duplicates and regenerated seats`,
      };
    });

  // 🎯 Fix Specific Show
  const fixSpecificShow = async (showId) => {
    executeAction(`Fix Show ${showId}`, async () => {
      return await apiCall(`/api/shows/fix-show/${showId}`, {
        method: "POST",
        headers: withAuth(),
      });
    });
  };

  // 🏛️ Setup Specific Theater
  const setupTheater = async (theaterId) => {
    executeAction(`Setup Theater ${theaterId}`, async () => {
      return await apiCall(`/api/shows/setup-theater/${theaterId}`, {
        method: "POST",
        headers: withAuth(),
      });
    });
  };

  const Tool = ({ title, body, action, label, tone = "ghost" }) => (
    <li className="cb-tool">
      <div>
        <p className="cb-tool__title">{title}</p>
        <p className="cb-muted cb-small">{body}</p>
      </div>
      <button type="button" className={`cb-btn cb-btn--${tone} cb-btn--sm`} onClick={action} disabled={loading}>
        {label}
      </button>
    </li>
  );

  return (
    <div className="cb-stack cb-repair">
      {(result || error) && (
        <div className={`cb-alert cb-alert--${error ? "error" : "ok"}`} role="status">
          {error || result}
        </div>
      )}
      {loading && (
        <div className="cb-alert cb-alert--info" role="status">
          <span className="cb-spinner cb-spinner--sm" /> Working on it…
        </div>
      )}

      {layoutPreview && (
        <dl className="cb-ledger">
          <div>
            <dt>Seats per show</dt>
            <dd>{layoutPreview.totalSeats}</dd>
          </div>
          <div>
            <dt>Wheelchair spaces</dt>
            <dd>{layoutPreview.wheelchairSeats}</dd>
          </div>
          <div>
            <dt>Price tiers</dt>
            <dd>{Object.keys(layoutPreview.categories || {}).length}</dd>
          </div>
          <div>
            <dt>Duplicate seats</dt>
            <dd style={duplicates.length ? { color: "#ff8a93" } : undefined}>{duplicates.length}</dd>
          </div>
        </dl>
      )}

      {duplicates.length > 0 && (
        <div className="cb-alert cb-alert--warn">
          <span style={{ flex: 1 }}>
            {duplicates.length} duplicate seats found. Customers may see the same seat twice.
          </span>
          <button type="button" className="cb-btn cb-btn--pink cb-btn--sm" onClick={cleanupDuplicates} disabled={loading}>
            Remove duplicates
          </button>
        </div>
      )}

      <section className="cb-panel">
        <h2 className="cb-h3" style={{ marginBottom: 6 }}>Everyday fixes</h2>
        <p className="cb-muted cb-small" style={{ marginBottom: 8 }}>Safe to run any time. Sold seats are never touched.</p>
        <ul className="cb-tools">
          <Tool
            title="Add missing seat maps"
            body="For shows created before their theater had seats."
            action={fixAllShows}
            label="Fix shows"
            tone="pink"
          />
          <Tool
            title="Rebuild every theater's layout"
            body="Regenerates each theater's seats and every show's seat map."
            action={fixAllTheaters}
            label="Rebuild layouts"
          />
          <Tool
            title="Release stuck seat holds"
            body="Frees seats held by customers who left mid-checkout."
            action={makeAllSeatsAvailable}
            label="Release holds"
          />
        </ul>
      </section>

      <div className="cb-overview__two" style={{ marginTop: 0 }}>
        <section className="cb-panel">
          <h2 className="cb-h3" style={{ marginBottom: 12 }}>One theater</h2>
          {theaters.length === 0 ? (
            <p className="cb-muted cb-small">No theaters found.</p>
          ) : (
            <ul className="cb-tools">
              {theaters.slice(0, 6).map((theater) => (
                <li key={theater.id} className="cb-tool">
                  <p className="cb-tool__title">{theater.name}</p>
                  <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm" onClick={() => setupTheater(theater.id)} disabled={loading}>
                    Set up seats
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="cb-panel">
          <h2 className="cb-h3" style={{ marginBottom: 12 }}>One show</h2>
          {shows.length === 0 ? (
            <p className="cb-muted cb-small">No shows found.</p>
          ) : (
            <ul className="cb-tools">
              {shows.slice(0, 6).map((show) => (
                <li key={show.id} className="cb-tool">
                  <p className="cb-tool__title">
                    {show.movie?.title || "Show"} <span className="cb-muted cb-small">#{show.id}</span>
                  </p>
                  <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm" onClick={() => fixSpecificShow(show.id)} disabled={loading}>
                    Repair
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="cb-panel">
        <div className="cb-panel__head">
          <h2 className="cb-h3">Seat report</h2>
          <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm" onClick={loadInitialData} disabled={loading}>
            Refresh
          </button>
        </div>
        <pre className="cb-repair__stats">{statistics || "Loading…"}</pre>
      </section>

      <section className="cb-panel cb-repair__danger">
        <h2 className="cb-h3" style={{ marginBottom: 6 }}>Last resort</h2>
        <p className="cb-muted cb-small" style={{ marginBottom: 14 }}>
          Deletes every seat map and rebuilds them from scratch. Held seats are
          released. Only use this if the fixes above don't help.
        </p>
        <button type="button" className="cb-btn cb-btn--danger" onClick={completeReset} disabled={loading}>
          Reset all seat maps
        </button>
      </section>
    </div>
  );
};

export default AdminFixShows;
