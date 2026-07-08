export function parseJsonBody(body) {
  if (typeof body === 'string') {
    return JSON.parse(body || '{}');
  }
  return body ?? {};
}

export function getMessages(payload) {
  const messages = Array.isArray(payload?.messages) ? payload.messages : [];

  if (messages.length === 0) {
    const error = new Error('El payload debe incluir messages[]');
    error.status = 400;
    throw error;
  }

  return messages;
}



