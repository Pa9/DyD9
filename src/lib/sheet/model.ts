/**
 * Capa de DATOS DERIVADOS de la ficha.
 * El personaje es la única fuente de verdad: este módulo sólo lo proyecta.
 * No contiene nada visual ni de exportación.
 */
import { ABILITIES, SKILL_MAP, XP_BY_LEVEL, proficiencyBonus } from "@/data/rules";
import { CLASS_MAP } from "@/data/classes";
import { SPECIES_MAP } from "@/data/species";
import { BACKGROUND_MAP } from "@/data/backgrounds";
import { FEAT_MAP } from "@/data/feats";
import { SPELL_MAP } from "@/data/spells";
import {
  ABILITY_KEYS,
  abilityMod,
  armorClass,
  casterType,
  cantripsAllowed,
  characterSubtitle,
  expertiseAllowed,
  featuresFor,
  finalAbilities,
  hitDiceLabel,
  maxHp,
  saveBonuses,
  skillLines,
  speed,
  spellSlots,
  spellcastingStats,
  spellsAllowed,
  type SkillLine,
  type SourcedFeature,
} from "@/lib/derive";
import { resourcesForClass, resourcesForSubclass } from "./resources";
import type { AbilityKey, Character, EquipmentItem, Feature, Spell } from "@/lib/types";

export interface AbilityLine {
  key: AbilityKey;
  name: string;
  short: string;
  score: number;
  mod: number;
  save: number;
  saveProficient: boolean;
}

export interface ProgressionEntry {
  name: string;
  source: string;
  kind: SourcedFeature["sourceKind"] | "asi" | "subclass";
}

export interface ProgressionRow {
  level: number;
  unlocked: boolean;
  current: boolean;
  xp: number;
  profBonus: number;
  entries: ProgressionEntry[];
  /** Espacios de conjuro en ese nivel (vacío si no lanza) */
  slots: number[];
  pact?: { slots: number; level: number };
  cantrips: number;
  prepared: number;
  asi: boolean;
  /** Recursos de clase con su valor en ese nivel */
  resources: { label: string; value: string }[];
  hitDice: string;
}

export interface ResourceLine {
  id: string;
  label: string;
  value: string;
  recovery?: "short" | "long" | "special";
}

export interface SheetModel {
  character: Character;
  identity: {
    name: string;
    playerName: string;
    speciesName: string;
    className: string;
    subclassName: string;
    backgroundName: string;
    level: number;
    alignment: string;
    size: string;
    subtitle: string;
    xp: number;
  };
  abilities: AbilityLine[];
  combat: {
    maxHp: number;
    currentHp: number | null;
    tempHp: number | null;
    ac: number;
    acNote: string;
    speed: number;
    hitDice: string;
    initiative: number;
    profBonus: number;
    passivePerception: number;
    passiveInvestigation: number;
    passiveInsight: number;
  };
  skills: SkillLine[];
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    saves: string[];
    skills: string[];
  };
  speciesTraits: Feature[];
  features: SourcedFeature[];
  featuresByLevel: { level: number; features: SourcedFeature[] }[];
  feats: { level: number; name: string; desc: string; origin: string }[];
  choices: { label: string; values: string[] }[];
  spellcasting: ReturnType<typeof spellcastingStats>;
  cantrips: Spell[];
  spellsByLevel: { level: number; spells: Spell[]; prepared: string[] }[];
  resources: ResourceLine[];
  equipment: EquipmentItem[];
  currency: { label: string; value: number }[];
  progression: ProgressionRow[];
  notes: string;
  appearance: string;
  manualNotes: string;
  flags: {
    isCaster: boolean;
    isPactCaster: boolean;
    hasSubclass: boolean;
    hasResources: boolean;
    hasEquipment: boolean;
  };
}

const CURRENCY_LABELS: { key: keyof Character["currency"]; label: string }[] = [
  { key: "pp", label: "PT (piezas de platino)" },
  { key: "gp", label: "PO (piezas de oro)" },
  { key: "sp", label: "PP (piezas de plata)" },
  { key: "cp", label: "PC (piezas de cobre)" },
];

