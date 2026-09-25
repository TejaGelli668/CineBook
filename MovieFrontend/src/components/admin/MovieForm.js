import React, { useState, useEffect } from "react";
import { uploadMoviePoster } from "../../utils/movieAPI";
import TmdbImportPanel from "./TmdbImportPanel";
import { cinemaNow, cinemaToday, isoDate } from "../../utils/cinemaTime";
import { API_URL, assetUrl } from "../../config";
import {
  X,
  UploadCloud,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
} from "lucide-react";

const PREDEFINED_SHOWTIMES = [
  "10:00 AM",
  "01:00 PM",
  "04:00 PM",
  "07:00 PM",
  "10:00 PM",
];

const Pill = ({ text, onRemove }) => (
  <span className="cb-tag">
    {text}
    <button type="button" onClick={onRemove} aria-label={`Remove ${text}`}>
      <X size={13} />
    </button>
  </span>
);

const MovieForm = ({ movie, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    duration: "",
    rating: 0,
    language: "",
    releaseDate: "",
    price: 0,
    description: "",
    director: "",
    cast: [],
    trailer: "",
    posterUrl: "",
    format: [],
    certificate: "U",
    status: "Active",
    tmdbId: null,
    backdropUrl: "",
    theaters: [],
  });

  // Component State
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [castInput, setCastInput] = useState("");
  const [formatInput, setFormatInput] = useState("");

  // State for API-driven Theaters
  const [availableTheaters, setAvailableTheaters] = useState([]);
  const [theaterLoading, setTheaterLoading] = useState(true);
  const [theaterError, setTheaterError] = useState("");
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [showtimePrices, setShowtimePrices] = useState({});

  // State for Show Dates
  const [showDates, setShowDates] = useState([]);
  const [dateInput, setDateInput] = useState("");

  // State for Custom Showtimes
  const [customTimeInput, setCustomTimeInput] = useState("");
  const [customPriceInput, setCustomPriceInput] = useState("");

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  // API functions
  const API_BASE_URL = API_URL;

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

  const getTheaters = async () => {
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
  };

  const createShow = async (showData) => {
    try {
      const resp = await apiCall("/api/shows", {
        method: "POST",
        headers: withAuth(),
        body: JSON.stringify(showData),
      });
      return resp.data || resp;
    } catch (error) {
      console.error("Failed to create show:", error);
      throw error;
    }
  };

  // Get shows for a specific movie
  const getMovieShows = async (movieId) => {
    try {
      const resp = await apiCall(`/api/movies/${movieId}/shows`, {
        method: "GET",
        headers: withAuth(),
      });
      return resp.data || resp || [];
    } catch (error) {
      console.error("Failed to fetch movie shows:", error);
      return [];
    }
  };

  // Check admin status
  const checkAdminStatus = () => {
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("userToken");

    // Check if user has admin token or if user role is admin
    if (adminToken) {
      setIsAdmin(true);
    } else if (userToken) {
      try {
        // Decode token to check role (you might need to adjust this based on your token structure)
        const payload = JSON.parse(atob(userToken.split(".")[1]));
        setIsAdmin(payload.role === "ADMIN" || payload.role === "SUPER_ADMIN");
      } catch (error) {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  // Date handlers
  const handleAddDate = () => {
    console.log("Current dateInput:", dateInput);
    console.log("Current showDates:", showDates);

    if (dateInput && dateInput.trim() !== "") {
      // Convert to YYYY-MM-DD format if needed
      let formattedDate = dateInput;

      // If the input is in MM/DD/YYYY format, convert it
      if (dateInput.includes("/")) {
        const parts = dateInput.split("/");
        if (parts.length === 3) {
          const [month, day, year] = parts;
          formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
            2,
            "0"
          )}`;
        }
      }

      console.log("Formatted date:", formattedDate);

      if (!showDates.includes(formattedDate)) {
        // Ensure the date is not in the past - fix timezone issue
        const selectedDate = new Date(formattedDate + "T00:00:00"); // Add time to avoid timezone issues
        const today = cinemaNow();
        today.setHours(0, 0, 0, 0);

        console.log("Selected date:", selectedDate);
        console.log("Today:", today);

        // Compare dates properly without timezone issues
        const selectedDateString = selectedDate.toDateString();
        const todayString = today.toDateString();
        const isToday = selectedDateString === todayString;
        const isFuture = selectedDate > today;

        console.log("Selected date string:", selectedDateString);
        console.log("Today string:", todayString);
        console.log("Is today:", isToday);
        console.log("Is future:", isFuture);

        if (isToday || isFuture) {
          setShowDates((prev) => {
            const newDates = [...prev, formattedDate].sort();
            console.log("New show dates:", newDates);
            return newDates;
          });
          setDateInput("");
          console.log("Date added successfully");
        } else {
          setError("Cannot add dates in the past");
          setTimeout(() => setError(""), 3000);
          console.log("Date is in the past");
        }
      } else {
        console.log("Date already exists in the list");
      }
    } else {
      console.log("No date input provided");
    }
  };

  const handleRemoveDate = (dateToRemove) => {
    setShowDates((prev) => prev.filter((date) => date !== dateToRemove));
  };

  // Function to fetch shows for a movie and populate theaters
  const fetchMovieShows = async (movieId) => {
    try {
      console.log("=== FETCHING SHOWS FOR MOVIE ===", movieId);

      const shows = await getMovieShows(movieId);
      console.log("Fetched shows:", shows);

      if (shows && shows.length > 0) {
        // Group shows by theater
        const theaterMap = new Map();
        const initialPrices = {};
        const showDatesSet = new Set();

        shows.forEach((show) => {
          const theaterId = show.theater.id;
          const showTime = new Date(show.showTime);

          // Extract date and add to show dates
          const showDateStr = showTime.toISOString().split("T")[0];
          showDatesSet.add(showDateStr);

          // Convert to 12-hour format for UI
          const timeString = showTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          if (!theaterMap.has(theaterId)) {
            theaterMap.set(theaterId, {
              ...show.theater,
              showtimes: [],
            });
          }

          // Check if this time already exists
          const theater = theaterMap.get(theaterId);
          const existingShowtime = theater.showtimes.find(
            (st) => st.time === timeString
          );

          if (!existingShowtime) {
            theater.showtimes.push({
              time: timeString,
              price: show.ticketPrice,
            });

            // Also set the price in showtimePrices state
            const priceKey = `${theaterId}-${timeString}`;
            initialPrices[priceKey] = show.ticketPrice;
          }
        });

        // Convert map to array
        const theatersWithShows = Array.from(theaterMap.values());
        console.log("Processed theaters with shows:", theatersWithShows);

        // Update form data with theaters
        setFormData((prev) => ({
          ...prev,
          theaters: theatersWithShows,
        }));

        // Set showtime prices
        setShowtimePrices(initialPrices);

        // Set show dates
        setShowDates(Array.from(showDatesSet).sort());
      }
    } catch (error) {
      console.error("Failed to fetch movie shows:", error);
    }
  };

  useEffect(() => {
    // Check admin status
    checkAdminStatus();

    // Fetch theaters from API on component mount
    const fetchTheaters = async () => {
      try {
        setTheaterLoading(true);
        const theatersFromApi = await getTheaters();
        console.log("Fetched theaters:", theatersFromApi);
        setAvailableTheaters(theatersFromApi);
      } catch (err) {
        setTheaterError("Failed to load theaters. Please try again later.");
        console.error(err);
      } finally {
        setTheaterLoading(false);
      }
    };

    fetchTheaters();

    if (movie) {
      console.log("=== INITIALIZING MOVIE FOR EDITING ===");
      console.log("Movie data received:", JSON.stringify(movie, null, 2));

      // Initialize basic movie data
      const initialFormData = {
        title: movie.title || "",
        genre: movie.genre || "",
        duration: movie.duration || "",
        rating: movie.rating || 0,
        language: movie.language || "",
        releaseDate: movie.releaseDate
          ? new Date(movie.releaseDate).toISOString().split("T")[0]
          : "",
        price: movie.price || 0,
        description: movie.description || "",
        director: movie.director || "",
        cast: movie.cast || [],
        trailer: movie.trailer || "",
        posterUrl: movie.posterUrl || "",
        format: movie.format || [],
        certificate: movie.certificate || "U",
        status: movie.status || "Active",
        tmdbId: movie.tmdbId || null,
        backdropUrl: movie.backdropUrl || "",
        theaters: [], // We'll populate this separately
      };

      // Set poster preview
      setPosterPreview(
        movie.posterUrl ? assetUrl(movie.posterUrl) : ""
      );

      // Set initial form data without theaters first
      setFormData(initialFormData);

      // Now fetch the shows for this movie to populate theaters
      fetchMovieShows(movie.id);
    } else {
      // For new movies, set default dates (next 7 days)
      const defaultDates = [];
      for (let i = 0; i < 7; i++) {
        const date = cinemaNow();
        date.setDate(date.getDate() + i);
        defaultDates.push(isoDate(date));
      }
      setShowDates(defaultDates);
    }
  }, [movie]);

  // Handlers for Basic Inputs, Cast, Format, Poster
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "rating" || name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handlePosterChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPosterPreview(reader.result);
      reader.readAsDataURL(file);

      // If editing an existing movie, upload immediately
      if (movie?.id) {
        try {
          setLoading(true);
          const posterUrl = await uploadMoviePoster(file);
          setFormData((prev) => ({ ...prev, posterUrl }));
          setPosterPreview(assetUrl(posterUrl));
          console.log("Poster uploaded successfully:", posterUrl);
        } catch (error) {
          console.error("Failed to upload poster:", error);
          setError("Failed to upload poster: " + error.message);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Fill movie details from TMDB; keep price, formats, theaters and showtimes the admin set
  const handleTmdbImport = (tmdbMovie) => {
    setFormData((prev) => ({
      ...prev,
      title: tmdbMovie.title || prev.title,
      genre: tmdbMovie.genre || prev.genre,
      duration: tmdbMovie.duration || prev.duration,
      rating: tmdbMovie.rating ?? prev.rating,
      language: tmdbMovie.language || prev.language,
      releaseDate: tmdbMovie.releaseDate || prev.releaseDate,
      price: prev.price || tmdbMovie.price || 0,
      description: tmdbMovie.description || prev.description,
      director: tmdbMovie.director || prev.director,
      cast: tmdbMovie.cast?.length ? tmdbMovie.cast : prev.cast,
      trailer: tmdbMovie.trailer || prev.trailer,
      posterUrl: tmdbMovie.posterUrl || prev.posterUrl,
      format: prev.format.length ? prev.format : tmdbMovie.format || [],
      certificate: tmdbMovie.certificate || prev.certificate,
      status: tmdbMovie.status || prev.status,
      tmdbId: tmdbMovie.tmdbId,
      backdropUrl: tmdbMovie.backdropUrl || "",
    }));
    if (tmdbMovie.posterUrl) {
      setPosterFile(null);
      setPosterPreview(assetUrl(tmdbMovie.posterUrl));
    }
  };

  const handleAddCast = () => {
    if (castInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        cast: [...prev.cast, castInput.trim()],
      }));
      setCastInput("");
    }
  };

  const handleRemoveCast = (index) => {
    setFormData((prev) => ({
      ...prev,
      cast: prev.cast.filter((_, i) => i !== index),
    }));
  };

  const handleAddFormat = () => {
    if (formatInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        format: [...prev.format, formatInput.trim()],
      }));
      setFormatInput("");
    }
  };

  const handleRemoveFormat = (index) => {
    setFormData((prev) => ({
      ...prev,
      format: prev.format.filter((_, i) => i !== index),
    }));
  };

  // Fixed Handlers for Theaters & Showtimes
  const handleAddTheater = () => {
    if (
      selectedTheaterId &&
      !formData.theaters.find((t) => t.id === selectedTheaterId)
    ) {
      const theaterToAdd = availableTheaters.find(
        (t) => t.id.toString() === selectedTheaterId.toString()
      );
      if (theaterToAdd) {
        setFormData((prev) => ({
          ...prev,
          theaters: [...prev.theaters, { ...theaterToAdd, showtimes: [] }],
        }));
        setSelectedTheaterId("");
      }
    }
  };

  const handleRemoveTheater = (theaterId) => {
    setFormData((prev) => ({
      ...prev,
      theaters: prev.theaters.filter((t) => t.id !== theaterId),
    }));
    // Clean up showtime prices for this theater
    const updatedPrices = { ...showtimePrices };
    Object.keys(updatedPrices).forEach((key) => {
      if (key.startsWith(`${theaterId}-`)) {
        delete updatedPrices[key];
      }
    });
    setShowtimePrices(updatedPrices);
  };

  const handlePriceInputChange = (theaterId, time, price) => {
    const key = `${theaterId}-${time}`;
    setShowtimePrices((prev) => ({ ...prev, [key]: price }));

    // If the showtime is already selected, update its price in the main formData
    const theater = formData.theaters.find((t) => t.id === theaterId);
    if (theater && theater.showtimes.some((st) => st.time === time)) {
      setFormData((prev) => ({
        ...prev,
        theaters: prev.theaters.map((t) =>
          t.id === theaterId
            ? {
                ...t,
                showtimes: t.showtimes.map((st) =>
                  st.time === time
                    ? { ...st, price: parseFloat(price) || 0 }
                    : st
                ),
              }
            : t
        ),
      }));
    }
  };

  const handleToggleShowtime = (theaterId, time) => {
    const theaterIndex = formData.theaters.findIndex((t) => t.id === theaterId);
    if (theaterIndex === -1) return;

    const existingShowtimeIndex = formData.theaters[
      theaterIndex
    ].showtimes.findIndex((st) => st.time === time);
    const priceKey = `${theaterId}-${time}`;
    const price = parseFloat(showtimePrices[priceKey]) || formData.price || 250;

    const updatedTheaters = [...formData.theaters];

    if (existingShowtimeIndex > -1) {
      // Showtime exists, so remove it (untoggle)
      updatedTheaters[theaterIndex].showtimes.splice(existingShowtimeIndex, 1);
    } else {
      // Showtime doesn't exist, so add it (toggle on)
      updatedTheaters[theaterIndex].showtimes.push({ time, price });
    }

    setFormData((prev) => ({ ...prev, theaters: updatedTheaters }));
  };

  // Custom showtime handlers
  const handleAddCustomShowtime = (theaterId) => {
    if (!customTimeInput || !customPriceInput) {
      setError("Please enter both time and price for custom showtime");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(customTimeInput)) {
      setError("Please enter time in HH:MM format (24-hour)");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Convert 24-hour format to 12-hour format for consistency
    const convertTo12Hour = (time24) => {
      const [hours, minutes] = time24.split(":");
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 >= 12 ? "PM" : "AM";
      return `${hour12}:${minutes} ${period}`;
    };

    const time12h = convertTo12Hour(customTimeInput);
    const price = parseFloat(customPriceInput);

    const theaterIndex = formData.theaters.findIndex((t) => t.id === theaterId);
    if (theaterIndex === -1) return;

    // Check if this time already exists
    const existingShowtime = formData.theaters[theaterIndex].showtimes.find(
      (st) => st.time === time12h
    );

    if (existingShowtime) {
      setError("This showtime already exists for this theater");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Add the custom showtime
    const updatedTheaters = [...formData.theaters];
    updatedTheaters[theaterIndex].showtimes.push({ time: time12h, price });

    // Also update the showtime prices state
    const priceKey = `${theaterId}-${time12h}`;
    setShowtimePrices((prev) => ({ ...prev, [priceKey]: price }));

    setFormData((prev) => ({ ...prev, theaters: updatedTheaters }));

    // Clear inputs
    setCustomTimeInput("");
    setCustomPriceInput("");
  };

  const handleRemoveShowtime = (theaterId, time) => {
    const theaterIndex = formData.theaters.findIndex((t) => t.id === theaterId);
    if (theaterIndex === -1) return;

    const updatedTheaters = [...formData.theaters];
    updatedTheaters[theaterIndex].showtimes = updatedTheaters[
      theaterIndex
    ].showtimes.filter((st) => st.time !== time);

    setFormData((prev) => ({ ...prev, theaters: updatedTheaters }));

    // Clean up showtime price
    const priceKey = `${theaterId}-${time}`;
    const updatedPrices = { ...showtimePrices };
    delete updatedPrices[priceKey];
    setShowtimePrices(updatedPrices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("=== STARTING MOVIE SUBMISSION ===");
      console.log("Form Data:", JSON.stringify(formData, null, 2));
      console.log("Theaters to process:", formData.theaters?.length || 0);
      console.log("Show dates:", showDates);
      console.log("Is Admin:", isAdmin);

      formData.theaters?.forEach((theater, idx) => {
        console.log(`Theater ${idx + 1}:`, {
          id: theater.id,
          name: theater.name,
          showtimes: theater.showtimes?.length || 0,
        });
        theater.showtimes?.forEach((st, stIdx) => {
          console.log(`  Showtime ${stIdx + 1}:`, st);
        });
      });

      // Save the movie first
      console.log("=== SAVING MOVIE ===");
      const savedMovie = await onSave(formData, posterFile);
      console.log("Movie save response:", JSON.stringify(savedMovie, null, 2));

      // Only create shows if user is admin
      if (!isAdmin) {
        console.log("User is not admin - skipping show creation");
        onClose();
        return;
      }

      // Validate movie ID
      const movieId = savedMovie?.id || movie?.id;
      console.log("Movie ID for shows:", movieId);

      if (!movieId) {
        throw new Error("No movie ID available - cannot create shows");
      }

      // Create shows for each theater/showtime combination
      if (
        formData.theaters &&
        formData.theaters.length > 0 &&
        showDates.length > 0
      ) {
        console.log("=== CREATING SHOWS ===");

        const showCreationPromises = [];
        let totalShowsToCreate = 0;

        for (const theater of formData.theaters) {
          console.log(
            `Processing theater: ${theater.name} (ID: ${theater.id})`
          );

          if (!theater.showtimes || theater.showtimes.length === 0) {
            console.warn(`No showtimes for theater ${theater.name}`);
            continue;
          }

          for (const showtime of theater.showtimes) {
            console.log(
              `Processing showtime: ${showtime.time} at price ${showtime.price}`
            );

            // Convert 12-hour format to 24-hour for backend
            const convertTo24Hour = (time12h) => {
              console.log(`Converting time: ${time12h}`);
              const [time, modifier] = time12h.split(" ");
              let [hours, minutes] = time.split(":");
              hours = parseInt(hours, 10);

              if (hours === 12) {
                hours = modifier === "AM" ? 0 : 12;
              } else if (modifier === "PM") {
                hours += 12;
              }

              const result = `${hours.toString().padStart(2, "0")}:${minutes}`;
              console.log(`Converted ${time12h} to ${result}`);
              return result;
            };

            // Use selected dates or default to next 7 days
            const datesToProcess =
              showDates.length > 0
                ? showDates
                : (() => {
                    const dates = [];
                    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
                      const showDate = cinemaNow();
                      showDate.setDate(showDate.getDate() + dayOffset);
                      dates.push(isoDate(showDate));
                    }
                    return dates;
                  })();

            // Create shows for each selected date
            for (const dateString of datesToProcess) {
              const time24h = convertTo24Hour(showtime.time);
              const [hours, minutes] = time24h.split(":");

              // Create the show date with proper time WITHOUT timezone issues
              // Parse the date string components to avoid timezone interpretation
              const [year, month, day] = dateString.split("-");
              const showDateTime = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hours),
                parseInt(minutes),
                0,
                0
              );

              // Format as local time string WITHOUT UTC conversion
              const formatLocalDateTime = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const hours = String(date.getHours()).padStart(2, "0");
                const minutes = String(date.getMinutes()).padStart(2, "0");
                const seconds = String(date.getSeconds()).padStart(2, "0");
                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000`;
              };

              const isoString = formatLocalDateTime(showDateTime);

              const showData = {
                movie: { id: parseInt(movieId) },
                theater: { id: parseInt(theater.id) },
                showTime: isoString,
                ticketPrice:
                  parseFloat(showtime.price) ||
                  parseFloat(formData.price) ||
                  250,
              };

              console.log(
                `Show data for ${theater.name} on ${dateString}:`,
                showData
              );
              totalShowsToCreate++;

              // Add to promises array
              showCreationPromises.push(
                createShow(showData).catch((error) => {
                  console.error(
                    `Failed to create show for ${theater.name} at ${showtime.time} on ${dateString}:`,
                    error
                  );
                  return { error, showData };
                })
              );
            }
          }
        }

        console.log(`Total shows to create: ${totalShowsToCreate}`);

        if (showCreationPromises.length === 0) {
          console.warn("No shows to create!");
          setError("No valid showtimes found to create shows");
          return;
        }

        // Execute all show creation promises
        console.log("=== EXECUTING SHOW CREATION ===");
        const results = await Promise.allSettled(showCreationPromises);

        // Analyze results
        const successful = results.filter(
          (r) => r.status === "fulfilled" && !r.value?.error
        ).length;
        const failed = results.length - successful;

        console.log(
          `Show creation results: ${successful} successful, ${failed} failed out of ${results.length} total`
        );

        // Log failed attempts
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(`Promise ${index} rejected:`, result.reason);
          } else if (result.value?.error) {
            console.error(`Promise ${index} failed:`, result.value.error);
          }
        });

        if (successful === 0) {
          throw new Error(`Failed to create any shows (${failed} failures)`);
        } else if (failed > 0) {
          console.warn(
            `Partial success: ${successful} shows created, ${failed} failed`
          );
          setError(
            `Movie saved successfully, but ${failed} shows failed to create. Check console for details.`
          );
        }
      } else {
        console.log("No theaters or dates specified - skipping show creation");
      }

      console.log("=== SUBMISSION COMPLETE ===");
      onClose();
    } catch (err) {
      console.error("=== SUBMISSION FAILED ===");
      console.error("Error details:", err);
      console.error("Error stack:", err.stack);
      setError(err.message || "Failed to save movie");
    } finally {
      setLoading(false);
    }
  };

  const unselectedTheaters = availableTheaters.filter(
    (availTheater) =>
      !formData.theaters.some((selected) => selected.id === availTheater.id)
  );

  const displayDate = (date) => {
    const [year, month, day] = date.split("-");
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    ).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };

  const input = (name, label, props = {}) => (
    <div className="cb-field">
      <label htmlFor={`mf-${name}`} className="cb-label">
        {label}
      </label>
      <input
        id={`mf-${name}`}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className="cb-input"
        {...props}
      />
    </div>
  );

  return (
    <div className="cb-docket cb-sheet">
      <header className="cb-sheet__head">
        <div>
          <h2 className="cb-h2">{movie ? "Edit film" : "Add a film"}</h2>
          <p className="cb-muted cb-small">
            {movie
              ? "Changes appear on the site as soon as you save."
              : "Import from TMDB or fill in the details, then schedule shows."}
          </p>
        </div>
        <button type="button" className="cb-iconbtn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </header>

      <div className="cb-sheet__body">
        {error && (
          <div className="cb-alert cb-alert--error" style={{ marginBottom: 20 }} role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {!isAdmin && (
          <div className="cb-alert cb-alert--info" style={{ marginBottom: 20 }}>
            <AlertCircle size={18} aria-hidden="true" />
            <span>
              Only managers can schedule shows. You can still edit the film's
              details.
            </span>
          </div>
        )}

        <TmdbImportPanel onImport={handleTmdbImport} defaultOpen={!movie} />

        <section className="cb-sheet__section">
          <h3 className="cb-h3">Film details</h3>
          <div className="cb-mf-grid">
            <div className="cb-form">
              <div className="cb-form-row">
                {input("title", "Title", { required: true, placeholder: "Film title" })}
                {input("genre", "Genre", { required: true, placeholder: "Action, Drama" })}
              </div>
              <div className="cb-field">
                <label htmlFor="mf-description" className="cb-label">
                  Story
                </label>
                <textarea
                  id="mf-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="cb-textarea"
                  placeholder="One or two lines customers see on the film page"
                />
              </div>
              <div className="cb-form-row">
                {input("duration", "Runtime", { required: true, placeholder: "2h 30m" })}
                {input("language", "Language", { required: true, placeholder: "Telugu" })}
                {input("releaseDate", "Release date", { type: "date" })}
              </div>
              <div className="cb-form-row">
                {input("rating", "Rating (out of 10)", {
                  type: "number",
                  min: "0",
                  max: "10",
                  step: "0.1",
                  required: true,
                })}
                {input("director", "Director", { placeholder: "Director's name" })}
                <div className="cb-field">
                  <label htmlFor="mf-certificate" className="cb-label">
                    Certificate
                  </label>
                  <select
                    id="mf-certificate"
                    name="certificate"
                    value={formData.certificate}
                    onChange={handleInputChange}
                    className="cb-select"
                  >
                    <option value="U">U</option>
                    <option value="UA">U/A</option>
                    <option value="A">A</option>
                    <option value="S">S</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="cb-form">
              <div className="cb-field">
                <span className="cb-label">Poster</span>
                <label className="cb-posterdrop">
                  {posterPreview ? (
                    <img src={posterPreview} alt="Poster preview" />
                  ) : (
                    <span className="cb-posterdrop__empty">
                      <UploadCloud size={28} aria-hidden="true" />
                      Upload a poster
                      <span className="cb-muted cb-small">PNG or JPG, portrait</span>
                    </span>
                  )}
                  <input type="file" accept="image/*" onChange={handlePosterChange} />
                </label>
                {posterPreview && (
                  <p className="cb-help">Click the poster to replace it.</p>
                )}
              </div>
              <div className="cb-field">
                <label htmlFor="mf-trailer" className="cb-label">
                  Trailer link
                </label>
                <div className="cb-inline">
                  <input
                    id="mf-trailer"
                    type="url"
                    name="trailer"
                    value={formData.trailer}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/…"
                    className="cb-input"
                  />
                  {formData.trailer && (
                    <a
                      className="cb-btn cb-btn--ghost cb-btn--sm"
                      href={formData.trailer}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Test
                    </a>
                  )}
                </div>
              </div>
              {input("price", "Default ticket price (₹)", {
                type: "number",
                min: "0",
                placeholder: "250",
              })}
            </div>
          </div>
        </section>

        <section className="cb-sheet__section">
          <h3 className="cb-h3">Cast and formats</h3>
          <div className="cb-form-row">
            <div className="cb-field">
              <label htmlFor="mf-cast" className="cb-label">
                Cast
              </label>
              <div className="cb-inline">
                <input
                  id="mf-cast"
                  type="text"
                  value={castInput}
                  onChange={(e) => setCastInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddCast())
                  }
                  placeholder="Name, then Enter"
                  className="cb-input"
                />
                <button type="button" className="cb-iconbtn" onClick={handleAddCast} aria-label="Add cast member">
                  <Plus size={16} />
                </button>
              </div>
              <div className="cb-tags">
                {formData.cast.length > 0 ? (
                  formData.cast.map((member, index) => (
                    <Pill key={index} text={member} onRemove={() => handleRemoveCast(index)} />
                  ))
                ) : (
                  <span className="cb-muted cb-small">No cast added</span>
                )}
              </div>
            </div>
            <div className="cb-field">
              <label htmlFor="mf-format" className="cb-label">
                Formats
              </label>
              <div className="cb-inline">
                <input
                  id="mf-format"
                  type="text"
                  value={formatInput}
                  onChange={(e) => setFormatInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddFormat())
                  }
                  placeholder="2D, 3D, IMAX"
                  className="cb-input"
                />
                <button type="button" className="cb-iconbtn" onClick={handleAddFormat} aria-label="Add format">
                  <Plus size={16} />
                </button>
              </div>
              <div className="cb-tags">
                {formData.format.length > 0 ? (
                  formData.format.map((fmt, index) => (
                    <Pill key={index} text={fmt} onRemove={() => handleRemoveFormat(index)} />
                  ))
                ) : (
                  <span className="cb-muted cb-small">No formats added</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {isAdmin && (
          <>
            <section className="cb-sheet__section">
              <h3 className="cb-h3">
                <Calendar size={18} aria-hidden="true" /> Show dates
              </h3>
              <p className="cb-muted cb-small" style={{ marginBottom: 12 }}>
                Leave empty to schedule the next 7 days.
              </p>
              <div className="cb-inline" style={{ maxWidth: 360 }}>
                <input
                  type="date"
                  aria-label="Show date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  min={cinemaToday()}
                  className="cb-input"
                />
                <button
                  type="button"
                  className="cb-btn cb-btn--pink cb-btn--sm"
                  onClick={handleAddDate}
                  disabled={!dateInput || dateInput.trim() === ""}
                >
                  Add date
                </button>
              </div>
              <div className="cb-tags">
                {showDates.length > 0 ? (
                  showDates.map((date) => (
                    <Pill key={date} text={displayDate(date)} onRemove={() => handleRemoveDate(date)} />
                  ))
                ) : (
                  <span className="cb-muted cb-small">Next 7 days</span>
                )}
              </div>
            </section>

            <section className="cb-sheet__section">
              <h3 className="cb-h3">
                <MapPin size={18} aria-hidden="true" /> Theaters and showtimes
              </h3>
              {theaterLoading ? (
                <p className="cb-muted">Loading theaters…</p>
              ) : theaterError ? (
                <div className="cb-alert cb-alert--error">
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>{theaterError}</span>
                </div>
              ) : (
                <div className="cb-inline" style={{ maxWidth: 520, marginBottom: 18 }}>
                  <select
                    aria-label="Theater to schedule"
                    value={selectedTheaterId}
                    onChange={(e) => setSelectedTheaterId(e.target.value)}
                    className="cb-select"
                    disabled={unselectedTheaters.length === 0}
                  >
                    <option value="">
                      {unselectedTheaters.length === 0
                        ? "Every theater is added"
                        : "Choose a theater"}
                    </option>
                    {unselectedTheaters.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.city})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="cb-btn cb-btn--pink cb-btn--sm"
                    onClick={handleAddTheater}
                    disabled={!selectedTheaterId}
                  >
                    Add theater
                  </button>
                </div>
              )}

              {formData.theaters.length > 0 ? (
                <div className="cb-stack">
                  {formData.theaters.map((theater) => (
                    <div key={theater.id} className="cb-panel cb-mf-theater">
                      <div className="cb-panel__head">
                        <div>
                          <p className="cb-mf-theater__name">{theater.name}</p>
                          <p className="cb-muted cb-small">{theater.city}</p>
                        </div>
                        <button
                          type="button"
                          className="cb-iconbtn cb-iconbtn--danger"
                          onClick={() => handleRemoveTheater(theater.id)}
                          aria-label={`Remove ${theater.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <p className="cb-label" style={{ marginBottom: 8 }}>
                        Standard times
                      </p>
                      <div className="cb-mf-times">
                        {PREDEFINED_SHOWTIMES.map((time) => {
                          const isSelected = theater.showtimes?.some((st) => st.time === time);
                          const priceKey = `${theater.id}-${time}`;
                          return (
                            <div key={time} className="cb-mf-time">
                              <button
                                type="button"
                                className="cb-chip"
                                aria-pressed={isSelected}
                                onClick={() => handleToggleShowtime(theater.id, time)}
                              >
                                <Clock size={14} aria-hidden="true" /> {time}
                              </button>
                              {isSelected && (
                                <label className="cb-mf-price">
                                  <span>₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    aria-label={`Price for ${time}`}
                                    value={showtimePrices[priceKey] || formData.price || ""}
                                    onChange={(e) =>
                                      handlePriceInputChange(theater.id, time, e.target.value)
                                    }
                                    className="cb-input"
                                  />
                                </label>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="cb-mf-custom">
                        <div className="cb-field">
                          <label className="cb-label" htmlFor={`mf-ct-${theater.id}`}>
                            Other time
                          </label>
                          <input
                            id={`mf-ct-${theater.id}`}
                            type="time"
                            value={customTimeInput}
                            onChange={(e) => setCustomTimeInput(e.target.value)}
                            className="cb-input"
                          />
                        </div>
                        <div className="cb-field">
                          <label className="cb-label" htmlFor={`mf-cp-${theater.id}`}>
                            Price (₹)
                          </label>
                          <input
                            id={`mf-cp-${theater.id}`}
                            type="number"
                            min="0"
                            value={customPriceInput}
                            onChange={(e) => setCustomPriceInput(e.target.value)}
                            className="cb-input"
                            placeholder="250"
                          />
                        </div>
                        <button
                          type="button"
                          className="cb-btn cb-btn--ghost"
                          onClick={() => handleAddCustomShowtime(theater.id)}
                        >
                          Add time
                        </button>
                      </div>

                      {theater.showtimes && theater.showtimes.length > 0 && (
                        <div className="cb-tags" style={{ marginTop: 14 }}>
                          {theater.showtimes.map((showtime, index) => (
                            <Pill
                              key={index}
                              text={`${showtime.time}, ₹${showtime.price}`}
                              onRemove={() => handleRemoveShowtime(theater.id, showtime.time)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="cb-muted">
                  No theaters yet. Choose one above to add showtimes.
                </p>
              )}
            </section>
          </>
        )}
      </div>

      <footer className="cb-sheet__foot">
        <button type="button" className="cb-btn cb-btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="cb-btn cb-btn--stamp"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading && <span className="cb-spinner cb-spinner--sm" />}
          {loading ? "Saving…" : movie ? "Save changes" : "Add film"}
        </button>
      </footer>
    </div>
  );
};

export default MovieForm;
