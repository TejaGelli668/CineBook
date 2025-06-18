// User API service for Spring Boot backend integration
const API_BASE_URL = "http://localhost:8080/api";

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("userToken");

    // Create headers object
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Only add Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await apiCall("/user/me", {
      method: "GET",
    });
    return {
      success: response.success,
      data: response.data,
      message: response.message,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const requestData = {
      email: profileData.email,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phoneNumber: profileData.phone,
      birthday: profileData.dateOfBirth
        ? {
            year: new Date(profileData.dateOfBirth).getFullYear(),
            month: new Date(profileData.dateOfBirth).getMonth() + 1,
            day: new Date(profileData.dateOfBirth).getDate(),
          }
        : null,
    };

    const response = await apiCall("/user/profile", {
      method: "PUT",
      body: JSON.stringify(requestData),
    });
    return {
      success: response.success,
      data: response.data,
      message: response.message,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await apiCall("/user/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
    return { success: response.success, message: response.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Upload profile picture
export const uploadProfilePicture = async (file) => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}/user/upload-profile-picture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    return { success: data.success, data: data.data, message: data.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Mock functions for payment methods (implement when you add payment features)
export const getPaymentMethods = async () => {
  try {
    const mockPaymentMethods = [
      {
        id: 1,
        type: "credit",
        maskedCardNumber: "**** **** **** 1234",
        expiryDate: "12/26",
        cardHolder: "Test User",
        isDefault: true,
      },
    ];

    return { success: true, data: mockPaymentMethods };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const addPaymentMethod = async (paymentData) => {
  try {
    return {
      success: true,
      message: "Payment method integration requires Stripe/Razorpay setup",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const removePaymentMethod = async (paymentMethodId) => {
  try {
    return { success: true, message: "Payment method removed successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Mock function for booking history (implement when you have booking entity)
export const getBookingHistory = async () => {
  try {
    const mockBookings = [
      {
        id: 1,
        movieTitle: "Avengers: Endgame",
        theaterName: "PVR Cinemas",
        bookingDate: "2025-06-15",
        showTime: "7:00 PM",
        seatNumbers: "A1, A2",
        totalAmount: 600,
        status: "completed",
      },
      {
        id: 2,
        movieTitle: "Spider-Man: No Way Home",
        theaterName: "Cineplex",
        bookingDate: "2025-06-10",
        showTime: "9:30 PM",
        seatNumbers: "B5",
        totalAmount: 250,
        status: "completed",
      },
    ];

    return { success: true, data: mockBookings };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
