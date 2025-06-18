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
//         // Set default page for logged-in users
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
//       setCurrentPage("userDashboard"); // Redirect to user dashboard after login
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
//       // Still log out locally even if API call fails
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
//       // Still log out locally even if API call fails
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

//   // If user is logged in (but not admin), show user-specific content
//   if (isUserLoggedIn && !isAdminLoggedIn) {
//     return (
//       <div className="App">
//         {currentPage === "userDashboard" && (
//           <UserDashboard
//             currentUser={currentUser}
//             onLogout={handleUserLogout}
//             onBackToMovies={() => setCurrentPage("home")}
//           />
//         )}

//         {currentPage === "home" && (
//           <HomePage
//             onMovieSelect={handleMovieSelect}
//             onLoginClick={handleLoginClick}
//             isUserLoggedIn={isUserLoggedIn}
//             currentUser={currentUser}
//             onUserLogout={handleUserLogout}
//             onUserDashboard={() => setCurrentPage("userDashboard")}
//           />
//         )}

//         {currentPage === "booking" && selectedMovie && (
//           <BookingPage
//             movie={selectedMovie}
//             onBack={handleBackToHome}
//             onSeatSelect={handleSeatSelect}
//             isUserLoggedIn={isUserLoggedIn}
//             currentUser={currentUser}
//           />
//         )}

//         {currentPage === "seats" && bookingData && (
//           <SeatSelectionPage
//             bookingData={bookingData}
//             onBack={() => setCurrentPage("booking")}
//             onCheckout={handleCheckout}
//             isUserLoggedIn={isUserLoggedIn}
//             currentUser={currentUser}
//           />
//         )}

//         {currentPage === "payment" && bookingData && (
//           <PaymentPage
//             bookingData={bookingData}
//             onBack={() => setCurrentPage("seats")}
//             onPaymentComplete={handlePaymentComplete}
//             isUserLoggedIn={isUserLoggedIn}
//             currentUser={currentUser}
//           />
//         )}

//         {currentPage === "success" && bookingData && (
//           <SuccessPage
//             bookingData={bookingData}
//             onBackToHome={handleBackToHome}
//             currentUser={currentUser}
//           />
//         )}

//         {/* Test Component for logged-in users */}
//         {currentPage === "test" && <AuthTestComponent />}
//       </div>
//     );
//   }

//   // Default view for non-authenticated users
//   return (
//     <div className="App">
//       {/* User Pages */}
//       {currentPage === "home" && (
//         <HomePage
//           onMovieSelect={handleMovieSelect}
//           onLoginClick={handleLoginClick}
//           isUserLoggedIn={isUserLoggedIn}
//           currentUser={currentUser}
//           onUserLogout={handleUserLogout}
//         />
//       )}

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

//       {/* Test Auth Button (remove in production) */}
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

//       {/* Authentication Modal */}
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
import UserDashboard from "./components/user/UserDashboard";

// Utility Imports
import {
  isAdminAuthenticated,
  isAuthenticated,
  logoutAdmin,
  logoutUser,
  getCurrentAdmin,
  getCurrentUser,
} from "./utils/auth";

const App = () => {
  // Page Navigation State
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookingData, setBookingData] = useState(null);

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
    setCurrentPage("dashboard");
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
      // Still log out locally even if API call fails
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
      alert("Logged out successfully!");
    } catch (error) {
      console.error("User logout error:", error);
      // Still log out locally even if API call fails
      setIsUserLoggedIn(false);
      setCurrentUser(null);
    }
  };

  // If admin is logged in, show admin dashboard
  if (isAdminLoggedIn) {
    return (
      <AdminDashboard onLogout={handleAdminLogout} currentUser={currentUser} />
    );
  }

  // Main Application Render
  return (
    <div className="App">
      {/* User Pages */}
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

      {currentPage === "dashboard" && (
        <UserDashboard
          currentUser={currentUser}
          onBackToHome={handleBackToHome}
          onLogout={handleUserLogout}
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

      {/* Authentication Modal */}
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
