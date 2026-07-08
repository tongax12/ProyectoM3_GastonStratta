import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { createChatResponse } from "../src/utils/response.js";

beforeAll(() => {
  vi.spyOn(Date, "now").mockReturnValue(1710000000000);
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("response.js", () => {
  it("crea respuesta con texto y stop_reason end_turn", () => {
    const result = createChatResponse({
      text: "Hola, soy Leo",
      payload: { characterId: "messi" },
    });

    expect(result).toMatchObject({
      id: "msg_gemini_1710000000000",
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "Hola, soy Leo" }],
      stop_reason: "end_turn",
    });
  });

  it("mapea finishReason MAX_TOKENS a max_tokens", () => {
    const result = createChatResponse({
      text: "respuesta larga...",
      finishReason: "MAX_TOKENS",
      payload: {},
    });
    expect(result.stop_reason).toBe("max_tokens");
  });

  it("estima tokens cuando no hay usageMetadata", () => {
    const result = createChatResponse({
      text: "hola mundo",
      payload: { messages: [] },
    });

    // "hola mundo" = 10 chars → 10 / 4 = 2.5 → ceil = 3
    expect(result.usage.output_tokens).toBe(3);
    expect(result.usage.input_tokens).toBeGreaterThan(0);
  });

  it("usa usageMetadata cuando está disponible", () => {
    const usage = { promptTokenCount: 50, candidatesTokenCount: 30 };
    const result = createChatResponse({
      text: "respuesta",
      payload: {},
      usage,
    });
    expect(result.usage.input_tokens).toBe(50);
    expect(result.usage.output_tokens).toBe(30);
  });
});
