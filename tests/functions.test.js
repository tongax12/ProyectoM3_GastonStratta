import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn(),
}));

import handler from "../api/functions.js";
import { GoogleGenAI } from "@google/genai";

describe("api/functions.js handler", () => {
  let req, res;
  let mockGenerateContent;

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("GEMINI_API_KEY", "test-key-123");

    mockGenerateContent = vi.fn().mockResolvedValue({
      text: "Hola, soy Leo",
      candidates: [{ finishReason: "STOP" }],
      usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20 },
    });

    vi.mocked(GoogleGenAI).mockImplementation(function () {
      return {
        models: { generateContent: mockGenerateContent },
      };
    });

    req = { method: "POST", body: null };
    res = {
      _status: 200,
      _json: null,
      status(code) {
        this._status = code;
        return this;
      },
      json(data) {
        this._json = data;
      },
    };
  });

  afterEach(() => {
    console.error.mockRestore();
    vi.unstubAllEnvs();
  });

  it("responde 405 si el método no es POST", async () => {
    req.method = "GET";
    await handler(req, res);
    expect(res._status).toBe(405);
    expect(res._json).toEqual({ error: "Method not allowed" });
  });

  it("responde 500 si falta GEMINI_API_KEY", async () => {
    vi.stubEnv("GEMINI_API_KEY", undefined);
    req.body = {
      characterId: "messi",
      messages: [{ role: "user", content: "hola" }],
    };
    await handler(req, res);
    expect(res._status).toBe(500);
    expect(res._json).toEqual({ error: "GEMINI_API_KEY no configurada" });
  });

  it("responde 200 con respuesta formateada en éxito", async () => {
    req.body = {
      characterId: "messi",
      messages: [{ role: "user", content: "hola" }],
    };
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._json.role).toBe("assistant");
    expect(res._json.content[0].text).toBe("Hola, soy Leo");
  });

  it("responde 429 en rate limit de Gemini", async () => {
    mockGenerateContent.mockRejectedValue({
      status: 429,
      message: "quota exceeded",
    });

    req.body = {
      characterId: "messi",
      messages: [{ role: "user", content: "hola" }],
    };
    await handler(req, res);
    expect(res._status).toBe(429);
    expect(res._json.error).toBe(
      "Rate limit de Gemini. Reintentá en unos segundos."
    );
    expect(res._json.retryAfterSeconds).toBe(8);
  });

  it("responde 500 en error genérico de Gemini", async () => {
    mockGenerateContent.mockRejectedValue(
      new Error("Internal server error")
    );

    req.body = {
      characterId: "messi",
      messages: [{ role: "user", content: "hola" }],
    };
    await handler(req, res);
    expect(res._status).toBe(500);
    expect(res._json.error).toBe("Internal server error");
  });
});
