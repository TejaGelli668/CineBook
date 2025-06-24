// import React, { useState } from "react";
// import { ChevronLeft, CreditCard } from "lucide-react";

// const PaymentPage = ({ bookingData, onBack, onPaymentComplete }) => {
//   const [paymentMethod, setPaymentMethod] = useState("card");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [cardDetails, setCardDetails] = useState({
//     cardNumber: "",
//     expiryDate: "",
//     cvv: "",
//     cardHolder: "",
//   });

//   const handlePayment = () => {
//     setIsProcessing(true);

//     // Simulate payment processing
//     setTimeout(() => {
//       setIsProcessing(false);
//       onPaymentComplete(bookingData);
//     }, 3000);
//   };

//   const formatCardNumber = (value) => {
//     const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
//     const matches = v.match(/\d{4,16}/g);
//     const match = (matches && matches[0]) || "";
//     const parts = [];
//     for (let i = 0, len = match.length; i < len; i += 4) {
//       parts.push(match.substring(i, i + 4));
//     }
//     if (parts.length) {
//       return parts.join(" ");
//     } else {
//       return v;
//     }
//   };

//   const formatExpiryDate = (value) => {
//     const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
//     if (v.length >= 2) {
//       return v.substring(0, 2) + "/" + v.substring(2, 4);
//     }
//     return v;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900">
//       <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-4">
//           <button
//             onClick={onBack}
//             className="p-2 hover:bg-white/10 rounded-full transition-colors"
//           >
//             <ChevronLeft className="w-6 h-6 text-white" />
//           </button>
//           <h1 className="text-2xl font-bold text-white">Payment</h1>
//         </div>
//       </header>

//       <div className="max-w-4xl mx-auto px-6 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Booking Summary */}
//           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//             <h3 className="text-xl font-bold text-white mb-6">
//               Booking Summary
//             </h3>

//             <div className="space-y-4">
//               <div className="flex justify-between">
//                 <span className="text-gray-300">Movie</span>
//                 <span className="text-white font-semibold">
//                   {bookingData.movie.title}
//                 </span>
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
//               <div className="flex justify-between">
//                 <span className="text-gray-300">Number of Tickets</span>
//                 <span className="text-white">{bookingData.seats.length}</span>
//               </div>
//               <div className="border-t border-white/20 pt-4">
//                 <div className="flex justify-between text-lg">
//                   <span className="text-gray-300">Total Amount</span>
//                   <span className="text-green-400 font-bold text-2xl">
//                     ₹{bookingData.totalPrice}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Payment Form */}
//           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//             <h3 className="text-xl font-bold text-white mb-6">
//               Payment Details
//             </h3>

//             {/* Payment Method Selection */}
//             <div className="mb-6">
//               <label className="text-white font-medium mb-3 block">
//                 Payment Method
//               </label>
//               <div className="grid grid-cols-3 gap-3">
//                 <button
//                   onClick={() => setPaymentMethod("card")}
//                   className={`p-3 rounded-lg border text-center transition-all ${
//                     paymentMethod === "card"
//                       ? "border-blue-500 bg-blue-500/20 text-white"
//                       : "border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
//                   }`}
//                 >
//                   Card
//                 </button>
//                 <button
//                   onClick={() => setPaymentMethod("upi")}
//                   className={`p-3 rounded-lg border text-center transition-all ${
//                     paymentMethod === "upi"
//                       ? "border-blue-500 bg-blue-500/20 text-white"
//                       : "border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
//                   }`}
//                 >
//                   UPI
//                 </button>
//                 <button
//                   onClick={() => setPaymentMethod("wallet")}
//                   className={`p-3 rounded-lg border text-center transition-all ${
//                     paymentMethod === "wallet"
//                       ? "border-blue-500 bg-blue-500/20 text-white"
//                       : "border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
//                   }`}
//                 >
//                   Wallet
//                 </button>
//               </div>
//             </div>

