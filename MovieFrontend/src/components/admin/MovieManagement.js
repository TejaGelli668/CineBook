import React from "react";
import { Star } from "lucide-react";

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
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-sm flex items-center">
          <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
          {movie.rating}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">{movie.title}</h3>
        <p className="text-slate-600 text-sm mb-3">{movie.genre}</p>
        <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
          <span>{movie.duration}</span>
          <span>₹{movie.price}</span>
        </div>
        <div className="flex justify-between items-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              movie.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {movie.status}
          </span>
          <div className="flex space-x-2">
            <button
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              onClick={() => handleEditClick(movie)}
              title="Edit Movie"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              onClick={() => handleDeleteClick(movie.id)}
              title="Delete Movie"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">Movies Management</h3>
        <button
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
          onClick={onAddMovie}
        >
          Add New Movie
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      {filteredMovies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-600 mb-2">
            No Movies Found
          </h3>
          <p className="text-slate-500">
            Try adjusting your search criteria or add a new movie
          </p>
        </div>
      )}
    </div>
  );
};

export default MovieManagement;
