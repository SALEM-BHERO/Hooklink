import re

from typing import Literal

from fastapi import APIRouter, Query

from core.db import db
from models import LibraryHook

router = APIRouter(prefix="/library")


@router.get("")
async def list_hooks(
    category: str = "all",
    platform: Literal["all", "linkedin", "instagram", "facebook", "x", "threads", "tiktok", "youtube"] = "all",
    q: str = "",
    skip: int = Query(0, ge=0),
    limit: int = Query(8, ge=1, le=50),
):
    query = {}
    if category != "all":
        query["category"] = category
    if platform != "all":
        query["platforms"] = platform
    if q.strip():
        rx = {"$regex": re.escape(q.strip()), "$options": "i"}
        query["$or"] = [{"text": rx}, {"theme": rx}, {"title": rx}, {"category_label": rx}]
    total = await db.library_hooks.count_documents(query)
    cursor = db.library_hooks.find(query).sort("number", 1).skip(skip).limit(limit)
    items = [LibraryHook.from_mongo(d).to_api() async for d in cursor]
    return {"items": items, "total": total, "skip": skip, "limit": limit}
