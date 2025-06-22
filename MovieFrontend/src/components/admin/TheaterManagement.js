// import React, { useState } from "react";
// import { MapPin } from "lucide-react";
// import TheaterDetailsModal from "./TheaterDetailsModal";

// const TheaterManagement = ({
//   theaters,
//   searchTerm,
//   onAddTheater,
//   onEditTheater,
//   onDeleteTheater,
// }) => {
//   const [selectedTheater, setSelectedTheater] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const filteredTheaters = theaters.filter(
//     (theater) =>
//       theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       theater.location.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleEditClick = (theater) => {
//     if (onEditTheater) {
//       onEditTheater(theater);
//     }
//   };

//   const handleDeleteClick = (theaterId) => {
//     if (window.confirm("Are you sure you want to delete this theater?")) {
//       if (onDeleteTheater) {
//         onDeleteTheater(theaterId);
//       }
//     }
//   };

//   const handleViewDetails = (theater) => {
//     setSelectedTheater(theater);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedTheater(null);
//   };

//   const TheaterCard = ({ theater }) => (
//     <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h3 className="text-xl font-bold text-slate-800 mb-1">
//             {theater.name}
//           </h3>
//           <p className="text-slate-600 flex items-center">
//             <MapPin className="w-4 h-4 mr-1" />
//             {theater.location}
//           </p>
//         </div>
//         <span
//           className={`px-3 py-1 rounded-full text-xs font-medium ${
//             theater.status === "Active"
//               ? "bg-green-100 text-green-800"
//               : "bg-red-100 text-red-800"
//           }`}
//         >
//           {theater.status}
//         </span>
//       </div>

//       <div className="grid grid-cols-2 gap-4 mb-4">
//         <div className="text-center p-3 bg-slate-50 rounded-lg">
//           <div className="text-2xl font-bold text-purple-600">
//             {theater.screens}
//           </div>
//           <div className="text-sm text-slate-600">Screens</div>
//         </div>
//         <div className="text-center p-3 bg-slate-50 rounded-lg">
//           <div className="text-2xl font-bold text-blue-600">
//             {theater.totalSeats}
//           </div>
//           <div className="text-sm text-slate-600">Total Seats</div>
//         </div>
//       </div>

//       <div className="mb-4">
//         <h4 className="text-sm font-semibold text-slate-700 mb-2">
//           Facilities
//         </h4>
//         <div className="flex flex-wrap gap-2">
//           {theater.facilities.map((facility, index) => (
//             <span
//               key={index}
//               className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg"
//             >
//               {facility}
//             </span>
//           ))}
//         </div>
//       </div>

//       <div className="mb-4">
//         <h4 className="text-sm font-semibold text-slate-700 mb-2">
//           Show Times
//         </h4>
//         <div className="grid grid-cols-2 gap-2">
//           {theater.shows.map((show, index) => (
//             <div
//               key={index}
//               className="bg-slate-50 text-center py-1 px-2 rounded text-xs"
//             >
//               {show}
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="flex space-x-2">
//         <button
//           className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200"
//           onClick={() => handleViewDetails(theater)}
//         >
//           View Details
//         </button>
//         <button
//           className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
//           onClick={() => handleEditClick(theater)}
//           title="Edit Theater"
//         >
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//             />
//           </svg>
//         </button>
//         <button
//           className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
//           onClick={() => handleDeleteClick(theater.id)}
//           title="Delete Theater"
//         >
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//             />
//           </svg>
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-xl font-bold text-slate-800">
//           Theaters Management
//         </h3>
//         <button
//           className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
//           onClick={onAddTheater}
//         >
//           Add New Theater
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {filteredTheaters.map((theater) => (
//           <TheaterCard key={theater.id} theater={theater} />
//         ))}
//       </div>

//       {filteredTheaters.length === 0 && (
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
//                 d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
//               />
//             </svg>
//           </div>
//           <h3 className="text-xl font-semibold text-slate-600 mb-2">
//             No Theaters Found
//           </h3>
//           <p className="text-slate-500">
//             Try adjusting your search criteria or add a new theater
//           </p>
//         </div>
//       )}

//       {/* Theater Details Modal */}
//       <TheaterDetailsModal
//         theater={selectedTheater}
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         onEdit={handleEditClick}
//       />
//     </div>
//   );
// };

// export default TheaterManagement;
import React, { useState, useEffect } from "react";
import {
  Building,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";

const TheaterManagement = ({
  onNavigateToAddTheater,
  onNavigateToEditTheater,
}) => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // API functions
  const API_BASE_URL = "http://localhost:8080";

  const apiCall = async (endpoint, options = {}) => {
    const { headers: customHeaders = {}, ...rest } = options;
    const config = {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
      },
    };
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API request failed");
    return data;
  };

  const withAuth = () => {
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("userToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getTheaters = async () => {
    try {
      const resp = await apiCall("/api/theaters", {
        method: "GET",
        headers: withAuth(),
      });
      return resp.data || [];
    } catch (error) {
      console.error("Failed to fetch theaters:", error);
      return [];
    }
  };

  const deleteTheater = async (id) => {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Admin authentication required");

    await apiCall(`/api/theaters/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  };

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTheaters();
      setTheaters(data);
    } catch (err) {
      setError("Failed to load theaters. Please try again.");
      console.error("Error fetching theaters:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTheater = async (theaterId) => {
    if (window.confirm("Are you sure you want to delete this theater?")) {
      try {
        await deleteTheater(theaterId);
        setTheaters(theaters.filter((t) => t.id !== theaterId));
      } catch (error) {
        console.error("Error deleting theater:", error);
        alert("Failed to delete theater. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-300">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg">Loading theaters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Theater Management
            </h1>
            <p className="text-slate-400 mt-2">
              Manage your theaters and their schedules
            </p>
          </div>
          <button
            onClick={onNavigateToAddTheater}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Theater
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchTheaters}
            className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theaters.map((theater) => (
          <div
            key={theater.id}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Building className="w-6 h-6 text-purple-400 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">
                    {theater.name}
                  </h3>
                  <p className="text-sm text-slate-400 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {theater.location}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    onNavigateToEditTheater && onNavigateToEditTheater(theater)
                  }
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTheater(theater.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Location:</span>
                <span className="text-slate-300">
                  {theater.city}, {theater.state}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Screens:</span>
                <span className="text-slate-300">
                  {theater.numberOfScreens || theater.screens || 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total Seats:</span>
                <span className="text-slate-300">
                  {theater.totalSeats || 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    theater.status === "ACTIVE" || theater.status === "Active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {theater.status}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center text-sm text-slate-400 mb-2">
                <Settings className="w-4 h-4 mr-1" />
                Contact
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">{theater.email}</p>
                <p className="text-xs text-slate-500">
                  {theater.phoneNumber || theater.phone}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {theaters.length === 0 && !loading && !error && (
        <div className="text-center py-16">
          <Building className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            No Theaters Found
          </h3>
          <p className="text-slate-500 mb-6">
            Get started by adding your first theater
          </p>
          <button
            onClick={onNavigateToAddTheater}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Theater
          </button>
        </div>
      )}
    </div>
  );
};

export default TheaterManagement;
