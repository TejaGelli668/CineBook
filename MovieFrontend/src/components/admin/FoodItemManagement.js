import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Coffee, Cookie, IceCream, Search } from "lucide-react";
import { getFoodItems, deleteFoodItem } from "../../utils/foodItemAPI";
import { Loading } from "../ui/Chrome";
import SnackArt, { TINT } from "../ui/SnackArt";
import "../user/booking.css";

const SECTIONS = [
  { id: "SNACKS", label: "Snacks", icon: Cookie },
  { id: "BEVERAGES", label: "Beverages", icon: Coffee },
  { id: "DESSERTS", label: "Desserts", icon: IceCream },
];

// The canteen menu as customers see it, with manager controls
const FoodItemManagement = ({ onAddFoodItem, onEditFoodItem, refreshKey }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    loadFoodItems();
  }, [refreshKey]);

  const loadFoodItems = async () => {
    try {
      setLoading(true);
      setError("");
      setFoodItems(await getFoodItems());
    } catch (err) {
      console.error("Failed to load food items:", err);
      setError("The menu didn't load. Check the backend is running, then try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from the menu?`)) return;
    try {
      await deleteFoodItem(item.id);
      loadFoodItems();
    } catch (err) {
      console.error("Failed to delete food item:", err);
      setError(`"${item.name}" couldn't be removed. Try again.`);
    }
  };

  const q = searchTerm.toLowerCase();
  const filteredItems = foodItems.filter(
    (item) =>
      (selectedCategory === "ALL" || item.category === selectedCategory) &&
      (item.name.toLowerCase().includes(q) || (item.description || "").toLowerCase().includes(q))
  );

  if (loading) return <Loading label="Loading the menu" />;

  return (
    <section aria-label="Canteen menu">
      <div className="cb-desk-bar">
        <div className="cb-desk-bar__filters">
          <div className="cb-chips" role="group" aria-label="Menu section">
            {[{ id: "ALL", label: "All" }, ...SECTIONS].map((c) => (
              <button
                key={c.id}
                type="button"
                className="cb-chip"
                aria-pressed={selectedCategory === c.id}
                onClick={() => setSelectedCategory(c.id)}
              >
                {c.label}{" "}
                <span className="cb-muted">
                  {c.id === "ALL" ? foodItems.length : foodItems.filter((f) => f.category === c.id).length}
                </span>
              </button>
            ))}
          </div>
          <label className="cb-desk__search">
            <Search size={16} aria-hidden="true" />
            <span className="cb-sr">Search the menu</span>
            <input
              type="search"
              className="cb-input"
              placeholder="Search the menu"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        </div>
        <button type="button" className="cb-btn cb-btn--stamp" onClick={onAddFoodItem}>
          <Plus size={16} aria-hidden="true" /> Add an item
        </button>
      </div>

      {error && (
        <div className="cb-alert cb-alert--error" style={{ marginBottom: 20 }}>
          <span style={{ flex: 1 }}>{error}</span>
          <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm" onClick={loadFoodItems}>
            Try again
          </button>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="cb-empty">
          <h2 className="cb-h2">{foodItems.length === 0 ? "The menu is empty" : "Nothing matches"}</h2>
          <p>
            {foodItems.length === 0
              ? "Add popcorn, chai and the rest. Customers can pre-order while booking seats."
              : "Try another search or menu section."}
          </p>
          {foodItems.length === 0 && (
            <button type="button" className="cb-btn cb-btn--stamp" onClick={onAddFoodItem}>
              <Plus size={16} aria-hidden="true" /> Add an item
            </button>
          )}
        </div>
      ) : (
        <div className="cb-menu cb-menu--desk">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const items = filteredItems.filter((f) => f.category === id);
            if (items.length === 0) return null;
            return (
              <section key={id} className="cb-menu__section">
                <h3 className="cb-h3">
                  <Icon size={20} aria-hidden="true" /> {label}
                </h3>
                <ul>
                  {items.map((item) => (
                    <li key={item.id} className="cb-dish" data-off={!item.isAvailable}>
                      {item.imageUrl ? (
                        <img className="cb-dish__img" src={item.imageUrl} alt="" onError={(e) => (e.target.style.display = "none")} />
                      ) : (
                        <span className="cb-dish__img cb-dish__art" data-tint={TINT[item.category] || "gold"}>
                          <SnackArt name={item.name} category={item.category} />
                        </span>
                      )}
                      <div className="cb-dish__text">
                        <p className="cb-dish__line">
                          <span className="cb-dish__name">{item.name}</span>
                          <span className="cb-dish__dots" aria-hidden="true" />
                          <span className="cb-dish__price">₹{item.price}</span>
                        </p>
                        <p className="cb-dish__desc">
                          {item.description}
                          {item.size && `, ${String(item.size).toLowerCase()}`}
                        </p>
                        <p className="cb-dish__flags">
                          <span className={`cb-badge ${item.isAvailable ? "cb-badge--ok" : "cb-badge--quiet"}`}>
                            {item.isAvailable ? "On sale" : "Off the menu"}
                          </span>
                          <span className="cb-muted cb-small">
                            {item.theaterId ? `Theater #${item.theaterId} only` : "Every theater"}
                          </span>
                        </p>
                      </div>
                      <div className="cb-row-actions">
                        <button type="button" className="cb-iconbtn" onClick={() => onEditFoodItem(item)} aria-label={`Edit ${item.name}`} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="cb-iconbtn cb-iconbtn--danger"
                          onClick={() => handleDelete(item)}
                          aria-label={`Remove ${item.name}`}
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FoodItemManagement;
