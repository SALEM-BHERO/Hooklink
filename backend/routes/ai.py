from contextlib import asynccontextmanager

from bson import ObjectId
from fastapi import APIRouter, Header, Request

from core.db import db
from models import Draft, GenerateRequest, RefineToneRequest, RegenerateHooksRequest, now_iso
from services import llm
from services.rate_limit import client_ip, get_usage, refund, reserve

router = APIRouter()


@asynccontextmanager
async def quota(ip: str):
    await reserve(ip)
    try:
        yield
    except Exception:
        await refund(ip)
        raise


async def _update_draft(draft_id, client_id, fields: dict):
    if draft_id and ObjectId.is_valid(draft_id):
        await db.drafts.update_one(
            {"_id": ObjectId(draft_id), "client_id": client_id},
            {"$set": {**fields, "updated_at": now_iso()}},
        )


@router.get("/usage")
async def usage(request: Request):
    return await get_usage(client_ip(request))


@router.post("/generate")
async def generate(body: GenerateRequest, request: Request, x_client_id: str = Header(...)):
    ip = client_ip(request)
    async with quota(ip):
        user = f"PLATFORM: {body.platform}\nTOPIC: {body.topic}\nGOAL: {llm.GOAL_LABELS[body.goal]}\nTONE: {body.tone}"
        data = await llm.complete_json(body.provider, llm.generate_prompt(body.platform), user)
        draft = Draft(
            client_id=x_client_id, topic=body.topic, goal=body.goal, tone=body.tone,
            provider=body.provider, platform=body.platform, post_body=llm.parse_body(data), hooks=llm.parse_hooks(data),
        )
        res = await db.drafts.insert_one(draft.to_mongo())
    draft.id = str(res.inserted_id)
    return {"draft": draft.to_api(), "usage": await get_usage(ip)}


@router.post("/hooks/regenerate")
async def regenerate_hooks(body: RegenerateHooksRequest, request: Request, x_client_id: str = Header(...)):
    ip = client_ip(request)
    async with quota(ip):
        data = await llm.complete_json(body.provider, llm.hooks_prompt(body.platform), f"POST:\n{body.post_body}")
        hooks = llm.parse_hooks(data)
    await _update_draft(body.draft_id, x_client_id, {"hooks": hooks, "post_body": body.post_body})
    return {"hooks": hooks, "usage": await get_usage(ip)}


@router.post("/refine-tone")
async def refine_tone(body: RefineToneRequest, request: Request, x_client_id: str = Header(...)):
    ip = client_ip(request)
    async with quota(ip):
        data = await llm.complete_json(body.provider, llm.refine_prompt(body.platform), f"TONE: {body.tone}\nPOST:\n{body.post_body}")
        post_body = llm.parse_body(data)
    await _update_draft(body.draft_id, x_client_id, {"post_body": post_body, "tone": body.tone})
    return {"post_body": post_body, "usage": await get_usage(ip)}
