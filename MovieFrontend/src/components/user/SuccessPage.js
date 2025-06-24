// import React from "react";
// import { CheckCircle } from "lucide-react";

// const SuccessPage = ({ bookingData, onBackToHome }) => {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center">
//       <div className="max-w-md mx-auto px-6">
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
//           <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
//             <CheckCircle className="w-12 h-12 text-white" />
//           </div>

//           <h2 className="text-2xl font-bold text-white mb-4">
//             Booking Confirmed!
//           </h2>
//           <p className="text-gray-300 mb-6">
//             Your tickets have been booked successfully
//           </p>

//           <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
//             <h3 className="text-white font-semibold mb-3">Booking Details</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-300">Movie</span>
//                 <span className="text-white">{bookingData.movie.title}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-300">Theater</span>
//                 <span className="text-white">{bookingData.theater.name}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-300">Date & Time</span>
//                 <span className="text-white">
//                   {bookingData.showTime},{" "}
//                   {new Date(bookingData.date).toLocaleDateString()}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-300">Seats</span>
//                 <span className="text-white">
//                   {bookingData.seats.join(", ")}
//                 </span>
//               </div>
//               <div className="flex justify-between font-semibold">
//                 <span className="text-gray-300">Total Paid</span>
//                 <span className="text-green-400">
//                   ₹{bookingData.totalPrice}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={onBackToHome}
//             className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all"
//           >
//             Book More Tickets
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuccessPage;
import React from "react";
import {
  CheckCircle,
  Coffee,
  Download,
  Share,
  Calendar,
  MapPin,
  Clock,
  Ticket,
} from "lucide-react";
import { getBeverageItemById } from "../../data/beveragesData"; // Adjust path as needed

const SuccessPage = ({ bookingData, onBackToHome }) => {
  // Get beverage items from booking data
  const getBeverageItems = () => {
    if (
      !bookingData.beverages ||
      Object.keys(bookingData.beverages).length === 0
    ) {
      return [];
    }

    const items = [];
    Object.entries(bookingData.beverages).forEach(([itemId, quantity]) => {
      const item = getBeverageItemById(itemId);

      if (item && quantity > 0) {
        items.push({
          ...item,
          quantity,
          totalPrice: item.price * quantity,
        });
      }
    });

    return items;
  };

  const beverageItems = getBeverageItems();
  const hasBeverages = beverageItems.length > 0;

  // Calculate breakdown
  const ticketPrice = bookingData.ticketPrice || 0;
  const beveragePrice = bookingData.beveragePrice || 0;
  const totalPrice = bookingData.totalPrice || 0;

  const bookingId =
    bookingData.bookingResponse?.bookingId || `BKG${Date.now()}`;
  const paymentId = bookingData.paymentId || `PAY${Date.now()}`;

  const handleDownload = () => {
    // Simulate ticket download
    alert("Ticket downloaded successfully! Check your downloads folder.");
  };

  const handleShare = () => {
    // Simulate sharing functionality
    if (navigator.share) {
      navigator.share({
        title: `Movie Ticket - ${bookingData.movie?.title}`,
        text: `I just booked tickets for ${bookingData.movie?.title} at ${bookingData.theater?.name}!`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(
        `I just booked tickets for ${bookingData.movie?.title} at ${bookingData.theater?.name}!`
      );
      alert("Booking details copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center shadow-2xl">
          {/* Success Icon with Animation */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-lg">🎉</span>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-4xl font-bold text-white mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-emerald-200 mb-2 text-lg">
            Your tickets have been booked successfully
          </p>
          <p className="text-emerald-300 text-sm mb-8">
            Booking ID: <span className="font-mono font-bold">{bookingId}</span>
          </p>

          {/* Main Booking Details Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 text-left border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="w-6 h-6 text-emerald-400" />
              <h3 className="text-white font-bold text-xl">Booking Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Movie Info */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🎬</span>
                    <span className="text-emerald-300 text-sm font-medium">
                      Movie
                    </span>
                  </div>
                  <p className="text-white font-bold text-lg ml-7">
                    {bookingData.movie?.title || "Movie"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">
                      Theater
                    </span>
                  </div>
                  <p className="text-white font-semibold ml-7">
                    {bookingData.theater?.name || "Theater"}
                  </p>
                </div>
              </div>

              {/* Time & Seat Info */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">
                      Show Time
                    </span>
                  </div>
                  <p className="text-white font-semibold ml-7">
                    {bookingData.showTime} •{" "}
                    {new Date(bookingData.date).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">💺</span>
                    <span className="text-emerald-300 text-sm font-medium">
                      Seats ({bookingData.seats?.length || 0})
                    </span>
                  </div>
                  <p className="text-white font-semibold ml-7">
                    {bookingData.seats?.join(", ") || "No seats"}
                  </p>
                </div>
              </div>
            </div>

            {/* Beverages Section */}
            {hasBeverages && (
              <div className="border-t border-white/20 pt-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Coffee className="w-6 h-6 text-orange-400" />
                  <span className="text-white font-bold text-lg">
                    Food & Beverages
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-8">
                  {beverageItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.image}</span>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {item.name}
                          </p>
                          <p className="text-emerald-300 text-xs">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-white font-bold text-sm">
                        ₹{item.totalPrice}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Collection Instructions */}
                <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 text-lg">📋</span>
                    <div>
                      <p className="text-orange-300 font-medium text-sm mb-1">
                        Collection Instructions:
                      </p>
                      <p className="text-orange-200 text-sm">
                        Please collect your food & beverages from the concession
                        counter before the movie starts. Show this booking
                        confirmation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t border-white/20 pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-300">
                    Tickets ({bookingData.seats?.length || 0})
                  </span>
                  <span className="text-white font-medium">₹{ticketPrice}</span>
                </div>

                {hasBeverages && (
                  <div className="flex justify-between">
                    <span className="text-emerald-300">Food & Beverages</span>
                    <span className="text-white font-medium">
                      ₹{beveragePrice}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-emerald-300">Convenience Fee</span>
                  <span className="text-white font-medium">
                    ₹{Math.round((ticketPrice + beveragePrice) * 0.02)}
                  </span>
                </div>

                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="text-white font-bold">Total Paid</span>
                    <span className="text-green-400 font-bold text-xl">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between text-xs text-emerald-300">
                <span>Payment ID: {paymentId}</span>
                <span>Method: {bookingData.paymentMethod || "Card"}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-xl font-medium transition-all hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-xl font-medium transition-all hover:scale-105"
            >
              <Share className="w-5 h-5" />
              <span>Share</span>
            </button>

            <button
              onClick={() => {
                // Add to calendar functionality
                alert("Event added to calendar!");
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 rounded-xl font-medium transition-all hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              <span>Calendar</span>
            </button>
          </div>

          {/* Main CTA */}
          <button
            onClick={onBackToHome}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-bold text-lg transform hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Ticket className="w-6 h-6" />
            <span>Book More Tickets</span>
          </button>

          {/* Footer Note */}
          <p className="text-emerald-200/60 text-xs mt-4">
            🎬 Thank you for choosing our cinema! Enjoy your movie experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
