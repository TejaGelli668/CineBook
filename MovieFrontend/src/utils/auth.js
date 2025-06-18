const API_BASE_URL = "http://localhost:8080/api"; // Updated with /api prefix

// API helper function
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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

// Admin login with backend
// utils/auth.js
export const validateAdminLogin = async (email, password) => {
  try {
    const response = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: email, password }),
      // note: your DTO expects "username" not "email"
    });

    if (response.success) {
      // authService.login returns LoginResponse inside data
      const token = response.data.token;
      localStorage.setItem("adminToken", token);
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", email);
      return { success: true };
    }
    return { success: false, message: response.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Admin logout with backend
export const logoutAdmin = async () => {
  try {
    const token = localStorage.getItem("adminToken");

    if (token) {
      await apiCall("/admin/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear local storage regardless of API call result
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
  }
};

// User authentication (if you have user endpoints)
export const validateUserLogin = async (email, password) => {
  try {
    console.log("Making login API call for:", email); // Debug log

    const response = await apiCall("/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    console.log("Login API response:", response); // Debug log

    if (response.success) {
      // Extract token from response - check different possible locations
      const token =
        response.token || response.data?.token || response.data?.accessToken;

      console.log("Extracted token:", token); // Debug log

      if (!token) {
        throw new Error("No authentication token received from server");
      }

      // Store token and user info
      localStorage.setItem("userToken", token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);

      // Verify token was stored correctly
      const storedToken = localStorage.getItem("userToken");
      console.log(
        "Token stored successfully:",
        storedToken !== "undefined" && storedToken !== null
      );

      return { success: true, message: response.message };
    }

    return { success: false, message: response.message };
  } catch (error) {
    console.error("Login API error:", error);
    return { success: false, message: error.message || "Login failed" };
  }
};

// User registration (if you have user registration endpoint)
export const registerUser = async (userData) => {
  try {
    const response = await apiCall("/user/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    return { success: true, message: response.message };
  } catch (error) {
    return { success: false, message: error.message || "Registration failed" };
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("userToken");
  return token && localStorage.getItem("isLoggedIn") === "true";
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = localStorage.getItem("adminToken");
  return token && localStorage.getItem("isAdmin") === "true";
};

// Login user (updated to use backend)
export const loginUser = async (email, password) => {
  return await validateUserLogin(email, password);
};

// Logout user - FIXED VERSION
export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("userToken");

    if (token) {
      // Only make API call if token exists
      await apiCall("/user/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("User logout error:", error);
    // Don't throw error on logout - always clear local storage
  } finally {
    // Always clear local storage regardless of API call result
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userToken");

    // Force page reload or redirect to clear any cached state
    window.location.href = "/";
  }
};

// Get current user info - FIXED EXPORT
export const getCurrentUser = () => {
  if (isAuthenticated()) {
    return {
      email: localStorage.getItem("userEmail"),
      isAdmin: localStorage.getItem("isAdmin") === "true",
    };
  }
  return null;
};

// Get current admin info
export const getCurrentAdmin = () => {
  if (isAdminAuthenticated()) {
    return {
      email: localStorage.getItem("adminEmail"),
      isAdmin: true,
    };
  }
  return null;
};

// Set admin status (deprecated - use login/logout instead)
export const setAdminStatus = (isAdmin) => {
  localStorage.setItem("isAdmin", isAdmin.toString());
};

// Verify token validity (optional - for auto-logout on token expiry)
export const verifyToken = async (type = "user") => {
  try {
    const token = localStorage.getItem(
      type === "admin" ? "adminToken" : "userToken"
    );

    if (!token) return false;

    const response = await apiCall(`/${type}/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.valid;
  } catch (error) {
    // If token verification fails, clear local storage
    if (type === "admin") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminEmail");
    } else {
      localStorage.removeItem("userToken");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
    }
    return false;
  }
};
