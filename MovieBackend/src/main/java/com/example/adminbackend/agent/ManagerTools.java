package com.example.adminbackend.agent;

import com.example.adminbackend.entity.Booking;
import com.example.adminbackend.entity.BookingStatus;
import com.example.adminbackend.entity.Movie;
import com.example.adminbackend.entity.SeatStatus;
import com.example.adminbackend.entity.Show;
import com.example.adminbackend.entity.Theater;
import com.example.adminbackend.repository.BookingFoodItemRepository;
import com.example.adminbackend.repository.BookingRepository;
import com.example.adminbackend.repository.MovieRepository;
import com.example.adminbackend.repository.ShowRepository;
import com.example.adminbackend.repository.ShowSeatRepository;
import com.example.adminbackend.repository.TheaterRepository;
import com.example.adminbackend.service.MovieService;
import com.example.adminbackend.service.ShowService;
import com.example.adminbackend.service.TmdbService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import static com.example.adminbackend.agent.ConciergeTools.contains;
import static com.example.adminbackend.agent.ConciergeTools.date;
import static com.example.adminbackend.agent.ConciergeTools.longArg;
import static com.example.adminbackend.agent.ConciergeTools.matchesTitle;
import static com.example.adminbackend.agent.ConciergeTools.text;

/**
 * The manager's assistant at /admin: how full shows are, sales, and catalogue
 * jobs. Importing a film and scheduling shows are proposals the manager
 * confirms on the card; the assistant never changes anything by itself.
 */
@Service
public class ManagerTools implements AgentProfile {

    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("EEE d MMM", Locale.ENGLISH);
    private static final DateTimeFormatter NOW = DateTimeFormatter.ofPattern("EEEE d MMMM yyyy, h:mm a", Locale.ENGLISH);
    private static final int MAX_SCHEDULE_DAYS = 14;

    private final ObjectMapper json = new ObjectMapper();
    private final MovieRepository movies;
    private final ShowRepository shows;
    private final ShowSeatRepository showSeats;
    private final TheaterRepository theaters;
    private final BookingRepository bookings;
    private final BookingFoodItemRepository bookingFood;
    private final TmdbService tmdb;
    private final MovieService movieService;
    private final ShowService showService;

    @Value("${payment.default.ticket.price:250}")
    private BigDecimal defaultTicketPrice;

    public ManagerTools(MovieRepository movies, ShowRepository shows, ShowSeatRepository showSeats,
                        TheaterRepository theaters, BookingRepository bookings, BookingFoodItemRepository bookingFood,
                        TmdbService tmdb, MovieService movieService, ShowService showService) {
        this.movies = movies;
        this.shows = shows;
        this.showSeats = showSeats;
        this.theaters = theaters;
        this.bookings = bookings;
        this.bookingFood = bookingFood;
        this.tmdb = tmdb;
        this.movieService = movieService;
        this.showService = showService;
    }

    @Override
    public String systemPrompt(AgentContext ctx) {
        return """
                You are the manager's assistant at CineBook, a cinema chain in Hyderabad. You help the manager
                run the box office: how full shows are, sales, films in the catalogue and the show schedule.

                Numbers come only from your tools; never guess. Be brief and specific: lead with the answer
                (for example "3 of tonight's 12 shows are under 20% full"), then one line of advice if useful.
                The chat shows tool results as cards and tables, so don't repeat them row by row.
                Write plain sentences: no markdown, asterisks, lists or headings.

                Changes are proposals: import_film and schedule_shows only prepare a card with a Confirm button,
                and nothing changes until the manager taps it. Say so briefly. To add a new film, search_tmdb
                first, then import_film with the chosen tmdb_id. To schedule, use the film as it appears in
                catalogue (import it first if it's missing), a theater, show times (24h HH:mm), a start date
                and a number of days.
                Messages starting with "[Update from CineBook" are facts (for example a confirmed import).
                """ + "\nNow: " + LocalDateTime.now().format(NOW) + " (Hyderabad).";
    }

