from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

import os  # noqa: E402

from fastapi import APIRouter, FastAPI  # noqa: E402
from starlette.middleware.cors import CORSMiddleware  # noqa: E402

from core.db import client, db  # noqa: E402
from routes import ai, drafts, library, newsletter  # noqa: E402
from seed import seed_library  # noqa: E402


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await db.drafts.create_index([("client_id", 1), ("created_at", -1)])
    await db.usage.create_index([("ip", 1), ("date", 1)], unique=True)
    await db.subscribers.create_index("email", unique=True)
    await db.library_hooks.create_index("number")
    await seed_library()
    yield
    client.close()


app = FastAPI(title="HookLink API", lifespan=lifespan)

api = APIRouter(prefix="/api")


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
