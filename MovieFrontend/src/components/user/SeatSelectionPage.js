// import React, { useState, useEffect, useCallback } from "react";
// import SockJS from "sockjs-client";
// import { Stomp } from "@stomp/stompjs";
// // Remove the hardcoded beverageCategories array and add:
// import {
//   beverageCategories,
//   getBeverageItemById,
// } from "../../data/beveragesData";
// import {
//   ChevronLeft,
//   CreditCard,
//   AlertCircle,
//   Loader,
//   Plus,
//   Minus,
//   Coffee,
//   ShoppingCart,
// } from "lucide-react";
// import { theaterLayout } from "../../data/sampleData";

// const API_BASE = "http://localhost:8080";

// // Beverages data - you can move this to a separate file

// export default function SeatSelectionPage({
//   bookingData,
//   onBack,
//   onCheckout,
//   isUserLoggedIn,
//   currentUser,
// }) {
//   // Fallback to bookingData.showId or bookingData.show.id
//   const showId =
//     bookingData.showId !== undefined
//       ? bookingData.showId
//       : bookingData.show?.id;

//   const token =
//     localStorage.getItem("userToken") || localStorage.getItem("authToken");

//   // Your existing state
//   const [seatMap, setSeatMap] = useState({});
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [lockedSeats, setLockedSeats] = useState([]); // Track locked seats
//   const [error, setError] = useState(null);
//   const [isLocking, setIsLocking] = useState(false);
//   const [lockExpiresAt, setLockExpiresAt] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [stompClient, setStompClient] = useState(null);
//   const [timeRemaining, setTimeRemaining] = useState("");

//   // New beverages state
//   const [showBeveragesStep, setShowBeveragesStep] = useState(false);
//   const [selectedBeverages, setSelectedBeverages] = useState({});

//   // Debug logging
//   console.log("SeatSelectionPage props:", {
//     showId,
//     bookingData,
//     token: !!token,
//   });

//   // 1. Load initial seats with better error handling
//   const loadSeats = useCallback(async () => {
//     if (!showId) {
//       setError("No show selected.");
//       setIsLoading(false);
//       return;
//     }

//     if (!token) {
//       setError("Please log in to select seats.");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       console.log(`Loading seats for show ${showId}...`);
//       setIsLoading(true);
//       setError(null);

//       const res = await fetch(`${API_BASE}/api/seats/show/${showId}`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(
//           `HTTP ${res.status}: ${errorText || "Failed to load seats"}`
//         );
//       }

//       const body = await res.json();
//       console.log("Full API response for show", showId, ":", body);
//       console.log("Seats data type:", typeof body.seats);
//       console.log("Seats data:", body.seats);
//       console.log("Number of seats:", Object.keys(body.seats || {}).length);

//       if (body.seats && typeof body.seats === "object") {
//         setSeatMap(body.seats);
//       } else {
//         console.warn("Unexpected seat data format:", body);
//         setSeatMap({});
//       }
//     } catch (e) {
//       console.error("Error loading seats:", e);
//       setError(`Failed to load seats: ${e.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [showId, token]);

//   useEffect(() => {
//     loadSeats();
//   }, [loadSeats]);

//   // 2. Subscribe to real-time seat updates with better connection handling
//   useEffect(() => {
//     if (!showId || !token) return;

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
//   }, [showId, token]);

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

//   // 4. Improved seat locking with better error handling
//   const lockSeats = useCallback(
//     async (seatsToLock) => {
//       if (!seatsToLock.length) return;

//       // Remove duplicates
//       const uniqueSeats = [...new Set(seatsToLock)];

//       if (uniqueSeats.length !== seatsToLock.length) {
//         console.warn("Duplicate seats removed:", seatsToLock, "→", uniqueSeats);
//       }

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

//         // Reset selection if locking fails
//         setSelectedSeats([]);
//         setLockedSeats([]);
//         setLockExpiresAt(null);

//         return false;
//       } finally {
//         setIsLocking(false);
//       }
//     },
//     [showId, token]
//   );

//   // 5. Unlock seats function
//   const unlockSeats = useCallback(
//     async (seatsToUnlock) => {
//       if (!seatsToUnlock.length) return;

//       try {
//         console.log("Unlocking seats:", seatsToUnlock);

//         await fetch(`${API_BASE}/api/seats/unlock`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             showId,
//             seatNumbers: seatsToUnlock,
//           }),
//         });

//         console.log("Seats unlocked successfully");
//       } catch (err) {
//         console.error("Failed to unlock seats:", err);
//       }
//     },
//     [showId, token]
//   );

//   // 6. Handle seat selection changes with debounced locking
//   useEffect(() => {
//     const handleSeatChanges = async () => {
//       if (selectedSeats.length === 0) {
//         // If no seats selected, unlock any previously locked seats
//         if (lockedSeats.length > 0) {
//           await unlockSeats(lockedSeats);
//           setLockedSeats([]);
//           setLockExpiresAt(null);
//         }
//         return;
//       }

//       // Check if we need to update locks
//       const seatsToLock = selectedSeats.filter(
//         (seat) => !lockedSeats.includes(seat)
//       );
//       const seatsToUnlock = lockedSeats.filter(
//         (seat) => !selectedSeats.includes(seat)
//       );

//       // Unlock seats that are no longer selected
//       if (seatsToUnlock.length > 0) {
//         await unlockSeats(seatsToUnlock);
//       }

//       // Lock newly selected seats or re-lock all if any changes
//       if (seatsToLock.length > 0 || seatsToUnlock.length > 0) {
//         await lockSeats(selectedSeats);
//       }
//     };

//     // Debounce the lock operation to avoid too frequent API calls
//     const timeoutId = setTimeout(handleSeatChanges, 500);
//     return () => clearTimeout(timeoutId);
//   }, [selectedSeats, lockedSeats, lockSeats, unlockSeats]);

//   // 7. Auto-unlock seats when component unmounts
//   useEffect(() => {
//     return () => {
//       if (lockedSeats.length > 0) {
//         fetch(`${API_BASE}/api/seats/unlock`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             showId,
//             seatNumbers: lockedSeats,
//           }),
//         }).catch((err) =>
//           console.error("Failed to unlock seats on unmount:", err)
//         );
//       }
//     };
//   }, [lockedSeats, showId, token]);

//   // NEW: Beverage functions
//   const updateBeverageQuantity = (itemId, change) => {
//     setSelectedBeverages((prev) => {
//       const current = prev[itemId] || 0;
//       const newQuantity = Math.max(0, current + change);
//       if (newQuantity === 0) {
//         const { [itemId]: removed, ...rest } = prev;
//         return rest;
//       }
//       return { ...prev, [itemId]: newQuantity };
//     });
//   };

