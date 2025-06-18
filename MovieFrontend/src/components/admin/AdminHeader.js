import React from "react";

const AdminHeader = ({ activeTab, searchTerm, setSearchTerm }) => {
  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 capitalize">
          {activeTab}
        </h2>
        <p className="text-slate-600">Manage your {activeTab} efficiently</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        {/* Removed arrow icon, profile icon, and logout button */}
      </div>
    </div>
  );
};

export default AdminHeader;
