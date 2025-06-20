// import React, { useState } from "react";
// import { ChevronLeft, Star, Clock, MapPin, CreditCard } from "lucide-react";
// import {
//   theaterLayout,
//   soldSeats,
//   wheelchairSeats,
// } from "../../data/sampleData";

// const SeatSelectionPage = ({ bookingData, onBack, onCheckout }) => {
//   const [selectedSeats, setSelectedSeats] = useState([]);

//   const toggleSeat = (seatId) => {
//     if (soldSeats.includes(seatId)) return;

//     setSelectedSeats((prev) =>
//       prev.includes(seatId)
//         ? prev.filter((id) => id !== seatId)
//         : [...prev, seatId]
//     );
//   };

//   const getSeatStatus = (seatId) => {
//     if (soldSeats.includes(seatId)) return "sold";
//     if (selectedSeats.includes(seatId)) return "selected";
//     return "available";
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
//     const isWheelchair = wheelchairSeats.includes(seatId);

//     if (status === "sold") {
//       return "bg-gray-400 border-gray-300 cursor-not-allowed opacity-60";
//     }
//     if (status === "selected") {
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
//       categoryColors[category]
//     } cursor-pointer transition-all duration-200 hover:scale-105 ${
//       isWheelchair ? "ring-2 ring-blue-400" : ""
//     }`;
//   };

//   const total = selectedSeats.reduce((sum, seatId) => {
//     const row = seatId[0];
//     const category = Object.entries(theaterLayout).find(([_, data]) =>
//       data.rows.some((r) => r.row === row)
//     );
//     return sum + (category ? category[1].price : 0);
//   }, 0);

//   const handleProceedToPayment = () => {
//     if (selectedSeats.length > 0) {
//       onCheckout({
//         ...bookingData,
//         seats: selectedSeats,
//         totalPrice: total + Math.round(total * 0.02),
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
//               {bookingData.movie.title}
//             </h1>
//             <p className="text-slate-300 text-sm">
//               {bookingData.theater.name} • {bookingData.showTime} •{" "}
//               {new Date(bookingData.date).toDateString()}
//             </p>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
//           <div className="xl:col-span-3">
//             <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl">
//               <div className="text-center p-6">
//                 <div className="flex items-center justify-center gap-2 text-white mb-4">
//                   <span className="text-lg font-semibold">
//                     Select Your Seats
//                   </span>
//                 </div>
//                 <div className="relative">
//                   <div className="w-full h-3 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full mb-2"></div>
//                   <p className="text-xs text-slate-400 mb-8">
//                     All eyes this way please!
//                   </p>
//                 </div>
//               </div>

//               <div className="p-6 space-y-8">
//                 {Object.entries(theaterLayout).map(([category, data]) => (
//                   <div key={category} className="space-y-3">
//                     <div className="flex items-center gap-2 text-sm text-slate-300">
//                       <span className="text-lg">{getSeatIcon(category)}</span>
//                       <span className="font-medium">{category}</span>
//                       <div className="bg-white/10 border border-white/20 text-white text-xs px-2 py-1 rounded">
//                         ₹{data.price}
//                       </div>
//                     </div>

//                     {data.rows.map(({ row, seats }) => (
//                       <div
//                         key={row}
//                         className="flex items-center justify-center gap-2"
//                       >
//                         <span className="w-6 text-center text-sm font-medium text-slate-400">
//                           {row}
//                         </span>
//                         <div className="flex gap-1">
//                           {Array.from({ length: 20 }, (_, i) => {
//                             const seatNumber = i + 1;
//                             const seatId = `${row}${seatNumber}`;
//                             const seatExists = seats.includes(seatNumber);
//                             const isWheelchair =
//                               wheelchairSeats.includes(seatId);

//                             if (!seatExists) {
//                               return (
//                                 <div key={seatNumber} className="w-8 h-8" />
//                               );
//                             }

