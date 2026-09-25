import React from "react";
import { LogOut } from "lucide-react";

const MENU = [
  { tab: "dashboard", label: "Overview", te: "సారాంశం" },
  { tab: "movies", label: "Films", te: "సినిమాలు", count: "films" },
  { tab: "theaters", label: "Theaters", te: "థియేటర్లు" },
  { tab: "foodItems", label: "Canteen", te: "క్యాంటీన్", count: "snacks" },
  { tab: "fixShows", label: "Seat repair", te: "సీట్ల మరమ్మతు" },
];

// Tabs that belong to a menu item (e.g. editing a film keeps "Films" highlighted)
const OWNER = {
  addMovie: "movies",
  editMovie: "movies",
  addTheater: "theaters",
  editTheater: "theaters",
  addFoodItem: "foodItems",
  editFoodItem: "foodItems",
};

const TE_DAYS = ["ఆదివారం", "సోమవారం", "మంగళవారం", "బుధవారం", "గురువారం", "శుక్రవారం", "శనివారం"];

const AdminSidebar = ({ activeTab, setActiveTab, currentView, onNavigate, onLogout, counts = {} }) => {
  const current = activeTab || currentView || "dashboard";
  const active = OWNER[current] || current;
  const go = onNavigate || setActiveTab || (() => {});
  const today = new Date();

  const handleLogout = () => {
    if (!window.confirm("Sign out of the manager's desk?")) return;
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("isAdmin");
      window.location.href = "/";
    }
  };

  return (
    <aside className="cb-booth">
      <div className="cb-booth__sign">
        <span className="cb-booth__bulbs" aria-hidden="true" />
        <span className="cb-booth__name">CineBook</span>
        <span className="cb-booth__role">Manager's desk</span>
      </div>

      <div className="cb-booth__leaf" aria-label={today.toDateString()}>
        <span className="cb-booth__month">
          {today.toLocaleDateString("en-IN", { month: "long" })} {today.getFullYear()}
        </span>
        <span className="cb-booth__day">{today.getDate()}</span>
        <span className="cb-booth__weekday">
          {today.toLocaleDateString("en-IN", { weekday: "long" })}
          <span lang="te">{TE_DAYS[today.getDay()]}</span>
        </span>
      </div>

      <nav aria-label="Manager sections">
        <ul className="cb-booth__nav">
          {MENU.map(({ tab, label, te, count }) => (
            <li key={tab}>
              <button
                type="button"
                aria-current={active === tab ? "page" : undefined}
                onClick={() => go(tab)}
              >
                <span className="cb-booth__label">{label}</span>
                <span className="cb-booth__te" lang="te">{te}</span>
                {count && counts[count] != null && (
                  <span className="cb-booth__count" aria-label={`${counts[count]} ${count}`}>
                    {counts[count]}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <button type="button" className="cb-booth__signout" onClick={handleLogout}>
        <LogOut size={16} aria-hidden="true" />
        Sign out
      </button>
    </aside>
  );
};

export default AdminSidebar;
