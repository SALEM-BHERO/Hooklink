import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize clients conditionally based on available env vars
let groq, genAI, deepseek;

if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

if (process.env.DEEPSEEK_API_KEY) {
  deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
  });
}

const SYSTEM_PROMPT = `You are an expert LinkedIn ghostwriter. The user will provide a TOPIC, a GOAL, and a TONE.
You must output a highly engaging LinkedIn post based on these parameters. 
Your output must be pure JSON with no markdown formatting. The JSON must match exactly this schema:
{
  "postBody": "The full text of the LinkedIn post including emojis and line breaks.",
  "hooks": [
    {
      "title": "Variation Name",
      "text": "The first 1-2 lines of the post (the hook)."
    },
    {
      "title": "Variation Name",
      "text": "Another hook variation."
    },
    {
      "title": "Variation Name",
      "text": "A third hook variation."
    }
  ]
}`;

app.post('/api/generate', async (req, res) => {
  try {
    const { topic, goal, tone, provider = 'groq' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const userPrompt = `TOPIC: ${topic}\nGOAL: ${goal}\nTONE: ${tone}`;
    let jsonString = '';

    if (provider === 'groq') {
      if (!groq) return res.status(500).json({ error: 'Groq API Key not configured' });
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });
      jsonString = chatCompletion.choices[0]?.message?.content;
    } 
    else if (provider === 'gemini') {
      if (!genAI) return res.status(500).json({ error: 'Gemini API Key not configured' });
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(SYSTEM_PROMPT + "\n\n" + userPrompt);
      jsonString = result.response.text();
    }
    else if (provider === 'deepseek') {
      if (!deepseek) return res.status(500).json({ error: 'DeepSeek API Key not configured' });
      const response = await deepseek.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        model: 'deepseek-chat',
        response_format: { type: 'json_object' }
      });
      jsonString = response.choices[0].message.content;
    } 
    else {
      return res.status(400).json({ error: 'Invalid provider selected' });
    }

    // Clean markdown formatting if LLM incorrectly includes it (e.g. ```json ...)
    if (jsonString.startsWith('\`\`\`json')) {
      jsonString = jsonString.replace(/^\`\`\`json/m, '').replace(/\`\`\`$/m, '').trim();
    }

    const responseData = JSON.parse(jsonString);
    res.json(responseData);

  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`HookLink Backend running on http://localhost:${PORT}`);
});
