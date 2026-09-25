import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Link2, Trash2, Plus } from "lucide-react";
import SnackArt, { TINT } from "../ui/SnackArt";

// Canteen item editor. An item with no theater is sold at every cinema.
const FoodItemForm = ({ foodItem, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "SNACKS",
    size: "MEDIUM",
    imageUrl: "",
    isAvailable: true,
    theaterId: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadMethod, setUploadMethod] = useState("upload");
  const [theaters, setTheaters] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/theaters", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
      .then((r) => r.json())
      .then((d) => setTheaters(d.data || d || []))
      .catch(() => setTheaters([]));
  }, []);

  useEffect(() => {
    if (foodItem) {
      setFormData({
        name: foodItem.name || "",
        description: foodItem.description || "",
        price: foodItem.price?.toString() || "",
        category: foodItem.category || "SNACKS",
        size: foodItem.size || "MEDIUM",
        imageUrl: foodItem.imageUrl || "",
        isAvailable: foodItem.isAvailable !== undefined ? foodItem.isAvailable : true,
        theaterId: foodItem.theaterId ?? null,
      });
      if (foodItem.imageUrl) {
        setImagePreview(foodItem.imageUrl);
        setUploadMethod("url");
      }
    }
  }, [foodItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors((p) => ({ ...p, image: "Use a JPEG, PNG, GIF or WebP image." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "The image must be under 5 MB." }));
      return;
    }
    setErrors((p) => ({ ...p, image: "" }));
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImagePreview(url || null);
    setSelectedImage(null);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);
    const response = await fetch("http://localhost:8080/api/upload/image", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      body: formDataUpload,
    });
    if (!response.ok) throw new Error("The image couldn't be uploaded. Try again.");
    const result = await response.json();
    return result.imageUrl;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Enter the item's name";
    if (!formData.description.trim()) newErrors.description = "Add a short description";
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Enter a price above ₹0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validateForm()) return;
    setLoading(true);
    try {
      const imageUrl = selectedImage ? await uploadImage(selectedImage) : formData.imageUrl;
      await onSave({
        ...formData,
        price: parseFloat(formData.price),
        imageUrl,
        theaterId: formData.theaterId ? parseInt(formData.theaterId) : null,
      });
    } catch (error) {
      console.error("Error saving food item:", error);
      setFormError(error.message || "The item couldn't be saved.");
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, input) => (
    <div className="cb-field">
      <label htmlFor={`fi-${name}`} className="cb-label">
        {label}
      </label>
      {input}
      {errors[name] && <p className="cb-field__error">{errors[name]}</p>}
    </div>
  );

  const choice = (name, label, options) => (
    <div className="cb-field">
      <span className="cb-label" id={`fi-${name}-label`}>{label}</span>
      <div className="cb-stampset" role="group" aria-labelledby={`fi-${name}-label`} style={{ marginTop: 8 }}>
        {options.map(([value, text]) => (
          <button
            key={value}
            type="button"
            aria-pressed={formData[name] === value}
            onClick={() => setFormData((p) => ({ ...p, [name]: value }))}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form className="cb-docket cb-slip" onSubmit={handleSubmit} noValidate>
      <header className="cb-slip__head">
        <div>
          <div className="cb-docket__masthead">
            <span className="cb-docket__brand">Canteen menu slip</span>
            <span lang="te">క్యాంటీన్</span>
          </div>
          <h2>{foodItem ? "Edit canteen item" : "Add to the canteen"}</h2>
          <p>Customers add this while picking seats and collect it at the counter.</p>
        </div>
        <button type="button" className="cb-iconbtn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </header>

      <div className="cb-slip__body">
        <div className="cb-slip__fields">
          {formError && (
            <div className="cb-alert cb-alert--error" role="alert">
              {formError}
            </div>
          )}
          {field(
            "name",
            "Name",
            <input
              id="fi-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="cb-input"
              placeholder="Salted popcorn"
              aria-invalid={!!errors.name}
            />
          )}
          {field(
            "description",
            "Description",
            <textarea
              id="fi-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="cb-textarea"
              placeholder="Large tub, freshly popped"
              aria-invalid={!!errors.description}
            />
          )}
          <div className="cb-form-row">
            {field(
              "price",
              "Price (₹)",
              <input
                id="fi-price"
                type="number"
                name="price"
                min="0"
                step="1"
                inputMode="numeric"
                value={formData.price}
                onChange={handleChange}
                className="cb-input"
                placeholder="180"
                aria-invalid={!!errors.price}
              />
            )}
            {field(
              "theaterId",
              "Sold at",
              <select
                id="fi-theaterId"
                value={formData.theaterId ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, theaterId: e.target.value ? parseInt(e.target.value) : null }))
                }
                className="cb-select"
              >
                <option value="">Every theater</option>
                {theaters.map((t) => (
                  <option key={t.id} value={t.id}>
                    Only {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          {choice("category", "Menu section", [
            ["SNACKS", "Snacks"],
            ["BEVERAGES", "Drinks"],
            ["DESSERTS", "Desserts"],
          ])}
          {choice("size", "Size", [
            ["SMALL", "Small"],
            ["MEDIUM", "Medium"],
            ["LARGE", "Large"],
          ])}
          <label className="cb-toggle-sale">
            <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} />
            On sale now
          </label>
        </div>

        <aside className="cb-slip__proof" aria-label="Preview">
          <p className="cb-proof__caption">How customers see it</p>
          <div
            className="cb-snack"
            data-tint={TINT[formData.category] || "gold"}
            data-off={!formData.isAvailable}
          >
            <div className="cb-snack__art">
              {imagePreview ? (
                <img src={imagePreview} alt="" onError={() => setImagePreview(null)} />
              ) : (
                <SnackArt name={formData.name} category={formData.category} />
              )}
              {!formData.isAvailable && <span className="cb-slip__soldout">Sold out</span>}
            </div>
            <div className="cb-snack__body">
              <p className="cb-snack__name">{formData.name}</p>
              {formData.description && <p className="cb-snack__desc">{formData.description}</p>}
              <div className="cb-snack__foot">
                <span className="cb-snack__price">₹{formData.price || "0"}</span>
                <span className="cb-btn cb-btn--pink cb-btn--sm" aria-hidden="true">
                  <Plus size={15} /> Add
                </span>
              </div>
            </div>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" hidden />
          <div className="cb-slip__photo">
            <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} aria-hidden="true" /> {imagePreview ? "Change photo" : "Upload photo"}
            </button>
            {imagePreview ? (
              <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm" onClick={removeImage}>
                <Trash2 size={14} aria-hidden="true" /> Use drawing
              </button>
            ) : (
              <button
                type="button"
                className="cb-btn cb-btn--ghost cb-btn--sm"
                aria-pressed={uploadMethod === "url"}
                onClick={() => setUploadMethod((m) => (m === "url" ? "upload" : "url"))}
              >
                <Link2 size={14} aria-hidden="true" /> Paste a link
              </button>
            )}
          </div>
          {uploadMethod === "url" && !selectedImage && (
            <input
              type="url"
              aria-label="Photo link"
              value={formData.imageUrl}
              onChange={handleImageUrlChange}
              placeholder="https://…/photo.jpg"
              className="cb-input"
            />
          )}
          {errors.image && <p className="cb-field__error">{errors.image}</p>}
          {!imagePreview && (
            <p className="cb-small" style={{ color: "var(--mist)" }}>
              No photo? The drawing is picked from the name and section.
            </p>
          )}
        </aside>
      </div>

      <footer className="cb-slip__foot">
        <button type="button" className="cb-btn cb-btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="cb-btn cb-btn--stamp" disabled={loading}>
          {loading && <span className="cb-spinner cb-spinner--sm" />}
          {loading ? (selectedImage ? "Uploading…" : "Saving…") : foodItem ? "Save changes" : "Add to menu"}
        </button>
      </footer>
    </form>
  );
};

export default FoodItemForm;
