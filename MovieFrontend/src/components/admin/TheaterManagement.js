import React, { useState, useEffect } from "react";
import {
  Building,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";

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
    if (window.confirm("Are you sure you want to delete this theater?")) {
      try {
        await deleteTheater(theaterId);
        setTheaters(theaters.filter((t) => t.id !== theaterId));
      } catch (error) {
        console.error("Error deleting theater:", error);
        alert("Failed to delete theater. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-300">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg">Loading theaters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Theater Management
            </h1>
            <p className="text-slate-400 mt-2">
              Manage your theaters and their schedules
            </p>
          </div>
          <button
            onClick={onNavigateToAddTheater}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Theater
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchTheaters}
            className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theaters.map((theater) => (
          <div
            key={theater.id}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Building className="w-6 h-6 text-purple-400 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">
                    {theater.name}
                  </h3>
                  <p className="text-sm text-slate-400 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {theater.location}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    onNavigateToEditTheater && onNavigateToEditTheater(theater)
                  }
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTheater(theater.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Location:</span>
                <span className="text-slate-300">
                  {theater.city}, {theater.state}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Screens:</span>
                <span className="text-slate-300">
                  {theater.numberOfScreens || theater.screens || 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total Seats:</span>
                <span className="text-slate-300">
                  {theater.totalSeats || 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    theater.status === "ACTIVE" || theater.status === "Active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {theater.status}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center text-sm text-slate-400 mb-2">
                <Settings className="w-4 h-4 mr-1" />
                Contact
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">{theater.email}</p>
                <p className="text-xs text-slate-500">
                  {theater.phoneNumber || theater.phone}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {theaters.length === 0 && !loading && !error && (
        <div className="text-center py-16">
          <Building className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            No Theaters Found
          </h3>
          <p className="text-slate-500 mb-6">
            Get started by adding your first theater
          </p>
          <button
            onClick={onNavigateToAddTheater}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Theater
          </button>
        </div>
      )}
    </div>
  );
};

export default TheaterManagement;
