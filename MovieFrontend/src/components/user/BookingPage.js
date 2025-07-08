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

//   // 3️⃣ FIXED: Filter & group by theater when date or shows change
//   useEffect(() => {
//     if (!selectedDate || !allShows.length) {
//       setGrouped([]);
//       return;
//     }

//     console.log("Filtering shows for date:", selectedDate);
//     console.log("All shows:", allShows);

//     // Filter shows for selected date using simple string comparison
//     const filtered = allShows.filter((show) => {
//       if (!show.showTime) return false;

//       try {
//         // Extract the date part directly from the ISO string
//         const showDate = show.showTime.split("T")[0];

//         console.log(
//           `Show ${show.id}: showTime=${
//             show.showTime
//           }, extracted date=${showDate}, selected=${selectedDate}, match=${
//             showDate === selectedDate
//           }`
//         );

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

//     // FIXED: Sort shows by time in ascending order (earliest to latest)
//     Object.values(theaterMap).forEach((group) => {
//       group.shows.sort((a, b) => {
//         // Extract time from ISO format and compare directly
//         // "2025-06-24T07:30:00.000" vs "2025-06-24T19:30:00.000"

//         const getTimeFromISO = (isoString) => {
//           try {
//             if (isoString.includes("T")) {
//               const timePart = isoString.split("T")[1]; // "07:30:00.000"
//               const timeOnly = timePart.split(".")[0]; // "07:30:00"
//               const [hours, minutes] = timeOnly.split(":").map(Number);
//               return hours * 60 + minutes; // Convert to minutes for easy comparison
//             }
//             return 0;
//           } catch (error) {
//             console.error("Error parsing time:", isoString, error);
//             return 0;
//           }
//         };

//         const timeA = getTimeFromISO(a.showTime);
//         const timeB = getTimeFromISO(b.showTime);

//         console.log(
//           `Sorting: ${a.showTime} (${timeA} mins) vs ${b.showTime} (${timeB} mins)`
//         );

//         return timeA - timeB; // Ascending order: earlier times first
//       });
//     });

//     const groupedData = Object.values(theaterMap);
//     console.log("Grouped and sorted data:", groupedData);

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

//   // FIXED: Format show time without timezone conversion
//   const formatShowTime = (showTimeStr) => {
//     try {
//       console.log("Formatting show time:", showTimeStr);

//       // Parse the time string directly without timezone conversion
//       if (showTimeStr.includes("T")) {
//         // Extract just the time part from "2025-06-24T07:30:00.000"
//         const timePart = showTimeStr.split("T")[1];
//         const timeOnly = timePart.split(".")[0]; // Remove milliseconds
//         const [hours, minutes] = timeOnly.split(":");

//         // Convert to 12-hour format manually
//         const hour24 = parseInt(hours, 10);
//         const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
//         const period = hour24 >= 12 ? "PM" : "AM";

//         const formattedTime = `${hour12}:${minutes} ${period}`;
//         console.log(`Converted ${showTimeStr} to ${formattedTime}`);
//         return formattedTime;
//       }

//       // Fallback: if format is unexpected, return as-is
//       console.warn("Unexpected time format:", showTimeStr);
//       return showTimeStr;
//     } catch (error) {
//       console.error("Error formatting show time:", error);
//       return showTimeStr;
//     }
//   };

//   // ─── build a sliding 7-day window from today ─────────────────
//   const dates = Array.from({ length: 7 }, (_, i) => {
//     // FIXED: Use proper date construction to avoid timezone issues
//     const today = new Date();
//     const targetDate = new Date(
//       today.getFullYear(),
//       today.getMonth(),
//       today.getDate() + i
//     );

//     // Get ISO string for comparison (YYYY-MM-DD format)
//     const year = targetDate.getFullYear();
//     const month = String(targetDate.getMonth() + 1).padStart(2, "0");
//     const day = String(targetDate.getDate()).padStart(2, "0");
//     const iso = `${year}-${month}-${day}`;

//     // Get proper label
//     const label = targetDate.toLocaleDateString("en-US", {
//       weekday: "short",
//       month: "short",
//       day: "numeric",
//     });

//     console.log(
//       `Date ${i}: iso=${iso}, label=${label}, targetDate=${targetDate.toDateString()}`
//     );

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
import {
  ChevronLeft,
  MapPin,
  Star,
  AlertCircle,
  Loader2,
  Clock,
  X,
} from "lucide-react";
import { getShowsByMovie } from "../../utils/movieAPI";

