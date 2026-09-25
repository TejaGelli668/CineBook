import { API_URL, assetUrl } from "./config";

test("image paths on the backend become full URLs", () => {
  expect(assetUrl("/uploads/food-images/a.png")).toBe(`${API_URL}/uploads/food-images/a.png`);
  expect(assetUrl("uploads/x.jpg")).toBe(`${API_URL}/uploads/x.jpg`);
});

test("full image URLs (TMDB, Supabase Storage) are left alone", () => {
  const tmdb = "https://image.tmdb.org/t/p/w500/abc.jpg";
  expect(assetUrl(tmdb)).toBe(tmdb);
  expect(assetUrl("data:image/png;base64,xyz")).toBe("data:image/png;base64,xyz");
});

test("missing images stay missing", () => {
  expect(assetUrl(null)).toBeNull();
  expect(assetUrl("")).toBeNull();
});
