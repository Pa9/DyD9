import type { AbilityKey } from "@/lib/types";

export const ABILITIES: { key: AbilityKey; name: string; short: string }[] = [
  { key: "str", name: "Fuerza", short: "FUE" },
  { key: "dex", name: "Destreza", short: "DES" },
  { key: "con", name: "Constitución", short: "CON" },
  { key: "int", name: "Inteligencia", short: "INT" },
  { key: "wis", name: "Sabiduría", short: "SAB" },
  { key: "cha", name: "Carisma", short: "CAR" },
];

export const SKILLS: { id: string; name: string; ability: AbilityKey }[] = [
  { id: "acrobatics", name: "Acrobacias", ability: "dex" },
  { id: "animal", name: "Trato con Animales", ability: "wis" },
  { id: "arcana", name: "Arcanos", ability: "int" },
  { id: "athletics", name: "Atletismo", ability: "str" },
  { id: "deception", name: "Engaño", ability: "cha" },
  { id: "history", name: "Historia", ability: "int" },
  { id: "insight", name: "Perspicacia", ability: "wis" },
  { id: "intimidation", name: "Intimidación", ability: "cha" },
  { id: "investigation", name: "Investigación", ability: "int" },
  { id: "medicine", name: "Medicina", ability: "wis" },
  { id: "nature", name: "Naturaleza", ability: "int" },
  { id: "perception", name: "Percepción", ability: "wis" },
  { id: "performance", name: "Interpretación", ability: "cha" },
  { id: "persuasion", name: "Persuasión", ability: "cha" },
  { id: "religion", name: "Religión", ability: "int" },
  { id: "sleight", name: "Juego de Manos", ability: "dex" },
  { id: "stealth", name: "Sigilo", ability: "dex" },
  { id: "survival", name: "Supervivencia", ability: "wis" },
];

export const SKILL_MAP = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

/** Bonificador de competencia por nivel (D&D 5.5e) */
export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((Math.min(Math.max(level, 1), 20) - 1) / 4);
}

/** Puntos de experiencia necesarios por nivel */
export const XP_BY_LEVEL = [
  0, 0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000,
  165000, 195000, 225000, 265000, 305000, 355000,
];

/** Espacios de conjuro: lanzador completo (Bardo, Clérigo, Druida, Mago, Hechicero) */
export const FULL_CASTER_SLOTS: number[][] = [
  [],
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

/** Medio lanzador (Paladín, Explorador) */
export const HALF_CASTER_SLOTS: number[][] = [
  [],
  [],
  [2],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2],
];

/** Un tercio de lanzador (subclases marciales mágicas) */
export const THIRD_CASTER_SLOTS: number[][] = [
  [],
  [],
  [],
  [2],
  [3],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
];

/** Magia de Pacto del Brujo: [espacios, nivel de espacio] */
export const PACT_MAGIC: { slots: number; level: number }[] = [
  { slots: 0, level: 0 },
  { slots: 1, level: 1 },
  { slots: 2, level: 1 },
  { slots: 2, level: 2 },
  { slots: 2, level: 2 },
  { slots: 2, level: 3 },
  { slots: 2, level: 3 },
  { slots: 2, level: 4 },
  { slots: 2, level: 4 },
  { slots: 2, level: 5 },
  { slots: 2, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 4, level: 5 },
  { slots: 4, level: 5 },
  { slots: 4, level: 5 },
  { slots: 4, level: 5 },
];

export const ABILITY_NAME: Record<AbilityKey, string> = {
  str: "Fuerza",
  dex: "Destreza",
  con: "Constitución",
  int: "Inteligencia",
  wis: "Sabiduría",
  cha: "Carisma",
};

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const POINT_BUY_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};
