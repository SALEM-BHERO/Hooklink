# HookLink AI

HookLink is an AI writing workspace that turns one idea into a platform-ready post for **LinkedIn, Instagram, Facebook, X, Threads, TikTok and YouTube**: tailored length, hashtags, emojis and structure, with a realistic live preview.

## Features

- **Platform-tailored generation**: X posts and threads, Instagram captions, TikTok scripts, YouTube titles and descriptions, and more
- **Editor**: realistic per-platform preview, hook variations, Refine Tone, live post analysis (readability, length fit, hashtags)
- **Real publishing flow**: "Post on <Platform>" opens LinkedIn/X/Threads with the text pre-filled, or copies it and opens Instagram/Facebook/TikTok Studio/YouTube Studio
- **Drafts history** saved in MongoDB (per browser, no sign-up)
- **Hook Library** of 30 ideas with category and platform filters
- **Server-side daily limit** per IP (default 5 generations/day)
- **Newsletter signup** stored in MongoDB
- AI providers: **Groq** (default, `openai/gpt-oss-120b`), Gemini (`gemini-3.8-flash`) and DeepSeek (`deepseek-chat`)

## Project structure

```
frontend/   Vite + vanilla JS + Tailwind v4 (multi-page)  -> Vercel
backend/    FastAPI + MongoDB (motor)                     -> Render / Railway
render.yaml Render blueprint for the backend
```

## Local development

```bash
# backend
cd backend
cp .env.example .env            # fill in MONGO_URL and the API keys
pip install -r requirements-deploy.txt
uvicorn server:app --reload --port 8001

# frontend
cd frontend
cp .env.example .env            # REACT_APP_BACKEND_URL=http://localhost:8001
yarn install
yarn dev
```

## Deployment

### 1. Database: MongoDB Atlas
1. Create a free cluster at https://cloud.mongodb.com
2. Database Access: create a user. Network Access: allow `0.0.0.0/0`
3. Copy the connection string (`mongodb+srv://...`) and use it as `MONGO_URL`

### 2. Backend: Render
1. Go to https://render.com, then **New** > **Blueprint**, and pick this repo (it uses `render.yaml`)
2. Fill in the secret env vars: `MONGO_URL`, `GROQ_API_KEY`, optional `GEMINI_API_KEY` / `DEEPSEEK_API_KEY`, and `CORS_ORIGINS` (your Vercel URL, e.g. `https://hooklink.vercel.app`)
3. After it deploys, check `https://<your-service>.onrender.com/api/`. It should return `{"status":"ok"}`

> Railway works too: set the root directory to `backend`, the build command to `pip install -r requirements-deploy.txt`, and the start command to the one in `Procfile`.

### 3. Frontend: Vercel
1. Go to https://vercel.com, then **Add New** > **Project**, and import this repo
2. Set **Root Directory** to `frontend` (`vercel.json` handles the build)
3. Add the env var `REACT_APP_BACKEND_URL` = your Render URL (no trailing slash, without `/api`)
4. Deploy. Then update `CORS_ORIGINS` on Render to the final Vercel domain

---
*Made by [Salem Gwashavanhu](https://salem-portfolio-psi.vercel.app/) of Muonde Technology.*
