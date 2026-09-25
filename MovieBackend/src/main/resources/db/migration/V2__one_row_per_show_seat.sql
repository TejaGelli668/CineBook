-- Each seat can appear only once per show. The seat map used to allow
-- duplicates (the admin "Seat repair" page existed to clean them up); the
-- database now refuses them outright.

-- Remove any existing duplicates first, keeping the most important row:
-- booked, then held, then the oldest.
DELETE FROM show_seats
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               row_number() OVER (
                   PARTITION BY show_id, seat_id
                   ORDER BY CASE status WHEN 'BOOKED' THEN 0 WHEN 'LOCKED' THEN 1 ELSE 2 END, id
               ) AS copy_number
        FROM show_seats
    ) ranked
    WHERE copy_number > 1
);

ALTER TABLE show_seats
    ADD CONSTRAINT uk_show_seats_show_seat UNIQUE (show_id, seat_id);
