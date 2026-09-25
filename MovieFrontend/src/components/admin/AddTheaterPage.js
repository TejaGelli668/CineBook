import React, { useState, useEffect } from "react";
import { ChevronLeft, MapPin } from "lucide-react";

const AddTheaterPage = ({ onBack, onSave, theater }) => {
  const [theaterData, setTheaterData] = useState({
    name: "",
    location: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phoneNumber: "",
    email: "",
    numberOfScreens: "",
    totalSeats: "",
    facilities: [],
    shows: [],
    pricing: {
      morning: "",
      afternoon: "",
      evening: "",
      night: "",
    },
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Populate form data when editing
  useEffect(() => {
    if (theater) {
      console.log("Editing theater:", theater);
      setTheaterData({
        name: theater.name || "",
        location: theater.location || "",
        address: theater.address || "",
        city: theater.city || "",
        state: theater.state || "",
        pincode: theater.pincode || "",
        phoneNumber: theater.phoneNumber || theater.phone || "",
        email: theater.email || "",
        numberOfScreens: theater.numberOfScreens || theater.screens || "",
        totalSeats: theater.totalSeats || "",
        facilities: theater.facilities || [],
        shows: theater.shows || [],
        pricing: theater.pricing || {
          morning: "",
          afternoon: "",
          evening: "",
          night: "",
        },
        status: theater.status || "ACTIVE",
      });
    }
  }, [theater]);

  const availableFacilities = [
    "M-Ticket",
    "Food & Beverage",
    "Parking",
    "IMAX",
    "4DX",
    "DOLBY ATMOS",
    "Recliner Seats",
    "Wheelchair Access",
    "Air Conditioning",
    "Online Booking",
    "Card Payment",
    "UPI Payment",
  ];

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM",
    "08:30 PM",
    "09:00 PM",
    "09:30 PM",
    "10:00 PM",
    "10:30 PM",
    "11:00 PM",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTheaterData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePricingChange = (timeSlot, value) => {
    setTheaterData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [timeSlot]: value,
      },
    }));
  };

  const handleFacilityToggle = (facility) => {
    setTheaterData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const handleShowToggle = (show) => {
    setTheaterData((prev) => ({
      ...prev,
      shows: prev.shows.includes(show)
        ? prev.shows.filter((s) => s !== show)
        : [...prev.shows, show],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!theaterData.name.trim()) newErrors.name = "Enter the theater's name";
    if (!theaterData.location.trim())
      newErrors.location = "Enter the area, e.g. RTC X Roads";
    if (!theaterData.address.trim()) newErrors.address = "Enter the street address";
    if (!theaterData.city.trim()) newErrors.city = "Enter the city";
    if (!theaterData.state.trim()) newErrors.state = "Enter the state";
    if (!theaterData.pincode.trim()) newErrors.pincode = "Enter the PIN code";
    if (!theaterData.phoneNumber.trim())
      newErrors.phoneNumber = "Enter a phone number";
    if (!theaterData.email.trim()) newErrors.email = "Enter an email address";
    if (
      !theaterData.numberOfScreens ||
      isNaN(theaterData.numberOfScreens) ||
      theaterData.numberOfScreens <= 0
    ) {
      newErrors.numberOfScreens = "Enter how many screens (1 or more)";
    }
    if (
      !theaterData.totalSeats ||
      isNaN(theaterData.totalSeats) ||
      theaterData.totalSeats <= 0
    ) {
      newErrors.totalSeats = "Enter the total seats (1 or more)";
    }
    if (theaterData.shows.length === 0) {
      newErrors.shows = "Pick at least one show time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        // Generate show prices based on time slots
        const showPrices = {};
        theaterData.shows.forEach((show) => {
          const hour = parseInt(show.split(":")[0]);
          const isPM = show.includes("PM");
          const time24 =
            isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;

          if (time24 >= 6 && time24 < 12) {
            showPrices[show] = theaterData.pricing.morning || "200";
          } else if (time24 >= 12 && time24 < 17) {
            showPrices[show] = theaterData.pricing.afternoon || "250";
          } else if (time24 >= 17 && time24 < 21) {
            showPrices[show] = theaterData.pricing.evening || "300";
          } else {
            showPrices[show] = theaterData.pricing.night || "350";
          }
        });

        // Prepare the data to match backend entity
        const theaterPayload = {
          name: theaterData.name,
          location: theaterData.location,
          address: theaterData.address,
          city: theaterData.city,
          state: theaterData.state,
          pincode: theaterData.pincode,
          phoneNumber: theaterData.phoneNumber,
          email: theaterData.email,
          numberOfScreens: parseInt(theaterData.numberOfScreens),
          totalSeats: parseInt(theaterData.totalSeats),
          facilities: theaterData.facilities,
          shows: theaterData.shows,
          pricing: showPrices,
          status: theaterData.status,
        };

        console.log("Sending theater data:", theaterPayload);
        await onSave(theaterPayload);
      } catch (error) {
        console.error("Error saving theater:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const field = (name, label, props = {}, span = false) => (
    <div className="cb-field" style={span ? { gridColumn: "1 / -1" } : undefined}>
      <label htmlFor={`th-${name}`} className="cb-label">
        {label}
      </label>
      {props.as === "textarea" ? (
        <textarea
          id={`th-${name}`}
          name={name}
          rows={2}
          value={theaterData[name]}
          onChange={handleInputChange}
          className="cb-textarea"
          aria-invalid={!!errors[name]}
          placeholder={props.placeholder}
        />
      ) : (
        <input
          id={`th-${name}`}
          name={name}
          value={theaterData[name]}
          onChange={handleInputChange}
          className="cb-input"
          aria-invalid={!!errors[name]}
          {...props}
        />
      )}
      {errors[name] && <p className="cb-field__error">{errors[name]}</p>}
    </div>
  );

  const PRICE_BANDS = [
    ["morning", "Morning", "6 AM to 12 PM", "200"],
    ["afternoon", "Afternoon", "12 PM to 5 PM", "250"],
    ["evening", "Evening", "5 PM to 9 PM", "300"],
    ["night", "Night", "After 9 PM", "350"],
  ];

  const STATUSES = [
    ["ACTIVE", "Open", "mint"],
    ["INACTIVE", "Closed"],
    ["UNDER_MAINTENANCE", "Under repair"],
  ];

  const bandFor = (slot) => {
    const [h, rest] = slot.split(":");
    const pm = rest.includes("PM");
    const hour = (parseInt(h, 10) % 12) + (pm ? 12 : 0);
    if (hour < 12) return PRICE_BANDS[0];
    if (hour < 17) return PRICE_BANDS[1];
    if (hour < 21) return PRICE_BANDS[2];
    return PRICE_BANDS[3];
  };
  const priceFor = (slot) => {
    const [key, , , fallback] = bandFor(slot);
    return theaterData.pricing[key] || fallback;
  };
  const pickedSlots = timeSlots.filter((s) => theaterData.shows.includes(s));

  const part = (letter, title, note, children) => (
    <section className="cb-docket__part">
      <header>
        <span className="cb-docket__letter" aria-hidden="true">{letter}</span>
        <div>
          <h2>{title}</h2>
          {note && <p>{note}</p>}
        </div>
      </header>
      {children}
    </section>
  );

  return (
    <section className="cb-regform" aria-labelledby="th-title">
      <div className="cb-regform__head">
        <button type="button" className="cb-iconbtn" onClick={onBack} aria-label="Back to theaters">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 id="th-title" className="cb-display">
            {theater ? "Edit theater" : "Add a theater"}
          </h1>
          <p>Customers see the name and area. Seat maps are made from the screens and seats.</p>
        </div>
      </div>

      <div className="cb-regform__grid">
        <form className="cb-docket" onSubmit={handleSubmit} noValidate>
          <div className="cb-docket__masthead">
            <span className="cb-docket__brand">CineBook theater register</span>
            <span lang="te">థియేటర్ నమోదు</span>
          </div>

          {Object.values(errors).some(Boolean) && (
            <div className="cb-alert cb-alert--error" style={{ marginTop: 20 }} role="alert">
              Some details are missing. Check the marked lines.
            </div>
          )}

          {part("A", "Where it is", null, <>
            <div className="cb-form-row">
              {field("name", "Theater name", { placeholder: "Charminar Talkies" })}
              {field("location", "Area", { placeholder: "RTC X Roads" })}
              {field("address", "Street address", { as: "textarea", placeholder: "Building, street, landmark" }, true)}
              {field("city", "City", { placeholder: "Hyderabad" })}
              {field("state", "State", { placeholder: "Telangana" })}
              {field("pincode", "PIN code", { inputMode: "numeric", placeholder: "500020" })}
            </div>
          </>)}

          {part("B", "Box office contact", null, <>
            <div className="cb-form-row">
              {field("phoneNumber", "Phone", { type: "tel", placeholder: "+91 40 …" })}
              {field("email", "Email", { type: "email", placeholder: "boxoffice@…" })}
            </div>
          </>)}

          {part("C", "Screens and seats", null, <>
            <div className="cb-form-row">
              {field("numberOfScreens", "Screens", { type: "number", min: "1", placeholder: "3" })}
              {field("totalSeats", "Total seats", { type: "number", min: "1", placeholder: "450" })}
            </div>
            <div className="cb-field">
              <span className="cb-label" id="th-status-label">Status</span>
              <div className="cb-stampset" role="group" aria-labelledby="th-status-label" style={{ marginTop: 8 }}>
                {STATUSES.map(([value, label, tone]) => (
                  <button
                    key={value}
                    type="button"
                    data-tone={tone}
                    aria-pressed={theaterData.status === value}
                    onClick={() => setTheaterData((p) => ({ ...p, status: value }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>)}

          {part("D", "Facilities", "Tick what the theater has. Shown on its listing.", <>
            <div className="cb-chips">
              {availableFacilities.map((facility) => (
                <button
                  key={facility}
                  type="button"
                  className="cb-chip"
                  aria-pressed={theaterData.facilities.includes(facility)}
                  onClick={() => handleFacilityToggle(facility)}
                >
                  {facility}
                </button>
              ))}
            </div>
          </>)}

          {part("E", "Show times", "Punch the usual slots at this theater. At least one.", <>
            <div className="cb-punch" role="group" aria-label="Show times">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={theaterData.shows.includes(slot)}
                  onClick={() => handleShowToggle(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
            {errors.shows && <p className="cb-field__error">{errors.shows}</p>}
          </>)}

          {part("F", "Ticket rates", "Each show time is charged by the time of day it starts.", <>
            <div className="cb-rates">
              {PRICE_BANDS.map(([key, label, hint, placeholder]) => (
                <div key={key} className="cb-rate">
                  <label htmlFor={`th-price-${key}`}>{label}</label>
                  <small>{hint}</small>
                  <div className="cb-rate__amount">
                    <span aria-hidden="true">₹</span>
                    <input
                      id={`th-price-${key}`}
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={theaterData.pricing[key]}
                      onChange={(e) => handlePricingChange(key, e.target.value)}
                      placeholder={placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>)}

          <div className="cb-regform__foot">
            <button type="button" className="cb-btn cb-btn--ghost" onClick={onBack}>
              Cancel
            </button>
            <button type="submit" className="cb-btn cb-btn--stamp" disabled={loading}>
              {loading && <span className="cb-spinner cb-spinner--sm" />}
              {loading ? "Saving…" : theater ? "Save changes" : "Add theater"}
            </button>
          </div>
        </form>

        <aside className="cb-proof" aria-label="Preview">
          <p className="cb-proof__caption">How it appears on CineBook</p>
          <div className="cb-hall">
            <div className="cb-hall__sign">
              <span className="cb-hall__bulbs" aria-hidden="true" />
              <h3 className={theaterData.name ? undefined : "cb-proof__placeholder"}>
                {theaterData.name || "Theater name"}
              </h3>
            </div>
            <div className="cb-hall__body">
              <p className="cb-hall__where">
                <MapPin size={14} aria-hidden="true" />
                {[theaterData.location, theaterData.city].filter(Boolean).join(", ") || "Area, city"}
              </p>
              {theaterData.facilities.length > 0 && (
                <p className="cb-hall__facilities">{theaterData.facilities.slice(0, 5).join(", ")}</p>
              )}
              <div className="cb-proof__nums">
                <span>
                  <strong>{theaterData.numberOfScreens || "–"}</strong>
                  screens
                </span>
                <span>
                  <strong>{theaterData.totalSeats || "–"}</strong>
                  seats
                </span>
              </div>
            </div>
          </div>
          {pickedSlots.length > 0 ? (
            <ul className="cb-proof__times" aria-label="Show times and prices">
              {pickedSlots.map((slot) => (
                <li key={slot}>
                  {slot}
                  <span>₹{priceFor(slot)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cb-muted cb-small">Punched show times appear here with their prices.</p>
          )}
        </aside>
      </div>
    </section>
  );
};

export default AddTheaterPage;
