// // Sample Movies Data
// export const sampleMovies = [
//   {
//     id: "1",
//     title: "Avengers: Endgame",
//     genre: "Action",
//     rating: 8.4,
//     duration: "3h 1m",
//     language: "English",
//     releaseDate: "2024-04-26",
//     poster:
//       "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
//     price: 300,
//     description:
//       "The Avengers assemble once more to reverse the damage caused by Thanos in an epic battle that will determine the fate of the universe.",
//     director: "Anthony Russo",
//     cast: [
//       "Robert Downey Jr.",
//       "Chris Evans",
//       "Scarlett Johansson",
//       "Mark Ruffalo",
//     ],
//     status: "Active",
//   },
//   {
//     id: "2",
//     title: "Spider-Man: No Way Home",
//     genre: "Action",
//     rating: 8.2,
//     duration: "2h 28m",
//     language: "English",
//     releaseDate: "2024-12-17",
//     poster:
//       "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
//     price: 250,
//     description:
//       "Spider-Man faces his greatest challenge yet when the multiverse is torn open, bringing enemies from other dimensions.",
//     director: "Jon Watts",
//     cast: ["Tom Holland", "Zendaya", "Benedict Cumberbatch", "Willem Dafoe"],
//     status: "Active",
//   },
//   {
//     id: "3",
//     title: "Dune: Part Two",
//     genre: "Sci-Fi",
//     rating: 8.6,
//     duration: "2h 46m",
//     language: "English",
//     releaseDate: "2024-03-01",
//     poster:
//       "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop",
//     price: 280,
//     description:
//       "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
//     director: "Denis Villeneuve",
//     cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Oscar Isaac"],
//     status: "Active",
//   },
//   {
//     id: "4",
//     title: "Top Gun: Maverick",
//     genre: "Action",
//     rating: 8.3,
//     duration: "2h 11m",
//     language: "English",
//     releaseDate: "2024-05-27",
//     poster:
//       "https://images.unsplash.com/photo-1473492201326-7c01dd2e596b?w=400&h=600&fit=crop",
//     price: 270,
//     description:
//       "After thirty years, Maverick is still pushing the envelope as a top naval aviator, training a new generation of pilots.",
//     director: "Joseph Kosinski",
//     cast: ["Tom Cruise", "Miles Teller", "Jennifer Connelly", "Jon Hamm"],
//     status: "Active",
//   },
// ];

// // Sample Theaters Data
// export const sampleTheaters = [
//   {
//     id: "1",
//     name: "PVR Cinemas - Phoenix Mall",
//     shows: ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"],
//     prices: { "10:00 AM": 200, "1:30 PM": 250, "5:00 PM": 300, "8:30 PM": 350 },
//     location: "Phoenix Mall, Mumbai",
//     screens: 8,
//     totalSeats: 1200,
//     facilities: ["M-Ticket", "Food & Beverage", "Parking"],
//     status: "Active",
//   },
//   {
//     id: "2",
//     name: "INOX Megaplex",
//     shows: ["11:00 AM", "2:30 PM", "6:00 PM", "9:30 PM"],
//     prices: { "11:00 AM": 220, "2:30 PM": 280, "6:00 PM": 320, "9:30 PM": 400 },
//     location: "Megaplex Mall, Delhi",
//     screens: 12,
//     totalSeats: 1800,
//     facilities: ["M-Ticket", "Food & Beverage", "IMAX"],
//     status: "Active",
//   },
//   {
//     id: "3",
//     name: "Cinépolis",
//     shows: ["9:30 AM", "12:45 PM", "4:15 PM", "7:45 PM"],
//     prices: { "9:30 AM": 180, "12:45 PM": 230, "4:15 PM": 280, "7:45 PM": 330 },
//     location: "City Center, Bangalore",
//     screens: 6,
//     totalSeats: 900,
//     facilities: ["M-Ticket", "Food & Beverage", "4DX"],
//     status: "Active",
//   },
// ];

