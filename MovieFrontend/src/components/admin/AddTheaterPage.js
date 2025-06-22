// import React, { useState } from "react";
// import {
//   ChevronLeft,
//   MapPin,
//   Building,
//   Users,
//   Settings,
//   Phone,
//   Mail,
//   Calendar,
//   DollarSign,
// } from "lucide-react";

// const AddTheaterPage = ({ onBack, onSave }) => {
//   const [theaterData, setTheaterData] = useState({
//     name: "",
//     location: "",
//     address: "",
//     city: "",
//     state: "",
//     pincode: "",
//     phoneNumber: "", // Changed from 'phone' to 'phoneNumber'
//     email: "",
//     numberOfScreens: "", // Changed from 'screens' to 'numberOfScreens'
//     totalSeats: "",
//     facilities: [],
//     shows: [],
//     pricing: {
//       morning: "",
//       afternoon: "",
//       evening: "",
//       night: "",
//     },
//     status: "ACTIVE", // Changed from "Active" to "ACTIVE"
//   });

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const availableFacilities = [
//     "M-Ticket",
//     "Food & Beverage",
//     "Parking",
//     "IMAX",
//     "4DX",
//     "DOLBY ATMOS",
//     "Recliner Seats",
//     "Wheelchair Access",
//     "Air Conditioning",
//     "Online Booking",
//     "Card Payment",
//     "UPI Payment",
//   ];

//   const timeSlots = [
//     "09:00 AM",
//     "09:30 AM",
//     "10:00 AM",
//     "10:30 AM",
//     "11:00 AM",
//     "11:30 AM",
//     "12:00 PM",
//     "12:30 PM",
//     "01:00 PM",
//     "01:30 PM",
//     "02:00 PM",
//     "02:30 PM",
//     "03:00 PM",
//     "03:30 PM",
//     "04:00 PM",
//     "04:30 PM",
//     "05:00 PM",
//     "05:30 PM",
//     "06:00 PM",
//     "06:30 PM",
//     "07:00 PM",
//     "07:30 PM",
//     "08:00 PM",
//     "08:30 PM",
//     "09:00 PM",
//     "09:30 PM",
//     "10:00 PM",
//     "10:30 PM",
//     "11:00 PM",
//   ];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setTheaterData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const handlePricingChange = (timeSlot, value) => {
//     setTheaterData((prev) => ({
//       ...prev,
//       pricing: {
//         ...prev.pricing,
//         [timeSlot]: value,
//       },
//     }));
//   };

//   const handleFacilityToggle = (facility) => {
//     setTheaterData((prev) => ({
//       ...prev,
//       facilities: prev.facilities.includes(facility)
//         ? prev.facilities.filter((f) => f !== facility)
//         : [...prev.facilities, facility],
//     }));
//   };

//   const handleShowToggle = (show) => {
//     setTheaterData((prev) => ({
//       ...prev,
//       shows: prev.shows.includes(show)
//         ? prev.shows.filter((s) => s !== show)
//         : [...prev.shows, show],
//     }));
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!theaterData.name.trim()) newErrors.name = "Theater name is required";
//     if (!theaterData.location.trim())
//       newErrors.location = "Location is required";
//     if (!theaterData.address.trim()) newErrors.address = "Address is required";
//     if (!theaterData.city.trim()) newErrors.city = "City is required";
//     if (!theaterData.state.trim()) newErrors.state = "State is required";
//     if (!theaterData.pincode.trim()) newErrors.pincode = "Pincode is required";
//     if (!theaterData.phoneNumber.trim())
//       newErrors.phoneNumber = "Phone number is required";
//     if (!theaterData.email.trim()) newErrors.email = "Email is required";
//     if (
//       !theaterData.numberOfScreens ||
//       isNaN(theaterData.numberOfScreens) ||
//       theaterData.numberOfScreens <= 0
//     ) {
//       newErrors.numberOfScreens = "Valid number of screens is required";
//     }
//     if (
//       !theaterData.totalSeats ||
//       isNaN(theaterData.totalSeats) ||
//       theaterData.totalSeats <= 0
//     ) {
//       newErrors.totalSeats = "Valid total seats number is required";
//     }
//     if (theaterData.shows.length === 0) {
//       newErrors.shows = "At least one show time is required";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (validateForm()) {
//       setLoading(true);
//       try {
//         // Generate show prices based on time slots
//         const showPrices = {};
//         theaterData.shows.forEach((show) => {
//           const hour = parseInt(show.split(":")[0]);
//           const isPM = show.includes("PM");
//           const time24 =
//             isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;

//           if (time24 >= 6 && time24 < 12) {
//             showPrices[show] = theaterData.pricing.morning || "200";
//           } else if (time24 >= 12 && time24 < 17) {
//             showPrices[show] = theaterData.pricing.afternoon || "250";
//           } else if (time24 >= 17 && time24 < 21) {
//             showPrices[show] = theaterData.pricing.evening || "300";
//           } else {
//             showPrices[show] = theaterData.pricing.night || "350";
//           }
//         });