//             {/* Card Payment Form */}
//             {paymentMethod === "card" && (
//               <div className="space-y-4 mb-6">
//                 <div>
//                   <label className="text-white font-medium mb-2 block">
//                     Card Holder Name
//                   </label>
//                   <input
//                     type="text"
//                     value={cardDetails.cardHolder}
//                     onChange={(e) =>
//                       setCardDetails((prev) => ({
//                         ...prev,
//                         cardHolder: e.target.value,
//                       }))
//                     }
//                     className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
//                     placeholder="Enter card holder name"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-white font-medium mb-2 block">
//                     Card Number
//                   </label>
//                   <input
//                     type="text"
//                     value={cardDetails.cardNumber}
//                     onChange={(e) =>
//                       setCardDetails((prev) => ({
//                         ...prev,
//                         cardNumber: formatCardNumber(e.target.value),
//                       }))
//                     }
//                     className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
//                     placeholder="1234 5678 9012 3456"
//                     maxLength="19"
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-white font-medium mb-2 block">
//                       Expiry Date
//                     </label>
//                     <input
//                       type="text"
//                       value={cardDetails.expiryDate}
//                       onChange={(e) =>
//                         setCardDetails((prev) => ({
//                           ...prev,
//                           expiryDate: formatExpiryDate(e.target.value),
//                         }))
//                       }
//                       className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
//                       placeholder="MM/YY"
//                       maxLength="5"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-white font-medium mb-2 block">
//                       CVV
//                     </label>
//                     <input
//                       type="text"
//                       value={cardDetails.cvv}
//                       onChange={(e) =>
//                         setCardDetails((prev) => ({
//                           ...prev,
//                           cvv: e.target.value.replace(/\D/g, ""),
//                         }))
//                       }
//                       className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
//                       placeholder="123"
//                       maxLength="3"
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* UPI Payment */}
//             {paymentMethod === "upi" && (
//               <div className="mb-6">
//                 <label className="text-white font-medium mb-2 block">
//                   UPI ID
//                 </label>
//                 <input
//                   type="text"
//                   className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
//                   placeholder="yourname@upi"
//                 />
//               </div>
//             )}

//             {/* Wallet Payment */}
//             {paymentMethod === "wallet" && (
//               <div className="mb-6">
//                 <div className="grid grid-cols-2 gap-3">
//                   <button className="p-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all">
//                     Paytm
//                   </button>
//                   <button className="p-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all">
//                     PhonePe
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Pay Button */}
//             <button
//               onClick={handlePayment}
//               disabled={isProcessing}
//               className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
//             >
//               {isProcessing ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                   <span>Processing...</span>
//                 </>
//               ) : (
//                 <>
//                   <CreditCard className="w-5 h-5" />
//                   <span>Pay ₹{bookingData.totalPrice}</span>
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentPage;
import React, { useState } from "react";
import { ChevronLeft, CreditCard, Coffee } from "lucide-react";
// Remove the hardcoded beverageCategories array and add:
import {
  beverageCategories,
  getBeverageItemById,
} from "../../data/beveragesData";

