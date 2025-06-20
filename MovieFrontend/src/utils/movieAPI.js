// // src/utils/movieAPI.js

// const API_BASE_URL = "http://localhost:8080";

// // Generic API helper – always forces JSON content type
// const apiCall = async (endpoint, options = {}) => {
//   const { headers: customHeaders = {}, ...rest } = options;
//   const config = {
//     ...rest,
//     headers: {
//       "Content-Type": "application/json",
//       ...customHeaders,
//     },
//   };

//   try {
//     const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
//     const data = await res.json();
//     if (!res.ok) {
//       throw new Error(data.message || "API request failed");
//     }
//     return data;
//   } catch (err) {
//     console.error("API Error:", err);
//     throw err;
//   }
// };

// // Include auth header when we have a token
// const withAuth = () => {
//   const token =
//     localStorage.getItem("adminToken") || localStorage.getItem("userToken");
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// // ─── Movie Endpoints ────────────────────────────────────────────────────────────

// // Get all movies (public or admin)
// export const getMovies = async () => {
//   try {
//     const resp = await apiCall("/movies", {
//       method: "GET",
//       headers: withAuth(),
//     });
//     return resp.data || [];
//   } catch {
//     return [];
//   }
// };

// // Get single movie by ID
// export const getMovie = (id) =>
//   apiCall(`/movies/${id}`, { method: "GET", headers: withAuth() }).then(
//     (r) => r.data
//   );

// // Add new movie (Admin only)
// export const addMovie = (movie) => {
//   const token = localStorage.getItem("adminToken");
//   if (!token) throw new Error("Admin authentication required");
//   return apiCall("/movies", {
//     method: "POST",
//     headers: { Authorization: `Bearer ${token}` },
//     body: JSON.stringify(movie),
//   }).then((r) => r.data);
// };

// // Update movie (Admin only)
// export const updateMovie = (id, movie) => {
//   const token = localStorage.getItem("adminToken");
//   if (!token) throw new Error("Admin authentication required");
//   return apiCall(`/movies/${id}`, {
//     method: "PUT",
//     headers: { Authorization: `Bearer ${token}` },
//     body: JSON.stringify(movie),
//   }).then((r) => r.data);
// };

// // Delete movie (Admin only)
// export const deleteMovie = (id) => {
//   const token = localStorage.getItem("adminToken");
//   if (!token) throw new Error("Admin authentication required");
//   return apiCall(`/movies/${id}`, {
//     method: "DELETE",
//     headers: { Authorization: `Bearer ${token}` },
//   }).then(() => true);
// };

// // Optional: upload a poster file
// export const uploadMoviePoster = async (file) => {
//   const token = localStorage.getItem("adminToken");
//   if (!token) throw new Error("Admin authentication required");

//   const form = new FormData();
//   form.append("file", file);

//   const res = await fetch(`${API_BASE_URL}/movies/upload-poster`, {
//     method: "POST",
//     headers: { Authorization: `Bearer ${token}` },
//     body: form,
//   });
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.message || "Upload failed");
//   return data.data.posterUrl;
// };

// // Massage raw movie for your UI
// export const formatMovieData = (m) => ({
//   ...m,
//   poster: m.posterUrl
//     ? `http://localhost:8080${m.posterUrl}`
//     : "/api/placeholder/300/400",
//   price: m.price || 0,
//   rating: m.rating || 0,
//   duration: m.duration || "N/A",
//   genre: m.genre || "N/A",
//   status: m.status || "Active",
// });
// src/utils/movieAPI.js

const API_BASE_URL = "http://localhost:8080";

// Generic API helper – always forces JSON content type
const apiCall = async (endpoint, options = {}) => {
  const { headers: customHeaders = {}, ...rest } = options;
  const config = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
  };
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "API request failed");
    }
    return data;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
};

// Include auth header when we have a token
const withAuth = () => {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Movie Endpoints ────────────────────────────────────────────────────────────

// Get all movies (public or admin)
export const getMovies = async () => {
  try {
    const resp = await apiCall("/movies", {
      method: "GET",
      headers: withAuth(),
    });
    return resp.data || [];
  } catch {
    return [];
  }
};

// Get single movie by ID
export const getMovie = (id) =>
  apiCall(`/movies/${id}`, { method: "GET", headers: withAuth() }).then(
    (r) => r.data
  );

// ▶️ NEW: Get all shows for a given movie
// utils/movieAPI.js
// ▶️ NEW: Get all shows for a given movie
export async function getShowsByMovie(id) {
  try {
    // calls your generic apiCall, which already knows API_BASE_URL + JSON error handling + auth headers
    const resp = await apiCall(`/api/shows/movie/${id}`, {
      method: "GET",
      headers: withAuth(),
    });
    // your backend returns { success, message, data }, or maybe just an array
    return Array.isArray(resp) ? resp : resp.data || [];
  } catch (err) {
    console.error("Failed to load shows", err);
    return [];
  }
}

// Add new movie (Admin only)
export const addMovie = (movie) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required");
  return apiCall("/movies", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(movie),
  }).then((r) => r.data);
};

// Update movie (Admin only)
export const updateMovie = (id, movie) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required");
  return apiCall(`/movies/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(movie),
  }).then((r) => r.data);
};

// Delete movie (Admin only)
export const deleteMovie = (id) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required");
  return apiCall(`/movies/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  }).then(() => true);
};

// Optional: upload a poster file
export const uploadMoviePoster = async (file) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required");

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE_URL}/movies/upload-poster`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data.data.posterUrl;
};

// Massage raw movie for your UI
export const formatMovieData = (m) => ({
  ...m,
  poster: m.posterUrl
    ? `http://localhost:8080${m.posterUrl}`
    : "/api/placeholder/300/400",
  price: m.price || 0,
  rating: m.rating || 0,
  duration: m.duration || "N/A",
  genre: m.genre || "N/A",
  status: m.status || "Active",
});
