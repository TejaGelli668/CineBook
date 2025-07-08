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
        },
        { type: "quick_action", text: "📅 View Shows", action: "view_shows" },
        { type: "quick_action", text: "🍿 Snacks Menu", action: "view_snacks" },
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

  // Load all data
  useEffect(() => {
    loadAllData();
    if (isUserLoggedIn) {
      loadUserBookings();
    }
  }, [isUserLoggedIn]);

  const loadAllData = async () => {
    try {
      // Load movies
      const moviesResponse = await fetch("http://localhost:8080/api/movies");
      if (moviesResponse.ok) {
        const moviesData = await moviesResponse.json();
        setAvailableMovies(moviesData.data || moviesData || []);
      }

      // Load shows
      const showsResponse = await fetch("http://localhost:8080/api/shows");
      if (showsResponse.ok) {
        const showsData = await showsResponse.json();
        setAvailableShows(showsData.data || showsData || []);
      }

      // Load snacks
      const snacksResponse = await fetch(
        "http://localhost:8080/api/food-items"
      );
      if (snacksResponse.ok) {
        const snacksData = await snacksResponse.json();
        setAvailableSnacks(snacksData.data || snacksData || []);
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

      const response = await fetch("http://localhost:8080/api/user/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const bookingsData = await response.json();
        setUserBookings(bookingsData.data || bookingsData || []);
      }
    } catch (error) {
      console.error("Error loading user bookings:", error);
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
      id: Date.now(),
      sender: "bot",
      text: text,
      timestamp: new Date(),
      actions: actions,
    };
    setMessages((prev) => [...prev, botMessage]);
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
      });
    });

    movieActions.push({
      type: "action",
      text: "🏠 Go to Movies Page",
      action: "book_movie_external",
      data: null,
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

    let responseText = "📅 Today's Available Shows:\n\n";
    const showActions = [];

    availableShows.slice(0, 5).forEach((show, index) => {
      const movieTitle = show.movie?.title || "Unknown Movie";
      const theaterName = show.theater?.name || "Unknown Theater";
      const showTime = new Date(show.showTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

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
        });
      }
    });

    showActions.push({
      type: "action",
      text: "🎬 View All Movies",
      action: "browse_movies_in_chat",
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
      },
      { type: "action", text: "📅 View Shows", action: "view_shows_in_chat" },
    ];

    addBotMessage(responseText, snackActions);
  };

  const showUserBookingsInChat = () => {
    if (!isUserLoggedIn) {
      addBotMessage("Please log in to view your bookings! 🔐", [
        { type: "action", text: "🔐 Login", action: "login_required" },
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
          },
          { type: "action", text: "👤 View Profile", action: "view_profile" },
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
      const showTime = booking.showTime || "Time TBD";
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
      { type: "action", text: "👤 View Full Profile", action: "view_profile" },
      {
        type: "action",
        text: "🎬 Book Another Movie",
        action: "browse_movies_in_chat",
      },
    ];

    addBotMessage(responseText, bookingActions);
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
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
        lowerMessage.includes("today's shows")
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
        await loadUserBookings(); // Refresh bookings
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
            },
            {
              type: "action",
              text: "🎟️ View My Bookings",
              action: "view_bookings_in_chat",
            },
          ];
        } else {
          response = "Please log in to access your profile! 🔐";
          actions = [
            { type: "action", text: "🔐 Login", action: "login_required" },
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
          },
          {
            type: "action",
            text: "📅 View Shows",
            action: "view_shows_in_chat",
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
        [{ type: "action", text: "🏠 Go to Home", action: "go_home" }]
      );
    }
  };

  const generateBookingActions = (message) => {
    const actions = [
      {
        type: "action",
        text: "🎬 Browse Movies",
        action: "browse_movies_in_chat",
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
            key={index}
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
                        key={index}
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
                key={message.id}
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
