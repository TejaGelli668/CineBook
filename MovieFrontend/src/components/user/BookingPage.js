// import React, { useState, useEffect } from "react";
// import { ChevronLeft, MapPin, Star, AlertCircle, Loader2 } from "lucide-react";
// import { getShowsByMovie } from "../../utils/movieAPI";

// const BookingPage = ({ movie, onBack, onSeatSelect }) => {
//   const [selectedDate, setSelectedDate] = useState("");
//   const [allShows, setAllShows] = useState([]);
//   const [grouped, setGrouped] = useState([]);
//   const [selectedTheater, setSelectedTheater] = useState(null);
//   const [selectedShow, setSelectedShow] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // detect user's time zone
//   const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

//   // 1️⃣ Initialize today's date
//   useEffect(() => {
//     const todayIso = new Date().toISOString().slice(0, 10);
//     setSelectedDate(todayIso);
//   }, []);

//   // 2️⃣ Fetch shows for this movie
//   useEffect(() => {
//     const fetchShows = async () => {
//       if (!movie?.id) return;

//       try {
//         setLoading(true);
//         setError("");
//         console.log("Fetching shows for movie ID:", movie.id);

//         const shows = await getShowsByMovie(movie.id);
//         console.log("Raw API response:", shows);
//         console.log("Show structure check:", shows?.[0]);

//         // Handle different response formats
//         let showsArray = [];
//         if (Array.isArray(shows)) {
//           showsArray = shows;
//         } else if (shows && shows.data && Array.isArray(shows.data)) {
//           showsArray = shows.data;
//         } else if (shows && typeof shows === "object") {
//           // If it's a single show object, wrap it in an array
//           showsArray = [shows];
//         }

//         console.log("Processed shows array:", showsArray);

//         // Validate show structure
//         const validShows = showsArray.filter((show) => {
//           const hasRequiredFields =
//             show &&
//             show.id &&
//             show.showTime &&
//             show.theater &&
//             show.theater.id &&
//             show.theater.name;

//           if (!hasRequiredFields) {
//             console.warn("Invalid show structure:", show);
//           }

//           return hasRequiredFields;
//         });

//         console.log("Valid shows:", validShows);
//         setAllShows(validShows);

//         if (validShows.length === 0) {
//           setError(
//             "No shows available for this movie yet. Please create shows in the admin panel first."
//           );
//         }
//       } catch (err) {
//         console.error("Failed to load shows", err);
//         setError("Failed to load show times. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchShows();
//   }, [movie.id]);

//   // 3️⃣ Filter & group by theater when date or shows change
//   useEffect(() => {
//     if (!selectedDate || !allShows.length) {
//       setGrouped([]);
//       return;
//     }

//     console.log("Filtering shows for date:", selectedDate);
//     console.log("All shows:", allShows);

//     // Filter shows for selected date
//     const filtered = allShows.filter((show) => {
//       if (!show.showTime) return false;

//       try {
//         // Handle different date formats
//         let showDate;
//         if (show.showTime.includes("T")) {
//           // ISO format: "2025-06-21T15:00:00"
//           showDate = show.showTime.split("T")[0];
//         } else if (show.showTime.includes("-")) {
//           // Date format: "2025-06-21"
//           showDate = show.showTime.split(" ")[0];
//         } else {
//           // Try to parse as date
//           const parsed = new Date(show.showTime);
//           if (!isNaN(parsed.getTime())) {
//             showDate = parsed.toISOString().split("T")[0];
//           } else {
//             console.warn("Unable to parse showTime:", show.showTime);
//             return false;
//           }
//         }

//         return showDate === selectedDate;
//       } catch (error) {
//         console.error("Error parsing show date:", show.showTime, error);
//         return false;
//       }
//     });

//     console.log("Filtered shows:", filtered);

//     // Group by theater
//     const theaterMap = {};
//     filtered.forEach((show) => {
//       const theaterId = show.theater?.id;
//       if (!theaterId || !show.theater) {
//         console.warn("Show missing theater data:", show);
//         return;
//       }

//       if (!theaterMap[theaterId]) {
//         theaterMap[theaterId] = {
//           theater: {
//             id: show.theater.id,
//             name: show.theater.name,
//             location:
//               show.theater.location ||
//               `${show.theater.city}, ${show.theater.state}`,
//             city: show.theater.city,
//             state: show.theater.state,
//           },
//           shows: [],
//         };
//       }
//       theaterMap[theaterId].shows.push(show);
//     });

//     const groupedData = Object.values(theaterMap);
//     console.log("Grouped data:", groupedData);

