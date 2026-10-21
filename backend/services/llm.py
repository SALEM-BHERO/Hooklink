import json
import os
import re

from fastapi import HTTPException
from google import genai
from google.genai import types as genai_types
from groq import AsyncGroq
from openai import AsyncOpenAI

WRITING_RULES = """You are an expert LinkedIn ghostwriter with a deep understanding of the Zimbabwean entrepreneurial landscape.
CRITICAL WRITING RULES:
1. Sound like a real, authentic human. Write conversationally and avoid stiff corporate jargon or robotic buzzwords (like "delve", "unlock", "navigate", or "game-changer").
2. Use a maximum of 1 or 2 emojis for the entire post.
3. Use natural formatting with short, punchy paragraphs.
4. Always include 3 to 5 relevant hashtags at the very end of the post.
Your output must be pure JSON with no markdown formatting."""

GENERATE_PROMPT = WRITING_RULES + """
The user provides a TOPIC, a GOAL and a TONE. Return JSON matching exactly:
{"postBody": "full post text with natural line breaks", "hooks": [{"title": "Variation Name", "text": "1-2 line hook"}, {"title": "...", "text": "..."}, {"title": "...", "text": "..."}]}"""

HOOKS_PROMPT = WRITING_RULES + """
The user provides an existing LinkedIn POST. Write 3 alternative opening hooks for it, each very different in style.
Return JSON matching exactly: {"hooks": [{"title": "Variation Name", "text": "1-2 line hook"}, {"title": "...", "text": "..."}, {"title": "...", "text": "..."}]}"""

REFINE_PROMPT = WRITING_RULES + """
The user provides an existing LinkedIn POST and a target TONE. Rewrite the post in that tone while keeping its core message and facts.
Return JSON matching exactly: {"postBody": "the rewritten post with natural line breaks"}"""

GOAL_LABELS = {"brand": "Building personal brand", "news": "Sharing news", "hiring": "Hiring"}


def _key(*names):
    for n in names:
        if os.environ.get(n):
            return os.environ[n]
    return None


async def _groq(system: str, user: str) -> str:
    key = _key("GROQ_API_KEY")
    if not key:
        raise HTTPException(500, "Groq API key not configured")
    res = await AsyncGroq(api_key=key).chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        response_format={"type": "json_object"},
    )
    return res.choices[0].message.content


async def _deepseek(system: str, user: str) -> str:
    key = _key("DEEPSEEK_API_KEY")
    if not key:
        raise HTTPException(500, "DeepSeek API key not configured")
    client = AsyncOpenAI(api_key=key, base_url="https://api.deepseek.com")
    res = await client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        response_format={"type": "json_object"},
    )
    return res.choices[0].message.content


async def _gemini(system: str, user: str) -> str:
    key = _key("GEMINI_API_KEY")
    if not key:
        raise HTTPException(500, "Gemini API key not configured")
    gclient = genai.Client(api_key=key)
    res = await gclient.aio.models.generate_content(
        model="gemini-3.8-flash",
        contents=user,
        config=genai_types.GenerateContentConfig(system_instruction=system, response_mime_type="application/json"),
    )
    return res.text


PROVIDERS = {"groq": _groq, "deepseek": _deepseek, "gemini": _gemini}


async def complete_json(provider: str, system: str, user: str) -> dict:
    try:
        raw = await PROVIDERS[provider](system, user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, f"AI provider error: {e}")
    raw = re.sub(r"^```(?:json)?|```$", "", (raw or "").strip(), flags=re.M).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(502, "AI returned an invalid response. Please try again.")


def parse_hooks(data: dict) -> list:
    hooks = data.get("hooks")
    if not isinstance(hooks, list) or not hooks:
        raise HTTPException(502, "AI response missing hooks. Please try again.")
    return [{"title": str(h.get("title", "Variation")), "text": str(h.get("text", ""))} for h in hooks[:3]]


def parse_body(data: dict) -> str:
    body = data.get("postBody")
    if not isinstance(body, str) or not body.strip():
        raise HTTPException(502, "AI response missing post body. Please try again.")
    return body.strip()
