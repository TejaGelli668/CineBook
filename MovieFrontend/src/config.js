// Where the CineBook backend lives. Set REACT_APP_API_URL when building for the
// live site (e.g. https://cinebook-api.onrender.com); local development uses port 8080.
export const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:8080").replace(/\/+$/, "");

// Images are stored either as full URLs (TMDB, Supabase Storage) or as paths on
// the backend ("/uploads/..."). This gives a usable URL for either.
export const assetUrl = (path) => {
  if (!path) return null;
  return /^(https?:|data:|blob:)/.test(path) ? path : `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
