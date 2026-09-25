import React, { useState, useEffect } from "react";
import { MapPin, Play } from "lucide-react";
import { getShowsByMovie } from "../../utils/movieAPI";
import { TopBar, BookingSteps, Loading, FilmBackdrop } from "../ui/Chrome";
import "./booking.css";
import { tmdbSrcSet } from "../../utils/tmdbImage";
import { getSeatPrices } from "../../utils/seatPrices";

const BookingPage = ({ movie, onBack, onSeatSelect }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [seatPrices, setSeatPrices] = useState({});

  // Seat prices by category at each theater: what checkout actually charges
  useEffect(() => {
    getSeatPrices().then(setSeatPrices);
  }, []);
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
    const t = new Date();
    const todayIso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    // A show picked on the landing page's board opens with that day selected
    setSelectedDate(movie.preselect?.date || todayIso);
  }, [movie.preselect]);

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
    // ...and that exact show already chosen
    const pre = movie.preselect?.showId;
    const hit = pre && groupedData.find((g) => g.shows.some((sh) => sh.id === pre));
    if (hit) {
      setSelectedTheater(hit.theater);
      setSelectedShow(hit.shows.find((sh) => sh.id === pre));
    } else {
      setSelectedTheater(null);
      setSelectedShow(null);
    }
  }, [allShows, selectedDate, movie.preselect]);

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
    const today = new Date();
    const targetDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + i
    );
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    return {
      iso: `${year}-${month}-${day}`,
      day: targetDate.getDate(),
      month: targetDate.toLocaleDateString("en-IN", { month: "short" }),
      weekday:
        i === 0
          ? "Today"
          : i === 1
          ? "Tomorrow"
          : targetDate.toLocaleDateString("en-IN", { weekday: "short" }),
    };
  });

  const poster = movie.posterUrl
    ? `http://localhost:8080${movie.posterUrl}`
    : null;
  const backdrop = movie.backdropUrl || poster;
  const cast = Array.isArray(movie.cast) ? movie.cast : [];
  const selectedLabel =
    selectedShow && selectedTheater
      ? `${formatShowTime(selectedShow.showTime)} at ${selectedTheater.name}`
      : "";
  const selectedExpired =
    selectedShow && isShowExpired(selectedShow.showTime);

  return (
    <div className="cb-app cb-app--film">
        <FilmBackdrop movie={movie} />
      <TopBar
        onBack={onBack}
        backLabel="Back to films"
        title={movie.title}
        sub="Pick a date and showtime"
      />
      <BookingSteps current="Showtime" />

      <section className="cb-filmband">
        {backdrop && (
          <img
            className="cb-filmband__bg"
            src={backdrop}
            srcSet={tmdbSrcSet(backdrop)}
            sizes="100vw"
            fetchpriority="high"
            decoding="async"
            alt=""
          />
        )}
        <div className="cb-filmband__inner">
          {poster && (
            <span className="cb-thumb cb-filmband__poster">
              <img src={poster} alt="" />
            </span>
          )}
          <div className="cb-filmband__copy">
            <h2 className="cb-display">{movie.title}</h2>
            <p className="cb-filmband__meta">
              {movie.certificate && (
                <span className="cb-cert" title={`Certified ${movie.certificate}`}>
                  {movie.certificate}
                </span>
              )}
              {movie.language && <span>{movie.language}</span>}
              {movie.duration && movie.duration !== "N/A" && (
                <span>{movie.duration}</span>
              )}
              {movie.genre && movie.genre !== "N/A" && <span>{movie.genre}</span>}
            </p>
            {movie.description && (
              <p className="cb-filmband__story">{movie.description}</p>
            )}
            {(movie.director || cast.length > 0) && (
              <dl className="cb-filmband__credits">
                {movie.director && (
                  <div>
                    <dt>Director</dt>
                    <dd>{movie.director}</dd>
                  </div>
                )}
                {cast.length > 0 && (
                  <div>
                    <dt>Starring</dt>
                    <dd>{cast.slice(0, 4).join(", ")}</dd>
                  </div>
                )}
              </dl>
            )}
            {movie.trailer && (
              <a
                className="cb-btn cb-btn--ghost cb-btn--sm"
                href={movie.trailer}
                target="_blank"
                rel="noreferrer"
              >
                <Play size={14} aria-hidden="true" />
                Watch trailer
              </a>
            )}
          </div>
        </div>
      </section>

      <main className="cb-main">
        <div className="cb-datestrip" role="group" aria-label="Choose a date">
          {dates.map((d) => (
            <button
              key={d.iso}
              type="button"
              className="cb-leaf"
              aria-pressed={selectedDate === d.iso}
              onClick={() => setSelectedDate(d.iso)}
            >
              <span className="cb-leaf__wd">{d.weekday}</span>
              <span className="cb-leaf__day">{d.day}</span>
              <span className="cb-leaf__mo">{d.month}</span>
            </button>
          ))}
        </div>

        {loading && <Loading label="Finding showtimes" />}

        {!loading && error && (
          <div className="cb-empty">
            <h2 className="cb-h2">No shows scheduled yet</h2>
            <p>
              {allShows.length === 0
                ? "This film has no showtimes in Hyderabad right now. Check back soon, or pick another film."
                : error}
            </p>
            <button type="button" className="cb-btn cb-btn--pink" onClick={onBack}>
              Browse other films
            </button>
          </div>
        )}

        {!loading && !error && grouped.length === 0 && (
          <div className="cb-empty">
            <h2 className="cb-h2">Nothing on this day</h2>
            <p>
              There are no shows on{" "}
              {dates.find((d) => d.iso === selectedDate)?.weekday.toLowerCase() ||
                selectedDate}
              . Try another date above.
            </p>
          </div>
        )}

        {!loading && !error && grouped.length > 0 && (
          <ul className="cb-venues">
            {grouped.map(({ theater, shows }) => (
              <li key={theater.id} className="cb-venue">
                <div className="cb-venue__head">
                  <h3 className="cb-h3">{theater.name}</h3>
                  <p className="cb-muted cb-small">
                    <MapPin size={14} aria-hidden="true" /> {theater.location}
                  </p>
                  {seatPrices[theater.id] && (
                    <ul className="cb-venue__prices" aria-label="Seat prices">
                      {seatPrices[theater.id].categories.map((c) => (
                        <li key={c.name} title={`Rows ${c.rows}`}>
                          {c.name} <strong>₹{c.price}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="cb-times">
                  {shows.map((show) => {
                    const expired = isShowExpired(show.showTime);
                    const isSelected =
                      selectedTheater?.id === theater.id &&
                      selectedShow?.id === show.id;
                    return (
                      <button
                        key={show.id}
                        type="button"
                        className="cb-time"
                        aria-pressed={isSelected}
                        disabled={expired}
                        title={getTimeUntilShow(show.showTime)}
                        onClick={() => handleShowSelection(theater, show)}
                      >
                        <span className="cb-time__at">
                          {formatShowTime(show.showTime)}
                        </span>
                        <span className="cb-time__sub">
                          {expired
                            ? "Started"
                            : seatPrices[theater.id]
                            ? `from ₹${seatPrices[theater.id].from}`
                            : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {selectedShow && selectedTheater && (
        <div className="cb-actionbar" role="region" aria-label="Selected show">
          <div className="cb-actionbar__text">
            {selectedExpired ? (
              <span className="cb-actionbar__warn">
                This show has started. Pick another time.
              </span>
            ) : (
              <>
                <strong>{selectedLabel}</strong>
                <span className="cb-muted">
                  {dates.find((d) => d.iso === selectedDate)?.weekday}
                  {seatPrices[selectedTheater.id] &&
                    `, seats ₹${seatPrices[selectedTheater.id].from} to ₹${seatPrices[selectedTheater.id].to} by row`}
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            className="cb-btn cb-btn--stamp"
            onClick={handleSeatSelection}
            disabled={selectedExpired}
          >
            Choose seats
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
