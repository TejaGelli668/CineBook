// import React, { useState, useEffect, useRef } from "react";
// import {
//   X,
//   Save,
//   Coffee,
//   Cookie,
//   IceCream,
//   Upload,
//   ImageIcon,
//   Trash2,
//   Building,
//   Loader,
// } from "lucide-react";

// const FoodItemForm = ({ foodItem, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     price: "",
//     category: "BEVERAGES",
//     size: "MEDIUM",
//     imageUrl: "",
//     isAvailable: true,
//     theaterId: 1,
//   });

//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [uploadMethod, setUploadMethod] = useState("upload");
//   const [theaters, setTheaters] = useState([
//     { id: 1, name: "Theater 1 - Main Hall" },
//     { id: 2, name: "Theater 2 - IMAX" },
//     { id: 3, name: "Theater 3 - Premium" },
//     { id: 4, name: "Theater 4 - Standard" },
//   ]);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     if (foodItem) {
//       setFormData({
//         name: foodItem.name || "",
//         description: foodItem.description || "",
//         price: foodItem.price?.toString() || "",
//         category: foodItem.category || "BEVERAGES",
//         size: foodItem.size || "MEDIUM",
//         imageUrl: foodItem.imageUrl || "",
//         isAvailable:
//           foodItem.isAvailable !== undefined ? foodItem.isAvailable : true,
//         theaterId: foodItem.theaterId || 1,
//       });

//       if (foodItem.imageUrl) {
//         setImagePreview(foodItem.imageUrl);
//         setUploadMethod("url");
//       }
//     }
//   }, [foodItem]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));