    @Override
    public ArrayNode declarations() {
        ArrayNode list = json.createArrayNode();
        declare(list, "occupancy",
                "How full shows are on a day: seats booked, held and free per show.",
                str("date", "YYYY-MM-DD, default today"),
                str("theater", "Theater name or area"),
                str("after", "Only shows starting at or after this time, 24h HH:mm (e.g. 17:00 for tonight)"),
                num("max_percent", "Only shows at most this % full, e.g. 20"),
                str("include_started", "'true' to include shows that already started (default: only upcoming)"));
        declare(list, "sales",
                "Bookings, ticket and canteen revenue, cancellations and top films for a period (by booking time).",
                str("from", "Start date YYYY-MM-DD, default 7 days ago"),
                str("to", "End date YYYY-MM-DD inclusive, default today"));
        declare(list, "catalogue",
                "Films in the catalogue (with status and upcoming show counts) and theaters with screens.");
        declare(list, "search_tmdb",
                "Searches TMDB for films to import.",
                str("query", "Film title"));
        declare(list, "import_film",
                "Prepares importing a TMDB film into the catalogue; the manager confirms on the card.",
                num("tmdb_id", "tmdbId from search_tmdb"));
        declare(list, "schedule_shows",
                "Prepares a block of shows for a film at a theater; the manager confirms on the card.",
                str("film", "Film title as in the catalogue"),
                str("theater", "Theater name or area"),
                strList("times", "Daily start times, 24h HH:mm, e.g. ['10:30','14:15','18:45']"),
                str("start_date", "First day YYYY-MM-DD, default today"),
                num("days", "Number of days, 1 to 14, default 7"),
                num("price", "Ticket price in rupees, optional"));
        return list;
    }

    @Override
    public String progressLabel(String tool) {
        return switch (tool) {
            case "occupancy" -> "Counting seats";
            case "sales" -> "Adding up the takings";
            case "catalogue" -> "Checking the catalogue";
            case "search_tmdb" -> "Searching TMDB";
            case "import_film" -> "Preparing the import";
            case "schedule_shows" -> "Planning the shows";
            default -> "Working on it";
        };
    }

    @Override
    public List<String> suggestions(List<String> used, AgentContext ctx) {
        String last = used.isEmpty() ? "" : used.get(used.size() - 1);
        return switch (last) {
            case "occupancy" -> List.of("Tomorrow's shows", "Sales this week");
            case "sales" -> List.of("Sales last month", "Which shows tonight are under 20% full?");
            case "search_tmdb", "import_film" -> List.of("Schedule it at Hitec for a week");
            case "schedule_shows" -> List.of("How full is tomorrow?", "What's in the catalogue?");
            default -> List.of("Which shows tonight are under 20% full?", "Sales this week", "Add a new film from TMDB");
        };
    }

    @Override
    @Transactional(readOnly = true)
    public ToolResult run(String name, JsonNode args, AgentContext ctx) {
        return switch (name) {
            case "occupancy" -> occupancy(args);
            case "sales" -> sales(args);
            case "catalogue" -> catalogue();
            case "search_tmdb" -> searchTmdb(args, ctx);
            case "import_film" -> proposeImport(args, ctx);
            case "schedule_shows" -> proposeSchedule(args, ctx);
            default -> new ToolResult(error("Unknown tool " + name), null);
        };
    }

    // ─── Reports ─────────────────────────────────────────────────────────