/** Construye el modelo completo de la ficha a partir del personaje. */
export function buildSheetModel(c: Character): SheetModel {
  const klass = c.classId ? CLASS_MAP[c.classId] : null;
  const sub = klass?.subclasses.find((s) => s.id === c.subclassId) ?? null;
  const species = c.speciesId ? SPECIES_MAP[c.speciesId] : null;
  const bg = c.backgroundId ? BACKGROUND_MAP[c.backgroundId] : null;

  const scores = finalAbilities(c);
  const saves = saveBonuses(c);
  const abilities: AbilityLine[] = ABILITIES.map((a) => ({
    key: a.key,
    name: a.name,
    short: a.short,
    score: scores[a.key],
    mod: abilityMod(scores[a.key]),
    save: saves[a.key].bonus,
    saveProficient: saves[a.key].proficient,
  }));

  const skills = skillLines(c);
  const bonusOf = (id: string) => skills.find((s) => s.id === id)?.bonus ?? 0;
  const ac = armorClass(c);
  const sc = spellcastingStats(c);

  const features = featuresFor(c);
  const featuresByLevel = Array.from(
    features.reduce((map, f) => {
      const arr = map.get(f.level) ?? [];
      arr.push(f);
      map.set(f.level, arr);
      return map;
    }, new Map<number, SourcedFeature[]>()),
  )
    .sort((a, b) => a[0] - b[0])
    .map(([level, list]) => ({ level, features: list }));

  const feats: SheetModel["feats"] = [];
  if (bg && FEAT_MAP[bg.featId]) {
    feats.push({
      level: 1,
      name: FEAT_MAP[bg.featId]!.name,
      desc: FEAT_MAP[bg.featId]!.desc,
      origin: `Trasfondo: ${bg.name}`,
    });
  }
  for (const a of c.asi) {
    if (a.level > c.level || a.type !== "feat" || !a.featId) continue;
    const f = FEAT_MAP[a.featId];
    if (f) feats.push({ level: a.level, name: f.name, desc: f.desc, origin: `Nivel ${a.level}` });
  }

  const choices: SheetModel["choices"] = [];
  for (const f of features) {
    if (!f.choice) continue;
    const picked = c.choices[f.choice.id] ?? [];
    if (!picked.length) continue;
    choices.push({
      label: f.choice.label,
      values: picked.map((id) => f.choice!.options.find((o) => o.id === id)?.name ?? id),
    });
  }

  const cantrips = c.cantrips.map((id) => SPELL_MAP[id]).filter(Boolean) as Spell[];
  const known = c.spells.map((id) => SPELL_MAP[id]).filter(Boolean) as Spell[];
  const spellsByLevel = Array.from({ length: 9 }, (_, i) => i + 1)
    .map((level) => ({
      level,
      spells: known
        .filter((s) => s.level === level)
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
      prepared: c.preparedSpells,
    }))
    .filter((g) => g.spells.length > 0);

  const resourceDefs = [...resourcesForClass(c.classId), ...resourcesForSubclass(c.subclassId)];
  const resources: ResourceLine[] = resourceDefs
    .map((r) => ({ def: r, value: r.valueAt(c.level) }))
    .filter((r): r is { def: typeof r.def; value: string } => r.value !== null)
    .map(({ def, value }) => ({
      id: def.id,
      label: def.label,
      value,
      ...(def.recovery ? { recovery: def.recovery } : {}),
    }));

  const progression = buildProgression(c, resourceDefs);

  const profSkills = skills.filter((s) => s.proficient || s.expert).map((s) => s.name);

  return {
    character: c,
    identity: {
      name: c.name || "Sin nombre",
      playerName: c.playerName ?? "",
      speciesName: species?.name ?? "—",
      className: klass?.name ?? "—",
      subclassName: sub?.name ?? "",
      backgroundName: bg?.name ?? "—",
      level: c.level,
      alignment: c.alignment ?? "",
      size: species?.size ?? "—",
      subtitle: characterSubtitle(c),
      xp: XP_BY_LEVEL[Math.min(20, c.level)] ?? 0,
    },
    abilities,
    combat: {
      maxHp: maxHp(c),
      currentHp: typeof c.currentHp === "number" ? c.currentHp : null,
      tempHp: typeof c.tempHp === "number" ? c.tempHp : null,
      ac: ac.value,
      acNote: ac.note,
      speed: speed(c),
      hitDice: hitDiceLabel(c),
      initiative: abilityMod(scores.dex),
      profBonus: proficiencyBonus(c.level),
      passivePerception: 10 + bonusOf("perception"),
      passiveInvestigation: 10 + bonusOf("investigation"),
      passiveInsight: 10 + bonusOf("insight"),
    },
    skills,
    proficiencies: {
      armor: klass?.armor ?? [],
      weapons: klass?.weapons ?? [],
      tools: [...(klass?.tools ?? []), ...(bg?.toolProficiency ? [bg.toolProficiency] : [])],
      saves: abilities.filter((a) => a.saveProficient).map((a) => a.name),
      skills: profSkills,
    },
    speciesTraits: species?.traits.filter((t) => t.level <= c.level) ?? [],
    features,
    featuresByLevel,
    feats,
    choices,
    spellcasting: sc,
    cantrips,
    spellsByLevel,
    resources,
    equipment: c.equipment,
    currency: CURRENCY_LABELS.map((x) => ({ label: x.label, value: c.currency[x.key] ?? 0 })),
    progression,
    notes: c.notes,
    appearance: c.appearance,
    manualNotes: c.manualNotes ?? "",
    flags: {
      isCaster: !!sc,
      isPactCaster: casterType(c)?.type === "pact",
      hasSubclass: !!sub,
      hasResources: resources.length > 0,
      hasEquipment: c.equipment.length > 0,
    },
  };
}

