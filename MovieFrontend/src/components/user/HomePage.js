// import React, { useState } from "react";
// import { Search, MapPin, User, LogOut } from "lucide-react";

// const HomePage = ({
//   onMovieSelect,
//   onLoginClick,
//   isUserLoggedIn,
//   currentUser,
//   onUserLogout,
//   onDashboardClick,
// }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedLocation, setSelectedLocation] = useState("Mumbai");

//   // Sample movie data
//   const movies = [
//     {
//       id: 1,
//       title: "Avengers: Endgame",
//       rating: 8.4,
//       duration: "3h 1m",
//       price: 300,
//       genre: "Action",
//       image: "/api/placeholder/300/400",
//       description:
//         "The Avengers assemble once more to reverse the damage caused by Thanos.",
//     },
//     {
//       id: 2,
//       title: "Spider-Man: No Way Home",
//       rating: 8.2,
//       duration: "2h 28m",
//       price: 250,
//       genre: "Action",
//       image: "/api/placeholder/300/400",
//       description:
//         "Spider-Man's identity is revealed, bringing his superhero duties into conflict with his normal life.",
//     },
//     {
//       id: 3,
//       title: "Dune: Part Two",
//       rating: 8.6,
//       duration: "2h 46m",
//       price: 280,
//       genre: "Sci-Fi",
//       image: "/api/placeholder/300/400",
//       description:
//         "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators.",
//     },
//     {
//       id: 4,
//       title: "Top Gun: Maverick",
//       rating: 8.3,
//       duration: "2h 11m",
//       price: 270,
//       genre: "Action",
//       image: "/api/placeholder/300/400",
//       description:
//         "After thirty years, Maverick is still pushing the envelope as a top naval aviator.",
//     },
//   ];

//   const filteredMovies = movies.filter((movie) =>
//     movie.title.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
//       {/* Header */}
//       <header className="relative z-10 bg-black bg-opacity-20 backdrop-blur-lg border-b border-white border-opacity-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo */}
//             <div className="flex items-center">
//               <h1 className="text-2xl font-bold text-white">CineBook</h1>
//             </div>

//             {/* Search Bar */}
//             <div className="flex-1 max-w-lg mx-8">
//               <div className="relative">
//                 <Search
//                   className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-60"
//                   size={20}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Search for movies..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 backdrop-blur-xl rounded-full text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-20 focus:outline-none focus:border-opacity-40"
//                 />
//               </div>
//             </div>

//             {/* Right Side - Location and Auth */}
//             <div className="flex items-center space-x-4">
//               {/* Location Selector */}
//               <div className="flex items-center space-x-2 text-white">
//                 <MapPin size={20} className="text-white text-opacity-75" />
//                 <select
//                   value={selectedLocation}
//                   onChange={(e) => setSelectedLocation(e.target.value)}
//                   className="bg-transparent text-white focus:outline-none cursor-pointer"
//                 >
//                   <option value="Mumbai" className="text-black">
//                     Mumbai
//                   </option>
//                   <option value="Delhi" className="text-black">
//                     Delhi
//                   </option>
//                   <option value="Bangalore" className="text-black">
//                     Bangalore
//                   </option>
//                   <option value="Chennai" className="text-black">
//                     Chennai
//                   </option>
//                 </select>
//               </div>

