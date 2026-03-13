from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .webrtc import router as webrtc_router

app = FastAPI(title="face-swap-live server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only – restrict in production
    allow_credentials=False,  # must be False when allow_origins="*"
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webrtc_router, prefix="/webrtc")
