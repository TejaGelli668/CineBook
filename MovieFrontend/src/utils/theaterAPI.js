// // src/utils/theaterAPI.js
// import { apiCall, withAuth } from "./movieAPI";

// /**
//  * Fetch all theaters
//  * GET /api/theaters
//  */
// export async function getTheaters() {
//   const resp = await apiCall("/api/theaters", {
//     method: "GET",
//     headers: withAuth(),
//   });
//   return resp.data || [];
// }

// /**
//  * Fetch a single theater by ID
//  * GET /api/theaters/{id}
//  */
// export async function getTheaterById(id) {
//   const resp = await apiCall(`/api/theaters/${id}`, {
//     method: "GET",
//     headers: withAuth(),
//   });
//   return resp.data;
// }
// src/utils/theaterAPI.js
// Create this file at: src/utils/theaterAPI.js
// src/utils/theaterAPI.js - Create this file
// src/utils/theaterAPI.js
// src/utils/theaterAPI.js
const API_BASE_URL = "http://localhost:8080";

const apiCall = async (endpoint, options = {}) => {
  const { headers: customHeaders = {}, ...rest } = options;
  const config = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
  };
  const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API request failed");
  return data;
};

const withAuth = () => {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getTheaters = async () => {
  try {
    const resp = await apiCall("/api/theaters", {
      method: "GET",
      headers: withAuth(),
    });
    return resp.data || [];
  } catch (error) {
    console.error("Failed to fetch theaters:", error);
    return [];
  }
};

export const createTheater = async (theaterData) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required");

  console.log("Creating theater with data:", theaterData);

  const resp = await apiCall("/api/theaters", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(theaterData),
  });
  return resp.data;
};

export const updateTheater = async (id, theaterData) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required");

  const resp = await apiCall(`/api/theaters/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(theaterData),
  });
  return resp.data;
};

export const deleteTheater = async (id) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required");

  await apiCall(`/api/theaters/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return true;
};
