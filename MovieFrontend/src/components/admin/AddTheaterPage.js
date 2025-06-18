import React, { useState } from "react";
import { ChevronLeft, MapPin, Building, Users, Settings } from "lucide-react";

const AddTheaterPage = ({ onBack, onSave }) => {
  const [theaterData, setTheaterData] = useState({
    name: "",
    location: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    screens: "",
    totalSeats: "",
    facilities: [],
    shows: [],
    pricing: {
      morning: "",
      afternoon: "",
      evening: "",
      night: "",
    },
    status: "Active",
  });

  const [errors, setErrors] = useState({});

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
    // Clear error when user starts typing
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

    if (!theaterData.name.trim()) newErrors.name = "Theater name is required";
    if (!theaterData.location.trim())
      newErrors.location = "Location is required";
    if (!theaterData.address.trim()) newErrors.address = "Address is required";
    if (!theaterData.city.trim()) newErrors.city = "City is required";
    if (!theaterData.state.trim()) newErrors.state = "State is required";
    if (!theaterData.pincode.trim()) newErrors.pincode = "Pincode is required";
    if (!theaterData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!theaterData.email.trim()) newErrors.email = "Email is required";
    if (
      !theaterData.screens ||
      isNaN(theaterData.screens) ||
      theaterData.screens <= 0
    ) {
      newErrors.screens = "Valid number of screens is required";
    }
    if (
      !theaterData.totalSeats ||
      isNaN(theaterData.totalSeats) ||
      theaterData.totalSeats <= 0
    ) {
      newErrors.totalSeats = "Valid total seats number is required";
    }
    if (theaterData.shows.length === 0) {
      newErrors.shows = "At least one show time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Generate show prices based on time slots
      const showPrices = {};
      theaterData.shows.forEach((show) => {
        const hour = parseInt(show.split(":")[0]);
        const isPM = show.includes("PM");
        const time24 =
          isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;

        if (time24 >= 6 && time24 < 12) {
          showPrices[show] = parseInt(theaterData.pricing.morning) || 200;
        } else if (time24 >= 12 && time24 < 17) {
          showPrices[show] = parseInt(theaterData.pricing.afternoon) || 250;
        } else if (time24 >= 17 && time24 < 21) {
          showPrices[show] = parseInt(theaterData.pricing.evening) || 300;
        } else {
          showPrices[show] = parseInt(theaterData.pricing.night) || 350;
        }
      });

      const newTheater = {
        ...theaterData,
        id: Date.now().toString(),
        screens: parseInt(theaterData.screens),
        totalSeats: parseInt(theaterData.totalSeats),
        prices: showPrices,
      };

      onSave(newTheater);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Add New Theater</h1>
          <p className="text-slate-600">Fill in the theater details below</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Building className="w-5 h-5 mr-2 text-purple-500" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Theater Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={theaterData.name}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="e.g., PVR Cinemas - Phoenix Mall"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={theaterData.location}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.location ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="e.g., Phoenix Mall, Mumbai"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={theaterData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.address ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={theaterData.city}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.city ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={theaterData.state}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.state ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={theaterData.pincode}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.pincode ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Enter pincode"
                />
                {errors.pincode && (
                  <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={theaterData.phone}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.phone ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={theaterData.email}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.email ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Theater Specifications */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Theater Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Number of Screens *
                </label>
                <input
                  type="number"
                  name="screens"
                  value={theaterData.screens}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.screens ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="e.g., 8"
                />
                {errors.screens && (
                  <p className="text-red-500 text-sm mt-1">{errors.screens}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Total Seats *
                </label>
                <input
                  type="number"
                  name="totalSeats"
                  value={theaterData.totalSeats}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.totalSeats ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="e.g., 1200"
                />
                {errors.totalSeats && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.totalSeats}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={theaterData.status}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-green-500" />
              Facilities
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableFacilities.map((facility) => (
                <label
                  key={facility}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={theaterData.facilities.includes(facility)}
                    onChange={() => handleFacilityToggle(facility)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-slate-700 text-sm">{facility}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Show Times */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-orange-500" />
              Show Times *
            </h3>

            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {timeSlots.map((slot) => (
                <label
                  key={slot}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={theaterData.shows.includes(slot)}
                    onChange={() => handleShowToggle(slot)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-slate-700 text-sm">{slot}</span>
                </label>
              ))}
            </div>
            {errors.shows && (
              <p className="text-red-500 text-sm mt-2">{errors.shows}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="text-lg mr-2">💰</span>
              Pricing (₹)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Morning Shows (6 AM - 12 PM)
                </label>
                <input
                  type="number"
                  value={theaterData.pricing.morning}
                  onChange={(e) =>
                    handlePricingChange("morning", e.target.value)
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Afternoon Shows (12 PM - 5 PM)
                </label>
                <input
                  type="number"
                  value={theaterData.pricing.afternoon}
                  onChange={(e) =>
                    handlePricingChange("afternoon", e.target.value)
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="250"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Evening Shows (5 PM - 9 PM)
                </label>
                <input
                  type="number"
                  value={theaterData.pricing.evening}
                  onChange={(e) =>
                    handlePricingChange("evening", e.target.value)
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Night Shows (9 PM onwards)
                </label>
                <input
                  type="number"
                  value={theaterData.pricing.night}
                  onChange={(e) => handlePricingChange("night", e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="350"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Add Theater
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTheaterPage;
