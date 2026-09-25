// src/utils/tmdbAPI.js
// Admin-only TMDB endpoints. The backend proxies TMDB so the API key stays server-side.
import { apiCall } from "./movieAPI";

const adminHeaders = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required");
  return { Authorization: `Bearer ${token}` };
};

const get = (endpoint) =>
  apiCall(`/api/admin/tmdb${endpoint}`, {
    method: "GET",
    headers: adminHeaders(),
  }).then((r) => r.data);

export const getTmdbStatus = () => get("/status");

export const searchTmdb = (query, page = 1) =>
  get(`/search?query=${encodeURIComponent(query)}&page=${page}`);

export const getTmdbNowPlaying = (page = 1) => get(`/now-playing?page=${page}`);

export const getTmdbUpcoming = (page = 1) => get(`/upcoming?page=${page}`);

// Returns { movie, existingMovieId } — movie is mapped to our Movie shape, unsaved
export const getTmdbMovie = (tmdbId) => get(`/movies/${tmdbId}`);
