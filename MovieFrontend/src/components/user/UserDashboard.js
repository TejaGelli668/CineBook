// import React, { useState, useEffect } from "react";
// import {
//   User,
//   Mail,
//   Phone,
//   Calendar,
//   CreditCard,
//   Camera,
//   Edit3,
//   Save,
//   X,
//   ArrowLeft,
//   Star,
//   Clock,
//   MapPin,
//   Eye,
//   EyeOff,
//   Loader,
//   Home,
//   BookOpen,
// } from "lucide-react";

// // Import API functions
// import {
//   getUserProfile,
//   updateUserProfile,
//   changePassword,
//   uploadProfilePicture,
//   getPaymentMethods,
//   addPaymentMethod,
//   removePaymentMethod,
//   getBookingHistory,
// } from "../../utils/userAPI";

// const UserDashboard = ({ currentUser, onBackToMovies, onLogout }) => {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [isEditing, setIsEditing] = useState(false);
//   const [showPasswordFields, setShowPasswordFields] = useState(false);
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const [userProfile, setUserProfile] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     dateOfBirth: "",
//     profilePicture: null,
//     memberSince: "",
//     accountStatus: "Active Member",
//   });

//   const [passwordData, setPasswordData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [bookingHistory, setBookingHistory] = useState([]);

//   // Helper function to get full profile picture URL
//   const getProfilePictureUrl = (profilePicture) => {
//     if (!profilePicture) return null;
//     if (
//       profilePicture.startsWith("http://") ||
//       profilePicture.startsWith("https://")
//     ) {
//       return profilePicture;
//     }
//     return `http://localhost:8080${profilePicture}`;
//   };

//   // Load user data on component mount
//   useEffect(() => {
//     loadUserData();
//   }, []);

//   // Clear messages after 5 seconds
//   useEffect(() => {
//     if (error || success) {
//       const timer = setTimeout(() => {
//         setError("");
//         setSuccess("");
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [error, success]);

//   const loadUserData = async () => {
//     setLoading(true);
//     try {
//       const profileResult = await getUserProfile();
//       if (profileResult.success && profileResult.data) {
//         const userData = profileResult.data;
//         setUserProfile({
//           firstName: userData.firstName || "",
//           lastName: userData.lastName || "",
//           email: userData.email || "",
//           phone: userData.phoneNumber || "",
//           dateOfBirth: userData.dateOfBirth || "", // Keep as string
//           profilePicture: userData.profilePicture || null,
//           memberSince: userData.createdAt
//             ? new Date(userData.createdAt).toLocaleDateString()
//             : "",
//           accountStatus: userData.isActive ? "Active Member" : "Inactive",
//         });
//       }
//       const paymentResult = await getPaymentMethods();
//       if (paymentResult.success) {
//         setPaymentMethods(paymentResult.data);
//       }
//       const bookingResult = await getBookingHistory();
//       if (bookingResult.success) {
//         setBookingHistory(bookingResult.data);
//       }
//     } catch (error) {
//       console.error("Error loading user data:", error);
//       setError("Failed to load user data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;
//     setLoading(true);
//     try {
//       const result = await uploadProfilePicture(file);
//       if (result.success) {
//         const profilePictureUrl = result.data?.profilePictureUrl;
//         if (profilePictureUrl) {
//           setUserProfile((prev) => ({
//             ...prev,
//             profilePicture: profilePictureUrl,
//           }));
//           setSuccess("Profile picture updated successfully!");
//           setTimeout(loadUserData, 1000);
//         } else {
//           setError("No profile picture URL received from server");
//         }
//       } else {
//         setError(result.message);
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       setError("Failed to upload profile picture");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleProfileSave = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       console.log("Saving profile with dateOfBirth:", userProfile.dateOfBirth);

//       const result = await updateUserProfile({
//         firstName: userProfile.firstName,
//         lastName: userProfile.lastName,
//         email: userProfile.email,
//         phone: userProfile.phone,
//         dateOfBirth: userProfile.dateOfBirth, // Send as string directly
//       });

//       if (result.success) {
//         setIsEditing(false);
//         setSuccess("Profile updated successfully!");
//         if (result.data) {
//           setUserProfile((prev) => ({
//             ...prev,
//             firstName: result.data.firstName,
//             lastName: result.data.lastName,
//             email: result.data.email,
//             phone: result.data.phoneNumber,
//             dateOfBirth: result.data.dateOfBirth, // Keep as string
//           }));
//         }
//       } else {
//         setError(result.message);
//       }
//     } catch (error) {
//       setError("Failed to update profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePasswordChange = async () => {
//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       setError("New passwords don't match!");
//       return;
//     }
//     if (passwordData.newPassword.length < 6) {
//       setError("Password must be at least 6 characters long!");
//       return;
//     }
//     setLoading(true);
//     setError("");
//     try {
//       const result = await changePassword({
//         currentPassword: passwordData.currentPassword,
//         newPassword: passwordData.newPassword,
//       });
//       if (result.success) {
//         setPasswordData({
//           currentPassword: "",
//           newPassword: "",
//           confirmPassword: "",
//         });
//         setShowPasswordFields(false);
//         setSuccess("Password changed successfully!");
//       } else {
//         setError(result.message);
//       }
//     } catch (error) {
//       setError("Failed to change password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddPaymentMethod = () => {
//     alert("Add Payment Method form would open here.");
//   };

