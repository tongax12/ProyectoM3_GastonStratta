export function createChatResponse({ text, payload, finishReason, usage }) {
  return {
    id: `msg_gemini_${Date.now()}`,
    type: 'message',
    role: 'assistant',
    content: [
      {
        type: 'text',
        text,
      },
    ],
    stop_reason: mapStopReason(finishReason),
    usage: {
    input_tokens: usage?.promptTokenCount ?? estimateTokens(JSON.stringify(payload)), //cuando USE_MOCK_AI = true, usa estimateTokens
    output_tokens: usage?.candidatesTokenCount ?? estimateTokens(text), //cuando USE_MOCK_AI = true, usa estimateTokens
  },
  };
}

function mapStopReason(reason) {
  switch (reason) {
    case 'MAX_TOKENS':
      return 'max_tokens';
    case 'STOP':
      return 'end_turn';
    default:
      return 'end_turn';
  }
}

function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text).length / 4));
}