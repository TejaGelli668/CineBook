// import React, { useState, useEffect } from "react";
// import "./App.css";

// // Component Imports
// import HomePage from "./components/user/HomePage";
// import BookingPage from "./components/user/BookingPage";
// import SeatSelectionPage from "./components/user/SeatSelectionPage";
// import PaymentPage from "./components/user/PaymentPage";
// import SuccessPage from "./components/user/SuccessPage";
// import AdminDashboard from "./components/admin/AdminDashboard";
// import LoginModal from "./components/auth/LoginModal";
// import AuthTestComponent from "./components/AuthTestComponent";
// import UserDashboard from "./components/user/UserDashboard";

// // Utility Imports
// import {
//   isAdminAuthenticated,
//   isAuthenticated,
//   logoutAdmin,
//   logoutUser,
//   getCurrentAdmin,
//   getCurrentUser,
// } from "./utils/auth";

// const App = () => {
//   // Page Navigation State
//   const [currentPage, setCurrentPage] = useState("home");
//   const [selectedMovie, setSelectedMovie] = useState(null);
//   const [bookingData, setBookingData] = useState(null);

//   // Authentication State
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
//   const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);

//   // Initialize authentication state on app load
//   useEffect(() => {
//     const checkAuthStatus = () => {
//       if (isAdminAuthenticated()) {
//         setIsAdminLoggedIn(true);
//         setCurrentUser(getCurrentAdmin());
//         setCurrentPage("admin");
//       } else if (isAuthenticated()) {
//         setIsUserLoggedIn(true);
//         setCurrentUser(getCurrentUser());
//         // FIXED: Set default page for logged-in users to HOME, not dashboard
//         setCurrentPage("home");
//       }
//     };

//     checkAuthStatus();
//   }, []);

//   // User Flow Handlers
//   const handleMovieSelect = (movie) => {
//     setSelectedMovie(movie);
//     setCurrentPage("booking");
//   };

//   const handleSeatSelect = (data) => {
//     setBookingData(data);
//     setCurrentPage("seats");
//   };

//   const handleCheckout = (data) => {
//     setBookingData(data);
//     setCurrentPage("payment");
//   };

//   const handlePaymentComplete = (data) => {
//     setBookingData(data);
//     setCurrentPage("success");
//   };

//   const handleBackToHome = () => {
//     setCurrentPage("home");
//     setSelectedMovie(null);
//     setBookingData(null);
//   };

//   // FIXED: Navigation handlers for dashboard
//   const handleDashboardClick = () => {
//     console.log("Dashboard clicked - navigating to userDashboard");
//     setCurrentPage("userDashboard");
//   };

//   const handleBackToMovies = () => {
//     console.log("Back to movies clicked - navigating to home");
//     setCurrentPage("home");
//   };

//   // Authentication Handlers
//   const handleLoginClick = () => {
//     setShowLoginModal(true);
//   };

//   const handleCloseLoginModal = () => {
//     setShowLoginModal(false);
//   };

//   const handleAdminLogin = async (email, password) => {
//     try {
//       setIsAdminLoggedIn(true);
//       setCurrentUser(getCurrentAdmin());
//       setCurrentPage("admin");
//       setShowLoginModal(false);
//       alert("Welcome to Admin Dashboard!");
//     } catch (error) {
//       console.error("Admin login error:", error);
//       alert("Login failed. Please try again.");
//     }
//   };

//   const handleUserLogin = () => {
//     try {
//       setIsUserLoggedIn(true);
//       setCurrentUser(getCurrentUser());
//       setShowLoginModal(false);
//       // FIXED: Redirect to HOME page after login, not dashboard
//       setCurrentPage("home");
//       alert("User login successful!");
//     } catch (error) {
//       console.error("User login error:", error);
//       alert("Login failed. Please try again.");
//     }
//   };

//   const handleAdminLogout = async () => {
//     try {
//       await logoutAdmin();
//       setIsAdminLoggedIn(false);
//       setCurrentUser(null);
//       setCurrentPage("home");
//       alert("Admin logged out successfully!");
//     } catch (error) {
//       console.error("Admin logout error:", error);
//       setIsAdminLoggedIn(false);
//       setCurrentUser(null);
//       setCurrentPage("home");
//     }
//   };

//   const handleUserLogout = async () => {
//     try {
//       await logoutUser();
//       setIsUserLoggedIn(false);
//       setCurrentUser(null);
//       setCurrentPage("home");
//       alert("Logged out successfully!");
//     } catch (error) {
//       console.error("User logout error:", error);
//       setIsUserLoggedIn(false);
//       setCurrentUser(null);
//       setCurrentPage("home");
//     }
//   };

//   // If admin is logged in, show admin dashboard
//   if (isAdminLoggedIn) {
//     return (
//       <AdminDashboard onLogout={handleAdminLogout} currentUser={currentUser} />
//     );
//   }

//   // Main app render - works for both logged in and non-logged in users
//   return (
//     <div className="App">
//       {/* Home Page */}
//       {currentPage === "home" && (
//         <HomePage
//           onMovieSelect={handleMovieSelect}
//           onLoginClick={handleLoginClick}
//           isUserLoggedIn={isUserLoggedIn}
//           currentUser={currentUser}
//           onUserLogout={handleUserLogout}
//           onDashboardClick={handleDashboardClick} // FIXED: Proper function
//         />
//       )}