//   const handleRemovePaymentMethod = async (id) => {
//     if (!window.confirm("Remove this payment method?")) return;
//     setLoading(true);
//     try {
//       const result = await removePaymentMethod(id);
//       if (result.success) {
//         setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
//         setSuccess("Payment method removed successfully!");
//       } else {
//         setError(result.message);
//       }
//     } catch {
//       setError("Failed to remove payment method");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Dashboard Overview Tab
//   const renderOverview = () => (
//     <div className="space-y-6">
//       {/* Welcome Section */}
//       <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6">
//         <div className="flex items-center space-x-6">
//           <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
//             {userProfile.profilePicture ? (
//               <img
//                 src={getProfilePictureUrl(userProfile.profilePicture)}
//                 alt="Profile"
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.target.style.display = "none";
//                   e.target.nextSibling.style.display = "flex";
//                 }}
//               />
//             ) : null}
//             <span
//               className={`${
//                 userProfile.profilePicture ? "hidden" : "flex"
//               } items-center justify-center w-full h-full`}
//             >
//               {`${userProfile.firstName?.[0] || "U"}${
//                 userProfile.lastName?.[0] || "U"
//               }`}
//             </span>
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold text-white">
//               Welcome back, {userProfile.firstName || "User"}! 🎬
//             </h2>
//             <p className="text-white text-opacity-75">{userProfile.email}</p>
//             <span className="inline-block mt-2 px-3 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-sm">
//               {userProfile.accountStatus}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6 text-center">
//           <BookOpen size={32} className="text-blue-400 mx-auto mb-3" />
//           <h3 className="text-2xl font-bold text-white">
//             {bookingHistory.length}
//           </h3>
//           <p className="text-white text-opacity-75">Total Bookings</p>
//         </div>
//         <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6 text-center">
//           <CreditCard size={32} className="text-green-400 mx-auto mb-3" />
//           <h3 className="text-2xl font-bold text-white">
//             ₹
//             {bookingHistory.reduce(
//               (sum, booking) =>
//                 sum + (booking.totalAmount || booking.amount || 0),
//               0
//             )}
//           </h3>
//           <p className="text-white text-opacity-75">Total Spent</p>
//         </div>
//         <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6 text-center">
//           <Star size={32} className="text-yellow-400 mx-auto mb-3" />
//           <h3 className="text-2xl font-bold text-white">
//             {userProfile.memberSince
//               ? new Date(userProfile.memberSince).getFullYear()
//               : new Date().getFullYear()}
//           </h3>
//           <p className="text-white text-opacity-75">Member Since</p>
//         </div>
//       </div>

