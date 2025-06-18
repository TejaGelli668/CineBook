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

// const UserDashboard = ({ currentUser, onBackToHome, onLogout }) => {
//   const [activeTab, setActiveTab] = useState("profile");
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

//     // If it's already a full URL, return as is
//     if (
//       profilePicture.startsWith("http://") ||
//       profilePicture.startsWith("https://")
//     ) {
//       return profilePicture;
//     }

//     // If it's a relative path, prepend the API base URL
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
//       // Load profile data
//       const profileResult = await getUserProfile();
//       console.log("Profile result:", profileResult); // Debug log

//       if (profileResult.success && profileResult.data) {
//         const userData = profileResult.data;
//         console.log("User data:", userData); // Debug log
//         console.log("Profile picture value:", userData.profilePicture); // Debug log

//         setUserProfile({
//           firstName: userData.firstName || "",
//           lastName: userData.lastName || "",
//           email: userData.email || "",
//           phone: userData.phoneNumber || "",
//           dateOfBirth: userData.dateOfBirth || "",
//           profilePicture: userData.profilePicture || null,
//           memberSince: userData.createdAt
//             ? new Date(userData.createdAt).toLocaleDateString()
//             : "",
//           accountStatus: userData.isActive ? "Active Member" : "Inactive",
//         });
//       }

//       // Load payment methods
//       const paymentResult = await getPaymentMethods();
//       if (paymentResult.success) {
//         setPaymentMethods(paymentResult.data);
//       }

//       // Load booking history
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
//     console.log("Selected file:", file); // Debug log

//     if (file) {
//       setLoading(true);
//       try {
//         const result = await uploadProfilePicture(file);
//         console.log("Upload result:", result); // Debug log

//         if (result.success) {
//           // The backend returns profilePictureUrl, not profilePicture
//           const profilePictureUrl = result.data?.profilePictureUrl;
//           console.log("Profile picture URL from response:", profilePictureUrl); // Debug log

//           if (profilePictureUrl) {
//             setUserProfile((prev) => {
//               const updated = {
//                 ...prev,
//                 profilePicture: profilePictureUrl, // Set the URL to profilePicture
//               };
//               console.log("Updated profile state:", updated); // Debug log
//               return updated;
//             });
//             setSuccess("Profile picture updated successfully!");

//             // Reload user data after a short delay to ensure backend has updated
//             setTimeout(() => {
//               loadUserData();
//             }, 1000);
//           } else {
//             setError("No profile picture URL received from server");
//           }
//         } else {
//           setError(result.message);
//         }
//       } catch (error) {
//         console.error("Upload error:", error);
//         setError("Failed to upload profile picture");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const handleProfileSave = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const result = await updateUserProfile({
//         firstName: userProfile.firstName,
//         lastName: userProfile.lastName,
//         email: userProfile.email,
//         phone: userProfile.phone,
//         dateOfBirth: userProfile.dateOfBirth,
//       });

//       if (result.success) {
//         setIsEditing(false);
//         setSuccess("Profile updated successfully!");
//         // Update the profile data with the response
//         if (result.data) {
//           setUserProfile((prev) => ({
//             ...prev,
//             firstName: result.data.firstName,
//             lastName: result.data.lastName,
//             email: result.data.email,
//             phone: result.data.phoneNumber,
//             dateOfBirth: result.data.dateOfBirth,
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
//     setError("");
//     setSuccess("");
//     alert(
//       "Add Payment Method form would open here. This requires integration with a payment provider like Stripe or Razorpay."
//     );
//   };