//         // Prepare the data to match backend entity
//         const newTheater = {
//           name: theaterData.name,
//           location: theaterData.location,
//           address: theaterData.address,
//           city: theaterData.city,
//           state: theaterData.state,
//           pincode: theaterData.pincode,
//           phoneNumber: theaterData.phoneNumber, // Correct field name
//           email: theaterData.email,
//           numberOfScreens: parseInt(theaterData.numberOfScreens), // Correct field name
//           totalSeats: parseInt(theaterData.totalSeats),
//           facilities: theaterData.facilities,
//           shows: theaterData.shows,
//           pricing: showPrices, // Send as object/map
//           status: theaterData.status, // Send as enum value
//         };

//         console.log("Sending theater data:", newTheater); // Debug log
//         await onSave(newTheater);
//       } catch (error) {
//         console.error("Error saving theater:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
//       {/* Header */}
//       <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700 px-8 py-6 flex items-center space-x-4">
//         <button
//           onClick={onBack}
//           className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
//         >
//           <ChevronLeft className="w-6 h-6" />
//         </button>
//         <div>
//           <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
//             Add New Theater
//           </h1>
//           <p className="text-slate-400">Fill in the theater details below</p>
//         </div>
//       </div>

//       {/* Form Content */}
//       <div className="max-w-6xl mx-auto px-8 py-8">
//         <div className="space-y-8">
//           {/* Basic Information */}
//           <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
//             <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center">
//               <Building className="w-6 h-6 mr-3 text-purple-400" />
//               Basic Information
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Theater Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={theaterData.name}
//                   onChange={handleInputChange}
//                   className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
//                     errors.name ? "border-red-500" : "border-slate-600"
//                   }`}
//                   placeholder="e.g., PVR Cinemas - Phoenix Mall"
//                 />
//                 {errors.name && (
//                   <p className="text-red-400 text-sm mt-1">{errors.name}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Location *
//                 </label>
//                 <input
//                   type="text"
//                   name="location"
//                   value={theaterData.location}
//                   onChange={handleInputChange}
//                   className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
//                     errors.location ? "border-red-500" : "border-slate-600"
//                   }`}
//                   placeholder="e.g., Phoenix Mall, Mumbai"
//                 />
//                 {errors.location && (
//                   <p className="text-red-400 text-sm mt-1">{errors.location}</p>
//                 )}
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Address *
//                 </label>
//                 <textarea
//                   name="address"
//                   value={theaterData.address}
//                   onChange={handleInputChange}
//                   rows={3}
//                   className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
//                     errors.address ? "border-red-500" : "border-slate-600"
//                   }`}
//                   placeholder="Enter full address"
//                 />
//                 {errors.address && (
//                   <p className="text-red-400 text-sm mt-1">{errors.address}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   City *
//                 </label>
//                 <input
//                   type="text"
//                   name="city"
//                   value={theaterData.city}
//                   onChange={handleInputChange}
//                   className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
//                     errors.city ? "border-red-500" : "border-slate-600"
//                   }`}
//                   placeholder="Enter city"
//                 />
//                 {errors.city && (
//                   <p className="text-red-400 text-sm mt-1">{errors.city}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   State *
//                 </label>
//                 <input
//                   type="text"
//                   name="state"
//                   value={theaterData.state}
//                   onChange={handleInputChange}
//                   className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
//                     errors.state ? "border-red-500" : "border-slate-600"
//                   }`}
//                   placeholder="Enter state"
//                 />
//                 {errors.state && (
//                   <p className="text-red-400 text-sm mt-1">{errors.state}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Pincode *
//                 </label>
//                 <input
//                   type="text"
//                   name="pincode"
//                   value={theaterData.pincode}
//                   onChange={handleInputChange}
//                   className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
//                     errors.pincode ? "border-red-500" : "border-slate-600"
//                   }`}
//                   placeholder="Enter pincode"
//                 />
//                 {errors.pincode && (
//                   <p className="text-red-400 text-sm mt-1">{errors.pincode}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
//                   <Phone className="w-4 h-4 mr-2" />
//                   Phone Number *
//                 </label>
//                 <input
//                   type="tel"
//                   name="phoneNumber"
//                   value={theaterData.phoneNumber}
//                   onChange={handleInputChange}
//                   className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
//                     errors.phoneNumber ? "border-red-500" : "border-slate-600"
//                   }`}
//                   placeholder="Enter phone number"
//                 />
//                 {errors.phoneNumber && (
//                   <p className="text-red-400 text-sm mt-1">
//                     {errors.phoneNumber}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
//                   <Mail className="w-4 h-4 mr-2" />
//                   Email *
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={theaterData.email}
//                   onChange={handleInputChange}
//                   className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
//                     errors.email ? "border-red-500" : "border-slate-600"
//                   }`}
//                   placeholder="Enter email address"
//                 />
//                 {errors.email && (
//                   <p className="text-red-400 text-sm mt-1">{errors.email}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Theater Specifications */}
//           <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
//             <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center">
//               <Users className="w-6 h-6 mr-3 text-blue-400" />
//               Theater Specifications
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Number of Screens *
//                 </label>
//                 <input
//                   type="number"
//                   name="numberOfScreens"
//                   value={theaterData.numberOfScreens}
//                   onChange={handleInputChange}
//                   min="1"
//                   className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
//                     errors.numberOfScreens
//                       ? "border-red-500"
//                       : "border-slate-600"
//                   }`}
//                   placeholder="e.g., 8"
//                 />
//                 {errors.numberOfScreens && (
//                   <p className="text-red-400 text-sm mt-1">
//                     {errors.numberOfScreens}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Total Seats *
//                 </label>
//                 <input
//                   type="number"
//                   name="totalSeats"
//                   value={theaterData.totalSeats}
//                   onChange={handleInputChange}
//                   min="1"
//                   className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
//                     errors.totalSeats ? "border-red-500" : "border-slate-600"
//                   }`}
//                   placeholder="e.g., 1200"
//                 />
//                 {errors.totalSeats && (
//                   <p className="text-red-400 text-sm mt-1">
//                     {errors.totalSeats}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Status
//                 </label>
//                 <select
//                   name="status"
//                   value={theaterData.status}
//                   onChange={handleInputChange}
//                   className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                 >
//                   <option value="ACTIVE">Active</option>
//                   <option value="INACTIVE">Inactive</option>
//                   <option value="UNDER_MAINTENANCE">Under Maintenance</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Facilities */}
//           <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
//             <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center">
//               <Settings className="w-6 h-6 mr-3 text-green-400" />
//               Facilities
//             </h3>

