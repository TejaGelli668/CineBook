package com.example.adminbackend.agent;

import com.example.adminbackend.dto.BookingRequest;
import com.example.adminbackend.dto.SeatLockRequest;
import com.example.adminbackend.dto.SeatLockResponse;
import com.example.adminbackend.dto.SeatUnlockRequest;
import com.example.adminbackend.entity.Booking;
import com.example.adminbackend.entity.FoodItem;
import com.example.adminbackend.entity.Movie;
import com.example.adminbackend.entity.Seat;
import com.example.adminbackend.entity.SeatStatus;
import com.example.adminbackend.entity.Show;
import com.example.adminbackend.entity.ShowSeat;
import com.example.adminbackend.entity.Theater;
import com.example.adminbackend.entity.User;
import com.example.adminbackend.repository.BookingRepository;
import com.example.adminbackend.repository.FoodItemRepository;
import com.example.adminbackend.repository.MovieRepository;
import com.example.adminbackend.repository.SeatRepository;
import com.example.adminbackend.repository.ShowRepository;
import com.example.adminbackend.repository.ShowSeatRepository;
import com.example.adminbackend.repository.TheaterRepository;
import com.example.adminbackend.repository.UserRepository;
import com.example.adminbackend.service.CancellationService;
import com.example.adminbackend.service.PricingService;
import com.example.adminbackend.service.SeatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * The customer concierge: finds films and shows, picks seats, builds the order
 * and hands it to checkout. Holding seats and cancelling are proposals that
 * only run when the customer taps Confirm; payment always happens on the
 * Stripe page, never in the chat.
 */
@Service
public class ConciergeTools implements AgentProfile {

    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("EEE d MMM", Locale.ENGLISH);
    private static final DateTimeFormatter NOW = DateTimeFormatter.ofPattern("EEEE d MMMM yyyy, h:mm a", Locale.ENGLISH);
    private static final int SHOW_WINDOW_DAYS = 7;
    private static final int MAX_SEATS = 10;

    private final ObjectMapper json = new ObjectMapper();
    private final MovieRepository movies;
    private final ShowRepository shows;
    private final ShowSeatRepository showSeats;
    private final SeatRepository seats;
    private final TheaterRepository theaters;
    private final FoodItemRepository food;
    private final BookingRepository bookings;
    private final UserRepository users;
    private final SeatService seatService;
    private final PricingService pricing;
    private final CancellationService cancellations;
    private final TransactionTemplate tx;

    public ConciergeTools(MovieRepository movies, ShowRepository shows, ShowSeatRepository showSeats,
                          SeatRepository seats, TheaterRepository theaters, FoodItemRepository food,
                          BookingRepository bookings, UserRepository users, SeatService seatService,
                          PricingService pricing, CancellationService cancellations, TransactionTemplate tx) {
        this.movies = movies;
        this.shows = shows;
        this.showSeats = showSeats;
        this.seats = seats;
        this.theaters = theaters;
        this.food = food;
        this.bookings = bookings;
        this.users = users;
        this.seatService = seatService;
        this.pricing = pricing;
        this.cancellations = cancellations;
        this.tx = tx;
    }

    // ─── Instructions ────────────────────────────────────────────────────

    @Override
    public String systemPrompt(AgentContext ctx) {
        StringBuilder p = new StringBuilder("""
                You are the box office concierge for CineBook, a movie ticket site for cinemas in Hyderabad.
                Talk like a friendly, quick person at a cinema counter.

                Facts come only from your tools. Never invent films, show times, prices, seats, theaters or snacks.
                Call tools whenever the answer depends on what's playing, when, where, prices, seats or bookings.
                Chain tools when needed (for example find_films, then get_showtimes, then pick_seats).
                Resolve relative dates yourself: today, tonight (after 17:00), tomorrow, this weekend, Friday.

                The chat shows tool results as cards (posters, showtime buttons, seat maps, menus, tickets), so
                keep your text short: one to three sentences, or one short question. Don't list what the cards show.
                Write plain sentences: no markdown, asterisks, lists or headings.

                Booking, step by step:
                1. Find the show (get_showtimes). If they haven't said how many seats, ask.
                2. pick_seats finds the best seats together and shows them on a mini seat map with a
                   "Hold these seats" button. You cannot hold seats yourself; the customer taps the button.
                   Holding needs sign-in; the card handles that. A hold lasts 10 minutes.
                3. After a hold, offer snacks (add_snacks; quantity 0 removes an item), then review_order,
                   whose card has the Pay button. Payment happens on the secure Stripe page, never in chat.
                release_seats lets go of held seats if they change their mind.
                Seat prices depend on the row category (for example Executive, Club, Royal, Royal Recliner);
                row A is nearest the screen.

                Cancelling: cancel_booking shows the refund and a Confirm button; the customer confirms, not you.
                Refunds: full up to 2 hours before the show, 50% after that, none once it starts.
                show_ticket shows a booking's ticket with its QR code for entry.

                Messages starting with "[Update from CineBook" are facts from the website (for example seats
                were held), not the customer typing; use them.

                Reply in the customer's language: English, Telugu (Telugu script if they write in it), Hindi,
                or Tenglish if they mix. Keep film and theater names as they are.
                If they ask for something outside movies at CineBook, say briefly that you can only help with that.
                """);
        p.append("\nNow: ").append(LocalDateTime.now().format(NOW)).append(" (Hyderabad).");
        p.append("\nCustomer is ").append(ctx.signedIn() ? "signed in." : "a guest (not signed in).");
        AgentSession.Order order = ctx.session().order;
        if (order.hasActiveHold()) {
            p.append("\nThey currently hold seats ").append(String.join(", ", order.seats)).append(" for show ")
                    .append(order.showId).append(" until ").append(order.holdExpires.format(TIME)).append(".");
        }
        if (ctx.page() != null) {
            p.append("\nThey are on the ").append(ctx.page()).append(" page");
            if (ctx.movieTitle() != null) p.append(", looking at the film \"").append(ctx.movieTitle()).append("\"");
            p.append(". Use this when they say 'this film' or 'here'.");
        }
        return p.toString();
    }