//       {/* Recent Bookings */}
//       <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-white">Recent Bookings</h3>
//           <button
//             onClick={() => setActiveTab("bookings")}
//             className="text-blue-400 hover:text-blue-300 text-sm"
//           >
//             View All
//           </button>
//         </div>
//         <div className="space-y-3">
//           {bookingHistory.slice(0, 3).map((booking) => (
//             <div
//               key={booking.id}
//               className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg"
//             >
//               <div>
//                 <h4 className="text-white font-semibold">
//                   {booking.movieTitle || booking.movie}
//                 </h4>
//                 <p className="text-white text-opacity-60 text-sm">
//                   {booking.bookingDate || booking.date} •{" "}
//                   {booking.showTime || booking.time}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <p className="text-white font-bold">
//                   ₹{booking.totalAmount || booking.amount}
//                 </p>
//                 <span className="text-green-400 text-sm capitalize">
//                   {booking.status}
//                 </span>
//               </div>
//             </div>
//           ))}
//           {bookingHistory.length === 0 && (
//             <div className="text-center py-8 text-white text-opacity-60">
//               No bookings yet. Start by booking a movie!
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const renderBookings = () => (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h3 className="text-2xl font-bold text-white">Booking History</h3>
//         <div className="flex space-x-4">
//           <div className="text-center">
//             <p className="text-2xl font-bold text-white">
//               {bookingHistory.length}
//             </p>
//             <p className="text-white text-opacity-60 text-sm">Total Bookings</p>
//           </div>
//           <div className="text-center">
//             <p className="text-2xl font-bold text-white">
//               ₹
//               {bookingHistory.reduce(
//                 (sum, booking) =>
//                   sum + (booking.totalAmount || booking.amount || 0),
//                 0
//               )}
//             </p>
//             <p className="text-white text-opacity-60 text-sm">Total Spent</p>
//           </div>
//         </div>
//       </div>
//       <div className="space-y-4">
//         {bookingHistory.map((booking) => (
//           <div
//             key={booking.id}
//             className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6"
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex-1">
//                 <h4 className="text-lg font-semibold text-white">
//                   {booking.movieTitle || booking.movie}
//                 </h4>
//                 <div className="flex items-center space-x-4 mt-2 text-white text-opacity-75">
//                   <div className="flex items-center space-x-1">
//                     <MapPin size={16} />
//                     <span>{booking.theaterName || booking.theater}</span>
//                   </div>
//                   <div className="flex items-center space-x-1">
//                     <Calendar size={16} />
//                     <span>{booking.bookingDate || booking.date}</span>
//                   </div>
//                   <div className="flex items-center space-x-1">
//                     <Clock size={16} />
//                     <span>{booking.showTime || booking.time}</span>
//                   </div>
//                 </div>
//                 <p className="text-white text-opacity-60 mt-1">
//                   Seats: {booking.seatNumbers || booking.seats}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <p className="text-2xl font-bold text-white">
//                   ₹{booking.totalAmount || booking.amount}
//                 </p>
//                 <span className="inline-block px-3 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-sm capitalize">
//                   {booking.status}
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//       {bookingHistory.length === 0 && (
//         <div className="text-center py-8">
//           <Calendar
//             size={48}
//             className="text-white text-opacity-30 mx-auto mb-4"
//           />
//           <p className="text-white text-opacity-60">No bookings found</p>
//         </div>
//       )}
//     </div>
//   );

//   const renderProfile = () => (
//     <div className="space-y-6">
//       {/* Profile Header */}
//       <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6">
//         <div className="flex items-center space-x-6">
//           <div className="relative">
//             <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
//               {userProfile.profilePicture ? (
//                 <>
//                   <img
//                     src={getProfilePictureUrl(userProfile.profilePicture)}
//                     alt="Profile"
//                     className="w-full h-full object-cover"
//                     onError={(e) => (e.target.style.display = "none")}
//                   />
//                   <span
//                     className="absolute inset-0 flex items-center justify-center"
//                     style={{ display: "none" }}
//                   >
//                     {`${userProfile.firstName?.[0] || "U"}${
//                       userProfile.lastName?.[0] || "U"
//                     }`}
//                   </span>
//                 </>
//               ) : (
//                 `${userProfile.firstName?.[0] || "U"}${
//                   userProfile.lastName?.[0] || "U"
//                 }`
//               )}
//             </div>
//             {isEditing && (
//               <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600">
//                 <Camera size={16} className="text-white" />
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   className="hidden"
//                   disabled={loading}
//                 />
//               </label>
//             )}
//           </div>
//           <div className="flex-1">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-2xl font-bold text-white">
//                   {userProfile.firstName} {userProfile.lastName}
//                 </h2>
//                 <p className="text-white text-opacity-75">
//                   {userProfile.email}
//                 </p>
//                 <span className="inline-block mt-2 px-3 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-sm">
//                   {userProfile.accountStatus}
//                 </span>
//               </div>
//               <button
//                 onClick={() => setIsEditing((e) => !e)}
//                 disabled={loading}
//                 className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 flex items-center space-x-2 disabled:opacity-50"
//               >
//                 {loading ? (
//                   <Loader size={16} className="animate-spin" />
//                 ) : isEditing ? (
//                   <X size={16} />
//                 ) : (
//                   <Edit3 size={16} />
//                 )}
//                 <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Profile Form */}
//       <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6">
//         <h3 className="text-xl font-bold text-white mb-4">
//           Personal Information
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* First Name */}
//           <div>
//             <label className="block text-white text-opacity-75 mb-2">
//               First Name
//             </label>
//             <input
//               type="text"
//               value={userProfile.firstName}
//               onChange={(e) =>
//                 setUserProfile((p) => ({ ...p, firstName: e.target.value }))
//               }
//               disabled={!isEditing || loading}
//               className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//             />
//           </div>
//           {/* Last Name */}
//           <div>
//             <label className="block text-white text-opacity-75 mb-2">
//               Last Name
//             </label>
//             <input
//               type="text"
//               value={userProfile.lastName}
//               onChange={(e) =>
//                 setUserProfile((p) => ({ ...p, lastName: e.target.value }))
//               }
//               disabled={!isEditing || loading}
//               className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//             />
//           </div>
//           {/* Email */}
//           <div>
//             <label className="block text-white text-opacity-75 mb-2">
//               Email
//             </label>
//             <input
//               type="email"
//               value={userProfile.email}
//               onChange={(e) =>
//                 setUserProfile((p) => ({ ...p, email: e.target.value }))
//               }
//               disabled={!isEditing || loading}
//               className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//             />
//           </div>
//           {/* Phone */}
//           <div>
//             <label className="block text-white text-opacity-75 mb-2">
//               Phone Number
//             </label>
//             <input
//               type="tel"
//               value={userProfile.phone}
//               onChange={(e) =>
//                 setUserProfile((p) => ({ ...p, phone: e.target.value }))
//               }
//               disabled={!isEditing || loading}
//               placeholder="Enter phone number"
//               className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//             />
//           </div>
//           {/* Date of Birth - FIXED */}
//           <div>
//             <label className="block text-white text-opacity-75 mb-2">
//               Date of Birth
//             </label>
//             <input
//               type="date"
//               value={userProfile.dateOfBirth || ""}
//               onChange={(e) => {
//                 console.log("Date input changed to:", e.target.value);
//                 setUserProfile((p) => ({ ...p, dateOfBirth: e.target.value }));
//               }}
//               disabled={!isEditing || loading}
//               className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//             />
//           </div>
//           {/* Member Since */}
//           <div>
//             <label className="block text-white text-opacity-75 mb-2">
//               Member Since
//             </label>
//             <input
//               type="text"
//               value={userProfile.memberSince}
//               disabled
//               className="w-full p-3 rounded-lg bg-white bg-opacity-10 text-white text-opacity-50 border border-white border-opacity-20"
//             />
//           </div>
//         </div>

