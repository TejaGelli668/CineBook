import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { addMovie, updateMovie, uploadMoviePoster } from "../../utils/movieAPI";

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
  });

  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [castInput, setCastInput] = useState("");
  const [formatInput, setFormatInput] = useState("");

  useEffect(() => {
    if (movie) {
      setFormData({
        ...movie,
        releaseDate: movie.releaseDate || "",
        cast: movie.cast || [],
        format: movie.format || [],
      });
      setPosterPreview(
        movie.posterUrl ? `http://localhost:8080${movie.posterUrl}` : ""
      );
    }
  }, [movie]);

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
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let posterUrl = formData.posterUrl;

      // Upload poster if new file selected
      if (posterFile) {
        try {
          posterUrl = await uploadMoviePoster(posterFile);
        } catch (uploadError) {
          console.error("Poster upload failed:", uploadError);
          // Continue with existing poster URL if upload fails
        }
      }

      const movieData = {
        ...formData,
        posterUrl,
        price: parseFloat(formData.price) || 0,
        rating: parseFloat(formData.rating) || 0,
      };

      let savedMovie;
      if (movie && movie.id) {
        savedMovie = await updateMovie(movie.id, movieData);
      } else {
        savedMovie = await addMovie(movieData);
      }

      onSave(savedMovie);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save movie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {movie ? "Edit Movie" : "Add New Movie"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre *
                </label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 2h 30m"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language *
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Release Date
                </label>
                <input
                  type="date"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Additional Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Director
                </label>
                <input
                  type="text"
                  name="director"
                  value={formData.director}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate
                </label>
                <select
                  name="certificate"
                  value={formData.certificate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="U">U</option>
                  <option value="UA">U/A</option>
                  <option value="A">A</option>
                  <option value="S">S</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trailer URL
                </label>
                <input
                  type="url"
                  name="trailer"
                  value={formData.trailer}
                  onChange={handleInputChange}
                  placeholder="YouTube URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Poster Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Movie Poster
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer transition-colors">
                    <Upload size={16} className="mr-2" />
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePosterChange}
                      className="hidden"
                    />
                  </label>
                  {posterPreview && (
                    <img
                      src={posterPreview}
                      alt="Poster preview"
                      className="h-20 w-14 object-cover rounded"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Fields */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Cast Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cast Members
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={castInput}
                  onChange={(e) => setCastInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddCast())
                  }
                  placeholder="Add cast member"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddCast}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.cast.map((member, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
                  >
                    {member}
                    <button
                      type="button"
                      onClick={() => handleRemoveCast(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Formats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formats
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={formatInput}
                  onChange={(e) => setFormatInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddFormat())
                  }
                  placeholder="e.g., 2D, 3D, IMAX"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddFormat}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.format.map((fmt, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
                  >
                    {fmt}
                    <button
                      type="button"
                      onClick={() => handleRemoveFormat(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : movie ? "Update Movie" : "Add Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;