//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   const handleTheaterChange = (value) => {
//     setFormData((prev) => ({ ...prev, theaterId: value }));
//   };

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const validTypes = [
//         "image/jpeg",
//         "image/jpg",
//         "image/png",
//         "image/gif",
//         "image/webp",
//       ];
//       if (!validTypes.includes(file.type)) {
//         alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
//         return;
//       }

//       if (file.size > 5 * 1024 * 1024) {
//         alert("Please select an image smaller than 5MB");
//         return;
//       }

//       setSelectedImage(file);

//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setImagePreview(e.target.result);
//       };
//       reader.readAsDataURL(file);

//       setFormData((prev) => ({ ...prev, imageUrl: "" }));
//     }
//   };

//   const handleImageUrlChange = (e) => {
//     const url = e.target.value;
//     setFormData((prev) => ({ ...prev, imageUrl: url }));

//     if (url) {
//       setImagePreview(url);
//       setSelectedImage(null);
//     } else {
//       setImagePreview(null);
//     }
//   };

//   const removeImage = () => {
//     setSelectedImage(null);
//     setImagePreview(null);
//     setFormData((prev) => ({ ...prev, imageUrl: "" }));
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const uploadImage = async (file) => {
//     const formDataUpload = new FormData();
//     formDataUpload.append("image", file);

//     try {
//       const response = await fetch("http://localhost:8080/api/upload/image", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
//         },
//         body: formDataUpload,
//       });

//       if (!response.ok) {
//         throw new Error("Failed to upload image");
//       }

//       const result = await response.json();
//       return result.imageUrl;
//     } catch (error) {
//       console.error("Image upload failed:", error);
//       throw new Error("Failed to upload image. Please try again.");
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "Name is required";
//     }

//     if (!formData.description.trim()) {
//       newErrors.description = "Description is required";
//     }

//     if (!formData.price || parseFloat(formData.price) <= 0) {
//       newErrors.price = "Valid price is required";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
//     try {
//       let imageUrl = formData.imageUrl;

//       if (selectedImage) {
//         imageUrl = await uploadImage(selectedImage);
//       }

//       const dataToSave = {
//         ...formData,
//         price: parseFloat(formData.price),
//         imageUrl: imageUrl,
//       };

//       await onSave(dataToSave);
//     } catch (error) {
//       console.error("Error saving food item:", error);
//       alert("Failed to save food item: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCategoryIcon = (category) => {
//     switch (category) {
//       case "BEVERAGES":
//         return <Coffee className="w-5 h-5" />;
//       case "SNACKS":
//         return <Cookie className="w-5 h-5" />;
//       case "DESSERTS":
//         return <IceCream className="w-5 h-5" />;
//       default:
//         return <Coffee className="w-5 h-5" />;
//     }
//   };

//   return (
//     <div className="p-8">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h2 className="text-3xl font-bold text-white flex items-center">
//             {getCategoryIcon(formData.category)}
//             <span className="ml-3">
//               {foodItem ? "Edit Food Item" : "Add Food Item"}
//             </span>
//           </h2>
//           <p className="text-slate-300 mt-2">
//             {foodItem
//               ? "Update food item details"
//               : "Create a new food item for your concession stand"}
//           </p>
//         </div>
//         <button
//           onClick={onClose}
//           className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
//         >
//           <X className="w-6 h-6" />
//         </button>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Left Column */}
//           <div className="space-y-6">
//             {/* Name */}
//             <div>
//               <label className="block text-white font-medium mb-2">
//                 Item Name *
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="e.g., Buttered Popcorn, Coca Cola, Ice Cream"
//                 className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
//                   errors.name ? "border-red-400" : "border-white/20"
//                 }`}
//               />
//               {errors.name && (
//                 <p className="text-red-400 text-sm mt-1">{errors.name}</p>
//               )}
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-white font-medium mb-2">
//                 Description *
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 rows={4}
//                 placeholder="Describe the food item..."
//                 className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none ${
//                   errors.description ? "border-red-400" : "border-white/20"
//                 }`}
//               />
//               {errors.description && (
//                 <p className="text-red-400 text-sm mt-1">
//                   {errors.description}
//                 </p>
//               )}
//             </div>

//             {/* Category */}
//             <div>
//               <label className="block text-white font-medium mb-2">
//                 Category *
//               </label>
//               <select
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               >
//                 <option value="BEVERAGES">Beverages</option>
//                 <option value="SNACKS">Snacks</option>
//                 <option value="DESSERTS">Desserts</option>
//               </select>
//             </div>

//             {/* Image Upload Section */}
//             <div>
//               <label className="block text-white font-medium mb-2">
//                 Food Item Image
//               </label>

//               {/* Upload Method Toggle */}
//               <div className="flex mb-4 bg-white/5 rounded-xl p-1">
//                 <button
//                   type="button"
//                   onClick={() => setUploadMethod("upload")}
//                   className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
//                     uploadMethod === "upload"
//                       ? "bg-purple-500 text-white"
//                       : "text-slate-400 hover:text-white"
//                   }`}
//                 >
//                   <Upload className="w-4 h-4 inline mr-2" />
//                   Upload Image
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setUploadMethod("url")}
//                   className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
//                     uploadMethod === "url"
//                       ? "bg-purple-500 text-white"
//                       : "text-slate-400 hover:text-white"
//                   }`}
//                 >
//                   <ImageIcon className="w-4 h-4 inline mr-2" />
//                   Image URL
//                 </button>
//               </div>

//               {/* File Upload */}
//               {uploadMethod === "upload" && (
//                 <div>
//                   <div className="relative">
//                     <input
//                       type="file"
//                       ref={fileInputRef}
//                       onChange={handleImageUpload}
//                       accept="image/*"
//                       className="hidden"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => fileInputRef.current?.click()}
//                       className="w-full p-6 border-2 border-dashed border-white/20 rounded-xl hover:border-purple-500 transition-colors text-center"
//                     >
//                       <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
//                       <p className="text-slate-300">Click to upload image</p>
//                       <p className="text-slate-500 text-sm mt-1">
//                         PNG, JPG, GIF up to 5MB
//                       </p>
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* URL Input */}
//               {uploadMethod === "url" && (
//                 <div className="relative">
//                   <input
//                     type="url"
//                     name="imageUrl"
//                     value={formData.imageUrl}
//                     onChange={handleImageUrlChange}
//                     placeholder="https://example.com/image.jpg"
//                     className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   />
//                   <ImageIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//                 </div>
//               )}

