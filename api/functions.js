import { GoogleGenAI } from "@google/genai";
import { isRateLimitError, getHttpStatus } from "../src/utils/errors.js";
import { toGeminiContents } from "../src/utils/gemini.js";
import { parseJsonBody, getMessages, getGenerationSettings } from "../src/utils/request.js";
import { createChatResponse } from "../src/utils/response.js";


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = parseJsonBody(req.body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada' });
    }

    const messages = getMessages(payload);
    const { system, modelName, temperature, maxOutputTokens } = getGenerationSettings(payload);

    const ai = new GoogleGenAI({ apiKey });
    const contents = toGeminiContents(messages);

    const result = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: system,
        temperature,
        maxOutputTokens,
      },
    });

    const text = (result.text || '').trim();
    const finishReason = result.candidates?.[0]?.finishReason;
    const usage = result.usageMetadata;
    return res.status(200).json(createChatResponse({ text, payload, finishReason, usage}));
  } catch (error) {
    console.error('[/api/functions] Error:', error);

    if (isRateLimitError(error)) {
      return res.status(429).json({
        error: 'Rate limit de Gemini. Reintentá en unos segundos.',
        retryAfterSeconds: 8,
      });
    }

    return res.status(getHttpStatus(error)).json({
      error: error.message || 'Error generando respuesta del chat',
    });
  }
}