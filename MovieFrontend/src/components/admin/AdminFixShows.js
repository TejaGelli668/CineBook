// // src/components/admin/AdminFixShows.js
// import React, { useState, useEffect } from "react";
// import { apiCall, withAuth } from "../../utils/movieAPI";

// const AdminFixShows = () => {
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState("");
//   const [error, setError] = useState("");
//   const [statistics, setStatistics] = useState("");

//   // Load statistics on component mount
//   useEffect(() => {
//     loadStatistics();
//   }, []);

//   const loadStatistics = async () => {
//     try {
//       const response = await apiCall("/api/shows/seats-statistics", {
//         method: "GET",
//         headers: withAuth(),
//       });
//       setStatistics(response.data);
//     } catch (err) {
//       console.error("Error loading statistics:", err);
//     }
//   };

//   const makeAllSeatsAvailable = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       setResult("");

//       const response = await apiCall("/api/shows/make-all-seats-available", {
//         method: "POST",
//         headers: withAuth(),
//       });

//       setResult(`✅ Success: ${response.message}. ${response.data}`);
//       await loadStatistics(); // Refresh statistics
//     } catch (err) {
//       setError(`❌ Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fixShows = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       setResult("");

//       const response = await apiCall("/api/shows/fix-seats", {
//         method: "POST",
//         headers: withAuth(),
//       });

//       setResult(`✅ Success: ${response.message}. ${response.data}`);
//       await loadStatistics(); // Refresh statistics
//     } catch (err) {
//       setError(`❌ Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkShowSeats = async (showId) => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await apiCall(`/api/shows/${showId}/seats-count`, {
//         method: "GET",
//         headers: withAuth(),
//       });

//       setResult(`Show ${showId} has ${response.data} available seats`);
//     } catch (err) {
//       setError(`Error checking show ${showId}: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 bg-slate-900 text-white min-h-screen">
//       <h1 className="text-2xl font-bold mb-6">Admin: Fix Shows & Seats</h1>

//       {/* Statistics */}
//       <div className="bg-blue-800 p-4 rounded-lg mb-6">
//         <h2 className="text-lg font-semibold mb-2">📊 Current Statistics</h2>
//         <p className="text-blue-100 font-mono text-sm">
//           {statistics || "Loading statistics..."}
//         </p>
//         <button
//           onClick={loadStatistics}
//           disabled={loading}
//           className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
//         >
//           🔄 Refresh
//         </button>
//       </div>

//       <div className="space-y-6">
//         {/* Make All Seats Available - Primary Action */}
//         <div className="bg-green-800 p-6 rounded-lg border-2 border-green-600">
//           <h2 className="text-xl font-semibold mb-3 text-green-100">
//             ✅ Make All Seats Available (RECOMMENDED)
//           </h2>
//           <p className="text-green-200 mb-4">
//             <strong>This will fix your seat selection issue!</strong>
//             <br />
//             • Makes all seats AVAILABLE for booking
//             <br />
//             • Keeps BOOKED seats as BOOKED
//             <br />
//             • Releases any LOCKED seats
//             <br />• Works for all existing and future shows
//           </p>
//           <button
//             onClick={makeAllSeatsAvailable}
//             disabled={loading}
//             className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors font-semibold text-lg"
//           >
//             {loading
//               ? "⏳ Processing All Shows..."
//               : "✅ Make All Seats Available"}
//           </button>
//         </div>

//         {/* Fix Shows - Alternative */}
//         <div className="bg-slate-800 p-4 rounded-lg">
//           <h2 className="text-lg font-semibold mb-3">
//             🔧 Fix Shows (Alternative)
//           </h2>
//           <p className="text-slate-300 mb-3">
//             This will generate seat records for shows that don't have them.
//           </p>
//           <button
//             onClick={fixShows}
//             disabled={loading}
//             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
//           >
//             {loading ? "Fixing..." : "Fix Shows"}
//           </button>
//         </div>

