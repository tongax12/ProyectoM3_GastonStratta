import { describe, it, expect } from "vitest";
import { normalizeAIResponse, extractUsage } from "../src/normalize.js";

describe("normalize.js", () => {
  describe("normalizeAIResponse", () => {
    it("extrae texto de bloques con tipo text", () => {
      const raw = {
        content: [
          { type: "text", text: "Hola " },
          { type: "text", text: "Mundo" },
        ],
      };
      expect(normalizeAIResponse(raw).text).toBe("Hola Mundo");
    });

    it("filtra bloques que no son text", () => {
      const raw = {
        content: [
          { type: "image", url: "..." },
          { type: "text", text: "solo texto" },
        ],
      };
      expect(normalizeAIResponse(raw).text).toBe("solo texto");
    });

    it("detecta truncated verdadero si stop_reason es max_tokens", () => {
      const raw = { content: [], stop_reason: "max_tokens" };
      expect(normalizeAIResponse(raw).truncated).toBe(true);
    });

    it("retorna truncated false cuando no hay stop_reason", () => {
      const raw = { content: [{ type: "text", text: "ok" }] };
      expect(normalizeAIResponse(raw).truncated).toBe(false);
    });
  });

  describe("extractUsage", () => {
    it("extrae input y output tokens del raw", () => {
      const raw = { usage: { input_tokens: 10, output_tokens: 20 } };
      expect(extractUsage(raw)).toEqual({ inputTokens: 10, outputTokens: 20 });
    });

    it("devuelve 0 si no hay usage", () => {
      expect(extractUsage({})).toEqual({ inputTokens: 0, outputTokens: 0 });
    });
  });
});
