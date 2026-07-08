import { describe, it, expect } from "vitest";
import { toGeminiContents } from "../src/utils/gemini.js";

describe("gemini.js", () => {
  it("convierte role assistant a model, user se mantiene", () => {
    const messages = [
      { role: "user", content: "hola" },
      { role: "assistant", content: "¿cómo estás?" },
    ];
    const result = toGeminiContents(messages);
    expect(result).toEqual([
      { role: "user", parts: [{ text: "hola" }] },
      { role: "model", parts: [{ text: "¿cómo estás?" }] },
    ]);
  });

  it("filtra roles que no sean user ni assistant", () => {
    const messages = [
      { role: "system", content: "instruccion" },
      { role: "user", content: "hola" },
      { role: "assistant", content: "chau" },
    ];
    const result = toGeminiContents(messages);
    expect(result).toHaveLength(2);
    expect(result[0].role).toBe("user");
    expect(result[1].role).toBe("model");
  });

  it("maneja array vacio", () => {
    expect(toGeminiContents([])).toEqual([]);
  });

  it("convierte el contenido a string aunque sea numero", () => {
    const messages = [
      { role: "user", content: 42 },
    ];
    const result = toGeminiContents(messages);
    expect(result[0].parts[0].text).toBe("42");
  });
});