//         {/* Test Specific Shows */}
//         <div className="bg-slate-800 p-4 rounded-lg">
//           <h2 className="text-lg font-semibold mb-3">🧪 Test Specific Shows</h2>
//           <p className="text-slate-300 mb-3">
//             Check how many seats specific shows have.
//           </p>
//           <div className="space-x-2">
//             <button
//               onClick={() => checkShowSeats(50)}
//               disabled={loading}
//               className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg transition-colors"
//             >
//               Check Show 50
//             </button>
//             <button
//               onClick={() => checkShowSeats(51)}
//               disabled={loading}
//               className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg transition-colors"
//             >
//               Check Show 51
//             </button>
//           </div>
//         </div>

//         {/* Results */}
//         {result && (
//           <div className="bg-green-900/50 border border-green-500 p-4 rounded-lg">
//             <h3 className="text-green-400 font-semibold">Success:</h3>
//             <p className="text-green-200">{result}</p>
//           </div>
//         )}

//         {error && (
//           <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg">
//             <h3 className="text-red-400 font-semibold">Error:</h3>
//             <p className="text-red-200">{error}</p>
//           </div>
//         )}

//         {/* Instructions */}
//         <div className="bg-slate-700 p-4 rounded-lg">
//           <h3 className="text-slate-200 font-semibold mb-2">
//             📋 Quick Instructions
//           </h3>
//           <ol className="text-slate-300 text-sm space-y-1">
//             <li>1. Click the green "Make All Seats Available" button above</li>
//             <li>2. Wait for it to process all shows</li>
//             <li>3. Check the updated statistics</li>
//             <li>4. Test seat selection - it should work now!</li>
//           </ol>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminFixShows;
import React, { useState, useEffect } from "react";

