import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Coffee,
  Cookie,
  IceCream,
  Search,
} from "lucide-react";
import { getFoodItems, deleteFoodItem } from "../../utils/foodItemAPI";

const FoodItemManagement = ({ onAddFoodItem, onEditFoodItem }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    loadFoodItems();
  }, []);

  const loadFoodItems = async () => {
    try {
      setLoading(true);
      const items = await getFoodItems();
      setFoodItems(items);
    } catch (error) {
      console.error("Failed to load food items:", error);
      alert("Failed to load food items");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) {
      return;
    }

    try {
      await deleteFoodItem(id);
      alert("Food item deleted successfully!");
      loadFoodItems();
    } catch (error) {
      console.error("Failed to delete food item:", error);
      alert("Failed to delete food item");
    }
  };

  const filteredItems = foodItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case "BEVERAGES":
        return <Coffee className="w-5 h-5 text-blue-400" />;
      case "SNACKS":
        return <Cookie className="w-5 h-5 text-orange-400" />;
      case "DESSERTS":
        return <IceCream className="w-5 h-5 text-pink-400" />;
      default:
        return <Coffee className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "BEVERAGES":
        return "bg-blue-100 text-blue-800";
      case "SNACKS":
        return "bg-orange-100 text-orange-800";
      case "DESSERTS":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Food & Beverages
          </h2>
          <p className="text-slate-300">Manage your concession stand items</p>
        </div>
        <button
          onClick={onAddFoodItem}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Food Item
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search food items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="ALL">All Categories</option>
          <option value="BEVERAGES">Beverages</option>
          <option value="SNACKS">Snacks</option>
          <option value="DESSERTS">Desserts</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="text-3xl font-bold text-white">
            {foodItems.length}
          </div>
          <div className="text-slate-300">Total Items</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="text-3xl font-bold text-blue-400">
            {foodItems.filter((item) => item.category === "BEVERAGES").length}
          </div>
          <div className="text-slate-300">Beverages</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="text-3xl font-bold text-orange-400">
            {foodItems.filter((item) => item.category === "SNACKS").length}
          </div>
          <div className="text-slate-300">Snacks</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="text-3xl font-bold text-pink-400">
            {foodItems.filter((item) => item.category === "DESSERTS").length}
          </div>
          <div className="text-slate-300">Desserts</div>
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 group"
          >
            {/* Image section - Updated to show actual images */}
            <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative overflow-hidden">
              {item.imageUrl ? (
                <>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide image and show fallback if loading fails
                      e.target.style.display = "none";
                    }}
                  />
                  {/* Category icon overlay for images */}
                  <div className="absolute bottom-2 right-2 bg-black/50 rounded-lg p-2">
                    {getCategoryIcon(item.category)}
                  </div>
                </>
              ) : (
                // Show category icon when no image
                getCategoryIcon(item.category)
              )}
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {item.name}
                  </h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      item.category
                    )}`}
                  >
                    {item.category}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditFoodItem(item)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                {item.description}
              </p>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Price</span>
                  <span className="text-green-400 font-bold">
                    ₹{item.price}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Size</span>
                  <span className="text-white text-sm">{item.size}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Status</span>
                  <span
                    className={`text-sm ${
                      item.isAvailable ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <Coffee className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            No food items found
          </h3>
          <p className="text-slate-500">
            {searchTerm || selectedCategory !== "ALL"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first food item"}
          </p>
        </div>
      )}
    </div>
  );
};

export default FoodItemManagement;
