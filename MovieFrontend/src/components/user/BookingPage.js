import React, { useState, useEffect } from "react";
import { ChevronLeft, Star, Clock, MapPin } from "lucide-react";
import { sampleTheaters } from "../../data/sampleData";

const BookingPage = ({ movie, onBack, onSeatSelect }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);

  useEffect(() => {
    const today = new Date();
    setSelectedDate(today.toISOString().split("T")[0]);
  }, []);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split("T")[0],
      display: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    };
  });

  const handleShowSelection = (theater, show) => {
    setSelectedTheater(theater);
    setSelectedShow(show);
  };

  const handleSeatSelection = () => {
    if (selectedTheater && selectedShow) {
      onSeatSelect({
        movie,
        theater: selectedTheater,
        date: selectedDate,
        showTime: selectedShow,
        price: selectedTheater.prices[selectedShow],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">{movie.title}</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <div className="relative">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">
                    {movie.rating}
                  </span>
                </div>
              </div>

              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold mb-3">{movie.title}</h2>

                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-purple-500/30 px-3 py-1 rounded-full text-sm font-medium">
                    {movie.genre}
                  </span>
                  <div className="flex items-center text-sm text-gray-300">
                    <Clock className="w-4 h-4 mr-1" />
                    {movie.duration}
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {movie.description}
                </p>

                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Director:</span>{" "}
                    <span className="text-white">{movie.director}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Cast:</span>{" "}
                    <span className="text-white">{movie.cast.join(", ")}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Language:</span>{" "}
                    <span className="text-white">{movie.language}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Select Date</h3>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {dates.map(({ date, display }) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all ${
                      selectedDate === date
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105"
                        : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {display}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">
                Select Cinema & Show Time
              </h3>

              <div className="space-y-8">
                {sampleTheaters.map((theater) => (
                  <div
                    key={theater.id}
                    className="border-b border-white/10 pb-6 last:border-b-0"
                  >
                    <div className="mb-4">
                      <h4 className="font-bold text-white text-lg mb-1">
                        {theater.name}
                      </h4>
                      <div className="flex items-center text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {theater.location}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {theater.shows.map((show) => (
                        <button
                          key={show}
                          onClick={() => handleShowSelection(theater, show)}
                          className={`p-4 rounded-xl border transition-all transform hover:scale-105 ${
                            selectedTheater?.id === theater.id &&
                            selectedShow === show
                              ? "border-pink-500 bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-white shadow-lg"
                              : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <div className="font-semibold text-lg">{show}</div>
                          <div className="text-sm mt-1 opacity-80">
                            ₹{theater.prices[show]}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTheater && selectedShow && (
                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="bg-gradient-to-r from-purple-600/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="text-white">
                        <h5 className="font-bold text-lg">
                          {selectedTheater.name}
                        </h5>
                        <p className="text-gray-300 text-sm mb-2">
                          {selectedShow} •{" "}
                          {new Date(selectedDate).toDateString()}
                        </p>
                        <p className="text-2xl font-bold text-green-400">
                          ₹{selectedTheater.prices[selectedShow]}
                        </p>
                      </div>

                      <button
                        onClick={handleSeatSelection}
                        className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                      >
                        Select Seats
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
