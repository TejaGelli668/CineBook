import React from "react";
import { Home, Film, Building2, Users, BarChart3, LogOut } from "lucide-react";

const AdminSidebar = ({ activeTab, setActiveTab, currentView, onNavigate }) => {
  // Support both old and new prop patterns
  const currentActiveTab = activeTab || currentView || "dashboard";
  const handleTabChange = setActiveTab || onNavigate || (() => {});

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      tab: "dashboard",
    },
    {
      id: "movies",
      label: "Movies",
      icon: Film,
      tab: "movies",
    },
    {
      id: "theaters",
      label: "Theaters",
      icon: Building2,
      tab: "theaters",
    },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("userToken");
      window.location.href = "/";
    }
  };

  const handleMenuClick = (tab) => {
    try {
      handleTabChange(tab);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">CineAdmin</h1>
            <p className="text-xs text-slate-400">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentActiveTab === item.tab ||
              (item.tab === "movies" &&
                (currentActiveTab === "addMovie" ||
                  currentActiveTab === "editMovie")) ||
              (item.tab === "theaters" &&
                (currentActiveTab === "addTheater" ||
                  currentActiveTab === "editTheater"));

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.tab)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section - Only Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-red-400 hover:bg-red-900 hover:text-red-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
