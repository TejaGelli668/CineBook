import React, { useState, useEffect } from "react";
import { Search, MapPin, User, LogOut } from "lucide-react";
import { getMovies, formatMovieData } from "../../utils/movieAPI";

const HomePage = ({
  onMovieSelect,
  onLoginClick,
  isUserLoggedIn,
  currentUser,
  onUserLogout,
  onDashboardClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Mumbai");
  const [movies, setMovies] = useState([]);

  // Fetch live movies on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await getMovies();
        setMovies(raw.map(formatMovieData));
      } catch (err) {
        console.error("Failed to load movies:", err);
      }
    })();
  }, []);

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Debug log to check if prop is received
  useEffect(() => {
    console.log("HomePage onDashboardClick prop:", onDashboardClick);
  }, [onDashboardClick]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="relative z-10 bg-black bg-opacity-20 backdrop-blur-lg border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-white">CineBook</h1>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-60"
                />
                <input
                  type="text"
                  placeholder="Search for movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 backdrop-blur-xl rounded-full text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-20 focus:outline-none focus:border-opacity-40"
                />
              </div>
            </div>

            {/* Location & Auth */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <MapPin size={20} className="text-opacity-75" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  {["Hyderabad", "More Cities Coming Soon"].map((loc) => (
                    <option key={loc} value={loc} className="text-black">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {isUserLoggedIn && currentUser ? (
                <div className="flex items-center space-x-3">
                  <span className="text-white text-opacity-75">
                    {currentUser.email
                      ? currentUser.email.split("@")[0]
                      : "User"}
                  </span>
                  {/* FIXED: Added safety check and debug log */}
                  <button
                    onClick={() => {
                      console.log("Dashboard button clicked in header");
                      if (onDashboardClick) {
                        onDashboardClick();
                      } else {
                        console.error("onDashboardClick is not defined");
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center space-x-2 hover:from-blue-600 hover:to-purple-700 transition"
                  >
                    <User size={16} />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={onUserLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2 transition"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-yellow-400 text-white rounded-lg font-semibold hover:from-red-600 hover:to-yellow-500 transition transform hover:scale-105"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Welcome Banner for Logged In Users */}
      {isUserLoggedIn && currentUser && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto bg-white bg-opacity-10 backdrop-blur-xl rounded-2xl border border-white border-opacity-20 p-8 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                Welcome back,{" "}
                {currentUser.email ? currentUser.email.split("@")[0] : "User"}!
                🎬
              </h2>
              <p className="text-white text-opacity-75">
                Ready to book your next movie? Explore below.
              </p>
            </div>
            {/* FIXED: Added safety check and debug log */}
            <button
              onClick={() => {
                console.log("Dashboard button clicked in hero section");
                if (onDashboardClick) {
                  onDashboardClick();
                } else {
                  console.error("onDashboardClick is not defined");
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition transform hover:scale-105"
            >
              View My Bookings
            </button>
          </div>
        </section>
      )}

      {/* Movies Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Now Showing
              </h2>
              <p className="text-white text-opacity-75">
                {filteredMovies.length} movies available
              </p>
            </div>
            <div className="text-white text-opacity-60">{selectedLocation}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="group bg-white bg-opacity-10 backdrop-blur-xl rounded-xl border border-white border-opacity-20 overflow-hidden hover:bg-opacity-20 transition transform hover:scale-105"
              >
                {/* Poster */}
                <div className="relative h-64 bg-gray-800 flex items-center justify-center">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="hidden items-center justify-center w-full h-full text-white text-opacity-50">
                    No Image
                  </div>
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="bg-black bg-opacity-50 px-2 py-1 rounded-full text-white text-sm flex items-center">
                      ★<span className="ml-1">{movie.rating}</span>
                    </span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-600 px-2 py-1 rounded-full text-white text-xs font-semibold">
                      {movie.genre}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition">
                    {movie.title}
                  </h3>
                  <p className="text-white text-opacity-60 text-sm mb-3 line-clamp-2">
                    {movie.description}
                  </p>
                  <div className="flex items-center justify-between text-white text-opacity-75 text-sm mb-4">
                    <span className="flex items-center space-x-1">
                      ⏱️ <span>{movie.duration}</span>
                    </span>
                    <span className="text-green-400 font-bold text-lg">
                      ₹{movie.price}
                    </span>
                  </div>
                  <button
                    onClick={() => onMovieSelect(movie)}
                    className="w-full py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition transform group-hover:scale-105"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredMovies.length === 0 && (
            <div className="text-center py-16 text-white">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-2xl font-bold">No movies found</h3>
              <p className="text-opacity-60">
                {searchQuery
                  ? "Try a different search term."
                  : "Try again later."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
