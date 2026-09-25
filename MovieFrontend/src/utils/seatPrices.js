// What seats cost at each theater (the category prices checkout charges),
// fetched once per page load: { [theaterId]: { from, to, categories: [{ name, price, rows }] } }
let request = null;

export const getSeatPrices = () => {
  if (!request) {
    request = fetch("http://localhost:8080/api/theaters/seat-prices")
      .then((r) => (r.ok ? r.json() : { data: {} }))
      .then((d) => d.data || {})
      .catch(() => {
        request = null; // try again next time
        return {};
      });
  }
  return request;
};

// Cheapest seat at a theater, or across all theaters when no id is given
export const fromPrice = (prices, theaterId) => {
  if (theaterId != null) return prices[theaterId]?.from ?? null;
  const all = Object.values(prices).map((p) => p.from);
  return all.length ? Math.min(...all) : null;
};
