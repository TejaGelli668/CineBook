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
  const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API request failed");
  return data;
};

// Include auth header when we have a token
const withAuth = () => {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Movie Endpoints ────────────────────────────────────────────────────────────
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

export const getMovie = (id) =>
  apiCall(`/movies/${id}`, { method: "GET", headers: withAuth() }).then(
    (r) => r.data
  );

export async function getShowsByMovie(id) {
  const resp = await apiCall(`/api/shows/movie/${id}`, {
    method: "GET",
    headers: withAuth(),
  });
  // backend returns an array directly
  return Array.isArray(resp) ? resp : resp.data || [];
}

export const addMovie = (movie) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required");
  return apiCall("/movies", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(movie),
  }).then((r) => r.data);
};

export const updateMovie = (id, movie) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required");
  return apiCall(`/movies/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(movie),
  }).then((r) => r.data);
};

export const deleteMovie = (id) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required");
  return apiCall(`/movies/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  }).then(() => true);
};

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

// ─── **NEW**: export the low-level helpers so other modules can use them ─────────
export { apiCall, withAuth };
