#!/usr/bin/env python3
"""
Schedules a week of shows for every active film, through the CineBook admin API.

    python3 scripts/schedule_shows.py                 # 7 days from today (Hyderabad)
    python3 scripts/schedule_shows.py 2026-10-06 7    # 7 days from 6 Oct
    python3 scripts/schedule_shows.py --dry-run       # only show what it would create

Each theater runs every screen at 10:30, 14:15, 18:45 and 22:00; films rotate so each
gets the same number of shows per day. Shows that already exist are skipped, so it's
safe to run again. Reads ADMIN_USERNAME / ADMIN_PASSWORD from .env; the backend must
be running (API_URL, default http://localhost:8080).
"""
import datetime, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = os.environ.get("API_URL", "http://localhost:8080").rstrip("/")
TIMES = ["10:30", "14:15", "18:45", "22:00"]


def env():
    values = {}
    with open(os.path.join(ROOT, ".env")) as f:
        for line in f:
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                values[k.strip()] = v.strip()
    return values


def call(method, path, body=None, token=None):
    req = urllib.request.Request(API + path, method=method,
                                 data=None if body is None else json.dumps(body).encode())
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            return res.status, json.loads(res.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, {"message": e.read().decode()[:200]}


def main():
    dry_run = "--dry-run" in sys.argv
    sys.argv = [a for a in sys.argv if a != "--dry-run"]
    today = datetime.datetime.now(ZoneInfo("Asia/Kolkata")).date()
    start = datetime.date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else today
    days = int(sys.argv[2]) if len(sys.argv) > 2 else 7

    creds = env()
    status, login = call("POST", "/auth/login", {"username": creds["ADMIN_USERNAME"], "password": creds["ADMIN_PASSWORD"]})
    token = login.get("token") or (login.get("data") or {}).get("token")
    if not token:
        sys.exit(f"Staff login failed ({status}): {login.get('message')}")

    films = [m["id"] for m in call("GET", "/api/movies")[1]["data"] if m.get("status") == "Active"]
    theaters = call("GET", "/api/theaters")[1]["data"]
    # shows already at each theater and time, of any film (active or not), so screens are never double-booked
    busy = {}
    for m in call("GET", "/api/movies")[1]["data"]:
        for s in call("GET", f"/api/movies/{m['id']}/shows")[1]["data"]:
            key = (s["theater"]["id"], s["showTime"][:16])
            busy[key] = busy.get(key, 0) + 1

    now = datetime.datetime.now(ZoneInfo("Asia/Kolkata")).replace(tzinfo=None)
    plan = []
    for d in range(days):
        day = start + datetime.timedelta(days=d)
        slot = 0
        for t in theaters:
            for time in TIMES:
                at = f"{day}T{time}"
                free = (t.get("numberOfScreens") or 1) - busy.get((t["id"], at), 0)
                for screen in range(t.get("numberOfScreens") or 1):
                    film = films[(slot + day.toordinal()) % len(films)]
                    slot += 1
                    if screen >= free or datetime.datetime.fromisoformat(at) <= now:
                        continue
                    plan.append({"movie": {"id": film}, "theater": {"id": t["id"]},
                                 "showTime": at + ":00", "ticketPrice": 250})

    print(f"{len(films)} films, {len(theaters)} theaters, {start} for {days} days: {len(plan)} shows to create")
    if dry_run:
        for show in plan[:12]:
            print("  ", show["showTime"], "film", show["movie"]["id"], "theater", show["theater"]["id"])
        print("Dry run: nothing created.")
        return
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(lambda s: call("POST", "/api/shows", s, token), plan))
    failed = [(s["showTime"], r[1].get("message")) for s, r in zip(plan, results) if r[0] not in (200, 201)]
    print(f"created {len(plan) - len(failed)}, failed {len(failed)}")
    for f in failed[:5]:
        print("  ", f)


if __name__ == "__main__":
    main()
