# Face Swap Live — Monorepo

End-to-end **WebRTC live video** between a browser-based PC client and a Python
FastAPI + aiortc server.

**Current supported client:** PC web browser (`apps/web/`) — Chrome / Edge on Windows 11.  
**Milestone 1 (current):** server echoes the client's camera video back (loopback).  
**Next milestone:** insert an AI face-swap transform inside `apps/server/app/video_transform.py`.

> **Mobile note:** `apps/mobile/` (React Native) is present in the repo but is
> **not used for the current testing phase**.  Mobile support will be revisited
> once the PC loopback is validated.

---

## Monorepo structure

```
face-swap-live/
├── apps/
│   ├── server/          # Python – FastAPI + aiortc
│   ├── web/             # PC browser WebRTC client  ← active client
│   └── mobile/          # React Native (not used for now)
├── scripts/
│   └── dev.ps1          # Windows dev convenience script
└── README.md
```

---

## Prerequisites

### Server (Windows 11)
| Requirement | Version |
|---|---|
| Python | 3.10+ |
| pip | bundled with Python |
| Microsoft C++ Build Tools | required by `aiortc` / `av` on Windows |

> Install [C++ Build Tools](https://aka.ms/vs/17/release/vs_BuildTools.exe) →
> select **Desktop development with C++** before running `pip install`.

### Web client
No build step needed — it is a plain HTML/JS file served by Python's built-in
HTTP server.  A modern browser (Chrome or Edge) with a webcam is all you need.

---

## PC-only quick start (Windows 11)

### Step 1 — Start the server

```powershell
cd apps\server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Confirm it is running:

```
http://localhost:8000/webrtc/health
```

Expected response: `{"ok": true, "pcs": 0}`

### Step 2 — Serve the web client

Open a **second** terminal in the repo root:

```powershell
python -m http.server 5173
```

### Step 3 — Open in Chrome / Edge

```
http://localhost:5173/apps/web/index.html
```

Click **▶ Start** and allow camera access when prompted.

### Dev convenience script (optional)

`scripts/dev.ps1` handles venv activation, starts uvicorn, and prints the
static-server command for you:

```powershell
.\scripts\dev.ps1
```

---

## What you should see

| Element | Expected |
|---|---|
| **Local** video | Your webcam feed |
| **Remote** video | Same feed echoed back by the server (slight latency) |
| **Log** | ICE / connection state ending in `connected` |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Camera permission denied | Allow camera in browser popup; or open `chrome://settings/content/camera` |
| Remote video stays black | Check server console for errors; confirm `/webrtc/health` returns `ok: true` |
| `fetch` fails / CORS error | Ensure the server is running on `localhost:8000` |
| Mixed-content blocked | Both servers must use `http://` on localhost (no `https` mismatch needed) |
| `getUserMedia` not available | Must open the page via `http://localhost`; `file://` URLs don't expose camera API |
| `pip install av` fails on Windows | Install [C++ Build Tools](https://aka.ms/vs/17/release/vs_BuildTools.exe) |
| Port 8000 blocked | No firewall rule needed for localhost testing |

---

## Mobile (`apps/mobile/`) — not used for now

The React Native Bare client is kept in the repo for future reference.
It will be revisited after the PC loopback milestone is complete.
For mobile-specific notes see `apps/mobile/` and the previous README sections.

---

See `apps/server/README.md` and `apps/web/README.md` for component-specific details.
