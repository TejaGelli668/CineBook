import React from "react";

const DashboardStats = ({ movies, theaters }) => {
  const stats = [
    {
      title: "Total Movies",
      value: movies?.length || 0,
      icon: "🎬",
      color: "from-purple-500 to-purple-600",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Active Theaters",
      value: theaters?.length || 0,
      icon: "🏢",
      color: "from-blue-500 to-blue-600",
      change: "+3%",
      changeType: "positive",
    },
    {
      title: "Today Shows",
      value: "24",
      icon: "⏰",
      color: "from-green-500 to-green-600",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Total Bookings",
      value: "156",
      icon: "🎫",
      color: "from-orange-500 to-orange-600",
      change: "-2%",
      changeType: "negative",
    },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm ${
                      stat.changeType === "positive"
                        ? "text-green-200"
                        : "text-red-200"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-white/60 text-xs ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <span className="text-4xl opacity-80">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Movies */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            Recent Movies
          </h3>
          <div className="space-y-3">
            {movies?.slice(0, 3).map((movie) => (
              <div
                key={movie.id}
                className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">
                    {movie.title}
                  </h4>
                  <p className="text-sm text-slate-600">{movie.genre}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm text-slate-600 ml-1">
                      {movie.rating}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    movie.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {movie.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Theaters */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            Theater Overview
          </h3>
          <div className="space-y-3">
            {theaters?.slice(0, 3).map((theater) => (
              <div key={theater.id} className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-slate-800">{theater.name}</h4>
                <p className="text-sm text-slate-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {theater.location}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-slate-600">
                    {theater.screens} screens
                  </span>
                  <span className="text-sm text-slate-600">
                    {theater.totalSeats} seats
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      theater.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {theater.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all">
            <div className="text-2xl mb-2">🎬</div>
            <div className="text-sm font-medium">Add Movie</div>
          </button>
          <button className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all">
            <div className="text-2xl mb-2">🏢</div>
            <div className="text-sm font-medium">Add Theater</div>
          </button>
          <button className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all">
            <div className="text-2xl mb-2">⏰</div>
            <div className="text-sm font-medium">Schedule Show</div>
          </button>
          <button className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">View Reports</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
