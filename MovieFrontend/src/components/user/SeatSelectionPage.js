import React, { useState, useEffect, useCallback } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { Plus, Minus, Coffee, Cookie, IceCream } from "lucide-react";
import { TopBar, BookingSteps, Loading, HoldTimer, FilmBackdrop } from "../ui/Chrome";
import SnackArt, { TINT } from "../ui/SnackArt";
import "./booking.css";
import { cinemaNow, parseCinemaTime } from "../../utils/cinemaTime";
import { API_URL, assetUrl } from "../../config";

const API_BASE = API_URL;

export default function SeatSelectionPage({
  bookingData,
  onBack,
  onCheckout,
  isUserLoggedIn,
  currentUser,
  onLogin,
}) {
  const showId =
    bookingData.showId !== undefined
      ? bookingData.showId
      : bookingData.show?.id;

  const token =
    localStorage.getItem("userToken") || localStorage.getItem("authToken");

  // State variables
  const [theaterLayout, setTheaterLayout] = useState({});
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
        if (theaterId) {
          // Items without a theater are sold at every cinema
          finalItems = availableItems.filter(
            (item) => !item.theaterId || item.theaterId === theaterId
          );
          console.log(
            `🏢 Filtered to theater ${theaterId}: ${finalItems.length} items`
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

  // ✅ ADD THIS FUNCTION to convert seat data to layout format:
  const generateTheaterLayoutFromSeats = (seatMap) => {
    const layout = {
      "Royal Recliner": { price: 630, rows: [] },
      Royal: { price: 360, rows: [] },
      Club: { price: 350, rows: [] },
      Executive: { price: 330, rows: [] },
    };

    // Group seats by row
    const rowGroups = {};

    Object.values(seatMap).forEach((seat) => {
      const row = seat.row || seat.seatNumber?.[0];
      const category = seat.category;

      if (!rowGroups[row]) {
        rowGroups[row] = { category, seats: [] };
      }

      const seatNum = parseInt(seat.seatNumber.substring(1));
      if (!isNaN(seatNum)) {
        rowGroups[row].seats.push(seatNum);
      }
    });

    // Convert to layout format
    Object.entries(rowGroups).forEach(([row, data]) => {
      if (layout[data.category]) {
        layout[data.category].rows.push({
          row: row,
          seats: data.seats.sort((a, b) => a - b),
        });
      }
    });

    // Sort rows within each category
    Object.values(layout).forEach((category) => {
      category.rows.sort((a, b) => a.row.localeCompare(b.row));
    });

    return layout;
  };

  // ✅ UPDATED loadSeats function - generates layout from API data
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

        // ✅ ADD THIS: Generate theater layout from seat data
        const generatedLayout = generateTheaterLayoutFromSeats(body.seats);
        setTheaterLayout(generatedLayout);

        console.log("Generated layout:", generatedLayout);
        console.log("Total seats loaded:", Object.keys(body.seats).length);
      } else {
        console.warn("Unexpected seat data format:", body);
        setSeatMap({});
        setTheaterLayout({});
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

    client.debug = () => {}; // frame logs would print the sign-in token

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
      const now = cinemaNow();
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
        setLockExpiresAt(parseCinemaTime(lockBody.expiresAt));

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

  // 7. Release held seats when the customer leaves the seat page, but NOT when
  //    they move on to payment: the payment page keeps those holds alive.
  //    (Refs keep this a true unmount-only cleanup; with lockedSeats as a
  //    dependency it used to fire on every change and race the payment page.)
  const lockedSeatsRef = React.useRef(lockedSeats);
  const checkingOutRef = React.useRef(false);
  const unlockArgsRef = React.useRef({ showId, token });
  useEffect(() => {
    lockedSeatsRef.current = lockedSeats;
    unlockArgsRef.current = { showId, token };
  }, [lockedSeats, showId, token]);
  useEffect(() => {
    return () => {
      const held = lockedSeatsRef.current;
      if (checkingOutRef.current || held.length === 0) return;
      const { showId: sid, token: tk } = unlockArgsRef.current;
      fetch(`${API_BASE}/api/seats/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tk}`,
        },
        body: JSON.stringify({ showId: sid, seatNumbers: held }),
      }).catch((err) => console.error("Failed to unlock seats on unmount:", err));
    };
  }, []);

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

  // ✅ FIXED handleProceedToPayment - No booking creation, just go to payment
  const handleProceedToPayment = () => {
    const errors = validateBooking();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    // Calculate totals
    const subtotal = selectedSeats.reduce((sum, seatId) => {
      const row = seatId[0];
      const catEntry = Object.entries(theaterLayout).find(([_, d]) =>
        d.rows.some((r) => r.row === row)
      );
      return sum + (catEntry ? catEntry[1].price : 0);
    }, 0);

    console.log("Going to payment without beverages");

    // 🔥 GO TO PAYMENT (DON'T CREATE BOOKING YET)
    checkingOutRef.current = true; // keep the seat holds for the payment page
    onCheckout({
      ...bookingData,
      seats: selectedSeats,
      beverages: {}, // Empty beverages
      ticketPrice: subtotal,
      beveragePrice: 0,
      totalPrice: subtotal + Math.round(subtotal * 0.02),
      // ❌ Don't include bookingResponse - payment should happen first
    });
  };

  // ✅ FIXED handleConfirmWithBeverages - No booking creation, just go to payment
  const handleConfirmWithBeverages = () => {
    const errors = validateBooking();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

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

    console.log("Going to payment with beverages:", selectedBeverages);

    // 🔥 GO TO PAYMENT (DON'T CREATE BOOKING YET)
    checkingOutRef.current = true; // keep the seat holds for the payment page
    onCheckout({
      ...bookingData,
      seats: selectedSeats,
      beverages: selectedBeverages, // Include selected beverages
      foodItems, // live menu, so later steps can show names and prices
      ticketPrice: subtotal,
      beveragePrice: beverageSubtotal,
      totalPrice: total,
      // ❌ Don't include bookingResponse - payment should happen first
    });
  };

  const showTimeLabel = bookingData.showTime || bookingData.showtime || "";
  const topSub = [
    bookingData.movie?.title,
    bookingData.theater?.name,
    showTimeLabel,
  ]
    .filter(Boolean)
    .join(", ");

  // Loading state
  if (isLoading) {
    return (
      <div className="cb-app cb-app--film">
        <FilmBackdrop movie={bookingData.movie} />
        <Loading label="Opening the seat map" page />
      </div>
    );
  }

  // Signed-out visitors: seats are held per customer, so ask them to sign in first
  if (error && !token) {
    return (
      <div className="cb-app cb-app--film">
        <FilmBackdrop movie={bookingData.movie} />
        <TopBar onBack={onBack} backLabel="Back to showtimes" title="Choose seats" sub={topSub} />
        <BookingSteps current="Seats" />
        <main className="cb-main cb-main--narrow">
          <div className="cb-empty">
            <h2 className="cb-h2">Sign in to choose seats</h2>
            <p>
              We hold the seats you pick for 10 minutes while you pay, so we
              need to know who they're for. Your show is saved.
            </p>
            <div className="cb-chips">
              {onLogin && (
                <button type="button" className="cb-btn cb-btn--stamp" onClick={onLogin}>
                  Sign in or create account
                </button>
              )}
              <button type="button" className="cb-btn cb-btn--ghost" onClick={onBack}>
                Back to showtimes
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="cb-app cb-app--film">
        <FilmBackdrop movie={bookingData.movie} />
        <TopBar onBack={onBack} backLabel="Back to showtimes" title="Choose seats" sub={topSub} />
        <main className="cb-main cb-main--narrow">
          <div className="cb-empty">
            <h2 className="cb-h2">The seat map didn't load</h2>
            <p>{error}</p>
            <div className="cb-chips">
              <button
                type="button"
                className="cb-btn cb-btn--pink"
                onClick={() => {
                  setError(null);
                  loadSeats();
                }}
              >
                Try again
              </button>
              <button type="button" className="cb-btn cb-btn--ghost" onClick={onBack}>
                Pick another show
              </button>
            </div>
          </div>
        </main>
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

  // Visual state of a seat for the map (drives data-state in booking.css)
  const getSeatState = (seatId) => {
    const status = getSeatStatus(seatId);
    if (status === "BOOKED") return "booked";
    if (status === "LOCKED") {
      return lockedSeats.includes(seatId) ? "held" : "taken";
    }
    return selectedSeats.includes(seatId) ? "selected" : "free";
  };

  const seatLabel = {
    free: "available",
    selected: "selected",
    held: "held for you",
    taken: "held by someone else",
    booked: "sold",
  };

  const priceForSeat = (seatId) => {
    const row = seatId[0];
    const catEntry = Object.entries(theaterLayout).find(([_, d]) =>
      d.rows?.some((r) => r.row === row)
    );
    return catEntry ? { category: catEntry[0], price: catEntry[1].price } : { category: "", price: 0 };
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
  const holdExpired = timeRemaining === "Expired";

  const selectedSnacks = Object.entries(selectedBeverages)
    .map(([itemId, quantity]) => ({
      item: foodItems.find((f) => f.id === parseInt(itemId)),
      quantity,
    }))
    .filter((x) => x.item && x.quantity > 0);

  // The running bill, printed on ticket paper
  const renderReceipt = (withSnacks, children) => (
    <div className="cb-paper cb-receipt">
      <div className="cb-paper__brand">
        CineBook
        <span lang="te">బిల్లు</span>
      </div>
      <p className="cb-paper__title">{bookingData.movie?.title || "Your booking"}</p>
      <p className="cb-muted cb-small" style={{ marginTop: 6 }}>
        {bookingData.theater?.name}
        {showTimeLabel && `, ${showTimeLabel}`}
      </p>

      <div className="cb-tear" />

      {selectedSeats.length === 0 ? (
        <p className="cb-receipt__empty">
          Tap a seat on the map to add it here.
        </p>
      ) : (
        <>
          <p className="cb-receipt__label">
            {selectedSeats.length} {selectedSeats.length === 1 ? "seat" : "seats"}
          </p>
          <ul className="cb-receipt__seats">
            {selectedSeats.map((seatId) => (
              <li key={seatId}>{seatId}</li>
            ))}
          </ul>
          <dl className="cb-kv">
            {selectedSeats.map((seatId) => {
              const { category, price } = priceForSeat(seatId);
              return (
                <div key={seatId}>
                  <dt>
                    {seatId} {category && `(${category})`}
                  </dt>
                  <dd>₹{price}</dd>
                </div>
              );
            })}
            {withSnacks &&
              selectedSnacks.map(({ item, quantity }) => (
                <div key={item.id}>
                  <dt>
                    {item.name} × {quantity}
                  </dt>
                  <dd>₹{(item.price * quantity).toFixed(0)}</dd>
                </div>
              ))}
            <div>
              <dt>Convenience fee (2%)</dt>
              <dd>₹{withSnacks ? fee : Math.round(subtotal * 0.02)}</dd>
            </div>
            <div className="cb-kv__total">
              <dt>Total</dt>
              <dd>
                ₹{withSnacks ? total : subtotal + Math.round(subtotal * 0.02)}
              </dd>
            </div>
          </dl>
        </>
      )}
      {children && <div className="cb-receipt__actions">{children}</div>}
    </div>
  );

  // Render snacks step
  if (showBeveragesStep) {
    return (
      <div className="cb-app cb-app--film">
        <FilmBackdrop movie={bookingData.movie} />
        <TopBar
          onBack={() => setShowBeveragesStep(false)}
          backLabel="Back to seats"
          title="Add snacks"
          sub={`${selectedSeats.length} ${selectedSeats.length === 1 ? "seat" : "seats"} held, snacks are optional`}
        >
          {lockExpiresAt && <HoldTimer time={timeRemaining} />}
        </TopBar>
        <BookingSteps current="Snacks" />

        <main className="cb-main">
          <div className="cb-split">
            <section aria-label="Concession menu">
              {foodItemsLoading ? (
                <Loading label="Fetching the menu" />
              ) : Object.keys(groupedFoodItems).length === 0 ? (
                <div className="cb-empty">
                  <h2 className="cb-h2">The counter is closed</h2>
                  <p>
                    Snacks can't be ordered online for this show right now. You
                    can still buy them at the cinema.
                  </p>
                  <div className="cb-chips">
                    <button type="button" className="cb-btn cb-btn--ghost" onClick={loadFoodItems}>
                      Check again
                    </button>
                    <button type="button" className="cb-btn cb-btn--pink" onClick={handleProceedToPayment} disabled={holdExpired}>
                      Continue to payment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="cb-menu">
                  <h2 className="cb-display cb-menu__title">Canteen</h2>
                  <p className="cb-muted">
                    Collect your order at the counter before the show. Show your
                    ticket.
                  </p>
                  {Object.entries(groupedFoodItems).map(([category, items]) => {
                    const CategoryIcon = getCategoryIcon(category);
                    return (
                    <section key={category} className="cb-menu__section">
                      <h3 className="cb-h3">
                        <CategoryIcon size={20} aria-hidden="true" />
                        {getCategoryDisplayName(category)}
                      </h3>
                      <ul className="cb-snacks">
                        {items.map((item) => {
                          const quantity = selectedBeverages[item.id] || 0;
                          return (
                            <li key={item.id} className="cb-snack" data-picked={quantity > 0} data-tint={TINT[item.category] || "gold"}>
                              <div className="cb-snack__art">
                                {item.imageUrl ? (
                                  <img
                                    src={assetUrl(item.imageUrl)}
                                    alt=""
                                    onError={(e) => (e.target.style.display = "none")}
                                  />
                                ) : (
                                  <SnackArt name={item.name} category={item.category} />
                                )}
                                {quantity > 0 && <span className="cb-snack__count">× {quantity}</span>}
                              </div>
                              <div className="cb-snack__body">
                                <p className="cb-snack__name">{item.name}</p>
                                {item.description && <p className="cb-snack__desc">{item.description}</p>}
                                <div className="cb-snack__foot">
                                  <span className="cb-snack__price">₹{item.price}</span>
                                  {quantity === 0 ? (
                                    <button
                                      type="button"
                                      className="cb-btn cb-btn--pink cb-btn--sm"
                                      onClick={() => updateBeverageQuantity(item.id, 1)}
                                      aria-label={`Add ${item.name}`}
                                    >
                                      <Plus size={15} aria-hidden="true" /> Add
                                    </button>
                                  ) : (
                                    <div className="cb-stepper" role="group" aria-label={`Quantity of ${item.name}`}>
                                      <button type="button" onClick={() => updateBeverageQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}>
                                        <Minus size={16} aria-hidden="true" />
                                      </button>
                                      <span aria-live="polite">{quantity}</span>
                                      <button type="button" onClick={() => updateBeverageQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}>
                                        <Plus size={16} aria-hidden="true" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                    );
                  })}
                </div>
              )}
            </section>

            <aside>
              {renderReceipt(true, <>
                <button
                  type="button"
                  className="cb-btn cb-btn--stamp cb-btn--block"
                  onClick={handleConfirmWithBeverages}
                  disabled={holdExpired}
                >
                  Continue to payment
                </button>
                {selectedSnacks.length > 0 ? null : (
                  <p className="cb-muted cb-small" style={{ textAlign: "center" }}>
                    No snacks added. That's fine too.
                  </p>
                )}
              </>)}
            </aside>
          </div>
        </main>
      </div>
    );
  }

  // Main seat selection view
  return (
    <div className="cb-app cb-app--film">
        <FilmBackdrop movie={bookingData.movie} />
      <TopBar onBack={onBack} backLabel="Back to showtimes" title="Choose seats" sub={topSub}>
        {lockExpiresAt && <HoldTimer time={timeRemaining} />}
      </TopBar>
      <BookingSteps current="Seats" />

      <main className="cb-main">
        <div className="cb-split">
          <section className="cb-hall" aria-label="Seat map">
            <div className="cb-screen" aria-hidden="true">
              <span>Screen</span>
            </div>

            <ul className="cb-legend" aria-label="Seat key">
              <li><span className="cb-seat-key" data-state="free" />Available</li>
              <li><span className="cb-seat-key" data-state="selected" />Your pick</li>
              <li><span className="cb-seat-key" data-state="held" />Held for you</li>
              <li><span className="cb-seat-key" data-state="taken" />Someone else is booking</li>
              <li><span className="cb-seat-key" data-state="booked" />Sold</li>
              <li><span className="cb-seat-key" data-state="free" data-wheel="true" />Wheelchair space</li>
            </ul>

            <div className="cb-hall__scroll">
              {Object.entries(theaterLayout).map(([category, categoryData]) => (
                <div key={category} className="cb-tier">
                  <p className="cb-tier__label">
                    <span>{category}</span>
                    <span>₹{categoryData.price}</span>
                  </p>
                  {categoryData.rows?.map((rowData) => (
                    <div key={rowData.row} className="cb-row">
                      <span className="cb-row__id" aria-hidden="true">{rowData.row}</span>
                      <div className="cb-row__seats">
                        {rowData.seats?.map((seatNum) => {
                          const seatId = `${rowData.row}${seatNum}`;
                          const state = getSeatState(seatId);
                          const isWheelchair = seatMap[seatId]?.wheelchairAccessible;
                          return (
                            <button
                              key={seatId}
                              type="button"
                              className="cb-seat"
                              data-state={state}
                              data-wheel={isWheelchair ? "true" : undefined}
                              aria-pressed={state === "selected"}
                              onClick={() => toggleSeat(seatId)}
                              disabled={state === "booked" || state === "taken" || isLocking}
                              aria-label={`Seat ${seatId}, ${category}, ₹${categoryData.price}, ${seatLabel[state]}${isWheelchair ? ", wheelchair space" : ""}`}
                              title={`${seatId}, ${seatLabel[state]}`}
                            >
                              {seatNum}
                            </button>
                          );
                        })}
                      </div>
                      <span className="cb-row__id" aria-hidden="true">{rowData.row}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p className="cb-muted cb-small cb-hall__note">
              Seats you pick are held for 10 minutes while you finish booking.
            </p>
          </section>

          <aside>
            {renderReceipt(false, selectedSeats.length > 0 && (
                <>
                  <button
                    type="button"
                    className="cb-btn cb-btn--stamp cb-btn--block"
                    onClick={handleProceedToBeverages}
                    disabled={isLocking || holdExpired}
                  >
                    {isLocking && <span className="cb-spinner cb-spinner--sm" />}
                    Add snacks
                  </button>
                  <button
                    type="button"
                    className="cb-btn cb-btn--ink cb-btn--block"
                    onClick={handleProceedToPayment}
                    disabled={isLocking || holdExpired}
                  >
                    Skip to payment
                  </button>
                </>
              ))}
          </aside>
        </div>
      </main>
    </div>
  );
}
