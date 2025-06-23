import React, { useState, useEffect } from "react";
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

  useEffect(() => {
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
      // FIXED: Better initialization for editing movies
      console.log("Initializing movie for editing:", movie);

      // Convert existing theater data to UI format
      const uiTheaters = (movie.theaters || []).map((theater) => ({
        ...theater,
        showtimes: theater.showtimes || [],
      }));

      setFormData({
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
        theaters: uiTheaters,
      });

      setPosterPreview(
        movie.posterUrl ? `http://localhost:8080${movie.posterUrl}` : ""
      );

      // FIXED: Pre-fill the showtime prices from the movie's theater data
      const initialPrices = {};
      uiTheaters.forEach((theater) => {
        theater.showtimes?.forEach((showtime) => {
          const key = `${theater.id}-${showtime.time}`;
          initialPrices[key] = showtime.price;
        });
      });
      console.log("Setting initial prices:", initialPrices);
      setShowtimePrices(initialPrices);
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

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPosterPreview(reader.result);
      reader.readAsDataURL(file);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Submitting Movie Data:", formData);

      // Save the movie first
      const savedMovie = await onSave(formData);
      console.log("Movie saved:", savedMovie);

      // Create shows for each theater/showtime combination
      if (formData.theaters && formData.theaters.length > 0) {
        const movieId = savedMovie?.id || movie?.id;
        if (movieId) {
          console.log("Creating shows for movie ID:", movieId);

          for (const theater of formData.theaters) {
            for (const showtime of theater.showtimes || []) {
              try {
                // Convert 12-hour format to 24-hour for backend
                const convertTo24Hour = (time12h) => {
                  const [time, modifier] = time12h.split(" ");
                  let [hours, minutes] = time.split(":");
                  if (hours === "12") {
                    hours = "00";
                  }
                  if (modifier === "PM") {
                    hours = parseInt(hours, 10) + 12;
                  }
                  return `${hours}:${minutes}`;
                };

                // Create show time for today + next 7 days
                for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
                  // FIXED: Use simple date construction without timezone adjustments
                  const today = new Date();
                  const showDate = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate() + dayOffset
                  );

                  const time24h = convertTo24Hour(showtime.time);
                  const [hours, minutes] = time24h.split(":");
                  showDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                  // FIXED: Create ISO string without timezone manipulation
                  const year = showDate.getFullYear();
                  const month = String(showDate.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const day = String(showDate.getDate()).padStart(2, "0");
                  const hour = String(showDate.getHours()).padStart(2, "0");
                  const minute = String(showDate.getMinutes()).padStart(2, "0");

                  const isoString = `${year}-${month}-${day}T${hour}:${minute}:00`;

                  const showData = {
                    movie: { id: movieId },
                    theater: { id: theater.id },
                    showTime: isoString,
                    ticketPrice: showtime.price || formData.price || 250,
                  };

                  console.log("Creating show:", showData);
                  await createShow(showData);
                }
              } catch (showError) {
                console.error("Error creating show:", showError);
                // Continue with other shows even if one fails
              }
            }
          }
        }
      }

      onClose();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
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
                <input
                  type="url"
                  name="trailer"
                  value={formData.trailer}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/..."
                  className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
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
