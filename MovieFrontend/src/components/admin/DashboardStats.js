import React, { useState, useEffect } from "react";
import {
  Star,
  MapPin,
  Building,
  Users,
  Film,
  TrendingUp,
  Activity,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Settings,
  Wrench,
} from "lucide-react";

const DashboardStats = ({
  movies,
  theaters,
  onNavigateToMovies,
  onNavigateToTheaters,
  onNavigateToFixShows,
}) => {
  const [theaterData, setTheaterData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real theater data
  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/theaters", {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("adminToken") ||
              localStorage.getItem("userToken")
            }`,
          },
        });
        const data = await response.json();
        setTheaterData(data.data || data || []);
      } catch (error) {
        console.error("Failed to fetch theaters:", error);
        setTheaterData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, []);

  const stats = [
    {
      title: "Total Movies",
      value: movies?.length || 0,
      icon: Film,
      color: "from-purple-600 to-pink-600",
      change: "+12%",
      bgPattern: "bg-purple-500/10",
    },
    {
      title: "Active Theaters",
      value: theaterData?.filter((t) => t.status === "ACTIVE")?.length || 0,
      icon: Building,
      color: "from-blue-600 to-cyan-600",
      change: "+3%",
      bgPattern: "bg-blue-500/10",
    },
    {
      title: "Total Screens",
      value:
        theaterData?.reduce(
          (acc, theater) => acc + (theater.numberOfScreens || 0),
          0
        ) || 0,
      icon: Activity,
      color: "from-emerald-600 to-green-600",
      change: "+8%",
      bgPattern: "bg-emerald-500/10",
    },
    {
      title: "Total Seats",
      value:
        theaterData?.reduce(
          (acc, theater) => acc + (theater.totalSeats || 0),
          0
        ) || 0,
      icon: Users,
      color: "from-orange-600 to-red-600",
      change: "+5%",
      bgPattern: "bg-orange-500/10",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl border border-white/10 p-8 space-y-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-400 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-400 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-indigo-400 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 relative overflow-hidden"
            >
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div
                  className={`p-4 ${stat.bgPattern} rounded-xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="flex items-center text-sm text-green-300 bg-green-500/20 px-3 py-1 rounded-full border border-green-400/30">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="font-semibold">{stat.change}</span>
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-slate-300 text-sm mb-2 font-medium">
                  {stat.title}
                </p>
                <p className="text-4xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-blue-300 group-hover:bg-clip-text transition-all duration-300">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-slate-400 text-xs">vs last month</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Recent Movies */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden group hover:border-white/30 transition-all duration-300">
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center">
                  <Film className="w-6 h-6 mr-2 text-purple-300" />
                  Recent Movies
                </h3>
                <p className="text-slate-300 text-sm">
                  Latest additions to catalog
                </p>
              </div>
              <button
                onClick={onNavigateToMovies}
                className="text-purple-300 hover:text-purple-200 text-sm font-medium flex items-center transition-colors bg-purple-500/20 px-4 py-2 rounded-lg hover:bg-purple-500/30"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {movies?.length > 0 ? (
              <div className="space-y-4">
                {movies.slice(0, 3).map((movie, index) => (
                  <div
                    key={movie.id}
                    className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 group/movie backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-16 h-20 object-cover rounded-lg shadow-lg group-hover/movie:shadow-xl transition-shadow"
                        />
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-lg line-clamp-1 group-hover/movie:text-purple-300 transition-colors">
                          {movie.title}
                        </h4>
                        <p className="text-slate-300 text-sm flex items-center mt-1">
                          <Film className="w-4 h-4 mr-1" />
                          {movie.genre}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <div className="flex items-center bg-yellow-500/20 px-2 py-1 rounded-md">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                            <span className="text-sm font-semibold text-yellow-300">
                              {movie.rating}
                            </span>
                          </div>
                          <span className="text-sm text-slate-400 bg-slate-600/30 px-2 py-1 rounded-md">
                            {movie.language}
                          </span>
                          <span className="text-sm text-slate-400">
                            • {movie.certificate}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            movie.status === "Active"
                              ? "bg-green-500/20 text-green-300 border border-green-400/30"
                              : "bg-red-500/20 text-red-300 border border-red-400/30"
                          }`}
                        >
                          {movie.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="p-6 bg-purple-500/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Film className="w-12 h-12 text-purple-400" />
                </div>
                <p className="text-slate-300 text-lg mb-2 font-semibold">
                  No movies available
                </p>
                <p className="text-slate-400 text-sm mb-6">
                  Add your first movie to get started
                </p>
                <button
                  onClick={onNavigateToMovies}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Add Movie
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Theater Overview */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden group hover:border-white/30 transition-all duration-300">
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center">
                  <Building className="w-6 h-6 mr-2 text-blue-300" />
                  Theater Network
                </h3>
                <p className="text-slate-300 text-sm">
                  Cinema locations & capacity
                </p>
              </div>
              <button
                onClick={onNavigateToTheaters}
                className="text-blue-300 hover:text-blue-200 text-sm font-medium flex items-center transition-colors bg-blue-500/20 px-4 py-2 rounded-lg hover:bg-blue-500/30"
              >
                Manage All
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="relative mx-auto mb-6 w-16 h-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400/30 border-t-blue-400"></div>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "1s",
                    }}
                  ></div>
                </div>
                <p className="text-slate-300 font-medium">
                  Loading theaters...
                </p>
              </div>
            ) : theaterData?.length > 0 ? (
              <div className="space-y-4">
                {theaterData.slice(0, 3).map((theater) => (
                  <div
                    key={theater.id}
                    className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 group/theater backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-lg group-hover/theater:text-blue-300 transition-colors">
                          {theater.name}
                        </h4>
                        <p className="text-slate-300 text-sm flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1 text-blue-400" />
                          {theater.city}, {theater.state}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          theater.status === "ACTIVE"
                            ? "bg-green-500/20 text-green-300 border border-green-400/30"
                            : "bg-red-500/20 text-red-300 border border-red-400/30"
                        }`}
                      >
                        {theater.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-500/15 rounded-lg p-3 border border-blue-400/20 group-hover/theater:bg-blue-500/25 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-300 text-sm font-medium">
                              Screens
                            </p>
                            <p className="text-2xl font-bold text-white">
                              {theater.numberOfScreens || 0}
                            </p>
                          </div>
                          <Activity className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                      <div className="bg-cyan-500/15 rounded-lg p-3 border border-cyan-400/20 group-hover/theater:bg-cyan-500/25 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-cyan-300 text-sm font-medium">
                              Seats
                            </p>
                            <p className="text-2xl font-bold text-white">
                              {(theater.totalSeats || 0).toLocaleString()}
                            </p>
                          </div>
                          <Users className="w-6 h-6 text-cyan-400" />
                        </div>
                      </div>
                    </div>

                    {theater.facilities && theater.facilities.length > 0 && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-slate-400 text-xs mb-2 font-medium">
                          Facilities:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {theater.facilities
                            .slice(0, 3)
                            .map((facility, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-md border border-blue-400/30"
                              >
                                {facility}
                              </span>
                            ))}
                          {theater.facilities.length > 3 && (
                            <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded-md border border-slate-400/30">
                              +{theater.facilities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="p-6 bg-blue-500/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Building className="w-12 h-12 text-blue-400" />
                </div>
                <p className="text-slate-300 text-lg mb-2 font-semibold">
                  No theaters available
                </p>
                <p className="text-slate-400 text-sm mb-6">
                  Add your first theater to get started
                </p>
                <button
                  onClick={onNavigateToTheaters}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Add Theater
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center">
              <Eye className="w-6 h-6 mr-2 text-indigo-400" />
              Quick Insights
            </h3>
            <p className="text-slate-300 text-sm">Key performance metrics</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group">
            <p className="text-4xl font-bold text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
              {movies?.filter((m) => m.status === "Active")?.length || 0}
            </p>
            <p className="text-slate-300 text-sm font-medium">Active Movies</p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group">
            <p className="text-4xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform">
              {new Set(movies?.map((m) => m.language)).size || 0}
            </p>
            <p className="text-slate-300 text-sm font-medium">Languages</p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group">
            <p className="text-4xl font-bold text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
              {movies?.length > 0
                ? (
                    movies.reduce((acc, m) => acc + m.rating, 0) / movies.length
                  ).toFixed(1)
                : "0.0"}
            </p>
            <p className="text-slate-300 text-sm font-medium">Avg Rating</p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group">
            <p className="text-4xl font-bold text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
              {theaterData?.filter((t) => t.status === "ACTIVE")?.length || 0}
            </p>
            <p className="text-slate-300 text-sm font-medium">
              Active Theaters
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg rounded-2xl border border-white/20 p-6 relative z-10">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-slate-300" />
            Quick Actions
          </h3>
          <p className="text-slate-300 text-sm">Common management tasks</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={onNavigateToFixShows}
            className="group bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Wrench className="w-8 h-8" />
                </div>
                <ArrowRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-lg font-bold mb-2">Fix Shows</h4>
              <p className="text-sm opacity-90">Generate missing seats</p>
            </div>
          </button>

          <button
            onClick={onNavigateToMovies}
            className="group bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Film className="w-8 h-8" />
                </div>
                <ArrowRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-lg font-bold mb-2">Manage Movies</h4>
              <p className="text-sm opacity-90">Add, edit movies</p>
            </div>
          </button>

          <button
            onClick={onNavigateToTheaters}
            className="group bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Building className="w-8 h-8" />
                </div>
                <ArrowRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-lg font-bold mb-2">Manage Theaters</h4>
              <p className="text-sm opacity-90">Add, edit theaters</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