//               {/* Image Preview */}
//               {imagePreview && (
//                 <div className="mt-4 relative">
//                   <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-white text-sm font-medium">
//                         Preview
//                       </span>
//                       <button
//                         type="button"
//                         onClick={removeImage}
//                         className="p-1 text-slate-400 hover:text-red-400 transition-colors"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                     <img
//                       src={imagePreview}
//                       alt="Food item preview"
//                       className="w-full h-32 object-cover rounded-lg"
//                       onError={(e) => {
//                         console.error("Image failed to load");
//                         setImagePreview(null);
//                       }}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right Column */}
//           <div className="space-y-6">
//             {/* Price */}
//             <div>
//               <label className="block text-white font-medium mb-2">
//                 Price (₹) *
//               </label>
//               <input
//                 type="number"
//                 name="price"
//                 value={formData.price}
//                 onChange={handleChange}
//                 step="0.01"
//                 min="0"
//                 placeholder="0.00"
//                 className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
//                   errors.price ? "border-red-400" : "border-white/20"
//                 }`}
//               />
//               {errors.price && (
//                 <p className="text-red-400 text-sm mt-1">{errors.price}</p>
//               )}
//             </div>

//             {/* Size */}
//             <div>
//               <label className="block text-white font-medium mb-2">Size</label>
//               <select
//                 name="size"
//                 value={formData.size}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               >
//                 <option value="SMALL">Small</option>
//                 <option value="MEDIUM">Medium</option>
//                 <option value="LARGE">Large</option>
//               </select>
//             </div>

//             {/* Enhanced Theater Selection */}
//             <div>
//               <label className="block text-white font-medium mb-2">
//                 <Building className="w-4 h-4 inline mr-2" />
//                 Available In Theaters
//               </label>

//               {/* Option to select all theaters */}
//               <div className="mb-3 bg-white/5 rounded-xl p-4 border border-white/10">
//                 <label className="flex items-center space-x-3 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={formData.theaterId === "all"}
//                     onChange={(e) => {
//                       handleTheaterChange(e.target.checked ? "all" : 1);
//                     }}
//                     className="w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
//                   />
//                   <div>
//                     <span className="text-white font-medium">All Theaters</span>
//                     <p className="text-slate-400 text-sm">
//                       Make this item available in all theaters
//                     </p>
//                   </div>
//                 </label>
//               </div>

//               {/* Individual theater selection */}
//               {formData.theaterId !== "all" && (
//                 <select
//                   value={formData.theaterId}
//                   onChange={(e) =>
//                     handleTheaterChange(parseInt(e.target.value))
//                   }
//                   className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                 >
//                   {theaters.map((theater) => (
//                     <option key={theater.id} value={theater.id}>
//                       {theater.name}
//                     </option>
//                   ))}
//                 </select>
//               )}

//               {formData.theaterId === "all" && (
//                 <div className="mt-2 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
//                   <p className="text-emerald-300 text-sm flex items-center">
//                     <Building className="w-4 h-4 mr-2" />✓ This item will be
//                     available in all theaters ({theaters.length} theaters)
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Availability */}
//             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//               <label className="flex items-center space-x-3 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   name="isAvailable"
//                   checked={formData.isAvailable}
//                   onChange={handleChange}
//                   className="w-5 h-5 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
//                 />
//                 <div>
//                   <span className="text-white font-medium">
//                     Available for sale
//                   </span>
//                   <p className="text-slate-400 text-sm">
//                     Customers can order this item
//                   </p>
//                 </div>
//               </label>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/20"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
//           >
//             {loading ? (
//               <>
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                 {selectedImage ? "Uploading..." : "Saving..."}
//               </>
//             ) : (
//               <>
//                 <Save className="w-5 h-5 mr-2" />
//                 {foodItem ? "Update Item" : "Create Item"}
//               </>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default FoodItemForm;
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Coffee,
  Cookie,
  IceCream,
  Upload,
  ImageIcon,
  Trash2,
  Building,
  Loader,
} from "lucide-react";