//   const getBeverageTotal = () => {
//     return Object.entries(selectedBeverages).reduce(
//       (total, [itemId, quantity]) => {
//         const item = beverageCategories
//           .flatMap((cat) => cat.items)
//           .find((item) => item.id === parseInt(itemId));
//         return total + (item ? item.price * quantity : 0);
//       },
//       0
//     );
//   };

//   // NEW: Enhanced validation function
//   const validateBooking = () => {
//     const errors = [];

//     // Time validation
//     if (timeRemaining === "Expired" || timeRemaining === "00:00") {
//       errors.push("Seat lock has expired. Please select seats again.");
//     }

//     // User validation
//     if (!isUserLoggedIn || !currentUser) {
//       errors.push("Please log in to continue.");
//     }

//     // Seat validation
//     if (!selectedSeats.length) {
//       errors.push("Please select at least one seat.");
//     }

//     // Lock validation
//     if (
//       !lockedSeats.length ||
//       !selectedSeats.every((seat) => lockedSeats.includes(seat))
//     ) {
//       errors.push("Seats are not properly secured. Please try again.");
//     }

//     return errors;
//   };

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
//         <div className="text-center">
//           <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
//           <p className="text-white text-lg">Loading seats...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
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

//   // Helper functions
//   const getSeatStatus = (seatId) => seatMap[seatId]?.status || "AVAILABLE";

//   const toggleSeat = (seatId) => {
//     const status = getSeatStatus(seatId);
//     if (status !== "AVAILABLE") {
//       console.log(`Seat ${seatId} is not available (status: ${status})`);
//       return;
//     }

//     if (isLocking) {
//       console.log("Cannot select seat while locking is in progress");
//       return;
//     }

//     setSelectedSeats((prev) => {
//       const isSelected = prev.includes(seatId);
//       const newSelection = isSelected
//         ? prev.filter((id) => id !== seatId)
//         : [...prev, seatId];

//       console.log(
//         `Seat ${seatId} ${isSelected ? "deselected" : "selected"}:`,
//         newSelection
//       );
//       return newSelection;
//     });
//   };

//   const getSeatIcon = (category) => {
//     switch (category) {
//       case "Royal Recliner":
//         return "👑";
//       case "Royal":
//         return "⭐";
//       case "Club":
//         return "👥";
//       case "Executive":
//         return "🪑";
//       default:
//         return null;
//     }
//   };

//   const getSeatColor = (seatId, category) => {
//     const status = getSeatStatus(seatId);
//     const isWheel = seatMap[seatId]?.wheelchairAccessible;

//     if (status === "BOOKED") {
//       return "bg-red-400 border-red-300 cursor-not-allowed opacity-60";
//     }

//     if (status === "LOCKED") {
//       // Check if locked by current user
//       const isLockedByMe = lockedSeats.includes(seatId);
//       if (isLockedByMe) {
//         return "bg-yellow-400 border-yellow-300 cursor-pointer opacity-80";
//       } else {
//         return "bg-gray-400 border-gray-300 cursor-not-allowed opacity-60";
//       }
//     }

//     if (selectedSeats.includes(seatId)) {
//       return "bg-emerald-500 border-emerald-400 text-white shadow-lg scale-105 cursor-pointer hover:bg-emerald-600";
//     }

//     const categoryColors = {
//       "Royal Recliner":
//         "bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-800",
//       Royal: "bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-800",
//       Club: "bg-orange-100 border-orange-300 hover:bg-orange-200 text-orange-800",
//       Executive:
//         "bg-green-100 border-green-300 hover:bg-green-200 text-green-800",
//     };

//     return `${
//       categoryColors[category] ||
//       "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-800"
//     } cursor-pointer transition-all duration-200 hover:scale-105 ${
//       isWheel ? "ring-2 ring-blue-400" : ""
//     }`;
//   };

//   // Calculate totals
//   const subtotal = selectedSeats.reduce((sum, seatId) => {
//     const row = seatId[0];
//     const catEntry = Object.entries(theaterLayout).find(([_, d]) =>
//       d.rows.some((r) => r.row === row)
//     );
//     return sum + (catEntry ? catEntry[1].price : 0);
//   }, 0);

//   const beverageSubtotal = getBeverageTotal();
//   const fee = Math.round((subtotal + beverageSubtotal) * 0.02);
//   const total = subtotal + beverageSubtotal + fee;

//   // NEW: Handle proceed to beverages
//   const handleProceedToBeverages = () => {
//     const errors = validateBooking();
//     if (errors.length > 0) {
//       alert(errors.join("\n"));
//       return;
//     }
//     setShowBeveragesStep(true);
//   };

//   // NEW: Handle skip beverages (original functionality)
//   const handleSkipBeverages = async () => {
//     const errors = validateBooking();
//     if (errors.length > 0) {
//       alert(errors.join("\n"));
//       return;
//     }

//     try {
//       setIsLocking(true);
//       console.log("Creating booking for seats:", selectedSeats);

//       const res = await fetch(`${API_BASE}/api/seats/book`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           showId,
//           seatNumbers: selectedSeats,
//         }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(
//           errorData.message || `HTTP ${res.status}: Booking failed`
//         );
//       }

//       const body = await res.json();
//       console.log("Booking created successfully:", body);

//       // Clear locked seats since they're now booked
//       setLockedSeats([]);
//       setLockExpiresAt(null);

//       onCheckout({
//         ...bookingData,
//         seats: selectedSeats,
//         beverages: {},
//         ticketPrice: subtotal,
//         beveragePrice: 0,
//         totalPrice: subtotal + Math.round(subtotal * 0.02),
//         bookingResponse: body,
//       });
//     } catch (err) {
//       console.error("Booking failed:", err);
//       alert("Booking failed: " + err.message);
//     } finally {
//       setIsLocking(false);
//     }
//   };

//   // NEW: Handle confirm with beverages
//   const handleConfirmWithBeverages = async () => {
//     const errors = validateBooking();
//     if (errors.length > 0) {
//       alert(errors.join("\n"));
//       return;
//     }

//     try {
//       setIsLocking(true);
//       console.log("Creating booking for seats:", selectedSeats);

//       const res = await fetch(`${API_BASE}/api/seats/book`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           showId,
//           seatNumbers: selectedSeats,
//         }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(
//           errorData.message || `HTTP ${res.status}: Booking failed`
//         );
//       }

//       const body = await res.json();
//       console.log("Booking created successfully:", body);

//       // Clear locked seats since they're now booked
//       setLockedSeats([]);
//       setLockExpiresAt(null);

//       onCheckout({
//         ...bookingData,
//         seats: selectedSeats,
//         beverages: selectedBeverages,
//         ticketPrice: subtotal,
//         beveragePrice: beverageSubtotal,
//         totalPrice: total,
//         bookingResponse: body,
//       });
//     } catch (err) {
//       console.error("Booking failed:", err);
//       alert("Booking failed: " + err.message);
//     } finally {
//       setIsLocking(false);
//     }
//   };

