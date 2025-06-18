import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { validateAdminLogin, loginUser, registerUser } from "../../utils/auth";

const LoginModal = ({ isOpen, onClose, onAdminLogin, onUserLogin }) => {
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setLoading(false);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from(
    { length: 101 },
    (_, i) => new Date().getFullYear() - i
  );

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = form.elements.namedItem("admin-email").value;
    const password = form.elements.namedItem("admin-password").value;

    try {
      console.log("Attempting admin login with:", { email, password }); // Debug log
      const result = await validateAdminLogin(email, password);
      console.log("Login result:", result); // Debug log

      if (result.success) {
        alert("Admin login successful!");
        onAdminLogin?.(email, password);
        onClose();
      } else {
        setError(result.message || "Invalid admin credentials");
      }
    } catch (error) {
      console.error("Login error:", error); // Debug log
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = form.elements.namedItem("signin-email").value;
    const password = form.elements.namedItem("signin-password").value;

    try {
      console.log("Attempting user login with:", { email }); // Debug log
      const result = await loginUser(email, password);
      console.log("Login result:", result); // Debug log

      if (result.success) {
        // Verify token was stored
        const storedToken = localStorage.getItem("userToken");
        console.log("Stored token after login:", storedToken); // Debug log

        if (!storedToken || storedToken === "undefined") {
          throw new Error("Authentication token not received");
        }

        onUserLogin?.();
        onClose();
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const userData = {
      email: formData.get("signup-email"),
      password: formData.get("signup-password"),
      firstName: formData.get("first-name"),
      lastName: formData.get("last-name"),
      birthday: {
        month: formData.get("birth-month"),
        day: formData.get("birth-day"),
        year: formData.get("birth-year"),
      },
    };

    try {
      const result = await registerUser(userData);

      if (result.success) {
        alert("Account created successfully! You can now sign in.");
        setActiveTab("signin");
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          onClick={onClose}
          disabled={loading}
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl text-white font-bold text-center mb-2">
          Welcome
        </h2>
        <p className="text-white text-opacity-75 text-center mb-6">
          Access your account or join the community
        </p>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex bg-white bg-opacity-20 rounded-lg overflow-hidden mb-6">
          {["signin", "signup", "admin"].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-gradient-to-r from-red-500 to-yellow-400 text-white"
                  : "text-white text-opacity-70 hover:text-opacity-90"
              }`}
              onClick={() => setActiveTab(tab)}
              disabled={loading}
            >
              {tab === "signin"
                ? "Sign In"
                : tab === "signup"
                ? "Sign Up"
                : "Admin"}
            </button>
          ))}
        </div>

        {activeTab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="block text-white mb-1">
                Email
              </label>
              <input
                id="signin-email"
                name="signin-email"
                type="email"
                placeholder="Enter email"
                required
                disabled={loading}
                className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="signin-password"
                className="block text-white mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signin-password"
                  name="signin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  required
                  disabled={loading}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  className="absolute inset-y-0 right-3 flex items-center text-white hover:text-gray-300 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <a
              href="#"
              className="block text-red-400 hover:text-red-300 transition-colors mb-4"
            >
              Forgot Password?
            </a>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-yellow-400 hover:from-red-600 hover:to-yellow-500 text-white rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
            <p className="text-center text-white mt-4">
              Not a member?{" "}
              <button
                type="button"
                className="text-red-400 underline hover:text-red-300 transition-colors"
                onClick={() => setActiveTab("signup")}
                disabled={loading}
              >
                Join Now
              </button>
            </p>
          </form>
        )}

        {activeTab === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="signup-email" className="block text-white mb-1">
                Email
              </label>
              <input
                id="signup-email"
                name="signup-email"
                type="email"
                placeholder="Enter email"
                required
                disabled={loading}
                className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="signup-password"
                className="block text-white mb-1"
              >
                Create Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  required
                  disabled={loading}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  className="absolute inset-y-0 right-3 flex items-center text-white hover:text-gray-300 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="first-name" className="block text-white mb-1">
                  First Name
                </label>
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  placeholder="First Name"
                  required
                  disabled={loading}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="last-name" className="block text-white mb-1">
                  Last Name
                </label>
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  placeholder="Last Name"
                  required
                  disabled={loading}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-white mb-1">Birthday</label>
              <div className="flex space-x-2 mb-2">
                <select
                  name="birth-month"
                  disabled={loading}
                  className="flex-1 p-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
                >
                  <option value="" className="text-black">
                    Month
                  </option>
                  {months.map((m, index) => (
                    <option key={m} value={index + 1} className="text-black">
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  name="birth-day"
                  disabled={loading}
                  className="flex-1 p-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
                >
                  <option value="" className="text-black">
                    Day
                  </option>
                  {days.map((d) => (
                    <option key={d} value={d} className="text-black">
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  name="birth-year"
                  disabled={loading}
                  className="flex-1 p-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
                >
                  <option value="" className="text-black">
                    Year
                  </option>
                  {years.map((y) => (
                    <option key={y} value={y} className="text-black">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-yellow-400 hover:from-red-600 hover:to-yellow-500 text-white rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Continue"}
            </button>
          </form>
        )}

        {activeTab === "admin" && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-white mb-1">
                Admin Username
              </label>
              <input
                id="admin-email"
                name="admin-email"
                type="email"
                placeholder="admin@cinebook.com"
                required
                disabled={loading}
                className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-white mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="admin123"
                  required
                  disabled={loading}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  className="absolute inset-y-0 right-3 flex items-center text-white hover:text-gray-300 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging In..." : "Admin Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
