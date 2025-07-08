const API_BASE_URL = "http://localhost:8080/api";

// Get admin token from localStorage
const getAdminToken = () => {
  return localStorage.getItem("adminToken");
};

// Create headers with admin token
const createHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAdminToken()}`,
});

// Helper function to convert snake_case to camelCase
const convertFoodItemData = (item) => {
  if (!item) return null;

  return {
    id: item.id,
    name: item.name || "",
    description: item.description || "",
    price: item.price || 0,
    category: item.category || "BEVERAGES",
    size: item.size || "MEDIUM",
    imageUrl: item.image_url || item.imageUrl || null,
    // Fix the boolean conversion - handle 1/0 from database
    isAvailable:
      item.is_available === 1 ||
      item.is_available === true ||
      item.isAvailable === true,
    theaterId: item.theater_id || item.theaterId || 1,
    createdAt: item.created_at || item.createdAt,
    updatedAt: item.updated_at || item.updatedAt,
  };
};

// Helper function to convert camelCase to snake_case for API requests
const convertToApiFormat = (data) => {
  const apiData = { ...data };

  // Convert camelCase to snake_case
  if (data.imageUrl !== undefined) {
    apiData.image_url = data.imageUrl;
    delete apiData.imageUrl;
  }

  if (data.isAvailable !== undefined) {
    apiData.is_available = data.isAvailable;
    delete apiData.isAvailable;
  }

  if (data.theaterId !== undefined) {
    apiData.theater_id = data.theaterId;
    delete apiData.theaterId;
  }

  if (data.createdAt !== undefined) {
    apiData.created_at = data.createdAt;
    delete apiData.createdAt;
  }

  if (data.updatedAt !== undefined) {
    apiData.updated_at = data.updatedAt;
    delete apiData.updatedAt;
  }

  return apiData;
};

// Get all food items for admin (including inactive)
export const getFoodItems = async () => {
  try {
    console.log("Fetching food items from admin endpoint...");

    const response = await fetch(`${API_BASE_URL}/admin/food-items`, {
      method: "GET",
      headers: createHeaders(),
    });

    console.log("Admin API response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch food items`);
    }

    const data = await response.json();
    console.log("Raw admin API response:", data);

    const items = data.success ? data.data : data;
    console.log("Extracted items array:", items);

    // Convert all items to camelCase
    if (Array.isArray(items)) {
      const convertedItems = items.map(convertFoodItemData);
      console.log("Converted items:", convertedItems);
      return convertedItems;
    }

    console.log("Items is not an array, returning empty array");
    return [];
  } catch (error) {
    console.error("Error fetching food items:", error);
    throw error;
  }
};

// Get available food items for users
export const getAvailableFoodItems = async (
  category = null,
  theaterId = null
) => {
  try {
    let url = `${API_BASE_URL}/food-items`;
    const params = new URLSearchParams();

    if (category) params.append("category", category);
    if (theaterId) params.append("theater_id", theaterId);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log("Fetching available food items from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Public API returned ${response.status}: ${response.statusText}`
      );

      // Fallback to admin endpoint
      console.log("Falling back to admin endpoint...");
      const fallbackItems = await getFoodItems();

      // Filter by theater and availability
      if (Array.isArray(fallbackItems)) {
        let filtered = fallbackItems.filter(
          (item) => item.isAvailable === true
        );

        if (theaterId) {
          filtered = filtered.filter(
            (item) =>
              item.theaterId === theaterId ||
              item.theaterId === 1 ||
              !item.theaterId
          );
        }

        return filtered;
      }

      return [];
    }

    const data = await response.json();
    let items = data.success ? data.data : data;

    // Convert all items to camelCase
    if (Array.isArray(items)) {
      items = items.map(convertFoodItemData);

      // Filter by availability and theater
      items = items.filter((item) => item.isAvailable === true);

      if (theaterId) {
        items = items.filter(
          (item) =>
            item.theaterId === theaterId ||
            item.theaterId === 1 ||
            !item.theaterId
        );
      }
    }

    return items || [];
  } catch (error) {
    console.error("Error fetching available food items:", error);

    // Final fallback - try admin endpoint
    try {
      console.log("Final fallback: trying admin endpoint...");
      const fallbackItems = await getFoodItems();

      // Filter by theater and availability
      if (Array.isArray(fallbackItems)) {
        let filtered = fallbackItems.filter(
          (item) => item.isAvailable === true
        );

        if (theaterId) {
          filtered = filtered.filter(
            (item) =>
              item.theaterId === theaterId ||
              item.theaterId === 1 ||
              !item.theaterId
          );
        }

        return filtered;
      }

      return [];
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return [];
    }
  }
};

// Create new food item (admin only)
export const createFoodItem = async (foodItemData) => {
  try {
    // Convert camelCase to snake_case for API
    const apiData = convertToApiFormat(foodItemData);
    console.log("Creating food item with data:", apiData);

    const response = await fetch(`${API_BASE_URL}/admin/food-items`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create food item");
    }

    const data = await response.json();
    const result = data.success ? data.data : data;

    // Convert response back to camelCase
    return convertFoodItemData(result);
  } catch (error) {
    console.error("Error creating food item:", error);
    throw error;
  }
};

// Update food item (admin only)
export const updateFoodItem = async (id, foodItemData) => {
  try {
    // Convert camelCase to snake_case for API
    const apiData = convertToApiFormat(foodItemData);
    console.log("Updating food item with data:", apiData);

    const response = await fetch(`${API_BASE_URL}/admin/food-items/${id}`, {
      method: "PUT",
      headers: createHeaders(),
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update food item");
    }

    const data = await response.json();
    const result = data.success ? data.data : data;

    // Convert response back to camelCase
    return convertFoodItemData(result);
  } catch (error) {
    console.error("Error updating food item:", error);
    throw error;
  }
};

// Delete food item (admin only)
export const deleteFoodItem = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/food-items/${id}`, {
      method: "DELETE",
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete food item");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting food item:", error);
    throw error;
  }
};

// Get food item by ID (admin)
export const getFoodItemById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/food-items/${id}`, {
      method: "GET",
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch food item");
    }

    const data = await response.json();
    const result = data.success ? data.data : data;

    // Convert response to camelCase
    return convertFoodItemData(result);
  } catch (error) {
    console.error("Error fetching food item:", error);
    throw error;
  }
};

// Get food items by category (public)
export const getFoodItemsByCategory = async (category) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/food-items/category/${category}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch food items by category");
    }

    const data = await response.json();
    const items = data.success ? data.data : data;

    // Convert all items to camelCase
    if (Array.isArray(items)) {
      return items
        .map(convertFoodItemData)
        .filter((item) => item.isAvailable === true);
    }

    return [];
  } catch (error) {
    console.error("Error fetching food items by category:", error);
    throw error;
  }
};

// Format food item data for display (legacy function)
export const formatFoodItemData = (foodItem) => {
  return convertFoodItemData(foodItem);
};
