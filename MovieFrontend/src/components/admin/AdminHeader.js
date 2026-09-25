import React from "react";
import { Search } from "lucide-react";

const SECTIONS = {
  dashboard: ["Overview", "How the box office is doing today."],
  movies: ["Films", "What's playing, what's coming, and their showtimes."],
  theaters: ["Theaters", "Your screens, seats and prices."],
  foodItems: ["Canteen", "The snacks menu customers see while booking."],
};

const AdminHeader = ({ activeTab = "dashboard", searchTerm, setSearchTerm, currentUser }) => {
  const [title, lede] = SECTIONS[activeTab] || [activeTab, ""];
  const searchable = activeTab === "movies";
  return (
    <header className="cb-desk__head">
      <div>
        <h1 className="cb-display">{title}</h1>
        {lede && <p className="cb-muted">{lede}</p>}
      </div>
      <div className="cb-desk__headend">
        {searchable && (
          <label className="cb-desk__search">
            <Search size={16} aria-hidden="true" />
            <span className="cb-sr">Search films</span>
            <input
              type="search"
              className="cb-input"
              placeholder="Search films"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        )}
        {currentUser?.email && (
          <span className="cb-badge cb-badge--quiet" title="Signed in as">
            {currentUser.email}
          </span>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
