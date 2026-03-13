# Server (FastAPI + aiortc)

Implements a **WebRTC video loopback** server: it accepts an SDP offer from the mobile
client, adds an outgoing video track that echoes back the client's camera stream, and
returns an SDP answer.  A `VideoPassthroughTrack` (in `app/video_transform.py`) forwards
frames unchanged — replace it with your AI transform to add face-swap later.

## Prerequisites
- Windows 11
- Python 3.10+
- `pip` (bundled with Python installer)

> **Note:** `aiortc` / `av` need native libraries on Windows.  
> Install [Microsoft C++ Build Tools](https://aka.ms/vs/17/release/vs_BuildTools.exe)
> (select *Desktop development with C++*) **before** running `pip install`.

## Run (Windows 11 — PowerShell)

```powershell
cd apps\server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The server listens on all interfaces so the Android emulator (`10.0.2.2`) and real
devices on the same LAN can reach it.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/webrtc/offer` | Accept JSON `{sdp, type}`, return SDP answer |
| `GET`  | `/webrtc/health` | Returns `{"ok": true, "pcs": <active connections>}` |

Health check URLs:
- PC: `http://localhost:8000/webrtc/health`
- Android emulator: `http://10.0.2.2:8000/webrtc/health`
- Real device (same LAN): `http://<PC_LAN_IP>:8000/webrtc/health`

## Windows Firewall
Allow inbound TCP on port **8000** for Private networks so the mobile device can reach the
server:

```powershell
New-NetFirewallRule -DisplayName "face-swap FastAPI" -Direction Inbound `
  -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private
```

## Next milestone
Replace `VideoPassthroughTrack` in `app/video_transform.py` with an AI transform that
processes each `VideoFrame` before returning it.
