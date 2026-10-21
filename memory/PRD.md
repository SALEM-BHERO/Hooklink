# HookLink AI — PRD

## Original problem
"let's break the backend and build it again" — rebuild HookLink AI's backend (was a single Vercel serverless fn) as FastAPI + MongoDB; update frontend to match.

## User choices
- Rebuild existing app; FastAPI + MongoDB; no auth; frontend updated
- LLM: user's own keys — Groq (default, `openai/gpt-oss-120b`), Gemini (`gemini-3.8-flash`), DeepSeek (`deepseek-chat`)
- Features: saved drafts history + real Refine Tone; server-side IP rate limit (5/day); Hook Library from DB; newsletter signup in DB

## Architecture
- /app/backend: server.py, core/db.py, models.py, services/{llm,rate_limit}.py, routes/{ai,drafts,library,newsletter}.py, seed.py (24 library hooks)
- /app/frontend: Vite + vanilla JS + Tailwind v4 multi-page (index, workspace, refinement, library, privacy, terms); src/js/api.js uses REACT_APP_BACKEND_URL
- Drafts scoped per browser via X-Client-Id (localStorage UUID)

## Endpoints
GET /api/, GET /api/usage, POST /api/generate, POST /api/hooks/regenerate, POST /api/refine-tone, GET/PUT/DELETE /api/drafts[/{id}], GET /api/library, POST /api/newsletter

## Implemented (2026-06)
- Full backend rebuild + frontend wiring; atomic quota reserve/refund; friendly 503 AI errors
- Tested: iteration_1 (21/22 pass; issues fixed after)

## Mocked
- Publish to LinkedIn, reactions bar, readability scores (UI only)

## Known external issues
- Gemini 503 high demand (intermittent); DeepSeek 402 insufficient balance

## Backlog
- P1: provider picker in UI; real LinkedIn publishing (OAuth)
- P2: real readability scoring; newsletter emails (Resend/SendGrid); admin view of subscribers
