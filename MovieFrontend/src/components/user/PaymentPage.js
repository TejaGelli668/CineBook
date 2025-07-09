// import React, { useState } from "react";
// import { ChevronLeft, CreditCard, Coffee } from "lucide-react";
// // Remove the hardcoded beverageCategories array and add:
// import {
//   beverageCategories,
//   getBeverageItemById,
// } from "../../data/beveragesData";

// const PaymentPage = ({ bookingData, onBack, onPaymentComplete }) => {
//   const [paymentMethod, setPaymentMethod] = useState("card");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [cardDetails, setCardDetails] = useState({
//     cardNumber: "",
//     expiryDate: "",
//     cvv: "",
//     cardHolder: "",
//   });

//   // Get beverage items from booking data
//   // Replace the getBeverageItems function with:
//   const getBeverageItems = () => {
//     if (
//       !bookingData.beverages ||
//       Object.keys(bookingData.beverages).length === 0
//     ) {
//       return [];
//     }

//     const items = [];
//     Object.entries(bookingData.beverages).forEach(([itemId, quantity]) => {
//       const item = getBeverageItemById(itemId); // Use helper function

//       if (item && quantity > 0) {
//         items.push({
//           ...item,
//           quantity,
//           totalPrice: item.price * quantity,
//         });
//       }
//     });

//     return items;
//   };
//   const beverageItems = getBeverageItems();
//   const hasBeverages = beverageItems.length > 0;

//   // Calculate breakdown
//   const ticketPrice = bookingData.ticketPrice || 0;
//   const beveragePrice = bookingData.beveragePrice || 0;
//   const convenienceFee = Math.round((ticketPrice + beveragePrice) * 0.02);
//   const totalPrice =
//     bookingData.totalPrice || ticketPrice + beveragePrice + convenienceFee;

//   const handlePayment = () => {
//     setIsProcessing(true);

//     // Simulate payment processing
//     setTimeout(() => {
//       setIsProcessing(false);
//       onPaymentComplete({
//         ...bookingData,
//         paymentMethod,
//         paymentStatus: "completed",
//         paymentId: `PAY_${Date.now()}`,
//       });
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
//           {/* Enhanced Booking Summary */}
//           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//             <h3 className="text-xl font-bold text-white mb-6">
//               Booking Summary
//             </h3>

//             <div className="space-y-4">
//               {/* Movie Details */}
//               <div className="flex justify-between">
//                 <span className="text-gray-300">Movie</span>
//                 <span className="text-white font-semibold">
//                   {bookingData.movie?.title || "Movie"}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-300">Theater</span>
//                 <span className="text-white">
//                   {bookingData.theater?.name || "Theater"}
//                 </span>
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
//                   {bookingData.seats?.join(", ") || "No seats"}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-300">Number of Tickets</span>
//                 <span className="text-white">
//                   {bookingData.seats?.length || 0}
//                 </span>
//               </div>

//               {/* Beverages Section */}
//               {hasBeverages && (
//                 <div className="border-t border-white/20 pt-4">
//                   <div className="flex items-center gap-2 mb-3">
//                     <Coffee className="w-5 h-5 text-orange-400" />
//                     <span className="text-white font-semibold">
//                       Food & Beverages
//                     </span>
//                   </div>
//                   <div className="space-y-2 ml-7">
//                     {beverageItems.map((item) => (
//                       <div
//                         key={item.id}
//                         className="flex justify-between items-center"
//                       >
//                         <div className="flex items-center gap-2">
//                           <span className="text-lg">{item.image}</span>
//                           <div>
//                             <span className="text-white text-sm">
//                               {item.name}
//                             </span>
//                             <span className="text-gray-400 text-xs ml-2">
//                               x{item.quantity}
//                             </span>
//                           </div>
//                         </div>
//                         <span className="text-white font-medium">
//                           ₹{item.totalPrice}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Price Breakdown */}
//               <div className="border-t border-white/20 pt-4 space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-gray-300">
//                     Tickets ({bookingData.seats?.length || 0})
//                   </span>
//                   <span className="text-white">₹{ticketPrice}</span>
//                 </div>

//                 {hasBeverages && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-300">Food & Beverages</span>
//                     <span className="text-white">₹{beveragePrice}</span>
//                   </div>
//                 )}

