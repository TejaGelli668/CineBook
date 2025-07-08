import React, { useState, useEffect } from "react";
import { uploadMoviePoster } from "../../utils/movieAPI";
import {
  X,
  UploadCloud,
  Plus,
  Loader2,
  Trash2,
  Clock,
  AlertCircle,
  MapPin,
  DollarSign,
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
  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-600/20 text-purple-300 border border-purple-500/30">
    {text}
    <button
      type="button"
      onClick={onRemove}
      className="flex-shrink-0 ml-2 p-0.5 text-purple-400 hover:bg-purple-500/20 hover:text-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
    >
      <span className="sr-only">Remove {text}</span>
      <X size={14} />
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
        const today = new Date();
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
        theaters: [], // We'll populate this separately
      };

      // Set poster preview
      setPosterPreview(
        movie.posterUrl ? `http://localhost:8080${movie.posterUrl}` : ""
      );

      // Set initial form data without theaters first
      setFormData(initialFormData);

      // Now fetch the shows for this movie to populate theaters
      fetchMovieShows(movie.id);
    } else {
      // For new movies, set default dates (next 7 days)
      const defaultDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        defaultDates.push(date.toISOString().split("T")[0]);
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
          setPosterPreview(`http://localhost:8080${posterUrl}`);
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
                      const today = new Date();
                      const showDate = new Date(today);
                      showDate.setDate(today.getDate() + dayOffset);
                      dates.push(showDate.toISOString().split("T")[0]);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            {movie ? "Edit Movie Details" : "Add a New Movie"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>
                <strong>Error:</strong> {error}
              </span>
            </div>
          )}

          {!isAdmin && (
            <div className="mb-6 p-4 bg-blue-900/50 border border-blue-500/50 text-blue-300 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>
                <strong>Note:</strong> Only admins can add theaters and create
                shows. You can add movie details, but theater scheduling is
                restricted to administrators.
              </span>
            </div>
          )}

          {/* Core Details & Poster Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-300">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter movie title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Genre *
                  </label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Action, Sci-Fi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter movie description"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="2h 30m"
                    required
                    className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Language *
                  </label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="English"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Release Date
                  </label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Rating *
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    step="0.1"
                    required
                    className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="8.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Director
                  </label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Director name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Certificate
                  </label>
                  <select
                    name="certificate"
                    value={formData.certificate}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="U">U</option>
                    <option value="UA">U/A</option>
                    <option value="A">A</option>
                    <option value="S">S</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Poster Upload and Trailer URL */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Movie Poster
                </label>
                <label className="relative flex flex-col items-center justify-center w-full h-80 border-2 border-slate-600 border-dashed rounded-xl cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 transition-all">
                  {posterPreview ? (
                    <img
                      src={posterPreview}
                      alt="Poster preview"
                      className="absolute inset-0 w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <UploadCloud className="mx-auto h-16 w-16 mb-4" />
                      <p className="text-lg font-medium">
                        Click to upload poster
                      </p>
                      <p className="text-sm">PNG or JPG</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Trailer URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    name="trailer"
                    value={formData.trailer}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/..."
                    className="flex-1 p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {formData.trailer && (
                    <button
                      type="button"
                      onClick={() => window.open(formData.trailer, "_blank")}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12l-6-4h12l-6 4z" />
                      </svg>
                      <span>Play</span>
                    </button>
                  )}
                </div>
                {formData.trailer && (
                  <p className="text-slate-400 text-xs mt-1">
                    Click Play to test the trailer link
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Default Ticket Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="250"
                />
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-slate-700"></div>

          {/* Cast & Formats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Cast Members
              </label>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={castInput}
                  onChange={(e) => setCastInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddCast())
                  }
                  placeholder="Add member & press Enter"
                  className="flex-1 p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddCast}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                {formData.cast.length > 0 ? (
                  formData.cast.map((member, index) => (
                    <Pill
                      key={index}
                      text={member}
                      onRemove={() => handleRemoveCast(index)}
                    />
                  ))
                ) : (
                  <span className="text-slate-500 text-sm">
                    No cast members added
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Available Formats
              </label>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={formatInput}
                  onChange={(e) => setFormatInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddFormat())
                  }
                  placeholder="e.g., 2D, IMAX"
                  className="flex-1 p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddFormat}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                {formData.format.length > 0 ? (
                  formData.format.map((fmt, index) => (
                    <Pill
                      key={index}
                      text={fmt}
                      onRemove={() => handleRemoveFormat(index)}
                    />
                  ))
                ) : (
                  <span className="text-slate-500 text-sm">
                    No formats added
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Admin-only sections */}
          {isAdmin && (
            <>
              <div className="my-8 border-t border-slate-700"></div>

              {/* Show Dates Selection */}
              <div>
                <h3 className="text-xl font-semibold text-slate-200 mb-6 flex items-center">
                  <Calendar size={24} className="mr-3 text-purple-400" />
                  Show Dates
                </h3>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Add Show Dates
                  </label>
                  <div className="flex space-x-3 mb-4">
                    <input
                      type="date"
                      value={dateInput}
                      onChange={(e) => {
                        console.log("Date input changed:", e.target.value);
                        setDateInput(e.target.value);
                      }}
                      min={new Date().toISOString().split("T")[0]} // Prevent past dates
                      className="flex-1 p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        console.log("Add date button clicked");
                        handleAddDate();
                      }}
                      className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!dateInput || dateInput.trim() === ""}
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {showDates.length > 0 ? (
                      showDates.map((date) => (
                        <span
                          key={date}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-600/20 text-blue-300 border border-blue-500/30"
                        >
                          {(() => {
                            // Fix timezone display issue by creating date properly
                            const [year, month, day] = date.split("-");
                            const displayDate = new Date(
                              parseInt(year),
                              parseInt(month) - 1,
                              parseInt(day)
                            );
                            return displayDate.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            });
                          })()}
                          <button
                            type="button"
                            onClick={() => handleRemoveDate(date)}
                            className="flex-shrink-0 ml-2 p-0.5 text-blue-400 hover:bg-blue-500/20 hover:text-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm">
                        No dates selected (will default to next 7 days)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="my-8 border-t border-slate-700"></div>

              {/* Theaters & Showtimes Section */}
              <div>
                <h3 className="text-xl font-semibold text-slate-200 mb-6 flex items-center">
                  <MapPin size={24} className="mr-3 text-purple-400" />
                  Theaters & Showtimes
                </h3>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Add Theater to Schedule
                  </label>
                  {theaterLoading ? (
                    <div className="flex items-center text-slate-400 py-4">
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Loading theaters...
                    </div>
                  ) : theaterError ? (
                    <div className="flex items-center text-red-400 py-4">
                      <AlertCircle className="mr-3 h-5 w-5" />
                      {theaterError}
                    </div>
                  ) : (
                    <div className="flex space-x-3">
                      <select
                        value={selectedTheaterId}
                        onChange={(e) => setSelectedTheaterId(e.target.value)}
                        className="flex-1 p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        disabled={unselectedTheaters.length === 0}
                      >
                        <option value="">
                          {unselectedTheaters.length === 0
                            ? "All theaters added"
                            : "-- Select a Theater --"}
                        </option>
                        {unselectedTheaters.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.city})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddTheater}
                        className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!selectedTheaterId}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {formData.theaters.length > 0 ? (
                    formData.theaters.map((theater) => (
                      <div
                        key={theater.id}
                        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 transition-all"
                      >
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h4 className="text-lg font-semibold text-slate-200">
                              {theater.name}
                            </h4>
                            <p className="text-sm text-slate-400 flex items-center mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {theater.city}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTheater(theater.id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                          {PREDEFINED_SHOWTIMES.map((time) => {
                            const isSelected = theater.showtimes?.some(
                              (st) => st.time === time
                            );
                            const priceKey = `${theater.id}-${time}`;
                            return (
                              <div key={time} className="space-y-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleShowtime(theater.id, time)
                                  }
                                  className={`w-full text-sm font-semibold p-3 rounded-xl transition-all flex items-center justify-center ${
                                    isSelected
                                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                                      : "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600"
                                  }`}
                                >
                                  <Clock size={14} className="mr-2" /> {time}
                                </button>
                                {isSelected && (
                                  <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                      <DollarSign size={16} />
                                    </span>
                                    <input
                                      type="number"
                                      placeholder="Price"
                                      min="0"
                                      value={
                                        showtimePrices[priceKey] ||
                                        formData.price ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        handlePriceInputChange(
                                          theater.id,
                                          time,
                                          e.target.value
                                        )
                                      }
                                      className="w-full pl-10 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Custom Showtime Section */}
                        <div className="mt-6 pt-6 border-t border-slate-600">
                          <h5 className="text-lg font-medium text-slate-200 mb-4">
                            Add Custom Showtime
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Time (24-hour format)
                              </label>
                              <input
                                type="time"
                                value={customTimeInput}
                                onChange={(e) =>
                                  setCustomTimeInput(e.target.value)
                                }
                                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="HH:MM"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Price (₹)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={customPriceInput}
                                onChange={(e) =>
                                  setCustomPriceInput(e.target.value)
                                }
                                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Enter price"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddCustomShowtime(theater.id)
                                }
                                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                              >
                                Add Custom Time
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Display Current Showtimes */}
                        {theater.showtimes && theater.showtimes.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-slate-600">
                            <h5 className="text-lg font-medium text-slate-200 mb-4">
                              Current Showtimes
                            </h5>
                            <div className="flex flex-wrap gap-3">
                              {theater.showtimes.map((showtime, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30"
                                >
                                  <Clock size={16} className="mr-2" />
                                  <span className="font-medium">
                                    {showtime.time}
                                  </span>
                                  <span className="mx-2 text-blue-400">•</span>
                                  <span>₹{showtime.price}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveShowtime(
                                        theater.id,
                                        showtime.time
                                      )
                                    }
                                    className="ml-3 p-1 text-blue-400 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500">
                      <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                      <p className="text-lg font-medium mb-2">
                        No theaters scheduled for this movie
                      </p>
                      <p className="text-sm">
                        Use the dropdown above to add theaters and schedule
                        showtimes
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Form Actions Footer */}
          <div className="mt-12 pt-6 border-t border-slate-700 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700/50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {loading ? "Saving..." : movie ? "Update Movie" : "Add Movie"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieForm;
