import React, { useState } from "react";
import { ChevronLeft, Star, Clock, MapPin, CreditCard } from "lucide-react";
import {
  theaterLayout,
  soldSeats,
  wheelchairSeats,
} from "../../data/sampleData";

const SeatSelectionPage = ({ bookingData, onBack, onCheckout }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seatId) => {
    if (soldSeats.includes(seatId)) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const getSeatStatus = (seatId) => {
    if (soldSeats.includes(seatId)) return "sold";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
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
    const isWheelchair = wheelchairSeats.includes(seatId);

    if (status === "sold") {
      return "bg-gray-400 border-gray-300 cursor-not-allowed opacity-60";
    }
    if (status === "selected") {
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
      isWheelchair ? "ring-2 ring-blue-400" : ""
    }`;
  };

  const total = selectedSeats.reduce((sum, seatId) => {
    const row = seatId[0];
    const category = Object.entries(theaterLayout).find(([_, data]) =>
      data.rows.some((r) => r.row === row)
    );
    return sum + (category ? category[1].price : 0);
  }, 0);

  const handleProceedToPayment = () => {
    if (selectedSeats.length > 0) {
      onCheckout({
        ...bookingData,
        seats: selectedSeats,
        totalPrice: total + Math.round(total * 0.02),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
              {bookingData.movie.title}
            </h1>
            <p className="text-slate-300 text-sm">
              {bookingData.theater.name} • {bookingData.showTime} •{" "}
              {new Date(bookingData.date).toDateString()}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl">
              <div className="text-center p-6">
                <div className="flex items-center justify-center gap-2 text-white mb-4">
                  <span className="text-lg font-semibold">
                    Select Your Seats
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full h-3 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full mb-2"></div>
                  <p className="text-xs text-slate-400 mb-8">
                    All eyes this way please!
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-8">
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
                            const seatNumber = i + 1;
                            const seatId = `${row}${seatNumber}`;
                            const seatExists = seats.includes(seatNumber);
                            const isWheelchair =
                              wheelchairSeats.includes(seatId);

                            if (!seatExists) {
                              return (
                                <div key={seatNumber} className="w-8 h-8" />
                              );
                            }

                            return (
                              <button
                                key={seatId}
                                onClick={() => toggleSeat(seatId)}
                                disabled={soldSeats.includes(seatId)}
                                className={`
                                  w-8 h-8 rounded-md border-2 text-xs font-medium flex items-center justify-center
                                  ${getSeatColor(seatId, category)}
                                  ${
                                    seatNumber === 7 || seatNumber === 14
                                      ? "mr-3"
                                      : ""
                                  }
                                `}
                                title={
                                  isWheelchair
                                    ? "Wheelchair Accessible"
                                    : seatId
                                }
                              >
                                {isWheelchair ? "♿" : seatNumber}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                  <span className="text-slate-300">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 border-2 border-emerald-400 rounded"></div>
                  <span className="text-slate-300">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 border-2 border-gray-300 rounded opacity-60"></div>
                  <span className="text-slate-300">Sold</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border-2 border-blue-400 ring-2 ring-blue-400 rounded flex items-center justify-center text-xs">
                    ♿
                  </div>
                  <span className="text-slate-300">Wheelchair Accessible</span>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="sticky top-8 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Order Summary
                </h3>
              </div>
              <div className="px-6 pb-6 space-y-4">
                {selectedSeats.map((seatId) => {
                  const row = seatId[0];
                  const category = Object.entries(theaterLayout).find(
                    ([_, data]) => data.rows.some((r) => r.row === row)
                  );
                  const price = category ? category[1].price : 0;

                  return (
                    <div
                      key={seatId}
                      className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-medium">
                          {seatId}
                        </div>
                        <span className="text-sm text-slate-300">
                          {category?.[0]}
                        </span>
                      </div>
                      <span className="font-medium text-white">₹{price}</span>
                    </div>
                  );
                })}

                {selectedSeats.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <div className="text-4xl mb-2">🪑</div>
                    <p>No seats selected</p>
                  </div>
                )}

                {selectedSeats.length > 0 && (
                  <>
                    <div className="border-t border-white/20 pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-slate-300">
                          <span>Subtotal ({selectedSeats.length} seats)</span>
                          <span>₹{total}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Convenience Fee</span>
                          <span>₹{Math.round(total * 0.02)}</span>
                        </div>
                        <div className="border-t border-white/20 pt-2">
                          <div className="flex justify-between text-lg font-bold text-white">
                            <span>Total</span>
                            <span>₹{total + Math.round(total * 0.02)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={handleProceedToPayment}
                  disabled={selectedSeats.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {selectedSeats.length === 0 ? (
                    <span>Select Seats</span>
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
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
