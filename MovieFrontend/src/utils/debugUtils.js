// src/utils/debugUtils.js
// Debug utilities for seat management

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("userToken") || localStorage.getItem("authToken");
};

// Debug functions for seat management
export const seatDebugUtils = {
  // 1. Check what seats exist for a show
  async debugShowSeats(showId) {
    const token = getAuthToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/seats/debug/show/${showId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("=== SHOW SEATS DEBUG ===");
      console.log("Show ID:", showId);
      console.log("Total seats:", data.totalSeats);
      console.log("Seats by status:", data.seatsByStatus);
      console.log("Sample seat numbers:", data.sampleSeatNumbers);
      console.log("All seat numbers:", data.allSeatNumbers);

      return data;
    } catch (error) {
      console.error("Debug failed:", error);
      throw error;
    }
  },

  // 2. Check if specific seats exist
  async checkSpecificSeats(showId, seatNumbers) {
    const token = getAuthToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/seats/debug/check-seats`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            showId: showId,
            seatNumbers: seatNumbers,
          }),
        }
      );

      const data = await response.json();
      console.log("=== SEAT CHECK RESULTS ===");
      console.log("Requested seats:", data.requestedSeats);
      console.log("Found seats:", data.foundSeats);
      console.log("Missing seats:", data.missingSeats);
      console.log(`Found ${data.foundCount}/${data.requestedCount} seats`);

      if (data.missingSeats.length > 0) {
        console.error("❌ MISSING SEATS:", data.missingSeats);
      } else {
        console.log("✅ All seats found!");
      }

      return data;
    } catch (error) {
      console.error("Seat check failed:", error);
      throw error;
    }
  },

  // 3. Fix shows without seats
  async fixShowsWithoutSeats() {
    const token = getAuthToken();

    try {
      const response = await fetch(`${API_BASE_URL}/api/shows/fix-seats`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("=== FIX SHOWS RESULT ===");
      console.log(data);

      return data;
    } catch (error) {
      console.error("Fix shows failed:", error);
      throw error;
    }
  },

  // 4. Make all seats available
  async makeAllSeatsAvailable() {
    const token = getAuthToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shows/make-all-seats-available`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("=== MAKE SEATS AVAILABLE RESULT ===");
      console.log(data);

      return data;
    } catch (error) {
      console.error("Make seats available failed:", error);
      throw error;
    }
  },

  // 5. Clean up duplicates for a specific show
  async cleanupDuplicates(showId) {
    const token = getAuthToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shows/cleanup-duplicates/${showId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("=== CLEANUP DUPLICATES RESULT ===");
      console.log(data);

      return data;
    } catch (error) {
      console.error("Cleanup duplicates failed:", error);
      throw error;
    }
  },

  // 6. Get seat statistics
  async getSeatStatistics() {
    const token = getAuthToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shows/seats-statistics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("=== SEAT STATISTICS ===");
      console.log(data.data);

      return data;
    } catch (error) {
      console.error("Get statistics failed:", error);
      throw error;
    }
  },

  // 7. Create missing seats for a show
  async createMissingSeats(showId, expectedSeatNumbers) {
    const token = getAuthToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/seats/debug/create-missing-seats/${showId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seatNumbers: expectedSeatNumbers,
          }),
        }
      );

      const data = await response.json();
      console.log("=== CREATE MISSING SEATS RESULT ===");
      console.log(
        `Expected: ${data.expectedSeats}, Existing: ${data.existingSeats}, Created: ${data.createdSeats}`
      );
      console.log("Missing seats were:", data.missingSeats);
      console.log(data.message);

      return data;
    } catch (error) {
      console.error("Create missing seats failed:", error);
      throw error;
    }
  },

  // 8. Recreate all seats for a show (nuclear option)
  async recreateAllSeats(showId, seatNumbers) {
    const token = getAuthToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/seats/debug/recreate-all-seats/${showId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seatNumbers: seatNumbers,
          }),
        }
      );

      const data = await response.json();
      console.log("=== RECREATE ALL SEATS RESULT ===");
      console.log(`Show ${data.showId}: ${data.totalSeats} seats recreated`);
      console.log(data.message);

      return data;
    } catch (error) {
      console.error("Recreate all seats failed:", error);
      throw error;
    }
  },

  // 9. Remove duplicate seats (CRITICAL for your case!)
  async removeDuplicateSeats(showId) {
    const token = getAuthToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/seats/debug/remove-duplicates/${showId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("=== REMOVE DUPLICATES RESULT ===");
      console.log(`Removed ${data.duplicatesRemoved} duplicate seats`);
      console.log(`Remaining seats: ${data.remainingSeats}`);
      console.log(data.message);

      return data;
    } catch (error) {
      console.error("Remove duplicates failed:", error);
      throw error;
    }
  },

  // 10. Batch delete seats - FIXED VERSION
  async batchDeleteSeats(showId, seatNumbers) {
    const token = getAuthToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/seats/debug/batch-delete-seats`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            showId: showId,
            seatNumbers: seatNumbers,
          }),
        }
      );

      const data = await response.json();
      console.log("=== BATCH DELETE RESULT ===");
      console.log(`Requested to delete: ${data.requestedToDelete}`);
      console.log(`Actually deleted: ${data.actuallyDeleted}`);
      console.log(data.message);

      return data;
    } catch (error) {
      console.error("Batch delete failed:", error);
      throw error;
    }
  },

  // 11. Clean layout migration (handles duplicates + renumbering)
  async cleanMigration(showId, newSeatLayout) {
    const token = getAuthToken();

    try {
      console.log("🧹 Step 1: Removing all existing seats...");

      // First, get all current seats to delete them manually
      const currentData = await this.debugShowSeats(showId);

      // Delete in batches to avoid overwhelming the server
      const batchSize = 50;
      const allCurrentSeats = currentData.allSeatNumbers;

      console.log(
        `🗑️  Deleting ${allCurrentSeats.length} existing seats in batches...`
      );

      for (let i = 0; i < allCurrentSeats.length; i += batchSize) {
        const batch = allCurrentSeats.slice(i, i + batchSize);
        try {
          console.log(
            `Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
              allCurrentSeats.length / batchSize
            )}: ${batch.length} seats`
          );
          await this.batchDeleteSeats(showId, batch);
        } catch (error) {
          console.warn("Batch delete failed, continuing...");
        }
      }

      console.log("🏗️  Step 2: Creating new clean layout...");

      // Create new seats with clean layout
      const result = await this.createMissingSeats(showId, newSeatLayout);

      console.log("✅ CLEAN MIGRATION COMPLETE!");
      return result;
    } catch (error) {
      console.error("Clean migration failed:", error);
      throw error;
    }
  },
};

// Make debug utils available globally in development
if (process.env.NODE_ENV === "development") {
  window.seatDebug = seatDebugUtils;
  console.log(`