//   const handleRemovePaymentMethod = async (id) => {
//     if (
//       window.confirm("Are you sure you want to remove this payment method?")
//     ) {
//       setLoading(true);
//       try {
//         const result = await removePaymentMethod(id);
//         if (result.success) {
//           setPaymentMethods(
//             paymentMethods.filter((method) => method.id !== id)
//           );
//           setSuccess("Payment method removed successfully!");
//         } else {
//           setError(result.message);
//         }
//       } catch (error) {
//         setError("Failed to remove payment method");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const renderProfile = () => (
//     <div className="space-y-6">
//       {/* Profile Header */}
//       <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6">
//         <div className="flex items-center space-x-6">
//           <div className="relative">
//             <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
//               {userProfile.profilePicture ? (
//                 <>
//                   {console.log(
//                     "Rendering image with src:",
//                     getProfilePictureUrl(userProfile.profilePicture)
//                   )}
//                   <img
//                     src={getProfilePictureUrl(userProfile.profilePicture)}
//                     alt="Profile"
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       console.error("Image failed to load:", e);
//                       console.log("Failed image src:", e.target.src);
//                       // Hide the broken image and show initials
//                       e.target.style.display = "none";
//                     }}
//                     onLoad={() => {
//                       console.log("Image loaded successfully");
//                     }}
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
//               <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
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
//                 onClick={() => setIsEditing(!isEditing)}
//                 disabled={loading}
//                 className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
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
//           <div>
//             <label className="block text-white text-opacity-75 mb-2">
//               First Name
//             </label>
//             <input
//               type="text"
//               value={userProfile.firstName}
//               onChange={(e) =>
//                 setUserProfile((prev) => ({
//                   ...prev,
//                   firstName: e.target.value,
//                 }))
//               }
//               disabled={!isEditing || loading}
//               className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//             />
//           </div>
//           <div>
//             <label className="block text-white text-opacity-75 mb-2">
//               Last Name
//             </label>
//             <input
//               type="text"
//               value={userProfile.lastName}
//               onChange={(e) =>
//                 setUserProfile((prev) => ({
//                   ...prev,
//                   lastName: e.target.value,
//                 }))
//               }
//               disabled={!isEditing || loading}
//               className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//             />
//           </div>
//           <div>
//             <label className="block text-white text-opacity-75 mb-2">
//               Email
//             </label>
//             <input
//               type="email"
//               value={userProfile.email}
//               onChange={(e) =>
//                 setUserProfile((prev) => ({ ...prev, email: e.target.value }))
//               }
//               disabled={!isEditing || loading}
//               className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//             />
//           </div>
//           <div>
//             <label className="block text-white text-opacity-75 mb-2">
//               Phone Number
//             </label>
//             <input
//               type="tel"
//               value={userProfile.phone}
//               onChange={(e) =>
//                 setUserProfile((prev) => ({ ...prev, phone: e.target.value }))
//               }
//               disabled={!isEditing || loading}
//               placeholder="Enter phone number"
//               className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//             />
//           </div>
//           <div>
//             <label className="block text-white text-opacity-75 mb-2">
//               Date of Birth
//             </label>
//             <input
//               type="date"
//               value={userProfile.dateOfBirth}
//               onChange={(e) =>
//                 setUserProfile((prev) => ({
//                   ...prev,
//                   dateOfBirth: e.target.value,
//                 }))
//               }
//               disabled={!isEditing || loading}
//               className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//             />
//           </div>
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
//               className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
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

//       {/* Password Change Section */}
//       <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-white">Security</h3>
//           <button
//             onClick={() => setShowPasswordFields(!showPasswordFields)}
//             disabled={loading}
//             className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50"
//           >
//             Change Password
//           </button>
//         </div>

//         {showPasswordFields && (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-white text-opacity-75 mb-2">
//                 Current Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showCurrentPassword ? "text" : "password"}
//                   value={passwordData.currentPassword}
//                   onChange={(e) =>
//                     setPasswordData((prev) => ({
//                       ...prev,
//                       currentPassword: e.target.value,
//                     }))
//                   }
//                   placeholder="Enter current password"
//                   disabled={loading}
//                   className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//                   disabled={loading}
//                   className="absolute inset-y-0 right-3 flex items-center text-white hover:text-gray-300 disabled:opacity-50"
//                 >
//                   {showCurrentPassword ? (
//                     <EyeOff size={20} />
//                   ) : (
//                     <Eye size={20} />
//                   )}
//                 </button>
//               </div>
//             </div>
//             <div>
//               <label className="block text-white text-opacity-75 mb-2">
//                 New Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showNewPassword ? "text" : "password"}
//                   value={passwordData.newPassword}
//                   onChange={(e) =>
//                     setPasswordData((prev) => ({
//                       ...prev,
//                       newPassword: e.target.value,
//                     }))
//                   }
//                   placeholder="Enter new password"
//                   disabled={loading}
//                   className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowNewPassword(!showNewPassword)}
//                   disabled={loading}
//                   className="absolute inset-y-0 right-3 flex items-center text-white hover:text-gray-300 disabled:opacity-50"
//                 >
//                   {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//             </div>
//             <div>
//               <label className="block text-white text-opacity-75 mb-2">
//                 Confirm New Password
//               </label>
//               <input
//                 type="password"
//                 value={passwordData.confirmPassword}
//                 onChange={(e) =>
//                   setPasswordData((prev) => ({
//                     ...prev,
//                     confirmPassword: e.target.value,
//                   }))
//                 }
//                 placeholder="Confirm new password"
//                 disabled={loading}
//                 className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 focus:outline-none focus:border-opacity-50 disabled:opacity-50"
//               />
//             </div>
//             <button
//               onClick={handlePasswordChange}
//               disabled={loading}
//               className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
//             >
//               {loading ? <Loader size={16} className="animate-spin" /> : null}
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
//           className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
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
//                 <CreditCard className="text-blue-400" size={24} />
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
//                 className="flex-1 px-3 py-2 bg-red-500 bg-opacity-20 text-red-300 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
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

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
//       {/* Header */}
//       <div className="max-w-6xl mx-auto mb-8">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={onBackToHome}
//               className="p-2 bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 text-white hover:bg-opacity-20 transition-colors"
//             >
//               <ArrowLeft size={20} />
//             </button>
//             <div>
//               <h1 className="text-3xl font-bold text-white">User Dashboard</h1>
//               <p className="text-white text-opacity-75">
//                 Manage your account and preferences
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onLogout}
//             className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto">
//         {/* Success/Error Messages */}
//         {(error || success) && (
//           <div className="mb-6">
//             {error && (
//               <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-4">
//                 {error}
//               </div>
//             )}
//             {success && (
//               <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-100 px-4 py-3 rounded-lg mb-4">
//                 {success}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Tab Navigation */}
//         <div className="flex bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-1 mb-8">
//           {[
//             { id: "profile", label: "Profile", icon: User },
//             { id: "payments", label: "Payment Methods", icon: CreditCard },
//             { id: "bookings", label: "Booking History", icon: Calendar },
//           ].map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               disabled={loading}
//               className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
//                 activeTab === tab.id
//                   ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
//                   : "text-white text-opacity-70 hover:text-opacity-90"
//               }`}
//             >
//               <tab.icon size={20} />
//               <span>{tab.label}</span>
//             </button>
//           ))}
//         </div>

