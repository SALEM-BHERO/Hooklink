import json
import logging
import os
import re

from fastapi import HTTPException
from google import genai
from google.genai import types as genai_types
from groq import AsyncGroq
from openai import AsyncOpenAI

PLATFORM_RULES = {
    "linkedin": """PLATFORM: LinkedIn post. 150-300 words, short punchy paragraphs, professional but human. Max 1-2 emojis. End with 3-5 relevant hashtags.""",
    "instagram": """PLATFORM: Instagram caption. The first line must stop the scroll (it shows before "more"). 80-200 words with airy line breaks. 2-5 emojis are fine. Include a clear call to action (save, share or comment). End with a blank line then 8-15 relevant hashtags.""",
    "facebook": """PLATFORM: Facebook post. Warm, conversational and community-focused. 60-150 words. 1-3 emojis. End with a question that invites comments. 0-3 hashtags.""",
    "x": """PLATFORM: X (Twitter). Prefer a single tweet of at most 280 characters. If the idea truly needs more, write a thread of 3-6 tweets, each at most 280 characters, numbered like "1/", separated by a blank line. 0-2 hashtags, max 1 emoji. Hooks must be under 120 characters.""",
    "threads": """PLATFORM: Threads post. Casual, candid and conversational, at most 500 characters. 0-2 emojis, at most 1 topic hashtag. Invite replies.""",
    "tiktok": """PLATFORM: TikTok video. Write a 30-60 second spoken script using these labelled sections on separate lines: "HOOK (0-3s):", "SCRIPT:" (short spoken beats, each with [On-screen text] cues), "CTA:", then "CAPTION:" with a one-line caption and 3-6 hashtags. Hooks are alternative 0-3 second spoken openers.""",
    "youtube": """PLATFORM: YouTube video. The FIRST line is the video title only (under 70 characters, no label, no quotes). Then a blank line, then a 150-300 word description whose first two lines are compelling, a "Chapters:" section with 4-6 timestamps (0:00 Intro ...), a subscribe call to action, and 3-5 hashtags at the end. Hooks are alternative video titles.""",
}

BASE_RULES = """You are an expert social media ghostwriter with a deep understanding of the Zimbabwean entrepreneurial landscape.
CRITICAL WRITING RULES:
1. Sound like a real, authentic human. Write conversationally and avoid stiff corporate jargon or robotic buzzwords (like "delve", "unlock", "navigate", or "game-changer").
2. Follow the platform rules below exactly (length, emojis, hashtags, structure).
Your output must be pure JSON with no markdown formatting."""

HOOKS_SCHEMA = '"hooks": [{"title": "Variation Name", "text": "the hook"}, {"title": "...", "text": "..."}, {"title": "...", "text": "..."}]'


def _rules(platform: str) -> str:
    return f"{BASE_RULES}\n{PLATFORM_RULES[platform]}"


def generate_prompt(platform: str) -> str:
    return _rules(platform) + f"""
The user provides a TOPIC, a GOAL and a TONE. Return JSON matching exactly:
{{"postBody": "full post text with natural line breaks", {HOOKS_SCHEMA}}}"""


def hooks_prompt(platform: str) -> str:
    return _rules(platform) + f"""
The user provides an existing POST. Write 3 alternative openings for it (the first line of the post), each very different in style.
Return JSON matching exactly: {{{HOOKS_SCHEMA}}}"""


def refine_prompt(platform: str) -> str:
    return _rules(platform) + """
The user provides an existing POST and a target TONE. Rewrite the post in that tone while keeping its core message, facts and the platform rules.
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
        raise HTTPException(503, "Groq API key not configured")
    res = await AsyncGroq(api_key=key).chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        response_format={"type": "json_object"},
    )
    return res.choices[0].message.content


async def _deepseek(system: str, user: str) -> str:
    key = _key("DEEPSEEK_API_KEY")
    if not key:
        raise HTTPException(503, "DeepSeek API key not configured")
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
        raise HTTPException(503, "Gemini API key not configured")
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
        logging.exception("AI provider %s failed", provider)
        status = getattr(e, "status_code", None) or getattr(e, "code", None)
        msg = "is busy right now" if status in (429, 503) else "is unavailable right now"
        raise HTTPException(503, f"The {provider.title()} AI service {msg}. Please try again shortly.")
    raw = re.sub(r"^```(?:json)?|```$", "", (raw or "").strip(), flags=re.M).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(503, "AI returned an invalid response. Please try again.")


def parse_hooks(data: dict) -> list:
    hooks = data.get("hooks")
    if not isinstance(hooks, list) or not hooks:
        raise HTTPException(503, "AI response missing hooks. Please try again.")
    return [{"title": str(h.get("title", "Variation")), "text": str(h.get("text", ""))} for h in hooks[:3]]


def parse_body(data: dict) -> str:
    body = data.get("postBody")
    if not isinstance(body, str) or not body.strip():
        raise HTTPException(503, "AI response missing post body. Please try again.")
    return body.strip()
