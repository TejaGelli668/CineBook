import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { TopBar, BookingSteps, Loading, FilmBackdrop } from "../ui/Chrome";
import "./booking.css";
import { loadStripe } from "@stripe/stripe-js";
import { API_URL } from "../../config";
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
    stripePromise = fetch(`${API_URL}/api/payments/config`)
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
          `${API_URL}/api/seats/extend-lock`,
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
              `${API_URL}/api/seats/extend-lock`,
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
          `${API_URL}/api/payments/create-payment-intent`,
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
          `${API_URL}/api/seats/extend-lock`,
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
        fetch(`${API_URL}/api/seats/book`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(bookingRequestBody),
        });

      let bookingResponse = await book();
      if (!bookingResponse.ok) {
        // The payment already went through, so if the seat hold lapsed,
        // hold the same seats again (they're still free) and retry once.
        await fetch(`${API_URL}/api/seats/lock`, {
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