//         {/* Tab Content */}
//         {activeTab === "profile" && renderProfile()}
//         {activeTab === "payments" && renderPayments()}
//         {activeTab === "bookings" && renderBookings()}
//       </div>
//     </div>
//   );
// };

// export default UserDashboard;
// src/components/user/UserDashboard.js

// src/components/user/UserDashboard.js
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
} from "../../utils/userAPI";

const UserDashboard = ({ currentUser, onBackToMovies, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
      const profileResult = await getUserProfile();
      if (profileResult.success && profileResult.data) {
        const userData = profileResult.data;
        setUserProfile({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phoneNumber || "",
          dateOfBirth: formatDateForInput(userData.dateOfBirth) || "",
          profilePicture: userData.profilePicture || null,
          memberSince: userData.createdAt
            ? new Date(userData.createdAt).toLocaleDateString()
            : "",
          accountStatus: userData.isActive ? "Active Member" : "Inactive",
        });
      }
      const paymentResult = await getPaymentMethods();
      if (paymentResult.success) {
        setPaymentMethods(paymentResult.data);
      }
      const bookingResult = await getBookingHistory();
      if (bookingResult.success) {
        setBookingHistory(bookingResult.data);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Failed to load user data");
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

  // Helper function to format date for local timezone
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Get local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to create date string that won't shift
  const createLocalDateString = (dateString) => {
    if (!dateString) return "";
    // Parse the date string and create a new date object in local timezone
    const [year, month, day] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const handleProfileSave = async () => {
    setLoading(true);
    setError("");
    try {
      // Ensure date is sent in the correct format
      const dateOfBirth = userProfile.dateOfBirth
        ? createLocalDateString(userProfile.dateOfBirth)
        : "";

      const result = await updateUserProfile({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        dateOfBirth: dateOfBirth,
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
            dateOfBirth: formatDateForInput(result.data.dateOfBirth),
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
            ₹
            {bookingHistory.reduce(
              (sum, booking) =>
                sum + (booking.totalAmount || booking.amount || 0),
              0
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
          <button
            onClick={() => setActiveTab("bookings")}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {bookingHistory.slice(0, 3).map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg"
            >
              <div>
                <h4 className="text-white font-semibold">
                  {booking.movieTitle || booking.movie}
                </h4>
                <p className="text-white text-opacity-60 text-sm">
                  {booking.bookingDate || booking.date} •{" "}
                  {booking.showTime || booking.time}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">
                  ₹{booking.totalAmount || booking.amount}
                </p>
                <span className="text-green-400 text-sm capitalize">
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
          {bookingHistory.length === 0 && (
            <div className="text-center py-8 text-white text-opacity-60">
              No bookings yet. Start by booking a movie!
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
        <div className="flex space-x-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {bookingHistory.length}
            </p>
            <p className="text-white text-opacity-60 text-sm">Total Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              ₹
              {bookingHistory.reduce(
                (sum, booking) =>
                  sum + (booking.totalAmount || booking.amount || 0),
                0
              )}
            </p>
            <p className="text-white text-opacity-60 text-sm">Total Spent</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {bookingHistory.map((booking) => (
          <div
            key={booking.id}
            className="bg-white bg-opacity-10 backdrop-blur-xl rounded-lg border border-white border-opacity-20 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white">
                  {booking.movieTitle || booking.movie}
                </h4>
                <div className="flex items-center space-x-4 mt-2 text-white text-opacity-75">
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    <span>{booking.theaterName || booking.theater}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>{booking.bookingDate || booking.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{booking.showTime || booking.time}</span>
                  </div>
                </div>
                <p className="text-white text-opacity-60 mt-1">
                  Seats: {booking.seatNumbers || booking.seats}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  ₹{booking.totalAmount || booking.amount}
                </p>
                <span className="inline-block px-3 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-sm capitalize">
                  {booking.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {bookingHistory.length === 0 && (
        <div className="text-center py-8">
          <Calendar
            size={48}
            className="text-white text-opacity-30 mx-auto mb-4"
          />
          <p className="text-white text-opacity-60">No bookings found</p>
        </div>
      )}
    </div>
  );

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
              value={userProfile.dateOfBirth}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, dateOfBirth: e.target.value }))
              }
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
            <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
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
