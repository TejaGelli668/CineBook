// import React, { useState, useEffect, useCallback } from "react";
// import SockJS from "sockjs-client";
// import { Stomp } from "@stomp/stompjs";
// import { useNavigate } from "react-router-dom";

// import {
//   ChevronLeft,
//   CreditCard,
//   AlertCircle,
//   Loader,
//   LogIn,
//   UserX,
// } from "lucide-react";
// import { theaterLayout } from "../../data/sampleData";

// const API_BASE = "http://localhost:8080";

// export default function SeatSelectionPage({
//   bookingData,
//   onBack,
//   onCheckout,
//   isUserLoggedIn,
//   currentUser,
//   onLogin, // Add this prop for login navigation
// }) {
//   // Fallback to bookingData.showId or bookingData.show.id
//   const showId =
//     bookingData.showId !== undefined
//       ? bookingData.showId
//       : bookingData.show?.id;

//   const token =
//     localStorage.getItem("userToken") || localStorage.getItem("authToken");
//   const [seatMap, setSeatMap] = useState({});
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [lockedSeats, setLockedSeats] = useState([]); // Track locked seats
//   const [error, setError] = useState(null);
//   const [isLocking, setIsLocking] = useState(false);
//   const [lockExpiresAt, setLockExpiresAt] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [stompClient, setStompClient] = useState(null);
//   const [timeRemaining, setTimeRemaining] = useState("");
//   const [authError, setAuthError] = useState(false);

//   // Debug logging
//   console.log("SeatSelectionPage props:", {
//     showId,
//     bookingData,
//     token: !!token,
//     isUserLoggedIn,
//     currentUser: !!currentUser,
//   });

//   // Check authentication status
//   useEffect(() => {
//     if (!token || !isUserLoggedIn) {
//       setAuthError(true);
//       setIsLoading(false);
//       setError("Please log in to select seats.");
//       return;
//     }
//     setAuthError(false);
//   }, [token, isUserLoggedIn]);

//   // 1. Load initial seats with better error handling
//   const loadSeats = useCallback(async () => {
//     if (!showId) {
//       setError("No show selected.");
//       setIsLoading(false);
//       return;
//     }

//     if (!token || !isUserLoggedIn) {
//       setAuthError(true);
//       setError("Please log in to select seats.");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       console.log(`Loading seats for show ${showId}...`);
//       setIsLoading(true);
//       setError(null);
//       setAuthError(false);

//       const res = await fetch(`${API_BASE}/api/seats/show/${showId}`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (res.status === 401 || res.status === 403) {
//         setAuthError(true);
//         setError("Your session has expired. Please log in again.");
//         setIsLoading(false);
//         return;
//       }

//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(
//           `HTTP ${res.status}: ${errorText || "Failed to load seats"}`
//         );
//       }

//       const body = await res.json();
//       console.log("Seats loaded successfully:", body);

//       if (body.seats && typeof body.seats === "object") {
//         setSeatMap(body.seats);
//       } else {
//         console.warn("Unexpected seat data format:", body);
//         setSeatMap({});
//       }
//     } catch (e) {
//       console.error("Error loading seats:", e);
//       if (e.message.includes("401") || e.message.includes("403")) {
//         setAuthError(true);
//         setError("Authentication failed. Please log in again.");
//       } else {
//         setError(`Failed to load seats: ${e.message}`);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }, [showId, token, isUserLoggedIn]);

//   useEffect(() => {
//     if (!authError) {
//       loadSeats();
//     }
//   }, [loadSeats, authError]);

//   // 2. Subscribe to real-time seat updates with better connection handling
//   useEffect(() => {
//     if (!showId || !token || authError) return;

//     console.log("Setting up WebSocket connection...");
//     const socket = new SockJS(`${API_BASE}/ws`);
//     const client = Stomp.over(socket);

//     // Enable debug logging for WebSocket
//     client.debug = (str) => console.log("STOMP:", str);

//     client.connect(
//       { Authorization: `Bearer ${token}` },
//       () => {
//         console.log("WebSocket connected successfully");
//         setStompClient(client);

//         client.subscribe(
//           `/topic/seat-updates/${showId}`,
//           (msg) => {
//             try {
//               const update = JSON.parse(msg.body);
//               console.log("Received seat update:", update);