//                 <div className="flex justify-between">
//                   <span className="text-gray-300">Convenience Fee</span>
//                   <span className="text-white">₹{convenienceFee}</span>
//                 </div>

//                 <div className="border-t border-white/20 pt-2">
//                   <div className="flex justify-between text-lg">
//                     <span className="text-gray-300 font-semibold">
//                       Total Amount
//                     </span>
//                     <span className="text-green-400 font-bold text-2xl">
//                       ₹{totalPrice}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Special Instructions for Beverages */}
//               {hasBeverages && (
//                 <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mt-4">
//                   <p className="text-orange-300 text-sm">
//                     <span className="font-medium">
//                       📋 Collection Instructions:
//                     </span>
//                     <br />
//                     Please collect your food & beverages from the concession
//                     counter before the movie starts. Show this booking
//                     confirmation.
//                   </p>
//                 </div>
//               )}
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

//             {/* Enhanced Pay Button */}
//             <button
//               onClick={handlePayment}
//               disabled={isProcessing}
//               className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
//             >
//               {isProcessing ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                   <span>Processing Payment...</span>
//                 </>
//               ) : (
//                 <>
//                   <CreditCard className="w-5 h-5" />
//                   <span>Pay ₹{totalPrice}</span>
//                 </>
//               )}
//             </button>

//             {/* Security Info */}
//             <div className="mt-4 text-center">
//               <p className="text-gray-400 text-xs">
//                 🔒 Your payment information is secure and encrypted
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentPage;
import React, { useState, useEffect } from "react";
import { ChevronLeft, Coffee, CreditCard } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  beverageCategories,
  getBeverageItemById,
} from "../../data/beveragesData";

// ✅ Using your actual Stripe publishable key
const stripePromise = loadStripe(
  "use your stripe key here" // Replace with your actual Stripe publishable key
);