// // Theater Layout for Seat Selection
// export const theaterLayout = {
//   "Royal Recliner": {
//     price: 630,
//     rows: [{ row: "A", seats: [3, 4, 5, 6, 9, 10, 11, 13, 14] }],
//   },
//   Royal: {
//     price: 360,
//     rows: [
//       { row: "B", seats: [1, 2, 3, 4, 5, 12, 13, 14, 15, 17, 18, 19] },
//       { row: "C", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
//       { row: "D", seats: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 18, 19] },
//     ],
//   },
//   Club: {
//     price: 350,
//     rows: [
//       {
//         row: "E",
//         seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
//       },
//       {
//         row: "F",
//         seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
//       },
//       {
//         row: "G",
//         seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
//       },
//       {
//         row: "H",
//         seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
//       },
//       { row: "I", seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
//     ],
//   },
//   Executive: {
//     price: 330,
//     rows: [
//       { row: "J", seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
//       { row: "K", seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
//       { row: "L", seats: [4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
//     ],
//   },
// };

// // Mock sold seats and wheelchair accessible seats
// export const soldSeats = [
//   "A3",
//   "B2",
//   "B18",
//   "C6",
//   "C12",
//   "D8",
//   "E15",
//   "F9",
//   "G11",
//   "H7",
//   "I10",
//   "J12",
//   "K6",
//   "L8",
// ];
// export const wheelchairSeats = ["L7", "L8"];
// Updated sampleData.js - Replace your existing file with this

// Sample Movies Data (unchanged)
export const sampleMovies = [
  {
    id: "1",
    title: "Avengers: Endgame",
    genre: "Action",
    rating: 8.4,
    duration: "3h 1m",
    language: "English",
    releaseDate: "2024-04-26",
    poster:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    price: 300,
    description:
      "The Avengers assemble once more to reverse the damage caused by Thanos in an epic battle that will determine the fate of the universe.",
    director: "Anthony Russo",
    cast: [
      "Robert Downey Jr.",
      "Chris Evans",
      "Scarlett Johansson",
      "Mark Ruffalo",
    ],
    status: "Active",
  },
  {
    id: "2",
    title: "Spider-Man: No Way Home",
    genre: "Action",
    rating: 8.2,
    duration: "2h 28m",
    language: "English",
    releaseDate: "2024-12-17",
    poster:
      "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    price: 250,
    description:
      "Spider-Man faces his greatest challenge yet when the multiverse is torn open, bringing enemies from other dimensions.",
    director: "Jon Watts",
    cast: ["Tom Holland", "Zendaya", "Benedict Cumberbatch", "Willem Dafoe"],
    status: "Active",
  },
  {
    id: "3",
    title: "Dune: Part Two",
    genre: "Sci-Fi",
    rating: 8.6,
    duration: "2h 46m",
    language: "English",
    releaseDate: "2024-03-01",
    poster:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop",
    price: 280,
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Oscar Isaac"],
    status: "Active",
  },
  {
    id: "4",
    title: "Top Gun: Maverick",
    genre: "Action",
    rating: 8.3,
    duration: "2h 11m",
    language: "English",
    releaseDate: "2024-05-27",
    poster:
      "https://images.unsplash.com/photo-1473492201326-7c01dd2e596b?w=400&h=600&fit=crop",
    price: 270,
    description:
      "After thirty years, Maverick is still pushing the envelope as a top naval aviator, training a new generation of pilots.",
    director: "Joseph Kosinski",
    cast: ["Tom Cruise", "Miles Teller", "Jennifer Connelly", "Jon Hamm"],
    status: "Active",
  },
];

// Sample Theaters Data (unchanged)
export const sampleTheaters = [
  {
    id: "1",
    name: "PVR Cinemas - Phoenix Mall",
    shows: ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"],
    prices: { "10:00 AM": 200, "1:30 PM": 250, "5:00 PM": 300, "8:30 PM": 350 },
    location: "Phoenix Mall, Mumbai",
    screens: 8,
    totalSeats: 1200,
    facilities: ["M-Ticket", "Food & Beverage", "Parking"],
    status: "Active",
  },
  {
    id: "2",
    name: "INOX Megaplex",
    shows: ["11:00 AM", "2:30 PM", "6:00 PM", "9:30 PM"],
    prices: { "11:00 AM": 220, "2:30 PM": 280, "6:00 PM": 320, "9:30 PM": 400 },
    location: "Megaplex Mall, Delhi",
    screens: 12,
    totalSeats: 1800,
    facilities: ["M-Ticket", "Food & Beverage", "IMAX"],
    status: "Active",
  },
  {
    id: "3",
    name: "Cinépolis",
    shows: ["9:30 AM", "12:45 PM", "4:15 PM", "7:45 PM"],
    prices: { "9:30 AM": 180, "12:45 PM": 230, "4:15 PM": 280, "7:45 PM": 330 },
    location: "City Center, Bangalore",
    screens: 6,
    totalSeats: 900,
    facilities: ["M-Ticket", "Food & Beverage", "4DX"],
    status: "Active",
  },
];

