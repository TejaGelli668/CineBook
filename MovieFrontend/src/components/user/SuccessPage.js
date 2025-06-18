import React from "react";
import { CheckCircle } from "lucide-react";

const SuccessPage = ({ bookingData, onBackToHome }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center">
      <div className="max-w-md mx-auto px-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-gray-300 mb-6">
            Your tickets have been booked successfully
          </p>

          <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-white font-semibold mb-3">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Movie</span>
                <span className="text-white">{bookingData.movie.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Theater</span>
                <span className="text-white">{bookingData.theater.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Date & Time</span>
                <span className="text-white">
                  {bookingData.showTime},{" "}
                  {new Date(bookingData.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Seats</span>
                <span className="text-white">
                  {bookingData.seats.join(", ")}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-300">Total Paid</span>
                <span className="text-green-400">
                  ₹{bookingData.totalPrice}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all"
          >
            Book More Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
