// import React, { useState, useEffect } from "react";
// import "./App.css";

// // Import your FIXED chatbot
// import FixedChatbotUIMatching from "./components/chatbot/EnhancedChatbotWithBookings";

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
// import AdminFixShows from "./components/admin/AdminFixShows";

// // Theater Management Components
// import TheaterManagement from "./components/admin/TheaterManagement";
// import AddTheaterPage from "./components/admin/AddTheaterPage";

// // Utility Imports
// import {
//   isAdminAuthenticated,
//   isAuthenticated,
//   logoutAdmin,
//   logoutUser,
//   getCurrentAdmin,
//   getCurrentUser,
// } from "./utils/auth";

// // Theater API
// import { createTheater, updateTheater } from "./utils/theaterAPI";

// const App = () => {
//   const [currentPage, setCurrentPage] = useState("home");
//   const [selectedMovie, setSelectedMovie] = useState(null);
//   const [bookingData, setBookingData] = useState(null);
//   const [editingTheater, setEditingTheater] = useState(null);
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
//   const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);

//   useEffect(() => {
//     const checkAuthStatus = () => {
//       if (isAdminAuthenticated()) {
//         setIsAdminLoggedIn(true);
//         setCurrentUser(getCurrentAdmin());
//         setCurrentPage("admin");
//       } else if (isAuthenticated()) {
//         setIsUserLoggedIn(true);
//         setCurrentUser(getCurrentUser());
//         setCurrentPage("home");
//       }
//     };
//     checkAuthStatus();
//   }, []);

//   // Enhanced movie selection handler that can be triggered by chatbot
//   const handleMovieSelect = (movie) => {
//     console.log("Movie selected from chatbot:", movie);
//     setSelectedMovie(movie);
//     setCurrentPage("booking");
//     // Note: chatbot stays open now!
//   };

//   // Enhanced navigation handler for chatbot
//   const handleNavigateToPage = (pageName) => {
//     console.log("Navigating to page:", pageName);
//     switch (pageName) {
//       case "home":
//         setCurrentPage("home");
//         setSelectedMovie(null);
//         setBookingData(null);
//         break;
//       case "userDashboard":
//         if (isUserLoggedIn) {
//           setCurrentPage("userDashboard");
//         } else {
//           setShowLoginModal(true);
//         }
//         break;
//       case "admin":
//         if (isAdminLoggedIn) {
//           setCurrentPage("admin");
//         }
//         break;
//       default:
//         setCurrentPage("home");
//     }
//     // Note: chatbot stays open now!
//   };

//   // Show login modal handler for chatbot
//   const handleShowLogin = () => {
//     setShowLoginModal(true);
//     // Note: chatbot stays open now!
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

//   const handleDashboardClick = () => {
//     setCurrentPage("userDashboard");
//   };

//   const handleBackToMovies = () => {
//     setCurrentPage("home");
//   };

//   const handleNavigateToTheaterManagement = () => {
//     setCurrentPage("theater-management");
//     setEditingTheater(null);
//   };

//   const handleNavigateToAddTheater = () => {
//     setCurrentPage("add-theater");
//     setEditingTheater(null);
//   };

//   const handleNavigateToEditTheater = (theater) => {
//     setCurrentPage("add-theater");
//     setEditingTheater(theater);
//   };

//   const handleBackToTheaterManagement = () => {
//     setCurrentPage("theater-management");
//     setEditingTheater(null);
//   };

//   const handleNavigateToFixShows = () => {
//     setCurrentPage("fix-shows");
//   };

//   const handleBackToAdmin = () => {
//     setCurrentPage("admin");
//   };

//   const handleSaveTheater = async (theaterData) => {
//     try {
//       const backendData = {
//         name: theaterData.name,
//         location: theaterData.location,
//         address: theaterData.address,
//         city: theaterData.city,
//         state: theaterData.state,
//         pincode: theaterData.pincode,
//         phoneNumber: theaterData.phone,
//         email: theaterData.email,
//         numberOfScreens: parseInt(theaterData.screens),
//         totalSeats: parseInt(theaterData.totalSeats),
//         status: theaterData.status.toUpperCase(),
//         facilities: theaterData.facilities || [],
//         shows: theaterData.shows || [],
//         pricing: theaterData.pricing || {},
//       };

