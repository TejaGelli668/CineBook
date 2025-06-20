// src/utils/userAPI.js

const API_BASE_URL = "http://localhost:8080";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
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
    const token = localStorage.getItem("userToken");
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
  // Mock implementation - replace with actual API call when available
  return {
    success: true,
    data: [
      {
        id: 1,
        movieTitle: "Avatar: The Way of Water",
        movie: "Avatar: The Way of Water",
        theaterName: "PVR Cinemas",
        theater: "PVR Cinemas",
        bookingDate: "2025-06-15",
        date: "2025-06-15",
        showTime: "7:30 PM",
        time: "7:30 PM",
        seatNumbers: "A1, A2, A3",
        seats: "A1, A2, A3",
        totalAmount: 750,
        amount: 750,
        status: "confirmed",
      },
      {
        id: 2,
        movieTitle: "John Wick: Chapter 4",
        movie: "John Wick: Chapter 4",
        theaterName: "INOX",
        theater: "INOX",
        bookingDate: "2025-06-10",
        date: "2025-06-10",
        showTime: "9:00 PM",
        time: "9:00 PM",
        seatNumbers: "B5, B6",
        seats: "B5, B6",
        totalAmount: 500,
        amount: 500,
        status: "confirmed",
      },
    ],
  };
};

// -------------------------------------------
// Utility Functions
// -------------------------------------------

export const isUserAuthenticated = () => {
  const token = localStorage.getItem("userToken");
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  return Boolean(token && isLoggedIn === "true");
};

export const getUserToken = () => {
  return localStorage.getItem("userToken");
};