//         {isEditing && (
//           <div className="mt-6 flex space-x-4">
//             <button
//               onClick={handleProfileSave}
//               disabled={loading}
//               className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 flex items-center space-x-2 disabled:opacity-50"
//             >
//               {loading ? (
//                 <Loader size={16} className="animate-spin" />
//               ) : (
//                 <Save size={16} />
//               )}
//               <span>{loading ? "Saving..." : "Save Changes"}</span>
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Security / Password */}
//       <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6 mt-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-white">Security</h3>
//           <button
//             onClick={() => setShowPasswordFields((s) => !s)}
//             disabled={loading}
//             className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 disabled:opacity-50"
//           >
//             Change Password
//           </button>
//         </div>
//         {showPasswordFields && (
//           <div className="space-y-4">
//             {/* Current Password */}
//             <div>
//               <label className="block text-white text-opacity-75 mb-2">
//                 Current Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showCurrentPassword ? "text" : "password"}
//                   value={passwordData.currentPassword}
//                   onChange={(e) =>
//                     setPasswordData((p) => ({
//                       ...p,
//                       currentPassword: e.target.value,
//                     }))
//                   }
//                   placeholder="Enter current password"
//                   disabled={loading}
//                   className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none disabled:opacity-50"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowCurrentPassword((s) => !s)}
//                   disabled={loading}
//                   className="absolute inset-y-0 right-3 flex items-center text-white disabled:opacity-50"
//                 >
//                   {showCurrentPassword ? (
//                     <EyeOff size={20} />
//                   ) : (
//                     <Eye size={20} />
//                   )}
//                 </button>
//               </div>
//             </div>
//             {/* New Password */}
//             <div>
//               <label className="block text-white text-opacity-75 mb-2">
//                 New Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showNewPassword ? "text" : "password"}
//                   value={passwordData.newPassword}
//                   onChange={(e) =>
//                     setPasswordData((p) => ({
//                       ...p,
//                       newPassword: e.target.value,
//                     }))
//                   }
//                   placeholder="Enter new password"
//                   disabled={loading}
//                   className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none disabled:opacity-50"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowNewPassword((s) => !s)}
//                   disabled={loading}
//                   className="absolute inset-y-0 right-3 flex items-center text-white disabled:opacity-50"
//                 >
//                   {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//             </div>
//             {/* Confirm Password */}
//             <div>
//               <label className="block text-white text-opacity-75 mb-2">
//                 Confirm New Password
//               </label>
//               <input
//                 type="password"
//                 value={passwordData.confirmPassword}
//                 onChange={(e) =>
//                   setPasswordData((p) => ({
//                     ...p,
//                     confirmPassword: e.target.value,
//                   }))
//                 }
//                 placeholder="Confirm new password"
//                 disabled={loading}
//                 className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none disabled:opacity-50"
//               />
//             </div>
//             <button
//               onClick={handlePasswordChange}
//               disabled={loading}
//               className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 flex items-center space-x-2 disabled:opacity-50"
//             >
//               {loading && <Loader size={16} className="animate-spin" />}
//               <span>{loading ? "Updating..." : "Update Password"}</span>
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   const renderPayments = () => (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h3 className="text-2xl font-bold text-white">Payment Methods</h3>
//         <button
//           onClick={handleAddPaymentMethod}
//           disabled={loading}
//           className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50"
//         >
//           Add New Card
//         </button>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {paymentMethods.map((method) => (
//           <div
//             key={method.id}
//             className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <CreditCard size={24} className="text-blue-400" />
//                 <div>
//                   <p className="text-white font-semibold">
//                     {method.cardNumber || method.maskedCardNumber}
//                   </p>
//                   <p className="text-white text-opacity-60 text-sm">
//                     Expires {method.expiryDate}
//                   </p>
//                 </div>
//               </div>
//               {method.isDefault && (
//                 <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-xs">
//                   Default
//                 </span>
//               )}
//             </div>
//             <p className="text-white text-opacity-75 mb-4">
//               Card Holder: {method.cardHolder}
//             </p>
//             <div className="flex space-x-2">
//               <button className="flex-1 px-3 py-2 bg-blue-500 bg-opacity-20 text-blue-300 rounded-lg hover:bg-opacity-30 transition-colors">
//                 Edit
//               </button>
//               <button
//                 onClick={() => handleRemovePaymentMethod(method.id)}
//                 disabled={loading}
//                 className="flex-1 px-3 py-2 bg-red-500 bg-opacity-20 text-red-300 rounded-lg hover:bg-opacity-30 disabled:opacity-50 transition-colors"
//               >
//                 Remove
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//       {paymentMethods.length === 0 && (
//         <div className="text-center py-8">
//           <CreditCard
//             size={48}
//             className="text-white text-opacity-30 mx-auto mb-4"
//           />
//           <p className="text-white text-opacity-60">
//             No payment methods added yet
//           </p>
//         </div>
//       )}
//     </div>
//   );

//   const renderContent = () => {
//     switch (activeTab) {
//       case "overview":
//         return renderOverview();
//       case "bookings":
//         return renderBookings();
//       case "profile":
//         return renderProfile();
//       case "payments":
//         return renderPayments();
//       default:
//         return renderOverview();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
//       {/* Header */}
//       <header className="relative z-10 bg-black bg-opacity-20 backdrop-blur-lg border-b border-white border-opacity-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={onBackToMovies}
//                 className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg hover:bg-opacity-20 transition"
//               >
//                 <ArrowLeft size={16} />
//                 <span>Back to Movies</span>
//               </button>
//               <h1 className="text-2xl font-bold text-white">User Dashboard</h1>
//             </div>
//             <button
//               onClick={onLogout}
//               className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Error/Success Messages */}
//       {(error || success) && (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
//           {error && (
//             <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 text-red-200 px-4 py-3 rounded-lg mb-4">
//               {error}
//             </div>
//           )}
//           {success && (
//             <div className="bg-green-500 bg-opacity-20 border border-green-500 border-opacity-50 text-green-200 px-4 py-3 rounded-lg mb-4">
//               {success}
//             </div>
//           )}
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Sidebar Navigation */}
//           <div className="lg:w-64">
//             <nav className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-4">
//               <ul className="space-y-2">
//                 <li>
//                   <button
//                     onClick={() => setActiveTab("overview")}
//                     className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition ${
//                       activeTab === "overview"
//                         ? "bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30"
//                         : "text-white text-opacity-75 hover:bg-white hover:bg-opacity-10"
//                     }`}
//                   >
//                     <Home size={20} />
//                     <span>Overview</span>
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => setActiveTab("bookings")}
//                     className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition ${
//                       activeTab === "bookings"
//                         ? "bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30"
//                         : "text-white text-opacity-75 hover:bg-white hover:bg-opacity-10"
//                     }`}
//                   >
//                     <BookOpen size={20} />
//                     <span>My Bookings</span>
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => setActiveTab("profile")}
//                     className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition ${
//                       activeTab === "profile"
//                         ? "bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30"
//                         : "text-white text-opacity-75 hover:bg-white hover:bg-opacity-10"
//                     }`}
//                   >
//                     <User size={20} />
//                     <span>Profile</span>
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     onClick={() => setActiveTab("payments")}
//                     className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition ${
//                       activeTab === "payments"
//                         ? "bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30"
//                         : "text-white text-opacity-75 hover:bg-white hover:bg-opacity-10"
//                     }`}
//                   >
//                     <CreditCard size={20} />
//                     <span>Payment Methods</span>
//                   </button>
//                 </li>
//               </ul>
//             </nav>
//           </div>

