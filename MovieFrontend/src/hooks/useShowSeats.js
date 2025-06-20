// src/hooks/useShowSeats.js
import { useEffect, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const API_BASE = "http://localhost:8080";

export default function useShowSeats(showId, jwtToken) {
  const [seats, setSeats] = useState({}); // { "A1": { seatNumber:"A1", status:"AVAILABLE", ... }, ... }
  const [error, setError] = useState(null);

  // fetch initial seat map
  const loadSeats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/seats/show/${showId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const dto = await res.json(); // { showId, seats: { "A1": SeatDTO, ... } }
      setSeats(dto.seats);
    } catch (e) {
      setError(e.message);
    }
  }, [showId, jwtToken]);

  useEffect(() => {
    loadSeats();
  }, [loadSeats]);

  // subscribe to live updates
  useEffect(() => {
    const socket = new SockJS(`${API_BASE}/ws`);
    const client = Stomp.over(socket);

    client.connect({ Authorization: `Bearer ${jwtToken}` }, () => {
      client.subscribe(
        `/topic/seat-updates/${showId}`,
        (message) => {
          const update = JSON.parse(message.body);
          setSeats((prev) => {
            const next = { ...prev };
            update.seatNumbers.forEach((num) => {
              if (next[num]) next[num].status = update.status;
            });
            return next;
          });
        },
        // error handler
        (err) => console.error("STOMP error", err)
      );
    });

    return () => client.disconnect();
  }, [showId, jwtToken]);

  return { seats, error, reload: loadSeats };
}
