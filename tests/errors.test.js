import { describe, it, expect } from "vitest";
import { getHttpStatus, isRateLimitError } from "../src/utils/errors.js";

describe("errors.js", () => {
  describe("getHttpStatus", () => {
    it("devuelve el status del error cuando existe", () => {
      const error = new Error("not found");
      error.status = 404;
      expect(getHttpStatus(error)).toBe(404);
    });

    it("devuelve 500 si el error no tiene status", () => {
      expect(getHttpStatus(new Error("generic"))).toBe(500);
    });

    it("devuelve 500 si el argumento es null", () => {
      expect(getHttpStatus(null)).toBe(500);
    });
  });

  describe("isRateLimitError", () => {
    it("detecta rate limit por status 429", () => {
      const error = { status: 429, message: "Too Many Requests" };
      expect(isRateLimitError(error)).toBe(true);
    });

    it("detecta rate limit por mensaje con 'quota'", () => {
      expect(isRateLimitError({ message: "Quota exceeded, try again" })).toBe(true);
    });

    it("detecta rate limit por mensaje con '429'", () => {
      expect(isRateLimitError({ message: "Error 429: too many requests" })).toBe(true);
    });

    it("retorna false si no hay indicios de rate limit", () => {
      expect(isRateLimitError({ message: "internal server error" })).toBe(false);
    });
  });
});
