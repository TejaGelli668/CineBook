// Shared page chrome for the CineBook design system (see src/theme/cinebook.css)
import React from "react";
import {
  ChevronLeft,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lock,
} from "lucide-react";
import { tmdbSize, posterSrc } from "../../utils/tmdbImage";

export const Logo = ({ onClick, className = "" }) => (
  <button
    type="button"
    className={`cb-logo ${className}`}
    onClick={onClick}
    aria-label="CineBook home"
  >
    Cine<span>Book</span>
  </button>
);

// Sticky bar for inner pages: back, title/subtitle, optional right-hand slot
export const TopBar = ({ onBack, backLabel = "Back", title, sub, children }) => (
  <header className="cb-topbar">
    {onBack && (
      <button
        type="button"
        className="cb-iconbtn"
        onClick={onBack}
        aria-label={backLabel}
        title={backLabel}
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
    )}
    <div className="cb-topbar__titles">
      {title && <h1 className="cb-topbar__title">{title}</h1>}
      {sub && <p className="cb-topbar__sub">{sub}</p>}
    </div>
    {children && <div className="cb-topbar__end">{children}</div>}
  </header>
);

const STEPS = ["Showtime", "Seats", "Snacks", "Payment", "Ticket"];

// Booking progress; `current` is one of STEPS
export const BookingSteps = ({ current }) => {
  const at = STEPS.indexOf(current);
  return (
    <ol className="cb-steps" aria-label="Booking progress">
      {STEPS.map((step, i) => (
        <li
          key={step}
          data-state={i < at ? "done" : i === at ? "current" : "upcoming"}
          aria-current={i === at ? "step" : undefined}
        >
          <span className="cb-steps__n">{i + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  );
};

const ALERT_ICONS = {
  error: AlertCircle,
  warn: AlertTriangle,
  ok: CheckCircle2,
  info: Info,
};

export const Alert = ({ tone = "info", title, children, className = "" }) => {
  const Icon = ALERT_ICONS[tone];
  return (
    <div
      className={`cb-alert cb-alert--${tone} ${className}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon size={18} aria-hidden="true" />
      <div>
        {title && <strong>{title}</strong>}
        {children}
      </div>
    </div>
  );
};

export const Loading = ({ label = "Loading", page = false }) => (
  <div
    className={`cb-loading ${page ? "cb-loading--page" : ""}`}
    role="status"
  >
    <div>
      <div className="cb-spinner" style={{ margin: "0 auto 14px" }} />
      <p>{label}</p>
    </div>
  </div>
);

// Countdown for held seats, e.g. "7:42" — turns red in the last two minutes
export const HoldTimer = ({ time }) => {
  if (!time) return null;
  const expired = time === "Expired";
  const [m] = String(time).split(":").map(Number);
  const urgent = expired || (Number.isFinite(m) && m < 2);
  return (
    <span className="cb-hold" data-urgent={urgent} role="timer">
      <Lock size={14} aria-hidden="true" />
      {expired ? "Seat hold expired" : `Seats held for ${time}`}
    </span>
  );
};

// The chosen film's own imagery, blurred and dimmed, behind a booking screen.
// Place inside a `.cb-app--film` page. The blur hides detail, so a small
// 300px image is enough; the poster (already cached) shows while it loads.
export const FilmBackdrop = ({ movie }) => {
  const poster = posterSrc(movie);
  const backdrop = tmdbSize(movie?.backdropUrl, "w300");
  if (!poster && !backdrop) return null;
  return (
    <div className="cb-backdrop" aria-hidden="true">
      {poster && <img src={poster} alt="" decoding="async" />}
      {backdrop && (
        <img
          src={backdrop}
          alt=""
          decoding="async"
          fetchpriority="high"
          className="cb-backdrop__film"
          onLoad={(e) => e.currentTarget.setAttribute("data-ready", "true")}
        />
      )}
    </div>
  );
};