//       if (editingTheater) {
//         await updateTheater(editingTheater.id, backendData);
//         alert("Theater updated successfully!");
//       } else {
//         await createTheater(backendData);
//         alert("Theater created successfully!");
//       }

//       handleBackToTheaterManagement();
//     } catch (error) {
//       console.error("Error saving theater:", error);
//       alert("Failed to save theater: " + error.message);
//     }
//   };

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

//   // Admin Pages
//   if (isAdminLoggedIn) {
//     if (currentPage === "theater-management") {
//       return (
//         <>
//           <TheaterManagement
//             onNavigateToAddTheater={handleNavigateToAddTheater}
//             onNavigateToEditTheater={handleNavigateToEditTheater}
//           />
//           {/* Fixed Chatbot - No auto-close */}
//           <FixedChatbotUIMatching
//             onMovieSelect={handleMovieSelect}
//             onNavigateToPage={handleNavigateToPage}
//             isUserLoggedIn={isAdminLoggedIn}
//             onShowLogin={handleShowLogin}
//           />
//         </>
//       );
//     }

//     if (currentPage === "add-theater") {
//       return (
//         <>
//           <AddTheaterPage
//             theater={editingTheater}
//             onBack={handleBackToTheaterManagement}
//             onSave={handleSaveTheater}
//           />
//           <FixedChatbotUIMatching
//             onMovieSelect={handleMovieSelect}
//             onNavigateToPage={handleNavigateToPage}
//             isUserLoggedIn={isAdminLoggedIn}
//             onShowLogin={handleShowLogin}
//           />
//         </>
//       );
//     }

//     if (currentPage === "fix-shows") {
//       return (
//         <>
//           <div>
//             <button
//               onClick={handleBackToAdmin}
//               className="m-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
//             >
//               ← Back to Admin Dashboard
//             </button>
//             <AdminFixShows />
//           </div>
//           <FixedChatbotUIMatching
//             onMovieSelect={handleMovieSelect}
//             onNavigateToPage={handleNavigateToPage}
//             isUserLoggedIn={isAdminLoggedIn}
//             onShowLogin={handleShowLogin}
//           />
//         </>
//       );
//     }

//     return (
//       <>
//         <AdminDashboard
//           onLogout={handleAdminLogout}
//           currentUser={currentUser}
//           onNavigateToTheaterManagement={handleNavigateToTheaterManagement}
//           onNavigateToFixShows={handleNavigateToFixShows}
//         />
//         {/* Fixed Chatbot for admins */}
//         <FixedChatbotUIMatching
//           onMovieSelect={handleMovieSelect}
//           onNavigateToPage={handleNavigateToPage}
//           isUserLoggedIn={isAdminLoggedIn}
//           onShowLogin={handleShowLogin}
//         />
//       </>
//     );
//   }

//   // User Pages
//   return (
//     <div className="App">
//       {currentPage === "home" && (
//         <HomePage
//           onMovieSelect={handleMovieSelect}
//           onLoginClick={handleLoginClick}
//           isUserLoggedIn={isUserLoggedIn}
//           currentUser={currentUser}
//           onUserLogout={handleUserLogout}
//           onDashboardClick={handleDashboardClick}
//         />
//       )}

//       {currentPage === "userDashboard" && isUserLoggedIn && (
//         <UserDashboard
//           currentUser={currentUser}
//           onLogout={handleUserLogout}
//           onBackToMovies={handleBackToMovies}
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
//           onLogin={() => {
//             setShowLoginModal(true);
//           }}
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

//       {currentPage === "test" && <AuthTestComponent />}

//       <LoginModal
//         isOpen={showLoginModal}
//         onClose={handleCloseLoginModal}
//         onAdminLogin={handleAdminLogin}
//         onUserLogin={handleUserLogin}
//       />

//       {/* FIXED Interactive Chatbot - Stays open, matches UI theme */}
//       <FixedChatbotUIMatching
//         onMovieSelect={handleMovieSelect}
//         onNavigateToPage={handleNavigateToPage}
//         isUserLoggedIn={isUserLoggedIn}
//         onShowLogin={handleShowLogin}
//       />
//     </div>
//   );
// };

