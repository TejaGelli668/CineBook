// src/utils/auth.js

const API_BASE_URL = "http://localhost:8080";

// API helper
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

// -------------------------------------------
// Admin login
// -------------------------------------------
export const validateAdminLogin = async (email, password) => {
  try {
    const response = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: email, password }),
    });

    if (response.success) {
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

// -------------------------------------------
// Admin logout
// -------------------------------------------
export const logoutAdmin = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (token) {
      await apiCall("/auth/logout", {
        // ⚙️ FIXED: match AuthController
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
  }
};

// -------------------------------------------
// User login
// -------------------------------------------
export const validateUserLogin = async (email, password) => {
  try {
    const response = await apiCall("/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      const token =
        response.token || response.data?.token || response.data?.accessToken;
      if (!token) throw new Error("No authentication token received");

      localStorage.setItem("userToken", token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      return { success: true, message: response.message };
    }
    return { success: false, message: response.message };
  } catch (error) {
    console.error("Login API error:", error);
    return { success: false, message: error.message || "Login failed" };
  }
};

// -------------------------------------------
// User registration
// -------------------------------------------
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

// -------------------------------------------
// Auth checks
// -------------------------------------------
export const isAuthenticated = () =>
  Boolean(
    localStorage.getItem("userToken") &&
      localStorage.getItem("isLoggedIn") === "true"
  );

export const isAdminAuthenticated = () =>
  Boolean(
    localStorage.getItem("adminToken") &&
      localStorage.getItem("isAdmin") === "true"
  );

export const loginUser = (email, password) =>
  validateUserLogin(email, password);

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("userToken");
    if (token) {
      await apiCall("/user/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (error) {
    console.error("User logout error:", error);
  } finally {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userToken");
    window.location.href = "/";
  }
};

// -------------------------------------------
// Get current user/admin
// -------------------------------------------
export const getCurrentUser = () => {
  // ⚙️ FIXED: switched from arrow‐ternary to block return
  if (isAuthenticated()) {
    return {
      email: localStorage.getItem("userEmail"),
      isAdmin: localStorage.getItem("isAdmin") === "true",
    };
  }
  return null;
};

export const getCurrentAdmin = () => {
  // ⚙️ FIXED: same change here
  if (isAdminAuthenticated()) {
    return {
      email: localStorage.getItem("adminEmail"),
      isAdmin: true,
    };
  }
  return null;
};

// -------------------------------------------
// Misc
// -------------------------------------------
export const setAdminStatus = (isAdmin) =>
  localStorage.setItem("isAdmin", isAdmin.toString());

export const verifyToken = async (type = "user") => {
  try {
    const token = localStorage.getItem(
      type === "admin" ? "adminToken" : "userToken"
    );
    if (!token) return false;

    const response = await apiCall(`/${type}/validate`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.success;
  } catch {
    // clear storage on failure
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
