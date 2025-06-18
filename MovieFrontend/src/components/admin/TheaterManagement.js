import React, { useState } from "react";
import { MapPin } from "lucide-react";
import TheaterDetailsModal from "./TheaterDetailsModal";

const TheaterManagement = ({
  theaters,
  searchTerm,
  onAddTheater,
  onEditTheater,
  onDeleteTheater,
}) => {
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTheaters = theaters.filter(
    (theater) =>
      theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theater.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (theater) => {
    if (onEditTheater) {
      onEditTheater(theater);
    }
  };

  const handleDeleteClick = (theaterId) => {
    if (window.confirm("Are you sure you want to delete this theater?")) {
      if (onDeleteTheater) {
        onDeleteTheater(theaterId);
      }
    }
  };

  const handleViewDetails = (theater) => {
    setSelectedTheater(theater);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTheater(null);
  };

  const TheaterCard = ({ theater }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">
            {theater.name}
          </h3>
          <p className="text-slate-600 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {theater.location}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            theater.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {theater.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {theater.screens}
          </div>
          <div className="text-sm text-slate-600">Screens</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {theater.totalSeats}
          </div>
          <div className="text-sm text-slate-600">Total Seats</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">
          Facilities
        </h4>
        <div className="flex flex-wrap gap-2">
          {theater.facilities.map((facility, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg"
            >
              {facility}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">
          Show Times
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {theater.shows.map((show, index) => (
            <div
              key={index}
              className="bg-slate-50 text-center py-1 px-2 rounded text-xs"
            >
              {show}
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          onClick={() => handleViewDetails(theater)}
        >
          View Details
        </button>
        <button
          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          onClick={() => handleEditClick(theater)}
          title="Edit Theater"
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
          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          onClick={() => handleDeleteClick(theater.id)}
          title="Delete Theater"
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
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          Theaters Management
        </h3>
        <button
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
          onClick={onAddTheater}
        >
          Add New Theater
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTheaters.map((theater) => (
          <TheaterCard key={theater.id} theater={theater} />
        ))}
      </div>

      {filteredTheaters.length === 0 && (
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-600 mb-2">
            No Theaters Found
          </h3>
          <p className="text-slate-500">
            Try adjusting your search criteria or add a new theater
          </p>
        </div>
      )}

      {/* Theater Details Modal */}
      <TheaterDetailsModal
        theater={selectedTheater}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditClick}
      />
    </div>
  );
};

export default TheaterManagement;
