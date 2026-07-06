export function createChatResponse({ text, payload }) {
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
    stop_reason: 'end_turn',
    usage: {
      input_tokens: estimateTokens(JSON.stringify(payload)),
      output_tokens: estimateTokens(text),
    },
  };
}

function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text).length / 4));
}


