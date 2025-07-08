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

// Get shows for a specific movie
export async function getShowsByMovie(id) {
  try {
    const resp = await apiCall(`/api/movies/${id}/shows`, {
      method: "GET",
      headers: withAuth(),
    });
    // Return the shows data
    return resp.data || resp || [];
  } catch (error) {
    console.error("Failed to fetch shows for movie:", id, error);
    return [];
  }
}

// Get all shows (for general use)
export async function getAllShows() {
  try {
    const resp = await apiCall("/api/shows", {
      method: "GET",
      headers: withAuth(),
    });
    return resp.data || resp || [];
  } catch (error) {
    console.error("Failed to fetch all shows:", error);
    return [];
  }
}

// Get theaters
export async function getTheaters() {
  try {
    const resp = await apiCall("/api/theaters", {
      method: "GET",
      headers: withAuth(),
    });
    return resp.data || resp || [];
  } catch (error) {
    console.error("Failed to fetch theaters:", error);
    return [];
  }
}

// Get movies with their shows and theaters
export async function getMoviesWithShows() {
  try {
    const movies = await getMovies();
    const moviesWithShows = await Promise.all(
      movies.map(async (movie) => {
        const shows = await getShowsByMovie(movie.id);

        // Group shows by theater and extract unique theaters
        const theaterMap = new Map();
        const showtimes = [];

        shows.forEach((show) => {
          const theaterId = show.theater.id;
          const theaterName = show.theater.name;
          const theaterCity = show.theater.city;
          const showTime = new Date(show.showTime);

          // Convert to readable time format
          const timeString = showTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          if (!theaterMap.has(theaterId)) {
            theaterMap.set(theaterId, {
              id: theaterId,
              name: theaterName,
              city: theaterCity,
              showtimes: [],
            });
          }

          theaterMap.get(theaterId).showtimes.push({
            time: timeString,
            price: show.ticketPrice,
            showId: show.id,
            fullDateTime: show.showTime,
          });

          showtimes.push({
            id: show.id,
            time: timeString,
            price: show.ticketPrice,
            theater: {
              id: theaterId,
              name: theaterName,
              city: theaterCity,
            },
            fullDateTime: show.showTime,
          });
        });

        return {
          ...movie,
          theaters: Array.from(theaterMap.values()),
          showtimes: showtimes,
          hasShows: shows.length > 0,
        };
      })
    );

    return moviesWithShows;
  } catch (error) {
    console.error("Failed to fetch movies with shows:", error);
    return [];
  }
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

export const updateMoviePoster = async (movieId, file) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required");

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE_URL}/movies/${movieId}/upload-poster`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data.data;
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
  // Include theater and showtime info if available
  theaters: m.theaters || [],
  showtimes: m.showtimes || [],
  hasShows: m.hasShows || false,
});

// ─── **NEW**: export the low-level helpers so other modules can use them ─────────
export { apiCall, withAuth };
