import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

function getSystemPrompt(platform = 'linkedin') {
  const platformRules = {
    linkedin: `You are an expert LinkedIn creator and ghostwriter.
Platform: LinkedIn.
Formatting: Short, punchy paragraphs (1-3 sentences each) with generous white space. First 2 lines MUST form a curiosity gap or strong statement before the "see more" cutoff. Include 3-5 relevant hashtags at the bottom.
Tone: Professional, authentic, personal growth, founder journey. Avoid stiff corporate jargon or AI clichés ("delve", "unlock", "testament", "game-changer", "landscape", "in today's world"). Max 1-2 emojis.`,

    instagram: `You are an expert Instagram content strategist.
Platform: Instagram Caption.
Formatting: Engaging visual caption style. The first line must be a compelling scroll-stopper that prevents people from swiping past. Use clean paragraph breaks (avoid giant text walls). Include a clear Call to Action (e.g. "Save this for your next project", "Share with someone who needs this", or "Drop your thoughts below"). End with a group of 8-12 targeted, high-reach hashtags.
Tone: Relatable, visually inspiring, conversational, warm. Natural emoji usage (3-5 emojis max, placed naturally). No robotic corporate buzzwords.`,

    facebook: `You are an expert Facebook page and community creator.
Platform: Facebook.
Formatting: Story-driven, highly conversational narrative. Friendly spacing. Focus on sparking conversation in the comments by asking a genuine question or inviting readers to share their own experiences. Use 0 to 2 hashtags only (Facebook algorithms prefer minimal hashtags).
Tone: Warm, community-minded, relatable, like talking to friends, neighbors, or peers. Conversational and approachable.`,

    twitter: `You are an expert X (Twitter) ghostwriter.
Platform: X (Twitter).
Formatting: High-signal, punchy, zero fluff. Write either a single high-impact tweet (under 280 characters) OR a concise 3-4 part mini-thread numbered cleanly (1/, 2/, 3/, 4/). No hashtag spam (maximum 1 hashtag or none).
Tone: Bold, sharp, clear, opinionated, intellectually dense. Cut all unnecessary filler words.`,

    threads: `You are an expert Threads creator.
Platform: Threads (by Meta).
Formatting: Casual, raw, direct thought. 2-4 short conversational sentences or a crisp mini-reflection. End with an open-ended conversational prompt to get replies. Zero hashtags.
Tone: Authentic, unpolished, conversational, like texting a group chat of fellow creators or founders.`
  };

  const selectedRule = platformRules[platform.toLowerCase()] || platformRules.linkedin;

  return `${selectedRule}

CRITICAL UNIVERSAL WRITING RULES:
1. Sound like a real, authentic human speaking from real-world experience. NEVER use robotic AI tropes like "delve", "unlock", "revolutionize", "game-changer", "testament to", "it's not just about X, it's about Y", or "in today's fast-paced world".
2. Vary sentence length naturally: short punchy sentences mixed with longer explanatory ones.
3. If the user provides a real-life detail or anchor, weave it seamlessly into the narrative.

Your output must be pure JSON with no markdown formatting. The JSON must match exactly this schema:
{
  "postBody": "The full text of the post formatted specifically for this platform.",
  "hooks": [
    {
      "title": "Variation Name",
      "text": "The first 1-2 lines (the opening hook)."
    },
    {
      "title": "Variation Name",
      "text": "Another opening hook variation."
    },
    {
      "title": "Variation Name",
      "text": "A third opening hook variation."
    }
  ]
}`;
}

export default async function handler(req, res) {
  // Safe CORS headers
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
    // Safely parse body if sent as string or undefined
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
    }
    body = body || {};

    const { topic, goal, tone, platform = 'linkedin', specificDetail, provider = 'groq' } = body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const systemPrompt = getSystemPrompt(platform);

    let userPrompt = `TARGET PLATFORM: ${platform.toUpperCase()}\nTOPIC: ${topic}\nGOAL: ${goal || 'Engagement'}\nTONE: ${tone || 'Authentic'}`;
    if (specificDetail && specificDetail.trim()) {
      userPrompt += `\nREAL-LIFE SPECIFIC DETAIL TO WEAVE IN: ${specificDetail.trim()}`;
    }

    let jsonString = '';

    if (provider === 'groq') {
      const groqKey = (process.env.GROQ_API_KEY || process.env.GroqAPI || '').trim();
      if (!groqKey) {
        return res.status(500).json({ error: 'Groq API Key not configured in Vercel environment variables.' });
      }

      const groq = new Groq({ apiKey: groqKey });
      let chatCompletion;

      try {
        chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: 'openai/gpt-oss-120b',
          response_format: { type: 'json_object' }
        });
      } catch (primaryErr) {
        console.warn('gpt-oss-120b busy, falling back to gpt-oss-20b:', primaryErr?.message);
        chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: 'openai/gpt-oss-20b',
          response_format: { type: 'json_object' }
        });
      }

      jsonString = chatCompletion.choices[0]?.message?.content;
    } 
    else if (provider === 'gemini') {
      const geminiKey = (process.env.GEMINI_API_KEY || process.env.GeminiAPi || '').trim();
      if (!geminiKey) {
        return res.status(500).json({ error: 'Gemini API Key not configured in Vercel environment variables.' });
      }

      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(systemPrompt + '\n\n' + userPrompt);
      jsonString = result.response.text();
    }
    else if (provider === 'deepseek') {
      const deepseekKey = (process.env.DEEPSEEK_API_KEY || process.env.DeepAPI || '').trim();
      if (!deepseekKey) {
        return res.status(500).json({ error: 'DeepSeek API Key not configured in Vercel environment variables.' });
      }

      const deepseek = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: deepseekKey
      });

      const response = await deepseek.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
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

    if (!jsonString) {
      throw new Error('Empty response received from AI model');
    }

    // Clean markdown formatting if LLM includes it
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json/m, '').replace(/```$/m, '').trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```/m, '').replace(/```$/m, '').trim();
    }

    const responseData = JSON.parse(jsonString);
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Error generating content:', error);
    const message = error.message || 'Unknown error';
    return res.status(500).json({ 
      error: 'Failed to generate content', 
      details: message 
    });
  }
}
