/**
 * services/fetchApi.js
 * Encapsula la llamada HTTP a la serverless function /api/functions.
 * chat.js arma el payload (system, messages, etc.) y usa esta función
 * en vez de hacer fetch directamente — así el detalle de "cómo se llama
 * al backend" vive en un solo lugar.
 */
export async function fetchChatReply({ characterId, messages }) {
  const res = await fetch('/api/functions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      characterId, 
      messages 
    })
  });

  if (!res.ok) {
    let msg = 'No se pudo contactar al servicio de IA.';
    try {
      const errData = await res.json();
      if (errData && errData.error) msg = errData.error;
    } catch (_) {}
    throw new Error(msg);
  }

  return res.json();
}