    @Override
    public ArrayNode declarations() {
        ArrayNode list = json.createArrayNode();
        declare(list, "find_films",
                "Films playing at CineBook cinemas in Hyderabad. Use for recommendations and questions about what's on.",
                str("query", "Words from the title, cast, director or story, e.g. 'Nani' or 'crime'"),
                str("language", "Language such as Telugu, Hindi, Tamil, English"),
                str("genre", "Genre such as Action, Comedy, Drama, Thriller"),
                str("date", "Only films with shows on this date, YYYY-MM-DD"));
        declare(list, "get_showtimes",
                "Upcoming shows (next 7 days) with seat prices and seats left. Started shows are never returned.",
                str("film", "Film title or part of it"),
                str("date", "YYYY-MM-DD"),
                str("theater", "Theater name or area, e.g. 'Hitec' or 'Madhapur'"),
                str("after", "Earliest start time, 24h HH:mm"),
                str("before", "Latest start time, 24h HH:mm"));
        declare(list, "pick_seats",
                "Finds the best free seats together for a show and offers them on a seat map card with a Hold button.",
                num("show_id", "Show id from get_showtimes"),
                num("count", "How many seats, 1 to 10"),
                str("preference", "middle (default), back, front, cheapest, recliner, or wheelchair"));
        declare(list, "add_snacks",
                "Adds snacks to the order, or changes quantities (0 removes). Names are matched to the canteen menu.",
                items());
        declare(list, "review_order",
                "The order so far (held seats, snacks, prices) with the Pay button that opens secure checkout.");
        declare(list, "release_seats",
                "Lets go of the seats the customer is holding.");
        declare(list, "theater_info",
                "Theaters: address, area, screens and facilities (parking, recliners, Dolby Atmos...).",
                str("theater", "Theater name or area; leave empty for all"));
        declare(list, "canteen_menu",
                "Snacks and drinks sold at the counter, with prices.",
                str("theater", "Theater name or area, to include items only sold there"));
        declare(list, "my_bookings",
                "The signed-in customer's own bookings (recent first), with booking ids. Returns signed_in=false for guests.");
        declare(list, "cancel_booking",
                "Offers to cancel one of the customer's bookings, showing the refund. The customer must confirm on the card.",
                str("booking_id", "Booking id such as BK1790367135686, from my_bookings"));
        declare(list, "show_ticket",
                "Shows a booking's ticket with the QR code for entry. Leave booking_id empty for their next upcoming show.",
                str("booking_id", "Booking id such as BK1790367135686"));
        return list;
    }

    @Override
    public String progressLabel(String tool) {
        return switch (tool) {
            case "find_films" -> "Browsing what's playing";
            case "get_showtimes" -> "Checking showtimes and seats";
            case "pick_seats" -> "Finding the best seats together";
            case "add_snacks" -> "Adding to your order";
            case "review_order" -> "Totting up your order";
            case "release_seats" -> "Releasing your seats";
            case "theater_info" -> "Looking up the theater";
            case "canteen_menu" -> "Reading the canteen menu";
            case "my_bookings" -> "Opening your bookings";
            case "cancel_booking" -> "Working out your refund";
            case "show_ticket" -> "Fetching your ticket";
            default -> "Working on it";
        };
    }

    @Override
    public List<String> suggestions(List<String> used, AgentContext ctx) {
        String last = used.isEmpty() ? "" : used.get(used.size() - 1);
        return switch (last) {
            case "find_films" -> List.of("Showtimes tonight", "Anything in Telugu?", "Something for kids");
            case "get_showtimes" -> List.of("2 seats for the first show", "Later shows", "Which theater has parking?");
            case "pick_seats" -> List.of("Somewhere further back", "Cheaper seats", "Recliners instead");
            case "add_snacks", "canteen_menu" -> List.of("Review my order", "Add a cold coffee");
            case "review_order" -> List.of("Add popcorn", "Release my seats");
            case "my_bookings" -> List.of("Show my ticket", "How do refunds work?");
            case "cancel_booking" -> List.of("Show my bookings", "What's playing this weekend?");
            case "show_ticket" -> List.of("How do I get there?", "What snacks can I get?");
            default -> ctx.signedIn()
                    ? List.of("What's playing tonight?", "Show my ticket", "Best film this week")
                    : List.of("What's playing tonight?", "Telugu films this weekend", "Theaters near Madhapur");
        };
    }