//                             return (
//                               <button
//                                 key={seatId}
//                                 onClick={() => toggleSeat(seatId)}
//                                 disabled={soldSeats.includes(seatId)}
//                                 className={`
//                                   w-8 h-8 rounded-md border-2 text-xs font-medium flex items-center justify-center
//                                   ${getSeatColor(seatId, category)}
//                                   ${
//                                     seatNumber === 7 || seatNumber === 14
//                                       ? "mr-3"
//                                       : ""
//                                   }
//                                 `}
//                                 title={
//                                   isWheelchair
//                                     ? "Wheelchair Accessible"
//                                     : seatId
//                                 }
//                               >
//                                 {isWheelchair ? "♿" : seatNumber}
//                               </button>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="mt-6 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
//               <div className="flex flex-wrap justify-center gap-6 text-sm">
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
//                   <span className="text-slate-300">Available</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-emerald-500 border-2 border-emerald-400 rounded"></div>
//                   <span className="text-slate-300">Selected</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-gray-400 border-2 border-gray-300 rounded opacity-60"></div>
//                   <span className="text-slate-300">Sold</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-white border-2 border-blue-400 ring-2 ring-blue-400 rounded flex items-center justify-center text-xs">
//                     ♿
//                   </div>
//                   <span className="text-slate-300">Wheelchair Accessible</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="xl:col-span-1">
//             <div className="sticky top-8 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl">
//               <div className="p-6">
//                 <h3 className="text-xl font-bold text-white mb-4">
//                   Order Summary
//                 </h3>
//               </div>
//               <div className="px-6 pb-6 space-y-4">
//                 {selectedSeats.map((seatId) => {
//                   const row = seatId[0];
//                   const category = Object.entries(theaterLayout).find(
//                     ([_, data]) => data.rows.some((r) => r.row === row)
//                   );
//                   const price = category ? category[1].price : 0;

//                   return (
//                     <div
//                       key={seatId}
//                       className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
//                     >
//                       <div className="flex items-center gap-2">
//                         <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-medium">
//                           {seatId}
//                         </div>
//                         <span className="text-sm text-slate-300">
//                           {category?.[0]}
//                         </span>
//                       </div>
//                       <span className="font-medium text-white">₹{price}</span>
//                     </div>
//                   );
//                 })}

//                 {selectedSeats.length === 0 && (
//                   <div className="text-center py-8 text-slate-400">
//                     <div className="text-4xl mb-2">🪑</div>
//                     <p>No seats selected</p>
//                   </div>
//                 )}

