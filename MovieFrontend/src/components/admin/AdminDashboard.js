import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import DashboardStats from "./DashboardStats";
import MovieManagement from "./MovieManagement";
import TheaterManagement from "./TheaterManagement";
import AddTheaterPage from "./AddTheaterPage";
import MovieForm from "./MovieForm";
import AdminFixShows from "./AdminFixShows";
import "./desk.css";
import "./paperwork.css";
import Concierge from "../chatbot/Concierge";
import FoodItemManagement from "./FoodItemManagement";
import FoodItemForm from "./FoodItemForm";

import {
  getMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  formatMovieData,
} from "../../utils/movieAPI";

import { createTheater, updateTheater } from "../../utils/theaterAPI";

// NEW: Import food item API functions
import {
  getFoodItems,
  createFoodItem,
  updateFoodItem,
  formatFoodItemData,
} from "../../utils/foodItemAPI";

const AdminDashboard = ({
  onLogout,
  currentUser,
  onNavigateToTheaterManagement,
  onNavigateToFixShows,
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  // NEW: Food item state
  const [showFoodItemForm, setShowFoodItemForm] = useState(false);
  const [editingFoodItem, setEditingFoodItem] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [menuVersion, setMenuVersion] = useState(0); // bumps to refresh the canteen list

  const [movies, setMovies] = useState([]);

  // ─── Load real movies and food items on mount ────────────────────────────────
  useEffect(() => {
    loadMovies();
    loadFoodItems();
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

  // NEW: Load food items function
  const loadFoodItems = async () => {
    try {
      const raw = await getFoodItems();
      setFoodItems(raw.map(formatFoodItemData));
    } catch (err) {
      console.error("Could not load food items", err);
      // Don't show alert on load failure, just log it
    }
  };

  // ─── Navigation & form toggles ────────────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEditingItem(null);
    setSearchTerm("");
    // Close all forms when changing tabs
    setShowMovieForm(false);
    setShowFoodItemForm(false);
    setEditingMovie(null);
    setEditingFoodItem(null);
  };

  // ─── Movie handlers ──────────────────────────────────────────────────────────
  const handleAddMovie = () => {
    setEditingMovie(null);
    setShowMovieForm(true);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setShowMovieForm(true);
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    try {
      await deleteMovie(movieId);
      loadMovies();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete movie");
    }
  };

  const handleSaveMovie = async (movieData) => {
    try {
      // MovieForm needs the saved movie's id to create its shows
      const saved = editingMovie
        ? await updateMovie(editingMovie.id, movieData)
        : await addMovie(movieData);
      setShowMovieForm(false);
      setEditingMovie(null);
      loadMovies();
      return saved;
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save movie");
      throw err;
    }
  };

  const handleCloseMovieForm = () => {
    setShowMovieForm(false);
    setEditingMovie(null);
  };

  // ─── NEW: Food item handlers ─────────────────────────────────────────────────
  const handleAddFoodItem = () => {
    setEditingFoodItem(null);
    setShowFoodItemForm(true);
  };

  const handleEditFoodItem = (foodItem) => {
    setEditingFoodItem(foodItem);
    setShowFoodItemForm(true);
  };

  const handleSaveFoodItem = async (foodItemData) => {
    try {
      if (editingFoodItem) {
        await updateFoodItem(editingFoodItem.id, foodItemData);
      } else {
        await createFoodItem(foodItemData);
      }
      setShowFoodItemForm(false);
      setEditingFoodItem(null);
      loadFoodItems();
      setMenuVersion((v) => v + 1);
    } catch (err) {
      console.error("Save failed", err);
      throw err; // the form shows the message
    }
  };

  const handleCloseFoodItemForm = () => {
    setShowFoodItemForm(false);
    setEditingFoodItem(null);
  };

  // ─── Theater handlers ────────────────────────────────────────────────────────
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

  const handleNavigateToFixShows = () => {
    console.log("Navigating to Fix Shows");
    setActiveTab("fixShows");
  };


  const handleSaveTheater = async (theaterData) => {
    try {
      console.log("🎬 Raw theater data from form:", theaterData);

      const backendData = {
        name: theaterData.name?.trim(),
        location: theaterData.location?.trim(),
        address: theaterData.address?.trim(),
        city: theaterData.city?.trim(),
        state: theaterData.state?.trim(),
        pincode: theaterData.pincode?.trim(),
        phoneNumber: theaterData.phoneNumber?.trim(),
        email: theaterData.email?.trim(),
        numberOfScreens: parseInt(theaterData.numberOfScreens) || 0,
        totalSeats: parseInt(theaterData.totalSeats) || 0,
        status: theaterData.status,
        facilities: theaterData.facilities || [],
        shows: theaterData.shows || [],
        pricing: theaterData.pricing || {},
      };

      console.log("🚀 Sending to backend:", backendData);

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
      } else {
        await createTheater(backendData);
      }

      handleBackToTheaters();
    } catch (error) {
      console.error("❌ Error saving theater:", error);
      alert("Failed to save theater: " + error.message);
    }
  };


  // ─── Main content switch ─────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case "addTheater":
        return <AddTheaterPage onBack={handleBackToTheaters} onSave={handleSaveTheater} />;
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
          <section className="cb-stack">
            <div>
              <h1 className="cb-display">Seat repair</h1>
              <p className="cb-muted">
                Fix shows whose seat maps are missing or duplicated. Use this
                after adding a theater or changing its layout.
              </p>
            </div>
            <AdminFixShows />
          </section>
        );
      case "movies":
        return (
          <>
            <MovieManagement
              movies={movies}
              searchTerm={searchTerm}
              onAddMovie={handleAddMovie}
              onEditMovie={handleEditMovie}
              onDeleteMovie={handleDeleteMovie}
            />
            {showMovieForm && (
              <div className="cb-modal-backdrop">
                <div className="cb-modal cb-modal--xl cb-modal--paper cb-modal--flush">
                  <MovieForm
                    movie={editingMovie}
                    onClose={handleCloseMovieForm}
                    onSave={handleSaveMovie}
                  />
                </div>
              </div>
            )}
          </>
        );
      case "theaters":
        return (
          <TheaterManagement
            onNavigateToAddTheater={handleNavigateToAddTheater}
            onNavigateToEditTheater={handleNavigateToEditTheater}
          />
        );
      case "foodItems":
        return (
          <>
            <FoodItemManagement
              refreshKey={menuVersion}
              onAddFoodItem={handleAddFoodItem}
              onEditFoodItem={handleEditFoodItem}
            />
            {showFoodItemForm && (
              <div className="cb-modal-backdrop">
                <div className="cb-modal cb-modal--slip cb-modal--flush">
                  <FoodItemForm
                    foodItem={editingFoodItem}
                    onClose={handleCloseFoodItemForm}
                    onSave={handleSaveFoodItem}
                  />
                </div>
              </div>
            )}
          </>
        );
      default:
        return (
          <DashboardStats
            movies={movies}
            theaters={[]}
            foodItems={foodItems}
            onNavigateToMovies={() => handleTabChange("movies")}
            onNavigateToTheaters={() => handleTabChange("theaters")}
            onNavigateToFoodItems={() => handleTabChange("foodItems")}
            onNavigateToFixShows={handleNavigateToFixShows}
          />
        );
    }
  };

  const fullPage = ["addTheater", "editTheater", "fixShows"].includes(activeTab);

  // Posters now showing, tiled behind the desk (heavily dimmed)
  const collage = movies.filter((m) => m.posterUrl).map((m) => m.poster);
  const tiles = collage.length
    ? Array.from({ length: 48 }, (_, i) => collage[(i * 5) % collage.length])
    : [];

  return (
    <div className="cb-app cb-desk">
      {tiles.length > 0 && (
        <div className="cb-desk__collage" aria-hidden="true">
          <div className="cb-desk__tiles">
            {tiles.map((src, i) => (
              <img key={i} src={src} alt="" loading="lazy" />
            ))}
          </div>
        </div>
      )}
      <AdminSidebar
        activeTab={activeTab}
        onNavigate={handleTabChange}
        onLogout={onLogout}
        counts={{ films: movies.length, snacks: foodItems.length }}
      />
      <div className="cb-desk__body">
        {!fullPage && (
          <AdminHeader
            activeTab={activeTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentUser={currentUser}
          />
        )}
        <main className="cb-desk__main">{renderContent()}</main>
      </div>
      <Concierge mode="admin" onChanged={loadMovies} />
    </div>
  );
};

export default AdminDashboard;
