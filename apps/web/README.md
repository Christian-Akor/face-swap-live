# Face Swap Live — PC Web Client (`apps/web`)

A minimal, framework-free browser WebRTC client for **PC-only testing** of the
FastAPI + aiortc loopback server.  Works in **Chrome / Edge on Windows 11**.

---

## Quick start

### 1 — Start the server

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

### 2 — Serve the web client

Open a second terminal in the **repo root** and run:

```powershell
python -m http.server 5173
```

### 3 — Open in browser

```
http://localhost:5173/apps/web/index.html
```

Click **▶ Start** and allow camera access when prompted.

---

## What you should see

| Element | Expected |
|---|---|
| **Local** | Your webcam video |
| **Remote** | Same video echoed back by the server (slight latency) |
| **Log** | ICE/connection state transitions ending in `connected` |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Camera permission denied | Allow camera in browser popup; or open `chrome://settings/content/camera` |
| Remote video stays black | Check server console for errors; verify `/webrtc/health` is reachable |
| `fetch` fails with CORS error | Ensure server is running on the same host (`localhost`) |
| Mixed-content error | Both static server and API server must use `http://` on localhost |
| `getUserMedia` not available | Must be served over `http://localhost` or `https://`; `file://` does not work |

---

## How it works

1. `getUserMedia({video:true})` — captures your webcam.
2. `RTCPeerConnection` — creates a peer connection with a Google STUN server.
3. Local tracks are added and a `recvonly` transceiver is added to tell the server
   to send video back.
4. An SDP offer is created and `POST`-ed to `/webrtc/offer` on the FastAPI server.
5. The server creates a loopback track (`VideoTransformTrack`) and returns an SDP answer.
6. The remote description is applied; ICE negotiation completes and both streams appear.