const BookingPage = ({ movie, onBack, onSeatSelect }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [allShows, setAllShows] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🕐 Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

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

  // 3️⃣ FIXED: Filter & group by theater when date or shows change
  useEffect(() => {
    if (!selectedDate || !allShows.length) {
      setGrouped([]);
      return;
    }

    console.log("Filtering shows for date:", selectedDate);
    console.log("All shows:", allShows);

    // Filter shows for selected date using simple string comparison
    const filtered = allShows.filter((show) => {
      if (!show.showTime) return false;

      try {
        // Extract the date part directly from the ISO string
        const showDate = show.showTime.split("T")[0];

        console.log(
          `Show ${show.id}: showTime=${
            show.showTime
          }, extracted date=${showDate}, selected=${selectedDate}, match=${
            showDate === selectedDate
          }`
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

    // FIXED: Sort shows by time in ascending order (earliest to latest)
    Object.values(theaterMap).forEach((group) => {
      group.shows.sort((a, b) => {
        // Extract time from ISO format and compare directly
        const getTimeFromISO = (isoString) => {
          try {
            if (isoString.includes("T")) {
              const timePart = isoString.split("T")[1]; // "07:30:00.000"
              const timeOnly = timePart.split(".")[0]; // "07:30:00"
              const [hours, minutes] = timeOnly.split(":").map(Number);
              return hours * 60 + minutes; // Convert to minutes for easy comparison
            }
            return 0;
          } catch (error) {
            console.error("Error parsing time:", isoString, error);
            return 0;
          }
        };

        const timeA = getTimeFromISO(a.showTime);
        const timeB = getTimeFromISO(b.showTime);

        console.log(
          `Sorting: ${a.showTime} (${timeA} mins) vs ${b.showTime} (${timeB} mins)`
        );

        return timeA - timeB; // Ascending order: earlier times first
      });
    });

    const groupedData = Object.values(theaterMap);
    console.log("Grouped and sorted data:", groupedData);

    setGrouped(groupedData);
    setSelectedTheater(null);
    setSelectedShow(null);
  }, [allShows, selectedDate]);

  // 🚫 Check if show has already started
  const isShowExpired = (showTimeStr) => {
    try {
      // Parse the show time manually to avoid timezone conversion issues
      if (showTimeStr.includes("T")) {
        // Extract date and time parts from "2025-07-08T10:00:00.000Z"
        const [datePart, timePart] = showTimeStr.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const timeOnly = timePart.split(".")[0]; // Remove milliseconds and Z
        const [hours, minutes, seconds = 0] = timeOnly.split(":").map(Number);

        // Create date object in local timezone (treating stored time as local time)
        const showDateTime = new Date(
          year,
          month - 1,
          day,
          hours,
          minutes,
          seconds
        );

        // Add 5 minutes buffer - show becomes unselectable 5 minutes after start time
        const showTimeWithBuffer = new Date(
          showDateTime.getTime() + 5 * 60 * 1000
        );

        const isExpired = currentTime > showTimeWithBuffer;

        console.log(
          `Show time check: ${showTimeStr} -> Show: ${showDateTime.toLocaleString()}, Current: ${currentTime.toLocaleString()}, Expired: ${isExpired}`
        );

        return isExpired;
      }

      // Fallback: if format is unexpected, return false (don't block)
      console.warn("Unexpected show time format:", showTimeStr);
      return false;
    } catch (error) {
      console.error("Error parsing show time:", showTimeStr, error);
      return false;
    }
  };

  // 🕐 Get time remaining until show starts
  const getTimeUntilShow = (showTimeStr) => {
    try {
      // Parse the show time manually to avoid timezone conversion issues
      if (showTimeStr.includes("T")) {
        // Extract date and time parts from "2025-07-08T10:00:00.000Z"
        const [datePart, timePart] = showTimeStr.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const timeOnly = timePart.split(".")[0]; // Remove milliseconds and Z
        const [hours, minutes, seconds = 0] = timeOnly.split(":").map(Number);

        // Create date object in local timezone (treating stored time as local time)
        const showDateTime = new Date(
          year,
          month - 1,
          day,
          hours,
          minutes,
          seconds
        );

        const timeDiff = showDateTime.getTime() - currentTime.getTime();

        if (timeDiff <= 0) {
          const minutesPassed = Math.abs(timeDiff) / (1000 * 60);
          if (minutesPassed <= 5) {
            return `Started ${Math.round(minutesPassed)}m ago`;
          } else {
            return `Started ${Math.round(minutesPassed / 60)}h ago`;
          }
        }

        const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesLeft = Math.floor(
          (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
        );

        if (hoursLeft > 0) {
          return `Starts in ${hoursLeft}h ${minutesLeft}m`;
        } else {
          return `Starts in ${minutesLeft}m`;
        }
      }

      // Fallback
      console.warn("Unexpected show time format:", showTimeStr);
      return "";
    } catch (error) {
      console.error("Error calculating time until show:", error);
      return "";
    }
  };

  const handleShowSelection = (theater, show) => {
    // Don't allow selection of expired shows
    if (isShowExpired(show.showTime)) {
      return;
    }

    setSelectedTheater(theater);
    setSelectedShow(show);
  };

  const handleSeatSelection = () => {
    if (!selectedTheater || !selectedShow) return;

    // Double-check that show hasn't expired since selection
    if (isShowExpired(selectedShow.showTime)) {
      alert(
        "This show has already started and is no longer available for booking."
      );
      setSelectedShow(null);
      setSelectedTheater(null);
      return;
    }

    const showTime = formatShowTime(selectedShow.showTime);

    onSeatSelect({
      showId: selectedShow.id,
      movie,
      theater: selectedTheater,
      date: selectedDate,
      showTime: showTime,
    });
  };

  // FIXED: Format show time without timezone conversion
  const formatShowTime = (showTimeStr) => {
    try {
      console.log("Formatting show time:", showTimeStr);

      // Parse the time string directly without timezone conversion
      if (showTimeStr.includes("T")) {
        // Extract just the time part from "2025-06-24T07:30:00.000"
        const timePart = showTimeStr.split("T")[1];
        const timeOnly = timePart.split(".")[0]; // Remove milliseconds
        const [hours, minutes] = timeOnly.split(":");

        // Convert to 12-hour format manually
        const hour24 = parseInt(hours, 10);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const period = hour24 >= 12 ? "PM" : "AM";

        const formattedTime = `${hour12}:${minutes} ${period}`;
        console.log(`Converted ${showTimeStr} to ${formattedTime}`);
        return formattedTime;
      }

      // Fallback: if format is unexpected, return as-is
      console.warn("Unexpected time format:", showTimeStr);
      return showTimeStr;
    } catch (error) {
      console.error("Error formatting show time:", error);
      return showTimeStr;
    }
  };

  // ─── build a sliding 7-day window from today ─────────────────
  const dates = Array.from({ length: 7 }, (_, i) => {
    // FIXED: Use proper date construction to avoid timezone issues
    const today = new Date();
    const targetDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + i
    );

    // Get ISO string for comparison (YYYY-MM-DD format)
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const iso = `${year}-${month}-${day}`;

    // Get proper label
    const label = targetDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    console.log(
      `Date ${i}: iso=${iso}, label=${label}, targetDate=${targetDate.toDateString()}`
    );

    return { iso, label };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">{movie.title}</h1>
          </div>

          {/* Current Time Display */}
          <div className="flex items-center space-x-2 text-white/80 text-sm">
            <Clock className="w-4 h-4" />
            <span>Current Time: {currentTime.toLocaleTimeString()}</span>
          </div>
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
                        const expired = isShowExpired(show.showTime);
                        const timeUntil = getTimeUntilShow(show.showTime);
                        const isSelected =
                          selectedTheater?.id === theater.id &&
                          selectedShow?.id === show.id;

                        return (
                          <div key={show.id} className="relative group">
                            <button
                              onClick={() => handleShowSelection(theater, show)}
                              disabled={expired}
                              className={`w-full p-4 rounded-xl border transition-all transform ${
                                expired
                                  ? "border-red-500/30 bg-red-900/20 text-red-400 cursor-not-allowed opacity-60"
                                  : isSelected
                                  ? "border-pink-500 bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-white shadow-lg hover:scale-105"
                                  : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10 hover:text-white hover:scale-105"
                              }`}
                            >
                              {expired && (
                                <X className="w-4 h-4 absolute top-2 right-2 text-red-400" />
                              )}
                              <div className="font-semibold text-lg">
                                {time}
                              </div>
                              <div className="text-sm mt-1 opacity-80">
                                ₹{show.ticketPrice || 250}
                              </div>
                              {expired && (
                                <div className="text-xs mt-1 text-red-400">
                                  Show Started
                                </div>
                              )}
                            </button>

                            {/* Tooltip for expired shows */}
                            {expired && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-900 border border-red-500 text-red-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                <div className="font-medium">
                                  Booking Unavailable
                                </div>
                                <div>{timeUntil}</div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-900"></div>
                              </div>
                            )}

                            {/* Tooltip for available shows */}
                            {!expired && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-green-900 border border-green-500 text-green-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                <div className="font-medium">
                                  Available for Booking
                                </div>
                                <div>{timeUntil}</div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-green-900"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {/* "Select Seats" CTA */}
              {selectedTheater &&
                selectedShow &&
                !isShowExpired(selectedShow.showTime) && (
                  <div className="mt-8 pt-6 border-t border-white/20">
                    <button
                      onClick={handleSeatSelection}
                      className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                    >
                      Select Seats for {formatShowTime(selectedShow.showTime)}
                    </button>
                  </div>
                )}

              {/* Warning if selected show becomes expired */}
              {selectedTheater &&
                selectedShow &&
                isShowExpired(selectedShow.showTime) && (
                  <div className="mt-8 pt-6 border-t border-white/20">
                    <div className="flex items-center p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg">
                      <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium">
                          Selected show is no longer available
                        </p>
                        <p className="text-sm mt-1">
                          Please select a different show time.
                        </p>
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
