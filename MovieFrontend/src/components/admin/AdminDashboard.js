// import React, { useState, useEffect } from "react";
// import AdminSidebar from "./AdminSidebar";
// import AdminHeader from "./AdminHeader";
// import DashboardStats from "./DashboardStats";
// import MovieManagement from "./MovieManagement";
// import TheaterManagement from "./TheaterManagement"; // This should be your API-connected version
// import AddTheaterPage from "./AddTheaterPage";
// import MovieForm from "./MovieForm";
// import AdminFixShows from "./AdminFixShows";

// import {
//   getMovies,
//   addMovie,
//   updateMovie,
//   deleteMovie,
//   formatMovieData,
// } from "../../utils/movieAPI";

// // NEW: Import theater API functions
// import { createTheater, updateTheater } from "../../utils/theaterAPI";

// const AdminDashboard = ({
//   onLogout,
//   currentUser,
//   onNavigateToTheaterManagement,
//   onNavigateToFixShows, // Add this prop from App.js
// }) => {
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [editingItem, setEditingItem] = useState(null);
//   const [showMovieForm, setShowMovieForm] = useState(false);
//   const [editingMovie, setEditingMovie] = useState(null);

//   const [movies, setMovies] = useState([]);

//   // ─── Load real movies on mount ────────────────────────────────────────────────
//   useEffect(() => {
//     loadMovies();
//   }, []);

//   const loadMovies = async () => {
//     try {
//       const raw = await getMovies();
//       setMovies(raw.map(formatMovieData));
//     } catch (err) {
//       console.error("Could not load movies", err);
//       alert("Failed to load movies");
//     }
//   };

//   // ─── Navigation & form toggles ────────────────────────────────────────────────
//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setEditingItem(null);
//     setSearchTerm("");
//   };

//   const handleAddMovie = () => {
//     setEditingMovie(null);
//     setShowMovieForm(true);
//   };

//   const handleEditMovie = (movie) => {
//     setEditingMovie(movie);
//     setShowMovieForm(true);
//   };

//   // ─── Delete movie ────────────────────────────────────────────────────────────
//   const handleDeleteMovie = async (movieId) => {
//     if (!window.confirm("Are you sure you want to delete this movie?")) return;
//     try {
//       await deleteMovie(movieId);
//       alert("Movie deleted successfully!");
//       loadMovies();
//     } catch (err) {
//       console.error("Delete failed", err);
//       alert("Failed to delete movie");
//     }
//   };

//   // ─── Save (add or update) movie ──────────────────────────────────────────────
//   const handleSaveMovie = async (movieData) => {
//     try {
//       if (editingMovie) {
//         await updateMovie(editingMovie.id, movieData);
//       } else {
//         await addMovie(movieData);
//       }
//       setShowMovieForm(false);
//       setEditingMovie(null);
//       loadMovies();
//     } catch (err) {
//       console.error("Save failed", err);
//       alert("Failed to save movie");
//     }
//   };

//   const handleCloseMovieForm = () => {
//     setShowMovieForm(false);
//     setEditingMovie(null);
//   };

//   // ─── NEW: Real Theater handlers with API integration ────────────────────────────────────────
//   const handleNavigateToAddTheater = () => {
//     console.log("Navigating to Add Theater");
//     setActiveTab("addTheater");
//     setEditingItem(null);
//   };

//   const handleNavigateToEditTheater = (theater) => {
//     console.log("Navigating to Edit Theater:", theater);
//     setEditingItem(theater);
//     setActiveTab("editTheater");
//   };

//   const handleBackToTheaters = () => {
//     console.log("Going back to theaters");
//     setActiveTab("theaters");
//     setEditingItem(null);
//   };

//   // ─── NEW: Fix Shows navigation ──────────────────────────────────────────────
//   const handleNavigateToFixShows = () => {
//     console.log("Navigating to Fix Shows");
//     setActiveTab("fixShows");
//   };

//   const handleBackToDashboard = () => {
//     setActiveTab("dashboard");
//   };