// Clean Theater Layout - Your preferred structure
export const cleanTheaterLayout = {
  A: [1, 2, 3, 4, 5, 6, 7, 8, 9], // Royal Recliner - 9 seats
  B: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Royal - 12 seats
  C: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // Royal - 15 seats
  D: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], // Royal - 14 seats
  E: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], // Club - 16 seats
  F: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], // Club - 16 seats
  G: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], // Club - 16 seats
  H: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], // Club - 16 seats
  I: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Club - 12 seats
  J: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Executive - 12 seats
  K: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Executive - 12 seats
  L: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Executive - 11 seats
};

// Theater Layout for component - converted from your clean structure
export const theaterLayout = {
  "Royal Recliner": {
    price: 630,
    rows: [{ row: "A", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9] }],
  },
  Royal: {
    price: 400,
    rows: [
      { row: "B", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { row: "C", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
      { row: "D", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    ],
  },
  Club: {
    price: 350,
    rows: [
      {
        row: "E",
        seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      },
      {
        row: "F",
        seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      },
      {
        row: "G",
        seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      },
      {
        row: "H",
        seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      },
      { row: "I", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    ],
  },
  Executive: {
    price: 330,
    rows: [
      { row: "J", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { row: "K", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { row: "L", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
    ],
  },
};

// Helper functions
export const getCategoryFromRow = (row) => {
  const rowToCategory = {
    A: "Royal Recliner",
    B: "Royal",
    C: "Royal",
    D: "Royal",
    E: "Club",
    F: "Club",
    G: "Club",
    H: "Club",
    I: "Club",
    J: "Executive",
    K: "Executive",
    L: "Executive",
  };
  return rowToCategory[row] || "Executive";
};

export const getPriceFromRow = (row) => {
  const category = getCategoryFromRow(row);
  return theaterLayout[category]?.price || 330;
};

// Updated sold seats - realistic distribution across your clean layout
export const soldSeats = [
  // Royal Recliner - Row A (9 seats total, 2 sold)
  "A3",
  "A7",

  // Royal - Rows B,C,D (41 seats total, 8 sold)
  "B2",
  "B11",
  "C6",
  "C12",
  "C14",
  "D8",
  "D13",
  "D5",

  // Club - Rows E,F,G,H,I (76 seats total, 10 sold)
  "E15",
  "E5",
  "F9",
  "F14",
  "G11",
  "G7",
  "G16",
  "H7",
  "H16",
  "I10",

  // Executive - Rows J,K,L (35 seats total, 6 sold)
  "J12",
  "J6",
  "K6",
  "K10",
  "L8",
  "L3",
];

// Wheelchair accessible seats - end seats for easy access
export const wheelchairSeats = [
  "L1",
  "L2",
  "L10",
  "L11", // Executive row ends
  "K1",
  "K12", // Executive row ends
  "I1",
  "I12", // Club row ends
];

// Utility functions
export const getTotalSeats = () => {
  return Object.values(cleanTheaterLayout).reduce(
    (total, seats) => total + seats.length,
    0
  );
};

export const getSeatsByCategory = () => {
  const categories = {
    "Royal Recliner": ["A"],
    Royal: ["B", "C", "D"],
    Club: ["E", "F", "G", "H", "I"],
    Executive: ["J", "K", "L"],
  };

  const result = {};
  Object.entries(categories).forEach(([category, rows]) => {
    result[category] = rows.reduce((total, row) => {
      return total + (cleanTheaterLayout[row]?.length || 0);
    }, 0);
  });

  return result;
};

// Log theater statistics
console.log("🎭 Theater Layout Statistics:");
console.log(`Total seats: ${getTotalSeats()}`);
console.log("Seats by category:", getSeatsByCategory());
console.log(`Sold seats: ${soldSeats.length}`);
console.log(`Available seats: ${getTotalSeats() - soldSeats.length}`);
