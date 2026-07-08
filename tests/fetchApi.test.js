import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchChatReply } from "../src/services/fetchApi.js";

describe("fetchChatReply", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("llama a /api/functions con POST y headers correctos", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "msg_123" }),
    });

    await fetchChatReply({
      characterId: "messi",
      messages: [{ role: "user", content: "hola" }],
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/functions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characterId: "messi",
        messages: [{ role: "user", content: "hola" }],
      }),
    });
  });

  it("retorna el JSON cuando la respuesta es exitosa", async () => {
    const expected = {
      id: "msg_123",
      role: "assistant",
      content: [{ text: "hola" }],
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(expected),
    });

    const result = await fetchChatReply({
      characterId: "messi",
      messages: [],
    });
    expect(result).toEqual(expected);
  });

  it("lanza error con mensaje del servidor cuando falla", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Rate limit exceeded" }),
    });

    await expect(
      fetchChatReply({ characterId: "messi", messages: [] })
    ).rejects.toThrow("Rate limit exceeded");
  });

  it("lanza error default si no hay cuerpo JSON en el error", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error("parse error")),
    });

    await expect(
      fetchChatReply({ characterId: "messi", messages: [] })
    ).rejects.toThrow("No se pudo contactar al servicio de IA.");
  });
});