/** Progresión 1→20: qué obtiene el personaje en cada nivel (desbloqueado o no) */
function buildProgression(
  c: Character,
  resourceDefs: ReturnType<typeof resourcesForClass>,
): ProgressionRow[] {
  const klass = c.classId ? CLASS_MAP[c.classId] : null;
  const sub = klass?.subclasses.find((s) => s.id === c.subclassId) ?? null;
  const species = c.speciesId ? SPECIES_MAP[c.speciesId] : null;

  return Array.from({ length: 20 }, (_, i) => i + 1).map((level) => {
    const entries: ProgressionEntry[] = [];
    if (species) {
      for (const t of species.traits)
        if (t.level === level)
          entries.push({ name: t.name, source: species.name, kind: "species" });
    }
    if (klass) {
      for (const f of klass.features)
        if (f.level === level) entries.push({ name: f.name, source: klass.name, kind: "class" });
      if (klass.subclassLevel === level) {
        entries.push({
          name: sub ? sub.name : "Elegir subclase",
          source: klass.name,
          kind: "subclass",
        });
      }
      if (klass.asiLevels.includes(level)) {
        const pick = c.asi.find((a) => a.level === level);
        entries.push({
          name: pick
            ? pick.type === "feat"
              ? `Dote: ${pick.featId ? (FEAT_MAP[pick.featId]?.name ?? pick.featId) : "—"}`
              : `Mejora: ${(pick.abilities ?? []).map((k) => ABILITIES.find((a) => a.key === k)?.short ?? k).join(" / ")}`
            : "Mejora de característica o dote",
          source: "Progresión",
          kind: "asi",
        });
      }
    }
    if (sub) {
      for (const f of sub.features)
        if (f.level === level) entries.push({ name: f.name, source: sub.name, kind: "subclass" });
    }

    const at = { ...c, level };
    const { slots, pact } = spellSlots(at);
    const rowResources = resourceDefs
      .map((r) => ({ label: r.label, value: r.valueAt(level) }))
      .filter((r): r is { label: string; value: string } => r.value !== null);

    return {
      level,
      unlocked: level <= c.level,
      current: level === c.level,
      xp: XP_BY_LEVEL[level] ?? 0,
      profBonus: proficiencyBonus(level),
      entries,
      slots,
      ...(pact ? { pact } : {}),
      cantrips: cantripsAllowed(at),
      prepared: spellsAllowed(at),
      asi: klass?.asiLevels.includes(level) ?? false,
      resources: rowResources,
      hitDice: `${level}d${klass?.hitDie ?? 8}`,
    };
  });
}

export { ABILITY_KEYS, SKILL_MAP, expertiseAllowed };
