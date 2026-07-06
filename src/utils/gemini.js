export function toGeminiContents(messages) {
  return messages
    .filter((msg) => msg?.role === 'user' || msg?.role === 'assistant')
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(msg.content ?? '') }],
    }));
}