//           {/* Main Content */}
//           <div className="flex-1">
//             {loading && activeTab === "overview" ? (
//               <div className="flex items-center justify-center py-12">
//                 <Loader size={32} className="animate-spin text-white" />
//               </div>
//             ) : (
//               renderContent()
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserDashboard;
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Camera,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Eye,
  EyeOff,
  Loader,
  Home,
  BookOpen,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// Import API functions
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadProfilePicture,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  getBookingHistory,
  getBookingDetails,
  cancelBooking,
} from "../../utils/userAPI";

const UserDashboard = ({ currentUser, onBackToMovies, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    profilePicture: null,
    memberSince: "",
    accountStatus: "Active Member",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);

  // Helper function to get full profile picture URL
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (
      profilePicture.startsWith("http://") ||
      profilePicture.startsWith("https://")
    ) {
      return profilePicture;
    }
    return `http://localhost:8080${profilePicture}`;
  };

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user profile
      const profileResult = await getUserProfile();
      if (profileResult.success && profileResult.data) {
        const userData = profileResult.data;
        setUserProfile({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phoneNumber || "",
          dateOfBirth: userData.dateOfBirth || "",
          profilePicture: userData.profilePicture || null,
          memberSince: userData.createdAt
            ? new Date(userData.createdAt).toLocaleDateString()
            : "",
          accountStatus: userData.isActive ? "Active Member" : "Inactive",
        });
      }

      // Load payment methods
      const paymentResult = await getPaymentMethods();
      if (paymentResult.success) {
        setPaymentMethods(paymentResult.data || []);
      }

      // Load booking history
      await loadBookingHistory();
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const loadBookingHistory = async () => {
    setBookingsLoading(true);
    try {
      const bookingResult = await getBookingHistory();
      if (bookingResult.success) {
        setBookingHistory(bookingResult.data || []);
      } else {
        console.error("Failed to load bookings:", bookingResult.message);
        setBookingHistory([]);
      }
    } catch (error) {
      console.error("Error loading booking history:", error);
      setBookingHistory([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        setSuccess("Booking cancelled successfully!");
        await loadBookingHistory(); // Reload bookings
      } else {
        setError(result.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setError("Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const result = await uploadProfilePicture(file);
      if (result.success) {
        const profilePictureUrl = result.data?.profilePictureUrl;
        if (profilePictureUrl) {
          setUserProfile((prev) => ({
            ...prev,
            profilePicture: profilePictureUrl,
          }));
          setSuccess("Profile picture updated successfully!");
          setTimeout(loadUserData, 1000);
        } else {
          setError("No profile picture URL received from server");
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload profile picture");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await updateUserProfile({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        dateOfBirth: userProfile.dateOfBirth,
      });

      if (result.success) {
        setIsEditing(false);
        setSuccess("Profile updated successfully!");
        if (result.data) {
          setUserProfile((prev) => ({
            ...prev,
            firstName: result.data.firstName,
            lastName: result.data.lastName,
            email: result.data.email,
            phone: result.data.phoneNumber,
            dateOfBirth: result.data.dateOfBirth,
          }));
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (result.success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordFields(false);
        setSuccess("Password changed successfully!");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    alert("Add Payment Method form would open here.");
  };

  const handleRemovePaymentMethod = async (id) => {
    if (!window.confirm("Remove this payment method?")) return;
    setLoading(true);
    try {
      const result = await removePaymentMethod(id);
      if (result.success) {
        setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
        setSuccess("Payment method removed successfully!");
      } else {
        setError(result.message);
      }
    } catch {
      setError("Failed to remove payment method");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Dashboard Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
            {userProfile.profilePicture ? (
              <img
                src={getProfilePictureUrl(userProfile.profilePicture)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <span
              className={`${
                userProfile.profilePicture ? "hidden" : "flex"
              } items-center justify-center w-full h-full`}
            >
              {`${userProfile.firstName?.[0] || "U"}${
                userProfile.lastName?.[0] || "U"
              }`}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Welcome back, {userProfile.firstName || "User"}! 🎬
            </h2>
            <p className="text-white text-opacity-75">{userProfile.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-sm">
              {userProfile.accountStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6 text-center">
          <BookOpen size={32} className="text-blue-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white">
            {bookingHistory.length}
          </h3>
          <p className="text-white text-opacity-75">Total Bookings</p>
        </div>
        <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6 text-center">
          <CreditCard size={32} className="text-green-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white">
            {formatCurrency(
              bookingHistory.reduce(
                (sum, booking) => sum + (booking.totalAmount || 0),
                0
              )
            )}
          </h3>
          <p className="text-white text-opacity-75">Total Spent</p>
        </div>
        <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6 text-center">
          <Star size={32} className="text-yellow-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white">
            {userProfile.memberSince
              ? new Date(userProfile.memberSince).getFullYear()
              : new Date().getFullYear()}
          </h3>
          <p className="text-white text-opacity-75">Member Since</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Recent Bookings</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadBookingHistory}
              disabled={bookingsLoading}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
            >
              <RefreshCw
                size={16}
                className={bookingsLoading ? "animate-spin" : ""}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View All
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {bookingsLoading ? (
            <div className="text-center py-8">
              <Loader size={32} className="animate-spin text-white mx-auto" />
              <p className="text-white text-opacity-60 mt-2">
                Loading bookings...
              </p>
            </div>
          ) : bookingHistory.slice(0, 3).length > 0 ? (
            bookingHistory.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg"
              >
                <div>
                  <h4 className="text-white font-semibold">
                    {booking.movieTitle}
                  </h4>
                  <p className="text-white text-opacity-60 text-sm">
                    {booking.bookingDate} • {booking.showTime}
                  </p>
                  <p className="text-white text-opacity-50 text-xs">
                    {booking.theaterName} • Seats: {booking.seatNumbers}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    {formatCurrency(booking.totalAmount)}
                  </p>
                  <span
                    className={`text-sm capitalize px-2 py-1 rounded-full ${
                      booking.status === "confirmed"
                        ? "text-green-400 bg-green-500 bg-opacity-20"
                        : booking.status === "cancelled"
                        ? "text-red-400 bg-red-500 bg-opacity-20"
                        : "text-yellow-400 bg-yellow-500 bg-opacity-20"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white text-opacity-60">
              <BookOpen
                size={48}
                className="mx-auto mb-4 text-white text-opacity-30"
              />
              <p>No bookings yet. Start by booking a movie!</p>
              <button
                onClick={onBackToMovies}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700"
              >
                Browse Movies
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Booking History</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadBookingHistory}
            disabled={bookingsLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 bg-opacity-20 text-blue-300 rounded-lg hover:bg-opacity-30 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={bookingsLoading ? "animate-spin" : ""}
            />
            <span>Refresh</span>
          </button>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {bookingHistory.length}
            </p>
            <p className="text-white text-opacity-60 text-sm">Total Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {formatCurrency(
                bookingHistory.reduce(
                  (sum, booking) => sum + (booking.totalAmount || 0),
                  0
                )
              )}
            </p>
            <p className="text-white text-opacity-60 text-sm">Total Spent</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {bookingsLoading ? (
          <div className="text-center py-12">
            <Loader size={48} className="animate-spin text-white mx-auto" />
            <p className="text-white text-opacity-60 mt-4">
              Loading your bookings...
            </p>
          </div>
        ) : bookingHistory.length > 0 ? (
          bookingHistory.map((booking) => (
            <div
              key={booking.id}
              className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">
                    {booking.movieTitle}
                  </h4>
                  <div className="flex items-center space-x-4 mt-2 text-white text-opacity-75">
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span>{booking.theaterName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>{booking.bookingDate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{booking.showTime}</span>
                    </div>
                  </div>
                  <p className="text-white text-opacity-60 mt-1">
                    Seats: {booking.seatNumbers}
                  </p>
                  {booking.theaterLocation && (
                    <p className="text-white text-opacity-50 text-sm">
                      Location: {booking.theaterLocation}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(booking.totalAmount)}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm capitalize mb-2 ${
                      booking.status === "confirmed"
                        ? "text-green-300 bg-green-500 bg-opacity-20"
                        : booking.status === "cancelled"
                        ? "text-red-300 bg-red-500 bg-opacity-20"
                        : "text-yellow-300 bg-yellow-500 bg-opacity-20"
                    }`}
                  >
                    {booking.status}
                  </span>
                  {booking.status === "confirmed" && (
                    <div className="mt-2">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-500 bg-opacity-20 text-red-300 rounded text-sm hover:bg-opacity-30 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Calendar
              size={64}
              className="text-white text-opacity-30 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-white mb-2">
              No bookings found
            </h3>
            <p className="text-white text-opacity-60 mb-6">
              You haven't made any movie bookings yet. Start exploring movies!
            </p>
            <button
              onClick={onBackToMovies}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700"
            >
              Browse Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Keep existing renderProfile and renderPayments functions unchanged
  const renderProfile = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {userProfile.profilePicture ? (
                <>
                  <img
                    src={getProfilePictureUrl(userProfile.profilePicture)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <span
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ display: "none" }}
                  >
                    {`${userProfile.firstName?.[0] || "U"}${
                      userProfile.lastName?.[0] || "U"
                    }`}
                  </span>
                </>
              ) : (
                `${userProfile.firstName?.[0] || "U"}${
                  userProfile.lastName?.[0] || "U"
                }`
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600">
                <Camera size={16} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {userProfile.firstName} {userProfile.lastName}
                </h2>
                <p className="text-white text-opacity-75">
                  {userProfile.email}
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-sm">
                  {userProfile.accountStatus}
                </span>
              </div>
              <button
                onClick={() => setIsEditing((e) => !e)}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader size={16} className="animate-spin" />
                ) : isEditing ? (
                  <X size={16} />
                ) : (
                  <Edit3 size={16} />
                )}
                <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-white text-opacity-75 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={userProfile.firstName}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, firstName: e.target.value }))
              }
              disabled={!isEditing || loading}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
            />
          </div>
          {/* Last Name */}
          <div>
            <label className="block text-white text-opacity-75 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={userProfile.lastName}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, lastName: e.target.value }))
              }
              disabled={!isEditing || loading}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-white text-opacity-75 mb-2">
              Email
            </label>
            <input
              type="email"
              value={userProfile.email}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, email: e.target.value }))
              }
              disabled={!isEditing || loading}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
            />
          </div>
          {/* Phone */}
          <div>
            <label className="block text-white text-opacity-75 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={userProfile.phone}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, phone: e.target.value }))
              }
              disabled={!isEditing || loading}
              placeholder="Enter phone number"
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
            />
          </div>
          {/* Date of Birth */}
          <div>
            <label className="block text-white text-opacity-75 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={userProfile.dateOfBirth || ""}
              onChange={(e) => {
                setUserProfile((p) => ({ ...p, dateOfBirth: e.target.value }));
              }}
              disabled={!isEditing || loading}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
            />
          </div>
          {/* Member Since */}
          <div>
            <label className="block text-white text-opacity-75 mb-2">
              Member Since
            </label>
            <input
              type="text"
              value={userProfile.memberSince}
              disabled
              className="w-full p-3 rounded-lg bg-white bg-opacity-10 text-white text-opacity-50 border border-white border-opacity-20"
            />
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleProfileSave}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Security / Password */}
      <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Security</h3>
          <button
            onClick={() => setShowPasswordFields((s) => !s)}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 disabled:opacity-50"
          >
            Change Password
          </button>
        </div>
        {showPasswordFields && (
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-white text-opacity-75 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((p) => ({
                      ...p,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter current password"
                  disabled={loading}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((s) => !s)}
                  disabled={loading}
                  className="absolute inset-y-0 right-3 flex items-center text-white disabled:opacity-50"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
            {/* New Password */}
            <div>
              <label className="block text-white text-opacity-75 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((p) => ({
                      ...p,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                  disabled={loading}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((s) => !s)}
                  disabled={loading}
                  className="absolute inset-y-0 right-3 flex items-center text-white disabled:opacity-50"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {/* Confirm Password */}
            <div>
              <label className="block text-white text-opacity-75 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({
                    ...p,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirm new password"
                disabled={loading}
                className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none disabled:opacity-50"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              <span>{loading ? "Updating..." : "Update Password"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Payment Methods</h3>
        <button
          onClick={handleAddPaymentMethod}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50"
        >
          Add New Card
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <CreditCard size={24} className="text-blue-400" />
                <div>
                  <p className="text-white font-semibold">
                    {method.cardNumber || method.maskedCardNumber}
                  </p>
                  <p className="text-white text-opacity-60 text-sm">
                    Expires {method.expiryDate}
                  </p>
                </div>
              </div>
              {method.isDefault && (
                <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-xs">
                  Default
                </span>
              )}
            </div>
            <p className="text-white text-opacity-75 mb-4">
              Card Holder: {method.cardHolder}
            </p>
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-500 bg-opacity-20 text-blue-300 rounded-lg hover:bg-opacity-30 transition-colors">
                Edit
              </button>
              <button
                onClick={() => handleRemovePaymentMethod(method.id)}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-red-500 bg-opacity-20 text-red-300 rounded-lg hover:bg-opacity-30 disabled:opacity-50 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {paymentMethods.length === 0 && (
        <div className="text-center py-8">
          <CreditCard
            size={48}
            className="text-white text-opacity-30 mx-auto mb-4"
          />
          <p className="text-white text-opacity-60">
            No payment methods added yet
          </p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "bookings":
        return renderBookings();
      case "profile":
        return renderProfile();
      case "payments":
        return renderPayments();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="relative z-10 bg-black bg-opacity-20 backdrop-blur-lg border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToMovies}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg hover:bg-opacity-20 transition"
              >
                <ArrowLeft size={16} />
                <span>Back to Movies</span>
              </button>
              <h1 className="text-2xl font-bold text-white">User Dashboard</h1>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Error/Success Messages */}
      {(error || success) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-500 bg-opacity-20 border border-green-500 border-opacity-50 text-green-200 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition ${
                      activeTab === "overview"
                        ? "bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30"
                        : "text-white text-opacity-75 hover:bg-white hover:bg-opacity-10"
                    }`}
                  >
                    <Home size={20} />
                    <span>Overview</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition ${
                      activeTab === "bookings"
                        ? "bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30"
                        : "text-white text-opacity-75 hover:bg-white hover:bg-opacity-10"
                    }`}
                  >
                    <BookOpen size={20} />
                    <span>My Bookings</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition ${
                      activeTab === "profile"
                        ? "bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30"
                        : "text-white text-opacity-75 hover:bg-white hover:bg-opacity-10"
                    }`}
                  >
                    <User size={20} />
                    <span>Profile</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("payments")}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition ${
                      activeTab === "payments"
                        ? "bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30"
                        : "text-white text-opacity-75 hover:bg-white hover:bg-opacity-10"
                    }`}
                  >
                    <CreditCard size={20} />
                    <span>Payment Methods</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading && activeTab === "overview" ? (
              <div className="flex items-center justify-center py-12">
                <Loader size={32} className="animate-spin text-white" />
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
