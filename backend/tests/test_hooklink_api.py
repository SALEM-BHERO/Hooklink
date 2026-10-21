# HookLink AI backend regression tests: health, library, newsletter, drafts, AI (groq), rate limit
import os
import subprocess
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
CID = f"TEST_{uuid.uuid4()}"
H = {"X-Client-Id": CID, "Content-Type": "application/json"}


def mongo(js):
    return subprocess.run(["mongosh", "--quiet", "hooklink", "--eval", js], capture_output=True, text=True).stdout


@pytest.fixture(scope="session", autouse=True)
def reset_usage():
    mongo("db.usage.deleteMany({})")
    yield
    mongo("db.usage.deleteMany({}); db.drafts.deleteMany({client_id: /^TEST_/}); db.subscribers.deleteMany({email: /^test_/})")


# Health
def test_health():
    r = requests.get(f"{BASE_URL}/api/")
    assert r.status_code == 200 and r.json()["status"] == "ok"


# Library
class TestLibrary:
    def test_all(self):
        d = requests.get(f"{BASE_URL}/api/library", params={"category": "all", "q": "", "skip": 0, "limit": 8}).json()
        assert d["total"] == 24 and len(d["items"]) == 8
        assert "_id" not in d["items"][0] and d["items"][0]["number"] == 1

    @pytest.mark.parametrize("cat", ["curiosity-gap", "the-listicle", "the-controversy", "technical-insight"])
    def test_category(self, cat):
        d = requests.get(f"{BASE_URL}/api/library", params={"category": cat, "limit": 50}).json()
        assert d["total"] == 6 and all(i["category"] == cat for i in d["items"])

    def test_search(self):
        d = requests.get(f"{BASE_URL}/api/library", params={"q": "Harare"}).json()
        assert d["total"] >= 1
        assert all("harare" in (i["text"] + i["theme"] + (i["title"] or "") + i["category_label"]).lower() for i in d["items"])

    def test_pagination(self):
        p1 = requests.get(f"{BASE_URL}/api/library", params={"skip": 0}).json()["items"]
        p3 = requests.get(f"{BASE_URL}/api/library", params={"skip": 16}).json()["items"]
        assert len(p3) == 8 and p3[0]["number"] == 17
        assert not {i["number"] for i in p1} & {i["number"] for i in p3}

    def test_bad_limit(self):
        assert requests.get(f"{BASE_URL}/api/library", params={"limit": 0}).status_code == 422


# Newsletter
class TestNewsletter:
    def test_subscribe_and_dup(self):
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(f"{BASE_URL}/api/newsletter", json={"email": email})
        assert r.status_code == 200 and r.json() == {"subscribed": True, "already": False}
        r2 = requests.post(f"{BASE_URL}/api/newsletter", json={"email": email.upper()})
        assert r2.json()["already"] is True
        assert email in mongo(f"printjson(db.subscribers.findOne({{email:'{email}'}}))")

    def test_invalid(self):
        assert requests.post(f"{BASE_URL}/api/newsletter", json={"email": "bad"}).status_code == 422


