import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

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

const SYSTEM_PROMPT = `You are an expert LinkedIn ghostwriter with a deep understanding of the Zimbabwean entrepreneurial landscape. The user will provide a TOPIC, a GOAL, and a TONE.
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

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

    // Clean markdown formatting if LLM incorrectly includes it
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json/m, '').replace(/```$/m, '').trim();
    }

    const responseData = JSON.parse(jsonString);
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({ error: 'Failed to generate content', details: error.message });
  }
}
