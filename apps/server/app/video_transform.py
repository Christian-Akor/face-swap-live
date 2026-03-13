from aiortc import MediaStreamTrack
from av import VideoFrame


class VideoPassthroughTrack(MediaStreamTrack):
    """
    Receives a remote video track and forwards frames unchanged.
    Later we'll replace this with the face-swap transform.
    """

    kind = "video"

    def __init__(self, source_track: MediaStreamTrack):
        super().__init__()
        self.track = source_track

    async def recv(self) -> VideoFrame:
        frame = await self.track.recv()
        return frame
