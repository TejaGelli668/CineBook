// Every time in CineBook is Hyderabad time: show times, seat holds, "today".
// The server sends them without a real time zone ("2026-09-26T18:45:00.000Z"
// means 6:45 PM in Hyderabad, not UTC), and visitors' devices may be set to
// any zone. So times are handled as Hyderabad wall-clock values, and "now" is
// the current wall-clock time in Hyderabad, whatever the device's zone.

export const CINEMA_TIME_ZONE = "Asia/Kolkata";

const clock = new Intl.DateTimeFormat("en-CA", {
  timeZone: CINEMA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** Hyderabad's current date and time, as a Date whose local fields read Hyderabad time. */
export const cinemaNow = () => {
  const parts = Object.fromEntries(clock.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return new Date(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
};

/** Today in Hyderabad as YYYY-MM-DD. */
export const cinemaToday = () => isoDate(cinemaNow());

/** A server time ("2026-09-26T18:45:00.000Z" or "2026-09-26T18:45:12.5") as Hyderabad wall-clock time. */
export const parseCinemaTime = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(String(value || ""));
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)) : null;
};

/** YYYY-MM-DD for a wall-clock Date. */
export const isoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
