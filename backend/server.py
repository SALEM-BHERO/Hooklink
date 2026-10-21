from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

import os  # noqa: E402

from fastapi import APIRouter, Depends, FastAPI  # noqa: E402
from starlette.middleware.cors import CORSMiddleware  # noqa: E402

from core.setup import ensure_ready  # noqa: E402
from routes import ai, drafts, library, newsletter  # noqa: E402

app = FastAPI(title="HookLink API")

api = APIRouter(prefix="/api", dependencies=[Depends(ensure_ready)])


@api.get("/")
async def health():
    return {"status": "ok", "service": "hooklink"}


for r in (ai.router, drafts.router, library.router, newsletter.router):
    api.include_router(r)

app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ["CORS_ORIGINS"].split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
