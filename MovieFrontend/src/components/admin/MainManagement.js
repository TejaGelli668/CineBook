// src/components/admin/MainManagement.js
import React, { useState } from "react";
import MovieManagement from "./MovieManagement";
import TheaterManagement from "./TheaterManagement";
import AddMoviePage from "./AddMoviePage";
import AddTheaterPage from "./AddTheaterPage";

const MainManagement = ({ type = "movies" }) => {
  const [currentView, setCurrentView] = useState(type); // 'movies', 'theaters', 'addMovie', 'addTheater', 'editMovie', 'editTheater'
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // Sample data - replace with your actual data source or props
  const [movies, setMovies] = useState([
    {
      id: "1",
      title: "Avengers: Endgame",
      genre: "Action",
      rating: 8.4,
      duration: "3h 1m",
      price: 300,
      poster: "/api/placeholder/300/400",
      status: "Active",
    },
    {
      id: "2",
      title: "Spider-Man: No Way Home",
      genre: "Action",
      rating: 8.2,
      duration: "2h 28m",
      price: 250,
      poster: "/api/placeholder/300/400",
      status: "Active",
    },
    {
      id: "3",
      title: "Dune: Part Two",
      genre: "Sci-Fi",
      rating: 8.6,
      duration: "2h 46m",
      price: 280,
      poster: "/api/placeholder/300/400",
      status: "Active",
    },
    {
      id: "4",
      title: "Top Gun: Maverick",
      genre: "Action",
      rating: 8.3,
      duration: "2h 11m",
      price: 270,
      poster: "/api/placeholder/300/400",
      status: "Active",
    },
  ]);

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

  // Navigation handlers
  const handleAddMovie = () => {
    setCurrentView("addMovie");
    setEditingItem(null);
  };

  const handleAddTheater = () => {
    setCurrentView("addTheater");
    setEditingItem(null);
  };

  const handleEditMovie = (movie) => {
    setEditingItem(movie);
    setCurrentView("editMovie");
  };

  const handleEditTheater = (theater) => {
    setEditingItem(theater);
    setCurrentView("editTheater");
  };

  const handleDeleteMovie = (movieId) => {
    setMovies(movies.filter((movie) => movie.id !== movieId));
    alert("Movie deleted successfully!");
  };

  const handleDeleteTheater = (theaterId) => {
    setTheaters(theaters.filter((theater) => theater.id !== theaterId));
    alert("Theater deleted successfully!");
  };

  const handleViewTheaterDetails = (theater) => {
    alert(`Viewing details for ${theater.name}`);
  };

  const handleBack = () => {
    if (currentView.includes("Movie")) {
      setCurrentView("movies");
    } else if (currentView.includes("Theater")) {
      setCurrentView("theaters");
    }
    setEditingItem(null);
  };

  const handleSaveMovie = (movieData) => {
    if (editingItem) {
      setMovies(
        movies.map((movie) =>
          movie.id === editingItem.id
            ? { ...movieData, id: editingItem.id }
            : movie
        )
      );
      alert("Movie updated successfully!");
    } else {
      setMovies([...movies, movieData]);
      alert("Movie added successfully!");
    }
    setCurrentView("movies");
    setEditingItem(null);
  };

  const handleSaveTheater = (theaterData) => {
    if (editingItem) {
      setTheaters(
        theaters.map((theater) =>
          theater.id === editingItem.id
            ? { ...theaterData, id: editingItem.id }
            : theater
        )
      );
      alert("Theater updated successfully!");
    } else {
      setTheaters([...theaters, theaterData]);
      alert("Theater added successfully!");
    }
    setCurrentView("theaters");
    setEditingItem(null);
  };

  // Render based on current view
  const renderContent = () => {
    switch (currentView) {
      case "addMovie":
        return <AddMoviePage onBack={handleBack} onSave={handleSaveMovie} />;

      case "editMovie":
        return (
          <AddMoviePage
            onBack={handleBack}
            onSave={handleSaveMovie}
            initialData={editingItem}
            isEditing={true}
          />
        );

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
            isEditing={true}
          />
        );

      case "theaters":
        return (
          <TheaterManagement
            theaters={theaters}
            searchTerm={searchTerm}
            onAddTheater={handleAddTheater}
            onEditTheater={handleEditTheater}
            onDeleteTheater={handleDeleteTheater}
            onViewDetails={handleViewTheaterDetails}
          />
        );

      default: // "movies"
        return (
          <MovieManagement
            movies={movies}
            searchTerm={searchTerm}
            onAddMovie={handleAddMovie}
            onEditMovie={handleEditMovie}
            onDeleteMovie={handleDeleteMovie}
          />
        );
    }
  };

  if (
    currentView === "addMovie" ||
    currentView === "editMovie" ||
    currentView === "addTheater" ||
    currentView === "editTheater"
  ) {
    return renderContent();
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {currentView === "movies"
              ? "Movies Management"
              : "Theaters Management"}
          </h1>
          <p className="text-slate-600">
            {currentView === "movies"
              ? "Manage your movies efficiently"
              : "Manage your theaters efficiently"}
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <svg
            className="w-5 h-5 text-slate-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setCurrentView("movies")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              currentView === "movies"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setCurrentView("theaters")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              currentView === "theaters"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            Theaters
          </button>
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default MainManagement;