//               {/* Authentication Section */}
//               {isUserLoggedIn && currentUser ? (
//                 <div className="flex items-center space-x-3">
//                   <span className="text-white text-opacity-75">
//                     {currentUser.email?.split("@")[0] || "User"}
//                   </span>
//                   <button
//                     onClick={onDashboardClick}
//                     className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
//                   >
//                     <User size={16} />
//                     <span>Dashboard</span>
//                   </button>
//                   <button
//                     onClick={onUserLogout}
//                     className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2"
//                   >
//                     <LogOut size={16} />
//                     <span>Logout</span>
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   onClick={onLoginClick}
//                   className="px-6 py-2 bg-gradient-to-r from-red-500 to-yellow-400 hover:from-red-600 hover:to-yellow-500 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
//                 >
//                   Sign In
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       {isUserLoggedIn && currentUser && (
//         <section className="relative py-16 px-4">
//           <div className="max-w-7xl mx-auto">
//             <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-2xl border border-white border-opacity-20 p-8">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-4xl font-bold text-white mb-2">
//                     Welcome back, {currentUser.email?.split("@")[0] || "User"}!
//                     🎬
//                   </h2>
//                   <p className="text-white text-opacity-75 text-lg">
//                     Ready to book your next movie experience? Explore the latest
//                     blockbusters below.
//                   </p>
//                 </div>
//                 <button
//                   onClick={onDashboardClick}
//                   className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
//                 >
//                   View My Bookings
//                 </button>
//               </div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Movies Section */}
//       <section className="py-16 px-4">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h2 className="text-3xl font-bold text-white mb-2">
//                 Now Showing
//               </h2>
//               <p className="text-white text-opacity-75">
//                 Discover the latest blockbusters • {filteredMovies.length}{" "}
//                 movies available
//               </p>
//             </div>
//             <div className="text-white text-opacity-60">{selectedLocation}</div>
//           </div>

//           {/* Movies Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {filteredMovies.map((movie) => (
//               <div
//                 key={movie.id}
//                 className="group bg-white bg-opacity-10 backdrop-blur-xl rounded-xl border border-white border-opacity-20 overflow-hidden hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105"
//               >
//                 {/* Movie Poster */}
//                 <div className="relative h-64 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
//                   <div className="absolute top-3 left-3 flex items-center space-x-2">
//                     <span className="flex items-center space-x-1 bg-black bg-opacity-50 px-2 py-1 rounded-full text-white text-sm">
//                       <span className="text-yellow-400">★</span>
//                       <span>{movie.rating}</span>
//                     </span>
//                     <span className="bg-gradient-to-r from-purple-500 to-pink-600 px-2 py-1 rounded-full text-white text-xs font-semibold">
//                       {movie.genre}
//                     </span>
//                   </div>
//                   <div className="text-white text-6xl opacity-30">🎬</div>
//                   <div className="absolute bottom-3 left-3 right-3">
//                     <span className="inline-block bg-green-500 bg-opacity-80 text-white px-2 py-1 rounded text-sm font-semibold">
//                       Ready to Book
//                     </span>
//                   </div>
//                 </div>

//                 {/* Movie Info */}
//                 <div className="p-4">
//                   <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
//                     {movie.title}
//                   </h3>
//                   <p className="text-white text-opacity-60 text-sm mb-3 line-clamp-2">
//                     {movie.description}
//                   </p>

//                   <div className="flex items-center justify-between text-white text-opacity-75 text-sm mb-4">
//                     <span className="flex items-center space-x-1">
//                       <span>⏱️</span>
//                       <span>{movie.duration}</span>
//                     </span>
//                     <span className="text-green-400 font-bold text-lg">
//                       ₹{movie.price}
//                     </span>
//                   </div>

//                   <button
//                     onClick={() => onMovieSelect(movie)}
//                     className="w-full py-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 transform group-hover:scale-105"
//                   >
//                     Book Now
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* No Results */}
//           {filteredMovies.length === 0 && (
//             <div className="text-center py-16">
//               <div className="text-6xl mb-4">🎭</div>
//               <h3 className="text-2xl font-bold text-white mb-2">
//                 No movies found
//               </h3>
//               <p className="text-white text-opacity-60">
//                 Try adjusting your search or check back later for new releases.
//               </p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-16 px-4 bg-black bg-opacity-20">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold text-white mb-4">
//               Why Choose CineBook?
//             </h2>
//             <p className="text-white text-opacity-75 max-w-2xl mx-auto">
//               Experience the best of cinema with our premium booking platform
//               designed for movie lovers.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="text-center">
//               <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <span className="text-2xl">🎟️</span>
//               </div>
//               <h3 className="text-xl font-bold text-white mb-2">
//                 Easy Booking
//               </h3>
//               <p className="text-white text-opacity-60">
//                 Book your tickets in just a few clicks with our intuitive
//                 interface.
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <span className="text-2xl">💺</span>
//               </div>
//               <h3 className="text-xl font-bold text-white mb-2">Best Seats</h3>
//               <p className="text-white text-opacity-60">
//                 Choose from the best available seats with our interactive seat
//                 selection.
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <span className="text-2xl">🏆</span>
//               </div>
//               <h3 className="text-xl font-bold text-white mb-2">
//                 Premium Experience
//               </h3>
//               <p className="text-white text-opacity-60">
//                 Enjoy a premium movie experience with top-quality theaters and
//                 service.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };
// export default HomePage;
// src/components/user/HomePage.jsx

// import React, { useState, useEffect } from "react";
// import { Search, MapPin, User, LogOut } from "lucide-react";
// import { getMovies, formatMovieData } from "../../utils/movieAPI"; // adjust path if needed

// const HomePage = ({
//   onMovieSelect,
//   onLoginClick,
//   isUserLoggedIn,
//   currentUser,
//   onUserLogout,
//   onDashboardClick,
// }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedLocation, setSelectedLocation] = useState("Mumbai");
//   const [movies, setMovies] = useState([]);

//   // ─── Fetch live movies on mount ─────────────────────────────────────────────
//   useEffect(() => {
//     (async () => {
//       try {
//         const raw = await getMovies();
//         setMovies(raw.map(formatMovieData));
//         console.log("GET /api/movies->", raw);
//       } catch (err) {
//         console.error("Failed to load movies:", err);
//       }
//     })();
//   }, []);

//   // ─── Search filter ───────────────────────────────────────────────────────────
//   const filteredMovies = movies.filter((m) =>
//     m.title.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
//       {/* Header */}
//       <header className="relative z-10 bg-black bg-opacity-20 backdrop-blur-lg border-b border-white border-opacity-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <h1 className="text-2xl font-bold text-white">CineBook</h1>

//             {/* Search Bar */}
//             <div className="flex-1 max-w-lg mx-8">
//               <div className="relative">
//                 <Search
//                   size={20}
//                   className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-60"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Search for movies..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 backdrop-blur-xl rounded-full text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-20 focus:outline-none focus:border-opacity-40"
//                 />
//               </div>
//             </div>

//             {/* Location & Auth */}
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2 text-white">
//                 <MapPin size={20} className="text-opacity-75" />
//                 <select
//                   value={selectedLocation}
//                   onChange={(e) => setSelectedLocation(e.target.value)}
//                   className="bg-transparent text-white focus:outline-none cursor-pointer"
//                 >
//                   {["Mumbai", "Delhi", "Bangalore", "Chennai"].map((loc) => (
//                     <option key={loc} value={loc} className="text-black">
//                       {loc}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {isUserLoggedIn && currentUser ? (
//                 <div className="flex items-center space-x-3">
//                   <span className="text-white text-opacity-75">
//                     {currentUser.email.split("@")[0]}
//                   </span>
//                   <button
//                     onClick={onDashboardClick}
//                     className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center space-x-2 hover:from-blue-600 hover:to-purple-700 transition"
//                   >
//                     <User size={16} />
//                     <span>Dashboard</span>
//                   </button>
//                   <button
//                     onClick={onUserLogout}
//                     className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2 transition"
//                   >
//                     <LogOut size={16} />
//                     <span>Logout</span>
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   onClick={onLoginClick}
//                   className="px-6 py-2 bg-gradient-to-r from-red-500 to-yellow-400 text-white rounded-lg font-semibold hover:from-red-600 hover:to-yellow-500 transition transform hover:scale-105"
//                 >
//                   Sign In
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Hero */}
//       {isUserLoggedIn && currentUser && (
//         <section className="py-16 px-4">
//           <div className="max-w-7xl mx-auto bg-white bg-opacity-10 backdrop-blur-xl rounded-2xl border border-white border-opacity-20 p-8 flex items-center justify-between">
//             <div>
//               <h2 className="text-4xl font-bold text-white mb-2">
//                 Welcome back, {currentUser.email.split("@")[0]}! 🎬
//               </h2>
//               <p className="text-white text-opacity-75">
//                 Ready to book your next movie? Explore below.
//               </p>
//             </div>
//             <button
//               onClick={onDashboardClick}
//               className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition transform hover:scale-105"
//             >
//               View My Bookings
//             </button>
//           </div>
//         </section>
//       )}