// export default App;
import React, { useState, useEffect } from "react";
import "./App.css";
import "./utils/debugUtils";

// Import your ENHANCED chatbot with bookings
import EnhancedChatbotWithBookings from "./components/chatbot/EnhancedChatbotWithBookings";

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

  // Enhanced movie selection handler that can be triggered by chatbot
  const handleMovieSelect = (movie) => {
    console.log("Movie selected from chatbot:", movie);
    setSelectedMovie(movie);
    setCurrentPage("booking");
    // Note: chatbot stays open now!
  };

  // Enhanced navigation handler for chatbot
  const handleNavigateToPage = (pageName) => {
    console.log("Navigating to page:", pageName);
    switch (pageName) {
      case "home":
        setCurrentPage("home");
        setSelectedMovie(null);
        setBookingData(null);
        break;
      case "userDashboard":
        if (isUserLoggedIn) {
          setCurrentPage("userDashboard");
        } else {
          setShowLoginModal(true);
        }
        break;
      case "admin":
        if (isAdminLoggedIn) {
          setCurrentPage("admin");
        }
        break;
      default:
        setCurrentPage("home");
    }
    // Note: chatbot stays open now!
  };

  // Show login modal handler for chatbot
  const handleShowLogin = () => {
    setShowLoginModal(true);
    // Note: chatbot stays open now!
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
        <>
          <TheaterManagement
            onNavigateToAddTheater={handleNavigateToAddTheater}
            onNavigateToEditTheater={handleNavigateToEditTheater}
          />
          {/* Enhanced Chatbot with bookings */}
          <EnhancedChatbotWithBookings
            onMovieSelect={handleMovieSelect}
            onNavigateToPage={handleNavigateToPage}
            isUserLoggedIn={isAdminLoggedIn}
            onShowLogin={handleShowLogin}
            currentUser={currentUser}
          />
        </>
      );
    }

    if (currentPage === "add-theater") {
      return (
        <>
          <AddTheaterPage
            theater={editingTheater}
            onBack={handleBackToTheaterManagement}
            onSave={handleSaveTheater}
          />
          <EnhancedChatbotWithBookings
            onMovieSelect={handleMovieSelect}
            onNavigateToPage={handleNavigateToPage}
            isUserLoggedIn={isAdminLoggedIn}
            onShowLogin={handleShowLogin}
            currentUser={currentUser}
          />
        </>
      );
    }

    if (currentPage === "fix-shows") {
      return (
        <>
          <div>
            <button
              onClick={handleBackToAdmin}
              className="m-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              ← Back to Admin Dashboard
            </button>
            <AdminFixShows />
          </div>
          <EnhancedChatbotWithBookings
            onMovieSelect={handleMovieSelect}
            onNavigateToPage={handleNavigateToPage}
            isUserLoggedIn={isAdminLoggedIn}
            onShowLogin={handleShowLogin}
            currentUser={currentUser}
          />
        </>
      );
    }

    return (
      <>
        <AdminDashboard
          onLogout={handleAdminLogout}
          currentUser={currentUser}
          onNavigateToTheaterManagement={handleNavigateToTheaterManagement}
          onNavigateToFixShows={handleNavigateToFixShows}
        />
        {/* Enhanced Chatbot for admins */}
        <EnhancedChatbotWithBookings
          onMovieSelect={handleMovieSelect}
          onNavigateToPage={handleNavigateToPage}
          isUserLoggedIn={isAdminLoggedIn}
          onShowLogin={handleShowLogin}
          currentUser={currentUser}
        />
      </>
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
            setShowLoginModal(true);
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

      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onAdminLogin={handleAdminLogin}
        onUserLogin={handleUserLogin}
      />

      {/* ENHANCED Interactive Chatbot with Bookings & Profile Navigation */}
      <EnhancedChatbotWithBookings
        onMovieSelect={handleMovieSelect}
        onNavigateToPage={handleNavigateToPage}
        isUserLoggedIn={isUserLoggedIn}
        onShowLogin={handleShowLogin}
        currentUser={currentUser}
      />
    </div>
  );
};

export default App;
