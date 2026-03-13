import asyncio
from typing import Any, Dict

from aiortc import RTCPeerConnection, RTCSessionDescription
from fastapi import APIRouter
from pydantic import BaseModel

from .video_transform import VideoPassthroughTrack

router = APIRouter()

# Active peer connections – accessed only from the asyncio event loop, so a plain
# set is safe here (no thread contention in a single-process uvicorn deployment).
pcs: set = set()
_pcs_lock = asyncio.Lock()


class Offer(BaseModel):
    sdp: str
    type: str


@router.post("/offer")
async def offer(offer: Offer) -> Dict[str, Any]:
    pc = RTCPeerConnection()
    async with _pcs_lock:
        pcs.add(pc)

    @pc.on("track")
    async def on_track(track):
        if track.kind == "video":
            # Echo the incoming video back to the client (loopback).
            # Replace VideoPassthroughTrack with a transform track to add face-swap.
            pc.addTrack(VideoPassthroughTrack(track))

        @track.on("ended")
        async def on_ended():
            pass

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        if pc.connectionState in ("failed", "closed", "disconnected"):
            await pc.close()
            async with _pcs_lock:
                pcs.discard(pc)

    await pc.setRemoteDescription(RTCSessionDescription(sdp=offer.sdp, type=offer.type))
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}


@router.get("/health")
async def health():
    async with _pcs_lock:
        count = len(pcs)
    return {"ok": True, "pcs": count}