//     setGrouped(groupedData);
//     setSelectedTheater(null);
//     setSelectedShow(null);
//   }, [allShows, selectedDate]);

//   const handleShowSelection = (theater, show) => {
//     setSelectedTheater(theater);
//     setSelectedShow(show);
//   };

//   const handleSeatSelection = () => {
//     if (!selectedTheater || !selectedShow) return;

//     const showTime = formatShowTime(selectedShow.showTime);

//     onSeatSelect({
//       showId: selectedShow.id,
//       movie,
//       theater: selectedTheater,
//       date: selectedDate,
//       showTime: showTime,
//     });
//   };

//   const formatShowTime = (showTimeStr) => {
//     try {
//       const date = new Date(showTimeStr);
//       if (isNaN(date.getTime())) {
//         console.error("Invalid date:", showTimeStr);
//         return showTimeStr;
//       }
//       return date.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         timeZone: userTZ,
//       });
//     } catch (error) {
//       console.error("Error formatting show time:", error);
//       return showTimeStr;
//     }
//   };

//   // ─── build a sliding 7-day window from today ─────────────────
//   const dates = Array.from({ length: 7 }, (_, i) => {
//     const d = new Date();
//     d.setDate(d.getDate() + i);
//     const iso = d.toISOString().slice(0, 10);
//     const label = d.toLocaleDateString("en-US", {
//       weekday: "short",
//       month: "short",
//       day: "numeric",
//     });
//     return { iso, label };
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
//       {/* Header */}
//       <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-4">
//           <button
//             onClick={onBack}
//             className="p-2 hover:bg-white/10 rounded-full transition-colors"
//           >
//             <ChevronLeft className="w-6 h-6 text-white" />
//           </button>
//           <h1 className="text-2xl font-bold text-white">{movie.title}</h1>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* ← Movie Info Panel */}
//           <div className="lg:col-span-1">
//             <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
//               <div className="relative">
//                 {movie.posterUrl ? (
//                   <img
//                     src={`http://localhost:8080${movie.posterUrl}`}
//                     alt={movie.title}
//                     className="w-full h-96 object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-96 bg-gray-800 flex items-center justify-center text-gray-500">
//                     No Image
//                   </div>
//                 )}
//                 <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
//                   <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                   <span className="text-white font-semibold">
//                     {movie.rating}
//                   </span>
//                 </div>
//                 <div className="absolute top-4 right-4">
//                   <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs">
//                     {movie.genre}
//                   </span>
//                 </div>
//               </div>
//               <div className="p-6 text-white">
//                 <h2 className="text-2xl font-bold mb-3">{movie.title}</h2>
//                 <p className="text-gray-300 text-sm leading-relaxed mb-4">
//                   {movie.description}
//                 </p>
//                 <p className="text-gray-300 text-sm">
//                   <strong>Director:</strong> {movie.director}
//                 </p>
//                 <p className="text-gray-300 text-sm">
//                   <strong>Cast:</strong>{" "}
//                   {Array.isArray(movie.cast)
//                     ? movie.cast.join(", ")
//                     : movie.cast}
//                 </p>
//                 <p className="text-gray-300 text-sm mt-2">
//                   <strong>Language:</strong> {movie.language}
//                 </p>
//                 <p className="text-gray-300 text-sm mt-1">
//                   <strong>Duration:</strong> {movie.duration}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* ← Date & Show-time Picker */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Date Picker */}
//             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//               <h3 className="text-xl font-bold text-white mb-4">Select Date</h3>
//               <div className="flex space-x-3 overflow-x-auto pb-2">
//                 {dates.map(({ iso, label }) => (
//                   <button
//                     key={iso}
//                     onClick={() => setSelectedDate(iso)}
//                     className={`px-6 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${
//                       selectedDate === iso
//                         ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105"
//                         : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
//                     }`}
//                   >
//                     {label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Cinema & Show Time */}
//             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
//               <h3 className="text-xl font-bold text-white mb-6">
//                 Select Cinema & Show Time
//               </h3>

//               {loading && (
//                 <div className="flex items-center justify-center py-8">
//                   <Loader2 className="w-8 h-8 animate-spin text-white mr-3" />
//                   <span className="text-white">Loading show times...</span>
//                 </div>
//               )}

//               {error && (
//                 <div className="flex items-center p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg mb-6">
//                   <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
//                   <span>{error}</span>
//                 </div>
//               )}

