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
import { Lock } from "lucide-react";
import { TopBar, BookingSteps, Loading, FilmBackdrop } from "../ui/Chrome";
import "./booking.css";
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

// Stripe.js is loaded with the publishable key served by the backend (from .env)
let stripePromise = null;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = fetch("http://localhost:8080/api/payments/config")
      .then((r) => r.json())
      .then((r) => {
        const key = r?.data?.publishableKey;
        if (!key) {
          throw new Error(
            "Stripe publishable key missing: add STRIPE_PUBLISHABLE_KEY (pk_…) to the .env file and restart the backend."
          );
        }
        return loadStripe(key);
      })
      .catch((e) => {
        stripePromise = null; // allow a retry after the key is added
        throw e;
      });
  }
  return stripePromise;
};

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
    <form onSubmit={handleSubmit} className="cb-form">
      <PaymentElement
        options={{
          layout: { type: "tabs", defaultCollapsed: false },
        }}
      />

      {errorMessage && (
        <div className="cb-alert cb-alert--error" role="alert">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="cb-btn cb-btn--stamp cb-btn--lg cb-btn--block"
      >
        {isProcessing ? (
          <>
            <span className="cb-spinner cb-spinner--sm" />
            Processing payment…
          </>
        ) : (
          <>Pay ₹{totalAmount}</>
        )}
      </button>

      <p className="cb-muted cb-small cb-pay__secure">
        <Lock size={14} aria-hidden="true" /> Card details go straight to
        Stripe. CineBook never sees them.
      </p>
    </form>
  );
};

