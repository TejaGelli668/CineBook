import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader,
  Sparkles,
  Film,
  Popcorn,
  CreditCard,
  Clock,
  ArrowRight,
  Calendar,
  MapPin,
  Play,
  Home,
  ShoppingCart,
  Star,
  Ticket,
  Settings,
} from "lucide-react";

const EnhancedChatbotWithBookings = ({
  onMovieSelect,
  onNavigateToPage,
  isUserLoggedIn,
  onShowLogin,
  currentUser,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(1000);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi there! 👋 I'm your Movie Assistant. I can help you with shows, bookings, snacks, and more!",
      timestamp: new Date(),
      actions: [
        {
          type: "quick_action",
          text: "🎬 Browse Movies",
          action: "browse_movies_in_chat",
          id: "initial-browse-movies",
        },
        {
          type: "quick_action",
          text: "📅 View Shows",
          action: "view_shows",
          id: "initial-view-shows",
        },
        {
          type: "quick_action",
          text: "🍿 Snacks Menu",
          action: "view_snacks",
          id: "initial-snacks-menu",
        },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [availableMovies, setAvailableMovies] = useState([]);
  const [availableShows, setAvailableShows] = useState([]);
  const [availableSnacks, setAvailableSnacks] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickActions = [
    {
      icon: Film,
      text: "Available Movies",
      query: "What movies are available?",
    },
    {
      icon: Calendar,
      text: "Today's Shows",
      query: "What shows are available today?",
    },
    { icon: Popcorn, text: "Snacks Menu", query: "What snacks are available?" },
    { icon: Ticket, text: "My Bookings", query: "Show my bookings" },
    { icon: User, text: "My Profile", query: "Go to my profile" },
    {
      icon: CreditCard,
      text: "Payment Info",
      query: "What payment methods do you accept?",
    },
  ];

  // ✅ ADDED: Same isShowExpired logic from booking page
  const isShowExpired = (showTimeStr) => {
    try {
      // Parse the show time manually to avoid timezone conversion issues
      if (showTimeStr.includes("T")) {
        // Extract date and time parts from "2025-07-08T10:00:00.000Z"
        const [datePart, timePart] = showTimeStr.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const timeOnly = timePart.split(".")[0]; // Remove milliseconds and Z
        const [hours, minutes, seconds = 0] = timeOnly.split(":").map(Number);

        // Create date object in local timezone (treating stored time as local time)
        const showDateTime = new Date(
          year,
          month - 1,
          day,
          hours,
          minutes,
          seconds
        );

        // Add 5 minutes buffer - show becomes unselectable 5 minutes after start time
        const showTimeWithBuffer = new Date(
          showDateTime.getTime() + 5 * 60 * 1000
        );

        const currentTime = new Date();
        const isExpired = currentTime > showTimeWithBuffer;

        console.log(
          `Chatbot: Show time check: ${showTimeStr} -> Show: ${showDateTime.toLocaleString()}, Current: ${currentTime.toLocaleString()}, Expired: ${isExpired}`
        );

        return isExpired;
      }

      // Fallback: if format is unexpected, return false (don't block)
      console.warn("Chatbot: Unexpected show time format:", showTimeStr);
      return false;
    } catch (error) {
      console.error("Chatbot: Error parsing show time:", showTimeStr, error);
      return false;
    }
  };

  // ✅ FIXED: Added the same formatShowTime function from booking page
  const formatShowTime = (showTimeStr) => {
    try {
      console.log("Chatbot formatting show time:", showTimeStr);

      // Parse the time string directly without timezone conversion
      if (showTimeStr.includes("T")) {
        // Extract just the time part from "2025-06-24T07:30:00.000"
        const timePart = showTimeStr.split("T")[1];
        const timeOnly = timePart.split(".")[0]; // Remove milliseconds
        const [hours, minutes] = timeOnly.split(":");

        // Convert to 12-hour format manually
        const hour24 = parseInt(hours, 10);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const period = hour24 >= 12 ? "PM" : "AM";

        const formattedTime = `${hour12}:${minutes} ${period}`;
        console.log(`Chatbot converted ${showTimeStr} to ${formattedTime}`);
        return formattedTime;
      }

      // Fallback: if format is unexpected, return as-is
      console.warn("Chatbot: Unexpected time format:", showTimeStr);
      return showTimeStr;
    } catch (error) {
      console.error("Chatbot: Error formatting show time:", error);
      return showTimeStr;
    }
  };

  // Load all data
  useEffect(() => {
    loadAllData();
    if (isUserLoggedIn) {
      loadUserBookings();
    }
  }, [isUserLoggedIn]);

  const loadAllData = async () => {
    try {
      // Get auth token for authenticated requests
      const token = localStorage.getItem("userToken");
      const authHeaders = {
        "Content-Type": "application/json",
      };

      if (token) {
        authHeaders["Authorization"] = `Bearer ${token}`;
      }

      // Load movies (public endpoint)
      try {
        const moviesResponse = await fetch("http://localhost:8080/api/movies");
        if (moviesResponse.ok) {
          const moviesData = await moviesResponse.json();
          setAvailableMovies(moviesData.data || moviesData || []);
        } else {
          console.warn("Failed to load movies:", moviesResponse.status);
        }
      } catch (error) {
        console.error("Error loading movies:", error);
      }

      // Load shows (requires authentication)
      try {
        const showsResponse = await fetch("http://localhost:8080/shows", {
          headers: authHeaders,
        });
        if (showsResponse.ok) {
          const showsData = await showsResponse.json();
          const shows = showsData.data || showsData || [];

          console.log(`Loaded ${shows.length} shows from API:`);
          shows.forEach((show, index) => {
            if (index < 3) {
              // Log first 3 shows for debugging
              console.log(
                `Show ${show.id}: ${show.movie?.title} at ${show.showTime} (${
                  show.showTime?.split("T")[0]
                })`
              );
            }
          });

          setAvailableShows(shows);
        } else {
          console.warn("Failed to load shows:", showsResponse.status);
          // If auth fails, try without authentication as fallback
          if (showsResponse.status === 401) {
            try {
              const fallbackResponse = await fetch(
                "http://localhost:8080/shows"
              );
              if (fallbackResponse.ok) {
                const showsData = await fallbackResponse.json();
                const shows = showsData.data || showsData || [];

                console.log(`Loaded ${shows.length} shows from fallback API:`);
                shows.forEach((show, index) => {
                  if (index < 3) {
                    // Log first 3 shows for debugging
                    console.log(
                      `Show ${show.id}: ${show.movie?.title} at ${
                        show.showTime
                      } (${show.showTime?.split("T")[0]})`
                    );
                  }
                });

                setAvailableShows(shows);
              }
            } catch (fallbackError) {
              console.error(
                "Fallback shows request also failed:",
                fallbackError
              );
              setAvailableShows([]);
            }
          }
        }
      } catch (error) {
        console.error("Error loading shows:", error);
        setAvailableShows([]);
      }

      // Load snacks (public endpoint)
      try {
        const snacksResponse = await fetch(
          "http://localhost:8080/api/food-items"
        );
        if (snacksResponse.ok) {
          const snacksData = await snacksResponse.json();
          setAvailableSnacks(snacksData.data || snacksData || []);
        } else {
          console.warn("Failed to load snacks:", snacksResponse.status);
        }
      } catch (error) {
        console.error("Error loading snacks:", error);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadUserBookings = async () => {
    if (!isUserLoggedIn) return;

    try {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch("http://localhost:8080/user/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const bookingsData = await response.json();
        setUserBookings(bookingsData.data || bookingsData || []);
      } else {
        console.warn("Failed to load user bookings:", response.status);
        setUserBookings([]);
      }
    } catch (error) {
      console.error("Error loading user bookings:", error);
      setUserBookings([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleQuickAction = (query) => {
    setInput(query);
    setShowQuickActions(false);
    sendMessage(query);
  };

  const handleActionClick = (action, data = null) => {
    switch (action) {
      case "browse_movies_in_chat":
        showMoviesInChat();
        break;
      case "view_shows_in_chat":
        showShowsInChat();
        break;
      case "view_snacks_in_chat":
        showSnacksInChat();
        break;
      case "view_bookings_in_chat":
        showUserBookingsInChat();
        break;
      case "view_shows":
        sendMessage("What shows are available today?");
        break;
      case "view_snacks":
        sendMessage("What snacks are available?");
        break;
      case "view_profile":
        if (isUserLoggedIn) {
          if (onNavigateToPage) {
            onNavigateToPage("userDashboard");
            addBotMessage(
              "Taking you to your profile! I'll stay here to help 😊"
            );
          }
        } else {
          handleActionClick("login_required");
        }
        break;
      case "book_movie":
        if (data && onMovieSelect) {
          onMovieSelect(data);
          addBotMessage(
            `Great! Taking you to book "${data.title}" 🎬\n\nThe booking page will open while I stay here to help! 😊`
          );
        }
        break;
      case "book_movie_external":
        if (data && onMovieSelect) {
          onMovieSelect(data);
          setIsOpen(false);
          addBotMessage(`Great! Taking you to book "${data.title}" 🎬`);
        }
        break;
      case "login_required":
        if (onShowLogin) {
          onShowLogin();
          addBotMessage(
            "Login window opened! Come back here after you log in 😊"
          );
        }
        break;
      case "go_home":
        if (onNavigateToPage) {
          onNavigateToPage("home");
          addBotMessage(
            "Navigated to home page! I'm still here if you need help 🏠"
          );
        }
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const addBotMessage = (text, actions = null) => {
    const botMessage = {
      id: messageIdCounter,
      sender: "bot",
      text: text,
      timestamp: new Date(),
      actions: actions,
    };
    setMessages((prev) => [...prev, botMessage]);
    setMessageIdCounter((prev) => prev + 1);
  };

  const showMoviesInChat = () => {
    if (availableMovies.length === 0) {
      addBotMessage(
        "No movies are currently available. Please check back later! 😊"
      );
      return;
    }

    let responseText = "🎬 Here are our current movies:\n\n";
    const movieActions = [];

    availableMovies.slice(0, 6).forEach((movie, index) => {
      responseText += `${index + 1}. ${movie.title}\n   📝 ${movie.genre} • ${
        movie.duration
      } mins\n   ⭐ ${movie.rating}/10\n\n`;

      movieActions.push({
        type: "movie_action",
        text: `🎟️ Book ${movie.title}`,
        action: "book_movie",
        data: movie,
        id: `movie-${movie.id}-${index}`,
      });
    });

    movieActions.push({
      type: "action",
      text: "🏠 Go to Movies Page",
      action: "book_movie_external",
      data: null,
      id: "go-to-movies-page",
    });

    addBotMessage(responseText, movieActions);
  };

  const showShowsInChat = () => {
    if (availableShows.length === 0) {
      addBotMessage(
        "No shows are available today. Please check back later! 😊"
      );
      return;
    }

    // Filter shows by today's date
    const today = new Date().toISOString().slice(0, 10);
    console.log("Chatbot: Filtering shows for today:", today);

    const todaysShows = availableShows.filter((show) => {
      if (!show.showTime) return false;

      try {
        // Extract the date part from the ISO string
        const showDate = show.showTime.split("T")[0];
        const isToday = showDate === today;

        console.log(
          `Chatbot: Show ${show.id}: showTime=${show.showTime}, extracted date=${showDate}, isToday=${isToday}`
        );
        return isToday;
      } catch (error) {
        console.error(
          "Chatbot: Error parsing show date:",
          show.showTime,
          error
        );
        return false;
      }
    });

    // ✅ ADDED: Filter out expired shows (shows that have already started)
    const availableNonExpiredShows = todaysShows.filter((show) => {
      const expired = isShowExpired(show.showTime);
      console.log(
        `Chatbot: Show ${show.id} (${formatShowTime(
          show.showTime
        )}) - Expired: ${expired}`
      );
      return !expired; // Only include non-expired shows
    });

    console.log(
      `Chatbot: Found ${availableNonExpiredShows.length} available shows out of ${todaysShows.length} total shows for today`
    );

    if (availableNonExpiredShows.length === 0) {
      if (todaysShows.length > 0) {
        addBotMessage(
          `All shows for today (${today}) have already started! 🎬\n\nPlease check other dates for available shows. 😊`,
          [
            {
              type: "action",
              text: "🎬 Browse All Movies",
              action: "browse_movies_in_chat",
              id: "browse-movies-all-expired",
            },
          ]
        );
      } else {
        addBotMessage(
          `No shows are available for today (${today}). Please check other dates or ask admin to create shows! 😊`
        );
      }
      return;
    }

    let responseText = `📅 Today's Available Shows (${today}):\n\n`;
    const showActions = [];

    availableNonExpiredShows.slice(0, 5).forEach((show, index) => {
      const movieTitle = show.movie?.title || "Unknown Movie";
      const theaterName = show.theater?.name || "Unknown Theater";
      // ✅ FIXED: Use the same formatShowTime function as booking page
      const showTime = formatShowTime(show.showTime);

      responseText += `${
        index + 1
      }. ${movieTitle}\n   🏛️ ${theaterName}\n   ⏰ ${showTime}\n   💰 ₹${
        show.ticketPrice
      }\n\n`;

      if (show.movie) {
        showActions.push({
          type: "movie_action",
          text: `🎟️ Book ${movieTitle}`,
          action: "book_movie",
          data: show.movie,
          id: `show-${show.id}-${index}`,
        });
      }
    });

    // Show info about expired shows if there are any
    const expiredCount = todaysShows.length - availableNonExpiredShows.length;
    if (expiredCount > 0) {
      responseText += `\n⏰ Note: ${expiredCount} show${
        expiredCount > 1 ? "s" : ""
      } ${expiredCount > 1 ? "have" : "has"} already started and ${
        expiredCount > 1 ? "are" : "is"
      } no longer available for booking.`;
    }

    showActions.push({
      type: "action",
      text: "🎬 View All Movies",
      action: "browse_movies_in_chat",
      id: "view-all-movies",
    });

    addBotMessage(responseText, showActions);
  };

  const showSnacksInChat = () => {
    if (availableSnacks.length === 0) {
      addBotMessage(
        "Our snacks menu is being updated. Please check back soon! 🍿"
      );
      return;
    }

    let responseText = "🍿 Our Delicious Snacks Menu:\n\n";

    availableSnacks.slice(0, 8).forEach((item, index) => {
      const price = item.price ? `₹${item.price}` : "Price on request";
      responseText += `${index + 1}. ${item.name}\n   💰 ${price}\n\n`;
    });

    responseText += "All snacks can be added during your movie booking! 😋";

    const snackActions = [
      {
        type: "action",
        text: "🎬 Browse Movies",
        action: "browse_movies_in_chat",
        id: "browse-movies-from-snacks",
      },
      {
        type: "action",
        text: "📅 View Shows",
        action: "view_shows_in_chat",
        id: "view-shows-from-snacks",
      },
    ];

    addBotMessage(responseText, snackActions);
  };

  const showUserBookingsInChat = () => {
    if (!isUserLoggedIn) {
      addBotMessage("Please log in to view your bookings! 🔐", [
        {
          type: "action",
          text: "🔐 Login",
          action: "login_required",
          id: "login-required-bookings",
        },
      ]);
      return;
    }

    if (userBookings.length === 0) {
      addBotMessage(
        "You don't have any bookings yet! 🎬\n\nReady to book your first movie?",
        [
          {
            type: "action",
            text: "🎬 Browse Movies",
            action: "browse_movies_in_chat",
            id: "browse-movies-no-bookings",
          },
          {
            type: "action",
            text: "👤 View Profile",
            action: "view_profile",
            id: "view-profile-no-bookings",
          },
        ]
      );
      return;
    }

    let responseText = `🎟️ Your Recent Bookings (${userBookings.length} total):\n\n`;

    // Format booking status
    const formatStatus = (status) => {
      switch (status?.toLowerCase()) {
        case "confirmed":
          return "✅ Confirmed";
        case "cancelled":
          return "❌ Cancelled";
        case "pending":
          return "⏳ Pending";
        default:
          return "📋 " + (status || "Unknown");
      }
    };

    // Format date
    const formatDate = (dateStr) => {
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    userBookings.slice(0, 5).forEach((booking, index) => {
      const movieTitle =
        booking.movieTitle || booking.movie?.title || "Unknown Movie";
      const theaterName =
        booking.theaterName || booking.theater?.name || "Unknown Theater";
      const bookingDate = formatDate(booking.bookingDate || booking.createdAt);

      // ✅ FIXED: Use the same formatShowTime function for booking show times if available
      let showTime = "Time TBD";
      if (booking.showTime) {
        if (booking.showTime.includes("T")) {
          showTime = formatShowTime(booking.showTime);
        } else {
          showTime = booking.showTime; // Already formatted
        }
      }

      const status = formatStatus(booking.status);
      const amount = booking.totalAmount
        ? `₹${booking.totalAmount}`
        : "Amount TBD";

      responseText += `${
        index + 1
      }. ${movieTitle}\n   🏛️ ${theaterName}\n   📅 ${bookingDate} • ${showTime}\n   💰 ${amount}\n   ${status}\n\n`;
    });

    if (userBookings.length > 5) {
      responseText += `... and ${userBookings.length - 5} more bookings.\n\n`;
    }

    responseText += "Want to see all your bookings and manage them?";

    const bookingActions = [
      {
        type: "action",
        text: "👤 View Full Profile",
        action: "view_profile",
        id: "view-profile-from-bookings",
      },
      {
        type: "action",
        text: "🎬 Book Another Movie",
        action: "browse_movies_in_chat",
        id: "book-another-movie",
      },
    ];

    addBotMessage(responseText, bookingActions);
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: messageIdCounter,
      sender: "user",
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageIdCounter((prev) => prev + 1);
    setInput("");
    setLoading(true);
    setTypingIndicator(true);
    setShowQuickActions(false);

    try {
      const lowerMessage = messageText.toLowerCase();
      let response;
      let actions = null;

      if (
        lowerMessage.includes("available movies") ||
        lowerMessage.includes("what movies") ||
        lowerMessage.includes("list movies")
      ) {
        showMoviesInChat();
        setLoading(false);
        setTypingIndicator(false);
        return;
      } else if (
        lowerMessage.includes("available shows") ||
        lowerMessage.includes("what shows") ||
        lowerMessage.includes("today's shows") ||
        lowerMessage.includes("shows today") ||
        lowerMessage.includes("shows available")
      ) {
        showShowsInChat();
        setLoading(false);
        setTypingIndicator(false);
        return;
      } else if (
        lowerMessage.includes("snack") ||
        lowerMessage.includes("food") ||
        lowerMessage.includes("popcorn")
      ) {
        showSnacksInChat();
        setLoading(false);
        setTypingIndicator(false);
        return;
      } else if (
        lowerMessage.includes("my booking") ||
        lowerMessage.includes("show my booking") ||
        lowerMessage.includes("booking history") ||
        lowerMessage.includes("my tickets")
      ) {
        await loadUserBookings();
        showUserBookingsInChat();
        setLoading(false);
        setTypingIndicator(false);
        return;
      } else if (
        lowerMessage.includes("my profile") ||
        lowerMessage.includes("profile") ||
        lowerMessage.includes("dashboard") ||
        lowerMessage.includes("account")
      ) {
        if (isUserLoggedIn) {
          response = `👤 Here's your profile info:\n\n🔹 Name: ${
            currentUser?.firstName || "User"
          } ${currentUser?.lastName || ""}\n🔹 Email: ${
            currentUser?.email || "Not available"
          }\n\nWould you like to view your full profile or manage your bookings?`;
          actions = [
            {
              type: "action",
              text: "👤 Open Profile Page",
              action: "view_profile",
              id: "open-profile-page",
            },
            {
              type: "action",
              text: "🎟️ View My Bookings",
              action: "view_bookings_in_chat",
              id: "view-my-bookings",
            },
          ];
        } else {
          response = "Please log in to access your profile! 🔐";
          actions = [
            {
              type: "action",
              text: "🔐 Login",
              action: "login_required",
              id: "login-required-profile",
            },
          ];
        }
      } else if (
        lowerMessage.includes("payment") ||
        lowerMessage.includes("pay") ||
        lowerMessage.includes("upi")
      ) {
        response = await handlePaymentQuery();
        actions = [
          {
            type: "action",
            text: "🎬 Browse Movies",
            action: "browse_movies_in_chat",
            id: "browse-movies-from-payment",
          },
        ];
      } else if (
        lowerMessage.includes("book") ||
        lowerMessage.includes("ticket")
      ) {
        response = await handleBookingQuery(messageText);
        actions = generateBookingActions(messageText);
      } else {
        response = await handleGeneralQuery(messageText);
        actions = [
          {
            type: "action",
            text: "🎬 Browse Movies",
            action: "browse_movies_in_chat",
            id: "browse-movies-general",
          },
          {
            type: "action",
            text: "📅 View Shows",
            action: "view_shows_in_chat",
            id: "view-shows-general",
          },
        ];
      }

      setTimeout(() => {
        setTypingIndicator(false);
        addBotMessage(response, actions);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Chatbot error:", error);
      setTypingIndicator(false);
      setLoading(false);

      addBotMessage(
        "Sorry, I'm having trouble right now. Please try again later! 😅",
        [
          {
            type: "action",
            text: "🏠 Go to Home",
            action: "go_home",
            id: "go-home-error",
          },
        ]
      );
    }
  };

  const generateBookingActions = (message) => {
    const actions = [
      {
        type: "action",
        text: "🎬 Browse Movies",
        action: "browse_movies_in_chat",
        id: "browse-movies-booking",
      },
    ];

    // Check if user mentioned a specific movie
    const mentionedMovie = availableMovies.find((movie) =>
      message.toLowerCase().includes(movie.title.toLowerCase())
    );

    if (mentionedMovie) {
      actions.unshift({
        type: "movie_action",
        text: `🎟️ Book ${mentionedMovie.title}`,
        action: "book_movie",
        data: mentionedMovie,
        id: `book-mentioned-movie-${mentionedMovie.id}`,
      });
    }

    return actions;
  };

  const handlePaymentQuery = () => {
    return `💳 We accept multiple payment methods:\n\n✅ UPI (PhonePe, Google Pay, Paytm)\n✅ Credit/Debit Cards\n✅ Net Banking\n✅ Digital Wallets\n\nAll payments are 100% secure! 🔒`;
  };

  const handleBookingQuery = (message) => {
    if (!isUserLoggedIn) {
      return `🎟️ I'd love to help you book tickets!\n\nTo get started, you'll need to log in first. Then you can:\n1. Browse available movies\n2. Select your preferred show time\n3. Choose seats\n4. Add snacks (optional)\n5. Make secure payment\n\nShall I take you to login? 🔐`;
    }

    return `🎟️ Perfect! I'll help you book tickets!\n\nHere's the process:\n1. Browse available shows\n2. Select your preferred movie & time\n3. Choose seats\n4. Add snacks (optional)\n5. Make payment\n\nReady to start? 🎬`;
  };

  const handleGeneralQuery = async (message) => {
    try {
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const text = await response.text();
      return text;
    } catch (error) {
      return "I'm having trouble understanding that. Could you please rephrase? 🤔";
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderActionButtons = (actions) => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <button
            key={
              action.id || `action-btn-${index}-${action.action}-${action.text}`
            }
            onClick={() => {
              if (action.action === "login_required" && !isUserLoggedIn) {
                handleActionClick("login_required");
              } else {
                handleActionClick(action.action, action.data);
              }
            }}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 shadow-md hover:shadow-lg transform hover:scale-105 ${
              action.type === "movie_action"
                ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            }`}
          >
            {action.type === "movie_action" && <Play size={14} />}
            {action.type === "action" && <ArrowRight size={14} />}
            <span>{action.text}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button - Matching your app's theme */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isOpen ? "scale-95" : "scale-100 hover:scale-110"
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center group border-2 border-purple-500/30"
        >
          {isOpen ? (
            <X size={24} className="transition-transform duration-200" />
          ) : (
            <MessageCircle
              size={24}
              className="transition-transform duration-200 group-hover:scale-110"
            />
          )}

          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles size={10} className="text-white" />
            </div>
          )}
        </button>
      </div>

      {/* Chat Window - Matching your app's dark theme */}
      <div
        className={`fixed bottom-24 right-6 w-96 h-[600px] z-40 transition-all duration-500 transform ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-8 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 h-full flex flex-col overflow-hidden">
          {/* Header - Matching your app's gradient */}
          <div className="bg-gradient-to-r from-purple-800 to-blue-800 p-4 text-white border-b border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Movie Assistant</h3>
                  <p className="text-sm text-white/80">
                    {isUserLoggedIn
                      ? `Hi ${currentUser?.firstName || "User"}! 🎬`
                      : "Always here to help! 🎬"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Actions - Dark theme */}
          {showQuickActions && (
            <div className="p-4 bg-gray-900/50 border-b border-purple-500/20">
              <p className="text-sm text-gray-300 mb-3">Quick actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions
                  .slice(0, isUserLoggedIn ? 6 : 4)
                  .map((action, index) => {
                    // Skip user-specific actions if not logged in
                    if (
                      !isUserLoggedIn &&
                      (action.text.includes("My") ||
                        action.text.includes("Profile"))
                    ) {
                      return null;
                    }

                    return (
                      <button
                        key={`quick-action-${index}-${action.text}`}
                        onClick={() => handleQuickAction(action.query)}
                        className="flex items-center space-x-2 p-2 bg-purple-800/30 rounded-lg hover:bg-purple-700/40 transition-colors text-sm border border-purple-500/30 hover:border-purple-400/50"
                      >
                        <action.icon size={16} className="text-purple-300" />
                        <span className="text-gray-200 text-xs">
                          {action.text}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Messages - Dark theme */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/30">
            {messages.map((message) => (
              <div
                key={`msg-${message.id}-${
                  message.sender
                }-${message.timestamp.getTime()}`}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-gray-800/80 text-gray-100 border border-gray-700/50"
                  } shadow-lg`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === "bot" && (
                      <Bot
                        size={16}
                        className="text-purple-400 mt-1 flex-shrink-0"
                      />
                    )}
                    {message.sender === "user" && (
                      <User
                        size={16}
                        className="text-white mt-1 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {message.text}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "user"
                            ? "text-white/70"
                            : "text-gray-400"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>

                      {/* Action Buttons */}
                      {message.sender === "bot" &&
                        renderActionButtons(message.actions)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator - Dark theme */}
            {typingIndicator && (
              <div className="flex justify-start">
                <div className="bg-gray-800/80 rounded-2xl p-3 border border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <Bot size={16} className="text-purple-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input - Dark theme */}
          <div className="p-4 border-t border-purple-500/30 bg-gray-900/50">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !loading && sendMessage()
                }
                placeholder="Ask me anything about movies, shows, or bookings..."
                disabled={loading}
                className="flex-1 p-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 text-sm bg-gray-800/50 text-white placeholder-gray-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[48px]"
              >
                {loading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedChatbotWithBookings;