//       {/* Movies Grid */}
//       <section className="py-16 px-4">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h2 className="text-3xl font-bold text-white mb-2">
//                 Now Showing
//               </h2>
//               <p className="text-white text-opacity-75">
//                 {filteredMovies.length} movies available
//               </p>
//             </div>
//             <div className="text-white text-opacity-60">{selectedLocation}</div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {filteredMovies.map((movie) => (
//               <div
//                 key={movie.id}
//                 className="group bg-white bg-opacity-10 backdrop-blur-xl rounded-xl border border-white border-opacity-20 overflow-hidden hover:bg-opacity-20 transition transform hover:scale-105"
//               >
//                 {/* Poster */}
//                 <div className="relative h-64 bg-gray-800 flex items-center justify-center">
//                   <img
//                     src={movie.poster}
//                     alt={movie.title}
//                     className="object-cover w-full h-full"
//                   />
//                   <div className="absolute top-3 left-3 flex items-center space-x-2">
//                     <span className="bg-black bg-opacity-50 px-2 py-1 rounded-full text-white text-sm flex items-center">
//                       ★<span className="ml-1">{movie.rating}</span>
//                     </span>
//                     <span className="bg-gradient-to-r from-purple-500 to-pink-600 px-2 py-1 rounded-full text-white text-xs font-semibold">
//                       {movie.genre}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Info */}
//                 <div className="p-4">
//                   <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition">
//                     {movie.title}
//                   </h3>
//                   <p className="text-white text-opacity-60 text-sm mb-3 line-clamp-2">
//                     {movie.description}
//                   </p>
//                   <div className="flex items-center justify-between text-white text-opacity-75 text-sm mb-4">
//                     <span className="flex items-center space-x-1">
//                       ⏱️ <span>{movie.duration}</span>
//                     </span>
//                     <span className="text-green-400 font-bold text-lg">
//                       ₹{movie.price}
//                     </span>
//                   </div>
//                   <button
//                     onClick={() => onMovieSelect(movie)}
//                     className="w-full py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition transform group-hover:scale-105"
//                   >
//                     Book Now
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {filteredMovies.length === 0 && (
//             <div className="text-center py-16 text-white">
//               <div className="text-6xl mb-4">🎭</div>
//               <h3 className="text-2xl font-bold">No movies found</h3>
//               <p className="text-opacity-60">Try again later.</p>
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// };

// export default HomePage;
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
                  {["Mumbai", "Delhi", "Bangalore", "Chennai"].map((loc) => (
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