    private ToolResult occupancy(JsonNode args) {
        LocalDate day = date(args, "date") == null ? LocalDate.now() : date(args, "date");
        String place = text(args, "theater");
        Long maxPercent = longArg(args, "max_percent");
        LocalTime after = ConciergeTools.time(args, "after");
        boolean includeStarted = "true".equalsIgnoreCase(text(args, "include_started"));
        LocalDateTime cutoff = LocalDateTime.now();
        List<Show> list = shows.findByShowTimeBetween(day.atStartOfDay(), day.plusDays(1).atStartOfDay()).stream()
                .filter(s -> place == null || contains(s.getTheater().getName(), place) || contains(s.getTheater().getLocation(), place))
                .filter(s -> after == null || !s.getShowTime().toLocalTime().isBefore(after))
                .filter(s -> includeStarted || s.getShowTime().isAfter(cutoff))
                .sorted(Comparator.comparing(Show::getShowTime))
                .toList();
        Map<Long, Map<SeatStatus, Long>> counts = new HashMap<>();
        if (!list.isEmpty()) {
            for (Object[] row : showSeats.countSeatsByStatusForShows(list.stream().map(Show::getId).toList())) {
                counts.computeIfAbsent((Long) row[0], k -> new HashMap<>()).put((SeatStatus) row[1], (Long) row[2]);
            }
        }
        LocalDateTime now = LocalDateTime.now();
        ArrayNode facts = json.createArrayNode();
        ObjectNode card = card("occupancy");
        card.put("day", day.format(DAY));
        ArrayNode rows = card.putArray("rows");
        int shown = 0;
        long totalSeats = 0, totalBooked = 0;
        for (Show s : list) {
            Map<SeatStatus, Long> c = counts.getOrDefault(s.getId(), Map.of());
            long booked = c.getOrDefault(SeatStatus.BOOKED, 0L);
            long held = c.getOrDefault(SeatStatus.LOCKED, 0L);
            long total = c.values().stream().mapToLong(Long::longValue).sum();
            int percent = total == 0 ? 0 : (int) Math.round(booked * 100.0 / total);
            totalSeats += total;
            totalBooked += booked;
            if (maxPercent != null && percent > maxPercent) continue;
            shown++;
            ObjectNode f = facts.addObject();
            f.put("show_id", s.getId());
            f.put("film", s.getMovie().getTitle());
            f.put("theater", s.getTheater().getName());
            f.put("time", s.getShowTime().format(TIME));
            f.put("started", !s.getShowTime().isAfter(now));
            f.put("booked", booked);
            f.put("held", held);
            f.put("seats", total);
            f.put("percent_full", percent);

            ObjectNode r = rows.addObject();
            r.put("film", s.getMovie().getTitle());
            r.put("theater", s.getTheater().getName());
            r.put("time", s.getShowTime().format(TIME));
            r.put("booked", booked);
            r.put("held", held);
            r.put("seats", total);
            r.put("percent", percent);
            r.put("started", !s.getShowTime().isAfter(now));
        }
        ObjectNode out = json.createObjectNode();
        out.put("day", day.toString());
        out.put("shows_matching", list.size());
        if (!includeStarted) out.put("note", "Shows that already started are left out.");
        out.put("shows_listed", shown);
        out.put("overall_percent_full", totalSeats == 0 ? 0 : Math.round(totalBooked * 100.0 / totalSeats));
        out.set("shows", facts);
        return new ToolResult(out, shown == 0 ? null : card);
    }