//               setSeatMap((prev) => {
//                 const next = { ...prev };
//                 update.seatNumbers.forEach((num) => {
//                   if (next[num]) {
//                     next[num].status = update.status;
//                   }
//                 });
//                 return next;
//               });
//             } catch (err) {
//               console.error("Error processing seat update:", err);
//             }
//           },
//           (err) => console.error("STOMP subscription error:", err)
//         );
//       },
//       (err) => {
//         console.error("WebSocket connection error:", err);
//         setStompClient(null);
//       }
//     );

//     return () => {
//       if (client && client.connected) {
//         console.log("Disconnecting WebSocket...");
//         client.disconnect();
//       }
//       setStompClient(null);
//     };
//   }, [showId, token, authError]);

//   // 3. Timer for lock expiration
//   useEffect(() => {
//     if (!lockExpiresAt) {
//       setTimeRemaining("");
//       return;
//     }

//     const updateTimer = () => {
//       const now = new Date();
//       const diff = lockExpiresAt - now;

//       if (diff <= 0) {
//         setTimeRemaining("Expired");
//         setLockExpiresAt(null);
//         setLockedSeats([]);
//         return false;
//       }

//       const minutes = Math.floor(diff / 60000);
//       const seconds = Math.floor((diff % 60000) / 1000);
//       setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
//       return true;
//     };

//     // Update immediately
//     if (!updateTimer()) return;

//     // Update every second
//     const interval = setInterval(() => {
//       if (!updateTimer()) {
//         clearInterval(interval);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [lockExpiresAt]);

//   // Helper functions for seat management
//   const lockSeats = useCallback(
//     async (seatsToLock) => {
//       if (!seatsToLock.length || authError) return;

//       const uniqueSeats = [...new Set(seatsToLock)];

//       try {
//         setIsLocking(true);
//         setError(null);

//         console.log("Locking seats:", uniqueSeats);

//         const lockRes = await fetch(`${API_BASE}/api/seats/lock`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             showId,
//             seatNumbers: uniqueSeats,
//           }),
//         });

//         if (lockRes.status === 401 || lockRes.status === 403) {
//           setAuthError(true);
//           setError("Your session has expired. Please log in again.");
//           return false;
//         }

//         if (!lockRes.ok) {
//           const errorData = await lockRes.json();
//           throw new Error(
//             errorData.message || `HTTP ${lockRes.status}: Failed to lock seats`
//           );
//         }

//         const lockBody = await lockRes.json();
//         console.log("Seats locked successfully:", lockBody);

//         setLockedSeats(uniqueSeats);
//         setLockExpiresAt(new Date(lockBody.expiresAt));

//         return true;
//       } catch (err) {
//         console.error("Error locking seats:", err);
//         setError(`Failed to lock seats: ${err.message}`);

//         setSelectedSeats([]);
//         setLockedSeats([]);
//         setLockExpiresAt(null);

//         return false;
//       } finally {
//         setIsLocking(false);
//       }
//     },
//     [showId, token, authError]
//   );

//   // Rest of the component logic... (keeping existing code for brevity)
//   // [Previous seat selection, unlocking, and booking logic remains the same]

//   // Authentication Error Component
//   if (authError) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
//         <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 max-w-md text-center">
//           <UserX className="w-16 h-16 text-red-400 mx-auto mb-6" />
//           <h3 className="text-red-400 text-xl font-semibold mb-3">
//             Authentication Required
//           </h3>
//           <p className="text-red-300 mb-6">
//             You need to be logged in to select seats. Please log in to continue
//             with your booking.
//           </p>
//           <div className="flex gap-3">
//             <button
//               onClick={onBack}
//               className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
//             >
//               <ChevronLeft className="w-4 h-4" />
//               Go Back
//             </button>
//             <button
//               onClick={() => {
//                 if (onLogin) {
//                   onLogin();
//                 } else {
//                   // Fallback: redirect to login page
//                   window.location.href = "/login";
//                 }
//               }}
//               className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
//             >
//               <LogIn className="w-4 h-4" />
//               Login/Sign up
//             </button>
//           </div>
//           <p className="text-slate-400 text-sm mt-4">
//             Don't have an account? / Sign Up{" "}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
//         <div className="text-center">
//           <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
//           <p className="text-white text-lg">Loading seats...</p>
//           <p className="text-slate-400 text-sm mt-2">
//             Please wait while we fetch available seats
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Error state (non-auth errors)
//   if (error && !authError) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
//         <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
//           <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
//           <h3 className="text-red-400 text-lg font-semibold mb-2">
//             Error Loading Seats
//           </h3>
//           <p className="text-red-300 mb-4">{error}</p>
//           <div className="flex gap-3">
//             <button
//               onClick={onBack}
//               className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//             >
//               Go Back
//             </button>
//             <button
//               onClick={() => {
//                 setError(null);
//                 loadSeats();
//               }}
//               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Rest of your existing component render logic goes here...
//   // (seat grid, legend, booking summary, etc.)

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//       {/* Your existing component JSX */}
//       <div className="text-center text-white p-8">
//         <h2>Seat Selection Component</h2>
//         <p>
//           Authenticated successfully! Seat selection UI would render here...
//         </p>
//         {/* Add your existing seat selection UI here */}
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect, useCallback } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { ChevronLeft, CreditCard, AlertCircle, Loader } from "lucide-react";
import { theaterLayout } from "../../data/sampleData";

