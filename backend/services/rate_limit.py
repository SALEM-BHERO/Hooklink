import os
from datetime import datetime, timezone

from fastapi import HTTPException, Request
from pymongo.errors import DuplicateKeyError

from core.db import db

DAILY_LIMIT = int(os.environ["DAILY_GENERATION_LIMIT"])


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    return fwd.split(",")[0].strip() if fwd else request.client.host


def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


async def get_usage(ip: str) -> dict:
    doc = await db.usage.find_one({"ip": ip, "date": _today()}, {"_id": 0, "count": 1})
    used = doc["count"] if doc else 0
    return {"used": used, "limit": DAILY_LIMIT, "remaining": max(DAILY_LIMIT - used, 0)}


async def reserve(ip: str) -> None:
    key = {"ip": ip, "date": _today()}
    res = await db.usage.update_one({**key, "count": {"$lt": DAILY_LIMIT}}, {"$inc": {"count": 1}})
    if res.modified_count:
        return
    try:
        await db.usage.insert_one({**key, "count": 1})
    except DuplicateKeyError:
        raise HTTPException(429, "Daily limit reached. Please come back tomorrow!")


async def refund(ip: str) -> None:
    await db.usage.update_one({"ip": ip, "date": _today(), "count": {"$gt": 0}}, {"$inc": {"count": -1}})