    private ToolResult sales(JsonNode args) {
        LocalDate to = date(args, "to") == null ? LocalDate.now() : date(args, "to");
        LocalDate from = date(args, "from") == null ? to.minusDays(6) : date(args, "from");
        List<Booking> list = bookings.findByBookingTimeBetween(from.atStartOfDay(), to.plusDays(1).atStartOfDay());
        long confirmed = 0, cancelled = 0;
        double tickets = 0, food = 0, total = 0;
        Map<String, double[]> films = new LinkedHashMap<>(); // title -> [bookings, revenue]
        for (Booking b : list) {
            boolean isCancelled = b.getStatus() == BookingStatus.CANCELLED;
            if (isCancelled) {
                cancelled++;
                continue;
            }
            confirmed++;
            double t = b.getTicketTotal() != null ? b.getTicketTotal().doubleValue() : 0;
            double f = b.getFoodTotal() != null ? b.getFoodTotal().doubleValue() : 0;
            double g = b.getGrandTotal() != null ? b.getGrandTotal().doubleValue() : (b.getTotalAmount() != null ? b.getTotalAmount() : t + f);
            tickets += t;
            food += f;
            total += g;
            if (b.getShow() != null) {
                double[] agg = films.computeIfAbsent(b.getShow().getMovie().getTitle(), k -> new double[2]);
                agg[0]++;
                agg[1] += g;
            }
        }
        ObjectNode out = json.createObjectNode();
        out.put("from", from.toString());
        out.put("to", to.toString());
        out.put("bookings", confirmed);
        out.put("cancelled", cancelled);
        out.put("ticket_revenue_inr", Math.round(tickets));
        out.put("canteen_revenue_inr", Math.round(food));
        out.put("total_collected_inr", Math.round(total));

        ObjectNode card = card("sales");
        card.put("period", from.format(DAY) + " to " + to.format(DAY));
        card.put("bookings", confirmed);
        card.put("cancelled", cancelled);
        card.put("tickets", Math.round(tickets));
        card.put("canteen", Math.round(food));
        card.put("total", Math.round(total));
        ArrayNode top = card.putArray("films");
        ArrayNode topFacts = out.putArray("top_films");
        films.entrySet().stream().sorted((a, b) -> Double.compare(b.getValue()[1], a.getValue()[1])).limit(5).forEach(e -> {
            ObjectNode f = top.addObject();
            f.put("title", e.getKey());
            f.put("bookings", (long) e.getValue()[0]);
            f.put("revenue", Math.round(e.getValue()[1]));
            topFacts.add(e.getKey() + ": " + (long) e.getValue()[0] + " bookings, ₹" + Math.round(e.getValue()[1]));
        });
        ArrayNode snacks = card.putArray("snacks");
        ArrayNode snackFacts = out.putArray("canteen_items");
        for (Object[] row : bookingFood.canteenSales(from.atStartOfDay(), to.plusDays(1).atStartOfDay(), BookingStatus.CANCELLED)) {
            long qty = ((Number) row[1]).longValue();
            long rev = row[2] == null ? 0 : Math.round(((Number) row[2]).doubleValue());
            ObjectNode s = snacks.addObject();
            s.put("name", (String) row[0]);
            s.put("quantity", qty);
            s.put("revenue", rev);
            snackFacts.add(row[0] + ": " + qty + " sold, ₹" + rev);
        }
        return new ToolResult(out, card);
    }

    private ToolResult catalogue() {
        LocalDateTime now = LocalDateTime.now();
        Map<Long, Long> upcoming = shows.findByShowTimeBetween(now, now.plusDays(MAX_SCHEDULE_DAYS)).stream()
                .collect(Collectors.groupingBy(s -> s.getMovie().getId(), Collectors.counting()));
        ObjectNode out = json.createObjectNode();
        ArrayNode films = out.putArray("films");
        for (Movie m : movies.findAll()) {
            ObjectNode f = films.addObject();
            f.put("film_id", m.getId());
            f.put("title", m.getTitle());
            f.put("status", m.getStatus());
            f.put("language", m.getLanguage());
            f.put("upcoming_shows", upcoming.getOrDefault(m.getId(), 0L));
        }
        ArrayNode halls = out.putArray("theaters");
        for (Theater t : theaters.findAll()) {
            ObjectNode h = halls.addObject();
            h.put("name", t.getName());
            h.put("area", t.getLocation());
            h.put("screens", t.getNumberOfScreens());
        }
        return new ToolResult(out, null);
    }

