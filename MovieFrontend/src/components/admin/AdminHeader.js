import React from "react";
import { Search } from "lucide-react";

const AdminHeader = ({ activeTab, searchTerm, setSearchTerm }) => {
  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b border-slate-600/50 backdrop-blur-sm px-8 py-6 flex justify-between items-center shadow-lg">
      {/* Left Section - Title & Description */}
      <div className="flex items-center space-x-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent capitalize">
            {activeTab}
          </h2>
          <p className="text-slate-300 mt-1 text-sm font-medium">
            Manage your {activeTab} efficiently
          </p>
        </div>

        {/* Status Indicator */}
        <div className="hidden md:flex items-center space-x-2 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-400/30 backdrop-blur-sm">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-emerald-300 text-sm font-medium">
            System Online
          </span>
        </div>
      </div>

      {/* Right Section - Enhanced Search */}
      <div className="flex items-center space-x-4">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-3 w-80 bg-slate-700/50 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg placeholder-slate-400 text-white backdrop-blur-sm"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