=== SEAT DEBUG FUNCTIONS LOADED ===

Usage:
1. seatDebug.debugShowSeats(showId) - Check what seats exist for a show
2. seatDebug.checkSpecificSeats(showId, ['A1', 'A2']) - Check if specific seats exist
3. seatDebug.fixShowsWithoutSeats() - Fix shows that don't have seats
4. seatDebug.makeAllSeatsAvailable() - Make all seats available
5. seatDebug.cleanupDuplicates(showId) - Clean up duplicate seats
6. seatDebug.getSeatStatistics() - Get overall seat statistics
7. seatDebug.createMissingSeats(showId, ['A1', 'A2']) - Create missing seats
8. seatDebug.recreateAllSeats(showId, ['A1', 'A2', 'A3']) - Recreate all seats (DANGER!)
9. seatDebug.removeDuplicateSeats(showId) - Remove duplicate seats (CRITICAL!)
10. seatDebug.batchDeleteSeats(showId, ['A1', 'A2']) - Delete specific seats
11. seatDebug.cleanMigration(showId, seatLayout) - Complete clean migration

Example:
seatDebug.debugShowSeats(232)
seatDebug.removeDuplicateSeats(232)  // FIX YOUR DUPLICATES FIRST!
seatDebug.createMissingSeats(232, ['A1', 'A2', 'A3', 'A4', 'A5'])
    `);
}

export default seatDebugUtils;
