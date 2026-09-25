import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { loginUser, registerUser } from "../../utils/auth";
import { getMovies } from "../../utils/movieAPI";
import "./boxoffice.css";

const LoginModal = ({ isOpen, onClose, onUserLogin }) => {
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [posters, setPosters] = useState([]); // now-showing posters for the wall behind

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    getMovies().then((movies) => {
      const urls = movies
        .filter((m) => m.posterUrl)
        .map((m) => `http://localhost:8080${m.posterUrl}`);
      if (alive) setPosters(urls);
    });
    const onKey = (e) => e.key === "Escape" && !loading && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, loading, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setLoading(false);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from(
    { length: 101 },
    (_, i) => new Date().getFullYear() - i
  );

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = form.elements.namedItem("signin-email").value;
    const password = form.elements.namedItem("signin-password").value;

    try {
      const result = await loginUser(email, password);

      if (result.success) {
        // Verify token was stored
        const storedToken = localStorage.getItem("userToken");

        if (!storedToken || storedToken === "undefined") {
          throw new Error("Authentication token not received");
        }

        onUserLogin?.();
        onClose();
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const userData = {
      email: formData.get("signup-email"),
      password: formData.get("signup-password"),
      firstName: formData.get("first-name"),
      lastName: formData.get("last-name"),
      birthday: {
        month: formData.get("birth-month"),
        day: formData.get("birth-day"),
        year: formData.get("birth-year"),
      },
    };

    try {
      const result = await registerUser(userData);

      if (result.success) {
        setActiveTab("signin");
        setNotice("Account created. Sign in with your email and password.");
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: "signin", label: "Sign in" },
    { id: "signup", label: "New here" },
  ];
  const copy = {
    signin: ["Welcome back", "Sign in to hold seats and find your tickets."],
    signup: ["Get your ticket", "One minute, and every booking lives in one place."],
  }[activeTab];
  const stubLabel = { signin: "Admit one", signup: "New member" }[activeTab];

  // Three drifting columns of posters, each list doubled so the loop is seamless
  const columns = posters.length
    ? [0, 1, 2, 3].map((c) => {
        const col = posters.map((_, i) => posters[(i * 3 + c * 2) % posters.length]);
        return [...col, ...col];
      })
    : [];

  const passwordToggle = (
    <button
      type="button"
      className="cb-ink-field__eye"
      onClick={() => setShowPassword((v) => !v)}
      disabled={loading}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );

  const inkField = (id, label, props, extra) => (
    <div className="cb-ink-field">
      <label htmlFor={id}>{label}</label>
      <div className="cb-ink-field__line">
        <input id={id} name={id} disabled={loading} {...props} />
        {extra}
      </div>
    </div>
  );

  return (
    <div className="cb-boxoffice" role="dialog" aria-modal="true" aria-labelledby="cb-login-title">
      <div className="cb-boxoffice__wall" aria-hidden="true">
        {columns.map((col, i) => (
          <div key={i} className="cb-boxoffice__col" style={{ "--speed": `${70 + i * 18}s`, "--dir": i % 2 ? "reverse" : "normal" }}>
            {col.map((src, j) => (
              <img key={j} src={src} alt="" />
            ))}
          </div>
        ))}
      </div>
      <div className="cb-boxoffice__shade" onMouseDown={() => !loading && onClose()} />

      <button
        type="button"
        className="cb-iconbtn cb-boxoffice__close"
        onClick={onClose}
        disabled={loading}
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <div className="cb-ticketform">
        <div className="cb-ticketform__main">
          <div className="cb-ticketform__head">
            <span className="cb-ticketform__brand">CineBook</span>
            <span lang="te">బాక్స్ ఆఫీస్</span>
          </div>

          <div className="cb-ticketform__tabs" role="tablist" aria-label="Account type">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => {
                  setNotice("");
                  setActiveTab(tab.id);
                }}
                disabled={loading}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <h2 id="cb-login-title" className="cb-ticketform__title">
            {copy[0]}
          </h2>
          <p className="cb-ticketform__lede">{copy[1]}</p>

          {error && (
            <p className="cb-ticketform__msg cb-ticketform__msg--error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="cb-ticketform__msg" role="status">
              {notice}
            </p>
          )}

          {activeTab === "signin" && (
            <form onSubmit={handleSignIn} className="cb-ticketform__form">
              {inkField("signin-email", "Email", {
                type: "email",
                autoComplete: "email",
                placeholder: "you@example.com",
                required: true,
              })}
              {inkField(
                "signin-password",
                "Password",
                { type: showPassword ? "text" : "password", autoComplete: "current-password", required: true },
                passwordToggle
              )}
              <button type="submit" disabled={loading} className="cb-btn cb-btn--stamp cb-btn--block cb-btn--lg">
                {loading ? "Checking…" : "Sign in"}
              </button>
              <p className="cb-ticketform__switch">
                First time here?{" "}
                <button type="button" onClick={() => setActiveTab("signup")} disabled={loading}>
                  Create an account
                </button>
              </p>
            </form>
          )}

          {activeTab === "signup" && (
            <form onSubmit={handleSignUp} className="cb-ticketform__form">
              <div className="cb-ticketform__row">
                {inkField("first-name", "First name", { type: "text", autoComplete: "given-name", required: true })}
                {inkField("last-name", "Last name", { type: "text", autoComplete: "family-name", required: true })}
              </div>
              {inkField("signup-email", "Email", {
                type: "email",
                autoComplete: "email",
                placeholder: "you@example.com",
                required: true,
              })}
              {inkField(
                "signup-password",
                "Password (6 or more characters)",
                { type: showPassword ? "text" : "password", autoComplete: "new-password", minLength: 6, required: true },
                passwordToggle
              )}
              <fieldset className="cb-ink-field">
                <legend>Birthday (optional)</legend>
                <div className="cb-ticketform__dob">
                  <select name="birth-day" disabled={loading} aria-label="Day">
                    <option value="">Day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select name="birth-month" disabled={loading} aria-label="Month">
                    <option value="">Month</option>
                    {months.map((m, index) => (
                      <option key={m} value={index + 1}>{m}</option>
                    ))}
                  </select>
                  <select name="birth-year" disabled={loading} aria-label="Year">
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </fieldset>
              <button type="submit" disabled={loading} className="cb-btn cb-btn--stamp cb-btn--block cb-btn--lg">
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

        </div>

        <div className="cb-ticketform__stub" aria-hidden="true">
          <span className="cb-ticketform__admit">{stubLabel}</span>
          <span className="cb-ticketform__serial">No. {String(Date.now()).slice(-8)}</span>
          <span className="cb-ticketform__city">Hyderabad</span>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
