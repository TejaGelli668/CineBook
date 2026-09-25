import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, RotateCcw, Mic, MicOff, ArrowUp, Ticket, Sparkles } from "lucide-react";
import { getMovies, formatMovieData } from "../../utils/movieAPI";
import Card from "./ConciergeCards";
import "./concierge.css";

// The two assistants share this window: customers get the box office concierge,
// staff at /admin get the manager's assistant.
const MODES = {
  customer: {
    api: "http://localhost:8080/api/chat",
    store: "cb:concierge",
    token: () => localStorage.getItem("userToken") || localStorage.getItem("authToken"),
    title: "Box office",
    sub: "Films, seats, snacks and bookings",
    launch: "Ask CineBook",
    hello: "Namaskaram!",
    intro: "Tell me what you'd like to watch. I'll find the show, pick the best seats and get your order ready. You confirm and pay.",
    placeholder: "Ask in English, తెలుగు or हिंदी",
    starters: ["What's playing tonight?", "2 seats for a Telugu film tomorrow", "Show my ticket", "What snacks can I get?"],
  },
  admin: {
    api: "http://localhost:8080/api/admin/chat",
    store: "cb:manager-assistant",
    token: () => localStorage.getItem("adminToken"),
    title: "Assistant",
    sub: "Occupancy, sales, films and schedules",
    launch: "Assistant",
    hello: "Good to see you.",
    intro: "Ask about how full shows are, what sold, or tell me what to add. Anything that changes the catalogue waits for your Confirm.",
    placeholder: "e.g. Which shows tonight are under 20% full?",
    starters: [
      "Which shows tonight are under 20% full?",
      "Sales this week",
      "Add Pushpa 2 from TMDB",
      "Schedule Irumudi at Hitec daily 10:30 and 18:45 for a week",
    ],
  },
};

const newSessionId = () =>
  (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9-]/g, "");

const load = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key)) || null;
  } catch {
    return null;
  }
};

// Parse one server-sent event block ("event: x\ndata: {...}")
const parseEvent = (block) => {
  let event = "message";
  const data = [];
  block.split("\n").forEach((line) => {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
  });
  try {
    return { event, data: JSON.parse(data.join("\n")) };
  } catch {
    return null;
  }
};

// The model sometimes still writes **bold** or *italic*; show it as emphasis, never raw asterisks
const Rich = ({ text }) =>
  String(text)
    .split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
        <em key={i}>{part.slice(1, -1)}</em>
      ) : (
        part
      )
    );

const PAGE_NAMES = {
  home: "home",
  booking: "showtimes",
  seats: "seat map",
  payment: "payment",
  success: "booking confirmed",
  userDashboard: "my bookings",
};