//       {/* User Dashboard - FIXED: Only show when user is logged in */}
//       {currentPage === "userDashboard" && isUserLoggedIn && (
//         <UserDashboard
//           currentUser={currentUser}
//           onLogout={handleUserLogout}
//           onBackToMovies={handleBackToMovies} // FIXED: Correct prop name
//         />
//       )}

//       {/* Booking Flow Pages */}
//       {currentPage === "booking" && selectedMovie && (
//         <BookingPage
//           movie={selectedMovie}
//           onBack={handleBackToHome}
//           onSeatSelect={handleSeatSelect}
//           isUserLoggedIn={isUserLoggedIn}
//           currentUser={currentUser}
//         />
//       )}

//       {currentPage === "seats" && bookingData && (
//         <SeatSelectionPage
//           bookingData={bookingData}
//           onBack={() => setCurrentPage("booking")}
//           onCheckout={handleCheckout}
//           isUserLoggedIn={isUserLoggedIn}
//           currentUser={currentUser}
//         />
//       )}

//       {currentPage === "payment" && bookingData && (
//         <PaymentPage
//           bookingData={bookingData}
//           onBack={() => setCurrentPage("seats")}
//           onPaymentComplete={handlePaymentComplete}
//           isUserLoggedIn={isUserLoggedIn}
//           currentUser={currentUser}
//         />
//       )}

//       {currentPage === "success" && bookingData && (
//         <SuccessPage
//           bookingData={bookingData}
//           onBackToHome={handleBackToHome}
//           currentUser={currentUser}
//         />
//       )}

//       {/* Test Component */}
//       {currentPage === "test" && <AuthTestComponent />}

//       {/* Test Auth Button */}
//       <button
//         onClick={() => setCurrentPage("test")}
//         style={{
//           position: "fixed",
//           bottom: "20px",
//           right: "20px",
//           zIndex: 1000,
//           background: "#007bff",
//           color: "white",
//           border: "none",
//           padding: "10px",
//           borderRadius: "5px",
//           cursor: "pointer",
//         }}
//       >
//         Test Auth
//       </button>

//       {/* Login Modal */}
//       <LoginModal
//         isOpen={showLoginModal}
//         onClose={handleCloseLoginModal}
//         onAdminLogin={handleAdminLogin}
//         onUserLogin={handleUserLogin}
//       />
//     </div>
//   );
// };

// export default App;
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

// NEW: Theater Management Components
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

// NEW: Theater API Import
import { createTheater, updateTheater } from "./utils/theaterAPI";

const App = () => {
  // Page Navigation State
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  // NEW: Theater Management State
  const [editingTheater, setEditingTheater] = useState(null);

  // Authentication State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize authentication state on app load
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

  // User Flow Handlers
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
    console.log("Dashboard clicked - navigating to userDashboard");
    setCurrentPage("userDashboard");
  };

  const handleBackToMovies = () => {
    console.log("Back to movies clicked - navigating to home");
    setCurrentPage("home");
  };

  // NEW: Theater Management Handlers
  const handleNavigateToTheaterManagement = () => {
    console.log("Navigating to Theater Management");
    setCurrentPage("theater-management");
    setEditingTheater(null);
  };

  const handleNavigateToAddTheater = () => {
    console.log("Navigating to Add Theater");
    setCurrentPage("add-theater");
    setEditingTheater(null);
  };

  const handleNavigateToEditTheater = (theater) => {
    console.log("Navigating to Edit Theater:", theater);
    setCurrentPage("add-theater");
    setEditingTheater(theater);
  };

  const handleBackToTheaterManagement = () => {
    console.log("Going back to Theater Management");
    setCurrentPage("theater-management");
    setEditingTheater(null);
  };

  const handleSaveTheater = async (theaterData) => {
    try {
      console.log("Saving theater:", theaterData);

      // Map frontend data to backend format
      const backendData = {
        name: theaterData.name,
        location: theaterData.location,
        address: theaterData.address,
        city: theaterData.city,
        state: theaterData.state,
        pincode: theaterData.pincode,
        phoneNumber: theaterData.phone, // Note: phoneNumber for backend
        email: theaterData.email,
        numberOfScreens: parseInt(theaterData.screens), // Note: numberOfScreens for backend
        totalSeats: parseInt(theaterData.totalSeats),
        status: theaterData.status.toUpperCase(), // Backend expects ACTIVE/INACTIVE
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

  // Authentication Handlers
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

  // If admin is logged in, show admin dashboard or theater management
  if (isAdminLoggedIn) {
    // NEW: Handle theater management pages
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

    // Default admin dashboard
    return (
      <AdminDashboard
        onLogout={handleAdminLogout}
        currentUser={currentUser}
        onNavigateToTheaterManagement={handleNavigateToTheaterManagement}
      />
    );
  }

  // Main app render - works for both logged in and non-logged in users
  return (
    <div className="App">
      {/* Home Page */}
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

      {/* User Dashboard */}
      {currentPage === "userDashboard" && isUserLoggedIn && (
        <UserDashboard
          currentUser={currentUser}
          onLogout={handleUserLogout}
          onBackToMovies={handleBackToMovies}
        />
      )}

      {/* Booking Flow Pages */}
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

      {/* Test Component */}
      {currentPage === "test" && <AuthTestComponent />}

      {/* Test Auth Button */}
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

      {/* Login Modal */}
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
