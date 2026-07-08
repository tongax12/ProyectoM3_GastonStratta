import { describe, it, expect } from "vitest";
import { getCharacter, characterAvatarHTML } from "../src/characters.js";

describe("characters.js", () => {
  describe("getCharacter", () => {
    it("devuelve el personaje correcto por id", () => {
      const messi = getCharacter("messi");
      expect(messi.name).toBe("Leo Messi");
      expect(messi.id).toBe("messi");
      expect(messi.temperature).toBe(0.7);
    });

    it("devuelve el primer personaje (messi) si el id no existe", () => {
      const fallback = getCharacter("inexistente");
      expect(fallback.id).toBe("messi");
    });
  });

  describe("characterAvatarHTML", () => {
    it("genera un tag img cuando hay avatarImage", () => {
      const messi = getCharacter("messi");
      const html = characterAvatarHTML(messi);
      expect(html).toContain("<img");
      expect(html).toContain('src="/img/messi.jpg"');
      expect(html).toContain('data-fallback="🐐"');
      expect(html).toContain('alt="Leo Messi"');
    });

    it("usa el emoji cuando no hay avatarImage", () => {
      const char = { ...getCharacter("messi"), avatarImage: null, avatar: "🐐" };
      expect(characterAvatarHTML(char)).toBe("🐐");
    });
  });
});
