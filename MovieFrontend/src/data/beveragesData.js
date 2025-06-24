// src/data/beveragesData.js

export const beverageCategories = [
  {
    name: "Beverages",
    icon: "Coffee", // You can import this from lucide-react in components
    items: [
      {
        id: 1,
        name: "Coca Cola",
        price: 80,
        size: "Large",
        image: "🥤",
        description: "Refreshing cola drink",
        category: "beverages",
      },
      {
        id: 2,
        name: "Pepsi",
        price: 80,
        size: "Large",
        image: "🥤",
        description: "Classic cola beverage",
        category: "beverages",
      },
      {
        id: 3,
        name: "Fresh Lime Soda",
        price: 60,
        size: "Medium",
        image: "🍋",
        description: "Freshly squeezed lime with soda",
        category: "beverages",
      },
      {
        id: 4,
        name: "Orange Juice",
        price: 100,
        size: "Large",
        image: "🍊",
        description: "Fresh orange juice",
        category: "beverages",
      },
      {
        id: 12,
        name: "Mineral Water",
        price: 30,
        size: "500ml",
        image: "💧",
        description: "Pure drinking water",
        category: "beverages",
      },
      {
        id: 13,
        name: "Coffee",
        price: 70,
        size: "Regular",
        image: "☕",
        description: "Hot brewed coffee",
        category: "beverages",
      },
    ],
  },
  {
    name: "Snacks",
    icon: "Sandwich", // You can import this from lucide-react in components
    items: [
      {
        id: 5,
        name: "Popcorn",
        price: 150,
        size: "Large",
        image: "🍿",
        description: "Freshly popped corn with butter",
        category: "snacks",
      },
      {
        id: 6,
        name: "Nachos",
        price: 120,
        size: "Medium",
        image: "🧀",
        description: "Crispy nachos with cheese dip",
        category: "snacks",
      },
      {
        id: 7,
        name: "Hot Dog",
        price: 180,
        size: "Regular",
        image: "🌭",
        description: "Grilled hot dog with mustard",
        category: "snacks",
      },
      {
        id: 8,
        name: "French Fries",
        price: 100,
        size: "Large",
        image: "🍟",
        description: "Golden crispy french fries",
        category: "snacks",
      },
      {
        id: 14,
        name: "Samosa",
        price: 40,
        size: "2 pieces",
        image: "🥟",
        description: "Crispy fried samosas",
        category: "snacks",
      },
      {
        id: 15,
        name: "Sandwich",
        price: 90,
        size: "Regular",
        image: "🥪",
        description: "Grilled veg sandwich",
        category: "snacks",
      },
    ],
  },
  {
    name: "Desserts",
    icon: "Cookie", // You can import this from lucide-react in components
    items: [
      {
        id: 9,
        name: "Ice Cream",
        price: 90,
        size: "Cup",
        image: "🍦",
        description: "Vanilla ice cream cup",
        category: "desserts",
      },
      {
        id: 10,
        name: "Chocolate Brownie",
        price: 120,
        size: "Slice",
        image: "🍰",
        description: "Rich chocolate brownie",
        category: "desserts",
      },
      {
        id: 11,
        name: "Cookies",
        price: 80,
        size: "Pack",
        image: "🍪",
        description: "Assorted cookie pack",
        category: "desserts",
      },
      {
        id: 16,
        name: "Kulfi",
        price: 60,
        size: "Stick",
        image: "🍨",
        description: "Traditional Indian ice cream",
        category: "desserts",
      },
    ],
  },
];

// Helper functions for easier data access
export const getAllBeverageItems = () => {
  return beverageCategories.flatMap((category) => category.items);
};

export const getBeverageItemById = (id) => {
  return getAllBeverageItems().find((item) => item.id === parseInt(id));
};

export const getBeveragesByCategory = (categoryName) => {
  const category = beverageCategories.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category ? category.items : [];
};

// Price ranges for filtering (if needed later)
export const priceRanges = [
  { label: "Under ₹50", min: 0, max: 50 },
  { label: "₹50 - ₹100", min: 50, max: 100 },
  { label: "₹100 - ₹150", min: 100, max: 150 },
  { label: "Above ₹150", min: 150, max: Infinity },
];

// Theater-specific availability (if different theaters have different items)
export const theaterBeverages = {
  PVR_CENTRAL: {
    availableItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], // Most items
    specialOffers: [
      { itemIds: [5, 1], discount: 10, name: "Popcorn + Coke Combo" },
      { itemIds: [7, 2], discount: 15, name: "Hot Dog + Pepsi Combo" },
    ],
  },
  AMB_CINEMAS: {
    availableItems: [1, 2, 5, 6, 8, 9, 11, 12, 14, 15, 16], // Different selection
    specialOffers: [
      { itemIds: [5, 1], discount: 10, name: "Movie Munch Combo" },
    ],
  },
  // Add more theaters as needed
};

export default beverageCategories;