    private ToolResult searchTmdb(JsonNode args, AgentContext ctx) {
        String query = text(args, "query");
        if (query == null) return new ToolResult(error("What film should I search for?"), null);
        if (!tmdb.isConfigured()) return new ToolResult(error("TMDB isn't set up (TMDB_API_KEY)."), null);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> results = (List<Map<String, Object>>) tmdb.search(query, 1).get("results");
        ArrayNode facts = json.createArrayNode();
        ObjectNode card = card("tmdb");
        ArrayNode items = card.putArray("items");
        for (Map<String, Object> r : results.stream().limit(6).toList()) {
            long id = ((Number) r.get("tmdbId")).longValue();
            boolean imported = movies.findByTmdbId(id).isPresent();
            ObjectNode f = facts.addObject();
            f.put("tmdb_id", id);
            f.put("title", (String) r.get("title"));
            f.put("release_date", (String) r.get("releaseDate"));
            f.put("language", (String) r.get("language"));
            f.put("already_in_catalogue", imported);
            ObjectNode i = items.addObject();
            i.put("tmdbId", id);
            i.put("title", (String) r.get("title"));
            i.put("year", String.valueOf(r.get("releaseDate")).length() >= 4 ? String.valueOf(r.get("releaseDate")).substring(0, 4) : "");
            i.put("language", (String) r.get("language"));
            i.put("posterUrl", (String) r.get("posterThumbUrl"));
            i.put("imported", imported);
            // remembered so an import card can show what's being imported
            ctx.session().tmdbSeen.put(id, i.deepCopy());
        }
        ObjectNode out = json.createObjectNode();
        out.set("results", facts);
        return new ToolResult(out, results.isEmpty() ? null : card);
    }

    // ─── Proposals ───────────────────────────────────────────────────────

    private ToolResult proposeImport(JsonNode args, AgentContext ctx) {
        Long tmdbId = longArg(args, "tmdb_id");
        if (tmdbId == null) return new ToolResult(error("Which film? Use search_tmdb and pass its tmdb_id."), null);
        var existing = movies.findByTmdbId(tmdbId);
        if (existing.isPresent()) {
            return new ToolResult(error(existing.get().getTitle() + " is already in the catalogue."), null);
        }
        JsonNode seen = ctx.session().tmdbSeen.get(tmdbId);
        ObjectNode params = json.createObjectNode();
        params.put("tmdbId", tmdbId);
        String proposalId = ctx.session().propose("import", params);

        ObjectNode card = card("proposal");
        card.put("proposalId", proposalId);
        card.put("action", "Import film");
        card.put("title", seen == null ? "TMDB film " + tmdbId : seen.path("title").asText() + " (" + seen.path("year").asText() + ")");
        card.put("posterUrl", seen == null ? null : seen.path("posterUrl").asText(null));
        ArrayNode lines = card.putArray("lines");
        lines.add("Adds the film with its poster, cast, trailer and certificate from TMDB.");
        lines.add("Ticket price starts at ₹" + defaultTicketPrice.intValue() + "; no shows are scheduled yet.");
        card.put("confirmLabel", "Import film");

        ObjectNode out = json.createObjectNode();
        out.put("prepared", true);
        out.put("next", "The manager taps Import film on the card.");
        return new ToolResult(out, card);
    }

