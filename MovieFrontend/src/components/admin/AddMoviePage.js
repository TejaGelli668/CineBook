import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Upload,
  Star,
  Clock,
  Users,
  Calendar,
  X,
} from "lucide-react";

const AddMoviePage = ({
  onBack,
  onSave,
  initialData = null,
  isEditing = false,
}) => {
  const [movieData, setMovieData] = useState({
    title: "",
    genre: "",
    rating: "",
    duration: "",
    language: "",
    releaseDate: "",
    price: "",
    description: "",
    director: "",
    cast: "",
    poster: "",
    trailer: "",
    certificate: "",
    format: [],
    status: "Active",
  });

  const [posterPreview, setPosterPreview] = useState("");
  const [errors, setErrors] = useState({});

  // Load initial data if editing
  useEffect(() => {
    if (isEditing && initialData) {
      setMovieData({
        title: initialData.title || "",
        genre: initialData.genre || "",
        rating: initialData.rating || "",
        duration: initialData.duration || "",
        language: initialData.language || "",
        releaseDate: initialData.releaseDate || "",
        price: initialData.price || "",
        description: initialData.description || "",
        director: initialData.director || "",
        cast: Array.isArray(initialData.cast)
          ? initialData.cast.join(", ")
          : initialData.cast || "",
        poster: initialData.poster || "",
        trailer: initialData.trailer || "",
        certificate: initialData.certificate || "",
        format: initialData.format || [],
        status: initialData.status || "Active",
      });
      setPosterPreview(initialData.poster || "");
    }
  }, [isEditing, initialData]);

  const genres = [
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Sport",
    "Thriller",
    "War",
    "Western",
  ];

  const languages = [
    "English",
    "Hindi",
    "Tamil",
    "Telugu",
    "Malayalam",
    "Kannada",
    "Bengali",
    "Marathi",
    "Gujarati",
    "Punjabi",
    "Spanish",
    "French",
  ];

  const certificates = ["U", "UA", "A", "S"];
  const formats = ["2D", "3D", "IMAX", "4DX", "DOLBY ATMOS"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMovieData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFormatChange = (format) => {
    setMovieData((prev) => ({
      ...prev,
      format: prev.format.includes(format)
        ? prev.format.filter((f) => f !== format)
        : [...prev.format, format],
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPosterPreview(event.target.result);
        setMovieData((prev) => ({
          ...prev,
          poster: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePoster = () => {
    setPosterPreview("");
    setMovieData((prev) => ({ ...prev, poster: "" }));
    // Reset file input
    const fileInput = document.getElementById("poster-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!movieData.title.trim()) newErrors.title = "Title is required";
    if (!movieData.genre) newErrors.genre = "Genre is required";
    if (!movieData.duration.trim()) newErrors.duration = "Duration is required";
    if (!movieData.language) newErrors.language = "Language is required";
    if (!movieData.releaseDate)
      newErrors.releaseDate = "Release date is required";
    if (!movieData.price || isNaN(movieData.price))
      newErrors.price = "Valid price is required";
    if (!movieData.description.trim())
      newErrors.description = "Description is required";
    if (!movieData.director.trim()) newErrors.director = "Director is required";
    if (!movieData.cast.trim()) newErrors.cast = "Cast is required";
    if (
      !movieData.rating ||
      isNaN(movieData.rating) ||
      movieData.rating < 0 ||
      movieData.rating > 10
    ) {
      newErrors.rating = "Rating must be between 0 and 10";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const newMovie = {
        ...movieData,
        id: isEditing ? initialData.id : Date.now().toString(),
        cast: movieData.cast.split(",").map((actor) => actor.trim()),
        price: parseInt(movieData.price),
        rating: parseFloat(movieData.rating),
      };
      onSave(newMovie);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEditing ? "Edit Movie" : "Add New Movie"}
          </h1>
          <p className="text-slate-600">Fill in the movie details below</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Star className="w-5 h-5 mr-2 text-purple-500" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Movie Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={movieData.title}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.title ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Enter movie title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Genre *
                </label>
                <select
                  name="genre"
                  value={movieData.genre}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.genre ? "border-red-500" : "border-slate-300"
                  }`}
                >
                  <option value="">Select Genre</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
                {errors.genre && (
                  <p className="text-red-500 text-sm mt-1">{errors.genre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={movieData.duration}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.duration ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="e.g., 2h 30m"
                />
                {errors.duration && (
                  <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Language *
                </label>
                <select
                  name="language"
                  value={movieData.language}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.language ? "border-red-500" : "border-slate-300"
                  }`}
                >
                  <option value="">Select Language</option>
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
                {errors.language && (
                  <p className="text-red-500 text-sm mt-1">{errors.language}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rating *
                </label>
                <input
                  type="number"
                  name="rating"
                  value={movieData.rating}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="10"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.rating ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="e.g., 8.5"
                />
                {errors.rating && (
                  <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Release Date *
                </label>
                <input
                  type="date"
                  name="releaseDate"
                  value={movieData.releaseDate}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.releaseDate ? "border-red-500" : "border-slate-300"
                  }`}
                />
                {errors.releaseDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.releaseDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ticket Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={movieData.price}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.price ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="e.g., 250"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Certificate
                </label>
                <select
                  name="certificate"
                  value={movieData.certificate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Certificate</option>
                  {certificates.map((cert) => (
                    <option key={cert} value={cert}>
                      {cert}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={movieData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.description ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="Enter movie description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Cast & Crew */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Cast & Crew
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Director *
                </label>
                <input
                  type="text"
                  name="director"
                  value={movieData.director}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.director ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Enter director name"
                />
                {errors.director && (
                  <p className="text-red-500 text-sm mt-1">{errors.director}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cast * (comma separated)
                </label>
                <input
                  type="text"
                  name="cast"
                  value={movieData.cast}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.cast ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="e.g., Tom Cruise, Jennifer Connelly, Miles Teller"
                />
                {errors.cast && (
                  <p className="text-red-500 text-sm mt-1">{errors.cast}</p>
                )}
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-green-500" />
              Media
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Movie Poster
                </label>
                <div className="space-y-4">
                  {posterPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={posterPreview}
                        alt="Poster preview"
                        className="w-32 h-48 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePoster}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-600 mb-2">Upload movie poster</p>
                      <p className="text-xs text-slate-500">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    id="poster-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trailer URL (YouTube)
                </label>
                <input
                  type="url"
                  name="trailer"
                  value={movieData.trailer}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Technical Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Available Formats
              </label>
              <div className="flex flex-wrap gap-3">
                {formats.map((format) => (
                  <label
                    key={format}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={movieData.format.includes(format)}
                      onChange={() => handleFormatChange(format)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-slate-700">{format}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={movieData.status}
                onChange={handleInputChange}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              {isEditing ? "Update Movie" : "Add Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMoviePage;
