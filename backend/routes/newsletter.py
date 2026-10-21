from fastapi import APIRouter

from core.db import db
from models import NewsletterRequest, Subscriber

router = APIRouter(prefix="/newsletter")


@router.post("")
async def subscribe(body: NewsletterRequest):
    email = body.email.lower()
    if await db.subscribers.find_one({"email": email}):
        return {"subscribed": True, "already": True}
    await db.subscribers.insert_one(Subscriber(email=email).to_mongo())
    return {"subscribed": True, "already": False}
