# HookLink AI

HookLink is a sleek, AI-powered writing workspace designed to help professionals and founders craft highly engaging, human-sounding LinkedIn content. Tailored for the modern professional, it takes a single thought and engineers it into a high-converting post with multiple scroll-stopping hook variations.

## ✨ Features

- **No-Friction Workspace:** A completely open workspace. No sign-ups, no logins, no paywalls.
- **Smart Rate Limiting:** Built-in daily limits (5 generations per day) to keep the engine free and fast while preventing API abuse.
- **Human-First AI:** Prompt-engineered to write natively and conversationally, strictly avoiding robotic buzzwords (like "delve" or "unlock") and limiting emojis for a professional tone.
- **Multi-Model Backend:** Vercel Serverless API seamlessly integrates with Groq (default), Gemini, and DeepSeek for lightning-fast generations.
- **Refinement Studio:** Automatically loads generated drafts into a realistic LinkedIn preview canvas with click-to-apply hooks.

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML, JavaScript, and Tailwind CSS v4
- **Build Tool:** Vite
- **Backend:** Node.js Vercel Serverless Functions (`/api`)
- **AI SDKs:** `groq-sdk`, `@google/generative-ai`, `openai`
- **Hosting:** Vercel

## 🚀 Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an `.env` file in the root based on `.env.example` and add your keys:
   ```env
   GROQ_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   DEEPSEEK_API_KEY=your_key_here
   ```
4. Start the local Vercel development server (recommended to test serverless functions):
   ```bash
   vercel dev
   ```

## 🌐 Deployment (Vercel)

HookLink is optimized for zero-config deployment on Vercel. 
Simply push to GitHub, import the repository into Vercel, and add your API keys in the Vercel Environment Variables settings (Note: If using Groq, ensure the variable is named `GroqAPI` or `GROQ_API_KEY`).

---
*Made by [Salem Gwashavanhu](https://salem-portfolio-psi.vercel.app/) of Muonde Technology.*
