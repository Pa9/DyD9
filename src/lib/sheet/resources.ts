/**
 * Capa de LÓGICA DE D&D: recursos específicos de cada clase.
 * Para añadir una clase nueva basta con registrar aquí sus recursos.
 */

export interface ResourceDef {
  id: string;
  label: string;
  /** Valor del recurso en un nivel dado; null si aún no se ha desbloqueado */
  valueAt: (level: number) => string | null;
  note?: string;
  recovery?: "short" | "long" | "special";
}

const table = (values: (string | number | null)[]) => (level: number) => {
  const v = values[Math.min(20, Math.max(1, level))];
  return v === null || v === undefined ? null : String(v);
};

const from = (start: number, fn: (level: number) => string) => (level: number) =>
  level >= start ? fn(level) : null;

/** [_, n1..n20] */
const RAGE = table([null, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6]);
const RAGE_DMG = table([null, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4]);
const BARDIC_DIE = table([
  null,
  "d6",
  "d6",
  "d6",
  "d6",
  "d8",
  "d8",
  "d8",
  "d8",
  "d8",
  "d10",
  "d10",
  "d10",
  "d10",
  "d10",
  "d12",
  "d12",
  "d12",
  "d12",
  "d12",
  "d12",
]);
const SNEAK = table([
  null,
  "1d6",
  "1d6",
  "2d6",
  "2d6",
  "3d6",
  "3d6",
  "4d6",
  "4d6",
  "5d6",
  "5d6",
  "6d6",
  "6d6",
  "7d6",
  "7d6",
  "8d6",
  "8d6",
  "9d6",
  "9d6",
  "10d6",
  "10d6",
]);
const MARTIAL_DIE = table([
  null,
  null,
  null,
  "d6",
  "d6",
  "d6",
  "d6",
  "d6",
  "d6",
  "d8",
  "d8",
  "d8",
  "d8",
  "d8",
  "d8",
  "d8",
  "d8",
  "d10",
  "d10",
  "d10",
  "d10",
]);
const MONK_DIE = table([
  null,
  "d6",
  "d6",
  "d6",
  "d6",
  "d8",
  "d8",
  "d8",
  "d8",
  "d8",
  "d8",
  "d10",
  "d10",
  "d10",
  "d10",
  "d10",
  "d10",
  "d12",
  "d12",
  "d12",
  "d12",
]);
const ATTACKS = (extra: [number, number][]) =>
  table(
    Array.from({ length: 21 }, (_, lvl) => {
      if (lvl === 0) return null;
      let n = 1;
      for (const [at, value] of extra) if (lvl >= at) n = value;
      return `${n}`;
    }),
  );

