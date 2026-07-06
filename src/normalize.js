
export function normalizeAIResponse(raw) {
  const blocks = Array.isArray(raw && raw.content) ? raw.content : [];

  const text = blocks
    .filter((block) => block && block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('')
    .trim();

  const truncated = raw && raw.stop_reason === 'max_tokens';

  return { text, truncated };
}

export function extractUsage(raw) {
  return {
    inputTokens: raw.usage?.input_tokens || 0,
    outputTokens: raw.usage?.output_tokens || 0
  };
}