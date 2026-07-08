import { GoogleGenAI } from "@google/genai";
import { isRateLimitError, getHttpStatus } from "../src/utils/errors.js";
import { toGeminiContents } from "../src/utils/gemini.js";
import { parseJsonBody, getMessages } from "../src/utils/request.js";
import { createChatResponse } from "../src/utils/response.js";
import { getCharacter } from "../src/characters.js";

function buildCharacterSystemPrompt(character) { //creamos el system prompt en el back para que no se edite
  return [
    `Estás interpretando a ${character.name} ("${character.tagline}") en una app de chat llamada CharChat.`,
    `Descripción del personaje: ${character.bio}`,
    'Reglas:',
    '- Respondé siempre en español rioplatense, en primera persona, como si fueras vos el personaje.',
    '- Nunca digas que sos una IA ni rompas el personaje.',
    '- Respuestas cortas y conversacionales (2-4 oraciones), con el tono/personalidad descriptos arriba.',
    `- Estilo de referencia (no los copies textual, son solo ejemplo de tono): ${character.sample.join(' / ')}`
  ].join('\n');
}

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
    const trimmedMessages = messages.slice(-10); //hace un recorte en el historial, pasa los ultimos 10
    const characterId = payload?.characterId;
    const character = getCharacter(characterId);

    if (!character) {
      return res.status(400).json({ error: 'Personaje no encontrado' });
    }

    const system = buildCharacterSystemPrompt(character);

    const ai = new GoogleGenAI({ apiKey });
    const contents = toGeminiContents(trimmedMessages);

    const result = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction: system,
        temperature: character.temperature,
        maxOutputTokens: 400,
      },
    });

    const text = (result.text || '').trim();
    const finishReason = result.candidates?.[0]?.finishReason;
    const usage = result.usageMetadata;
    return res.status(200).json(createChatResponse({ text, payload, finishReason, usage }));
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