//   // 8. Original booking function (keep for reference)
//   const handleConfirm = async () => {
//     if (!selectedSeats.length) {
//       alert("Please select at least one seat.");
//       return;
//     }

//     if (!lockedSeats.length) {
//       alert("Seats are not properly locked. Please try selecting seats again.");
//       return;
//     }

//     // Check if all selected seats are locked by us
//     const allSeatsLocked = selectedSeats.every((seat) =>
//       lockedSeats.includes(seat)
//     );
//     if (!allSeatsLocked) {
//       alert("Some seats are not locked. Please try again.");
//       return;
//     }

//     try {
//       setIsLocking(true);
//       console.log("Creating booking for seats:", selectedSeats);

//       const res = await fetch(`${API_BASE}/api/seats/book`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           showId,
//           seatNumbers: selectedSeats,
//         }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(
//           errorData.message || `HTTP ${res.status}: Booking failed`
//         );
//       }

//       const body = await res.json();
//       console.log("Booking created successfully:", body);

//       // Clear locked seats since they're now booked
//       setLockedSeats([]);
//       setLockExpiresAt(null);

//       onCheckout({
//         ...bookingData,
//         seats: selectedSeats,
//         totalPrice: subtotal + fee,
//         bookingResponse: body,
//       });
//     } catch (err) {
//       console.error("Booking failed:", err);
//       alert("Booking failed: " + err.message);
//     } finally {
//       setIsLocking(false);
//     }
//   };

//   // NEW: Render beverages step
//   if (showBeveragesStep) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//         {/* Header */}
//         <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
//           <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-4">
//             <button
//               onClick={() => setShowBeveragesStep(false)}
//               className="p-2 hover:bg-white/10 rounded-full transition-colors"
//             >
//               <ChevronLeft className="w-6 h-6 text-white" />
//             </button>
//             <div>
//               <h1 className="text-2xl font-bold text-white">
//                 Add Beverages & Snacks
//               </h1>
//               <p className="text-slate-300 text-sm">
//                 {bookingData.movie?.title || "Movie"} • {selectedSeats.length}{" "}
//                 seats selected
//               </p>
//             </div>
//             <div className="ml-auto text-right">
//               {lockExpiresAt && timeRemaining && (
//                 <p className="text-yellow-300 text-sm font-medium">
//                   🔒 Seats locked: {timeRemaining}
//                 </p>
//               )}
//             </div>
//           </div>
//         </header>

//         <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
//           {/* Beverages Section */}
//           <div className="xl:col-span-3 space-y-6">
//             <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
//               <div className="text-center mb-6">
//                 <h2 className="text-2xl font-bold text-white mb-2">
//                   Enhance Your Experience
//                 </h2>
//                 <p className="text-slate-300">
//                   Add delicious snacks and beverages (Optional)
//                 </p>
//               </div>

//               {beverageCategories.map((category) => (
//                 <div key={category.name} className="mb-8">
//                   <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
//                     <category.icon className="w-6 h-6" />
//                     {category.name}
//                   </h3>

//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {category.items.map((item) => {
//                       const quantity = selectedBeverages[item.id] || 0;

//                       return (
//                         <div
//                           key={item.id}
//                           className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
//                         >
//                           <div className="flex items-center gap-3 mb-3">
//                             <span className="text-3xl">{item.image}</span>
//                             <div className="flex-1">
//                               <h4 className="text-white font-medium">
//                                 {item.name}
//                               </h4>
//                               <p className="text-slate-400 text-sm">
//                                 {item.size}
//                               </p>
//                               <p className="text-emerald-400 font-bold">
//                                 ₹{item.price}
//                               </p>
//                             </div>
//                           </div>

//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-3">
//                               <button
//                                 onClick={() =>
//                                   updateBeverageQuantity(item.id, -1)
//                                 }
//                                 disabled={quantity === 0}
//                                 className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 disabled:bg-gray-500/20 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors"
//                               >
//                                 <Minus className="w-4 h-4" />
//                               </button>

//                               <span className="text-white font-medium w-8 text-center">
//                                 {quantity}
//                               </span>

//                               <button
//                                 onClick={() =>
//                                   updateBeverageQuantity(item.id, 1)
//                                 }
//                                 className="w-8 h-8 bg-emerald-500/20 hover:bg-emerald-500/30 text-white rounded-full flex items-center justify-center transition-colors"
//                               >
//                                 <Plus className="w-4 h-4" />
//                               </button>
//                             </div>

//                             {quantity > 0 && (
//                               <div className="text-right">
//                                 <p className="text-emerald-400 font-bold">
//                                   ₹{item.price * quantity}
//                                 </p>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Summary */}
//           <div className="xl:col-span-1">
//             <div className="sticky top-8 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
//               <h3 className="text-xl font-bold text-white mb-4">
//                 Order Summary
//               </h3>

//               {/* Selected seats */}
//               <div className="mb-4">
//                 <h4 className="text-white font-medium mb-2">Movie Tickets</h4>
//                 {selectedSeats.map((seatId) => {
//                   const row = seatId[0];
//                   const cat = Object.entries(theaterLayout).find(([_, d]) =>
//                     d.rows.some((r) => r.row === row)
//                   );
//                   const price = cat ? cat[1].price : 0;
//                   const categoryName = cat ? cat[0] : "Unknown";

//                   return (
//                     <div
//                       key={seatId}
//                       className="flex justify-between text-sm text-slate-300 mb-1"
//                     >
//                       <span>
//                         Seat {seatId} - {categoryName}
//                       </span>
//                       <span>₹{price}</span>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Selected beverages */}
//               {Object.keys(selectedBeverages).length > 0 && (
//                 <div className="mb-4 border-t border-white/20 pt-4">
//                   <h4 className="text-white font-medium mb-2">
//                     Food & Beverages
//                   </h4>
//                   {Object.entries(selectedBeverages).map(
//                     ([itemId, quantity]) => {
//                       const item = beverageCategories
//                         .flatMap((cat) => cat.items)
//                         .find((item) => item.id === parseInt(itemId));
//                       if (!item) return null;

//                       return (
//                         <div
//                           key={itemId}
//                           className="flex justify-between text-sm text-slate-300 mb-1"
//                         >
//                           <span>
//                             {item.name} x{quantity}
//                           </span>
//                           <span>₹{item.price * quantity}</span>
//                         </div>
//                       );
//                     }
//                   )}
//                 </div>
//               )}

