import { assetUrl } from "../config";
// TMDB serves every image at several widths. Swap the width in a TMDB URL;
// any other URL (our own uploads) is returned unchanged.
const TMDB = /(image\.tmdb\.org\/t\/p\/)(w\d+|original)\//;

export const tmdbSize = (url, size) =>
  url && TMDB.test(url) ? url.replace(TMDB, `$1${size}/`) : url;

// srcSet for a full-width TMDB backdrop, so phones take the lighter file
export const tmdbSrcSet = (url) =>
  url && TMDB.test(url)
    ? `${tmdbSize(url, "w780")} 780w, ${tmdbSize(url, "w1280")} 1280w`
    : undefined;

// Posters are TMDB URLs, Supabase Storage URLs or older "/uploads/..." paths
export const posterSrc = (movie) => assetUrl(movie?.posterUrl);