const FoodItemForm = ({ foodItem, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "BEVERAGES",
    size: "MEDIUM",
    imageUrl: "",
    isAvailable: true,
    theaterId: 1,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadMethod, setUploadMethod] = useState("upload");
  const [isAllTheaters, setIsAllTheaters] = useState(false); // NEW: Track "all theaters" state
  const [theaters] = useState([
    { id: 1, name: "PVR Central - Metropolis" },
    { id: 2, name: "PVR Cinemas - Mumbai" },
    { id: 3, name: "AMB - Hyderabad" },
    { id: 4, name: "Inorbit - Hyderabad" },
  ]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (foodItem) {
      setFormData({
        name: foodItem.name || "",
        description: foodItem.description || "",
        price: foodItem.price?.toString() || "",
        category: foodItem.category || "BEVERAGES",
        size: foodItem.size || "MEDIUM",
        imageUrl: foodItem.imageUrl || "",
        isAvailable:
          foodItem.isAvailable !== undefined ? foodItem.isAvailable : true,
        theaterId: foodItem.theaterId || 1,
      });

      // Don't set "all theaters" for existing items (they belong to one theater)
      setIsAllTheaters(false);

      if (foodItem.imageUrl) {
        setImagePreview(foodItem.imageUrl);
        setUploadMethod("url");
      }
    }
  }, [foodItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleTheaterChange = (value) => {
    setFormData((prev) => ({ ...prev, theaterId: value }));
  };

  const handleAllTheatersChange = (checked) => {
    setIsAllTheaters(checked);
    if (!checked) {
      // If unchecking "all theaters", default to theater 1
      setFormData((prev) => ({ ...prev, theaterId: 1 }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Please select an image smaller than 5MB");
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setFormData((prev) => ({ ...prev, imageUrl: "" }));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: url }));

    if (url) {
      setImagePreview(url);
      setSelectedImage(null);
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const response = await fetch("http://localhost:8080/api/upload/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.imageUrl;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      // FIXED: Handle "all theaters" case properly
      if (isAllTheaters) {
        // Create food item for each theater separately
        const theaterIds = [1, 2, 3, 4]; // Your actual theater IDs
        const results = [];

        for (const theaterId of theaterIds) {
          const dataToSave = {
            ...formData,
            price: parseFloat(formData.price),
            imageUrl: imageUrl,
            theaterId: theaterId, // Send actual theater ID, not "all"
          };

          try {
            const result = await onSave(dataToSave);
            results.push(result);
          } catch (error) {
            console.error(`Failed to save for theater ${theaterId}:`, error);
            // Continue with other theaters even if one fails
          }
        }

        if (results.length === 0) {
          throw new Error("Failed to save food item for any theater");
        }

        // Show success message
        alert(
          `Food item created successfully for ${results.length} theater(s)!`
        );

        // Close the form
        onClose();
      } else {
        // Normal single theater save
        const dataToSave = {
          ...formData,
          price: parseFloat(formData.price),
          imageUrl: imageUrl,
          theaterId: parseInt(formData.theaterId), // Ensure it's a number
        };

        await onSave(dataToSave);
      }
    } catch (error) {
      console.error("Error saving food item:", error);
      alert("Failed to save food item: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "BEVERAGES":
        return <Coffee className="w-5 h-5" />;
      case "SNACKS":
        return <Cookie className="w-5 h-5" />;
      case "DESSERTS":
        return <IceCream className="w-5 h-5" />;
      default:
        return <Coffee className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center">
            {getCategoryIcon(formData.category)}
            <span className="ml-3">
              {foodItem ? "Edit Food Item" : "Add Food Item"}
            </span>
          </h2>
          <p className="text-slate-300 mt-2">
            {foodItem
              ? "Update food item details"
              : "Create a new food item for your concession stand"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-white font-medium mb-2">
                Item Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Buttered Popcorn, Coca Cola, Ice Cream"
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.name ? "border-red-400" : "border-white/20"
                }`}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-medium mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the food item..."
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none ${
                  errors.description ? "border-red-400" : "border-white/20"
                }`}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-white font-medium mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="BEVERAGES">Beverages</option>
                <option value="SNACKS">Snacks</option>
                <option value="DESSERTS">Desserts</option>
              </select>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-white font-medium mb-2">
                Food Item Image
              </label>

              {/* Upload Method Toggle */}
              <div className="flex mb-4 bg-white/5 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setUploadMethod("upload")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    uploadMethod === "upload"
                      ? "bg-purple-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("url")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    uploadMethod === "url"
                      ? "bg-purple-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Image URL
                </button>
              </div>

              {/* File Upload */}
              {uploadMethod === "upload" && (
                <div>
                  <div className="relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-6 border-2 border-dashed border-white/20 rounded-xl hover:border-purple-500 transition-colors text-center"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-300">Click to upload image</p>
                      <p className="text-slate-500 text-sm mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* URL Input */}
              {uploadMethod === "url" && (
                <div className="relative">
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <ImageIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4 relative">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">
                        Preview
                      </span>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <img
                      src={imagePreview}
                      alt="Food item preview"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        console.error("Image failed to load");
                        setImagePreview(null);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Price */}
            <div>
              <label className="block text-white font-medium mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.price ? "border-red-400" : "border-white/20"
                }`}
              />
              {errors.price && (
                <p className="text-red-400 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Size */}
            <div>
              <label className="block text-white font-medium mb-2">Size</label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
              </select>
            </div>

            {/* FIXED: Enhanced Theater Selection */}
            <div>
              <label className="block text-white font-medium mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Available In Theaters
              </label>

              {/* Only show "All Theaters" option for NEW items */}
              {!foodItem && (
                <div className="mb-3 bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllTheaters}
                      onChange={(e) =>
                        handleAllTheatersChange(e.target.checked)
                      }
                      className="w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <div>
                      <span className="text-white font-medium">
                        All Theaters
                      </span>
                      <p className="text-slate-400 text-sm">
                        Make this item available in all theaters
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Individual theater selection */}
              {!isAllTheaters && (
                <select
                  value={formData.theaterId}
                  onChange={(e) =>
                    handleTheaterChange(parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {theaters.map((theater) => (
                    <option key={theater.id} value={theater.id}>
                      {theater.name}
                    </option>
                  ))}
                </select>
              )}

              {isAllTheaters && (
                <div className="mt-2 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                  <p className="text-emerald-300 text-sm flex items-center">
                    <Building className="w-4 h-4 mr-2" />✓ This item will be
                    available in all theaters ({theaters.length} theaters)
                  </p>
                </div>
              )}

              {/* Show info for editing existing items */}
              {foodItem && (
                <div className="mt-2 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    ℹ️ Editing existing item - theater cannot be changed
                  </p>
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                />
                <div>
                  <span className="text-white font-medium">
                    Available for sale
                  </span>
                  <p className="text-slate-400 text-sm">
                    Customers can order this item
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/20"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isAllTheaters
                  ? "Creating for all theaters..."
                  : selectedImage
                  ? "Uploading..."
                  : "Saving..."}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {foodItem
                  ? "Update Item"
                  : isAllTheaters
                  ? "Create for All Theaters"
                  : "Create Item"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FoodItemForm;