//   // Update your handleSaveTheater function with correct field mapping:
//   const handleSaveTheater = async (theaterData) => {
//     try {
//       console.log("🎬 Raw theater data from form:", theaterData);

//       // FIXED: Correct field mapping to match your database fields
//       const backendData = {
//         name: theaterData.name?.trim(),
//         location: theaterData.location?.trim(),
//         address: theaterData.address?.trim(),
//         city: theaterData.city?.trim(),
//         state: theaterData.state?.trim(),
//         pincode: theaterData.pincode?.trim(),
//         phoneNumber: theaterData.phoneNumber?.trim(), // FIXED: was theaterData.phone
//         email: theaterData.email?.trim(),
//         numberOfScreens: parseInt(theaterData.numberOfScreens) || 0, // FIXED: was theaterData.screens
//         totalSeats: parseInt(theaterData.totalSeats) || 0,
//         status: theaterData.status, // Already correct format from form
//         facilities: theaterData.facilities || [],
//         shows: theaterData.shows || [],
//         pricing: theaterData.pricing || {},
//       };

//       console.log("🚀 Sending to backend:", backendData);

//       // Validate required fields before sending
//       const requiredFields = [
//         "name",
//         "location",
//         "address",
//         "city",
//         "state",
//         "pincode",
//         "phoneNumber",
//         "email",
//       ];
//       const missingFields = requiredFields.filter(
//         (field) => !backendData[field]
//       );

//       if (missingFields.length > 0) {
//         throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
//       }

//       if (editingItem) {
//         await updateTheater(editingItem.id, backendData);
//         alert("Theater updated successfully!");
//       } else {
//         await createTheater(backendData);
//         alert("Theater created successfully!");
//       }

//       handleBackToTheaters();
//     } catch (error) {
//       console.error("❌ Error saving theater:", error);
//       alert("Failed to save theater: " + error.message);
//     }
//   };

//   const handleBack = () => {
//     if (activeTab.includes("Movie")) {
//       setActiveTab("movies");
//     } else if (activeTab.includes("Theater")) {
//       setActiveTab("theaters");
//     } else if (activeTab === "fixShows") {
//       setActiveTab("dashboard");
//     }
//     setEditingItem(null);
//   };

//   // ─── Main content switch ─────────────────────────────────────────────────────
//   const renderContent = () => {
//     switch (activeTab) {
//       case "addTheater":
//         return (
//           <AddTheaterPage
//             onBack={handleBackToTheaters}
//             onSave={handleSaveTheater}
//           />
//         );
//       case "editTheater":
//         return (
//           <AddTheaterPage
//             theater={editingItem}
//             onBack={handleBackToTheaters}
//             onSave={handleSaveTheater}
//           />
//         );
//       case "fixShows":
//         return (
//           <div className="space-y-6">
//             <div className="bg-white p-6 rounded-lg shadow">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-gray-800">
//                   Fix Shows & Seats
//                 </h2>
//                 <button
//                   onClick={handleBackToDashboard}
//                   className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
//                 >
//                   ← Back to Dashboard
//                 </button>
//               </div>
//               <AdminFixShows />
//             </div>
//           </div>
//         );
//       case "movies":
//         return (
//           <div className="space-y-6">
//             <MovieManagement
//               movies={movies}
//               searchTerm={searchTerm}
//               onAddMovie={handleAddMovie}
//               onEditMovie={handleEditMovie}
//               onDeleteMovie={handleDeleteMovie}
//             />
//             {showMovieForm && (
//               <MovieForm
//                 movie={editingMovie}
//                 onClose={handleCloseMovieForm}
//                 onSave={handleSaveMovie}
//               />
//             )}
//           </div>
//         );
//       case "theaters":
//         return (
//           <div className="space-y-6">
//             {/* UPDATED: Use the real API-connected TheaterManagement */}
//             <TheaterManagement
//               onNavigateToAddTheater={handleNavigateToAddTheater}
//               onNavigateToEditTheater={handleNavigateToEditTheater}
//             />
//           </div>
//         );
//       case "showtimes":
//         return (
//           <div className="bg-white p-8 rounded-lg shadow">
//             <h2 className="text-2xl font-bold mb-4">Showtimes Management</h2>
//             <p className="text-gray-600">
//               Showtimes management content coming soon...
//             </p>
//           </div>
//         );
//       case "bookings":
//         return (
//           <div className="bg-white p-8 rounded-lg shadow">
//             <h2 className="text-2xl font-bold mb-4">Bookings Management</h2>
//             <p className="text-gray-600">
//               Bookings management content coming soon...
//             </p>
//           </div>
//         );
//       default:
//         return (
//           <div className="space-y-6">
//             <DashboardStats
//               movies={movies}
//               theaters={[]} // Remove mock theaters from stats
//               onNavigateToMovies={() => handleTabChange("movies")}
//               onNavigateToTheaters={() => handleTabChange("theaters")}
//             />

