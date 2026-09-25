import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, MapPin, AlertCircle } from "lucide-react";
import { Loading } from "../ui/Chrome";

const TheaterManagement = ({
  onNavigateToAddTheater,
  onNavigateToEditTheater,
}) => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // API functions
  const API_BASE_URL = "http://localhost:8080";

  const apiCall = async (endpoint, options = {}) => {
    const { headers: customHeaders = {}, ...rest } = options;
    const config = {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
      },
    };
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API request failed");
    return data;
  };

  const withAuth = () => {
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("userToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getTheaters = async () => {
    try {
      const resp = await apiCall("/api/theaters", {
        method: "GET",
        headers: withAuth(),
      });
      return resp.data || [];
    } catch (error) {
      console.error("Failed to fetch theaters:", error);
      return [];
    }
  };

  const deleteTheater = async (id) => {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Admin authentication required");

    await apiCall(`/api/theaters/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  };

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTheaters();
      setTheaters(data);
    } catch (err) {
      setError("Failed to load theaters. Please try again.");
      console.error("Error fetching theaters:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTheater = async (theaterId) => {
    if (window.confirm("Delete this theater? Its shows and seat maps are removed too.")) {
      try {
        await deleteTheater(theaterId);
        setTheaters(theaters.filter((t) => t.id !== theaterId));
      } catch (error) {
        console.error("Error deleting theater:", error);
        setError("The theater couldn't be deleted. It may still have bookings.");
      }
    }
  };

  if (loading) {
    return <Loading label="Loading theaters" />;
  }

  const isActive = (t) => (t.status || "").toUpperCase() === "ACTIVE";

  return (
    <section aria-label="Theaters">
      <div className="cb-desk-bar">
        <p className="cb-muted">
          {theaters.length} {theaters.length === 1 ? "theater" : "theaters"},{" "}
          {theaters.filter(isActive).length} open
        </p>
        <button type="button" className="cb-btn cb-btn--stamp" onClick={onNavigateToAddTheater}>
          <Plus size={16} aria-hidden="true" /> Add a theater
        </button>
      </div>

      {error && (
        <div className="cb-alert cb-alert--error" style={{ marginBottom: 20 }}>
          <AlertCircle size={18} aria-hidden="true" />
          <span style={{ flex: 1 }}>{error}</span>
          <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm" onClick={fetchTheaters}>
            Try again
          </button>
        </div>
      )}

      {theaters.length === 0 && !error ? (
        <div className="cb-empty">
          <h2 className="cb-h2">No theaters yet</h2>
          <p>Add a theater to start scheduling shows. Its seat map is generated for you.</p>
          <button type="button" className="cb-btn cb-btn--stamp" onClick={onNavigateToAddTheater}>
            <Plus size={16} aria-hidden="true" /> Add a theater
          </button>
        </div>
      ) : (
        <ul className="cb-deck">
          {theaters.map((theater) => (
            <li key={theater.id} className="cb-panel">
              <div className="cb-panel__head" style={{ marginBottom: 0 }}>
                <div>
                  <h3 className="cb-h3">{theater.name}</h3>
                  <p className="cb-muted cb-small cb-theater__where">
                    <MapPin size={13} aria-hidden="true" />
                    {theater.location}, {theater.city}
                  </p>
                </div>
                <span className={`cb-badge ${isActive(theater) ? "cb-badge--ok" : "cb-badge--quiet"}`}>
                  {(theater.status || "").toLowerCase()}
                </span>
              </div>
              <dl className="cb-fields cb-theater__nums">
                <div>
                  <dt>Screens</dt>
                  <dd>{theater.numberOfScreens || theater.screens || 0}</dd>
                </div>
                <div>
                  <dt>Seats</dt>
                  <dd>{theater.totalSeats || 0}</dd>
                </div>
              </dl>
              <p className="cb-muted cb-small">
                {[theater.phoneNumber || theater.phone, theater.email].filter(Boolean).join(", ")}
              </p>
              <div className="cb-deck__foot">
                <button
                  type="button"
                  className="cb-btn cb-btn--ghost cb-btn--sm"
                  onClick={() => onNavigateToEditTheater && onNavigateToEditTheater(theater)}
                >
                  <Edit size={14} aria-hidden="true" /> Edit
                </button>
                <button
                  type="button"
                  className="cb-iconbtn cb-iconbtn--danger"
                  onClick={() => handleDeleteTheater(theater.id)}
                  aria-label={`Delete ${theater.name}`}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default TheaterManagement;