// Stripe Checkout Form Component
const StripeCheckoutForm = ({ bookingData, onPaymentSuccess, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // ✅ NEW: Extend locks again right before payment confirmation
      console.log("🔒 Extending seat locks before payment confirmation...");
      try {
        const extendResponse = await fetch(
          "http://localhost:8080/api/seats/extend-lock",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
            body: JSON.stringify({
              showId: bookingData.showId,
              seatNumbers: bookingData.seats,
            }),
          }
        );

        if (extendResponse.ok) {
          console.log("✅ Seat locks extended before payment confirmation");
        } else {
          console.warn(
            "⚠️ Failed to extend seat locks before payment, but continuing"
          );
        }
      } catch (extendError) {
        console.warn("⚠️ Failed to extend seat locks:", extendError);
        // Continue with payment even if extend fails
      }

      // Submit the form and validate inputs
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        setIsProcessing(false);
        return;
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success`, // Redirect URL after successful payment
        },
        redirect: "if_required", // Only redirect if required
      });

      if (error) {
        setErrorMessage(error.message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful - call our success handler
        onPaymentSuccess({
          paymentId: paymentIntent.id,
          stripePaymentIntentId: paymentIntent.id,
          paymentMethod: "stripe",
          paymentStatus: "completed",
        });
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error("Payment error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Payment Element */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <PaymentElement
          options={{
            appearance: {
              theme: "night", // Dark theme to match your app
              variables: {
                colorPrimary: "#6366f1", // Purple to match your theme
                colorBackground: "rgba(255, 255, 255, 0.05)",
                colorText: "#ffffff",
                colorDanger: "#ef4444",
                fontFamily: "system-ui, sans-serif",
                spacingUnit: "6px",
                borderRadius: "8px",
              },
            },
            layout: {
              type: "tabs",
              defaultCollapsed: false,
            },
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg p-3">
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Pay Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
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
            <span>Pay ₹{totalAmount}</span>
          </>
        )}
      </button>

      {/* Security Info */}
      <div className="text-center">
        <p className="text-gray-400 text-xs">
          🔒 Secured by Stripe • Your payment information is encrypted
        </p>
      </div>
    </form>
  );
};

// Main Payment Page Component
const PaymentPage = ({ bookingData, onBack, onPaymentComplete }) => {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lockExtended, setLockExtended] = useState(false);

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
  const convenienceFee = Math.round((ticketPrice + beveragePrice) * 0.02);
  const totalPrice =
    bookingData.totalPrice || ticketPrice + beveragePrice + convenienceFee;

  // ✅ UPDATED Create Payment Intent with Lock Extension
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError("");

        // ✅ STEP 1: Extend seat locks before payment
        if (bookingData.seats && bookingData.seats.length > 0) {
          try {
            console.log("🔒 Extending seat locks for payment process...");
            const extendResponse = await fetch(
              "http://localhost:8080/api/seats/extend-lock",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                },
                body: JSON.stringify({
                  showId: bookingData.showId,
                  seatNumbers: bookingData.seats,
                }),
              }
            );

            if (extendResponse.ok) {
              const extendResult = await extendResponse.json();
              console.log("✅ Seat locks extended successfully:", extendResult);
              setLockExtended(true);
            } else {
              const extendError = await extendResponse.text();
              console.warn("⚠️ Failed to extend seat locks:", extendError);
              // Show warning but continue with payment
              setError(
                "Warning: Could not extend seat locks. Please complete payment quickly."
              );
            }
          } catch (extendError) {
            console.warn("⚠️ Error extending seat locks:", extendError);
            // Continue with payment even if extend fails
            setError(
              "Warning: Could not extend seat locks. Please complete payment quickly."
            );
          }
        }

        // ✅ STEP 2: Create payment intent
        console.log("🔄 Creating payment intent...");
        console.log("Total price:", totalPrice);
        console.log("Booking data:", bookingData);

        const requestBody = {
          amount: totalPrice * 100, // Stripe expects amount in paise (cents)
          currency: "inr",
          bookingData: {
            movieTitle: bookingData.movie?.title,
            theaterName: bookingData.theater?.name,
            showTime: bookingData.showTime,
            seats: bookingData.seats?.join(", "),
            showDate: bookingData.date,
            showId: bookingData.showId,
            seatNumbers: bookingData.seats,
            foodItems: bookingData.beverages, // Include food items if any
          },
        };

        console.log("📤 Payment intent request body:", requestBody);

        const response = await fetch(
          "http://localhost:8080/api/payments/create-payment-intent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        console.log("📥 Payment intent response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Payment intent API error:", errorText);
          throw new Error(
            `HTTP ${response.status}: ${
              errorText || "Failed to create payment intent"
            }`
          );
        }

        const responseData = await response.json();
        console.log("✅ Payment intent response data:", responseData);

        // ✅ Extract client secret from your ApiResponse format
        if (
          responseData.success &&
          responseData.data &&
          responseData.data.clientSecret
        ) {
          console.log(
            "🔑 Client secret found:",
            responseData.data.clientSecret.substring(0, 20) + "..."
          );
          setClientSecret(responseData.data.clientSecret);

          // Clear any warning errors if payment intent creation succeeds
          if (lockExtended) {
            setError("");
          }
        } else {
          console.error("❌ Invalid response format:", responseData);
          throw new Error(
            responseData.message || "Invalid response format from server"
          );
        }
      } catch (err) {
        console.error("💥 Error creating payment intent:", err);
        setError(`Failed to initialize payment: ${err.message}`);
      } finally {
        setIsLoading(false);
        console.log("🏁 Payment intent creation finished");
      }
    };

    createPaymentIntent();
  }, [totalPrice, bookingData]);

  // ✅ Periodic lock extension during payment process
  useEffect(() => {
    if (!clientSecret || !bookingData.seats?.length) return;

    console.log("⏰ Setting up periodic lock extension...");

    // Extend locks every 8 minutes (before 10-minute expiry)
    const lockExtensionInterval = setInterval(async () => {
      try {
        console.log("🔄 Extending locks (periodic)...");
        const response = await fetch(
          "http://localhost:8080/api/seats/extend-lock",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
            body: JSON.stringify({
              showId: bookingData.showId,
              seatNumbers: bookingData.seats,
            }),
          }
        );

        if (response.ok) {
          console.log("✅ Periodic lock extension successful");
        } else {
          console.warn("⚠️ Periodic lock extension failed");
        }
      } catch (error) {
        console.warn("⚠️ Periodic lock extension error:", error);
      }
    }, 8 * 60 * 1000); // 8 minutes

    return () => {
      console.log("🧹 Cleaning up lock extension interval");
      clearInterval(lockExtensionInterval);
    };
  }, [clientSecret, bookingData.seats, bookingData.showId]);

  // ✅ FIXED handlePaymentSuccess - Direct booking creation after payment
  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      console.log("Payment successful:", paymentResponse);

      // 🔥 DIRECT BOOKING CREATION AFTER PAYMENT SUCCESS
      console.log("Creating booking after successful payment...");

      const bookingRequestBody = {
        showId: bookingData.showId,
        seatNumbers: bookingData.seats,
        paymentIntentId:
          paymentResponse.stripePaymentIntentId || paymentResponse.paymentId,
        paymentMethod: "stripe",
        totalAmount: totalPrice,
      };

      // Include food items if beverages were selected
      if (
        bookingData.beverages &&
        Object.keys(bookingData.beverages).length > 0
      ) {
        bookingRequestBody.foodItems = Object.entries(bookingData.beverages)
          .map(([itemId, quantity]) => ({
            foodItemId: parseInt(itemId),
            quantity: quantity,
          }))
          .filter((item) => item.quantity > 0);
      }

      console.log("Booking request body:", bookingRequestBody);

      const bookingResponse = await fetch(
        "http://localhost:8080/api/seats/book",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
          body: JSON.stringify(bookingRequestBody),
        }
      );

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(
          errorData.message ||
            "Failed to create booking after successful payment"
        );
      }

      const booking = await bookingResponse.json();
      console.log("Booking created successfully after payment:", booking);

      // Call the parent's completion handler
      onPaymentComplete({
        ...bookingData,
        paymentMethod: "stripe",
        paymentStatus: "completed",
        paymentId: paymentResponse.paymentId,
        stripePaymentIntentId: paymentResponse.stripePaymentIntentId,
        bookingId: booking.bookingId,
        bookingDetails: booking,
        paymentDetails: paymentResponse,
      });
    } catch (error) {
      console.error("Failed to create booking after payment:", error);

      // Handle this carefully - payment succeeded but booking failed
      alert(
        "Payment successful but booking creation failed. Please contact support with your payment reference: " +
          paymentResponse.paymentId
      );
    }
  };

  // Debug info
  console.log("🎨 PaymentPage render state:", {
    isLoading,
    error,
    clientSecret: clientSecret ? "Present" : "Missing",
    totalPrice,
    lockExtended,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Initializing payment...</p>
          {lockExtended && (
            <p className="text-green-400 text-sm mt-2">
              ✅ Seat locks extended
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error && !clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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

      {/* DEBUG INFO - Remove this in production */}
      <div className="max-w-4xl mx-auto px-6 py-2">
        <div className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-300 rounded-lg p-3 mb-4">
          <h4 className="font-bold">🐛 Debug Info (Remove in production)</h4>
          <p>Loading: {isLoading ? "Yes" : "No"}</p>
          <p>Error: {error || "None"}</p>
          <p>Client Secret: {clientSecret ? "Present" : "Missing"}</p>
          <p>Lock Extended: {lockExtended ? "Yes" : "No"}</p>
          <p>Total Price: ₹{totalPrice}</p>
          <p>Show ID: {bookingData.showId}</p>
          <p>Seats: {bookingData.seats?.join(", ") || "None"}</p>
        </div>
      </div>

      {/* Warning Message */}
      {error && clientSecret && (
        <div className="max-w-4xl mx-auto px-6 py-2">
          <div className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-300 rounded-lg p-3 mb-4">
            <p className="text-sm">⚠️ {error}</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary - Left Side */}
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

              {/* Lock Status */}
              {lockExtended && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Seat Lock Status</span>
                  <span className="text-green-400 font-medium">
                    🔒 Extended
                  </span>
                </div>
              )}

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

          {/* Stripe Payment Form - Right Side */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">
              Secure Payment
            </h3>

            {clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "night",
                  },
                }}
              >
                <StripeCheckoutForm
                  bookingData={bookingData}
                  onPaymentSuccess={handlePaymentSuccess}
                  totalAmount={totalPrice}
                />
              </Elements>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-400">Payment form not available</p>
                <p className="text-gray-400 text-sm mt-2">
                  Check console for details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
