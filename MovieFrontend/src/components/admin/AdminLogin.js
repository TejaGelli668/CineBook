import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { validateAdminLogin } from "../../utils/auth";
import "../auth/boxoffice.css";

// Staff sign-in, reached only at /admin. Customers never see a link to it.
const AdminLogin = ({ onAdminLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const username = form.elements.namedItem("staff-username").value;
    const password = form.elements.namedItem("staff-password").value;
    try {
      const result = await validateAdminLogin(username, password);
      if (result.success) {
        onAdminLogin?.();
      } else {
        setError(result.message || "That username and password didn't match.");
      }
    } catch {
      setError("Sign-in failed. Check the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cb-boxoffice cb-boxoffice--staff" role="main">
      <div className="cb-boxoffice__shade" />
      <div className="cb-ticketform">
        <div className="cb-ticketform__main">
          <div className="cb-ticketform__head">
            <span className="cb-ticketform__brand">CineBook</span>
            <span lang="te">సిబ్బంది ప్రవేశం</span>
          </div>
          <h1 className="cb-ticketform__title" style={{ marginTop: 22 }}>
            Staff entrance
          </h1>
          <p className="cb-ticketform__lede">
            The manager's desk: films, shows, theaters and the canteen.
          </p>

          {error && (
            <p className="cb-ticketform__msg cb-ticketform__msg--error" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="cb-ticketform__form">
            <div className="cb-ink-field">
              <label htmlFor="staff-username">Username</label>
              <div className="cb-ink-field__line">
                <input id="staff-username" name="staff-username" type="text" autoComplete="username" required disabled={loading} autoFocus />
              </div>
            </div>
            <div className="cb-ink-field">
              <label htmlFor="staff-password">Password</label>
              <div className="cb-ink-field__line">
                <input
                  id="staff-password"
                  name="staff-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="cb-ink-field__eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="cb-btn cb-btn--stamp cb-btn--block cb-btn--lg">
              {loading ? "Checking…" : "Open the manager's desk"}
            </button>
            <p className="cb-ticketform__switch">
              Not staff? <a href="/">Go to CineBook</a>
            </p>
          </form>
        </div>
        <div className="cb-ticketform__stub" aria-hidden="true">
          <span className="cb-ticketform__admit">Staff only</span>
          <span className="cb-ticketform__city">Hyderabad</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
