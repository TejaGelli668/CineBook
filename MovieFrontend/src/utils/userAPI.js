// src/utils/userAPI.js

const API_BASE_URL = "http://localhost:8080";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("userToken") || localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: getAuthHeaders(),
      ...options,
    };

    console.log(`Making API call to: ${url}`, config);

    const response = await fetch(url, config);
    const data = await response.json();

    console.log(`API Response:`, data);

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true, data: data.data || data, message: data.message };
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    return { success: false, message: error.message };
  }
};

// -------------------------------------------
// User Profile Management
// -------------------------------------------

export const getUserProfile = async () => {
  return apiCall("/user/profile", { method: "GET" });
};

export const updateUserProfile = async (profileData) => {
  try {
    console.log("Updating profile with data:", profileData);

    // Create the request payload with direct date string
    const requestPayload = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phoneNumber: profileData.phone,
      dateOfBirth: profileData.dateOfBirth, // Send as string directly
    };

    console.log("Request payload:", requestPayload);

    return apiCall("/user/profile", {
      method: "PUT",
      body: JSON.stringify(requestPayload),
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return { success: false, message: error.message };
  }
};

export const changePassword = async (passwordData) => {
  return apiCall("/user/change-password", {
    method: "POST",
    body: JSON.stringify(passwordData),
  });
};

export const uploadProfilePicture = async (file) => {
  try {
    const token =
      localStorage.getItem("userToken") || localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/user/profile-picture`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    return {
      success: true,
      data: { profilePictureUrl: data.data || data.profilePictureUrl },
      message: data.message,
    };
  } catch (error) {
    console.error("Profile picture upload error:", error);
    return { success: false, message: error.message };
  }
};

// -------------------------------------------
// Payment Methods
// -------------------------------------------

export const getPaymentMethods = async () => {
  // Mock implementation - replace with actual API call when available
  return {
    success: true,
    data: [
      {
        id: 1,
        cardNumber: "**** **** **** 1234",
        maskedCardNumber: "**** **** **** 1234",
        expiryDate: "12/25",
        cardHolder: "John Doe",
        isDefault: true,
      },
    ],
  };
};

export const addPaymentMethod = async (paymentData) => {
  // Mock implementation - replace with actual API call when available
  return {
    success: true,
    data: { id: Date.now(), ...paymentData },
    message: "Payment method added successfully",
  };
};

export const removePaymentMethod = async (paymentMethodId) => {
  // Mock implementation - replace with actual API call when available
  return {
    success: true,
    message: "Payment method removed successfully",
  };
};

// -------------------------------------------
// Booking History
// -------------------------------------------

export const getBookingHistory = async () => {
  try {
    const token =
      localStorage.getItem("userToken") || localStorage.getItem("authToken");
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch("http://localhost:8080/api/bookings/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: errorText || `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log("Raw booking data from API:", data);

    if (Array.isArray(data)) {
      // Transform the booking data to match the expected format
      const transformedBookings = data.map((booking) => {
        console.log("Processing booking:", booking);

        return {
          id: booking.id,
          movieTitle:
            booking.movieTitle || booking.show?.movie?.title || "Unknown Movie",
          theaterName:
            booking.theaterName ||
            booking.show?.theater?.name ||
            "Unknown Theater",
          theaterLocation:
            booking.theaterLocation ||
            booking.show?.theater?.location ||
            "Unknown Location",
          bookingDate:
            booking.bookingDate ||
            (booking.bookingTime
              ? new Date(booking.bookingTime).toLocaleDateString()
              : new Date().toLocaleDateString()),
          showTime:
            booking.showTime ||
            booking.show?.formattedShowTime ||
            (booking.show?.showTime
              ? new Date(booking.show.showTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Unknown Time"),
          showDate:
            booking.showDate ||
            booking.show?.formattedShowDate ||
            booking.show?.date ||
            "Unknown Date",
          seatNumbers:
            booking.seatNumbers ||
            (Array.isArray(booking.seats) && booking.seats.length > 0
              ? booking.seats
                  .map((seat) => {
                    // Handle different seat number sources
                    if (seat.seatNumber) return seat.seatNumber;
                    if (seat.seat?.seatNumber) return seat.seat.seatNumber;
                    if (seat.seat?.rowLetter && seat.seat?.seatPosition) {
                      return `${seat.seat.rowLetter}${seat.seat.seatPosition}`;
                    }
                    return "Unknown";
                  })
                  .join(", ")
              : "Unknown Seats"),
          totalAmount: booking.totalAmount || 0,
          status: booking.status ? booking.status.toLowerCase() : "confirmed",
          numberOfSeats:
            booking.numberOfSeats ||
            (Array.isArray(booking.seats) ? booking.seats.length : 1),
          // Keep original booking object for debugging
          originalBooking: booking,
        };
      });

      console.log("Transformed bookings:", transformedBookings);

      return {
        success: true,
        data: transformedBookings.sort((a, b) => {
          const dateA = new Date(
            a.originalBooking.bookingTime || a.bookingDate
          );
          const dateB = new Date(
            b.originalBooking.bookingTime || b.bookingDate
          );
          return dateB - dateA;
        }),
      };
    } else {
      return {
        success: false,
        message: "Expected array of bookings but received: " + typeof data,
      };
    }
  } catch (error) {
    console.error("Error fetching booking history:", error);
    return {
      success: false,
      message: "Network error while fetching booking history: " + error.message,
    };
  }
};

// Additional helper function to get booking details by ID
export const getBookingDetails = async (bookingId) => {
  try {
    const token =
      localStorage.getItem("userToken") || localStorage.getItem("authToken");
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(
      `http://localhost:8080/api/bookings/${bookingId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return {
        success: false,
        message: data.message || "Failed to fetch booking details",
      };
    }
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return {
      success: false,
      message: "Network error while fetching booking details",
    };
  }
};

// Function to cancel a booking
export const cancelBooking = async (bookingId) => {
  try {
    const token =
      localStorage.getItem("userToken") || localStorage.getItem("authToken");
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(
      `http://localhost:8080/api/bookings/${bookingId}/cancel`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, data, message: "Booking cancelled successfully" };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || errorData || "Failed to cancel booking",
      };
    }
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      message: "Network error while cancelling booking",
    };
  }
};

// -------------------------------------------
// Utility Functions
// -------------------------------------------

export const isUserAuthenticated = () => {
  const token =
    localStorage.getItem("userToken") || localStorage.getItem("authToken");
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  return Boolean(token && isLoggedIn === "true");
};

export const getUserToken = () => {
  return localStorage.getItem("userToken") || localStorage.getItem("authToken");
};