export const CLASS_RESOURCES: Record<string, ResourceDef[]> = {
  barbarian: [
    { id: "rage", label: "Furias por descanso largo", valueAt: RAGE, recovery: "long" },
    { id: "rage-dmg", label: "Daño de Furia", valueAt: RAGE_DMG },
    { id: "attacks", label: "Ataques por acción", valueAt: ATTACKS([[5, 2]]) },
    { id: "brutal", label: "Golpe Brutal", valueAt: from(9, (l) => (l >= 17 ? "2d10" : "1d10")) },
  ],
  bard: [
    {
      id: "inspiration",
      label: "Inspiración Bárdica (dado)",
      valueAt: BARDIC_DIE,
      recovery: "short",
    },
    { id: "insp-uses", label: "Usos de Inspiración", valueAt: () => "= mod. Carisma" },
    {
      id: "song-rest",
      label: "Canción del Descanso",
      valueAt: from(2, (l) => (l >= 17 ? "1d12" : l >= 13 ? "1d10" : l >= 9 ? "1d8" : "1d6")),
    },
  ],
  cleric: [
    {
      id: "channel",
      label: "Canalizar Divinidad",
      valueAt: from(2, (l) => (l >= 18 ? "4" : l >= 6 ? "3" : "2")),
      recovery: "short",
    },
    { id: "turn", label: "Expulsar Muertos Vivientes", valueAt: from(2, () => "Sí") },
    {
      id: "divine-spark",
      label: "Chispa Divina",
      valueAt: from(2, (l) => `${Math.ceil(Math.min(20, l) / 6) + 1}d8`),
    },
  ],
  druid: [
    {
      id: "wildshape",
      label: "Forma Salvaje (usos)",
      valueAt: from(2, (l) => (l >= 17 ? "4" : l >= 6 ? "3" : "2")),
      recovery: "short",
    },
    {
      id: "wildshape-cr",
      label: "VD máximo de Forma Salvaje",
      valueAt: from(2, (l) => (l >= 8 ? "1" : l >= 4 ? "1/2" : "1/4")),
    },
  ],
  fighter: [
    {
      id: "second-wind",
      label: "Reserva de Energía",
      valueAt: from(1, (l) => (l >= 10 ? "3" : l >= 4 ? "2" : "1")),
      recovery: "short",
    },
    {
      id: "attacks",
      label: "Ataques por acción",
      valueAt: ATTACKS([
        [5, 2],
        [11, 3],
        [20, 4],
      ]),
    },
    {
      id: "action-surge",
      label: "Oleada de Acción",
      valueAt: from(2, (l) => (l >= 17 ? "2" : "1")),
      recovery: "short",
    },
    { id: "tactical", label: "Maestría Táctica", valueAt: from(9, () => "Sí") },
  ],
  monk: [
    {
      id: "ki",
      label: "Puntos de Concentración",
      valueAt: from(2, (l) => `${Math.min(20, l)}`),
      recovery: "short",
    },
    { id: "martial-die", label: "Dado de Artes Marciales", valueAt: MONK_DIE },
    {
      id: "monk-speed",
      label: "Movimiento sin Armadura",
      valueAt: from(2, (l) => `+${l >= 16 ? 30 : l >= 10 ? 20 : 10} pies`),
    },
    { id: "attacks", label: "Ataques por acción", valueAt: ATTACKS([[5, 2]]) },
  ],
  paladin: [
    {
      id: "lay-on-hands",
      label: "Imposición de Manos (PG)",
      valueAt: (l) => `${Math.min(20, l) * 5}`,
      recovery: "long",
    },
    {
      id: "channel-oath",
      label: "Canalizar Divinidad",
      valueAt: from(3, (l) => (l >= 11 ? "3" : "2")),
      recovery: "short",
    },
    {
      id: "smite",
      label: "Castigo Divino",
      valueAt: from(1, () => "2d8 (+1d8 por nivel de espacio)"),
    },
    { id: "attacks", label: "Ataques por acción", valueAt: ATTACKS([[5, 2]]) },
  ],
  ranger: [
    {
      id: "hunters-mark",
      label: "Marca del Cazador (usos)",
      valueAt: from(1, (l) => (l >= 17 ? "6" : l >= 13 ? "5" : l >= 9 ? "4" : l >= 5 ? "3" : "2")),
      recovery: "long",
    },
    {
      id: "mark-dmg",
      label: "Daño de la Marca",
      valueAt: from(1, (l) => (l >= 20 ? "1d10" : "1d6")),
    },
    { id: "attacks", label: "Ataques por acción", valueAt: ATTACKS([[5, 2]]) },
  ],
  rogue: [
    { id: "sneak", label: "Ataque Furtivo", valueAt: SNEAK },
    { id: "cunning", label: "Acción Astuta", valueAt: from(2, () => "Sí") },
    { id: "luck", label: "Suerte Fiable", valueAt: from(7, () => "Sí") },
  ],
  sorcerer: [
    {
      id: "sorcery",
      label: "Puntos de Hechicería",
      valueAt: from(2, (l) => `${Math.min(20, l)}`),
      recovery: "long",
    },
    {
      id: "metamagic",
      label: "Metamagia conocida",
      valueAt: from(2, (l) => (l >= 17 ? "6" : l >= 10 ? "4" : "2")),
    },
    { id: "innate", label: "Hechicería Innata", valueAt: from(1, () => "Sí") },
  ],
  warlock: [
    {
      id: "invocations",
      label: "Invocaciones Sobrenaturales",
      valueAt: from(
        1,
        (l) =>
          `${l >= 18 ? 8 : l >= 15 ? 7 : l >= 12 ? 6 : l >= 9 ? 5 : l >= 7 ? 4 : l >= 5 ? 3 : l >= 2 ? 2 : 1}`,
      ),
    },
    {
      id: "mystic-arcanum",
      label: "Arcanum Místico",
      valueAt: from(11, (l) =>
        l >= 17 ? "6.º–9.º" : l >= 15 ? "6.º–8.º" : l >= 13 ? "6.º–7.º" : "6.º",
      ),
    },
    {
      id: "pact-slots",
      label: "Espacios de Magia de Pacto",
      valueAt: from(1, () => "Ver tabla de pacto"),
      recovery: "short",
    },
  ],
  wizard: [
    {
      id: "recovery",
      label: "Recuperación Arcana (niveles)",
      valueAt: from(1, (l) => `${Math.ceil(Math.min(20, l) / 2)}`),
      recovery: "short",
    },
    { id: "ritual", label: "Adepto de Rituales", valueAt: from(1, () => "Sí") },
    { id: "memorize", label: "Memorizar Conjuro", valueAt: from(5, () => "Sí") },
  ],
  fighter_extra: [],
};

export function resourcesForClass(classId: string | null): ResourceDef[] {
  if (!classId) return [];
  return CLASS_RESOURCES[classId] ?? [];
}

/** Dado de golpe extra: dados marciales de subclases (p.ej. Maestro de Batalla) */
export const SUBCLASS_RESOURCES: Record<string, ResourceDef[]> = {
  "battle-master": [
    {
      id: "superiority",
      label: "Dados de Superioridad",
      valueAt: from(3, (l) => (l >= 15 ? "6" : l >= 7 ? "5" : "4")),
      recovery: "short",
    },
    { id: "superiority-die", label: "Tamaño del dado", valueAt: MARTIAL_DIE },
  ],
};

export function resourcesForSubclass(subclassId: string | null): ResourceDef[] {
  if (!subclassId) return [];
  return SUBCLASS_RESOURCES[subclassId] ?? [];
}