const PaymentPage = ({ bookingData, onBack, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
  });

  // Get beverage items from booking data
  // Replace the getBeverageItems function with:
  const getBeverageItems = () => {
    if (
      !bookingData.beverages ||
      Object.keys(bookingData.beverages).length === 0
    ) {
      return [];
    }

    const items = [];
    Object.entries(bookingData.beverages).forEach(([itemId, quantity]) => {
      const item = getBeverageItemById(itemId); // Use helper function

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
  const convenienceFee = Math.round((ticketPrice + beveragePrice) * 0.02);
  const totalPrice =
    bookingData.totalPrice || ticketPrice + beveragePrice + convenienceFee;

  const handlePayment = () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete({
        ...bookingData,
        paymentMethod,
        paymentStatus: "completed",
        paymentId: `PAY_${Date.now()}`,
      });
    }, 3000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900">
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Payment</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Booking Summary */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">
              Booking Summary
            </h3>

            <div className="space-y-4">
              {/* Movie Details */}
              <div className="flex justify-between">
                <span className="text-gray-300">Movie</span>
                <span className="text-white font-semibold">
                  {bookingData.movie?.title || "Movie"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Theater</span>
                <span className="text-white">
                  {bookingData.theater?.name || "Theater"}
                </span>
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
                  {bookingData.seats?.join(", ") || "No seats"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Number of Tickets</span>
                <span className="text-white">
                  {bookingData.seats?.length || 0}
                </span>
              </div>

              {/* Beverages Section */}
              {hasBeverages && (
                <div className="border-t border-white/20 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Coffee className="w-5 h-5 text-orange-400" />
                    <span className="text-white font-semibold">
                      Food & Beverages
                    </span>
                  </div>
                  <div className="space-y-2 ml-7">
                    {beverageItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.image}</span>
                          <div>
                            <span className="text-white text-sm">
                              {item.name}
                            </span>
                            <span className="text-gray-400 text-xs ml-2">
                              x{item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="text-white font-medium">
                          ₹{item.totalPrice}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-white/20 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    Tickets ({bookingData.seats?.length || 0})
                  </span>
                  <span className="text-white">₹{ticketPrice}</span>
                </div>

                {hasBeverages && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Food & Beverages</span>
                    <span className="text-white">₹{beveragePrice}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-300">Convenience Fee</span>
                  <span className="text-white">₹{convenienceFee}</span>
                </div>

                <div className="border-t border-white/20 pt-2">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-300 font-semibold">
                      Total Amount
                    </span>
                    <span className="text-green-400 font-bold text-2xl">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Instructions for Beverages */}
              {hasBeverages && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mt-4">
                  <p className="text-orange-300 text-sm">
                    <span className="font-medium">
                      📋 Collection Instructions:
                    </span>
                    <br />
                    Please collect your food & beverages from the concession
                    counter before the movie starts. Show this booking
                    confirmation.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">
              Payment Details
            </h3>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="text-white font-medium mb-3 block">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    paymentMethod === "card"
                      ? "border-blue-500 bg-blue-500/20 text-white"
                      : "border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  Card
                </button>
                <button
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    paymentMethod === "upi"
                      ? "border-blue-500 bg-blue-500/20 text-white"
                      : "border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  UPI
                </button>
                <button
                  onClick={() => setPaymentMethod("wallet")}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    paymentMethod === "wallet"
                      ? "border-blue-500 bg-blue-500/20 text-white"
                      : "border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  Wallet
                </button>
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === "card" && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Card Holder Name
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardHolder}
                    onChange={(e) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        cardHolder: e.target.value,
                      }))
                    }
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter card holder name"
                  />
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={(e) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        cardNumber: formatCardNumber(e.target.value),
                      }))
                    }
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white font-medium mb-2 block">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardDetails.expiryDate}
                      onChange={(e) =>
                        setCardDetails((prev) => ({
                          ...prev,
                          expiryDate: formatExpiryDate(e.target.value),
                        }))
                      }
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  <div>
                    <label className="text-white font-medium mb-2 block">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails((prev) => ({
                          ...prev,
                          cvv: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="123"
                      maxLength="3"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI Payment */}
            {paymentMethod === "upi" && (
              <div className="mb-6">
                <label className="text-white font-medium mb-2 block">
                  UPI ID
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="yourname@upi"
                />
              </div>
            )}

            {/* Wallet Payment */}
            {paymentMethod === "wallet" && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all">
                    Paytm
                  </button>
                  <button className="p-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all">
                    PhonePe
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Pay Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay ₹{totalPrice}</span>
                </>
              )}
            </button>

            {/* Security Info */}
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-xs">
                🔒 Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
