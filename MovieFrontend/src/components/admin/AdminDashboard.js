import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import DashboardStats from "./DashboardStats";
import MovieManagement from "./MovieManagement";
import TheaterManagement from "./TheaterManagement";
import AddMoviePage from "./AddMoviePage";
import AddTheaterPage from "./AddTheaterPage";

const AdminDashboard = () => {
  // Use activeTab for compatibility with existing sidebar
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // Sample data - replace with your actual data source
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
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEditingItem(null);
    setSearchTerm("");
  };

  const handleAddMovie = () => {
    setActiveTab("addMovie");
    setEditingItem(null);
  };

  const handleAddTheater = () => {
    setActiveTab("addTheater");
    setEditingItem(null);
  };

  const handleEditMovie = (movie) => {
    setEditingItem(movie);
    setActiveTab("editMovie");
  };

  const handleEditTheater = (theater) => {
    setEditingItem(theater);
    setActiveTab("editTheater");
  };

  const handleDeleteMovie = (movieId) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      setMovies(movies.filter((movie) => movie.id !== movieId));
      alert("Movie deleted successfully!");
    }
  };

  const handleDeleteTheater = (theaterId) => {
    if (window.confirm("Are you sure you want to delete this theater?")) {
      setTheaters(theaters.filter((theater) => theater.id !== theaterId));
      alert("Theater deleted successfully!");
    }
  };

  const handleViewTheaterDetails = (theater) => {
    alert(`Viewing details for ${theater.name}`);
  };

  const handleBack = () => {
    if (activeTab.includes("Movie")) {
      setActiveTab("movies");
    } else if (activeTab.includes("Theater")) {
      setActiveTab("theaters");
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
    setActiveTab("movies");
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
    setActiveTab("theaters");
    setEditingItem(null);
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
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

      default: // "dashboard"
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

  // If we're on add/edit pages, render them full screen
  if (
    activeTab === "addMovie" ||
    activeTab === "editMovie" ||
    activeTab === "addTheater" ||
    activeTab === "editTheater"
  ) {
    return renderContent();
  }

  // Render normal dashboard layout
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - pass both setActiveTab and activeTab for compatibility */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        // Also support the new prop name if your sidebar expects it
        currentView={activeTab}
        onNavigate={handleTabChange}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearchChange={setSearchTerm}
          // Add any other props your header expects
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