//               {/* Totals */}
//               <div className="border-t border-white/20 pt-4 space-y-2 text-slate-300 mb-6">
//                 <div className="flex justify-between">
//                   <span>Tickets ({selectedSeats.length} seats)</span>
//                   <span>₹{subtotal}</span>
//                 </div>
//                 {beverageSubtotal > 0 && (
//                   <div className="flex justify-between">
//                     <span>Food & Beverages</span>
//                     <span>₹{beverageSubtotal}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between">
//                   <span>Convenience Fee (2%)</span>
//                   <span>₹{fee}</span>
//                 </div>
//                 <div className="flex justify-between text-white font-bold text-lg border-t border-white/20 pt-2">
//                   <span>Total</span>
//                   <span>₹{total}</span>
//                 </div>
//               </div>

//               {/* Action buttons */}
//               <div className="space-y-3">
//                 <button
//                   onClick={handleConfirmWithBeverages}
//                   disabled={isLocking}
//                   className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200"
//                 >
//                   {isLocking ? (
//                     <>
//                       <Loader className="w-5 h-5 animate-spin" />
//                       <span>Processing...</span>
//                     </>
//                   ) : (
//                     <>
//                       <CreditCard className="w-5 h-5" />
//                       Proceed to Payment
//                     </>
//                   )}
//                 </button>

//                 <button
//                   onClick={handleSkipBeverages}
//                   disabled={isLocking}
//                   className="w-full bg-slate-600 hover:bg-slate-700 disabled:bg-gray-600 text-white py-3 rounded-xl font-medium transition-all duration-200"
//                 >
//                   Skip & Continue
//                 </button>
//               </div>

//               <p className="text-slate-400 text-xs text-center mt-3">
//                 Snacks can be collected before the show
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Original seat selection view with enhanced buttons
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//       {/* Header */}
//       <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-4">
//           <button
//             onClick={onBack}
//             className="p-2 hover:bg-white/10 rounded-full transition-colors"
//           >
//             <ChevronLeft className="w-6 h-6 text-white" />
//           </button>
//           <div>
//             <h1 className="text-2xl font-bold text-white">
//               {bookingData.movie?.title || "Movie"}
//             </h1>
//             <p className="text-slate-300 text-sm">
//               {bookingData.theater?.name || "Theater"} • {bookingData.showTime}{" "}
//               • {new Date(bookingData.date).toDateString()}
//             </p>
//           </div>
//           {stompClient?.connected && (
//             <div className="ml-auto flex items-center gap-2 text-green-400 text-sm">
//               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//               Live Updates
//             </div>
//           )}
//         </div>
//       </header>

//       {/* Body */}
//       <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
//         {/* Seats */}
//         <div className="xl:col-span-3 space-y-6">
//           <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
//             <p className="text-center text-white mb-4 font-semibold">
//               Select Your Seats
//             </p>
//             <div className="w-full h-3 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full mb-8" />

//             {/* Show debug info when no seats available */}
//             {Object.keys(seatMap).length === 0 && (
//               <div className="text-center py-8">
//                 <p className="text-yellow-400 mb-2">
//                   ⚠️ No seats found for this show
//                 </p>
//                 <p className="text-slate-400 text-sm">Show ID: {showId}</p>
//                 <p className="text-slate-400 text-sm">
//                   This usually means seats weren't generated for this show.
//                 </p>
//               </div>
//             )}

//             {/* Seats Grid */}
//             {Object.entries(theaterLayout).map(([category, data]) => (
//               <div key={category} className="space-y-3 mb-6">
//                 <div className="flex items-center gap-2 text-sm text-slate-300">
//                   <span className="text-lg">{getSeatIcon(category)}</span>
//                   <span className="font-medium">{category}</span>
//                   <div className="bg-white/10 border border-white/20 text-white text-xs px-2 py-1 rounded">
//                     ₹{data.price}
//                   </div>
//                 </div>
//                 {data.rows.map(({ row, seats }) => (
//                   <div
//                     key={row}
//                     className="flex items-center justify-center gap-2"
//                   >
//                     <span className="w-6 text-center text-sm font-medium text-slate-400">
//                       {row}
//                     </span>
//                     <div className="flex gap-1">
//                       {Array.from({ length: 20 }, (_, i) => {
//                         const num = i + 1;
//                         const seatId = `${row}${num}`;
//                         if (!seats.includes(num))
//                           return <div key={num} className="w-8 h-8" />;

//                         const status = getSeatStatus(seatId);
//                         const isDisabled = status !== "AVAILABLE" || isLocking;

//                         return (
//                           <button
//                             key={seatId}
//                             onClick={() => toggleSeat(seatId)}
//                             disabled={isDisabled}
//                             className={`
//                               w-8 h-8 rounded-md border-2 text-xs font-medium flex items-center justify-center
//                               ${getSeatColor(seatId, category)}
//                               ${num === 7 || num === 14 ? "mr-3" : ""}
//                               ${isLocking ? "opacity-50" : ""}
//                               transition-all duration-200
//                             `}
//                             title={`${seatId} - ${status}${
//                               seatMap[seatId]?.wheelchairAccessible
//                                 ? " (Wheelchair Accessible)"
//                                 : ""
//                             }`}
//                           >
//                             {seatMap[seatId]?.wheelchairAccessible ? "♿" : num}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>

//           {/* Legend */}
//           <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-wrap justify-center gap-6 text-sm">
//             <Legend color="bg-white border-gray-300" label="Available" />
//             <Legend
//               color="bg-emerald-500 border-emerald-400"
//               label="Selected"
//             />
//             <Legend
//               color="bg-red-400 border-red-300 opacity-60"
//               label="Booked"
//             />
//             <Legend
//               color="bg-gray-400 border-gray-300 opacity-60"
//               label="Locked by Others"
//             />
//             <Legend
//               color="bg-yellow-400 border-yellow-300"
//               label="Locked by You"
//             />
//             <Legend
//               color="bg-white border-blue-400 ring-2 ring-blue-400"
//               label="Wheelchair"
//               icon="♿"
//             />
//           </div>
//         </div>

//         {/* Summary */}
//         <div className="xl:col-span-1">
//           <div className="sticky top-8 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
//             <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>

//             {/* Status indicators */}
//             {lockExpiresAt && selectedSeats.length > 0 && timeRemaining && (
//               <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
//                 <p className="text-yellow-300 text-xs font-medium">
//                   🔒 Seats locked for: {timeRemaining}
//                 </p>
//               </div>
//             )}

//             {isLocking && (
//               <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <Loader className="w-4 h-4 animate-spin text-blue-300" />
//                   <p className="text-blue-300 text-xs">Locking seats...</p>
//                 </div>
//               </div>
//             )}

//             {error && (
//               <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
//                 <p className="text-red-300 text-xs">{error}</p>
//               </div>
//             )}

//             {/* Selected seats */}
//             <div className="space-y-4 mb-6">
//               {selectedSeats.length === 0 && (
//                 <p className="text-slate-400 text-center py-4">
//                   No seats selected
//                 </p>
//               )}
//               {selectedSeats.map((seatId) => {
//                 const row = seatId[0];
//                 const cat = Object.entries(theaterLayout).find(([_, d]) =>
//                   d.rows.some((r) => r.row === row)
//                 );
//                 const price = cat ? cat[1].price : 0;
//                 const categoryName = cat ? cat[0] : "Unknown";

