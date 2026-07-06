/**
 * services/fetchApi.js
 * Encapsula la llamada HTTP a la serverless function /api/functions.
 * chat.js arma el payload (system, messages, etc.) y usa esta función
 * en vez de hacer fetch directamente — así el detalle de "cómo se llama
 * al backend" vive en un solo lugar.
 */
export async function fetchChatReply({ system, model, temperature, maxTokens, messages }) {
  const res = await fetch('/api/functions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system,
      model,
      temperature,
      max_tokens: maxTokens,
      messages
    })
  });

  if (!res.ok) {
    let msg = 'No se pudo contactar al servicio de IA.';
    try {
      const errData = await res.json();
      if (errData && errData.error) msg = errData.error;
    } catch (_) {
      // el body de error no era JSON, usamos el mensaje genérico
    }
    throw new Error(msg);
  }

  // Devuelve el raw (shape tipo Anthropic: content[]); quien llama lo
  // pasa por normalizeAIResponse para sacar el texto.
  return res.json();
}