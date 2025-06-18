// Sample Movies Data
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

// Sample Theaters Data
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

// Theater Layout for Seat Selection
export const theaterLayout = {
  "Royal Recliner": {
    price: 630,
    rows: [{ row: "A", seats: [3, 4, 5, 6, 9, 10, 11, 13, 14] }],
  },
  Royal: {
    price: 360,
    rows: [
      { row: "B", seats: [1, 2, 3, 4, 5, 12, 13, 14, 15, 17, 18, 19] },
      { row: "C", seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
      { row: "D", seats: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 18, 19] },
    ],
  },
  Club: {
    price: 350,
    rows: [
      {
        row: "E",
        seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      },
      {
        row: "F",
        seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      },
      {
        row: "G",
        seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      },
      {
        row: "H",
        seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      },
      { row: "I", seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
    ],
  },
  Executive: {
    price: 330,
    rows: [
      { row: "J", seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
      { row: "K", seats: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
      { row: "L", seats: [4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
    ],
  },
};

// Mock sold seats and wheelchair accessible seats
export const soldSeats = [
  "A3",
  "B2",
  "B18",
  "C6",
  "C12",
  "D8",
  "E15",
  "F9",
  "G11",
  "H7",
  "I10",
  "J12",
  "K6",
  "L8",
];
export const wheelchairSeats = ["L7", "L8"];