//                 {selectedSeats.length > 0 && (
//                   <>
//                     <div className="border-t border-white/20 pt-4">
//                       <div className="space-y-2">
//                         <div className="flex justify-between text-slate-300">
//                           <span>Subtotal ({selectedSeats.length} seats)</span>
//                           <span>₹{total}</span>
//                         </div>
//                         <div className="flex justify-between text-slate-300">
//                           <span>Convenience Fee</span>
//                           <span>₹{Math.round(total * 0.02)}</span>
//                         </div>
//                         <div className="border-t border-white/20 pt-2">
//                           <div className="flex justify-between text-lg font-bold text-white">
//                             <span>Total</span>
//                             <span>₹{total + Math.round(total * 0.02)}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 <button
//                   onClick={handleProceedToPayment}
//                   disabled={selectedSeats.length === 0}
//                   className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
//                 >
//                   {selectedSeats.length === 0 ? (
//                     <span>Select Seats</span>
//                   ) : (
//                     <>
//                       <CreditCard className="w-5 h-5" />
//                       <span>Continue to Checkout</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SeatSelectionPage;
// src/components/user/SeatSelectionPage.js
// src/components/user/SeatSelectionPage.js
import React, { useState, useEffect, useCallback } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { ChevronLeft, CreditCard } from "lucide-react";
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

  const token = localStorage.getItem("userToken");
  const [seatMap, setSeatMap] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState(null);

  // 1. Load initial seats
  const loadSeats = useCallback(async () => {
    if (!showId) {
      setError("No show selected.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/seats/show/${showId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const body = await res.json();
      if (!res.ok) {
        // assume { success:false, message:"...", ... }
        throw new Error(body.message || "Failed to load seats");
      }

      setSeatMap(body.seats || {});
    } catch (e) {
      setError(e.message);
    }
  }, [showId, token]);

  useEffect(() => {
    loadSeats();
  }, [loadSeats]);

  // 2. Subscribe to real-time seat updates
  useEffect(() => {
    if (!showId) return;
    const socket = new SockJS(`${API_BASE}/ws`);
    const client = Stomp.over(socket);

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        client.subscribe(
          `/topic/seat-updates/${showId}`,
          (msg) => {
            const update = JSON.parse(msg.body);
            setSeatMap((prev) => {
              const next = { ...prev };
              update.seatNumbers.forEach((num) => {
                if (next[num]) next[num].status = update.status;
              });
              return next;
            });
          },
          (err) => console.error("STOMP error", err)
        );
      },
      (err) => console.error("WebSocket connect error", err)
    );

    return () => client.disconnect();
  }, [showId, token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Error loading seats: {error}
      </div>
    );
  }

  // helpers
  const getSeatStatus = (seatId) => seatMap[seatId]?.status || "AVAILABLE";

  const toggleSeat = (seatId) => {
    if (getSeatStatus(seatId) !== "AVAILABLE") return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
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
    if (status === "BOOKED" || status === "LOCKED") {
      return "bg-gray-400 border-gray-300 cursor-not-allowed opacity-60";
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
      categoryColors[category]
    } cursor-pointer transition-all duration-200 hover:scale-105 ${
      isWheel ? "ring-2 ring-blue-400" : ""
    }`;
  };

  // calculate totals
  const subtotal = selectedSeats.reduce((sum, seatId) => {
    const row = seatId[0];
    const catEntry = Object.entries(theaterLayout).find(([_, d]) =>
      d.rows.some((r) => r.row === row)
    );
    return sum + (catEntry ? catEntry[1].price : 0);
  }, 0);
  const fee = Math.round(subtotal * 0.02);
  const total = subtotal + fee;

  // 3. Booking
  const handleConfirm = async () => {
    if (!selectedSeats.length) return;
    try {
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
      const body = await res.json();
      if (!res.ok) throw new Error(body.message);
      onCheckout({ ...bookingData, bookingResponse: body });
    } catch (err) {
      alert("Booking failed: " + err.message);
    }
  };

  // render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {bookingData.movie.title}
            </h1>
            <p className="text-slate-300 text-sm">
              {bookingData.theater.name} • {bookingData.showTime} •{" "}
              {new Date(bookingData.date).toDateString()}
            </p>
          </div>
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
            {/* Rows */}
            {Object.entries(theaterLayout).map(([category, data]) => (
              <div key={category} className="space-y-3">
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
                        return (
                          <button
                            key={seatId}
                            onClick={() => toggleSeat(seatId)}
                            disabled={getSeatStatus(seatId) !== "AVAILABLE"}
                            className={`
                              w-8 h-8 rounded-md border-2 text-xs font-medium flex items-center justify-center
                              ${getSeatColor(seatId, category)}
                              ${num === 7 || num === 14 ? "mr-3" : ""}
                            `}
                            title={
                              seatMap[seatId]?.wheelchairAccessible
                                ? "♿"
                                : seatId
                            }
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
              color="bg-gray-400 border-gray-300 opacity-60"
              label="Sold/Locked"
            />
            <Legend
              color="bg-white border-blue-400 ring-2 ring-blue-400"
              label="Wheelchair"
              icon="♿"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="xl:col-span-1 sticky top-8 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
          <div className="space-y-4 mb-6">
            {selectedSeats.length === 0 && (
              <p className="text-slate-400 text-center">No seats selected</p>
            )}
            {selectedSeats.map((seatId) => {
              const row = seatId[0];
              const cat = Object.entries(theaterLayout).find(([_, d]) =>
                d.rows.some((r) => r.row === row)
              );
              const price = cat ? cat[1].price : 0;
              return (
                <div
                  key={seatId}
                  className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                >
                  <span className="text-white">{seatId}</span>
                  <span className="text-white">₹{price}</span>
                </div>
              );
            })}
          </div>
          {selectedSeats.length > 0 && (
            <div className="border-t border-white/20 pt-4 space-y-2 text-slate-300 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee</span>
                <span>₹{fee}</span>
              </div>
              <div className="flex justify-between text-white font-bold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selectedSeats.length}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 text-white py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {selectedSeats.length === 0 ? (
              "Select Seats"
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Continue to Checkout</span>
              </>
            )}
          </button>
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
