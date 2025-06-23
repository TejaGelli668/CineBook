import React, { useState, useEffect } from "react";
import "./App.css";

// Component Imports
import HomePage from "./components/user/HomePage";
import BookingPage from "./components/user/BookingPage";
import SeatSelectionPage from "./components/user/SeatSelectionPage";
import PaymentPage from "./components/user/PaymentPage";
import SuccessPage from "./components/user/SuccessPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import LoginModal from "./components/auth/LoginModal";
import AuthTestComponent from "./components/AuthTestComponent";
import UserDashboard from "./components/user/UserDashboard";
import AdminFixShows from "./components/admin/AdminFixShows";

// Theater Management Components
import TheaterManagement from "./components/admin/TheaterManagement";
import AddTheaterPage from "./components/admin/AddTheaterPage";

// Utility Imports
import {
  isAdminAuthenticated,
  isAuthenticated,
  logoutAdmin,
  logoutUser,
  getCurrentAdmin,
  getCurrentUser,
} from "./utils/auth";

// Theater API
import { createTheater, updateTheater } from "./utils/theaterAPI";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [editingTheater, setEditingTheater] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      if (isAdminAuthenticated()) {
        setIsAdminLoggedIn(true);
        setCurrentUser(getCurrentAdmin());
        setCurrentPage("admin");
      } else if (isAuthenticated()) {
        setIsUserLoggedIn(true);
        setCurrentUser(getCurrentUser());
        setCurrentPage("home");
      }
    };
    checkAuthStatus();
  }, []);

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setCurrentPage("booking");
  };

  const handleSeatSelect = (data) => {
    setBookingData(data);
    setCurrentPage("seats");
  };

  const handleCheckout = (data) => {
    setBookingData(data);
    setCurrentPage("payment");
  };

  const handlePaymentComplete = (data) => {
    setBookingData(data);
    setCurrentPage("success");
  };

  const handleBackToHome = () => {
    setCurrentPage("home");
    setSelectedMovie(null);
    setBookingData(null);
  };

  const handleDashboardClick = () => {
    setCurrentPage("userDashboard");
  };

  const handleBackToMovies = () => {
    setCurrentPage("home");
  };

  const handleNavigateToTheaterManagement = () => {
    setCurrentPage("theater-management");
    setEditingTheater(null);
  };

  const handleNavigateToAddTheater = () => {
    setCurrentPage("add-theater");
    setEditingTheater(null);
  };

  const handleNavigateToEditTheater = (theater) => {
    setCurrentPage("add-theater");
    setEditingTheater(theater);
  };

  const handleBackToTheaterManagement = () => {
    setCurrentPage("theater-management");
    setEditingTheater(null);
  };

  // Add navigation handler for AdminFixShows
  const handleNavigateToFixShows = () => {
    setCurrentPage("fix-shows");
  };

  const handleBackToAdmin = () => {
    setCurrentPage("admin");
  };

  const handleSaveTheater = async (theaterData) => {
    try {
      const backendData = {
        name: theaterData.name,
        location: theaterData.location,
        address: theaterData.address,
        city: theaterData.city,
        state: theaterData.state,
        pincode: theaterData.pincode,
        phoneNumber: theaterData.phone,
        email: theaterData.email,
        numberOfScreens: parseInt(theaterData.screens),
        totalSeats: parseInt(theaterData.totalSeats),
        status: theaterData.status.toUpperCase(),
        facilities: theaterData.facilities || [],
        shows: theaterData.shows || [],
        pricing: theaterData.pricing || {},
      };

      if (editingTheater) {
        await updateTheater(editingTheater.id, backendData);
        alert("Theater updated successfully!");
      } else {
        await createTheater(backendData);
        alert("Theater created successfully!");
      }

      handleBackToTheaterManagement();
    } catch (error) {
      console.error("Error saving theater:", error);
      alert("Failed to save theater: " + error.message);
    }
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleAdminLogin = async (email, password) => {
    try {
      setIsAdminLoggedIn(true);
      setCurrentUser(getCurrentAdmin());
      setCurrentPage("admin");
      setShowLoginModal(false);
      alert("Welcome to Admin Dashboard!");
    } catch (error) {
      console.error("Admin login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  const handleUserLogin = () => {
    try {
      setIsUserLoggedIn(true);
      setCurrentUser(getCurrentUser());
      setShowLoginModal(false);
      setCurrentPage("home");
      alert("User login successful!");
    } catch (error) {
      console.error("User login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  const handleAdminLogout = async () => {
    try {
      await logoutAdmin();
      setIsAdminLoggedIn(false);
      setCurrentUser(null);
      setCurrentPage("home");
      alert("Admin logged out successfully!");
    } catch (error) {
      console.error("Admin logout error:", error);
      setIsAdminLoggedIn(false);
      setCurrentUser(null);
      setCurrentPage("home");
    }
  };

  const handleUserLogout = async () => {
    try {
      await logoutUser();
      setIsUserLoggedIn(false);
      setCurrentUser(null);
      setCurrentPage("home");
      alert("Logged out successfully!");
    } catch (error) {
      console.error("User logout error:", error);
      setIsUserLoggedIn(false);
      setCurrentUser(null);
      setCurrentPage("home");
    }
  };

  // Admin Pages
  if (isAdminLoggedIn) {
    if (currentPage === "theater-management") {
      return (
        <TheaterManagement
          onNavigateToAddTheater={handleNavigateToAddTheater}
          onNavigateToEditTheater={handleNavigateToEditTheater}
        />
      );
    }

    if (currentPage === "add-theater") {
      return (
        <AddTheaterPage
          theater={editingTheater}
          onBack={handleBackToTheaterManagement}
          onSave={handleSaveTheater}
        />
      );
    }

    // Add the fix-shows page
    if (currentPage === "fix-shows") {
      return (
        <div>
          <button
            onClick={handleBackToAdmin}
            className="m-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            ← Back to Admin Dashboard
          </button>
          <AdminFixShows />
        </div>
      );
    }

    return (
      <AdminDashboard
        onLogout={handleAdminLogout}
        currentUser={currentUser}
        onNavigateToTheaterManagement={handleNavigateToTheaterManagement}
        onNavigateToFixShows={handleNavigateToFixShows}
      />
    );
  }

  // User Pages
  return (
    <div className="App">
      {currentPage === "home" && (
        <HomePage
          onMovieSelect={handleMovieSelect}
          onLoginClick={handleLoginClick}
          isUserLoggedIn={isUserLoggedIn}
          currentUser={currentUser}
          onUserLogout={handleUserLogout}
          onDashboardClick={handleDashboardClick}
        />
      )}

      {currentPage === "userDashboard" && isUserLoggedIn && (
        <UserDashboard
          currentUser={currentUser}
          onLogout={handleUserLogout}
          onBackToMovies={handleBackToMovies}
        />
      )}

      {currentPage === "booking" && selectedMovie && (
        <BookingPage
          movie={selectedMovie}
          onBack={handleBackToHome}
          onSeatSelect={handleSeatSelect}
          isUserLoggedIn={isUserLoggedIn}
          currentUser={currentUser}
        />
      )}

      {currentPage === "seats" && bookingData && (
        <SeatSelectionPage
          bookingData={bookingData}
          onBack={() => setCurrentPage("booking")}
          onCheckout={handleCheckout}
          isUserLoggedIn={isUserLoggedIn}
          currentUser={currentUser}
          onLogin={() => {
            setShowLoginModal(true); // 🔁 show login modal if user not logged in
          }}
        />
      )}

      {currentPage === "payment" && bookingData && (
        <PaymentPage
          bookingData={bookingData}
          onBack={() => setCurrentPage("seats")}
          onPaymentComplete={handlePaymentComplete}
          isUserLoggedIn={isUserLoggedIn}
          currentUser={currentUser}
        />
      )}

      {currentPage === "success" && bookingData && (
        <SuccessPage
          bookingData={bookingData}
          onBackToHome={handleBackToHome}
          currentUser={currentUser}
        />
      )}

      {currentPage === "test" && <AuthTestComponent />}

      <button
        onClick={() => setCurrentPage("test")}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          background: "#007bff",
          color: "white",
          border: "none",
          padding: "10px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Test Auth
      </button>

      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onAdminLogin={handleAdminLogin}
        onUserLogin={handleUserLogin}
      />
    </div>
  );
};

export default App;
