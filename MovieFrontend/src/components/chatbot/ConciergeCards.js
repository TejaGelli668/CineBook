import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { MapPin, Lock, Check } from "lucide-react";
import { posterSrc } from "../../utils/tmdbImage";
import SnackArt, { TINT } from "../ui/SnackArt";
import { cinemaNow, parseCinemaTime } from "../../utils/cinemaTime";

const byKey = (items, key) =>
  items.reduce((acc, it) => {
    (acc[it[key]] ||= []).push(it);
    return acc;
  }, {});

const rupees = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;

// "12:04" left on a seat hold, ticking
const useCountdown = (iso) => {
  const [now, setNow] = useState(() => cinemaNow().getTime());
  useEffect(() => {
    const t = setInterval(() => setNow(cinemaNow().getTime()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, (parseCinemaTime(iso)?.getTime() ?? 0) - now);
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return { left, label: `${m}:${String(s).padStart(2, "0")}` };
};

// A button that confirms a proposal; shows its state once used
const ConfirmButton = ({ proposalId, actions, label, danger }) => {
  const used = actions.isUsed(proposalId);
  const busy = actions.confirming === proposalId;
  if (used) {
    return (
      <p className="cb-cc__done">
        <Check size={14} aria-hidden="true" /> {used === "done" ? "Done" : "Not done, ask again"}
      </p>
    );
  }
  return (
    <button
      type="button"
      className={`cb-btn cb-btn--sm ${danger ? "cb-btn--stamp" : "cb-btn--pink"} cb-cc__confirm`}
      onClick={() => actions.confirm(proposalId)}
      disabled={busy || !!actions.confirming}
    >
      {busy ? "Working…" : actions.signedIn ? label : "Sign in to continue"}
    </button>
  );
};

const HeldCard = ({ card, actions }) => {
  const { left, label } = useCountdown(card.expiresAt);
  return (
    <div className="cb-cc-held" data-expired={left === 0 || undefined}>
      <p className="cb-cc-held__top">
        <Lock size={14} aria-hidden="true" />
        {left > 0 ? `Held for ${label}` : "Hold expired"}
      </p>
      <p className="cb-cc-held__film">{card.film}</p>
      <p>
        {card.when}, {card.theater}
      </p>
      <p className="cb-cc-held__seats">Seats {card.seats.join(", ")}</p>
      {left > 0 && (
        <div className="cb-cc__row">
          <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm" onClick={() => actions.ask("What snacks can I add?")}>
            Add snacks
          </button>
          <button type="button" className="cb-btn cb-btn--pink cb-btn--sm" onClick={() => actions.ask("Review my order")}>
            Review and pay
          </button>
        </div>
      )}
    </div>
  );
};

const CheckoutCard = ({ card, actions }) => {
  const { left, label } = useCountdown(card.holdExpires);
  return (
    <div className="cb-cc-order">
      <p className="cb-cc-order__film">{card.movie.title}</p>
      <p className="cb-cc-order__meta">
        {card.when}, {card.theater.name}
      </p>
      <dl>
        <div>
          <dt>Seats {card.seats.join(", ")}</dt>
          <dd>{rupees(card.ticketTotal)}</dd>
        </div>
        {card.food.map((f) => (
          <div key={f.id}>
            <dt>
              {f.name} × {f.quantity}
            </dt>
            <dd>{rupees(f.price * f.quantity)}</dd>
          </div>
        ))}
        <div>
          <dt>Convenience fee</dt>
          <dd>{rupees(card.fee)}</dd>
        </div>
        <div className="cb-cc-order__total">
          <dt>Total</dt>
          <dd>{rupees(card.total)}</dd>
        </div>
      </dl>
      {left > 0 ? (
        <>
          <button type="button" className="cb-btn cb-btn--stamp cb-btn--block" onClick={() => actions.pay(card)}>
            Pay {rupees(card.total)}
          </button>
          <p className="cb-cc__hint">Seats held for {label}. You'll enter your card on the secure Stripe page.</p>
        </>
      ) : (
        <p className="cb-cc__hint">The hold has expired. Ask me to find seats again.</p>
      )}
    </div>
  );
};

const TicketCard = ({ card }) => {
  const [qr, setQr] = useState("");
  useEffect(() => {
    const data = JSON.stringify({
      bookingId: card.bookingId,
      movie: card.film,
      theater: card.theater,
      date: card.date,
      time: card.time,
      seats: card.seats,
      total: card.total,
    });
    QRCode.toDataURL(data, { margin: 1, width: 200, color: { dark: "#2a1630", light: "#fff6e9" } })
      .then(setQr)
      .catch(() => {});
  }, [card]);
  return (
    <article className="cb-cc-ticket">
      <div className="cb-cc-ticket__main">
        <p className="cb-cc-ticket__admit">Admit {card.seats ? card.seats.split(",").length : ""}</p>
        <p className="cb-cc-ticket__film">{card.film}</p>
        <p>{card.when}</p>
        <p>
          {card.theater}
          {card.area && `, ${card.area}`}
        </p>
        <p className="cb-cc-ticket__seats">{card.seats ? `Seats ${card.seats}` : "Seats on the booking"}</p>
        <p className="cb-cc-ticket__id">{card.bookingId}</p>
      </div>
      <div className="cb-cc-ticket__stub">{qr ? <img src={qr} alt={`QR code for booking ${card.bookingId}`} /> : null}</div>
    </article>
  );
};

const SeatMap = ({ rows }) => (
  <div className="cb-cc-map" aria-hidden="true">
    <span className="cb-cc-map__screen">Screen</span>
    {rows.map((r) => (
      <div key={r.row} className="cb-cc-map__row">
        <span>{r.row}</span>
        <div>
          {r.seats.split("").map((s, i) => (
            <i key={i} data-s={s} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const Card = ({ card, actions }) => {
  switch (card.type) {
    case "films":
      return (
        <ul className="cb-cc-films">
          {card.items.map((f) => (
            <li key={f.id}>
              <button type="button" className="cb-cc-films__poster" onClick={() => actions.openFilm(f)} title={`Open ${f.title}`}>
                {posterSrc(f) ? <img src={posterSrc(f)} alt="" loading="lazy" /> : <span>{f.title[0]}</span>}
              </button>
              <p className="cb-cc-films__title">{f.title}</p>
              <p className="cb-cc-films__meta">
                {[f.language, f.certificate].filter(Boolean).join(", ")}
                {f.rating ? ` ★ ${f.rating}` : ""}
              </p>
              <button type="button" className="cb-cc-films__times" onClick={() => actions.ask(`Showtimes for ${f.title}`)}>
                Showtimes
              </button>
            </li>
          ))}
        </ul>
      );

    case "showtimes": {
      const multiFilm = new Set(card.items.map((x) => x.movie.id)).size > 1;
      return (
        <div className="cb-cc-times">
          {Object.entries(byKey(card.items, "day")).map(([day, shows]) => (
            <div key={day} className="cb-cc-times__day">
              <p className="cb-cc-times__date">{day}</p>
              {Object.entries(byKey(shows, "theater")).map(([theater, list]) => (
                <div key={theater} className="cb-cc-times__hall">
                  <p className="cb-cc-times__hallname">
                    {theater}
                    {list[0].area && <span> {list[0].area}</span>}
                  </p>
                  <div className="cb-cc-times__row">
                    {list.map((s) => (
                      <button
                        key={s.showId}
                        type="button"
                        onClick={() => actions.openShow(s)}
                        title={`${s.movie.title}, pick seats`}
                        data-low={s.seatsLeft > 0 && s.seatsLeft < 25 ? "true" : undefined}
                        disabled={s.seatsLeft === 0}
                      >
                        <strong>{s.time}</strong>
                        <span>
                          {multiFilm ? `${s.movie.title}, ` : ""}from ₹{s.price}
                        </span>
                        <em>{s.seatsLeft === 0 ? "Full" : s.seatsLeft < 25 ? `${s.seatsLeft} left` : "Seats free"}</em>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <p className="cb-cc__hint">Tap a time to open the seat map, or tell me how many seats.</p>
        </div>
      );
    }

    case "seatpick":
      return (
        <div className="cb-cc-pick">
          <p className="cb-cc-pick__head">
            <strong>{card.movie.title}</strong> {card.when}, {card.theater}
          </p>
          <SeatMap rows={card.rows} />
          <p className="cb-cc-pick__seats">
            <span>
              {card.seats.join(", ")}
              {card.category && <em> {card.category}</em>}
            </span>
            <strong>{rupees(card.total)}</strong>
          </p>
          <ConfirmButton proposalId={card.proposalId} actions={actions} label="Hold these seats" />
        </div>
      );

    case "held":
      return <HeldCard card={card} actions={actions} />;

    case "basket":
      return card.items.length ? (
        <ul className="cb-cc-basket">
          {card.items.map((f) => (
            <li key={f.id}>
              <span className="cb-cc-basket__art" data-tint={TINT[f.category] || "gold"}>
                <SnackArt name={f.name} category={f.category} />
              </span>
              <span>
                {f.name} × {f.quantity}
              </span>
              <strong>{rupees(f.price * f.quantity)}</strong>
            </li>
          ))}
        </ul>
      ) : null;

    case "checkout":
      return <CheckoutCard card={card} actions={actions} />;

    case "cancel":
      return (
        <div className="cb-cc-cancel">
          <p className="cb-cc-cancel__film">{card.film}</p>
          <p>
            {card.when}, {card.theater}
            {card.seats && `, seats ${card.seats}`}
          </p>
          <p className="cb-cc-cancel__refund">
            Refund {rupees(card.refund)} <span>({card.percent}% of {rupees(card.paid)})</span>
          </p>
          <ConfirmButton proposalId={card.proposalId} actions={actions} label="Cancel booking" danger />
          <p className="cb-cc__hint">Nothing changes unless you tap the button.</p>
        </div>
      );

    case "cancelled":
      return (
        <p className="cb-cc-note">
          <Check size={15} aria-hidden="true" /> {card.bookingId} cancelled. {rupees(card.refund)} refunded to your card.
        </p>
      );

    case "ticket":
      return <TicketCard card={card} />;

    case "theaters":
      return (
        <ul className="cb-cc-halls">
          {card.items.map((t) => (
            <li key={t.name}>
              <p className="cb-cc-halls__name">{t.name}</p>
              <p className="cb-cc-halls__where">
                <MapPin size={13} aria-hidden="true" /> {t.address || t.area}
              </p>
              {t.facilities?.length > 0 && <p className="cb-cc-halls__fac">{t.facilities.join(", ")}</p>}
            </li>
          ))}
        </ul>
      );

    case "menu":
      return (
        <ul className="cb-cc-menu">
          {card.items.map((f) => (
            <li key={f.name}>
              <span>{f.name}</span>
              <span className="cb-cc-menu__dots" aria-hidden="true" />
              <strong>₹{Math.round(f.price)}</strong>
            </li>
          ))}
        </ul>
      );

    case "bookings":
      return (
        <div className="cb-cc-stubs">
          {card.items.map((b) => (
            <article key={b.bookingId} className="cb-cc-stub" data-status={b.status}>
              <p className="cb-cc-stub__film">{b.film}</p>
              <p>{b.when}</p>
              <p>
                {b.theater}
                {b.seats && `, seats ${b.seats}`}
              </p>
              <p className="cb-cc-stub__foot">
                <span>
                  ₹{b.total} <small>{b.bookingId}</small>
                </span>
                <span className="cb-cc-stub__stamp">
                  {b.status === "CANCELLED" ? "Cancelled" : b.upcoming ? "Upcoming" : "Watched"}
                </span>
              </p>
            </article>
          ))}
          <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm" onClick={actions.bookings}>
            Open my bookings
          </button>
        </div>
      );

    case "signin":
      return (
        <button type="button" className="cb-btn cb-btn--pink cb-btn--sm cb-cc__signin" onClick={actions.login}>
          Sign in to continue
        </button>
      );

    // ─── Manager's assistant ───────────────────────────────────────────
    case "occupancy":
      return (
        <div className="cb-cc-table">
          <p className="cb-cc-table__cap">{card.day}</p>
          <table>
            <thead>
              <tr>
                <th>Show</th>
                <th>Sold</th>
                <th aria-label="Percent full">%</th>
              </tr>
            </thead>
            <tbody>
              {card.rows.map((r, i) => (
                <tr key={i} data-started={r.started || undefined}>
                  <td>
                    <strong>{r.time}</strong> {r.film}
                    <small>{r.theater}</small>
                  </td>
                  <td>
                    {r.booked}/{r.seats}
                    {r.held > 0 && <small>{r.held} held</small>}
                  </td>
                  <td>
                    <span className="cb-cc-bar" style={{ "--p": `${r.percent}%` }} data-low={r.percent < 20 || undefined}>
                      {r.percent}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "sales":
      return (
        <div className="cb-cc-sales">
          <p className="cb-cc-table__cap">{card.period}</p>
          <div className="cb-cc-sales__nums">
            <p>
              <strong>{rupees(card.total)}</strong>collected
            </p>
            <p>
              <strong>{card.bookings}</strong>bookings
            </p>
            <p>
              <strong>{rupees(card.canteen)}</strong>canteen
            </p>
            <p>
              <strong>{card.cancelled}</strong>cancelled
            </p>
          </div>
          {card.films?.length > 0 && (
            <ul className="cb-cc-menu">
              {card.films.map((f) => (
                <li key={f.title}>
                  <span>{f.title}</span>
                  <span className="cb-cc-menu__dots" aria-hidden="true" />
                  <strong>{rupees(f.revenue)}</strong>
                </li>
              ))}
            </ul>
          )}
          {card.snacks?.length > 0 && (
            <ul className="cb-cc-menu">
              {card.snacks.map((s) => (
                <li key={s.name}>
                  <span>
                    {s.name} × {s.quantity}
                  </span>
                  <span className="cb-cc-menu__dots" aria-hidden="true" />
                  <strong>{rupees(s.revenue)}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    case "tmdb":
      return (
        <ul className="cb-cc-films">
          {card.items.map((f) => (
            <li key={f.tmdbId}>
              <span className="cb-cc-films__poster">
                {f.posterUrl ? <img src={f.posterUrl} alt="" loading="lazy" /> : <span>{f.title[0]}</span>}
              </span>
              <p className="cb-cc-films__title">{f.title}</p>
              <p className="cb-cc-films__meta">{[f.year, f.language].filter(Boolean).join(", ")}</p>
              {f.imported ? (
                <p className="cb-cc-films__meta">In catalogue</p>
              ) : (
                <button type="button" className="cb-cc-films__times" onClick={() => actions.ask(`Import ${f.title} (${f.tmdbId})`)}>
                  Import
                </button>
              )}
            </li>
          ))}
        </ul>
      );

    case "proposal":
      return (
        <div className="cb-cc-prop">
          <p className="cb-cc-prop__action">{card.action}</p>
          <div className="cb-cc-prop__body">
            {card.posterUrl && <img src={posterSrc({ posterUrl: card.posterUrl })} alt="" />}
            <div>
              <p className="cb-cc-prop__title">{card.title}</p>
              {card.lines?.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          </div>
          <ConfirmButton proposalId={card.proposalId} actions={actions} label={card.confirmLabel || "Confirm"} />
        </div>
      );

    case "done":
      return (
        <p className="cb-cc-note">
          <Check size={15} aria-hidden="true" /> <strong>{card.title}.</strong> {card.detail}
        </p>
      );

    default:
      return null;
  }
};

export default Card;
