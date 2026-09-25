import React, { useState, useEffect } from "react";
import {
  User,
  CreditCard,
  Camera,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Home,
  Ticket,
  RefreshCw,
} from "lucide-react";
import { TopBar, Alert, Loading, FilmBackdrop } from "../ui/Chrome";
import { getMovies, formatMovieData } from "../../utils/movieAPI";
import "./dashboard.css";

// Import API functions
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadProfilePicture,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  getBookingHistory,
  getBookingDetails,
  cancelBooking,
} from "../../utils/userAPI";

const UserDashboard = ({ currentUser, onBackToMovies, onLogout, onMovieSelect }) => {
  const [movies, setMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    profilePicture: null,
    memberSince: "",
    accountStatus: "Active Member",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);

  // Helper function to get full profile picture URL
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (
      profilePicture.startsWith("http://") ||
      profilePicture.startsWith("https://")
    ) {
      return profilePicture;
    }
    return `http://localhost:8080${profilePicture}`;
  };

  // FIXED: Helper function to parse time without timezone conversion
  const parseTimeWithoutTimezone = (timeString) => {
    // If it's already in 12-hour format, return as-is
    if (timeString.includes("AM") || timeString.includes("PM")) {
      return timeString;
    }

    // If it's in ISO format or 24-hour format, convert to 12-hour WITHOUT timezone conversion
    try {
      let hours, minutes;

      if (timeString.includes("T")) {
        // ISO format: "2025-06-24T13:00:00.000" or "2025-06-24T13:00:00.000Z"
        const timePart = timeString.split("T")[1];
        const timeOnly = timePart.split(".")[0]; // Remove milliseconds
        [hours, minutes] = timeOnly.split(":").map(Number);
      } else if (timeString.includes(":")) {
        // 24-hour format: "13:00"
        [hours, minutes] = timeString.split(":").map(Number);
      } else {
        return timeString; // Return as-is if format is unexpected
      }

      // Convert to 12-hour format
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const period = hours >= 12 ? "PM" : "AM";
      const minutesStr = minutes.toString().padStart(2, "0");

      return `${hour12}:${minutesStr} ${period}`;
    } catch (error) {
      console.error("Error parsing time:", error, timeString);
      return timeString;
    }
  };

  // FIXED: Helper function to check if show time has passed
  const hasShowTimePassed = (bookingDate, showTime) => {
    try {
      // Parse the booking date - handle MM/DD/YYYY format like "6/24/2025"
      let year, month, day;

      if (bookingDate.includes("/")) {
        // Handle MM/DD/YYYY or M/D/YYYY format
        const [m, d, y] = bookingDate.split("/").map((num) => parseInt(num));
        month = m;
        day = d;
        year = y;
      } else if (bookingDate.includes("-")) {
        // Handle YYYY-MM-DD format (fallback)
        const [y, m, d] = bookingDate.split("-").map((num) => parseInt(num));
        year = y;
        month = m;
        day = d;
      } else {
        console.error("Unsupported date format:", bookingDate);
        return false;
      }

      // FIXED: Parse the show time using our helper function
      const formattedTime = parseTimeWithoutTimezone(showTime);
      let hours, minutes;

      if (formattedTime.includes("AM") || formattedTime.includes("PM")) {
        // 12-hour format
        const [time, period] = formattedTime.split(" ");
        const [h, m] = time.split(":").map((num) => parseInt(num));
        hours = h;
        minutes = m || 0;

        if (period === "PM" && hours !== 12) {
          hours += 12;
        } else if (period === "AM" && hours === 12) {
          hours = 0;
        }
      } else {
        // 24-hour format fallback
        [hours, minutes] = formattedTime.split(":").map((num) => parseInt(num));
      }

      // Create the show date/time using local timezone (no UTC conversion)
      const showDateTime = new Date(year, month - 1, day, hours, minutes);
      const currentDateTime = new Date();

      // Check if the date is valid
      if (isNaN(showDateTime.getTime())) {
        console.error("Invalid date created from:", {
          bookingDate,
          showTime,
          formattedTime,
          year,
          month,
          day,
          hours,
          minutes,
        });
        return false;
      }

      return currentDateTime > showDateTime;
    } catch (error) {
      console.error("Error parsing date/time:", error, {
        bookingDate,
        showTime,
      });
      return false;
    }
  };

  // FIXED: Helper function to get cancellation deadline (e.g., 2 hours before show)
  const getCancellationDeadline = (bookingDate, showTime) => {
    try {
      // Parse the booking date - handle MM/DD/YYYY format like "6/24/2025"
      let year, month, day;

      if (bookingDate.includes("/")) {
        // Handle MM/DD/YYYY or M/D/YYYY format
        const [m, d, y] = bookingDate.split("/").map((num) => parseInt(num));
        month = m;
        day = d;
        year = y;
      } else if (bookingDate.includes("-")) {
        // Handle YYYY-MM-DD format (fallback)
        const [y, m, d] = bookingDate.split("-").map((num) => parseInt(num));
        year = y;
        month = m;
        day = d;
      } else {
        console.error("Unsupported date format:", bookingDate);
        return null;
      }

      // FIXED: Parse the show time using our helper function
      const formattedTime = parseTimeWithoutTimezone(showTime);
      let hours, minutes;

      if (formattedTime.includes("AM") || formattedTime.includes("PM")) {
        const [time, period] = formattedTime.split(" ");
        const [h, m] = time.split(":").map((num) => parseInt(num));
        hours = h;
        minutes = m || 0;

        if (period === "PM" && hours !== 12) {
          hours += 12;
        } else if (period === "AM" && hours === 12) {
          hours = 0;
        }
      } else {
        [hours, minutes] = formattedTime.split(":").map((num) => parseInt(num));
      }

      // Create the show date/time using local timezone (no UTC conversion)
      const showDateTime = new Date(year, month - 1, day, hours, minutes);

      // Check if the date is valid
      if (isNaN(showDateTime.getTime())) {
        console.error("Invalid date created from:", {
          bookingDate,
          showTime,
          formattedTime,
          year,
          month,
          day,
          hours,
          minutes,
        });
        return null;
      }

      // Set cancellation deadline to 2 hours before show time
      const cancellationDeadline = new Date(
        showDateTime.getTime() - 2 * 60 * 60 * 1000
      );

      return cancellationDeadline;
    } catch (error) {
      console.error("Error calculating cancellation deadline:", error, {
        bookingDate,
        showTime,
      });
      return null;
    }
  };

  // Check if booking can be cancelled
  const canCancelBooking = (bookingDate, showTime) => {
    const deadline = getCancellationDeadline(bookingDate, showTime);

    // If we can't calculate deadline or deadline is invalid, allow full cancellation
    if (!deadline || isNaN(deadline.getTime())) {
      console.warn(
        "Could not calculate valid cancellation deadline, allowing full cancellation"
      );
      return true;
    }

    const now = new Date();
    const canCancel = now < deadline;

    console.log("Cancellation check:", {
      bookingDate,
      showTime,
      deadline: deadline.toLocaleString(),
      now: now.toLocaleString(),
      canCancel,
    });

    return canCancel;
  };

  // Test function to verify date parsing
  useEffect(() => {
    // Test cases to verify parsing
    console.log("\n=== Testing Date Parsing ===");
    console.log(
      "Test 1 - Past show (6/23/2025 1:00 PM):",
      hasShowTimePassed("6/23/2025", "01:00 PM")
    );
    console.log(
      "Test 2 - Future show (6/24/2025 8:00 AM):",
      hasShowTimePassed("6/24/2025", "08:00 AM")
    );
    console.log(
      "Test 3 - Can cancel (6/24/2025 8:00 AM):",
      canCancelBooking("6/24/2025", "08:00 AM")
    );
    console.log("=== End Test ===\n");
  }, []);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
    getMovies().then((raw) => setMovies(raw.map(formatMovieData)));
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user profile
      const profileResult = await getUserProfile();
      if (profileResult.success && profileResult.data) {
        const userData = profileResult.data;
        const isoDate = userData.createdAt.split("T")[0]; // e.g. "2025-06-24"
        const [year, month, day] = isoDate.split("-").map(Number); // [2025, 06, 24]
        const localDate = new Date(year, month - 1, day); // midnight local
        setUserProfile({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phoneNumber || "",
          dateOfBirth: userData.dateOfBirth || "",
          profilePicture: userData.profilePicture || null,
          memberSince: userData.createdAt
            ? localDate.toLocaleDateString("en-US") // or omit locale for default
            : "",
          accountStatus: userData.isActive ? "Active Member" : "Inactive",
        });
      }

      // Load payment methods
      const paymentResult = await getPaymentMethods();
      if (paymentResult.success) {
        setPaymentMethods(paymentResult.data || []);
      }

      // Load booking history
      await loadBookingHistory();
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const loadBookingHistory = async () => {
    setBookingsLoading(true);
    try {
      const bookingResult = await getBookingHistory();
      if (bookingResult.success) {
        const bookings = bookingResult.data || [];
        setBookingHistory(bookings);

        // Debug: Log date formats
        if (bookings.length > 0) {
          console.log("Sample booking date format:", bookings[0].bookingDate);
          console.log("Sample booking time format:", bookings[0].showTime);
        }
      } else {
        console.error("Failed to load bookings:", bookingResult.message);
        setBookingHistory([]);
      }
    } catch (error) {
      console.error("Error loading booking history:", error);
      setBookingHistory([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, bookingDate, showTime) => {
    // Check if show time has passed
    if (hasShowTimePassed(bookingDate, showTime)) {
      if (
        window.confirm(
          "The show time has already passed. You cannot cancel this booking and will not receive a refund.\n\n" +
            "Would you like to contact customer support for assistance?"
        )
      ) {
        // You can redirect to customer support or show contact info
        setError(
          "Show time has passed. Cancellation is not allowed. Please contact customer support for assistance."
        );
      }
      return;
    }

    // Check if within cancellation deadline
    if (!canCancelBooking(bookingDate, showTime)) {
      const deadline = getCancellationDeadline(bookingDate, showTime);
      const deadlineStr = deadline ? deadline.toLocaleString() : "unknown";

      if (
        !window.confirm(
          `Cancellation deadline has passed (was ${deadlineStr}).\n\n` +
            "You can still cancel, but you will receive only a partial refund (50%).\n\n" +
            "Do you want to proceed with the cancellation?"
        )
      ) {
        return;
      }
    } else {
      // Normal cancellation confirmation
      if (
        !window.confirm(
          "Are you sure you want to cancel this booking?\n\n" +
            "You will receive a full refund."
        )
      ) {
        return;
      }
    }

    setLoading(true);
    try {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        setSuccess(result.data?.message || "Booking cancelled.");
        await loadBookingHistory(); // Reload bookings
      } else {
        setError(result.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setError("Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const result = await uploadProfilePicture(file);
      if (result.success) {
        const profilePictureUrl = result.data?.profilePictureUrl;
        if (profilePictureUrl) {
          setUserProfile((prev) => ({
            ...prev,
            profilePicture: profilePictureUrl,
          }));
          setSuccess("Profile picture updated successfully!");
          setTimeout(loadUserData, 1000);
        } else {
          setError("No profile picture URL received from server");
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload profile picture");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await updateUserProfile({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        dateOfBirth: userProfile.dateOfBirth,
      });

      if (result.success) {
        setIsEditing(false);
        setSuccess("Profile updated successfully!");
        if (result.data) {
          setUserProfile((prev) => ({
            ...prev,
            firstName: result.data.firstName,
            lastName: result.data.lastName,
            email: result.data.email,
            phone: result.data.phoneNumber,
            dateOfBirth: result.data.dateOfBirth,
          }));
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (result.success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordFields(false);
        setSuccess("Password changed successfully!");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePaymentMethod = async (id) => {
    if (!window.confirm("Remove this payment method?")) return;
    setLoading(true);
    try {
      const result = await removePaymentMethod(id);
      if (result.success) {
        setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
        setSuccess("Payment method removed successfully!");
      } else {
        setError(result.message);
      }
    } catch {
      setError("Failed to remove payment method");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const initials = `${userProfile.firstName?.[0] || ""}${
    userProfile.lastName?.[0] || ""
  }`.toUpperCase() || "CB";
  const totalSpent = bookingHistory.reduce(
    (sum, booking) => sum + (booking.totalAmount || 0),
    0
  );
  const statusTone = (status) =>
    status === "confirmed" ? "ok" : status === "cancelled" ? "bad" : "warn";

  const Avatar = ({ size = 72, editable = false }) => (
    <div className="cb-avatar" style={{ width: size, height: size }}>
      {userProfile.profilePicture ? (
        <img
          src={getProfilePictureUrl(userProfile.profilePicture)}
          alt=""
          onError={(e) => (e.target.style.display = "none")}
        />
      ) : (
        <span>{initials}</span>
      )}
      {editable && (
        <label className="cb-avatar__edit" title="Change photo">
          <Camera size={15} aria-hidden="true" />
          <span className="cb-sr">Change profile photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
          />
        </label>
      )}
    </div>
  );

  // One booking, drawn as a ticket stub
  const renderStub = (booking, { compact = false } = {}) => {
    const formattedTime = parseTimeWithoutTimezone(booking.showTime);
    const isPastShow = hasShowTimePassed(booking.bookingDate, booking.showTime);
    const canCancel = canCancelBooking(booking.bookingDate, booking.showTime);
    const cancellationDeadline = getCancellationDeadline(
      booking.bookingDate,
      booking.showTime
    );
    const cancelled = booking.status === "cancelled";

    return (
      <li
        key={booking.id}
        className="cb-stubcard"
        data-state={cancelled ? "cancelled" : isPastShow ? "past" : "upcoming"}
      >
        <div className="cb-stubcard__main">
          <p className="cb-stubcard__film">{booking.movieTitle}</p>
          <dl className="cb-fields">
            <div>
              <dt>Cinema</dt>
              <dd>{booking.theaterName}</dd>
            </div>
            <div>
              <dt>Show</dt>
              <dd>
                {(() => {
                  const d = getCancellationDeadline(booking.bookingDate, booking.showTime);
                  return d
                    ? new Date(d.getTime() + 2 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })
                    : booking.bookingDate;
                })()}
                , {formattedTime}
              </dd>
            </div>
            <div>
              <dt>Seats</dt>
              <dd>{booking.seatNumbers}</dd>
            </div>
            {!compact && booking.theaterLocation && (
              <div>
                <dt>Where</dt>
                <dd>{booking.theaterLocation}</dd>
              </div>
            )}
          </dl>
          {!compact &&
            booking.status === "confirmed" &&
            !isPastShow &&
            !canCancel &&
            cancellationDeadline && (
              <p className="cb-stubcard__note">
                Free cancellation ended {cancellationDeadline.toLocaleString("en-IN")}.
                Cancelling now refunds 50%.
              </p>
            )}
          {cancelled && (
            <span className="cb-stamp" aria-hidden="true">
              Cancelled
            </span>
          )}
        </div>
        <div className="cb-stubcard__stub">
          <p className="cb-stubcard__amount">{formatCurrency(booking.totalAmount)}</p>
          <span className={`cb-badge cb-badge--${statusTone(booking.status)}`}>
            {booking.status === "confirmed" && isPastShow ? "Watched" : booking.status}
          </span>
          {!compact && booking.status === "confirmed" && !isPastShow && (
            <button
              type="button"
              className="cb-btn cb-btn--ink cb-btn--sm"
              onClick={() =>
                handleCancelBooking(booking.id, booking.bookingDate, booking.showTime)
              }
              disabled={loading}
            >
              {canCancel ? "Cancel booking" : "Cancel for 50% refund"}
            </button>
          )}
        </div>
      </li>
    );
  };

  const noBookings = (
    <div className="cb-empty">
      <h2 className="cb-h2">No tickets yet</h2>
      <p>When you book a show, your tickets land here, ready for the door.</p>
      <button type="button" className="cb-btn cb-btn--stamp" onClick={onBackToMovies}>
        See what's playing
      </button>
    </div>
  );

  // ─── Derived data for the wallet ─────────────────────────────────────────
  const movieFor = (title) => movies.find((m) => m.title === title);
  const showStart = (b) => {
    const deadline = getCancellationDeadline(b.bookingDate, b.showTime);
    return deadline ? new Date(deadline.getTime() + 2 * 60 * 60 * 1000) : null;
  };
  const upcoming = bookingHistory
    .filter(
      (b) =>
        b.status === "confirmed" && !hasShowTimePassed(b.bookingDate, b.showTime)
    )
    .map((b) => ({ ...b, start: showStart(b) }))
    .filter((b) => b.start)
    .sort((a, b) => a.start - b.start);
  const nextShow = upcoming[0];
  const nowShowing = movies.filter(
    (m) => !["inactive", "coming soon"].includes((m.status || "").toLowerCase())
  );
  const heroMovie = (nextShow && movieFor(nextShow.movieTitle)) || nowShowing[0];

  const countdown = (start) => {
    const mins = Math.round((start - new Date()) / 60000);
    if (mins < 60) return `Starts in ${Math.max(mins, 0)} min`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `Starts in ${hours} ${hours === 1 ? "hour" : "hours"}`;
    const days = Math.round(hours / 24);
    return days === 1 ? "Tomorrow" : `In ${days} days`;
  };
  const memberNo = `CB-${String(
    Math.abs(
      [...(userProfile.email || "cinebook")].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)
    ) % 1000000
  ).padStart(6, "0")}`;

  // The CineBook Club card: the member's identity, printed like a pass
  const renderMemberCard = (editable = false) => (
    <div className="cb-member">
      <div className="cb-member__top">
        <span className="cb-member__club">CineBook Club</span>
        <span lang="te">సభ్యత్వ కార్డు</span>
      </div>
      <div className="cb-member__body">
        <Avatar size={78} editable={editable} />
        <div className="cb-member__who">
          <p className="cb-member__name">
            {userProfile.firstName || "Member"} {userProfile.lastName}
          </p>
          <p className="cb-member__mail">{userProfile.email}</p>
        </div>
      </div>
      <dl className="cb-member__meta">
        <div>
          <dt>Member no.</dt>
          <dd>{memberNo}</dd>
        </div>
        <div>
          <dt>Since</dt>
          <dd>
            {userProfile.memberSince
              ? new Date(userProfile.memberSince).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })
              : new Date().getFullYear()}
          </dd>
        </div>
        <div>
          <dt>Films booked</dt>
          <dd>{bookingHistory.filter((b) => b.status !== "cancelled").length}</dd>
        </div>
      </dl>
      <span className="cb-member__hole" aria-hidden="true" />
    </div>
  );

  const renderOverview = () => (
    <div className="cb-wallet">
      <section className="cb-wallet__hero">
        <div>
          <p className="cb-muted">
            {new Date().getHours() < 12
              ? "Good morning"
              : new Date().getHours() < 17
              ? "Good afternoon"
              : "Good evening"}
          </p>
          <h2 className="cb-wallet__hello">{userProfile.firstName || "Welcome"}</h2>
        </div>
        {renderMemberCard()}
      </section>

      {nextShow ? (
        <section className="cb-nextshow" aria-label="Your next show">
          {movieFor(nextShow.movieTitle)?.poster && (
            <span className="cb-thumb cb-nextshow__poster">
              <img src={movieFor(nextShow.movieTitle).poster} alt="" />
            </span>
          )}
          <div className="cb-nextshow__text">
            <p className="cb-nextshow__when">{countdown(nextShow.start)}</p>
            <h3 className="cb-nextshow__film">{nextShow.movieTitle}</h3>
            <dl className="cb-fields">
              <div>
                <dt>Cinema</dt>
                <dd>{nextShow.theaterName}</dd>
              </div>
              <div>
                <dt>Show</dt>
                <dd>
                  {nextShow.start.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  , {parseTimeWithoutTimezone(nextShow.showTime)}
                </dd>
              </div>
              <div>
                <dt>Seats</dt>
                <dd>{nextShow.seatNumbers}</dd>
              </div>
            </dl>
          </div>
          <button type="button" className="cb-btn cb-btn--stamp" onClick={() => setActiveTab("bookings")}>
            <Ticket size={16} aria-hidden="true" /> Show my ticket
          </button>
        </section>
      ) : (
        <section className="cb-wallet__empty">
          <div>
            <h3 className="cb-h2">Nothing booked yet</h3>
            <p className="cb-muted">
              Here's what's playing in Hyderabad. Pick a film to see showtimes.
            </p>
          </div>
          <ul className="cb-wallet__rail">
            {nowShowing.slice(0, 8).map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => (onMovieSelect ? onMovieSelect(m) : onBackToMovies())}>
                  <span className="cb-thumb">
                    <img src={m.poster} alt="" />
                  </span>
                  <span className="cb-wallet__rtitle">{m.title}</span>
                  <span className="cb-muted cb-small">{m.language}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="cb-panel__head">
          <div>
            <h3 className="cb-h2">Ticket wallet</h3>
            <p className="cb-muted cb-small">
              {bookingHistory.length} {bookingHistory.length === 1 ? "booking" : "bookings"},{" "}
              {formatCurrency(totalSpent)} spent on films
            </p>
          </div>
          <div className="cb-chips">
            <button
              type="button"
              className="cb-btn cb-btn--ghost cb-btn--sm"
              onClick={loadBookingHistory}
              disabled={bookingsLoading}
            >
              <RefreshCw size={14} className={bookingsLoading ? "cb-spin" : ""} aria-hidden="true" />
              Refresh
            </button>
            {bookingHistory.length > 3 && (
              <button type="button" className="cb-link" onClick={() => setActiveTab("bookings")}>
                See all {bookingHistory.length}
              </button>
            )}
          </div>
        </div>
        {bookingsLoading ? (
          <Loading label="Fetching your tickets" />
        ) : bookingHistory.length > 0 ? (
          <ul className="cb-stubs">
            {bookingHistory.slice(0, 3).map((b) => renderStub(b, { compact: true }))}
          </ul>
        ) : (
          <p className="cb-muted">Your tickets will be kept here, ready to show at the door.</p>
        )}
      </section>
    </div>
  );

  const renderBookings = () => (
    <div className="cb-stack">
      <div className="cb-panel__head">
        <div>
          <h2 className="cb-h2">My tickets</h2>
          <p className="cb-muted">
            {bookingHistory.length} {bookingHistory.length === 1 ? "booking" : "bookings"},{" "}
            {formatCurrency(totalSpent)} in total
          </p>
        </div>
        <button
          type="button"
          className="cb-btn cb-btn--ghost cb-btn--sm"
          onClick={loadBookingHistory}
          disabled={bookingsLoading}
        >
          <RefreshCw size={14} className={bookingsLoading ? "cb-spin" : ""} aria-hidden="true" />
          Refresh
        </button>
      </div>
      <p className="cb-muted cb-small">
        Free cancellation until the deadline before each show. After that,
        cancelling refunds half the price.
      </p>
      {bookingsLoading ? (
        <Loading label="Fetching your tickets" />
      ) : bookingHistory.length > 0 ? (
        <ul className="cb-stubs">{bookingHistory.map((b) => renderStub(b))}</ul>
      ) : (
        noBookings
      )}
    </div>
  );

  const field = (id, label, props) => (
    <div className="cb-field">
      <label htmlFor={id} className="cb-label">
        {label}
      </label>
      <input id={id} className="cb-input" {...props} />
    </div>
  );

  const renderProfile = () => (
    <div className="cb-stack">
      <section className="cb-profile-head">
        {renderMemberCard(isEditing)}
        <div className="cb-profile-head__side">
          <h2 className="cb-h2">Your details</h2>
          <p className="cb-muted">
            {isEditing
              ? "Change anything below, then save. Tap the camera on your card to change the photo."
              : "What we print on your tickets and use to reach you."}
          </p>
          <button
            type="button"
            className="cb-btn cb-btn--ghost cb-btn--sm"
            onClick={() => setIsEditing((e) => !e)}
            disabled={loading}
          >
            {isEditing ? <X size={14} aria-hidden="true" /> : <Edit3 size={14} aria-hidden="true" />}
            {isEditing ? "Stop editing" : "Edit profile"}
          </button>
        </div>
      </section>

      <section className="cb-panel">
        <h3 className="cb-h3" style={{ marginBottom: 18 }}>
          Personal details
        </h3>
        <div className="cb-form">
          <div className="cb-form-row">
            {field("pf-first", "First name", {
              value: userProfile.firstName,
              onChange: (e) => setUserProfile((p) => ({ ...p, firstName: e.target.value })),
              disabled: !isEditing || loading,
              autoComplete: "given-name",
            })}
            {field("pf-last", "Last name", {
              value: userProfile.lastName,
              onChange: (e) => setUserProfile((p) => ({ ...p, lastName: e.target.value })),
              disabled: !isEditing || loading,
              autoComplete: "family-name",
            })}
          </div>
          <div className="cb-form-row">
            {field("pf-email", "Email", {
              type: "email",
              value: userProfile.email,
              onChange: (e) => setUserProfile((p) => ({ ...p, email: e.target.value })),
              disabled: !isEditing || loading,
              autoComplete: "email",
            })}
            {field("pf-phone", "Phone", {
              type: "tel",
              value: userProfile.phone || "",
              onChange: (e) => setUserProfile((p) => ({ ...p, phone: e.target.value })),
              disabled: !isEditing || loading,
              placeholder: "+91",
              autoComplete: "tel",
            })}
          </div>
          <div className="cb-form-row">
            {field("pf-dob", "Date of birth", {
              type: "date",
              value: userProfile.dateOfBirth || "",
              onChange: (e) => setUserProfile((p) => ({ ...p, dateOfBirth: e.target.value })),
              disabled: !isEditing || loading,
            })}
            {field("pf-since", "Member since", {
              value: userProfile.memberSince,
              disabled: true,
              readOnly: true,
            })}
          </div>
          {isEditing && (
            <div>
              <button
                type="button"
                className="cb-btn cb-btn--stamp"
                onClick={handleProfileSave}
                disabled={loading}
              >
                {loading ? <span className="cb-spinner cb-spinner--sm" /> : <Save size={16} aria-hidden="true" />}
                {loading ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="cb-panel">
        <div className="cb-panel__head" style={{ marginBottom: showPasswordFields ? 18 : 0 }}>
          <div>
            <h3 className="cb-h3">Password</h3>
            <p className="cb-muted cb-small">Use at least 6 characters.</p>
          </div>
          <button
            type="button"
            className="cb-btn cb-btn--ghost cb-btn--sm"
            onClick={() => setShowPasswordFields((s) => !s)}
            disabled={loading}
          >
            {showPasswordFields ? "Close" : "Change password"}
          </button>
        </div>
        {showPasswordFields && (
          <div className="cb-form" style={{ maxWidth: 420 }}>
            <div className="cb-field">
              <label htmlFor="pw-current" className="cb-label">Current password</label>
              <div className="cb-input-wrap">
                <input
                  id="pw-current"
                  className="cb-input"
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="cb-input-wrap__btn"
                  onClick={() => setShowCurrentPassword((s) => !s)}
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="cb-field">
              <label htmlFor="pw-new" className="cb-label">New password</label>
              <div className="cb-input-wrap">
                <input
                  id="pw-new"
                  className="cb-input"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="cb-input-wrap__btn"
                  onClick={() => setShowNewPassword((s) => !s)}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {field("pw-confirm", "Repeat new password", {
              type: "password",
              autoComplete: "new-password",
              value: passwordData.confirmPassword,
              onChange: (e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value })),
              disabled: loading,
            })}
            <div>
              <button
                type="button"
                className="cb-btn cb-btn--stamp"
                onClick={handlePasswordChange}
                disabled={loading}
              >
                {loading && <span className="cb-spinner cb-spinner--sm" />}
                {loading ? "Updating…" : "Update password"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  const renderPayments = () => (
    <div className="cb-stack">
      <div className="cb-panel__head">
        <div>
          <h2 className="cb-h2">Saved cards</h2>
          <p className="cb-muted">
            Cards you save with Stripe at checkout appear here.
          </p>
        </div>
      </div>
      {paymentMethods.length > 0 ? (
        <ul className="cb-cards">
          {paymentMethods.map((method) => (
            <li key={method.id} className="cb-panel cb-card">
              <CreditCard size={22} aria-hidden="true" />
              <div style={{ flex: 1 }}>
                <p className="cb-card__num">
                  {method.cardNumber || method.maskedCardNumber}
                </p>
                <p className="cb-muted cb-small">
                  {method.cardHolder}
                  {method.expiryDate && `, expires ${method.expiryDate}`}
                </p>
              </div>
              {method.isDefault && <span className="cb-badge cb-badge--ok">Default</span>}
              <button
                type="button"
                className="cb-btn cb-btn--danger cb-btn--sm"
                onClick={() => handleRemovePaymentMethod(method.id)}
                disabled={loading}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="cb-empty">
          <h3 className="cb-h2">No saved cards</h3>
          <p>You pay securely with Stripe each time you book. Nothing is stored here yet.</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "bookings":
        return renderBookings();
      case "profile":
        return renderProfile();
      case "payments":
        return renderPayments();
      default:
        return renderOverview();
    }
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "bookings", label: "My tickets", icon: Ticket },
    { id: "profile", label: "Profile", icon: User },
    { id: "payments", label: "Saved cards", icon: CreditCard },
  ];

  return (
    <div className="cb-app cb-app--film">
      <FilmBackdrop movie={heroMovie} />
      <TopBar
        onBack={onBackToMovies}
        backLabel="Back to films"
        title="My CineBook"
        sub={userProfile.email || undefined}
      >
        <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm" onClick={onLogout}>
          Sign out
        </button>
      </TopBar>

      <main className="cb-main cb-dash">
        <div className="cb-tabs cb-dash__tabs" role="tablist" aria-label="Account sections">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {(error || success) && (
          <div className="cb-stack" style={{ marginBottom: 20 }}>
            {error && <Alert tone="error">{error}</Alert>}
            {success && <Alert tone="ok">{success}</Alert>}
          </div>
        )}

        {loading && activeTab === "overview" && !userProfile.email ? (
          <Loading label="Opening your account" />
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
