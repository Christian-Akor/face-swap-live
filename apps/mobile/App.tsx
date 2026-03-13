import React, {useRef, useState} from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc';

// ─── Configuration ────────────────────────────────────────────────────────────
// Android emulator → 10.0.2.2 (maps to host loopback)
// Real device on LAN → your PC's Wi-Fi IPv4 (e.g. "192.168.1.20")
const SERVER_HOST = '10.0.2.2';
const SIGNALING_URL = `http://${SERVER_HOST}:8000/webrtc/offer`;
// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<string>('idle');

  const start = async () => {
    try {
      setStatus('starting');

      // 1. Capture front camera (video only)
      const stream = (await mediaDevices.getUserMedia({
        audio: false,
        video: {facingMode: 'user'},
      })) as MediaStream;
      setLocalStream(stream);

      // 2. Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
      });
      pcRef.current = pc;

      // 3. Handle incoming remote stream (server loopback)
      pc.ontrack = (event: any) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // 4. Add local tracks to the connection
      stream.getTracks().forEach((track: any) => pc.addTrack(track, stream));

      // 5. Create offer and set local description
      const offer = await pc.createOffer({});
      await pc.setLocalDescription(offer);

      // 6. Send offer to server and get answer
      const response = await fetch(SIGNALING_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({sdp: offer.sdp, type: offer.type}),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Signaling error ${response.status}: ${text}`);
      }

      const answer = await response.json();

      // 7. Apply server answer
      await pc.setRemoteDescription(
        new RTCSessionDescription({type: answer.type, sdp: answer.sdp}),
      );

      setStatus('connected');
    } catch (err: any) {
      console.error('WebRTC error:', err);
      Alert.alert('Connection Error', err?.message ?? String(err));
      setStatus('error');
    }
  };

  const stop = () => {
    setStatus('stopping');
    pcRef.current?.close();
    pcRef.current = null;

    localStream?.getTracks?.().forEach((t: any) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setStatus('idle');
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Face Swap Live</Text>
      <Text style={styles.status}>Status: {status}</Text>

      <View style={styles.buttonRow}>
        <Button title="Start" onPress={start} disabled={status === 'connected'} />
        <Button title="Stop" onPress={stop} disabled={status === 'idle'} />
      </View>

      <View style={styles.videoRow}>
        <View style={styles.videoBox}>
          <Text style={styles.label}>Local (camera)</Text>
          {localStream ? (
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.video}
              objectFit="cover"
              mirror
            />
          ) : (
            <View style={[styles.video, styles.placeholder]} />
          )}
        </View>

        <View style={styles.videoBox}>
          <Text style={styles.label}>Remote (server)</Text>
          {remoteStream ? (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={styles.video}
              objectFit="cover"
            />
          ) : (
            <View style={[styles.video, styles.placeholder]} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#fff', padding: 12},
  title: {fontSize: 20, fontWeight: '700', marginBottom: 4, textAlign: 'center'},
  status: {fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 8},
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  videoRow: {flex: 1, flexDirection: 'row', gap: 8},
  videoBox: {flex: 1},
  label: {fontSize: 12, color: '#333', marginBottom: 4, textAlign: 'center'},
  video: {width: '100%', aspectRatio: 3 / 4, borderRadius: 8},
  placeholder: {backgroundColor: '#222'},
});