// Main Payment Page Component
const PaymentPage = ({ bookingData, onBack, onPaymentComplete }) => {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lockExtended, setLockExtended] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [stripeError, setStripeError] = useState("");
  const [serverTotal, setServerTotal] = useState(null); // the amount Stripe will actually charge

  useEffect(() => {
    getStripe()
      .then(setStripe)
      .catch((e) => setStripeError(e.message));
  }, []);

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
      const item =
        bookingData.foodItems?.find((f) => f.id === parseInt(itemId)) ||
        getBeverageItemById(itemId);

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

        // Only WHAT is being bought goes to the server; it works out the price itself
        const requestBody = {
          showId: bookingData.showId,
          seatNumbers: bookingData.seats,
          foodItems: Object.entries(bookingData.beverages || {})
            .map(([itemId, quantity]) => ({ foodItemId: parseInt(itemId), quantity }))
            .filter((item) => item.quantity > 0),
        };

        const response = await fetch(
          "http://localhost:8080/api/payments/create-payment-intent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          const errBody = await response.json().catch(() => null);
          if (errBody?.message) throw new Error(errBody.message);
          const errorText = "";
          console.error("❌ Payment intent API error:", errorText);
          throw new Error(
            `HTTP ${response.status}: ${
              errorText || "Failed to create payment intent"
            }`
          );
        }

        const responseData = await response.json();

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
          setServerTotal(responseData.data.amount);

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
        setError(err.message);
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


      const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      };
      const book = () =>
        fetch("http://localhost:8080/api/seats/book", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(bookingRequestBody),
        });

      let bookingResponse = await book();
      if (!bookingResponse.ok) {
        // The payment already went through, so if the seat hold lapsed,
        // hold the same seats again (they're still free) and retry once.
        await fetch("http://localhost:8080/api/seats/lock", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ showId: bookingData.showId, seatNumbers: bookingData.seats }),
        }).catch(() => {});
        bookingResponse = await book();
      }

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
        totalPrice: serverTotal ?? bookingData.totalPrice,
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

      // The payment went through. Unless the server refunded it (seats taken), Stripe's
      // webhook finishes the booking on the server even though this request failed.
      const reason = error?.message || "";
      alert(
        /refund/i.test(reason)
          ? reason
          : "Your payment went through. We're finishing your booking on our side: it will appear in My bookings " +
            "within a minute, and you won't be charged twice. Payment reference: " + paymentResponse.paymentId
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

  const topSub = [bookingData.movie?.title, bookingData.theater?.name]
    .filter(Boolean)
    .join(", ");
  const showDate = bookingData.date
    ? new Date(`${bookingData.date}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "";

  if (isLoading) {
    return (
      <div className="cb-app cb-app--film">
        <FilmBackdrop movie={bookingData.movie} />
        <Loading label="Setting up secure payment" page />
      </div>
    );
  }

  if ((error && !clientSecret) || stripeError) {
    return (
      <div className="cb-app cb-app--film">
        <FilmBackdrop movie={bookingData.movie} />
        <TopBar onBack={onBack} backLabel="Back to seats" title="Pay" sub={topSub} />
        <BookingSteps current="Payment" />
        <main className="cb-main cb-main--narrow">
          <div className="cb-empty">
            <h2 className="cb-h2">Payment couldn't start</h2>
            <p>
              Your seats are still held for a few minutes. Go back and try
              again. If it keeps happening, the cinema's payment setup needs
              attention.
            </p>
            <div className="cb-alert cb-alert--error" style={{ marginBottom: 20 }}>
              <div>
                {stripeError || /api key|stripe/i.test(error)
                  ? "Online payments aren't switched on yet: the cinema's Stripe keys are missing."
                  : error}
                <details className="cb-small" style={{ marginTop: 8 }}>
                  <summary>Technical details</summary>
                  <p style={{ marginTop: 6, wordBreak: "break-word" }}>{stripeError || error}</p>
                </details>
              </div>
            </div>
            <button type="button" className="cb-btn cb-btn--pink" onClick={onBack}>
              Back to seats
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="cb-app cb-app--film">
        <FilmBackdrop movie={bookingData.movie} />
      <TopBar onBack={onBack} backLabel="Back to seats" title="Pay" sub={topSub} />
      <BookingSteps current="Payment" />

      <main className="cb-main">
        <div className="cb-split">
          <section className="cb-panel cb-pay" aria-labelledby="cb-pay-title">
            <h2 id="cb-pay-title" className="cb-h2">
              Pay securely
            </h2>
            <p className="cb-muted cb-pay__lede">
              Your tickets are issued the moment payment goes through.
            </p>

            {error && clientSecret && (
              <div className="cb-alert cb-alert--warn" style={{ marginBottom: 18 }}>
                {error}
              </div>
            )}

            {stripe && (
            <Elements
              stripe={stripe}
              options={{
                clientSecret,
                fonts: [
                  {
                    cssSrc:
                      "https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&display=swap",
                  },
                ],
                appearance: {
                  theme: "night",
                  variables: {
                    colorPrimary: "#f6c4d0",
                    colorBackground: "#1c1535",
                    colorText: "#fff6e9",
                    colorTextSecondary: "#b8b0d6",
                    colorDanger: "#ff8a93",
                    fontFamily: "Archivo, system-ui, sans-serif",
                    borderRadius: "10px",
                    spacingUnit: "5px",
                  },
                  rules: {
                    ".Input": { border: "1px solid rgba(184, 176, 214, 0.36)" },
                    ".Input:focus": {
                      border: "1px solid #ffc94a",
                      boxShadow: "0 0 0 3px rgba(255, 201, 74, 0.18)",
                    },
                    ".Tab--selected": { backgroundColor: "#f6c4d0", color: "#2a1630" },
                  },
                },
              }}
            >
              <StripeCheckoutForm
                bookingData={bookingData}
                onPaymentSuccess={handlePaymentSuccess}
                totalAmount={serverTotal ?? totalPrice}
              />
            </Elements>
            )}
          </section>

          <aside>
            <div className="cb-paper cb-receipt">
              <div className="cb-paper__brand">
                CineBook
                <span lang="te">బిల్లు</span>
              </div>
              <p className="cb-paper__title">
                {bookingData.movie?.title || "Your booking"}
              </p>
              <dl className="cb-fields" style={{ marginTop: 16 }}>
                <div>
                  <dt>Cinema</dt>
                  <dd>{bookingData.theater?.name || "—"}</dd>
                </div>
                <div>
                  <dt>Show</dt>
                  <dd>
                    {showDate}
                    {bookingData.showTime && `, ${bookingData.showTime}`}
                  </dd>
                </div>
              </dl>

              <div className="cb-tear" />

              <p className="cb-receipt__label">
                {bookingData.seats?.length || 0}{" "}
                {bookingData.seats?.length === 1 ? "seat" : "seats"}
              </p>
              <ul className="cb-receipt__seats">
                {(bookingData.seats || []).map((seat) => (
                  <li key={seat}>{seat}</li>
                ))}
              </ul>

              <dl className="cb-kv">
                <div>
                  <dt>Tickets</dt>
                  <dd>₹{ticketPrice}</dd>
                </div>
                {beverageItems.map((item) => (
                  <div key={item.id}>
                    <dt>
                      {item.name} × {item.quantity}
                    </dt>
                    <dd>₹{item.totalPrice}</dd>
                  </div>
                ))}
                {beveragePrice > 0 && beverageItems.length === 0 && (
                  <div>
                    <dt>Snacks</dt>
                    <dd>₹{beveragePrice}</dd>
                  </div>
                )}
                <div>
                  <dt>Convenience fee (2%)</dt>
                  <dd>₹{convenienceFee}</dd>
                </div>
                <div className="cb-kv__total">
                  <dt>Total</dt>
                  <dd>₹{serverTotal ?? totalPrice}</dd>
                </div>
              </dl>

              {beveragePrice > 0 && (
                <p className="cb-muted cb-small" style={{ marginTop: 16 }}>
                  Collect snacks at the canteen counter before the show. Show
                  your ticket.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;
