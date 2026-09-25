import { cinemaNow, cinemaToday, parseCinemaTime, isoDate } from "./cinemaTime";

// Show times come from the server as Hyderabad wall-clock values with a
// misleading "Z"; they must never be shifted by the visitor's time zone.
test("reads server times as Hyderabad wall-clock time", () => {
  const d = parseCinemaTime("2026-09-26T18:45:00.000Z");
  expect([d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 9, 26, 18, 45]);
});

test("reads seat hold expiry times with seconds and fractions", () => {
  const d = parseCinemaTime("2026-09-26T05:05:47.123456");
  expect([d.getHours(), d.getMinutes(), d.getSeconds()]).toEqual([5, 5, 47]);
});

test("returns null for missing or unreadable times", () => {
  expect(parseCinemaTime(null)).toBeNull();
  expect(parseCinemaTime("tomorrow")).toBeNull();
});

test("now and today are Hyderabad's, whatever the device's zone", () => {
  const expected = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  expect(cinemaToday()).toBe(expected);
  expect(isoDate(cinemaNow())).toBe(expected);
});
