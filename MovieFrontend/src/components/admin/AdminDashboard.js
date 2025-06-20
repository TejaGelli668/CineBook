import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import DashboardStats from "./DashboardStats";
import MovieManagement from "./MovieManagement";
import TheaterManagement from "./TheaterManagement";
import AddMoviePage from "./AddMoviePage";
import AddTheaterPage from "./AddTheaterPage";
import MovieForm from "./MovieForm";

import {
  getMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  formatMovieData,
} from "../../utils/movieAPI";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([
    {
      id: "1",
      name: "PVR Cinemas",
      location: "Phoenix Mall, Mumbai",
      screens: 8,
      totalSeats: 1200,
      status: "Active",
      facilities: ["M-Ticket", "Food & Beverage", "Parking", "IMAX"],
      shows: ["10:00 AM", "1:30 PM", "6:00 PM", "9:30 PM"],
    },
    {
      id: "2",
      name: "INOX Multiplex",
      location: "City Center, Delhi",
      screens: 6,
      totalSeats: 900,
      status: "Active",
      facilities: ["DOLBY ATMOS", "Recliner Seats", "Parking", "Food Court"],
      shows: ["11:00 AM", "2:30 PM", "7:00 PM", "10:00 PM"],
    },
  ]);

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

  // ─── Theater handlers (unchanged) ────────────────────────────────────────────
  const handleAddTheater = () => {
    setActiveTab("addTheater");
    setEditingItem(null);
  };

  const handleEditTheater = (theater) => {
    setEditingItem(theater);
    setActiveTab("editTheater");
  };

  const handleDeleteTheater = (theaterId) => {
    if (window.confirm("Are you sure you want to delete this theater?")) {
      setTheaters((t) => t.filter((x) => x.id !== theaterId));
      alert("Theater deleted successfully!");
    }
  };

  const handleViewTheaterDetails = (theater) => {
    alert(`Viewing details for ${theater.name}`);
  };

  const handleSaveTheater = (theaterData) => {
    if (editingItem) {
      setTheaters((t) =>
        t.map((x) =>
          x.id === editingItem.id ? { ...theaterData, id: x.id } : x
        )
      );
      alert("Theater updated successfully!");
    } else {
      setTheaters((t) => [...t, theaterData]);
      alert("Theater added successfully!");
    }
    setActiveTab("theaters");
    setEditingItem(null);
  };

  const handleBack = () => {
    if (activeTab.includes("Movie")) {
      setActiveTab("movies");
    } else if (activeTab.includes("Theater")) {
      setActiveTab("theaters");
    }
    setEditingItem(null);
  };

  // ─── Main content switch ─────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case "addTheater":
        return (
          <AddTheaterPage onBack={handleBack} onSave={handleSaveTheater} />
        );
      case "editTheater":
        return (
          <AddTheaterPage
            onBack={handleBack}
            onSave={handleSaveTheater}
            initialData={editingItem}
            isEditing
          />
        );
      case "movies":
        return (
          <div className="space-y-6">
            <MovieManagement
              movies={movies}
              searchTerm={searchTerm}
              onAddMovie={handleAddMovie}
              onEditMovie={handleEditMovie}
              onDeleteMovie={handleDeleteMovie}
            />
            {showMovieForm && (
              <MovieForm
                movie={editingMovie}
                onClose={handleCloseMovieForm}
                onSave={handleSaveMovie}
              />
            )}
          </div>
        );
      case "theaters":
        return (
          <div className="space-y-6">
            <TheaterManagement
              theaters={theaters}
              searchTerm={searchTerm}
              onAddTheater={handleAddTheater}
              onEditTheater={handleEditTheater}
              onDeleteTheater={handleDeleteTheater}
              onViewDetails={handleViewTheaterDetails}
            />
          </div>
        );
      case "showtimes":
        return (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Showtimes Management</h2>
            <p className="text-gray-600">
              Showtimes management content coming soon...
            </p>
          </div>
        );
      case "bookings":
        return (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Bookings Management</h2>
            <p className="text-gray-600">
              Bookings management content coming soon...
            </p>
          </div>
        );
      case "users":
        return (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Users Management</h2>
            <p className="text-gray-600">
              Users management content coming soon...
            </p>
          </div>
        );
      case "analytics":
        return (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
            <p className="text-gray-600">
              Analytics dashboard content coming soon...
            </p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <DashboardStats
              movies={movies}
              theaters={theaters}
              onNavigateToMovies={() => handleTabChange("movies")}
              onNavigateToTheaters={() => handleTabChange("theaters")}
            />
          </div>
        );
    }
  };

  // If on add/edit theater, render it full-screen:
  if (activeTab === "addTheater" || activeTab === "editTheater") {
    return renderContent();
  }

  // Otherwise normal layout:
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentView={activeTab}
        onNavigate={handleTabChange}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearchChange={setSearchTerm}
        />
        <div className="flex-1 overflow-auto">
          <div className="p-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