//                 return (
//                   <div
//                     key={seatId}
//                     className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
//                   >
//                     <div>
//                       <span className="text-white font-medium">{seatId}</span>
//                       <p className="text-slate-400 text-xs">{categoryName}</p>
//                     </div>
//                     <span className="text-white font-medium">₹{price}</span>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Total calculation */}
//             {selectedSeats.length > 0 && (
//               <div className="border-t border-white/20 pt-4 space-y-2 text-slate-300 mb-6">
//                 <div className="flex justify-between">
//                   <span>Subtotal ({selectedSeats.length} seats)</span>
//                   <span>₹{subtotal}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Convenience Fee (2%)</span>
//                   <span>₹{Math.round(subtotal * 0.02)}</span>
//                 </div>
//                 <div className="flex justify-between text-white font-bold text-lg border-t border-white/20 pt-2">
//                   <span>Total</span>
//                   <span>₹{subtotal + Math.round(subtotal * 0.02)}</span>
//                 </div>
//               </div>
//             )}

//             {/* Enhanced Action buttons */}
//             <div className="space-y-3">
//               <button
//                 onClick={handleProceedToBeverages}
//                 disabled={
//                   !selectedSeats.length ||
//                   !lockedSeats.length ||
//                   isLocking ||
//                   selectedSeats.some((seat) => !lockedSeats.includes(seat))
//                 }
//                 className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200"
//               >
//                 {selectedSeats.length === 0 ? (
//                   "Select Seats"
//                 ) : isLocking ? (
//                   <>
//                     <Loader className="w-5 h-5 animate-spin" />
//                     <span>Locking Seats...</span>
//                   </>
//                 ) : !lockedSeats.length ? (
//                   "Seats not locked"
//                 ) : selectedSeats.some(
//                     (seat) => !lockedSeats.includes(seat)
//                   ) ? (
//                   "Securing seats..."
//                 ) : (
//                   <>
//                     <ShoppingCart className="w-5 h-5" />
//                     <span>Add Snacks & Continue</span>
//                   </>
//                 )}
//               </button>

//               <button
//                 onClick={handleSkipBeverages}
//                 disabled={
//                   !selectedSeats.length ||
//                   !lockedSeats.length ||
//                   isLocking ||
//                   selectedSeats.some((seat) => !lockedSeats.includes(seat))
//                 }
//                 className="w-full bg-slate-600 hover:bg-slate-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200"
//               >
//                 <CreditCard className="w-5 h-5" />
//                 Skip & Go to Payment
//               </button>
//             </div>

