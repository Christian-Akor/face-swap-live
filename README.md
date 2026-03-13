# Face Swap Live — Monorepo

End-to-end **WebRTC live video** between a React Native mobile client and a Python
FastAPI + aiortc server.

**Milestone 1 (current):** server echoes the client's camera video back (loopback).  
**Next milestone:** insert an AI face-swap transform inside `apps/server/app/video_transform.py`.

---

## Monorepo structure

```
face-swap-live/
├── apps/
│   ├── server/          # Python – FastAPI + aiortc
│   └── mobile/          # React Native Bare (Android & iOS)
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

### Mobile (Android & iOS)
| Requirement | Notes |
|---|---|
| Node.js | 18+ |
| JDK 17 | for Android builds |
| Android Studio + SDK | Android emulator / device |
| Xcode (macOS only) | iOS builds require a Mac |

React Native is cross-platform: the **same `apps/mobile/` code** runs on both Android
and iOS.  Building for **Android works on Windows**.  Building for **iOS requires a Mac
with Xcode** — on Windows you can develop the server and the Android app; hand the `ios/`
folder to a Mac for iOS builds.

---

## Running the server (Windows 11)

```powershell
cd apps\server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Verify:
- PC: <http://localhost:8000/webrtc/health>
- Android emulator: <http://10.0.2.2:8000/webrtc/health>
- Real device (same Wi-Fi): `http://<PC_LAN_IP>:8000/webrtc/health`

### Windows Firewall (real device)
Allow inbound TCP 8000 on Private networks:

```powershell
New-NetFirewallRule -DisplayName "face-swap FastAPI" -Direction Inbound `
  -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private
```

---

## Running the mobile app

### Step 1 — Install dependencies
```bash
cd apps/mobile
npm install
```

### Step 2 — Set the server host in `App.tsx`

Open `apps/mobile/App.tsx` and edit `SERVER_HOST`:

| Scenario | Value |
|---|---|
| Android emulator (default) | `10.0.2.2` |
| Real Android/iOS device on LAN | your PC's Wi-Fi IPv4, e.g. `192.168.1.20` |

To find your PC's LAN IP on Windows:
```powershell
ipconfig
# look for "Wireless LAN adapter Wi-Fi" → IPv4 Address
```

### Step 3 — Android (works on Windows)
```bash
# start Metro bundler
npx react-native start

# in a second terminal
npx react-native run-android
```

### Step 4 — iOS (requires macOS + Xcode)
```bash
cd ios
pod install
cd ..
npx react-native run-ios --device
```

**iOS permissions** — add to `apps/mobile/ios/<AppName>/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access for live face-swap preview.</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for live streaming.</string>
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Phone can't reach server | Check Windows Firewall (see above); ensure phone and PC are on same Wi-Fi |
| `pip install av` fails on Windows | Install [C++ Build Tools](https://aka.ms/vs/17/release/vs_BuildTools.exe) |
| App stays "starting" / no remote video | Confirm health endpoint is reachable from the device; check server console for errors |
| `getUserMedia` denied on Android | Accept camera permission dialog; check AndroidManifest permissions |
| iOS build fails on Windows | iOS requires macOS + Xcode; use Android for Windows development |
| Remote stream never appears | Ensure the server is running and loopback track was added (check `/webrtc/health`) |

---

See `apps/server/README.md` for server-specific details.
