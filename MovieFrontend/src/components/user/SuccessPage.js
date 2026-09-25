import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Share2, CalendarPlus } from "lucide-react";
import { TopBar, BookingSteps, FilmBackdrop } from "../ui/Chrome";
import "./booking.css";

// "6:45 PM" → { h: 18, m: 45 }
const parseShowTime = (label = "") => {
  const match = String(label).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return { h: 0, m: 0 };
  let h = parseInt(match[1], 10) % 12;
  if ((match[3] || "").toUpperCase() === "PM") h += 12;
  if (!match[3]) h = parseInt(match[1], 10);
  return { h, m: parseInt(match[2], 10) };
};

const SuccessPage = ({ bookingData, onBackToHome }) => {
  const [qr, setQr] = useState("");

  // Snacks, looked up in the live menu passed through the booking flow
  const beverageItems = Object.entries(bookingData.beverages || {})
    .map(([itemId, quantity]) => {
      const item = bookingData.foodItems?.find(
        (food) => food.id === parseInt(itemId)
      );
      return item && quantity > 0
        ? { ...item, quantity, totalPrice: item.price * quantity }
        : null;
    })
    .filter(Boolean);

  const totalPrice = bookingData.totalPrice || 0;
  const seats = bookingData.seats || [];
  const bookingId =
    bookingData.bookingId ||
    bookingData.bookingDetails?.bookingId ||
    bookingData.bookingResponse?.bookingId ||
    `BKG${Date.now()}`;
  const paymentId = bookingData.paymentId || "";
  const movieTitle = bookingData.movie?.title || "Your film";
  const theaterName = bookingData.theater?.name || "";
  const showDate = bookingData.date
    ? new Date(`${bookingData.date}T00:00:00`)
    : null;
  const showDateLabel = showDate
    ? showDate.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  const qrData = JSON.stringify({
    bookingId,
    movie: movieTitle,
    theater: theaterName,
    date: bookingData.date,
    time: bookingData.showTime,
    seats,
    total: totalPrice,
  });

  useEffect(() => {
    QRCode.toDataURL(qrData, {
      margin: 1,
      width: 240,
      color: { dark: "#2a1630", light: "#fff6e9" },
    })
      .then(setQr)
      .catch((e) => console.error("QR generation failed:", e));
  }, [qrData]);

  // A downloadable copy of the same ticket
  const handleDownload = async () => {
    try {
      await document.fonts?.ready;
      const W = 1200;
      const H = 560;
      const STUB = 330;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      const display = (weight, size) =>
        `${weight} ${size}px "Big Shoulders Display", "Arial Narrow", sans-serif`;
      const body = (weight, size) =>
        `${weight} ${size}px Archivo, Arial, sans-serif`;

      // paper with punched notches at the tear line
      ctx.fillStyle = "#1c1535";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#f6c4d0";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(0, 0, W, H, 18) : ctx.rect(0, 0, W, H);
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      [0, H].forEach((y) => {
        ctx.beginPath();
        ctx.arc(W - STUB, y, 26, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = "rgba(42,22,48,0.35)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W - STUB, 36);
      ctx.lineTo(W - STUB, H - 36);
      ctx.stroke();
      ctx.setLineDash([]);

      const ink = "#2a1630";
      const soft = "rgba(42,22,48,0.65)";
      const x = 60;
      ctx.fillStyle = ink;
      ctx.font = display(900, 44);
      ctx.fillText("CineBook", x, 84);
      ctx.font = body(400, 22);
      ctx.fillStyle = soft;
      ctx.textAlign = "right";
      ctx.fillText("సినిమా టికెట్", W - STUB - 50, 82);
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(42,22,48,0.28)";
      ctx.fillRect(x, 104, W - STUB - 110, 3);

      ctx.fillStyle = "#d92b3a";
      ctx.font = display(800, 32);
      ctx.fillText(`Admit ${seats.length}`, x, 160);
      ctx.fillStyle = ink;
      let size = 76;
      ctx.font = display(900, size);
      const title = movieTitle.toUpperCase();
      while (ctx.measureText(title).width > W - STUB - 120 && size > 36) {
        size -= 4;
        ctx.font = display(900, size);
      }
      ctx.fillText(title, x, 160 + size);

      const fields = [
        ["Cinema", theaterName],
        ["Show", `${showDate ? showDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}, ${bookingData.showTime || ""}`],
        ["Seats", seats.join(", ")],
        ["Paid", `₹${totalPrice}`],
      ];
      fields.forEach(([label, value], i) => {
        const fx = x + (i % 2) * 380;
        const fy = 330 + Math.floor(i / 2) * 92;
        ctx.fillStyle = soft;
        ctx.font = body(400, 22);
        ctx.fillText(label, fx, fy);
        ctx.fillStyle = ink;
        ctx.font = body(700, 30);
        ctx.fillText(String(value), fx, fy + 38, 350);
      });

      // stamp
      ctx.save();
      ctx.translate(W - STUB - 170, 250);
      ctx.rotate((-11 * Math.PI) / 180);
      ctx.strokeStyle = "rgba(217,43,58,0.85)";
      ctx.lineWidth = 5;
      ctx.strokeRect(-90, -38, 180, 76);
      ctx.lineWidth = 2;
      ctx.strokeRect(-82, -30, 164, 60);
      ctx.fillStyle = "rgba(217,43,58,0.85)";
      ctx.font = display(900, 46);
      ctx.textAlign = "center";
      ctx.fillText("PAID", 0, 16);
      ctx.restore();

      // stub: QR + booking id
      const qrCanvas = document.createElement("canvas");
      await QRCode.toCanvas(qrCanvas, qrData, {
        width: 230,
        margin: 1,
        color: { dark: "#2a1630", light: "#fff6e9" },
      });
      ctx.drawImage(qrCanvas, W - STUB + 50, 110);
      ctx.fillStyle = ink;
      ctx.textAlign = "center";
      ctx.font = body(400, 20);
      ctx.fillText("Show this at the entrance", W - STUB / 2, 380);
      ctx.fillStyle = "#d92b3a";
      ctx.font = display(800, 30);
      ctx.fillText(`No. ${bookingId}`, W - STUB / 2, 430, STUB - 40);
      ctx.textAlign = "left";

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cinebook-ticket-${bookingId}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error("Error generating ticket:", error);
      alert("The ticket image couldn't be created. Try again.");
    }
  };

  const shareText = `I'm watching ${movieTitle} at ${theaterName}${
    showDateLabel ? ` on ${showDateLabel}` : ""
  }, ${bookingData.showTime || ""}.`;
  const [shared, setShared] = useState("");

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${movieTitle} tickets`, text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShared("Plan copied. Paste it to your friends.");
      }
    } catch {
      /* the person closed the share sheet */
    }
  };

  const handleAddToCalendar = () => {
    if (!showDate) return;
    const { h, m } = parseShowTime(bookingData.showTime);
    const start = new Date(showDate);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      movieTitle
    )}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(
      `Seats: ${seats.join(", ")}\nBooking: ${bookingId}`
    )}&location=${encodeURIComponent(theaterName)}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="cb-app cb-app--film">
        <FilmBackdrop movie={bookingData.movie} />
      <TopBar title="You're booked" sub={`Booking ${bookingId}`}>
        <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm" onClick={onBackToHome}>
          Done
        </button>
      </TopBar>
      <BookingSteps current="Ticket" />

      <main className="cb-main cb-confirm">
        <p className="cb-muted">
          {seats.length} {seats.length === 1 ? "seat" : "seats"} confirmed.
          Show this ticket at the entrance{beverageItems.length ? " and at the canteen counter" : ""}.
        </p>

        <div className="cb-slot cb-confirm__slot">
          <article className="cb-ticket cb-ticket--issued" aria-label={`Ticket for ${movieTitle}`}>
            <div className="cb-ticket__main">
              <div className="cb-ticket__head">
                <span className="cb-ticket__brand">CineBook</span>
                <span className="cb-ticket__te" lang="te">
                  సినిమా టికెట్
                </span>
              </div>
              <p className="cb-ticket__admit">Admit {seats.length}</p>
              <h2 className="cb-ticket__film">{movieTitle}</h2>
              <dl className="cb-ticket__fields">
                <div>
                  <dt>Cinema</dt>
                  <dd>{theaterName || "—"}</dd>
                </div>
                <div>
                  <dt>Show</dt>
                  <dd>
                    {showDate
                      ? showDate.toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })
                      : ""}
                    {bookingData.showTime && `, ${bookingData.showTime}`}
                  </dd>
                </div>
                <div>
                  <dt>Seats</dt>
                  <dd>{seats.join(", ") || "—"}</dd>
                </div>
                <div>
                  <dt>Paid</dt>
                  <dd>₹{totalPrice}</dd>
                </div>
                <span className="cb-stamp" aria-hidden="true">
                  Paid
                </span>
              </dl>
              {beverageItems.length > 0 && (
                <div className="cb-confirm__snacks">
                  <p>Canteen order</p>
                  <ul>
                    {beverageItems.map((item) => (
                      <li key={item.id}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="cb-ticket__stub cb-confirm__stub">
              {qr ? (
                <img src={qr} alt={`QR code for booking ${bookingId}`} />
              ) : (
                <span className="cb-spinner" />
              )}
              <span className="cb-ticket__serial">No. {bookingId}</span>
            </div>
          </article>
        </div>

        <div className="cb-confirm__actions">
          <button type="button" className="cb-btn cb-btn--stamp" onClick={handleDownload}>
            <Download size={16} aria-hidden="true" />
            Download ticket
          </button>
          <button type="button" className="cb-btn cb-btn--ghost" onClick={handleAddToCalendar}>
            <CalendarPlus size={16} aria-hidden="true" />
            Add to calendar
          </button>
          <button type="button" className="cb-btn cb-btn--ghost" onClick={handleShare}>
            <Share2 size={16} aria-hidden="true" />
            Share plan
          </button>
        </div>
        {shared && <p className="cb-muted cb-small" role="status">{shared}</p>}

        <dl className="cb-confirm__meta cb-muted cb-small">
          {paymentId && (
            <div>
              <dt>Payment reference</dt>
              <dd>{paymentId}</dd>
            </div>
          )}
          <div>
            <dt>Paid by</dt>
            <dd>{bookingData.paymentMethod === "stripe" ? "Card (Stripe)" : bookingData.paymentMethod || "Card"}</dd>
          </div>
        </dl>

        <button type="button" className="cb-link" onClick={onBackToHome}>
          Book another film
        </button>
      </main>
    </div>
  );
};

export default SuccessPage;
