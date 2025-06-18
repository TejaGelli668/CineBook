import React from "react";
import {
  X,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Building,
  Star,
} from "lucide-react";

const TheaterDetailsModal = ({ theater, isOpen, onClose, onEdit }) => {
  if (!isOpen || !theater) return null;

  const handleEditClick = () => {
    // Close the modal and trigger edit mode
    onClose();
    if (onEdit) {
      onEdit(theater);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {theater.name}
            </h2>
            <p className="text-slate-600 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {theater.location}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                theater.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {theater.status}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Building className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {theater.screens}
              </div>
              <div className="text-sm text-purple-700">Total Screens</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {theater.totalSeats}
              </div>
              <div className="text-sm text-blue-700">Total Seats</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">4.5</div>
              <div className="text-sm text-green-700">Average Rating</div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Phone</div>
                  <div className="font-medium text-slate-800">
                    {theater.phone || "+91 98765 43210"}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Email</div>
                  <div className="font-medium text-slate-800">
                    {theater.email ||
                      "info@" +
                        theater.name.toLowerCase().replace(/\s+/g, "") +
                        ".com"}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-slate-600 mt-1" />
                <div>
                  <div className="text-sm text-slate-600">Full Address</div>
                  <div className="font-medium text-slate-800">
                    {theater.address ||
                      theater.location +
                        ", Near City Mall, Landmark Building, PIN: 400001"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Facilities & Amenities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {theater.facilities.map((facility, index) => (
                <div
                  key={index}
                  className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center"
                >
                  <span className="text-blue-800 text-sm font-medium">
                    {facility}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Show Times */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Show Times
            </h3>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {theater.shows.map((show, index) => (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-center hover:border-purple-300 transition-colors"
                  >
                    <div className="font-semibold text-slate-800">{show}</div>
                    <div className="text-xs text-slate-600 mt-1">Available</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Screen Details */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Screen Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: theater.screens }, (_, index) => (
                <div
                  key={index}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-slate-800">
                      Screen {index + 1}
                    </h4>
                    <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <div>
                      Capacity:{" "}
                      {Math.floor(theater.totalSeats / theater.screens)} seats
                    </div>
                    <div>Format: 2D, 3D, IMAX</div>
                    <div>Sound: Dolby Atmos</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Ticket Pricing
            </h3>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-slate-600">Morning</div>
                  <div className="text-lg font-bold text-slate-800">
                    ₹150-200
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Afternoon</div>
                  <div className="text-lg font-bold text-slate-800">
                    ₹200-250
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Evening</div>
                  <div className="text-lg font-bold text-slate-800">
                    ₹250-300
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Night</div>
                  <div className="text-lg font-bold text-slate-800">
                    ₹280-350
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleEditClick}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Edit Theater
          </button>
        </div>
      </div>
    </div>
  );
};

export default TheaterDetailsModal;
