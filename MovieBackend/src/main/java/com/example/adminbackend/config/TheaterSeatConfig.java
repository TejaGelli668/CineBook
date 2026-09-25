package com.example.adminbackend.config;

import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class TheaterSeatConfig {

    public static class SeatCategory {
        private String name;
        private double price;
        private String icon;
        private List<RowConfig> rows;

        public SeatCategory(String name, double price, String icon, List<RowConfig> rows) {
            this.name = name;
            this.price = price;
            this.icon = icon;
            this.rows = rows;
        }

        // Getters
        public String getName() { return name; }
        public double getPrice() { return price; }
        public String getIcon() { return icon; }
        public List<RowConfig> getRows() { return rows; }
    }

    public static class RowConfig {
        private String rowLetter;
        private List<Integer> seatNumbers;

        public RowConfig(String rowLetter, List<Integer> seatNumbers) {
            this.rowLetter = rowLetter;
            this.seatNumbers = seatNumbers;
        }

        public String getRowLetter() { return rowLetter; }
        public List<Integer> getSeatNumbers() { return seatNumbers; }
    }

    /**
     * 🎭 YOUR CLEAN THEATER LAYOUT - 157 seats total
     * Row A: 9 seats (Royal Recliner)
     * Rows B-D: 41 seats (Royal)
     * Rows E-I: 76 seats (Club)
     * Rows J-L: 35 seats (Executive)
     */
    /**
     * Your exact clean theater layout - 157 seats total
     */
    public List<SeatCategory> getDefaultTheaterLayout() {
        List<SeatCategory> categories = new ArrayList<>();

        // Royal Recliner - Row A (9 seats) - ₹630
        categories.add(new SeatCategory("Royal Recliner", 630.0, "👑",
                Arrays.asList(new RowConfig("A", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9)))));

        // Royal - Rows B, C, D (41 seats total) - ₹360
        List<RowConfig> royalRows = Arrays.asList(
                new RowConfig("B", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)),
                new RowConfig("C", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)),
                new RowConfig("D", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14))
        );
        categories.add(new SeatCategory("Royal", 360.0, "⭐", royalRows));

        // Club - Rows E, F, G, H, I (76 seats total) - ₹350
        List<RowConfig> clubRows = Arrays.asList(
                new RowConfig("E", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)),
                new RowConfig("F", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)),
                new RowConfig("G", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)),
                new RowConfig("H", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)),
                new RowConfig("I", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12))
        );
        categories.add(new SeatCategory("Club", 350.0, "👥", clubRows));

        // Executive - Rows J, K, L (35 seats total) - ₹330
        List<RowConfig> executiveRows = Arrays.asList(
                new RowConfig("J", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)),
                new RowConfig("K", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)),
                new RowConfig("L", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11))
        );
        categories.add(new SeatCategory("Executive", 330.0, "🪑", executiveRows));

        return categories;
    }

    private List<Integer> getFullRowSeats(int start, int end) {
        List<Integer> seats = new ArrayList<>();
        for (int i = start; i <= end; i++) {
            seats.add(i);
        }
        return seats;
    }

    /**
     * 🦽 Wheelchair accessible seats - end seats for easy access
     */
    public Set<String> getDefaultWheelchairSeats() {
        return new HashSet<>(Arrays.asList(
                "L1", "L2", "L10", "L11",  // Executive row ends
                "K1", "K12",               // Executive row ends
                "I1", "I12"                // Club row ends
        ));
    }

    /**
     * 📊 Get total seat count
     */
    public int getTotalSeatCount() {
        return getDefaultTheaterLayout().stream()
                .mapToInt(category -> category.getRows().stream()
                        .mapToInt(row -> row.getSeatNumbers().size())
                        .sum())
                .sum();
    }

    /**
     * 📈 Get seat statistics by category
     */
    public Map<String, Integer> getSeatCountByCategory() {
        Map<String, Integer> stats = new HashMap<>();

        for (SeatCategory category : getDefaultTheaterLayout()) {
            int count = category.getRows().stream()
                    .mapToInt(row -> row.getSeatNumbers().size())
                    .sum();
            stats.put(category.getName(), count);
        }

        return stats;
    }
}