    private ToolResult proposeSchedule(JsonNode args, AgentContext ctx) {
        String filmName = text(args, "film");
        String place = text(args, "theater");
        List<LocalTime> times = new ArrayList<>();
        for (JsonNode t : args.path("times")) {
            try {
                String v = t.asText().trim();
                times.add(LocalTime.parse(v.length() == 4 ? "0" + v : v));
            } catch (Exception ignored) {
                // skip unreadable times
            }
        }
        LocalDate start = date(args, "start_date") == null ? LocalDate.now() : date(args, "start_date");
        int days = (int) Math.max(1, Math.min(MAX_SCHEDULE_DAYS, longArg(args, "days") == null ? 7 : longArg(args, "days")));
        Long price = longArg(args, "price");

        if (filmName == null || place == null || times.isEmpty()) {
            return new ToolResult(error("I need the film, the theater and at least one show time (HH:mm)."), null);
        }
        List<Movie> filmMatches = movies.findAll().stream().filter(m -> matchesTitle(m.getTitle(), filmName)).toList();
        if (filmMatches.isEmpty()) return new ToolResult(error("\"" + filmName + "\" isn't in the catalogue. Import it from TMDB first."), null);
        if (filmMatches.size() > 1) {
            return new ToolResult(error("Several films match: " + filmMatches.stream().map(Movie::getTitle).collect(Collectors.joining(", ")) + ". Which one?"), null);
        }
        List<Theater> hallMatches = theaters.findAll().stream()
                .filter(t -> contains(t.getName(), place) || contains(t.getLocation(), place)).toList();
        if (hallMatches.size() != 1) {
            return new ToolResult(error(hallMatches.isEmpty() ? "No theater matches \"" + place + "\"." : "Which theater: "
                    + hallMatches.stream().map(Theater::getName).collect(Collectors.joining(" or ")) + "?"), null);
        }
        Movie film = filmMatches.get(0);
        Theater hall = hallMatches.get(0);
        int screens = hall.getNumberOfScreens() == null ? 1 : hall.getNumberOfScreens();

        // existing shows at this theater by start time, to respect the number of screens
        LocalDateTime now = LocalDateTime.now();
        Map<LocalDateTime, Long> busy = shows.findByTheaterIdAndShowTimeBetween(hall.getId(), start.atStartOfDay(),
                        start.plusDays(days).atStartOfDay()).stream()
                .collect(Collectors.groupingBy(Show::getShowTime, Collectors.counting()));
        Map<LocalDateTime, Boolean> sameFilm = new HashMap<>();
        shows.findByMovieIdAndTheaterIdAndShowTimeBetween(film.getId(), hall.getId(), start.atStartOfDay(),
                start.plusDays(days).atStartOfDay()).forEach(s -> sameFilm.put(s.getShowTime(), true));

        ArrayNode slots = json.createArrayNode();
        int skippedPast = 0, skippedBusy = 0;
        for (int d = 0; d < days; d++) {
            for (LocalTime t : times.stream().sorted().distinct().toList()) {
                LocalDateTime at = start.plusDays(d).atTime(t);
                if (!at.isAfter(now)) { skippedPast++; continue; }
                if (sameFilm.containsKey(at) || busy.getOrDefault(at, 0L) >= screens) { skippedBusy++; continue; }
                slots.add(at.toString());
            }
        }
        if (slots.isEmpty()) {
            return new ToolResult(error("None of those slots are free (" + skippedPast + " in the past, " + skippedBusy + " clash with existing shows)."), null);
        }
        long ticketPrice = price != null ? price : (film.getPrice() != null ? film.getPrice().longValue() : defaultTicketPrice.longValue());
        ObjectNode params = json.createObjectNode();
        params.put("movieId", film.getId());
        params.put("theaterId", hall.getId());
        params.put("price", ticketPrice);
        params.set("slots", slots);
        String proposalId = ctx.session().propose("schedule", params);

        String timeText = times.stream().sorted().distinct().map(t -> t.format(TIME)).collect(Collectors.joining(", "));
        ObjectNode card = card("proposal");
        card.put("proposalId", proposalId);
        card.put("action", "Schedule shows");
        card.put("title", film.getTitle() + " at " + hall.getName());
        card.put("posterUrl", film.getPosterUrl());
        ArrayNode lines = card.putArray("lines");
        lines.add(shows(slots.size()) + ", " + start.format(DAY) + " to " + start.plusDays(days - 1).format(DAY));
        lines.add("Daily at " + timeText);
        lines.add("Base ticket price ₹" + ticketPrice + " (seat categories set the final price)");
        if (skippedPast + skippedBusy > 0) {
            lines.add("Skipping " + (skippedPast > 0 ? skippedPast + " in the past" : "")
                    + (skippedPast > 0 && skippedBusy > 0 ? " and " : "")
                    + (skippedBusy > 0 ? skippedBusy + " that clash with shows already there" : ""));
        }
        card.put("confirmLabel", "Create " + shows(slots.size()));

        ObjectNode out = json.createObjectNode();
        out.put("prepared", true);
        out.put("shows_to_create", slots.size());
        out.put("skipped_in_past", skippedPast);
        out.put("skipped_clashes", skippedBusy);
        out.put("next", "The manager confirms on the card.");
        return new ToolResult(out, card);
    }