    // ─── Tools ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ToolResult run(String name, JsonNode args, AgentContext ctx) {
        return switch (name) {
            case "find_films" -> findFilms(args);
            case "get_showtimes" -> showtimes(args);
            case "pick_seats" -> pickSeats(args, ctx);
            case "add_snacks" -> addSnacks(args, ctx);
            case "review_order" -> reviewOrder(ctx);
            case "release_seats" -> releaseSeats(ctx);
            case "theater_info" -> theaterInfo(args);
            case "canteen_menu" -> canteenMenu(args);
            case "my_bookings" -> myBookings(ctx.userId());
            case "cancel_booking" -> cancelBooking(args, ctx);
            case "show_ticket" -> showTicket(args, ctx);
            default -> new ToolResult(error("Unknown tool " + name), null);
        };
    }

    private ToolResult findFilms(JsonNode args) {
        String query = text(args, "query");
        String language = text(args, "language");
        String genre = text(args, "genre");
        LocalDate date = date(args, "date");

        List<Movie> playing = movies.findAll().stream().filter(ConciergeTools::nowShowing).collect(Collectors.toList());
        if (date != null) {
            var withShows = shows.findByShowTimeBetween(date.atStartOfDay(), date.plusDays(1).atStartOfDay())
                    .stream().map(s -> s.getMovie().getId()).collect(Collectors.toSet());
            playing.removeIf(m -> !withShows.contains(m.getId()));
        }
        List<Movie> found = playing.stream()
                .filter(m -> language == null || contains(m.getLanguage(), language))
                .filter(m -> genre == null || contains(m.getGenre(), genre))
                .filter(m -> query == null || matchesQuery(m, query))
                .sorted(Comparator.comparing((Movie m) -> m.getRating() == null ? 0 : m.getRating()).reversed())
                .limit(8)
                .collect(Collectors.toList());

        ArrayNode facts = json.createArrayNode();
        ObjectNode card = card("films");
        ArrayNode items = card.putArray("items");
        for (Movie m : found) {
            ObjectNode f = facts.addObject();
            f.put("film_id", m.getId());
            f.put("title", m.getTitle());
            f.put("language", m.getLanguage());
            f.put("genre", m.getGenre());
            f.put("certificate", m.getCertificate());
            f.put("duration", m.getDuration());
            if (m.getRating() != null) f.put("tmdb_rating", Math.round(m.getRating() * 10) / 10.0);
            f.put("story", clip(m.getDescription(), 220));
            if (m.getCast() != null) f.put("cast", String.join(", ", m.getCast().stream().limit(4).toList()));
            f.put("director", m.getDirector());
            items.add(filmCard(m));
        }
        ObjectNode out = json.createObjectNode();
        out.set("films", facts);
        if (found.isEmpty()) out.put("note", "No films playing match. " + playing.size() + " films are playing in total.");
        return new ToolResult(out, found.isEmpty() ? null : card);
    }

    private ToolResult showtimes(JsonNode args) {
        String film = text(args, "film");
        String place = text(args, "theater");
        LocalDate date = date(args, "date");
        LocalTime after = time(args, "after");
        LocalTime before = time(args, "before");
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime from = date != null ? date.atStartOfDay() : now;
        LocalDateTime to = date != null ? date.plusDays(1).atStartOfDay() : now.toLocalDate().plusDays(SHOW_WINDOW_DAYS).atStartOfDay();
        List<Show> found = shows.findByShowTimeBetween(from, to).stream()
                .filter(s -> s.getShowTime().isAfter(now))
                .filter(s -> nowShowing(s.getMovie()))
                .filter(s -> film == null || matchesTitle(s.getMovie().getTitle(), film))
                .filter(s -> place == null || contains(s.getTheater().getName(), place)
                        || contains(s.getTheater().getLocation(), place) || contains(s.getTheater().getCity(), place))
                .filter(s -> after == null || !s.getShowTime().toLocalTime().isBefore(after))
                .filter(s -> before == null || !s.getShowTime().toLocalTime().isAfter(before))
                .sorted(Comparator.comparing(Show::getShowTime))
                .limit(24)
                .collect(Collectors.toList());

        Map<Long, Long> seatsLeft = new HashMap<>();
        if (!found.isEmpty()) {
            for (Object[] row : showSeats.countAvailableSeatsForShows(found.stream().map(Show::getId).toList())) {
                seatsLeft.put((Long) row[0], (Long) row[1]);
            }
        }
        Map<Long, int[]> priceRange = new HashMap<>();

        ArrayNode facts = json.createArrayNode();
        ObjectNode card = card("showtimes");
        ArrayNode items = card.putArray("items");
        for (Show s : found) {
            long left = seatsLeft.getOrDefault(s.getId(), 0L);
            int[] range = priceRange.computeIfAbsent(s.getTheater().getId(), this::seatPriceRange);
            ObjectNode f = facts.addObject();
            f.put("show_id", s.getId());
            f.put("film", s.getMovie().getTitle());
            f.put("theater", s.getTheater().getName());
            f.put("area", s.getTheater().getLocation());
            f.put("date", s.getShowTime().toLocalDate().toString());
            f.put("day", s.getShowTime().format(DAY));
            f.put("time", s.getShowTime().format(TIME));
            f.put("seat_price_inr", range[0] == range[1] ? "" + range[0] : range[0] + " to " + range[1]);
            f.put("seats_left", left);

            ObjectNode i = items.addObject();
            i.put("showId", s.getId());
            i.set("movie", filmCard(s.getMovie()));
            i.put("theater", s.getTheater().getName());
            i.put("area", s.getTheater().getLocation());
            i.put("date", s.getShowTime().toLocalDate().toString());
            i.put("day", s.getShowTime().format(DAY));
            i.put("time", s.getShowTime().format(TIME));
            i.put("price", range[0]);
            i.put("seatsLeft", left);
        }
        ObjectNode out = json.createObjectNode();
        out.set("shows", facts);
        if (found.isEmpty()) out.put("note", "No upcoming shows match these filters in the next " + SHOW_WINDOW_DAYS + " days.");
        return new ToolResult(out, found.isEmpty() ? null : card);
    }

    /** Cheapest and dearest seat at a theater, in rupees. */
    private int[] seatPriceRange(Long theaterId) {
        List<Double> prices = seats.findByTheaterId(theaterId).stream().map(Seat::getPrice).filter(Objects::nonNull).toList();
        if (prices.isEmpty()) return new int[]{0, 0};
        return new int[]{(int) Math.round(prices.stream().min(Double::compare).get()),
                (int) Math.round(prices.stream().max(Double::compare).get())};
    }

    private ToolResult pickSeats(JsonNode args, AgentContext ctx) {
        Long showId = longArg(args, "show_id");
        int count = (int) Math.max(1, Math.min(MAX_SEATS, longArg(args, "count") == null ? 2 : longArg(args, "count")));
        String pref = text(args, "preference") == null ? "middle" : text(args, "preference").toLowerCase();
        if (showId == null) return new ToolResult(error("Which show? Get the show_id from get_showtimes first."), null);
        Show show = shows.findById(showId).orElse(null);
        if (show == null) return new ToolResult(error("That show doesn't exist."), null);
        if (!show.getShowTime().isAfter(LocalDateTime.now())) return new ToolResult(error("That show has already started."), null);

        LocalDateTime now = LocalDateTime.now();
        Long me = ctx.userId();
        List<ShowSeat> all = showSeats.findByShowId(showId);
        // rows in screen order (A nearest the screen), each sorted by position
        TreeMap<String, List<ShowSeat>> rows = new TreeMap<>();
        for (ShowSeat ss : all) {
            if (ss.getSeat() != null) rows.computeIfAbsent(ss.getSeat().getRowLetter(), k -> new ArrayList<>()).add(ss);
        }
        rows.values().forEach(r -> r.sort(Comparator.comparing(ss -> ss.getSeat().getSeatPosition())));
        List<String> rowNames = new ArrayList<>(rows.keySet());

        double idealRow = switch (pref) {
            case "back" -> rowNames.size() - 1;
            case "front" -> 0;
            default -> (rowNames.size() - 1) * 0.6;
        };

        List<ShowSeat> best = null;
        double bestScore = Double.MAX_VALUE;
        for (int r = 0; r < rowNames.size(); r++) {
            List<ShowSeat> row = rows.get(rowNames.get(r));
            String category = row.get(0).getSeat().getCategory();
            if (pref.contains("recliner") && (category == null || !category.toLowerCase().contains("recliner"))) continue;
            double rowCentre = (row.get(0).getSeat().getSeatPosition() + row.get(row.size() - 1).getSeat().getSeatPosition()) / 2.0;
            for (int i = 0; i + count <= row.size(); i++) {
                List<ShowSeat> block = row.subList(i, i + count);
                boolean ok = true;
                for (int k = 0; k < block.size(); k++) {
                    ShowSeat ss = block.get(k);
                    if (!free(ss, me, now)) { ok = false; break; }
                    if (k > 0 && ss.getSeat().getSeatPosition() != block.get(k - 1).getSeat().getSeatPosition() + 1) { ok = false; break; }
                }
                if (!ok) continue;
                if (pref.contains("wheelchair") && block.stream().noneMatch(ss -> ss.getSeat().isWheelchairAccessible())) continue;
                double centre = (block.get(0).getSeat().getSeatPosition() + block.get(block.size() - 1).getSeat().getSeatPosition()) / 2.0;
                double score = Math.abs(r - idealRow) + 0.35 * Math.abs(centre - rowCentre);
                if (pref.contains("cheap")) {
                    score = block.stream().mapToDouble(ss -> price(ss.getSeat())).sum() * 10 + score;
                }
                if (score < bestScore) {
                    bestScore = score;
                    best = new ArrayList<>(block);
                }
            }
        }

        ObjectNode out = json.createObjectNode();
        if (best == null) {
            long free = all.stream().filter(ss -> free(ss, me, now)).count();
            out.put("found", false);
            out.put("note", "No " + count + " seats together match that. " + free + " seats are free in total; try fewer seats, another preference, or another show.");
            return new ToolResult(out, null);
        }

        List<String> picked = best.stream().map(ss -> ss.getSeat().getSeatNumber()).toList();
        double each = price(best.get(0).getSeat());
        double total = best.stream().mapToDouble(ss -> price(ss.getSeat())).sum();
        ObjectNode params = json.createObjectNode();
        params.put("showId", showId);
        ArrayNode seatList = params.putArray("seats");
        picked.forEach(seatList::add);
        String proposalId = ctx.session().propose("hold", params);

        out.put("found", true);
        out.put("seats", String.join(", ", picked));
        out.put("row", best.get(0).getSeat().getRowLetter());
        out.put("category", best.get(0).getSeat().getCategory());
        out.put("price_each_inr", Math.round(each));
        out.put("tickets_total_inr", Math.round(total));
        out.put("next", "Tell the customer to tap 'Hold these seats' on the card" + (ctx.signedIn() ? "." : " (they'll be asked to sign in)."));

        ObjectNode card = card("seatpick");
        card.put("proposalId", proposalId);
        card.put("showId", showId);
        card.set("movie", filmCard(show.getMovie()));
        card.put("theater", show.getTheater().getName());
        card.put("when", show.getShowTime().format(DAY) + ", " + show.getShowTime().format(TIME));
        ArrayNode seatsNode = card.putArray("seats");
        picked.forEach(seatsNode::add);
        card.put("category", best.get(0).getSeat().getCategory());
        card.put("total", Math.round(total));
        card.put("needsSignIn", !ctx.signedIn());
        ArrayNode map = card.putArray("rows");
        for (String rn : rowNames) {
            ObjectNode rowNode = map.addObject();
            rowNode.put("row", rn);
            StringBuilder states = new StringBuilder();
            for (ShowSeat ss : rows.get(rn)) {
                states.append(picked.contains(ss.getSeat().getSeatNumber()) ? 'p' : free(ss, me, now) ? 'f' : 'x');
            }
            rowNode.put("seats", states.toString());
        }
        return new ToolResult(out, card);
    }

    private static boolean free(ShowSeat ss, Long me, LocalDateTime now) {
        if (ss.getStatus() == SeatStatus.AVAILABLE) return true;
        if (ss.getStatus() == SeatStatus.LOCKED) {
            boolean expired = ss.getExpiresAt() != null && ss.getExpiresAt().isBefore(now);
            boolean mine = me != null && ss.getLockedByUser() != null && me.equals(ss.getLockedByUser().getId());
            return expired || mine;
        }
        return false;
    }

    private static double price(Seat seat) {
        return seat.getPrice() == null ? 0 : seat.getPrice();
    }

    private ToolResult addSnacks(JsonNode args, AgentContext ctx) {
        AgentSession.Order order = ctx.session().order;
        Long theaterId = order.showId == null ? null
                : shows.findById(order.showId).map(s -> s.getTheater().getId()).orElse(null);
        List<FoodItem> menu = food.findByIsAvailableTrue().stream()
                .filter(f -> f.getTheaterId() == null || theaterId == null || f.getTheaterId().equals(theaterId))
                .toList();
        ArrayNode notFound = json.createArrayNode();
        ArrayNode changed = json.createArrayNode();
        for (JsonNode item : args.path("items")) {
            String wanted = item.path("name").asText("").trim();
            int qty = Math.max(0, Math.min(20, item.path("quantity").asInt(1)));
            FoodItem match = bestFood(menu, wanted);
            if (match == null) {
                notFound.add(wanted);
                continue;
            }
            if (qty == 0) order.food.remove(match.getId());
            else order.food.put(match.getId(), qty);
            changed.add(match.getName() + " x " + qty);
        }
        ObjectNode out = json.createObjectNode();
        out.set("updated", changed);
        if (!notFound.isEmpty()) {
            out.set("not_on_menu", notFound);
            out.put("menu", menu.stream().map(FoodItem::getName).collect(Collectors.joining(", ")));
        }
        if (!order.hasActiveHold()) out.put("note", "Snacks are saved; they need held seats before checkout.");
        return new ToolResult(out, basketCard(order));
    }

    private static FoodItem bestFood(List<FoodItem> menu, String wanted) {
        String w = wanted.toLowerCase();
        for (FoodItem f : menu) if (f.getName().equalsIgnoreCase(wanted)) return f;
        for (FoodItem f : menu) if (f.getName().toLowerCase().contains(w) || w.contains(f.getName().toLowerCase())) return f;
        for (FoodItem f : menu) {
            for (String word : w.split("[^\\p{L}]+")) {
                if (word.length() > 3 && f.getName().toLowerCase().contains(word)) return f;
            }
        }
        return null;
    }

    private ObjectNode basketCard(AgentSession.Order order) {
        ObjectNode card = card("basket");
        ArrayNode items = card.putArray("items");
        long totalFood = 0;
        for (Map.Entry<Long, Integer> e : order.food.entrySet()) {
            FoodItem f = food.findById(e.getKey()).orElse(null);
            if (f == null) continue;
            ObjectNode i = items.addObject();
            i.put("id", f.getId());
            i.put("name", f.getName());
            i.put("category", f.getCategory() == null ? null : f.getCategory().name());
            i.put("price", f.getPrice());
            i.put("quantity", e.getValue());
            totalFood += Math.round((f.getPrice() == null ? 0 : f.getPrice()) * e.getValue());
        }
        card.put("foodTotal", totalFood);
        card.put("hasHold", order.hasActiveHold());
        return card;
    }

    private ToolResult reviewOrder(AgentContext ctx) {
        AgentSession.Order order = ctx.session().order;
        ObjectNode out = json.createObjectNode();
        if (!order.hasActiveHold()) {
            out.put("ready", false);
            out.put("note", order.seats.isEmpty()
                    ? "No seats are held yet. Find a show and use pick_seats first."
                    : "The seat hold has expired. Use pick_seats again to find and hold seats.");
            return new ToolResult(out, null);
        }
        List<BookingRequest.FoodItemRequest> foodReq = new ArrayList<>();
        order.food.forEach((id, qty) -> {
            BookingRequest.FoodItemRequest f = new BookingRequest.FoodItemRequest();
            f.setFoodItemId(id);
            f.setQuantity(qty);
            foodReq.add(f);
        });
        PricingService.Quote q;
        try {
            q = pricing.quote(order.showId, order.seats, foodReq);
        } catch (PricingService.PricingException e) {
            out.put("ready", false);
            out.put("note", e.getMessage());
            return new ToolResult(out, null);
        }
        Show show = q.show;
        out.put("ready", true);
        out.put("seats", String.join(", ", order.seats));
        out.put("tickets_inr", Math.round(q.ticketTotal));
        out.put("snacks_inr", Math.round(q.foodTotal));
        out.put("fee_inr", q.fee);
        out.put("total_inr", q.total);
        out.put("hold_until", order.holdExpires.format(TIME));
        out.put("next", "The card's Pay button opens secure checkout.");

        ObjectNode card = card("checkout");
        card.put("showId", show.getId());
        card.set("movie", filmCard(show.getMovie()));
        ObjectNode theater = card.putObject("theater");
        theater.put("id", show.getTheater().getId());
        theater.put("name", show.getTheater().getName());
        theater.put("location", show.getTheater().getLocation());
        card.put("date", show.getShowTime().toLocalDate().toString());
        card.put("time", show.getShowTime().format(TIME));
        card.put("when", show.getShowTime().format(DAY) + ", " + show.getShowTime().format(TIME));
        ArrayNode seatsNode = card.putArray("seats");
        order.seats.forEach(seatsNode::add);
        ArrayNode foodNode = card.putArray("food");
        for (PricingService.FoodLine line : q.foodLines) {
            ObjectNode f = foodNode.addObject();
            f.put("id", line.item.getId());
            f.put("name", line.item.getName());
            f.put("price", line.unitPrice);
            f.put("quantity", line.quantity);
            f.put("category", line.item.getCategory() == null ? null : line.item.getCategory().name());
            f.put("imageUrl", line.item.getImageUrl());
        }
        card.put("ticketTotal", Math.round(q.ticketTotal));
        card.put("foodTotal", Math.round(q.foodTotal));
        card.put("fee", q.fee);
        card.put("total", q.total);
        card.put("holdExpires", order.holdExpires.toString());
        return new ToolResult(out, card);
    }

    private ToolResult releaseSeats(AgentContext ctx) {
        AgentSession.Order order = ctx.session().order;
        ObjectNode out = json.createObjectNode();
        if (order.seats.isEmpty()) {
            out.put("note", "No seats are held.");
            return new ToolResult(out, null);
        }
        if (ctx.signedIn()) {
            SeatUnlockRequest req = new SeatUnlockRequest();
            req.setShowId(order.showId);
            req.setSeatNumbers(new ArrayList<>(order.seats));
            seatService.unlockSeats(req);
        }
        out.put("released", String.join(", ", order.seats));
        order.clearSeats();
        return new ToolResult(out, null);
    }

    private ToolResult theaterInfo(JsonNode args) {
        String place = text(args, "theater");
        List<Theater> found = theaters.findAll().stream()
                .filter(t -> place == null || contains(t.getName(), place) || contains(t.getLocation(), place))
                .collect(Collectors.toList());
        ArrayNode facts = json.createArrayNode();
        ObjectNode card = card("theaters");
        ArrayNode items = card.putArray("items");
        for (Theater t : found) {
            ObjectNode f = facts.addObject();
            f.put("name", t.getName());
            f.put("area", t.getLocation());
            f.put("address", String.join(", ", nonBlank(t.getAddress(), t.getCity(), t.getPincode())));
            f.put("screens", t.getNumberOfScreens());
            f.put("open", t.getStatus() == null || "ACTIVE".equals(t.getStatus().name()));
            f.put("facilities", t.getFacilities() == null ? "" : String.join(", ", t.getFacilities()));
            f.put("phone", t.getPhoneNumber());

            ObjectNode i = items.addObject();
            i.put("name", t.getName());
            i.put("area", t.getLocation());
            i.put("address", String.join(", ", nonBlank(t.getAddress(), t.getCity())));
            i.put("screens", t.getNumberOfScreens());
            ArrayNode fac = i.putArray("facilities");
            if (t.getFacilities() != null) t.getFacilities().forEach(fac::add);
        }
        ObjectNode out = json.createObjectNode();
        out.set("theaters", facts);
        return new ToolResult(out, found.isEmpty() ? null : card);
    }

    private ToolResult canteenMenu(JsonNode args) {
        String place = text(args, "theater");
        List<Long> theaterIds = place == null ? List.of() : theaters.findAll().stream()
                .filter(t -> contains(t.getName(), place) || contains(t.getLocation(), place))
                .map(Theater::getId).toList();
        List<FoodItem> items = food.findByIsAvailableTrue().stream()
                .filter(f -> f.getTheaterId() == null || place == null || theaterIds.contains(f.getTheaterId()))
                .sorted(Comparator.comparing(f -> f.getCategory() == null ? "" : f.getCategory().name()))
                .collect(Collectors.toList());
        ArrayNode facts = json.createArrayNode();
        ObjectNode card = card("menu");
        ArrayNode list = card.putArray("items");
        for (FoodItem f : items) {
            ObjectNode o = facts.addObject();
            o.put("name", f.getName());
            o.put("price_inr", f.getPrice());
            o.put("section", f.getCategory() == null ? null : f.getCategory().name().toLowerCase());
            o.put("description", clip(f.getDescription(), 120));

            ObjectNode i = list.addObject();
            i.put("name", f.getName());
            i.put("price", f.getPrice());
            i.put("category", f.getCategory() == null ? null : f.getCategory().name());
            i.put("description", f.getDescription());
            i.put("imageUrl", f.getImageUrl());
        }
        ObjectNode out = json.createObjectNode();
        out.set("menu", facts);
        out.put("how_to_order", "add_snacks puts them in the order; they're collected at the counter.");
        return new ToolResult(out, items.isEmpty() ? null : card);
    }

    private ToolResult myBookings(Long userId) {
        ObjectNode out = json.createObjectNode();
        if (userId == null) {
            out.put("signed_in", false);
            return new ToolResult(out, card("signin"));
        }
        List<Booking> mine = bookings.findByUserIdWithDetails(userId).stream().limit(6).toList();
        out.put("signed_in", true);
        ArrayNode facts = out.putArray("bookings");
        ObjectNode card = card("bookings");
        ArrayNode items = card.putArray("items");
        LocalDateTime now = LocalDateTime.now();
        for (Booking b : mine) {
            Show s = b.getShow();
            String seatText = seatText(b);
            Number total = b.getGrandTotal() != null ? b.getGrandTotal() : b.getTotalAmount();
            String status = b.getStatus() == null ? "CONFIRMED" : b.getStatus().name();
            boolean upcoming = s != null && s.getShowTime().isAfter(now);

            ObjectNode f = facts.addObject();
            f.put("booking_id", b.getBookingId());
            f.put("film", s == null ? null : s.getMovie().getTitle());
            f.put("theater", s == null ? null : s.getTheater().getName());
            f.put("when", s == null ? null : s.getShowTime().format(DAY) + ", " + s.getShowTime().format(TIME));
            f.put("seats", seatText);
            f.put("total_inr", total == null ? null : total.intValue());
            f.put("status", status.toLowerCase());
            f.put("upcoming", upcoming);

            ObjectNode i = items.addObject();
            i.put("bookingId", b.getBookingId());
            i.put("film", s == null ? null : s.getMovie().getTitle());
            i.put("posterUrl", s == null ? null : s.getMovie().getPosterUrl());
            i.put("theater", s == null ? null : s.getTheater().getName());
            i.put("when", s == null ? null : s.getShowTime().format(DAY) + ", " + s.getShowTime().format(TIME));
            i.put("seats", seatText);
            i.put("total", total == null ? null : total.intValue());
            i.put("status", status);
            i.put("upcoming", upcoming);
        }
        if (mine.isEmpty()) out.put("note", "No bookings yet.");
        return new ToolResult(out, mine.isEmpty() ? null : card);
    }

    private ToolResult cancelBooking(JsonNode args, AgentContext ctx) {
        ObjectNode out = json.createObjectNode();
        if (!ctx.signedIn()) {
            out.put("signed_in", false);
            return new ToolResult(out, card("signin"));
        }
        String ref = text(args, "booking_id");
        Booking b = ref == null ? null : bookings.findByBookingId(ref.trim()).orElse(null);
        if (b == null) return new ToolResult(error("No booking with that id. Use my_bookings to see booking ids."), null);
        User user = users.findById(ctx.userId()).orElse(null);
        CancellationService.Preview p;
        try {
            p = cancellations.preview(b.getId(), user);
        } catch (CancellationService.CancelException e) {
            return new ToolResult(error(e.getMessage()), null);
        }
        ObjectNode params = json.createObjectNode();
        params.put("bookingDbId", b.getId());
        String proposalId = ctx.session().propose("cancel", params);
        Show s = b.getShow();

        out.put("booking_id", b.getBookingId());
        out.put("refund_percent", p.percent());
        out.put("refund_inr", Math.round(p.refund()));
        out.put("next", "The customer confirms on the card; nothing is cancelled until they do.");

        ObjectNode card = card("cancel");
        card.put("proposalId", proposalId);
        card.put("bookingId", b.getBookingId());
        card.put("film", s.getMovie().getTitle());
        card.put("theater", s.getTheater().getName());
        card.put("when", s.getShowTime().format(DAY) + ", " + s.getShowTime().format(TIME));
        card.put("seats", seatText(b));
        card.put("paid", Math.round(p.paid()));
        card.put("percent", p.percent());
        card.put("refund", Math.round(p.refund()));
        return new ToolResult(out, card);
    }

    private ToolResult showTicket(JsonNode args, AgentContext ctx) {
        ObjectNode out = json.createObjectNode();
        if (!ctx.signedIn()) {
            out.put("signed_in", false);
            return new ToolResult(out, card("signin"));
        }
        String ref = text(args, "booking_id");
        LocalDateTime now = LocalDateTime.now();
        Booking b;
        if (ref != null) {
            b = bookings.findByBookingId(ref.trim())
                    .filter(x -> x.getUser() != null && x.getUser().getId().equals(ctx.userId())).orElse(null);
        } else {
            b = bookings.findByUserIdWithDetails(ctx.userId()).stream()
                    .filter(x -> x.getShow() != null && x.getShow().getShowTime().isAfter(now))
                    .filter(x -> x.getStatus() == null || !"CANCELLED".equals(x.getStatus().name()))
                    .min(Comparator.comparing(x -> x.getShow().getShowTime())).orElse(null);
        }
        if (b == null) return new ToolResult(error(ref == null ? "No upcoming bookings." : "No booking with that id on this account."), null);
        Show s = b.getShow();
        Number total = b.getGrandTotal() != null ? b.getGrandTotal() : b.getTotalAmount();
        out.put("booking_id", b.getBookingId());
        out.put("film", s.getMovie().getTitle());
        out.put("when", s.getShowTime().format(DAY) + ", " + s.getShowTime().format(TIME));

        ObjectNode card = card("ticket");
        card.put("bookingId", b.getBookingId());
        card.put("film", s.getMovie().getTitle());
        card.put("posterUrl", s.getMovie().getPosterUrl());
        card.put("theater", s.getTheater().getName());
        card.put("area", s.getTheater().getLocation());
        card.put("date", s.getShowTime().toLocalDate().toString());
        card.put("time", s.getShowTime().format(TIME));
        card.put("when", s.getShowTime().format(DAY) + ", " + s.getShowTime().format(TIME));
        card.put("seats", seatText(b));
        card.put("total", total == null ? null : total.intValue());
        card.put("status", b.getStatus() == null ? "CONFIRMED" : b.getStatus().name());
        return new ToolResult(out, card);
    }

    private static String seatText(Booking b) {
        return String.join(", ", b.seatNumberList());
    }

    // ─── Confirmed actions ───────────────────────────────────────────────

    @Override
    public Outcome execute(Proposal proposal, AgentContext ctx) {
        if (!ctx.signedIn()) throw new AgentEngine.ConfirmException(401, "Sign in first, then tap the button again.");
        return switch (proposal.kind()) {
            case "hold" -> hold(proposal.params(), ctx);
            case "cancel" -> cancel(proposal.params(), ctx);
            default -> throw new AgentEngine.ConfirmException(400, "Unknown action");
        };
    }

    private Outcome hold(JsonNode params, AgentContext ctx) {
        AgentSession.Order order = ctx.session().order;
        Long showId = params.path("showId").asLong();
        List<String> wanted = new ArrayList<>();
        params.path("seats").forEach(n -> wanted.add(n.asText()));

        // let go of a different hold first
        if (!order.seats.isEmpty() && (!showId.equals(order.showId) || !order.seats.equals(wanted))) {
            try {
                SeatUnlockRequest release = new SeatUnlockRequest();
                release.setShowId(order.showId);
                release.setSeatNumbers(new ArrayList<>(order.seats));
                seatService.unlockSeats(release);
            } catch (Exception ignored) {
                // an expired hold has nothing to release
            }
        }
        SeatLockRequest req = new SeatLockRequest();
        req.setShowId(showId);
        req.setSeatNumbers(wanted);
        SeatLockResponse locked;
        try {
            locked = seatService.lockSeats(req);
        } catch (RuntimeException e) {
            order.clearSeats();
            String msg = e.getMessage() != null && e.getMessage().startsWith("Seats not available")
                    ? "Someone just took " + e.getMessage().replace("Seats not available: ", "") + ". Ask me to find other seats."
                    : "Those seats couldn't be held. Ask me to find others.";
            throw new AgentEngine.ConfirmException(409, msg);
        }
        if (!showId.equals(order.showId)) order.food.clear(); // snacks belong to the old cinema
        order.showId = showId;
        order.seats = new ArrayList<>(wanted);
        order.holdExpires = locked.getExpiresAt();

        ObjectNode card = tx.execute(status -> {
            Show show = shows.findById(showId).orElseThrow();
            ObjectNode c = card("held");
            c.put("showId", showId);
            c.put("film", show.getMovie().getTitle());
            c.put("theater", show.getTheater().getName());
            c.put("when", show.getShowTime().format(DAY) + ", " + show.getShowTime().format(TIME));
            ArrayNode s = c.putArray("seats");
            wanted.forEach(s::add);
            c.put("expiresAt", locked.getExpiresAt().toString());
            return c;
        });
        String until = locked.getExpiresAt().format(TIME);
        return new Outcome("Seats " + String.join(", ", wanted) + " are yours until " + until + ".", card,
                "The customer tapped Hold: seats " + String.join(", ", wanted) + " for show " + showId
                        + " are held until " + until + ". Next, offer snacks or review_order.");
    }

    private Outcome cancel(JsonNode params, AgentContext ctx) {
        User user = users.findById(ctx.userId()).orElseThrow(() -> new AgentEngine.ConfirmException(401, "Sign in again."));
        CancellationService.Outcome o;
        try {
            o = cancellations.cancel(params.path("bookingDbId").asLong(), user);
        } catch (CancellationService.CancelException e) {
            throw new AgentEngine.ConfirmException(e.status, e.getMessage());
        }
        ObjectNode card = card("cancelled");
        card.put("bookingId", o.bookingId());
        card.put("refund", Math.round(o.refunded()));
        card.put("percent", o.percent());
        card.put("message", o.message());
        return new Outcome(o.message(), card,
                "The customer confirmed: booking " + o.bookingId() + " is cancelled; refund ₹" + Math.round(o.refunded())
                        + " (" + o.percent() + "%).");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────

    private void declare(ArrayNode list, String name, String description, ObjectNode... props) {
        ObjectNode fn = list.addObject();
        fn.put("name", name);
        fn.put("description", description);
        if (props.length > 0) {
            ObjectNode params = fn.putObject("parameters");
            params.put("type", "object");
            ObjectNode properties = params.putObject("properties");
            for (ObjectNode p : props) {
                properties.set(p.get("name").asText(), p.without("name"));
            }
        }
    }

    private ObjectNode str(String name, String description) {
        ObjectNode p = json.createObjectNode();
        p.put("name", name);
        p.put("type", "string");
        p.put("description", description);
        return p;
    }

    private ObjectNode num(String name, String description) {
        ObjectNode p = json.createObjectNode();
        p.put("name", name);
        p.put("type", "integer");
        p.put("description", description);
        return p;
    }

    private ObjectNode items() {
        ObjectNode p = json.createObjectNode();
        p.put("name", "items");
        p.put("type", "array");
        p.put("description", "Snacks to set, e.g. [{name: 'popcorn', quantity: 2}]");
        ObjectNode item = p.putObject("items");
        item.put("type", "object");
        ObjectNode props = item.putObject("properties");
        props.putObject("name").put("type", "string");
        props.putObject("quantity").put("type", "integer");
        item.putArray("required").add("name").add("quantity");
        return p;
    }

    private ObjectNode card(String type) {
        ObjectNode c = json.createObjectNode();
        c.put("type", type);
        return c;
    }

    private ObjectNode filmCard(Movie m) {
        ObjectNode i = json.createObjectNode();
        i.put("id", m.getId());
        i.put("title", m.getTitle());
        i.put("language", m.getLanguage());
        i.put("genre", m.getGenre());
        i.put("certificate", m.getCertificate());
        i.put("duration", m.getDuration());
        if (m.getRating() != null) i.put("rating", Math.round(m.getRating() * 10) / 10.0);
        i.put("posterUrl", m.getPosterUrl());
        i.put("backdropUrl", m.getBackdropUrl());
        return i;
    }

    private JsonNode error(String message) {
        ObjectNode o = json.createObjectNode();
        o.put("error", message);
        return o;
    }

    private static boolean nowShowing(Movie m) {
        String status = m.getStatus() == null ? "" : m.getStatus().toLowerCase();
        return !status.equals("inactive") && !status.equals("coming soon");
    }

    private static boolean matchesQuery(Movie m, String query) {
        String haystack = String.join(" ", nonBlank(m.getTitle(), m.getDescription(), m.getDirector(), m.getGenre(),
                m.getCast() == null ? null : String.join(" ", m.getCast()))).toLowerCase();
        for (String word : query.toLowerCase().split("\\s+")) {
            if (word.length() > 2 && haystack.contains(word)) return true;
        }
        return haystack.contains(query.toLowerCase());
    }

    static boolean matchesTitle(String title, String wanted) {
        if (title == null) return false;
        String t = title.toLowerCase();
        String w = wanted.toLowerCase().trim();
        if (t.contains(w) || w.contains(t)) return true;
        for (String word : w.split("[^\\p{L}\\p{N}]+")) {
            if (word.length() > 3 && t.contains(word)) return true;
        }
        return false;
    }

    static boolean contains(String value, String part) {
        return value != null && value.toLowerCase().contains(part.toLowerCase().trim());
    }

    private static List<String> nonBlank(String... parts) {
        List<String> out = new ArrayList<>();
        for (String p : parts) if (p != null && !p.isBlank()) out.add(p);
        return out;
    }

    private static String clip(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max - 1) + "…";
    }

    static String text(JsonNode args, String key) {
        JsonNode v = args == null ? null : args.get(key);
        return v == null || v.isNull() || v.asText().isBlank() ? null : v.asText().trim();
    }

    static Long longArg(JsonNode args, String key) {
        JsonNode v = args == null ? null : args.get(key);
        if (v == null || v.isNull()) return null;
        if (v.isNumber()) return v.asLong();
        try {
            return Long.parseLong(v.asText().replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    static LocalDate date(JsonNode args, String key) {
        String v = text(args, key);
        try {
            return v == null ? null : LocalDate.parse(v.substring(0, Math.min(10, v.length())));
        } catch (Exception e) {
            return null;
        }
    }

    static LocalTime time(JsonNode args, String key) {
        String v = text(args, key);
        try {
            return v == null ? null : LocalTime.parse(v.length() == 4 ? "0" + v : v);
        } catch (Exception e) {
            return null;
        }
    }
}
