from core.db import db
from seed import seed_library

_ready = False


async def ensure_ready():
    global _ready
    if _ready:
        return
    await db.drafts.create_index([("client_id", 1), ("created_at", -1)])
    await db.usage.create_index([("ip", 1), ("date", 1)], unique=True)
    await db.subscribers.create_index("email", unique=True)
    await db.library_hooks.create_index("number")
    await seed_library()
    _ready = True