    @Override
    public Outcome execute(Proposal proposal, AgentContext ctx) {
        return switch (proposal.kind()) {
            case "import" -> importFilm(proposal.params());
            case "schedule" -> schedule(proposal.params());
            default -> throw new AgentEngine.ConfirmException(400, "Unknown action");
        };
    }

    private Outcome importFilm(JsonNode params) {
        long tmdbId = params.path("tmdbId").asLong();
        if (movies.findByTmdbId(tmdbId).isPresent()) {
            throw new AgentEngine.ConfirmException(409, "That film is already in the catalogue.");
        }
        Movie movie;
        try {
            movie = tmdb.buildMovie(tmdbId);
        } catch (RuntimeException e) {
            throw new AgentEngine.ConfirmException(502, "TMDB didn't respond: " + e.getMessage());
        }
        movie.setPrice(defaultTicketPrice);
        Movie saved = movieService.save(movie);
        ObjectNode card = card("done");
        card.put("title", saved.getTitle() + " added");
        card.put("detail", "Status: " + saved.getStatus() + ". Next, schedule some shows.");
        return new Outcome(saved.getTitle() + " is in the catalogue.", card,
                "The manager confirmed: " + saved.getTitle() + " (film_id " + saved.getId() + ", status " + saved.getStatus()
                        + ") was imported. It has no shows yet.");
    }

    private Outcome schedule(JsonNode params) {
        Movie film = movies.findById(params.path("movieId").asLong())
                .orElseThrow(() -> new AgentEngine.ConfirmException(404, "That film was removed."));
        Theater hall = theaters.findById(params.path("theaterId").asLong())
                .orElseThrow(() -> new AgentEngine.ConfirmException(404, "That theater was removed."));
        BigDecimal price = BigDecimal.valueOf(params.path("price").asLong());
        int created = 0;
        for (JsonNode slot : params.path("slots")) {
            LocalDateTime at = LocalDateTime.parse(slot.asText());
            if (!at.isAfter(LocalDateTime.now())) continue;
            Show show = new Show();
            show.setMovie(film);
            show.setTheater(hall);
            show.setShowTime(at);
            show.setTicketPrice(price);
            showService.createShow(show);
            created++;
        }
        ObjectNode card = card("done");
        card.put("title", shows(created) + " created");
        card.put("detail", film.getTitle() + " at " + hall.getName() + ". Seat maps are ready and customers can book now.");
        return new Outcome(shows(created) + (created == 1 ? " is" : " are") + " on sale.", card,
                "The manager confirmed: " + shows(created) + " of " + film.getTitle() + " were created at " + hall.getName() + ".");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────

    private static String shows(int n) {
        return n + (n == 1 ? " show" : " shows");
    }

    private void declare(ArrayNode list, String name, String description, ObjectNode... props) {
        ObjectNode fn = list.addObject();
        fn.put("name", name);
        fn.put("description", description);
        if (props.length > 0) {
            ObjectNode params = fn.putObject("parameters");
            params.put("type", "object");
            ObjectNode properties = params.putObject("properties");
            for (ObjectNode p : props) properties.set(p.get("name").asText(), p.without("name"));
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

    private ObjectNode strList(String name, String description) {
        ObjectNode p = str(name, description);
        p.put("type", "array");
        p.putObject("items").put("type", "string");
        return p;
    }

    private ObjectNode card(String type) {
        ObjectNode c = json.createObjectNode();
        c.put("type", type);
        return c;
    }

    private JsonNode error(String message) {
        ObjectNode o = json.createObjectNode();
        o.put("error", message);
        return o;
    }
}
