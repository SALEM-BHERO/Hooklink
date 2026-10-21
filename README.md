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

## Project structure (one Vercel project)

```
frontend/          Vite + vanilla JS + Tailwind v4 (static site, built to frontend/dist)
backend/           FastAPI app (routes, services, models) + MongoDB via motor
api/index.py       Vercel Python Function entrypoint, which serves the FastAPI app at /api/*
requirements.txt   Python dependencies for the Vercel function
vercel.json        Build settings, the /api rewrite and function settings
```

The database indexes and the 30 library hooks are created automatically on the first API request.

## Deploy on Vercel

### 1. Create the database (MongoDB Atlas)
Pick one of these:
- **From Vercel**: Project > **Storage** / **Marketplace** > **MongoDB Atlas** > Connect. This adds a `MONGODB_URI` variable. Copy its value into `MONGO_URL` (see below).
- **Directly**: create a free cluster at https://cloud.mongodb.com, add a database user, allow network access from `0.0.0.0/0`, and copy the `mongodb+srv://...` connection string.

### 2. Import the repo into Vercel
1. Go to https://vercel.com/new and import this GitHub repo
2. Leave **Root Directory** as the repo root (`./`). `vercel.json` handles the build.
3. Add these **Environment Variables** (Production + Preview):

| Name | Value |
|------|-------|
| `MONGO_URL` | your Atlas connection string |
| `DB_NAME` | `hooklink` |
| `CORS_ORIGINS` | `*` (or your Vercel domain) |
| `DAILY_GENERATION_LIMIT` | `5` |
| `GROQ_API_KEY` | your Groq key |
| `GEMINI_API_KEY` | optional |
| `DEEPSEEK_API_KEY` | optional |

Do **not** set `REACT_APP_BACKEND_URL` on Vercel. The site calls `/api` on its own domain.

4. Click **Deploy**, then open `https://<your-app>.vercel.app/api/`. It should return `{"status":"ok"}`.

## Local development

```bash
cp backend/.env.example backend/.env       # fill in MONGO_URL + keys
pip install -r requirements.txt
cd backend && uvicorn server:app --reload --port 8001

cd frontend
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
yarn install && yarn dev
```

---
*Made by [Salem Gwashavanhu](https://salem-portfolio-psi.vercel.app/) of Muonde Technology.*