# AI + Drafts (uses real Groq; 3 calls)
class TestAIAndDrafts:
    state = {}

    def test_generate_requires_client_id(self):
        r = requests.post(f"{BASE_URL}/api/generate", json={"topic": "x"})
        assert r.status_code == 422

    def test_generate_validation(self):
        r = requests.post(f"{BASE_URL}/api/generate", headers=H, json={"topic": "x", "tone": "funny"})
        assert r.status_code == 422

    def test_generate(self):
        r = requests.post(f"{BASE_URL}/api/generate", headers=H, timeout=90, json={
            "topic": "TEST_ launching a solar startup in Harare", "goal": "news", "tone": "storytelling", "provider": "groq"})
        assert r.status_code == 200, r.text
        d = r.json()
        dr = d["draft"]
        assert isinstance(dr["id"], str) and len(dr["post_body"]) > 50 and len(dr["hooks"]) == 3
        assert dr["goal"] == "news" and dr["tone"] == "storytelling" and dr["client_id"] == CID
        assert d["usage"] == {"used": 1, "limit": 5, "remaining": 4}
        self.state["id"] = dr["id"]
        self.state["draft"] = dr

    def test_list_and_isolation(self):
        lst = requests.get(f"{BASE_URL}/api/drafts", headers=H).json()
        assert any(d["id"] == self.state["id"] for d in lst)
        other = requests.get(f"{BASE_URL}/api/drafts", headers={"X-Client-Id": f"TEST_{uuid.uuid4()}"}).json()
        assert other == []
        r = requests.get(f"{BASE_URL}/api/drafts/{self.state['id']}", headers={"X-Client-Id": "TEST_other"})
        assert r.status_code == 404

    def test_get_put(self):
        i = self.state["id"]
        assert requests.get(f"{BASE_URL}/api/drafts/{i}", headers=H).json()["post_body"] == self.state["draft"]["post_body"]
        r = requests.put(f"{BASE_URL}/api/drafts/{i}", headers=H, json={"post_body": "TEST_ edited body"})
        assert r.status_code == 200 and r.json()["post_body"] == "TEST_ edited body"
        assert requests.get(f"{BASE_URL}/api/drafts/{i}", headers=H).json()["post_body"] == "TEST_ edited body"
        assert requests.put(f"{BASE_URL}/api/drafts/{i}", headers=H, json={}).status_code == 400

    def test_invalid_ids(self):
        assert requests.get(f"{BASE_URL}/api/drafts/badid", headers=H).status_code == 404
        assert requests.get(f"{BASE_URL}/api/drafts/{'0'*24}", headers=H).status_code == 404
        assert requests.put(f"{BASE_URL}/api/drafts/badid", headers=H, json={"post_body": "x"}).status_code == 404
        assert requests.delete(f"{BASE_URL}/api/drafts/{'0'*24}", headers=H).status_code == 404

    def test_regenerate_hooks(self):
        body = self.state["draft"]["post_body"]
        r = requests.post(f"{BASE_URL}/api/hooks/regenerate", headers=H, timeout=90,
                          json={"post_body": body, "draft_id": self.state["id"]})
        assert r.status_code == 200, r.text
        d = r.json()
        assert len(d["hooks"]) == 3 and d["usage"]["used"] == 2
        saved = requests.get(f"{BASE_URL}/api/drafts/{self.state['id']}", headers=H).json()
        assert saved["hooks"] == d["hooks"] and saved["post_body"] == body

    def test_refine_tone(self):
        body = self.state["draft"]["post_body"]
        r = requests.post(f"{BASE_URL}/api/refine-tone", headers=H, timeout=90,
                          json={"post_body": body, "tone": "contrarian", "draft_id": self.state["id"]})
        assert r.status_code == 200, r.text
        d = r.json()
        assert len(d["post_body"]) > 50 and d["usage"]["used"] == 3
        saved = requests.get(f"{BASE_URL}/api/drafts/{self.state['id']}", headers=H).json()
        assert saved["post_body"] == d["post_body"] and saved["tone"] == "contrarian"

    def test_failed_provider_no_quota(self):
        before = requests.get(f"{BASE_URL}/api/usage").json()["used"]
        r = requests.post(f"{BASE_URL}/api/generate", headers=H, timeout=90, json={"topic": "x", "provider": "deepseek"})
        assert r.status_code == 502 and isinstance(r.json()["detail"], str)
        assert requests.get(f"{BASE_URL}/api/usage").json()["used"] == before

    def test_delete(self):
        i = self.state["id"]
        assert requests.delete(f"{BASE_URL}/api/drafts/{i}", headers=H).json() == {"deleted": True}
        assert requests.get(f"{BASE_URL}/api/drafts/{i}", headers=H).status_code == 404


# Rate limit (forces count to 5 in DB; no LLM call made)
class TestRateLimit:
    def test_429(self):
        mongo("db.usage.updateMany({}, {$set: {count: 5}})")
        u = requests.get(f"{BASE_URL}/api/usage").json()
        assert u["remaining"] == 0
        for path, body in [("/api/generate", {"topic": "x"}), ("/api/hooks/regenerate", {"post_body": "x"}),
                           ("/api/refine-tone", {"post_body": "x", "tone": "technical"})]:
            r = requests.post(f"{BASE_URL}{path}", headers=H, json=body)
            assert r.status_code == 429 and "Daily limit reached" in r.json()["detail"]
