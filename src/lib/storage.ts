import type { AbilityKey, Character } from "./types";

const KEY = "dnd55e.characters.v1";

function uid(): string {
  return `pj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyAbilities(): Record<AbilityKey, number> {
  return { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
}

export function createCharacter(partial: Partial<Character> = {}): Character {
  const now = new Date().toISOString();
  return {
    id: uid(),
    name: "",
    playerName: "",
    speciesId: null,
    classId: null,
    subclassId: null,
    backgroundId: null,
    level: 1,
    alignment: "",
    abilities: emptyAbilities(),
    backgroundAbilities: {},
    skillProficiencies: [],
    expertise: [],
    choices: {},
    asi: [],
    cantrips: [],
    spells: [],
    preparedSpells: [],
    equipment: [],
    currency: { cp: 0, sp: 0, gp: 0, pp: 0 },
    hpMode: "average",
    hpRolls: {},
    notes: "",
    appearance: "",
    levelLog: [{ level: 1, date: now }],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

function isImportableCharacter(value: unknown): value is Character {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const c = value as Record<string, unknown>;
  const abilities = c.abilities;
  const currency = c.currency;
  const abilityKeys = ["str", "dex", "con", "int", "wis", "cha"];
  return (
    typeof c.id === "string" &&
    c.id.length > 0 &&
    typeof c.name === "string" &&
    Number.isInteger(c.level) &&
    (c.level as number) >= 1 &&
    (c.level as number) <= 20 &&
    (c.speciesId === null || typeof c.speciesId === "string") &&
    (c.classId === null || typeof c.classId === "string") &&
    (c.backgroundId === null || typeof c.backgroundId === "string") &&
    !!abilities &&
    typeof abilities === "object" &&
    !Array.isArray(abilities) &&
    abilityKeys.every(
      (key) =>
        typeof (abilities as Record<string, unknown>)[key] === "number" &&
        Number.isFinite((abilities as Record<string, number>)[key]),
    ) &&
    !!currency &&
    typeof currency === "object" &&
    !Array.isArray(currency) &&
    ["cp", "sp", "gp", "pp"].every(
      (key) => typeof (currency as Record<string, unknown>)[key] === "number",
    ) &&
    !!c.backgroundAbilities &&
    typeof c.backgroundAbilities === "object" &&
    !!c.choices &&
    typeof c.choices === "object" &&
    !!c.hpRolls &&
    typeof c.hpRolls === "object" &&
    [
      "skillProficiencies",
      "expertise",
      "asi",
      "cantrips",
      "spells",
      "preparedSpells",
      "equipment",
      "levelLog",
    ].every((key) => Array.isArray(c[key])) &&
    typeof c.notes === "string" &&
    typeof c.appearance === "string" &&
    typeof c.createdAt === "string" &&
    typeof c.updatedAt === "string" &&
    (c.targetLevel === undefined ||
      (Number.isInteger(c.targetLevel) &&
        (c.targetLevel as number) >= 1 &&
        (c.targetLevel as number) <= 20))
  );
}

/* --- Almacén reactivo sobre localStorage --- */

let cache: Character[] | null = null;
const listeners = new Set<() => void>();

function read(): Character[] {
  if (typeof window === "undefined") return [];
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? parsed.filter(isImportableCharacter) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: Character[]) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

export const store = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): Character[] {
    return read();
  },
  getServerSnapshot(): Character[] {
    return EMPTY;
  },
  list(): Character[] {
    return read();
  },
  get(id: string): Character | undefined {
    return read().find((c) => c.id === id);
  },
  add(c: Character) {
    write([c, ...read()]);
    return c;
  },
  update(id: string, patch: Partial<Character> | ((c: Character) => Partial<Character>)) {
    const next = read().map((c) => {
      if (c.id !== id) return c;
      const p = typeof patch === "function" ? patch(c) : patch;
      return { ...c, ...p, updatedAt: new Date().toISOString() };
    });
    write(next);
  },
  remove(id: string) {
    write(read().filter((c) => c.id !== id));
  },
  duplicate(id: string): Character | null {
    const src = read().find((c) => c.id === id);
    if (!src) return null;
    const now = new Date().toISOString();
    const copy: Character = {
      ...structuredClone(src),
      id: uid(),
      name: `${src.name || "Sin nombre"} (copia)`,
      createdAt: now,
      updatedAt: now,
    };
    write([copy, ...read()]);
    return copy;
  },
  exportAll(): string {
    return JSON.stringify(read(), null, 2);
  },
  importAll(json: string): number {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed) || !parsed.every(isImportableCharacter)) {
      throw new Error("El archivo no contiene fichas de personaje válidas");
    }
    const existing = read();
    const ids = new Set(existing.map((c) => c.id));
    const incoming = parsed.map((character) => {
      let id = character.id;
      while (ids.has(id)) id = uid();
      ids.add(id);
      return { ...character, id };
    });
    write([...incoming, ...existing]);
    return incoming.length;
  },
};

const EMPTY: Character[] = [];