//             {/* Help text */}
//             <p className="text-slate-400 text-xs text-center mt-3">
//               Selected seats are automatically locked for 10 minutes
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Legend({ color, label, icon }) {
//   return (
//     <div className="flex items-center gap-2">
//       <div
//         className={`w-4 h-4 ${color} rounded flex items-center justify-center text-xs`}
//       >
//         {icon || ""}
//       </div>
//       <span className="text-slate-300 text-sm">{label}</span>
//     </div>
//   );
// }
import React, { useState, useEffect, useCallback } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import {
  ChevronLeft,
  CreditCard,
  AlertCircle,
  Loader,
  Plus,
  Minus,
  Coffee,
  ShoppingCart,
  Cookie,
  IceCream,
} from "lucide-react";
import { theaterLayout } from "../../data/sampleData";

const API_BASE = "http://localhost:8080";

export default function SeatSelectionPage({
  bookingData,
  onBack,
  onCheckout,
  isUserLoggedIn,
  currentUser,
}) {
  const showId =
    bookingData.showId !== undefined
      ? bookingData.showId
      : bookingData.show?.id;

  const token =
    localStorage.getItem("userToken") || localStorage.getItem("authToken");

  // Your existing state
  const [seatMap, setSeatMap] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [error, setError] = useState(null);
  const [isLocking, setIsLocking] = useState(false);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stompClient, setStompClient] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  // Updated beverages state - using real food items
  const [showBeveragesStep, setShowBeveragesStep] = useState(false);
  const [selectedBeverages, setSelectedBeverages] = useState({});
  const [foodItems, setFoodItems] = useState([]);
  const [foodItemsLoading, setFoodItemsLoading] = useState(false);

  // Debug logging - only log when props actually change
  useEffect(() => {
    console.log("SeatSelectionPage props:", {
      showId,
      bookingData,
      token: !!token,
    });
  }, [showId, bookingData, token]);

  // Mock food items as fallback
  const getMockFoodItems = (theaterId) => {
    return [
      {
        id: 1,
        name: "Classic Popcorn",
        description: "Freshly popped buttery popcorn",
        price: 150,
        category: "SNACKS",
        isAvailable: true,
        theaterId: theaterId || 1,
        imageUrl: null,
      },
      {
        id: 2,
        name: "Coca Cola",
        description: "Refreshing cold drink",
        price: 80,
        category: "BEVERAGES",
        isAvailable: true,
        theaterId: theaterId || 1,
        imageUrl: null,
      },
      {
        id: 3,
        name: "Nachos with Cheese",
        description: "Crispy nachos with melted cheese",
        price: 200,
        category: "SNACKS",
        isAvailable: true,
        theaterId: theaterId || 1,
        imageUrl: null,
      },
      {
        id: 4,
        name: "Hot Coffee",
        description: "Freshly brewed hot coffee",
        price: 100,
        category: "BEVERAGES",
        isAvailable: true,
        theaterId: theaterId || 1,
        imageUrl: null,
      },
      {
        id: 5,
        name: "Ice Cream Sandwich",
        description: "Vanilla ice cream between chocolate cookies",
        price: 120,
        category: "DESSERTS",
        isAvailable: true,
        theaterId: theaterId || 1,
        imageUrl: null,
      },
      {
        id: 6,
        name: "Mineral Water",
        description: "500ml bottled water",
        price: 50,
        category: "BEVERAGES",
        isAvailable: true,
        theaterId: theaterId || 1,
        imageUrl: null,
      },
    ];
  };

  // 🚀 BRAND NEW API HANDLER - HANDLES REAL BACKEND RESPONSE
  const loadFoodItems = useCallback(async () => {
    try {
      setFoodItemsLoading(true);

      console.log("=== 🚀 NEW FOOD ITEMS LOADER ===");
      console.log("Show ID:", showId);
      console.log("Booking data:", bookingData);

      // Try to determine theater ID
      let theaterId = null;
      if (bookingData.theater?.id) {
        theaterId = bookingData.theater.id;
      } else if (bookingData.theaterId) {
        theaterId = bookingData.theaterId;
      }

      console.log("Using theater ID:", theaterId);

      let allItems = [];
      let apiWorked = false;

      // 🎯 Direct API call that we KNOW works from Postman
      try {
        console.log("🔥 Trying WORKING API endpoint from Postman...");
        const response = await fetch(`${API_BASE}/api/food-items`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        console.log(`✅ API Status: ${response.status}`);

        if (response.ok) {
          const apiResponse = await response.json();
          console.log("🎉 RAW API Response:", apiResponse);

          // Handle the REAL backend response format
          if (apiResponse.success && Array.isArray(apiResponse.data)) {
            allItems = apiResponse.data;
            apiWorked = true;
            console.log(
              `🎯 SUCCESS! Got ${allItems.length} items from REAL API`
            );
            console.log(
              "📋 Items:",
              allItems.map((item) => `${item.name} (₹${item.price})`)
            );
          } else {
            console.log("❌ API response format unexpected:", apiResponse);
          }
        } else {
          console.log("❌ API failed with status:", response.status);
        }
      } catch (apiError) {
        console.log("❌ API call failed:", apiError.message);
      }

      // If main API didn't work, try theater-specific (if theater ID exists)
      if (!apiWorked && theaterId) {
        try {
          console.log(
            `🎯 Trying theater-specific API for theater ${theaterId}...`
          );
          const response = await fetch(
            `${API_BASE}/api/food-items/theater/${theaterId}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (response.ok) {
            const apiResponse = await response.json();
            console.log("🎉 Theater API Response:", apiResponse);

            if (apiResponse.success && Array.isArray(apiResponse.data)) {
              allItems = apiResponse.data;
              apiWorked = true;
              console.log(
                `🎯 SUCCESS! Got ${allItems.length} items from theater API`
              );
            }
          }
        } catch (theaterError) {
          console.log("❌ Theater API failed:", theaterError.message);
        }
      }

      // Final fallback to mock data
      if (!apiWorked) {
        console.log("🔄 API didn't work, using mock data...");
        allItems = getMockFoodItems(theaterId);
      }

      // Process the results
      if (Array.isArray(allItems) && allItems.length > 0) {
        // Filter for available items
        const availableItems = allItems.filter((item) => {
          console.log(`Item ${item.name}: isAvailable = ${item.isAvailable}`);
          return item.isAvailable === true;
        });

        console.log("✅ Available items:", availableItems.length);

        // Filter by theater if needed and we have all items
        let finalItems = availableItems;
        if (theaterId && !apiWorked) {
          // Only filter by theater if we're using mock data
          finalItems = availableItems.filter(
            (item) => item.theaterId === theaterId
          );
        }

        console.log("🎉 FINAL items to display:", finalItems.length);
        console.log(
          "📋 Final items:",
          finalItems.map((item) => `${item.name} (₹${item.price})`)
        );
        setFoodItems(finalItems);
      } else {
        console.log("❌ No food items found");
        setFoodItems([]);
      }
    } catch (error) {
      console.error("💥 Failed to load food items:", error);
      // Fix: Define theaterId here for the catch block
      let theaterId = bookingData.theater?.id || bookingData.theaterId || null;
      const mockItems = getMockFoodItems(theaterId);
      setFoodItems(mockItems);
    } finally {
      setFoodItemsLoading(false);
      console.log("=== END FOOD ITEMS LOADER ===");
    }
  }, [showId, bookingData, token]);

  // Load food items when beverages step is shown
  useEffect(() => {
    if (showBeveragesStep) {
      loadFoodItems();
    }
  }, [showBeveragesStep, loadFoodItems]);

  // Group food items by category
  const groupedFoodItems = React.useMemo(() => {
    console.log("Grouping food items:", foodItems);

    const grouped = foodItems.reduce((acc, item) => {
      const category = item.category || "OTHER";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    console.log("Grouped food items:", grouped);
    return grouped;
  }, [foodItems]);

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case "BEVERAGES":
        return Coffee;
      case "SNACKS":
        return Cookie;
      case "DESSERTS":
        return IceCream;
      default:
        return Coffee;
    }
  };

  // Get category display name
  const getCategoryDisplayName = (category) => {
    switch (category) {
      case "BEVERAGES":
        return "Beverages";
      case "SNACKS":
        return "Snacks";
      case "DESSERTS":
        return "Desserts";
      default:
        return category;
    }
  };

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
      console.log("Full API response for show", showId, ":", body);

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

  // 2. Subscribe to real-time seat updates
  useEffect(() => {
    if (!showId || !token) return;

    console.log("Setting up WebSocket connection...");
    const socket = new SockJS(`${API_BASE}/ws`);
    const client = Stomp.over(socket);

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

    if (!updateTimer()) return;

    const interval = setInterval(() => {
      if (!updateTimer()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  // 4. Seat locking functions
  const lockSeats = useCallback(
    async (seatsToLock) => {
      if (!seatsToLock.length) return;

      const uniqueSeats = [...new Set(seatsToLock)];

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

  // 6. Handle seat selection changes
  useEffect(() => {
    const handleSeatChanges = async () => {
      if (selectedSeats.length === 0) {
        if (lockedSeats.length > 0) {
          await unlockSeats(lockedSeats);
          setLockedSeats([]);
          setLockExpiresAt(null);
        }
        return;
      }

      const seatsToLock = selectedSeats.filter(
        (seat) => !lockedSeats.includes(seat)
      );
      const seatsToUnlock = lockedSeats.filter(
        (seat) => !selectedSeats.includes(seat)
      );

      if (seatsToUnlock.length > 0) {
        await unlockSeats(seatsToUnlock);
      }

      if (seatsToLock.length > 0 || seatsToUnlock.length > 0) {
        await lockSeats(selectedSeats);
      }
    };

    const timeoutId = setTimeout(handleSeatChanges, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedSeats, lockedSeats, lockSeats, unlockSeats]);

  // 7. Auto-unlock seats on unmount
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

  // Beverage functions
  const updateBeverageQuantity = (itemId, change) => {
    setSelectedBeverages((prev) => {
      const current = prev[itemId] || 0;
      const newQuantity = Math.max(0, current + change);
      if (newQuantity === 0) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const getBeverageTotal = () => {
    return Object.entries(selectedBeverages).reduce(
      (total, [itemId, quantity]) => {
        const item = foodItems.find((item) => item.id === parseInt(itemId));
        return total + (item ? item.price * quantity : 0);
      },
      0
    );
  };

  // Validation function
  const validateBooking = () => {
    const errors = [];

    if (timeRemaining === "Expired" || timeRemaining === "00:00") {
      errors.push("Seat lock has expired. Please select seats again.");
    }

    if (!isUserLoggedIn || !currentUser) {
      errors.push("Please log in to continue.");
    }

    if (!selectedSeats.length) {
      errors.push("Please select at least one seat.");
    }

    if (
      !lockedSeats.length ||
      !selectedSeats.every((seat) => lockedSeats.includes(seat))
    ) {
      errors.push("Seats are not properly secured. Please try again.");
    }

    return errors;
  };

  // Handle proceed to beverages
  const handleProceedToBeverages = () => {
    const errors = validateBooking();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }
    setShowBeveragesStep(true);
  };

  // Handle skip beverages
  const handleSkipBeverages = async () => {
    const errors = validateBooking();
    if (errors.length > 0) {
      alert(errors.join("\n"));
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

      setLockedSeats([]);
      setLockExpiresAt(null);

      const subtotal = selectedSeats.reduce((sum, seatId) => {
        const row = seatId[0];
        const catEntry = Object.entries(theaterLayout).find(([_, d]) =>
          d.rows.some((r) => r.row === row)
        );
        return sum + (catEntry ? catEntry[1].price : 0);
      }, 0);

      onCheckout({
        ...bookingData,
        seats: selectedSeats,
        beverages: {},
        ticketPrice: subtotal,
        beveragePrice: 0,
        totalPrice: subtotal + Math.round(subtotal * 0.02),
        bookingResponse: body,
      });
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed: " + err.message);
    } finally {
      setIsLocking(false);
    }
  };

  // Handle confirm with beverages
  const handleConfirmWithBeverages = async () => {
    const errors = validateBooking();
    if (errors.length > 0) {
      alert(errors.join("\n"));
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

      setLockedSeats([]);
      setLockExpiresAt(null);

      const subtotal = selectedSeats.reduce((sum, seatId) => {
        const row = seatId[0];
        const catEntry = Object.entries(theaterLayout).find(([_, d]) =>
          d.rows.some((r) => r.row === row)
        );
        return sum + (catEntry ? catEntry[1].price : 0);
      }, 0);

      const beverageSubtotal = getBeverageTotal();
      const fee = Math.round((subtotal + beverageSubtotal) * 0.02);
      const total = subtotal + beverageSubtotal + fee;

      onCheckout({
        ...bookingData,
        seats: selectedSeats,
        beverages: selectedBeverages,
        ticketPrice: subtotal,
        beveragePrice: beverageSubtotal,
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

  const beverageSubtotal = getBeverageTotal();
  const fee = Math.round((subtotal + beverageSubtotal) * 0.02);
  const total = subtotal + beverageSubtotal + fee;

  // Render beverages step
  if (showBeveragesStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-4">
            <button
              onClick={() => setShowBeveragesStep(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Add Food & Beverages
              </h1>
              <p className="text-slate-300 text-sm">
                {bookingData.movie?.title || "Movie"} • {selectedSeats.length}{" "}
                seats selected
              </p>
            </div>
            <div className="ml-auto text-right">
              {lockExpiresAt && timeRemaining && (
                <p className="text-yellow-300 text-sm font-medium">
                  🔒 Seats locked: {timeRemaining}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Food Items Section */}
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Enhance Your Experience
                </h2>
                <p className="text-slate-300">
                  Add delicious snacks and beverages (Optional)
                </p>
                {/* Show data source indicator */}
                {foodItems.length > 0 && (
                  <div className="mt-2 text-xs">
                    {foodItems[0].id <= 6 ? (
                      <div className="text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-1 inline-block">
                        ⚠️ Demo menu - API temporarily unavailable
                      </div>
                    ) : (
                      <div className="text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-1 inline-block">
                        ✅ Live menu from API
                      </div>
                    )}
                  </div>
                )}
              </div>

              {foodItemsLoading ? (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
                  <p className="text-white">Loading menu...</p>
                </div>
              ) : Object.keys(groupedFoodItems).length === 0 ? (
                <div className="text-center py-8">
                  <Coffee className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-400 mb-2">
                    No food items available
                  </h3>
                  <p className="text-slate-500 mb-4">
                    The concession stand menu is currently unavailable.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={loadFoodItems}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={async () => {
                        console.log("🔍 Starting API diagnosis...");
                        console.log("API Base:", API_BASE);
                        console.log("Token exists:", !!token);
                        console.log(
                          "Theater ID:",
                          bookingData.theater?.id || bookingData.theaterId
                        );

                        // Test basic connectivity
                        try {
                          const response = await fetch(
                            `${API_BASE}/api/food-items`
                          );
                          console.log(
                            "Basic API test status:",
                            response.status
                          );
                          console.log("Basic API test headers:", [
                            ...response.headers.entries(),
                          ]);
                          const text = await response.text();
                          console.log("Basic API response:", text);
                        } catch (error) {
                          console.log("Basic API test failed:", error);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Test API
                    </button>
                  </div>
                </div>
              ) : (
                Object.entries(groupedFoodItems).map(([category, items]) => {
                  const CategoryIcon = getCategoryIcon(category);

                  return (
                    <div key={category} className="mb-8">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <CategoryIcon className="w-6 h-6" />
                        {getCategoryDisplayName(category)}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => {
                          const quantity = selectedBeverages[item.id] || 0;

                          return (
                            <div
                              key={item.id}
                              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                            >
                              {/* Item Image */}
                              <div className="h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextElementSibling.style.display =
                                        "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`flex items-center justify-center w-full h-full ${
                                    item.imageUrl ? "hidden" : "flex"
                                  }`}
                                >
                                  <CategoryIcon className="w-8 h-8 text-slate-400" />
                                </div>
                              </div>

                              <div className="mb-3">
                                <h4 className="text-white font-medium">
                                  {item.name}
                                </h4>
                                {item.description && (
                                  <p className="text-slate-400 text-sm line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                                <p className="text-emerald-400 font-semibold text-lg">
                                  ₹{item.price}
                                </p>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() =>
                                      updateBeverageQuantity(item.id, -1)
                                    }
                                    disabled={quantity === 0}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                  >
                                    <Minus className="w-4 h-4 text-white" />
                                  </button>

                                  <span className="text-white font-medium min-w-[2rem] text-center">
                                    {quantity}
                                  </span>

                                  <button
                                    onClick={() =>
                                      updateBeverageQuantity(item.id, 1)
                                    }
                                    className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center transition-colors"
                                  >
                                    <Plus className="w-4 h-4 text-white" />
                                  </button>
                                </div>

                                {quantity > 0 && (
                                  <div className="text-right">
                                    <p className="text-emerald-400 font-semibold">
                                      ₹{(item.price * quantity).toFixed(2)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 sticky top-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Order Summary
              </h3>

              {/* Selected Seats */}
              <div className="mb-6">
                <h4 className="text-white font-medium mb-2">Selected Seats</h4>
                <div className="space-y-1">
                  {selectedSeats.map((seatId) => {
                    const row = seatId[0];
                    const catEntry = Object.entries(theaterLayout).find(
                      ([_, d]) => d.rows.some((r) => r.row === row)
                    );
                    const price = catEntry ? catEntry[1].price : 0;

                    return (
                      <div
                        key={seatId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-slate-300">Seat {seatId}</span>
                        <span className="text-white">₹{price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Food Items */}
              {Object.keys(selectedBeverages).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-2">
                    Food & Beverages
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(selectedBeverages).map(
                      ([itemId, quantity]) => {
                        const item = foodItems.find(
                          (item) => item.id === parseInt(itemId)
                        );
                        if (!item) return null;

                        return (
                          <div
                            key={itemId}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-slate-300">
                              {item.name} x{quantity}
                            </span>
                            <span className="text-white">
                              ₹{(item.price * quantity).toFixed(2)}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Ticket Subtotal</span>
                  <span className="text-white">₹{subtotal.toFixed(2)}</span>
                </div>

                {beverageSubtotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Food & Beverages</span>
                    <span className="text-white">
                      ₹{beverageSubtotal.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Convenience Fee (2%)</span>
                  <span className="text-white">₹{fee.toFixed(2)}</span>
                </div>

                <div className="border-t border-white/10 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-emerald-400">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleConfirmWithBeverages}
                  disabled={isLocking}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLocking ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  Proceed to Payment
                </button>

                <button
                  onClick={handleSkipBeverages}
                  disabled={isLocking}
                  className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Skip & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main seat selection view
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
            <h1 className="text-2xl font-bold text-white">Select Seats</h1>
            <p className="text-slate-300 text-sm">
              {bookingData.movie?.title || "Movie"} •{" "}
              {bookingData.showtime || "Showtime"}
            </p>
          </div>
          <div className="ml-auto text-right">
            {lockExpiresAt && timeRemaining && (
              <p className="text-yellow-300 text-sm font-medium">
                🔒 Seats locked: {timeRemaining}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Theater Layout */}
        <div className="xl:col-span-3">
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
            {/* Screen */}
            <div className="text-center mb-8">
              <div className="w-full h-4 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full mb-2"></div>
              <p className="text-white font-medium">SCREEN</p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span className="text-slate-300">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 border border-emerald-400 rounded"></div>
                <span className="text-slate-300">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 border border-yellow-300 rounded"></div>
                <span className="text-slate-300">Locked by You</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 border border-red-300 rounded"></div>
                <span className="text-slate-300">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 border border-gray-300 rounded"></div>
                <span className="text-slate-300">Locked by Others</span>
              </div>
            </div>

            {/* Seat Layout */}
            <div className="space-y-6">
              {Object.entries(theaterLayout).map(([category, categoryData]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      {getSeatIcon(category)} {category} - ₹{categoryData.price}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {categoryData.rows.map((rowData) => (
                      <div
                        key={rowData.row}
                        className="flex items-center justify-center gap-2"
                      >
                        <span className="text-slate-400 text-sm font-medium w-8">
                          {rowData.row}
                        </span>

                        <div className="flex gap-1">
                          {rowData.seats.map((seatNum) => {
                            const seatId = `${rowData.row}${seatNum}`;
                            const isWheelchair =
                              seatMap[seatId]?.wheelchairAccessible;

                            return (
                              <button
                                key={seatId}
                                onClick={() => toggleSeat(seatId)}
                                disabled={
                                  getSeatStatus(seatId) === "BOOKED" ||
                                  (getSeatStatus(seatId) === "LOCKED" &&
                                    !lockedSeats.includes(seatId)) ||
                                  isLocking
                                }
                                className={`w-8 h-8 rounded text-xs font-medium border transition-all duration-200 relative ${getSeatColor(
                                  seatId,
                                  category
                                )}`}
                                title={`Seat ${seatId}${
                                  isWheelchair ? " (Wheelchair Accessible)" : ""
                                } - ${getSeatStatus(seatId)}`}
                              >
                                {seatNum}
                                {isWheelchair && (
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <span className="text-slate-400 text-sm font-medium w-8 text-right">
                          {rowData.row}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 sticky top-8">
            <h3 className="text-xl font-bold text-white mb-4">
              Booking Summary
            </h3>

            {/* Movie Details */}
            <div className="mb-6">
              <h4 className="text-white font-medium mb-2">Movie Details</h4>
              <div className="space-y-1 text-sm">
                <p className="text-slate-300">
                  {bookingData.movie?.title || "Movie Title"}
                </p>
                <p className="text-slate-400">
                  {bookingData.showtime || "Showtime"}
                </p>
                <p className="text-slate-400">
                  {bookingData.theater?.name || "Theater"}
                </p>
              </div>
            </div>

            {/* Selected Seats */}
            {selectedSeats.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white font-medium mb-2">
                  Selected Seats ({selectedSeats.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {selectedSeats.map((seatId) => (
                    <span
                      key={seatId}
                      className="bg-emerald-600 text-white text-xs px-2 py-1 rounded"
                    >
                      {seatId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            {selectedSeats.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white font-medium mb-2">Price Breakdown</h4>
                <div className="space-y-2 text-sm">
                  {selectedSeats.map((seatId) => {
                    const row = seatId[0];
                    const catEntry = Object.entries(theaterLayout).find(
                      ([_, d]) => d.rows.some((r) => r.row === row)
                    );
                    const price = catEntry ? catEntry[1].price : 0;
                    const category = catEntry ? catEntry[0] : "Unknown";

                    return (
                      <div key={seatId} className="flex justify-between">
                        <span className="text-slate-300">
                          {seatId} ({category})
                        </span>
                        <span className="text-white">₹{price}</span>
                      </div>
                    );
                  })}

                  <div className="border-t border-white/10 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Subtotal</span>
                      <span className="text-white">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">
                        Convenience Fee (2%)
                      </span>
                      <span className="text-white">
                        ₹{Math.round(subtotal * 0.02).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold mt-1">
                      <span className="text-white">Total</span>
                      <span className="text-emerald-400">
                        ₹{(subtotal + Math.round(subtotal * 0.02)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {selectedSeats.length > 0 ? (
                <>
                  <button
                    onClick={handleProceedToBeverages}
                    disabled={isLocking || timeRemaining === "Expired"}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isLocking ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Coffee className="w-4 h-4" />
                    )}
                    Add Food & Beverages
                  </button>

                  <button
                    onClick={handleSkipBeverages}
                    disabled={isLocking || timeRemaining === "Expired"}
                    className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isLocking ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    Skip & Pay Now
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm mb-2">
                    Please select at least one seat to continue
                  </p>
                  <div className="text-slate-500 text-xs">
                    Click on available seats to select them
                  </div>
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 text-xs text-slate-500 space-y-1">
              <p>• Seats are automatically locked when selected</p>
              <p>• Lock expires in 10 minutes if not booked</p>
              <p>• Blue dot indicates wheelchair accessible seats</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