//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               {availableFacilities.map((facility) => (
//                 <label
//                   key={facility}
//                   className="flex items-center space-x-3 cursor-pointer group"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={theaterData.facilities.includes(facility)}
//                     onChange={() => handleFacilityToggle(facility)}
//                     className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
//                   />
//                   <span className="text-slate-300 text-sm group-hover:text-slate-200 transition-colors">
//                     {facility}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Show Times */}
//           <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
//             <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center">
//               <Calendar className="w-6 h-6 mr-3 text-orange-400" />
//               Show Times *
//             </h3>

//             <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
//               {timeSlots.map((slot) => (
//                 <label
//                   key={slot}
//                   className="flex items-center space-x-2 cursor-pointer group"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={theaterData.shows.includes(slot)}
//                     onChange={() => handleShowToggle(slot)}
//                     className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
//                   />
//                   <span className="text-slate-300 text-sm group-hover:text-slate-200 transition-colors">
//                     {slot}
//                   </span>
//                 </label>
//               ))}
//             </div>
//             {errors.shows && (
//               <p className="text-red-400 text-sm mt-3">{errors.shows}</p>
//             )}
//           </div>

//           {/* Pricing */}
//           <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
//             <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center">
//               <DollarSign className="w-6 h-6 mr-3 text-yellow-400" />
//               Pricing (₹)
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Morning Shows (6 AM - 12 PM)
//                 </label>
//                 <input
//                   type="number"
//                   value={theaterData.pricing.morning}
//                   onChange={(e) =>
//                     handlePricingChange("morning", e.target.value)
//                   }
//                   className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                   placeholder="200"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Afternoon Shows (12 PM - 5 PM)
//                 </label>
//                 <input
//                   type="number"
//                   value={theaterData.pricing.afternoon}
//                   onChange={(e) =>
//                     handlePricingChange("afternoon", e.target.value)
//                   }
//                   className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                   placeholder="250"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Evening Shows (5 PM - 9 PM)
//                 </label>
//                 <input
//                   type="number"
//                   value={theaterData.pricing.evening}
//                   onChange={(e) =>
//                     handlePricingChange("evening", e.target.value)
//                   }
//                   className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                   placeholder="300"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Night Shows (9 PM onwards)
//                 </label>
//                 <input
//                   type="number"
//                   value={theaterData.pricing.night}
//                   onChange={(e) => handlePricingChange("night", e.target.value)}
//                   className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                   placeholder="350"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Submit Buttons */}
//           <div className="flex justify-end space-x-4">
//             <button
//               type="button"
//               onClick={onBack}
//               className="px-8 py-4 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700/50 transition-all"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={loading}
//               className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Adding Theater..." : "Add Theater"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddTheaterPage;
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  MapPin,
  Building,
  Users,
  Settings,
  Phone,
  Mail,
  Calendar,
  DollarSign,
} from "lucide-react";

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

    if (!theaterData.name.trim()) newErrors.name = "Theater name is required";
    if (!theaterData.location.trim())
      newErrors.location = "Location is required";
    if (!theaterData.address.trim()) newErrors.address = "Address is required";
    if (!theaterData.city.trim()) newErrors.city = "City is required";
    if (!theaterData.state.trim()) newErrors.state = "State is required";
    if (!theaterData.pincode.trim()) newErrors.pincode = "Pincode is required";
    if (!theaterData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!theaterData.email.trim()) newErrors.email = "Email is required";
    if (
      !theaterData.numberOfScreens ||
      isNaN(theaterData.numberOfScreens) ||
      theaterData.numberOfScreens <= 0
    ) {
      newErrors.numberOfScreens = "Valid number of screens is required";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700 px-8 py-6 flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            {theater ? "Edit Theater" : "Add New Theater"}
          </h1>
          <p className="text-slate-400">
            {theater
              ? "Update the theater details below"
              : "Fill in the theater details below"}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center">
              <Building className="w-6 h-6 mr-3 text-purple-400" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Theater Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={theaterData.name}
                  onChange={handleInputChange}
                  className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.name ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="e.g., PVR Cinemas - Phoenix Mall"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={theaterData.location}
                  onChange={handleInputChange}
                  className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.location ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="e.g., Phoenix Mall, Mumbai"
                />
                {errors.location && (
                  <p className="text-red-400 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={theaterData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
                    errors.address ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={theaterData.city}
                  onChange={handleInputChange}
                  className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.city ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={theaterData.state}
                  onChange={handleInputChange}
                  className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.state ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="text-red-400 text-sm mt-1">{errors.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={theaterData.pincode}
                  onChange={handleInputChange}
                  className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.pincode ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Enter pincode"
                />
                {errors.pincode && (
                  <p className="text-red-400 text-sm mt-1">{errors.pincode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={theaterData.phoneNumber}
                  onChange={handleInputChange}
                  className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.phoneNumber ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={theaterData.email}
                  onChange={handleInputChange}
                  className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.email ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Theater Specifications */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-blue-400" />
              Theater Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Number of Screens *
                </label>
                <input
                  type="number"
                  name="numberOfScreens"
                  value={theaterData.numberOfScreens}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.numberOfScreens
                      ? "border-red-500"
                      : "border-slate-600"
                  }`}
                  placeholder="e.g., 8"
                />
                {errors.numberOfScreens && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.numberOfScreens}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Total Seats *
                </label>
                <input
                  type="number"
                  name="totalSeats"
                  value={theaterData.totalSeats}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full p-4 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.totalSeats ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="e.g., 1200"
                />
                {errors.totalSeats && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.totalSeats}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={theaterData.status}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-green-400" />
              Facilities
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableFacilities.map((facility) => (
                <label
                  key={facility}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={theaterData.facilities.includes(facility)}
                    onChange={() => handleFacilityToggle(facility)}
                    className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-slate-300 text-sm group-hover:text-slate-200 transition-colors">
                    {facility}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Show Times */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-orange-400" />
              Show Times *
            </h3>

            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {timeSlots.map((slot) => (
                <label
                  key={slot}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={theaterData.shows.includes(slot)}
                    onChange={() => handleShowToggle(slot)}
                    className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-slate-300 text-sm group-hover:text-slate-200 transition-colors">
                    {slot}
                  </span>
                </label>
              ))}
            </div>
            {errors.shows && (
              <p className="text-red-400 text-sm mt-3">{errors.shows}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center">
              <DollarSign className="w-6 h-6 mr-3 text-yellow-400" />
              Pricing (₹)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Morning Shows (6 AM - 12 PM)
                </label>
                <input
                  type="number"
                  value={theaterData.pricing.morning}
                  onChange={(e) =>
                    handlePricingChange("morning", e.target.value)
                  }
                  className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Afternoon Shows (12 PM - 5 PM)
                </label>
                <input
                  type="number"
                  value={theaterData.pricing.afternoon}
                  onChange={(e) =>
                    handlePricingChange("afternoon", e.target.value)
                  }
                  className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="250"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Evening Shows (5 PM - 9 PM)
                </label>
                <input
                  type="number"
                  value={theaterData.pricing.evening}
                  onChange={(e) =>
                    handlePricingChange("evening", e.target.value)
                  }
                  className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Night Shows (9 PM onwards)
                </label>
                <input
                  type="number"
                  value={theaterData.pricing.night}
                  onChange={(e) => handlePricingChange("night", e.target.value)}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
              className="px-8 py-4 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? theater
                  ? "Updating Theater..."
                  : "Adding Theater..."
                : theater
                ? "Update Theater"
                : "Add Theater"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTheaterPage;
