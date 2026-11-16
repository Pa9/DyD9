import { beforeEach, describe, expect, test } from "bun:test";
import { createCharacter, store } from "./storage";

const KEY = "dnd55e.characters.v1";
let data = new Map<string, string>();

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
      removeItem: (key: string) => {
        data.delete(key);
      },
    },
  },
});

beforeEach(() => {
  data = new Map();
  store.remove("__reset__");
});

describe("importación y exportación de personajes", () => {
  test("rechaza documentos que no son listas", () => {
    expect(() => store.importAll("{}")).toThrow();
  });

  test("rechaza personajes incompletos", () => {
    expect(() => store.importAll('[{"id":"incompleto"}]')).toThrow();
  });

  test("importa personajes válidos y conserva sus datos", () => {
    const character = createCharacter({ name: "Aventurera", targetLevel: 10 });
    const count = store.importAll(JSON.stringify([character]));
    expect(count).toBe(1);
    expect(store.list().some((c) => c.name === "Aventurera" && c.targetLevel === 10)).toBe(true);
  });

  test("evita colisiones de identificadores al importar", () => {
    const character = createCharacter({ name: "Mago" });
    store.importAll(JSON.stringify([character]));
    store.importAll(JSON.stringify([character]));
    const ids = store.list().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("rechaza niveles objetivo fuera de 1–20", () => {
    const character = createCharacter({ name: "Guerrera", targetLevel: 21 });
    expect(() => store.importAll(JSON.stringify([character]))).toThrow();
  });
});
