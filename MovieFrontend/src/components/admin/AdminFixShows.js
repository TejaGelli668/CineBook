// src/components/admin/AdminFixShows.js
import React, { useState, useEffect } from "react";
import { apiCall, withAuth } from "../../utils/movieAPI";

const AdminFixShows = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [statistics, setStatistics] = useState("");

  // Load statistics on component mount
  useEffect(() => {
    loadStatistics();
  }, []);

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

  const makeAllSeatsAvailable = async () => {
    try {
      setLoading(true);
      setError("");
      setResult("");

      const response = await apiCall("/api/shows/make-all-seats-available", {
        method: "POST",
        headers: withAuth(),
      });

      setResult(`✅ Success: ${response.message}. ${response.data}`);
      await loadStatistics(); // Refresh statistics
    } catch (err) {
      setError(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fixShows = async () => {
    try {
      setLoading(true);
      setError("");
      setResult("");

      const response = await apiCall("/api/shows/fix-seats", {
        method: "POST",
        headers: withAuth(),
      });

      setResult(`✅ Success: ${response.message}. ${response.data}`);
      await loadStatistics(); // Refresh statistics
    } catch (err) {
      setError(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkShowSeats = async (showId) => {
    try {
      setLoading(true);
      setError("");

      const response = await apiCall(`/api/shows/${showId}/seats-count`, {
        method: "GET",
        headers: withAuth(),
      });

      setResult(`Show ${showId} has ${response.data} available seats`);
    } catch (err) {
      setError(`Error checking show ${showId}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin: Fix Shows & Seats</h1>

      {/* Statistics */}
      <div className="bg-blue-800 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">📊 Current Statistics</h2>
        <p className="text-blue-100 font-mono text-sm">
          {statistics || "Loading statistics..."}
        </p>
        <button
          onClick={loadStatistics}
          disabled={loading}
          className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-6">
        {/* Make All Seats Available - Primary Action */}
        <div className="bg-green-800 p-6 rounded-lg border-2 border-green-600">
          <h2 className="text-xl font-semibold mb-3 text-green-100">
            ✅ Make All Seats Available (RECOMMENDED)
          </h2>
          <p className="text-green-200 mb-4">
            <strong>This will fix your seat selection issue!</strong>
            <br />
            • Makes all seats AVAILABLE for booking
            <br />
            • Keeps BOOKED seats as BOOKED
            <br />
            • Releases any LOCKED seats
            <br />• Works for all existing and future shows
          </p>
          <button
            onClick={makeAllSeatsAvailable}
            disabled={loading}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors font-semibold text-lg"
          >
            {loading
              ? "⏳ Processing All Shows..."
              : "✅ Make All Seats Available"}
          </button>
        </div>

        {/* Fix Shows - Alternative */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">
            🔧 Fix Shows (Alternative)
          </h2>
          <p className="text-slate-300 mb-3">
            This will generate seat records for shows that don't have them.
          </p>
          <button
            onClick={fixShows}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            {loading ? "Fixing..." : "Fix Shows"}
          </button>
        </div>

        {/* Test Specific Shows */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">🧪 Test Specific Shows</h2>
          <p className="text-slate-300 mb-3">
            Check how many seats specific shows have.
          </p>
          <div className="space-x-2">
            <button
              onClick={() => checkShowSeats(50)}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              Check Show 50
            </button>
            <button
              onClick={() => checkShowSeats(51)}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              Check Show 51
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-green-900/50 border border-green-500 p-4 rounded-lg">
            <h3 className="text-green-400 font-semibold">Success:</h3>
            <p className="text-green-200">{result}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg">
            <h3 className="text-red-400 font-semibold">Error:</h3>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-slate-200 font-semibold mb-2">
            📋 Quick Instructions
          </h3>
          <ol className="text-slate-300 text-sm space-y-1">
            <li>1. Click the green "Make All Seats Available" button above</li>
            <li>2. Wait for it to process all shows</li>
            <li>3. Check the updated statistics</li>
            <li>4. Test seat selection - it should work now!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminFixShows;