// Mock API functions - replace with your actual API calls
const apiCall = async (url, options = {}) => {
  const response = await fetch(`http://localhost:8080${url}`, {
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
  const token = localStorage.getItem("token"); // or however you store it
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
      setResult(
        `✅ ${actionName} Success: ${
          response.message || "Completed successfully"
        }`
      );

      // Refresh data after successful action
      await loadInitialData();
    } catch (err) {
      setError(`❌ ${actionName} Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 NUCLEAR OPTION: Complete Reset
  const completeReset = () =>
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
    executeAction("Make All Seats Available", async () => {
      return await apiCall("/api/shows/make-all-seats-available", {
        method: "POST",
        headers: withAuth(),
      });
    });

  // 🧹 Clean Up Duplicates
  const cleanupDuplicates = () =>
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

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        🎭 Theater Management Dashboard
      </h1>

      {/* Layout Preview */}
      {layoutPreview && (
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-xl mb-6 border border-blue-500">
          <h2 className="text-xl font-semibold mb-4 text-blue-100">
            📊 Current Layout Configuration
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-800/50 p-3 rounded text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {layoutPreview.totalSeats}
              </div>
              <div className="text-blue-200">Total Seats</div>
            </div>
            <div className="bg-green-800/50 p-3 rounded text-center">
              <div className="text-2xl font-bold text-green-400">
                {layoutPreview.wheelchairSeats}
              </div>
              <div className="text-green-200">Wheelchair</div>
            </div>
            <div className="bg-purple-800/50 p-3 rounded text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Object.keys(layoutPreview.categories || {}).length}
              </div>
              <div className="text-purple-200">Categories</div>
            </div>
            <div className="bg-red-800/50 p-3 rounded text-center">
              <div className="text-2xl font-bold text-red-400">
                {duplicates.length}
              </div>
              <div className="text-red-200">Duplicates</div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Nuclear Option */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 p-6 rounded-xl border-2 border-red-500">
          <h2 className="text-xl font-semibold mb-3 text-red-100">
            🚀 Complete System Reset (NUCLEAR)
          </h2>
          <p className="text-red-200 mb-4 text-sm">
            ⚠️ <strong>Use when everything is broken:</strong>
            <br />
            • Deletes ALL existing seats
            <br />
            • Regenerates clean 161-seat layout
            <br />
            • Fixes ALL theaters and shows
            <br />• <strong>This will reset everything!</strong>
          </p>
          <button
            onClick={completeReset}
            disabled={loading}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg transition-colors font-semibold"
          >
            {loading ? "⏳ Resetting Everything..." : "🚀 Complete Reset"}
          </button>
        </div>

        {/* Quick Fix */}
        <div className="bg-gradient-to-r from-green-900 to-green-800 p-6 rounded-xl border-2 border-green-500">
          <h2 className="text-xl font-semibold mb-3 text-green-100">
            ✅ Quick Fix (RECOMMENDED)
          </h2>
          <p className="text-green-200 mb-4 text-sm">
            🎯 <strong>For most issues:</strong>
            <br />
            • Makes all seats AVAILABLE
            <br />
            • Keeps BOOKED seats intact
            <br />
            • Releases LOCKED seats
            <br />• Works across all shows
          </p>
          <button
            onClick={makeAllSeatsAvailable}
            disabled={loading}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors font-semibold"
          >
            {loading ? "⏳ Processing..." : "✅ Make All Seats Available"}
          </button>
        </div>
      </div>

      {/* Duplicate Cleanup */}
      {duplicates.length > 0 && (
        <div className="bg-yellow-900/50 border-2 border-yellow-500 p-4 rounded-xl mb-6">
          <h3 className="text-yellow-400 font-semibold mb-2">
            ⚠️ Duplicates Detected!
          </h3>
          <p className="text-yellow-200 mb-3">
            Found {duplicates.length} duplicate seats that need cleanup.
          </p>
          <button
            onClick={cleanupDuplicates}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            {loading ? "Cleaning..." : "🧹 Clean Up Duplicates"}
          </button>
        </div>
      )}

      {/* Management Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">🏢 Theater Management</h3>
          <button
            onClick={fixAllTheaters}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors mb-2"
          >
            Fix All Theaters
          </button>
          <div className="max-h-32 overflow-y-auto">
            {theaters.slice(0, 5).map((theater) => (
              <button
                key={theater.id}
                onClick={() => setupTheater(theater.id)}
                disabled={loading}
                className="w-full px-2 py-1 bg-slate-600 hover:bg-slate-700 disabled:bg-gray-600 rounded text-xs mb-1 transition-colors"
              >
                Setup Theater {theater.id}: {theater.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">🎭 Show Management</h3>
          <button
            onClick={fixAllShows}
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors mb-2"
          >
            Fix All Shows
          </button>
          <div className="max-h-32 overflow-y-auto">
            {shows.slice(0, 5).map((show) => (
              <button
                key={show.id}
                onClick={() => fixSpecificShow(show.id)}
                disabled={loading}
                className="w-full px-2 py-1 bg-slate-600 hover:bg-slate-700 disabled:bg-gray-600 rounded text-xs mb-1 transition-colors truncate"
              >
                Fix Show {show.id}: {show.movie?.title || "Unknown"}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">🔄 Refresh Data</h3>
          <div className="space-y-2">
            <button
              onClick={loadStatistics}
              disabled={loading}
              className="w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded text-sm transition-colors"
            >
              📊 Refresh Statistics
            </button>
            <button
              onClick={loadDuplicates}
              disabled={loading}
              className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded text-sm transition-colors"
            >
              🔍 Check Duplicates
            </button>
            <button
              onClick={loadInitialData}
              disabled={loading}
              className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded text-sm transition-colors"
            >
              🔄 Refresh All
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-slate-800 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">📈 System Statistics</h2>
        <div className="bg-slate-900 p-3 rounded font-mono text-sm text-slate-300 whitespace-pre-wrap">
          {statistics || "Loading statistics..."}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-green-900/30 border border-green-500 p-4 rounded-lg mb-4">
          <h3 className="text-green-400 font-semibold">✅ Success:</h3>
          <p className="text-green-200">{result}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg mb-4">
          <h3 className="text-red-400 font-semibold">❌ Error:</h3>
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-slate-700 p-4 rounded-lg">
        <h3 className="text-slate-200 font-semibold mb-2">
          📋 Quick Action Guide
        </h3>
        <div className="text-slate-300 text-sm space-y-1">
          <p>
            <strong>🎯 Most Common Issues:</strong> Use "Make All Seats
            Available" (green button)
          </p>
          <p>
            <strong>🚨 Broken System:</strong> Use "Complete Reset" (red button)
            - this will fix everything
          </p>
          <p>
            <strong>⚠️ Duplicates Found:</strong> Use "Clean Up Duplicates"
            (yellow button)
          </p>
          <p>
            <strong>🔧 Specific Issues:</strong> Use individual theater/show
            buttons
          </p>
          <p>
            <strong>📊 Check Progress:</strong> Monitor statistics after each
            action
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminFixShows;