//             {/* Add Fix Shows Quick Access Button */}
//             <div className="bg-white p-6 rounded-lg shadow">
//               <h3 className="text-lg font-semibold mb-4 text-gray-800">
//                 Quick Actions
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <button
//                   onClick={handleNavigateToFixShows}
//                   className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
//                 >
//                   <span className="text-2xl mr-3">🔧</span>
//                   <div className="text-left">
//                     <div className="font-semibold">Fix Shows</div>
//                     <div className="text-sm opacity-90">
//                       Generate missing seats
//                     </div>
//                   </div>
//                 </button>

//                 <button
//                   onClick={() => handleTabChange("movies")}
//                   className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
//                 >
//                   <span className="text-2xl mr-3">🎬</span>
//                   <div className="text-left">
//                     <div className="font-semibold">Manage Movies</div>
//                     <div className="text-sm opacity-90">Add, edit movies</div>
//                   </div>
//                 </button>

//                 <button
//                   onClick={() => handleTabChange("theaters")}
//                   className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
//                 >
//                   <span className="text-2xl mr-3">🏢</span>
//                   <div className="text-left">
//                     <div className="font-semibold">Manage Theaters</div>
//                     <div className="text-sm opacity-90">Add, edit theaters</div>
//                   </div>
//                 </button>
//               </div>
//             </div>
//           </div>
//         );
//     }
//   };

//   // If on add/edit theater or fix shows, render it full-screen:
//   if (
//     activeTab === "addTheater" ||
//     activeTab === "editTheater" ||
//     activeTab === "fixShows"
//   ) {
//     return renderContent();
//   }

//   // Otherwise normal layout:
//   return (
//     <div className="flex h-screen bg-gray-100">
//       <AdminSidebar
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//         currentView={activeTab}
//         onNavigate={handleTabChange}
//         onNavigateToFixShows={handleNavigateToFixShows} // Pass to sidebar if needed
//       />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <AdminHeader
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           onSearchChange={setSearchTerm}
//           currentUser={currentUser}
//           onLogout={onLogout}
//         />
//         <div className="flex-1 overflow-auto">
//           <div className="p-6">{renderContent()}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;
import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import DashboardStats from "./DashboardStats";
import MovieManagement from "./MovieManagement";
import TheaterManagement from "./TheaterManagement"; // This should be your API-connected version
import AddTheaterPage from "./AddTheaterPage";
import MovieForm from "./MovieForm";
import AdminFixShows from "./AdminFixShows";

import {
  getMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  formatMovieData,
} from "../../utils/movieAPI";

// NEW: Import theater API functions
import { createTheater, updateTheater } from "../../utils/theaterAPI";