const Concierge = ({
  mode = "customer",
  onMovieSelect,
  onNavigateToPage,
  onShowLogin,
  onCheckout,
  onChanged,
  isUserLoggedIn,
  page,
  movie,
}) => {
  const cfg = MODES[mode];
  const saved = useMemo(() => load(cfg.store), [cfg.store]);
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(saved?.sessionId || newSessionId());
  const [messages, setMessages] = useState(saved?.messages || []);
  const [used, setUsed] = useState(saved?.used || {}); // proposal ids already confirmed or failed
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [status, setStatus] = useState("");
  const [listening, setListening] = useState(false);
  const [films, setFilms] = useState({});
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const recogRef = useRef(null);
  const abortRef = useRef(null);

  const speechSupported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const signedIn = mode === "admin" || isUserLoggedIn;

  useEffect(() => {
    try {
      sessionStorage.setItem(cfg.store, JSON.stringify({ sessionId, messages: messages.slice(-30), used }));
    } catch {
      /* private mode: the chat still works, it just won't survive a reload */
    }
  }, [cfg.store, sessionId, messages, used]);

  // Full film records (served from the server's cache), for opening booking pages
  useEffect(() => {
    if (mode !== "customer" || !open || Object.keys(films).length) return;
    getMovies()
      .then((raw) => setFilms(Object.fromEntries(raw.map((m) => [m.id, formatMovieData(m)]))))
      .catch(() => {});
  }, [mode, open, films]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, status, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const authHeader = () => {
    const token = cfg.token();
    return token && signedIn ? { Authorization: `Bearer ${token}` } : {};
  };

  const filmFor = (item) => films[item.id] || formatMovieData({ ...item, status: "Active" });
  const closeOnPhone = () => window.innerWidth < 640 && setOpen(false);

  const actions = {
    openShow: (show) => {
      onMovieSelect?.({ ...filmFor(show.movie), preselect: { showId: show.showId, date: show.date } });
      closeOnPhone();
    },
    openFilm: (item) => {
      onMovieSelect?.(filmFor(item));
      closeOnPhone();
    },
    ask: (text) => send(text),
    login: () => onShowLogin?.(),
    bookings: () => onNavigateToPage?.("userDashboard"),
    pay: (c) => {
      const beverages = Object.fromEntries(c.food.map((f) => [f.id, f.quantity]));
      onCheckout?.({
        showId: c.showId,
        movie: filmFor(c.movie),
        theater: c.theater,
        date: c.date,
        showTime: c.time,
        seats: c.seats,
        beverages,
        foodItems: c.food.map((f) => ({ ...f, isAvailable: true })),
        ticketPrice: c.ticketTotal,
        beveragePrice: c.foodTotal,
        totalPrice: c.total,
      });
      closeOnPhone();
    },
    confirm: (proposalId) => confirm(proposalId),
    isUsed: (proposalId) => !!used[proposalId],
    confirming,
    signedIn,
  };

  const addReply = (reply) => setMessages((m) => [...m, { from: "cinebook", ...reply }]);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);
    setStatus("Thinking");
    setMessages((m) => [...m, { from: "you", text: question }]);

    const controller = new AbortController();
    abortRef.current = controller;
    let answered = false;
    try {
      const res = await fetch(cfg.api, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Accept: "text/event-stream", ...authHeader() },
        body: JSON.stringify({
          message: question,
          sessionId,
          page: PAGE_NAMES[page] || page,
          movieId: movie?.id ?? null,
          movieTitle: movie?.title ?? null,
        }),
      });
      if (res.status === 401 || res.status === 403) {
        answered = true;
        addReply({ text: "Your sign-in has expired. Sign in again to keep going.", error: true });
        return;
      }
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
        let cut;
        while ((cut = buffer.indexOf("\n\n")) >= 0) {
          const evt = parseEvent(buffer.slice(0, cut));
          buffer = buffer.slice(cut + 2);
          if (!evt) continue;
          if (evt.event === "status") setStatus(evt.data.text);
          if (evt.event === "reply" || evt.event === "error") {
            answered = true;
            addReply({
              text: evt.data.text,
              cards: evt.data.cards || [],
              suggestions: evt.data.suggestions || [],
              error: evt.event === "error",
            });
          }
        }
      }
    } catch (e) {
      if (e.name === "AbortError") return;
    } finally {
      if (!answered && !controller.signal.aborted) {
        addReply({ text: "I couldn't reach the box office. Check your connection and try again.", error: true });
      }
      setBusy(false);
      setStatus("");
    }
  };

  // Runs an action the assistant proposed (hold seats, cancel, import...) after the person taps Confirm
  const confirm = async (proposalId) => {
    if (!signedIn) {
      onShowLogin?.();
      return;
    }
    setConfirming(proposalId);
    try {
      const res = await fetch(`${cfg.api}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ sessionId, proposalId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        onShowLogin?.();
        return;
      }
      setUsed((u) => ({ ...u, [proposalId]: res.ok ? "done" : "failed" }));
      addReply({
        text: data.text || (res.ok ? "Done." : "That didn't work. Ask me again."),
        cards: data.card ? [data.card] : [],
        suggestions: [],
        error: !res.ok,
      });
      if (res.ok && data.changed) onChanged?.();
    } catch {
      addReply({ text: "I couldn't reach the box office. Try the button again.", error: true });
    } finally {
      setConfirming(null);
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setUsed({});
    setSessionId(newSessionId());
    setBusy(false);
    setStatus("");
  };

  const toggleMic = () => {
    if (listening) {
      recogRef.current?.stop();
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new Recognition();
    recog.lang = "en-IN";
    recog.interimResults = true;
    recog.onresult = (e) => {
      const said = Array.from(e.results).map((r) => r[0].transcript).join("");
      setInput(said);
      if (e.results[e.results.length - 1].isFinal) send(said);
    };
    recog.onend = () => setListening(false);
    recog.onerror = () => setListening(false);
    recogRef.current = recog;
    setListening(true);
    recog.start();
  };

  const lastReply = [...messages].reverse().find((m) => m.from === "cinebook");

  return (
    <>
      {!open && (
        <button
          type="button"
          className="cb-cc-launch"
          data-mode={mode}
          onClick={() => setOpen(true)}
          aria-label={mode === "admin" ? "Open the manager's assistant" : "Ask CineBook"}
        >
          {mode === "admin" ? <Sparkles size={20} aria-hidden="true" /> : <Ticket size={20} aria-hidden="true" />}
          <span>{cfg.launch}</span>
        </button>
      )}

      {open && (
        <section className="cb-cc" data-mode={mode} role="dialog" aria-label={cfg.title}>
          <header className="cb-cc__head">
            <span className="cb-cc__bulbs" aria-hidden="true" />
            <div>
              <p className="cb-cc__title">{cfg.title}</p>
              <p className="cb-cc__sub">{cfg.sub}</p>
            </div>
            <div className="cb-cc__tools">
              {messages.length > 0 && (
                <button type="button" onClick={reset} aria-label="Start a new chat" title="New chat">
                  <RotateCcw size={16} />
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="cb-cc__log" ref={logRef} aria-live="polite">
            {messages.length === 0 && (
              <div className="cb-cc__hello">
                <p className="cb-cc__hello-big">{cfg.hello}</p>
                <p>{cfg.intro}</p>
                <div className="cb-cc__chips">
                  {cfg.starters.map((s) => (
                    <button key={s} type="button" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) =>
              m.from === "you" ? (
                <p key={i} className="cb-cc__you">
                  {m.text}
                </p>
              ) : (
                <div key={i} className="cb-cc__bot" data-error={m.error || undefined}>
                  <p className="cb-cc__text">
                    <Rich text={m.text} />
                  </p>
                  {m.cards?.map((card, j) => (
                    <Card key={j} card={card} actions={actions} />
                  ))}
                </div>
              )
            )}

            {busy && (
              <p className="cb-cc__status" role="status">
                <span className="cb-cc__reel" aria-hidden="true" />
                {status}…
              </p>
            )}
          </div>

          {!busy && lastReply?.suggestions?.length > 0 && (
            <div className="cb-cc__chips cb-cc__chips--foot">
              {lastReply.suggestions.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="cb-cc__form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={600}
              placeholder={listening ? "Listening…" : cfg.placeholder}
              aria-label="Your question"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            {speechSupported && (
              <button
                type="button"
                className="cb-cc__mic"
                data-on={listening || undefined}
                onClick={toggleMic}
                aria-label={listening ? "Stop listening" : "Speak your question"}
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <button type="submit" className="cb-cc__send" disabled={busy || !input.trim()} aria-label="Send">
              <ArrowUp size={18} />
            </button>
          </form>
        </section>
      )}
    </>
  );
};

export default Concierge;