const API_BASE = "http://localhost:8080";

export default function SeatSelectionPage({
  bookingData,
  onBack,
  onCheckout,
  isUserLoggedIn,
  currentUser,
}) {
  // Fallback to bookingData.showId or bookingData.show.id
  const showId =
    bookingData.showId !== undefined
      ? bookingData.showId
      : bookingData.show?.id;

  const token =
    localStorage.getItem("userToken") || localStorage.getItem("authToken");
  const [seatMap, setSeatMap] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]); // Track locked seats
  const [error, setError] = useState(null);
  const [isLocking, setIsLocking] = useState(false);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stompClient, setStompClient] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  // Debug logging
  console.log("SeatSelectionPage props:", {
    showId,
    bookingData,
    token: !!token,
  });

  // 1. Load initial seats with better error handling
  const loadSeats = useCallback(async () => {
    if (!showId) {
      setError("No show selected.");
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError("Please log in to select seats.");
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Loading seats for show ${showId}...`);
      setIsLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/api/seats/show/${showId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `HTTP ${res.status}: ${errorText || "Failed to load seats"}`
        );
      }

      const body = await res.json();
      console.log("Seats loaded successfully:", body);

      if (body.seats && typeof body.seats === "object") {
        setSeatMap(body.seats);
      } else {
        console.warn("Unexpected seat data format:", body);
        setSeatMap({});
      }
    } catch (e) {
      console.error("Error loading seats:", e);
      setError(`Failed to load seats: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [showId, token]);

  useEffect(() => {
    loadSeats();
  }, [loadSeats]);

  // 2. Subscribe to real-time seat updates with better connection handling
  useEffect(() => {
    if (!showId || !token) return;

    console.log("Setting up WebSocket connection...");
    const socket = new SockJS(`${API_BASE}/ws`);
    const client = Stomp.over(socket);

    // Enable debug logging for WebSocket
    client.debug = (str) => console.log("STOMP:", str);

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log("WebSocket connected successfully");
        setStompClient(client);

        client.subscribe(
          `/topic/seat-updates/${showId}`,
          (msg) => {
            try {
              const update = JSON.parse(msg.body);
              console.log("Received seat update:", update);

              setSeatMap((prev) => {
                const next = { ...prev };
                update.seatNumbers.forEach((num) => {
                  if (next[num]) {
                    next[num].status = update.status;
                  }
                });
                return next;
              });
            } catch (err) {
              console.error("Error processing seat update:", err);
            }
          },
          (err) => console.error("STOMP subscription error:", err)
        );
      },
      (err) => {
        console.error("WebSocket connection error:", err);
        setStompClient(null);
      }
    );

    return () => {
      if (client && client.connected) {
        console.log("Disconnecting WebSocket...");
        client.disconnect();
      }
      setStompClient(null);
    };
  }, [showId, token]);

  // 3. Timer for lock expiration
  useEffect(() => {
    if (!lockExpiresAt) {
      setTimeRemaining("");
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diff = lockExpiresAt - now;

      if (diff <= 0) {
        setTimeRemaining("Expired");
        setLockExpiresAt(null);
        setLockedSeats([]);
        return false;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      return true;
    };

    // Update immediately
    if (!updateTimer()) return;

    // Update every second
    const interval = setInterval(() => {
      if (!updateTimer()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  // 4. Improved seat locking with better error handling
  const lockSeats = useCallback(
    async (seatsToLock) => {
      if (!seatsToLock.length) return;

      // Remove duplicates
      const uniqueSeats = [...new Set(seatsToLock)];

      if (uniqueSeats.length !== seatsToLock.length) {
        console.warn("Duplicate seats removed:", seatsToLock, "→", uniqueSeats);
      }

      try {
        setIsLocking(true);
        setError(null);

        console.log("Locking seats:", uniqueSeats);

        const lockRes = await fetch(`${API_BASE}/api/seats/lock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            showId,
            seatNumbers: uniqueSeats,
          }),
        });

        if (!lockRes.ok) {
          const errorData = await lockRes.json();
          throw new Error(
            errorData.message || `HTTP ${lockRes.status}: Failed to lock seats`
          );
        }

        const lockBody = await lockRes.json();
        console.log("Seats locked successfully:", lockBody);

        setLockedSeats(uniqueSeats);
        setLockExpiresAt(new Date(lockBody.expiresAt));

        return true;
      } catch (err) {
        console.error("Error locking seats:", err);
        setError(`Failed to lock seats: ${err.message}`);

        // Reset selection if locking fails
        setSelectedSeats([]);
        setLockedSeats([]);
        setLockExpiresAt(null);

        return false;
      } finally {
        setIsLocking(false);
      }
    },
    [showId, token]
  );

  // 5. Unlock seats function
  const unlockSeats = useCallback(
    async (seatsToUnlock) => {
      if (!seatsToUnlock.length) return;

      try {
        console.log("Unlocking seats:", seatsToUnlock);

        await fetch(`${API_BASE}/api/seats/unlock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            showId,
            seatNumbers: seatsToUnlock,
          }),
        });

        console.log("Seats unlocked successfully");
      } catch (err) {
        console.error("Failed to unlock seats:", err);
      }
    },
    [showId, token]
  );

  // 6. Handle seat selection changes with debounced locking
  useEffect(() => {
    const handleSeatChanges = async () => {
      if (selectedSeats.length === 0) {
        // If no seats selected, unlock any previously locked seats
        if (lockedSeats.length > 0) {
          await unlockSeats(lockedSeats);
          setLockedSeats([]);
          setLockExpiresAt(null);
        }
        return;
      }

      // Check if we need to update locks
      const seatsToLock = selectedSeats.filter(
        (seat) => !lockedSeats.includes(seat)
      );
      const seatsToUnlock = lockedSeats.filter(
        (seat) => !selectedSeats.includes(seat)
      );

      // Unlock seats that are no longer selected
      if (seatsToUnlock.length > 0) {
        await unlockSeats(seatsToUnlock);
      }

      // Lock newly selected seats or re-lock all if any changes
      if (seatsToLock.length > 0 || seatsToUnlock.length > 0) {
        await lockSeats(selectedSeats);
      }
    };

    // Debounce the lock operation to avoid too frequent API calls
    const timeoutId = setTimeout(handleSeatChanges, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedSeats, lockedSeats, lockSeats, unlockSeats]);

  // 7. Auto-unlock seats when component unmounts
  useEffect(() => {
    return () => {
      if (lockedSeats.length > 0) {
        fetch(`${API_BASE}/api/seats/unlock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            showId,
            seatNumbers: lockedSeats,
          }),
        }).catch((err) =>
          console.error("Failed to unlock seats on unmount:", err)
        );
      }
    };
  }, [lockedSeats, showId, token]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading seats...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-400 text-lg font-semibold mb-2">
            Error Loading Seats
          </h3>
          <p className="text-red-300 mb-4">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                setError(null);
                loadSeats();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions
  const getSeatStatus = (seatId) => seatMap[seatId]?.status || "AVAILABLE";

  const toggleSeat = (seatId) => {
    const status = getSeatStatus(seatId);
    if (status !== "AVAILABLE") {
      console.log(`Seat ${seatId} is not available (status: ${status})`);
      return;
    }

    if (isLocking) {
      console.log("Cannot select seat while locking is in progress");
      return;
    }

    setSelectedSeats((prev) => {
      const isSelected = prev.includes(seatId);
      const newSelection = isSelected
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId];

      console.log(
        `Seat ${seatId} ${isSelected ? "deselected" : "selected"}:`,
        newSelection
      );
      return newSelection;
    });
  };

  const getSeatIcon = (category) => {
    switch (category) {
      case "Royal Recliner":
        return "👑";
      case "Royal":
        return "⭐";
      case "Club":
        return "👥";
      case "Executive":
        return "🪑";
      default:
        return null;
    }
  };

  const getSeatColor = (seatId, category) => {
    const status = getSeatStatus(seatId);
    const isWheel = seatMap[seatId]?.wheelchairAccessible;

    if (status === "BOOKED") {
      return "bg-red-400 border-red-300 cursor-not-allowed opacity-60";
    }

    if (status === "LOCKED") {
      // Check if locked by current user
      const isLockedByMe = lockedSeats.includes(seatId);
      if (isLockedByMe) {
        return "bg-yellow-400 border-yellow-300 cursor-pointer opacity-80";
      } else {
        return "bg-gray-400 border-gray-300 cursor-not-allowed opacity-60";
      }
    }

    if (selectedSeats.includes(seatId)) {
      return "bg-emerald-500 border-emerald-400 text-white shadow-lg scale-105 cursor-pointer hover:bg-emerald-600";
    }

    const categoryColors = {
      "Royal Recliner":
        "bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-800",
      Royal: "bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-800",
      Club: "bg-orange-100 border-orange-300 hover:bg-orange-200 text-orange-800",
      Executive:
        "bg-green-100 border-green-300 hover:bg-green-200 text-green-800",
    };

    return `${
      categoryColors[category] ||
      "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-800"
    } cursor-pointer transition-all duration-200 hover:scale-105 ${
      isWheel ? "ring-2 ring-blue-400" : ""
    }`;
  };

  // Calculate totals
  const subtotal = selectedSeats.reduce((sum, seatId) => {
    const row = seatId[0];
    const catEntry = Object.entries(theaterLayout).find(([_, d]) =>
      d.rows.some((r) => r.row === row)
    );
    return sum + (catEntry ? catEntry[1].price : 0);
  }, 0);
  const fee = Math.round(subtotal * 0.02);
  const total = subtotal + fee;

  // 8. Improved booking with better validation
  const handleConfirm = async () => {
    if (!selectedSeats.length) {
      alert("Please select at least one seat.");
      return;
    }

    if (!lockedSeats.length) {
      alert("Seats are not properly locked. Please try selecting seats again.");
      return;
    }

    // Check if all selected seats are locked by us
    const allSeatsLocked = selectedSeats.every((seat) =>
      lockedSeats.includes(seat)
    );
    if (!allSeatsLocked) {
      alert("Some seats are not locked. Please try again.");
      return;
    }

    try {
      setIsLocking(true);
      console.log("Creating booking for seats:", selectedSeats);

      const res = await fetch(`${API_BASE}/api/seats/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          showId,
          seatNumbers: selectedSeats,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `HTTP ${res.status}: Booking failed`
        );
      }

      const body = await res.json();
      console.log("Booking created successfully:", body);

      // Clear locked seats since they're now booked
      setLockedSeats([]);
      setLockExpiresAt(null);

      onCheckout({
        ...bookingData,
        seats: selectedSeats,
        totalPrice: total,
        bookingResponse: body,
      });
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed: " + err.message);
    } finally {
      setIsLocking(false);
    }
  };

  // Render component
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {bookingData.movie?.title || "Movie"}
            </h1>
            <p className="text-slate-300 text-sm">
              {bookingData.theater?.name || "Theater"} • {bookingData.showTime}{" "}
              • {new Date(bookingData.date).toDateString()}
            </p>
          </div>
          {stompClient?.connected && (
            <div className="ml-auto flex items-center gap-2 text-green-400 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Live Updates
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Seats */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
            <p className="text-center text-white mb-4 font-semibold">
              Select Your Seats
            </p>
            <div className="w-full h-3 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full mb-8" />

            {/* Seats Grid */}
            {Object.entries(theaterLayout).map(([category, data]) => (
              <div key={category} className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-lg">{getSeatIcon(category)}</span>
                  <span className="font-medium">{category}</span>
                  <div className="bg-white/10 border border-white/20 text-white text-xs px-2 py-1 rounded">
                    ₹{data.price}
                  </div>
                </div>
                {data.rows.map(({ row, seats }) => (
                  <div
                    key={row}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="w-6 text-center text-sm font-medium text-slate-400">
                      {row}
                    </span>
                    <div className="flex gap-1">
                      {Array.from({ length: 20 }, (_, i) => {
                        const num = i + 1;
                        const seatId = `${row}${num}`;
                        if (!seats.includes(num))
                          return <div key={num} className="w-8 h-8" />;

                        const status = getSeatStatus(seatId);
                        const isDisabled = status !== "AVAILABLE" || isLocking;

                        return (
                          <button
                            key={seatId}
                            onClick={() => toggleSeat(seatId)}
                            disabled={isDisabled}
                            className={`
                              w-8 h-8 rounded-md border-2 text-xs font-medium flex items-center justify-center
                              ${getSeatColor(seatId, category)}
                              ${num === 7 || num === 14 ? "mr-3" : ""}
                              ${isLocking ? "opacity-50" : ""}
                              transition-all duration-200
                            `}
                            title={`${seatId} - ${status}${
                              seatMap[seatId]?.wheelchairAccessible
                                ? " (Wheelchair Accessible)"
                                : ""
                            }`}
                          >
                            {seatMap[seatId]?.wheelchairAccessible ? "♿" : num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-wrap justify-center gap-6 text-sm">
            <Legend color="bg-white border-gray-300" label="Available" />
            <Legend
              color="bg-emerald-500 border-emerald-400"
              label="Selected"
            />
            <Legend
              color="bg-red-400 border-red-300 opacity-60"
              label="Booked"
            />
            <Legend
              color="bg-gray-400 border-gray-300 opacity-60"
              label="Locked by Others"
            />
            <Legend
              color="bg-yellow-400 border-yellow-300"
              label="Locked by You"
            />
            <Legend
              color="bg-white border-blue-400 ring-2 ring-blue-400"
              label="Wheelchair"
              icon="♿"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="xl:col-span-1">
          <div className="sticky top-8 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>

            {/* Status indicators */}
            {lockExpiresAt && selectedSeats.length > 0 && timeRemaining && (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-xs font-medium">
                  🔒 Seats locked for: {timeRemaining}
                </p>
              </div>
            )}

            {isLocking && (
              <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-blue-300" />
                  <p className="text-blue-300 text-xs">Locking seats...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            )}

            {/* Selected seats */}
            <div className="space-y-4 mb-6">
              {selectedSeats.length === 0 && (
                <p className="text-slate-400 text-center py-4">
                  No seats selected
                </p>
              )}
              {selectedSeats.map((seatId) => {
                const row = seatId[0];
                const cat = Object.entries(theaterLayout).find(([_, d]) =>
                  d.rows.some((r) => r.row === row)
                );
                const price = cat ? cat[1].price : 0;
                const categoryName = cat ? cat[0] : "Unknown";

                return (
                  <div
                    key={seatId}
                    className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                  >
                    <div>
                      <span className="text-white font-medium">{seatId}</span>
                      <p className="text-slate-400 text-xs">{categoryName}</p>
                    </div>
                    <span className="text-white font-medium">₹{price}</span>
                  </div>
                );
              })}
            </div>

            {/* Total calculation */}
            {selectedSeats.length > 0 && (
              <div className="border-t border-white/20 pt-4 space-y-2 text-slate-300 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({selectedSeats.length} seats)</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience Fee (2%)</span>
                  <span>₹{fee}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg border-t border-white/20 pt-2">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={handleConfirm}
              disabled={
                !selectedSeats.length ||
                !lockedSeats.length ||
                isLocking ||
                selectedSeats.some((seat) => !lockedSeats.includes(seat))
              }
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200"
            >
              {selectedSeats.length === 0 ? (
                "Select Seats"
              ) : isLocking ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Locking Seats...</span>
                </>
              ) : !lockedSeats.length ? (
                "Seats not locked"
              ) : selectedSeats.some((seat) => !lockedSeats.includes(seat)) ? (
                "Securing seats..."
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Continue to Checkout</span>
                </>
              )}
            </button>

            {/* Help text */}
            <p className="text-slate-400 text-xs text-center mt-3">
              Selected seats are automatically locked for 10 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label, icon }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 ${color} rounded flex items-center justify-center text-xs`}
      >
        {icon || ""}
      </div>
      <span className="text-slate-300 text-sm">{label}</span>
    </div>
  );
}
