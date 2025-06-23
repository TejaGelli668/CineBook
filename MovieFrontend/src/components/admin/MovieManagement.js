// import React from "react";
// import { Star } from "lucide-react";

// const MovieManagement = ({
//   movies,
//   searchTerm,
//   onAddMovie,
//   onEditMovie,
//   onDeleteMovie,
// }) => {
//   const filteredMovies = movies.filter(
//     (movie) =>
//       movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleEditClick = (movie) => {
//     if (onEditMovie) {
//       onEditMovie(movie);
//     }
//   };

//   const handleDeleteClick = (movieId) => {
//     if (window.confirm("Are you sure you want to delete this movie?")) {
//       if (onDeleteMovie) {
//         onDeleteMovie(movieId);
//       }
//     }
//   };

//   const MovieCard = ({ movie }) => (
//     <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
//       <div className="relative">
//         <img
//           src={movie.poster}
//           alt={movie.title}
//           className="w-full h-48 object-cover"
//         />
//         <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-sm flex items-center">
//           <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
//           {movie.rating}
//         </div>
//       </div>
//       <div className="p-6">
//         <h3 className="text-xl font-bold text-slate-800 mb-2">{movie.title}</h3>
//         <p className="text-slate-600 text-sm mb-3">{movie.genre}</p>
//         <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
//           <span>{movie.duration}</span>
//           <span>₹{movie.price}</span>
//         </div>
//         <div className="flex justify-between items-center">
//           <span
//             className={`px-3 py-1 rounded-full text-xs font-medium ${
//               movie.status === "Active"
//                 ? "bg-green-100 text-green-800"
//                 : "bg-red-100 text-red-800"
//             }`}
//           >
//             {movie.status}
//           </span>
//           <div className="flex space-x-2">
//             <button
//               className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
//               onClick={() => handleEditClick(movie)}
//               title="Edit Movie"
//             >
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                 />
//               </svg>
//             </button>
//             <button
//               className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
//               onClick={() => handleDeleteClick(movie.id)}
//               title="Delete Movie"
//             >
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-xl font-bold text-slate-800">Movies Management</h3>
//         <button
//           className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
//           onClick={onAddMovie}
//         >
//           Add New Movie
//         </button>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredMovies.map((movie) => (
//           <MovieCard key={movie.id} movie={movie} />
//         ))}
//       </div>
//       {filteredMovies.length === 0 && (
//         <div className="text-center py-12">
//           <div className="text-slate-400 mb-4">
//             <svg
//               className="w-16 h-16 mx-auto"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z"
//               />
//             </svg>
//           </div>
//           <h3 className="text-xl font-semibold text-slate-600 mb-2">
//             No Movies Found
//           </h3>
//           <p className="text-slate-500">
//             Try adjusting your search criteria or add a new movie
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MovieManagement;
import React from "react";
import {
  Star,
  Edit,
  Trash2,
  Plus,
  Film,
  Calendar,
  Clock,
  IndianRupee,
} from "lucide-react";

const MovieManagement = ({
  movies,
  searchTerm,
  onAddMovie,
  onEditMovie,
  onDeleteMovie,
}) => {
  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (movie) => {
    if (onEditMovie) {
      onEditMovie(movie);
    }
  };

  const handleDeleteClick = (movieId) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      if (onDeleteMovie) {
        onDeleteMovie(movieId);
      }
    }
  };

  const MovieCard = ({ movie }) => (
    <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-slate-600/30">
      <div className="relative">
        <div className="relative overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center border border-white/20">
          <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{movie.rating}</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              movie.status === "Active"
                ? "bg-green-500/20 text-green-300 border-green-400/30"
                : "bg-red-500/20 text-red-300 border-red-400/30"
            }`}
          >
            {movie.status}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="p-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-full transition-colors backdrop-blur-sm border border-blue-400/30"
            onClick={() => handleEditClick(movie)}
            title="Edit Movie"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm border border-red-400/30"
            onClick={() => handleDeleteClick(movie.id)}
            title="Delete Movie"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
          {movie.title}
        </h3>

        <div className="flex items-center text-slate-300 text-sm mb-3">
          <Film className="w-4 h-4 mr-2 text-purple-400" />
          <span>{movie.genre}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-slate-400 text-sm">
            <Clock className="w-4 h-4 mr-2 text-blue-400" />
            <span>{movie.duration}</span>
          </div>
          <div className="flex items-center text-slate-400 text-sm">
            <IndianRupee className="w-4 h-4 mr-1 text-green-400" />
            <span className="font-semibold text-green-300">{movie.price}</span>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-600/50">
          <div className="text-xs text-slate-400">
            <span className="block">Language: {movie.language}</span>
            <span className="block mt-1">Certificate: {movie.certificate}</span>
          </div>
          <div className="text-xs text-slate-400 text-right">
            <span className="block">Release Date</span>
            <span className="block mt-1 text-slate-300">
              {movie.releaseDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl border border-white/10 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Movies Management
          </h2>
          <p className="text-slate-300">
            Manage your movie catalog and showtimes
          </p>
        </div>
        <button
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2"
          onClick={onAddMovie}
        >
          <Plus className="w-5 h-5" />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Total Movies</p>
              <p className="text-2xl font-bold text-white">{movies.length}</p>
            </div>
            <Film className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Active Movies</p>
              <p className="text-2xl font-bold text-green-300">
                {movies.filter((m) => m.status === "Active").length}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-300">
                {movies.length > 0
                  ? (
                      movies.reduce((acc, m) => acc + m.rating, 0) /
                      movies.length
                    ).toFixed(1)
                  : "0.0"}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Languages</p>
              <p className="text-2xl font-bold text-blue-300">
                {new Set(movies.map((m) => m.language)).size}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 text-sm font-bold">🌐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 max-w-md mx-auto">
            <div className="text-slate-400 mb-6">
              <Film className="w-20 h-20 mx-auto opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {searchTerm ? "No Movies Found" : "No Movies Yet"}
            </h3>
            <p className="text-slate-300 mb-6">
              {searchTerm
                ? "Try adjusting your search criteria or browse all movies"
                : "Start building your movie catalog by adding your first movie"}
            </p>
            {!searchTerm && (
              <button
                onClick={onAddMovie}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your First Movie</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieManagement;