//               {!loading && !error && grouped.length === 0 && (
//                 <div className="text-center py-8">
//                   <div className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-300 rounded-lg p-4">
//                     <p className="font-medium">
//                       No shows available for {selectedDate}
//                     </p>
//                     <p className="text-sm mt-1">
//                       Please select a different date or ask admin to create
//                       shows for this movie.
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {!loading &&
//                 !error &&
//                 grouped.map(({ theater, shows }) => (
//                   <div
//                     key={theater.id}
//                     className="border-b border-white/10 pb-6 mb-6 last:border-b-0 last:mb-0"
//                   >
//                     <div className="mb-4">
//                       <h4 className="font-bold text-white text-lg mb-1">
//                         {theater.name}
//                       </h4>
//                       <div className="flex items-center text-gray-300 text-sm">
//                         <MapPin className="w-4 h-4 mr-1" />
//                         {theater.location}
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                       {shows.map((show) => {
//                         const time = formatShowTime(show.showTime);
//                         return (
//                           <button
//                             key={show.id}
//                             onClick={() => handleShowSelection(theater, show)}
//                             className={`p-4 rounded-xl border transition-all transform hover:scale-105 ${
//                               selectedTheater?.id === theater.id &&
//                               selectedShow?.id === show.id
//                                 ? "border-pink-500 bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-white shadow-lg"
//                                 : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10 hover:text-white"
//                             }`}
//                           >
//                             <div className="font-semibold text-lg">{time}</div>
//                             <div className="text-sm mt-1 opacity-80">
//                               ₹{show.ticketPrice || 250}
//                             </div>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 ))}

//               {/* "Select Seats" CTA */}
//               {selectedTheater && selectedShow && (
//                 <div className="mt-8 pt-6 border-t border-white/20">
//                   <button
//                     onClick={handleSeatSelection}
//                     className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
//                   >
//                     Select Seats
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookingPage;
import React, { useState, useEffect } from "react";
import { ChevronLeft, MapPin, Star, AlertCircle, Loader2 } from "lucide-react";
import { getShowsByMovie } from "../../utils/movieAPI";

const BookingPage = ({ movie, onBack, onSeatSelect }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [allShows, setAllShows] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // detect user's time zone
  const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // 1️⃣ Initialize today's date
  useEffect(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    setSelectedDate(todayIso);
  }, []);

  // 2️⃣ Fetch shows for this movie
  useEffect(() => {
    const fetchShows = async () => {
      if (!movie?.id) return;

      try {
        setLoading(true);
        setError("");
        console.log("Fetching shows for movie ID:", movie.id);

        const shows = await getShowsByMovie(movie.id);
        console.log("Raw API response:", shows);
        console.log("Show structure check:", shows?.[0]);

        // Handle different response formats
        let showsArray = [];
        if (Array.isArray(shows)) {
          showsArray = shows;
        } else if (shows && shows.data && Array.isArray(shows.data)) {
          showsArray = shows.data;
        } else if (shows && typeof shows === "object") {
          // If it's a single show object, wrap it in an array
          showsArray = [shows];
        }

        console.log("Processed shows array:", showsArray);

        // Validate show structure
        const validShows = showsArray.filter((show) => {
          const hasRequiredFields =
            show &&
            show.id &&
            show.showTime &&
            show.theater &&
            show.theater.id &&
            show.theater.name;

          if (!hasRequiredFields) {
            console.warn("Invalid show structure:", show);
          }

          return hasRequiredFields;
        });

        console.log("Valid shows:", validShows);
        setAllShows(validShows);

        if (validShows.length === 0) {
          setError(
            "No shows available for this movie yet. Please create shows in the admin panel first."
          );
        }
      } catch (err) {
        console.error("Failed to load shows", err);
        setError("Failed to load show times. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [movie.id]);

  // 3️⃣ Filter & group by theater when date or shows change
  useEffect(() => {
    if (!selectedDate || !allShows.length) {
      setGrouped([]);
      return;
    }

    console.log("Filtering shows for date:", selectedDate);
    console.log("All shows:", allShows);

    // Filter shows for selected date
    const filtered = allShows.filter((show) => {
      if (!show.showTime) return false;

      try {
        // FIXED: Better date parsing to handle timezone issues
        let showDate;
        const showTimeDate = new Date(show.showTime);

        if (isNaN(showTimeDate.getTime())) {
          console.warn("Invalid showTime:", show.showTime);
          return false;
        }

        // Get local date string in YYYY-MM-DD format
        const year = showTimeDate.getFullYear();
        const month = String(showTimeDate.getMonth() + 1).padStart(2, "0");
        const day = String(showTimeDate.getDate()).padStart(2, "0");
        showDate = `${year}-${month}-${day}`;

        console.log(
          `Show ${show.id}: showTime=${show.showTime}, parsed date=${showDate}, selected=${selectedDate}`
        );
        return showDate === selectedDate;
      } catch (error) {
        console.error("Error parsing show date:", show.showTime, error);
        return false;
      }
    });

    console.log("Filtered shows:", filtered);

    // Group by theater
    const theaterMap = {};
    filtered.forEach((show) => {
      const theaterId = show.theater?.id;
      if (!theaterId || !show.theater) {
        console.warn("Show missing theater data:", show);
        return;
      }

      if (!theaterMap[theaterId]) {
        theaterMap[theaterId] = {
          theater: {
            id: show.theater.id,
            name: show.theater.name,
            location:
              show.theater.location ||
              `${show.theater.city}, ${show.theater.state}`,
            city: show.theater.city,
            state: show.theater.state,
          },
          shows: [],
        };
      }
      theaterMap[theaterId].shows.push(show);
    });

    const groupedData = Object.values(theaterMap);
    console.log("Grouped data:", groupedData);

    setGrouped(groupedData);
    setSelectedTheater(null);
    setSelectedShow(null);
  }, [allShows, selectedDate]);

  const handleShowSelection = (theater, show) => {
    setSelectedTheater(theater);
    setSelectedShow(show);
  };

  const handleSeatSelection = () => {
    if (!selectedTheater || !selectedShow) return;

    const showTime = formatShowTime(selectedShow.showTime);

    onSeatSelect({
      showId: selectedShow.id,
      movie,
      theater: selectedTheater,
      date: selectedDate,
      showTime: showTime,
    });
  };

  const formatShowTime = (showTimeStr) => {
    try {
      const date = new Date(showTimeStr);
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", showTimeStr);
        return showTimeStr;
      }
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: userTZ,
      });
    } catch (error) {
      console.error("Error formatting show time:", error);
      return showTimeStr;
    }
  };

  // ─── build a sliding 7-day window from today ─────────────────
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return { iso, label };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
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
          {/* ← Movie Info Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <div className="relative">
                {movie.posterUrl ? (
                  <img
                    src={`http://localhost:8080${movie.posterUrl}`}
                    alt={movie.title}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-800 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">
                    {movie.rating}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs">
                    {movie.genre}
                  </span>
                </div>
              </div>
              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold mb-3">{movie.title}</h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {movie.description}
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Director:</strong> {movie.director}
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Cast:</strong>{" "}
                  {Array.isArray(movie.cast)
                    ? movie.cast.join(", ")
                    : movie.cast}
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  <strong>Language:</strong> {movie.language}
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  <strong>Duration:</strong> {movie.duration}
                </p>
              </div>
            </div>
          </div>

          {/* ← Date & Show-time Picker */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Picker */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Select Date</h3>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {dates.map(({ iso, label }) => (
                  <button
                    key={iso}
                    onClick={() => setSelectedDate(iso)}
                    className={`px-6 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${
                      selectedDate === iso
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105"
                        : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cinema & Show Time */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">
                Select Cinema & Show Time
              </h3>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-white mr-3" />
                  <span className="text-white">Loading show times...</span>
                </div>
              )}

              {error && (
                <div className="flex items-center p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg mb-6">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!loading && !error && grouped.length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-300 rounded-lg p-4">
                    <p className="font-medium">
                      No shows available for {selectedDate}
                    </p>
                    <p className="text-sm mt-1">
                      Please select a different date or ask admin to create
                      shows for this movie.
                    </p>
                  </div>
                </div>
              )}

              {!loading &&
                !error &&
                grouped.map(({ theater, shows }) => (
                  <div
                    key={theater.id}
                    className="border-b border-white/10 pb-6 mb-6 last:border-b-0 last:mb-0"
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
                      {shows.map((show) => {
                        const time = formatShowTime(show.showTime);
                        return (
                          <button
                            key={show.id}
                            onClick={() => handleShowSelection(theater, show)}
                            className={`p-4 rounded-xl border transition-all transform hover:scale-105 ${
                              selectedTheater?.id === theater.id &&
                              selectedShow?.id === show.id
                                ? "border-pink-500 bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-white shadow-lg"
                                : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <div className="font-semibold text-lg">{time}</div>
                            <div className="text-sm mt-1 opacity-80">
                              ₹{show.ticketPrice || 250}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {/* "Select Seats" CTA */}
              {selectedTheater && selectedShow && (
                <div className="mt-8 pt-6 border-t border-white/20">
                  <button
                    onClick={handleSeatSelection}
                    className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                  >
                    Select Seats
                  </button>
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