const AdminDashboard = ({
  onLogout,
  currentUser,
  onNavigateToTheaterManagement,
  onNavigateToFixShows, // Add this prop from App.js
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const [movies, setMovies] = useState([]);

  // ─── Load real movies on mount ────────────────────────────────────────────────
  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const raw = await getMovies();
      setMovies(raw.map(formatMovieData));
    } catch (err) {
      console.error("Could not load movies", err);
      alert("Failed to load movies");
    }
  };

  // ─── Navigation & form toggles ────────────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEditingItem(null);
    setSearchTerm("");
  };

  const handleAddMovie = () => {
    setEditingMovie(null);
    setShowMovieForm(true);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setShowMovieForm(true);
  };

  // ─── Delete movie ────────────────────────────────────────────────────────────
  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    try {
      await deleteMovie(movieId);
      alert("Movie deleted successfully!");
      loadMovies();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete movie");
    }
  };

  // ─── Save (add or update) movie ──────────────────────────────────────────────
  const handleSaveMovie = async (movieData) => {
    try {
      if (editingMovie) {
        await updateMovie(editingMovie.id, movieData);
      } else {
        await addMovie(movieData);
      }
      setShowMovieForm(false);
      setEditingMovie(null);
      loadMovies();
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save movie");
    }
  };

  const handleCloseMovieForm = () => {
    setShowMovieForm(false);
    setEditingMovie(null);
  };

  // ─── NEW: Real Theater handlers with API integration ────────────────────────────────────────
  const handleNavigateToAddTheater = () => {
    console.log("Navigating to Add Theater");
    setActiveTab("addTheater");
    setEditingItem(null);
  };

  const handleNavigateToEditTheater = (theater) => {
    console.log("Navigating to Edit Theater:", theater);
    setEditingItem(theater);
    setActiveTab("editTheater");
  };

  const handleBackToTheaters = () => {
    console.log("Going back to theaters");
    setActiveTab("theaters");
    setEditingItem(null);
  };

  // ─── NEW: Fix Shows navigation ──────────────────────────────────────────────
  const handleNavigateToFixShows = () => {
    console.log("Navigating to Fix Shows");
    setActiveTab("fixShows");
  };

  const handleBackToDashboard = () => {
    setActiveTab("dashboard");
  };

  // Update your handleSaveTheater function with correct field mapping:
  const handleSaveTheater = async (theaterData) => {
    try {
      console.log("🎬 Raw theater data from form:", theaterData);

      // FIXED: Correct field mapping to match your database fields
      const backendData = {
        name: theaterData.name?.trim(),
        location: theaterData.location?.trim(),
        address: theaterData.address?.trim(),
        city: theaterData.city?.trim(),
        state: theaterData.state?.trim(),
        pincode: theaterData.pincode?.trim(),
        phoneNumber: theaterData.phoneNumber?.trim(), // FIXED: was theaterData.phone
        email: theaterData.email?.trim(),
        numberOfScreens: parseInt(theaterData.numberOfScreens) || 0, // FIXED: was theaterData.screens
        totalSeats: parseInt(theaterData.totalSeats) || 0,
        status: theaterData.status, // Already correct format from form
        facilities: theaterData.facilities || [],
        shows: theaterData.shows || [],
        pricing: theaterData.pricing || {},
      };

      console.log("🚀 Sending to backend:", backendData);

      // Validate required fields before sending
      const requiredFields = [
        "name",
        "location",
        "address",
        "city",
        "state",
        "pincode",
        "phoneNumber",
        "email",
      ];
      const missingFields = requiredFields.filter(
        (field) => !backendData[field]
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      if (editingItem) {
        await updateTheater(editingItem.id, backendData);
        alert("Theater updated successfully!");
      } else {
        await createTheater(backendData);
        alert("Theater created successfully!");
      }

      handleBackToTheaters();
    } catch (error) {
      console.error("❌ Error saving theater:", error);
      alert("Failed to save theater: " + error.message);
    }
  };

  const handleBack = () => {
    if (activeTab.includes("Movie")) {
      setActiveTab("movies");
    } else if (activeTab.includes("Theater")) {
      setActiveTab("theaters");
    } else if (activeTab === "fixShows") {
      setActiveTab("dashboard");
    }
    setEditingItem(null);
  };

  // ─── Main content switch ─────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case "addTheater":
        return (
          <AddTheaterPage
            onBack={handleBackToTheaters}
            onSave={handleSaveTheater}
          />
        );
      case "editTheater":
        return (
          <AddTheaterPage
            theater={editingItem}
            onBack={handleBackToTheaters}
            onSave={handleSaveTheater}
          />
        );
      case "fixShows":
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-2 flex items-center">
                      🔧 Fix Shows & Seats
                    </h2>
                    <p className="text-slate-300 text-lg">
                      Repair and generate missing show data
                    </p>
                  </div>
                  <button
                    onClick={handleBackToDashboard}
                    className="group flex items-center px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg border border-white/20"
                  >
                    <span className="mr-2">←</span>
                    Back to Dashboard
                  </button>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <AdminFixShows />
                </div>
              </div>
            </div>
          </div>
        );
      case "movies":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl border border-white/10 p-8">
              <MovieManagement
                movies={movies}
                searchTerm={searchTerm}
                onAddMovie={handleAddMovie}
                onEditMovie={handleEditMovie}
                onDeleteMovie={handleDeleteMovie}
              />
            </div>
            {showMovieForm && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-auto">
                  <MovieForm
                    movie={editingMovie}
                    onClose={handleCloseMovieForm}
                    onSave={handleSaveMovie}
                  />
                </div>
              </div>
            )}
          </div>
        );
      case "theaters":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 rounded-3xl border border-white/10 p-8">
              {/* UPDATED: Use the real API-connected TheaterManagement */}
              <TheaterManagement
                onNavigateToAddTheater={handleNavigateToAddTheater}
                onNavigateToEditTheater={handleNavigateToEditTheater}
              />
            </div>
          </div>
        );
      case "showtimes":
        return (
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="text-center py-16">
              <div className="p-6 bg-emerald-500/10 rounded-full w-24 h-24 mx-auto mb-6 border border-emerald-400/30">
                <span className="text-4xl">🎭</span>
              </div>
              <h2 className="text-4xl font-bold mb-4 text-white">
                Showtimes Management
              </h2>
              <p className="text-slate-300 text-xl mb-8">
                Advanced showtime scheduling coming soon...
              </p>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 max-w-md mx-auto">
                <p className="text-slate-400">
                  This feature will allow you to:
                </p>
                <ul className="text-slate-300 mt-4 space-y-2 text-left">
                  <li>• Schedule movie showtimes</li>
                  <li>• Manage theater schedules</li>
                  <li>• Set pricing for different times</li>
                  <li>• Handle special events</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "bookings":
        return (
          <div className="bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="text-center py-16">
              <div className="p-6 bg-rose-500/10 rounded-full w-24 h-24 mx-auto mb-6 border border-rose-400/30">
                <span className="text-4xl">🎫</span>
              </div>
              <h2 className="text-4xl font-bold mb-4 text-white">
                Bookings Management
              </h2>
              <p className="text-slate-300 text-xl mb-8">
                Comprehensive booking system coming soon...
              </p>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 max-w-md mx-auto">
                <p className="text-slate-400">
                  This feature will allow you to:
                </p>
                <ul className="text-slate-300 mt-4 space-y-2 text-left">
                  <li>• View all bookings</li>
                  <li>• Manage reservations</li>
                  <li>• Process refunds</li>
                  <li>• Generate reports</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <DashboardStats
              movies={movies}
              theaters={[]} // Remove mock theaters from stats
              onNavigateToMovies={() => handleTabChange("movies")}
              onNavigateToTheaters={() => handleTabChange("theaters")}
              onNavigateToFixShows={handleNavigateToFixShows} // Pass the fix shows handler
            />
          </div>
        );
    }
  };

  // If on add/edit theater or fix shows, render it full-screen:
  if (
    activeTab === "addTheater" ||
    activeTab === "editTheater" ||
    activeTab === "fixShows"
  ) {
    return renderContent();
  }

  // Otherwise normal layout:
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentView={activeTab}
        onNavigate={handleTabChange}
        onNavigateToFixShows={handleNavigateToFixShows} // Pass to sidebar if needed
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearchChange={setSearchTerm}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="p-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
