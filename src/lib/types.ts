export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type CasterType = "full" | "half" | "pact" | "third";

export interface Feature {
  level: number;
  name: string;
  desc: string;
  /** Si la característica exige una elección del jugador */
  choice?: FeatureChoice;
}

export interface FeatureChoice {
  /** Identificador estable de la elección, p.ej. "fighting-style" */
  id: string;
  label: string;
  /** Cuántas opciones se eligen */
  count: number;
  options: { id: string; name: string; desc?: string }[];
}

export interface EquipmentItem {
  name: string;
  qty: number;
  notes?: string;
}

export interface EquipmentPackage {
  id: string;
  label: string;
  items: EquipmentItem[];
}

export interface Species {
  id: string;
  name: string;
  desc: string;
  size: string;
  speed: number;
  traits: Feature[];
  /** Elecciones propias de la especie (p.ej. linaje dracónico) */
  lineages?: FeatureChoice;
}

export interface Subclass {
  id: string;
  name: string;
  desc: string;
  features: Feature[];
  caster?: CasterType;
  spellAbility?: AbilityKey;
}

export interface DndClass {
  id: string;
  name: string;
  desc: string;
  hitDie: number;
  primary: AbilityKey[];
  saves: AbilityKey[];
  skillCount: number;
  skillOptions: string[];
  armor: string[];
  weapons: string[];
  tools: string[];
  equipment: EquipmentPackage[];
  caster?: CasterType;
  spellAbility?: AbilityKey;
  cantripsKnown?: number[];
  spellsPrepared?: number[];
  subclassLevel: number;
  subclasses: Subclass[];
  asiLevels: number[];
  features: Feature[];
}

export interface Background {
  id: string;
  name: string;
  desc: string;
  abilityOptions: AbilityKey[];
  skills: string[];
  toolProficiency: string;
  featId: string;
  equipment: EquipmentItem[];
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  concentration?: boolean;
  ritual?: boolean;
  desc: string;
  /** Cómo mejora con espacios superiores o al subir de nivel */
  upcast?: string;
  classes: string[];
}

export interface Feat {
  id: string;
  name: string;
  category: "origin" | "general" | "fighting-style";
  desc: string;
  prerequisite?: string;
}

export interface AsiChoice {
  level: number;
  type: "asi" | "feat";
  abilities?: AbilityKey[] | undefined;
  featId?: string | undefined;
}

export interface Character {
  id: string;
  name: string;
  playerName?: string;
  speciesId: string | null;
  classId: string | null;
  subclassId: string | null;
  backgroundId: string | null;
  level: number;
  alignment?: string;
  abilities: Record<AbilityKey, number>;
  /** Mejoras de puntuación del trasfondo (5.5e: +2/+1 o +1/+1/+1) */
  backgroundAbilities: Partial<Record<AbilityKey, number>>;
  skillProficiencies: string[];
  expertise: string[];
  /** Elecciones de características: choiceId -> opciones elegidas */
  choices: Record<string, string[]>;
  asi: AsiChoice[];
  cantrips: string[];
  spells: string[];
  preparedSpells: string[];
  equipment: EquipmentItem[];
  currency: { cp: number; sp: number; gp: number; pp: number };
  hpMode: "average" | "manual";
  hpRolls: Record<string, number>;
  currentHp?: number;
  tempHp?: number;
  notes: string;
  appearance: string;
  /** Historial de subidas de nivel */
  levelLog: { level: number; date: string }[];
  createdAt: string;
  updatedAt: string;
}
