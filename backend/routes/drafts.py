from bson import ObjectId
from fastapi import APIRouter, Header, HTTPException

from core.db import db
from models import Draft, DraftUpdate, now_iso

router = APIRouter(prefix="/drafts")


def _oid(draft_id: str) -> ObjectId:
    if not ObjectId.is_valid(draft_id):
        raise HTTPException(404, "Draft not found")
    return ObjectId(draft_id)


@router.get("")
async def list_drafts(x_client_id: str = Header(...), limit: int = 20):
    cursor = db.drafts.find({"client_id": x_client_id}).sort("created_at", -1).limit(min(limit, 100))
    return [Draft.from_mongo(d).to_api() async for d in cursor]


@router.get("/{draft_id}")
async def get_draft(draft_id: str, x_client_id: str = Header(...)):
    doc = await db.drafts.find_one({"_id": _oid(draft_id), "client_id": x_client_id})
    if not doc:
        raise HTTPException(404, "Draft not found")
    return Draft.from_mongo(doc).to_api()


@router.put("/{draft_id}")
async def update_draft(draft_id: str, body: DraftUpdate, x_client_id: str = Header(...)):
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(400, "Nothing to update")
    doc = await db.drafts.find_one_and_update(
        {"_id": _oid(draft_id), "client_id": x_client_id},
        {"$set": {**fields, "updated_at": now_iso()}},
        return_document=True,
    )
    if not doc:
        raise HTTPException(404, "Draft not found")
    return Draft.from_mongo(doc).to_api()


@router.delete("/{draft_id}")
async def delete_draft(draft_id: str, x_client_id: str = Header(...)):
    res = await db.drafts.delete_one({"_id": _oid(draft_id), "client_id": x_client_id})
    if not res.deleted_count:
        raise HTTPException(404, "Draft not found")
    return {"deleted": True}
