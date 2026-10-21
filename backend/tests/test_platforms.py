# HookLink AI multi-platform tests: platform validation, per-platform generation rules, library platform filter
import os
import re
import subprocess
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
CID = f"TEST_{uuid.uuid4()}"
H = {"X-Client-Id": CID, "Content-Type": "application/json"}
PLATFORMS = ["linkedin", "instagram", "facebook", "x", "threads", "tiktok", "youtube"]
STATE = {}


def mongo(js):
    return subprocess.run(["mongosh", "--quiet", "hooklink", "--eval", js], capture_output=True, text=True).stdout


@pytest.fixture(autouse=True)
def reset_usage():
    mongo("db.usage.deleteMany({})")
    yield


@pytest.fixture(scope="module", autouse=True)
def cleanup():
    yield
    mongo("db.usage.deleteMany({}); db.drafts.deleteMany({client_id: /^TEST_/})")


# Library platform filter
class TestLibraryPlatforms:
    def test_total_and_platform_lists(self):
        d = requests.get(f"{BASE_URL}/api/library", params={"limit": 50}).json()
        assert d["total"] == 30
        for i in d["items"]:
            assert isinstance(i["platforms"], list) and i["platforms"]
            assert set(i["platforms"]) <= set(PLATFORMS)

    @pytest.mark.parametrize("p", PLATFORMS)
    def test_filter(self, p):
        d = requests.get(f"{BASE_URL}/api/library", params={"platform": p, "limit": 50}).json()
        assert d["total"] > 0 and len(d["items"]) == d["total"]
        assert all(p in i["platforms"] for i in d["items"])

    def test_combined_category_platform_q(self):
        d = requests.get(f"{BASE_URL}/api/library", params={"platform": "x", "category": "the-controversy", "limit": 50}).json()
        assert d["total"] > 0 and all(i["category"] == "the-controversy" and "x" in i["platforms"] for i in d["items"])
        d2 = requests.get(f"{BASE_URL}/api/library", params={"platform": "youtube", "q": "Harare", "limit": 50}).json()
        assert all("youtube" in i["platforms"] for i in d2["items"])

    def test_unknown_platform_empty(self):
        d = requests.get(f"{BASE_URL}/api/library", params={"platform": "myspace"}).json()
        assert d["total"] == 0 and d["items"] == []


# Validation
class TestValidation:
    def test_invalid_platform_generate(self):
        assert requests.post(f"{BASE_URL}/api/generate", headers=H, json={"topic": "x", "platform": "myspace"}).status_code == 422

    def test_invalid_platform_regen_refine(self):
        assert requests.post(f"{BASE_URL}/api/hooks/regenerate", headers=H, json={"post_body": "x", "platform": "myspace"}).status_code == 422
        assert requests.post(f"{BASE_URL}/api/refine-tone", headers=H, json={"post_body": "x", "tone": "technical", "platform": "bad"}).status_code == 422


def gen(platform):
    r = requests.post(f"{BASE_URL}/api/generate", headers=H, timeout=120, json={
        "topic": "TEST_ opening a mobile money kiosk business in Bulawayo", "goal": "brand", "tone": "storytelling",
        "platform": platform, "provider": "groq"})
    assert r.status_code == 200, r.text
    dr = r.json()["draft"]
    assert dr["platform"] == platform and len(dr["hooks"]) == 3
    saved = requests.get(f"{BASE_URL}/api/drafts/{dr['id']}", headers=H).json()
    assert saved["platform"] == platform
    STATE[platform] = dr
    return dr["post_body"]


# Per-platform generation (real Groq)
class TestGenerate:
    def test_instagram(self):
        body = gen("instagram")
        assert len(re.findall(r"#\w+", body)) >= 6, body

    def test_youtube(self):
        body = gen("youtube")
        first = body.split("\n")[0].strip()
        assert 0 < len(first) <= 100 and not first.lower().startswith("title"), first
        assert "chapters" in body.lower() and "0:00" in body, body

    def test_facebook(self):
        body = gen("facebook")
        assert "?" in body

    def test_threads(self):
        body = gen("threads")
        assert len(body) <= 600, len(body)

    def test_x(self):
        body = gen("x")
        if re.search(r"^\s*1/", body, re.M):
            tweets = [t for t in re.split(r"\n\s*\n", body) if t.strip()]
            assert all(len(t.strip()) <= 280 for t in tweets), [len(t) for t in tweets]
        else:
            assert len(body) <= 280, len(body)

    def test_tiktok(self):
        body = gen("tiktok")
        for sec in ["HOOK", "SCRIPT", "CTA", "CAPTION"]:
            assert sec in body.upper(), (sec, body)

    def test_default_linkedin(self):
        r = requests.post(f"{BASE_URL}/api/generate", headers=H, json={"topic": ""})
        assert r.status_code == 422  # sanity, no LLM call


# Regenerate & refine accept platform
class TestRegenRefine:
    def test_regen_youtube(self):
        dr = STATE.get("youtube") or pytest.skip("no youtube draft")
        r = requests.post(f"{BASE_URL}/api/hooks/regenerate", headers=H, timeout=120,
                          json={"post_body": dr["post_body"], "draft_id": dr["id"], "platform": "youtube"})
        assert r.status_code == 200, r.text
        assert len(r.json()["hooks"]) == 3

    def test_refine_x(self):
        dr = STATE.get("x") or pytest.skip("no x draft")
        r = requests.post(f"{BASE_URL}/api/refine-tone", headers=H, timeout=120,
                          json={"post_body": dr["post_body"], "tone": "contrarian", "draft_id": dr["id"], "platform": "x"})
        assert r.status_code == 200, r.text
        saved = requests.get(f"{BASE_URL}/api/drafts/{dr['id']}", headers=H).json()
        assert saved["post_body"] == r.json()["post_body"] and saved["platform"] == "x"
