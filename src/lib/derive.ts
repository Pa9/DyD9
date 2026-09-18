import { BACKGROUND_MAP } from "@/data/backgrounds";
import { CLASS_MAP } from "@/data/classes";
import { SPECIES_MAP } from "@/data/species";
import { FEAT_MAP } from "@/data/feats";
import { SPELL_MAP } from "@/data/spells";
import {
  FULL_CASTER_SLOTS,
  HALF_CASTER_SLOTS,
  PACT_MAGIC,
  SKILL_MAP,
  THIRD_CASTER_SLOTS,
  proficiencyBonus,
} from "@/data/rules";
import type { AbilityKey, Character, Feature, FeatureChoice } from "./types";

export const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

/** Puntuaciones finales: base + trasfondo + mejoras por nivel (ASI) */
export function finalAbilities(c: Character): Record<AbilityKey, number> {
  const out = { ...c.abilities };
  for (const k of ABILITY_KEYS) {
    out[k] = (out[k] ?? 10) + (c.backgroundAbilities[k] ?? 0);
  }
  for (const choice of c.asi) {
    if (choice.level > c.level) continue;
    if (choice.type === "asi" && choice.abilities) {
      for (const k of choice.abilities) out[k] = Math.min(20, out[k] + 1);
    }
  }
  return out;
}

export interface SourcedFeature extends Feature {
  source: string;
  sourceKind: "species" | "class" | "subclass" | "background" | "feat";
}

/** Todas las características desbloqueadas hasta el nivel actual */
export function featuresFor(c: Character): SourcedFeature[] {
  const out: SourcedFeature[] = [];
  const species = c.speciesId ? SPECIES_MAP[c.speciesId] : null;
  const klass = c.classId ? CLASS_MAP[c.classId] : null;
  const sub = klass?.subclasses.find((s) => s.id === c.subclassId);
  const bg = c.backgroundId ? BACKGROUND_MAP[c.backgroundId] : null;

  if (species) {
    for (const t of species.traits) {
      if (t.level <= c.level) out.push({ ...t, source: species.name, sourceKind: "species" });
    }
  }
  if (klass) {
    for (const f of klass.features) {
      if (f.level <= c.level) out.push({ ...f, source: klass.name, sourceKind: "class" });
    }
  }
  if (sub) {
    for (const f of sub.features) {
      if (f.level <= c.level) out.push({ ...f, source: sub.name, sourceKind: "subclass" });
    }
  }
  if (bg) {
    const feat = FEAT_MAP[bg.featId];
    if (feat) {
      out.push({
        level: 1,
        name: `Dote de origen: ${feat.name}`,
        desc: feat.desc,
        source: bg.name,
        sourceKind: "background",
      });
    }
  }
  for (const a of c.asi) {
    if (a.level > c.level) continue;
    if (a.type === "feat" && a.featId && FEAT_MAP[a.featId]) {
      const feat = FEAT_MAP[a.featId]!;
      out.push({
        level: a.level,
        name: `Dote: ${feat.name}`,
        desc: feat.desc,
        source: `Nivel ${a.level}`,
        sourceKind: "feat",
      });
    }
  }
  return out.sort((a, b) => a.level - b.level);
}

/** Características nuevas al pasar de fromLevel a toLevel */
export function featuresGainedBetween(c: Character, fromLevel: number, toLevel: number) {
  const all = featuresFor({ ...c, level: toLevel });
  return all.filter((f) => f.level > fromLevel && f.level <= toLevel);
}

/** Elecciones pendientes en el nivel actual */
export function pendingChoices(c: Character): { feature: SourcedFeature; choice: FeatureChoice }[] {
  return featuresFor(c)
    .filter((f) => f.choice)
    .map((f) => ({ feature: f, choice: f.choice! }))
    .filter(({ choice }) => (c.choices[choice.id]?.length ?? 0) < choice.count);
}

export function casterType(c: Character) {
  const klass = c.classId ? CLASS_MAP[c.classId] : null;
  if (!klass) return null;
  const sub = klass.subclasses.find((s) => s.id === c.subclassId);
  if (sub?.caster) return { type: sub.caster, ability: sub.spellAbility ?? klass.spellAbility ?? "int" };
  if (klass.caster) return { type: klass.caster, ability: klass.spellAbility ?? "int" };
  return null;
}

export function spellSlots(c: Character): { slots: number[]; pact?: { slots: number; level: number } } {
  const ct = casterType(c);
  if (!ct) return { slots: [] };
  const lvl = Math.min(20, Math.max(1, c.level));
  if (ct.type === "pact") return { slots: [], pact: PACT_MAGIC[lvl]! };
  const table =
    ct.type === "full" ? FULL_CASTER_SLOTS : ct.type === "half" ? HALF_CASTER_SLOTS : THIRD_CASTER_SLOTS;
  return { slots: table[lvl] ?? [] };
}

export function maxSpellLevel(c: Character): number {
  const { slots, pact } = spellSlots(c);
  if (pact) return pact.level;
  return slots.length;
}

export function cantripsAllowed(c: Character): number {
  const klass = c.classId ? CLASS_MAP[c.classId] : null;
  const ct = casterType(c);
  if (!ct) return 0;
  if (ct.type === "third") return c.level >= 3 ? (c.level >= 10 ? 3 : 2) : 0;
  return klass?.cantripsKnown?.[Math.min(20, c.level)] ?? 0;
}

export function spellsAllowed(c: Character): number {
  const klass = c.classId ? CLASS_MAP[c.classId] : null;
  const ct = casterType(c);
  if (!ct) return 0;
  if (ct.type === "third") {
    const table = [0, 0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];
    return table[Math.min(20, c.level)] ?? 0;
  }
  return klass?.spellsPrepared?.[Math.min(20, c.level)] ?? 0;
}

export function hitDie(c: Character): number {
  return c.classId ? (CLASS_MAP[c.classId]?.hitDie ?? 8) : 8;
}

export function hitDiceLabel(c: Character): string {
  return c.manualHitDice && c.manualHitDice.trim() !== ""
    ? c.manualHitDice
    : `${c.level}d${hitDie(c)}`;
}

export function maxHp(c: Character): number {
  if (typeof c.manualMaxHp === "number" && c.manualMaxHp > 0) return c.manualMaxHp;
  const die = hitDie(c);
  const abilities = finalAbilities(c);
  const conMod = abilityMod(abilities.con);
  let hp = die + conMod;
  const avg = Math.floor(die / 2) + 1;
  for (let lvl = 2; lvl <= c.level; lvl++) {
    const roll = c.hpMode === "manual" ? c.hpRolls[String(lvl)] : undefined;
    hp += (roll ?? avg) + conMod;
  }
  if (c.speciesId === "dwarf") hp += c.level;
  if (c.asi.some((a) => a.type === "feat" && a.featId === "tough" && a.level <= c.level)) {
    hp += c.level * 2;
  }
  if (c.backgroundId && BACKGROUND_MAP[c.backgroundId]?.featId === "tough") hp += c.level * 2;
  if (c.choices["human-resourceful"]?.includes("tough")) hp += c.level * 2;
  return Math.max(1, hp);
}

export function armorClass(c: Character): { value: number; note: string } {
  const ab = finalAbilities(c);
  const dex = abilityMod(ab.dex);
  const names = c.equipment.map((e) => e.name.toLowerCase());
  const hasShield = names.some((n) => n.includes("escudo"));
  const shield = hasShield ? 2 : 0;
  if (names.some((n) => n.includes("cota de malla"))) return { value: 16 + shield, note: "Cota de malla" };
  if (names.some((n) => n.includes("cota de escamas")))
    return { value: 14 + Math.min(2, dex) + shield, note: "Cota de escamas" };
  if (names.some((n) => n.includes("cuero tachonado")))
    return { value: 12 + dex + shield, note: "Cuero tachonado" };
  if (names.some((n) => n.includes("armadura de cuero")))
    return { value: 11 + dex + shield, note: "Armadura de cuero" };
  if (c.classId === "monk") return { value: 10 + dex + abilityMod(ab.wis), note: "Defensa sin armadura" };
  if (c.classId === "barbarian")
    return { value: 10 + dex + abilityMod(ab.con), note: "Defensa sin armadura" };
  return { value: 10 + dex + shield, note: "Sin armadura" };
}

export function speed(c: Character): number {
  const base = c.speciesId ? (SPECIES_MAP[c.speciesId]?.speed ?? 30) : 30;
  let bonus = 0;
  if (c.classId === "monk" && c.level >= 2) bonus += c.level >= 16 ? 30 : c.level >= 10 ? 20 : 10;
  if (c.classId === "barbarian" && c.level >= 5) bonus += 10;
  if (c.classId === "paladin" && c.level >= 5) bonus += 10;
  if (c.choices["elf-lineage"]?.includes("wood-elf")) bonus += 5;
  return base + bonus;
}

export function allSkillProficiencies(c: Character): { expertise: string[]; proficient: string[] } {
  const bg = c.backgroundId ? BACKGROUND_MAP[c.backgroundId] : null;
  const set = new Set<string>(c.skillProficiencies);
  if (bg) bg.skills.forEach((s) => set.add(s));
  if (c.speciesId === "elf") set.add("perception");
  const expertise = c.expertise.filter((e) => set.has(e));
  return { proficient: [...set], expertise };
}

export interface SkillLine {
  id: string;
  name: string;
  ability: AbilityKey;
  proficient: boolean;
  expert: boolean;
  bonus: number;
}

export function skillLines(c: Character): SkillLine[] {
  const ab = finalAbilities(c);
  const pb = proficiencyBonus(c.level);
  const { proficient, expertise } = allSkillProficiencies(c);
  return Object.values(SKILL_MAP).map((s) => {
    const isProf = proficient.includes(s.id);
    const isExp = expertise.includes(s.id);
    return {
      id: s.id,
      name: s.name,
      ability: s.ability,
      proficient: isProf,
      expert: isExp,
      bonus: abilityMod(ab[s.ability]) + (isExp ? pb * 2 : isProf ? pb : 0),
    };
  });
}

export function saveBonuses(c: Character): Record<AbilityKey, { bonus: number; proficient: boolean }> {
  const ab = finalAbilities(c);
  const pb = proficiencyBonus(c.level);
  const klass = c.classId ? CLASS_MAP[c.classId] : null;
  const out = {} as Record<AbilityKey, { bonus: number; proficient: boolean }>;
  for (const k of ABILITY_KEYS) {
    const prof = klass?.saves.includes(k) ?? false;
    out[k] = { bonus: abilityMod(ab[k]) + (prof ? pb : 0), proficient: prof };
  }
  return out;
}

export function spellcastingStats(c: Character) {
  const ct = casterType(c);
  if (!ct) return null;
  const ab = finalAbilities(c);
  const pb = proficiencyBonus(c.level);
  const mod = abilityMod(ab[ct.ability as AbilityKey]);
  return {
    ability: ct.ability as AbilityKey,
    type: ct.type,
    dc: 8 + pb + mod,
    attack: pb + mod,
    ...spellSlots(c),
    cantripsAllowed: cantripsAllowed(c),
    spellsAllowed: spellsAllowed(c),
    maxSpellLevel: maxSpellLevel(c),
  };
}

/** Número de habilidades que la clase permite elegir */
export function classSkillCount(c: Character): number {
  const klass = c.classId ? CLASS_MAP[c.classId] : null;
  if (!klass) return 0;
  let n = klass.skillCount;
  if (c.classId === "barbarian" && c.level >= 3) n += 1;
  if (c.speciesId === "human") n += 1;
  return n;
}

/** Pericias permitidas (pícaro, bardo, explorador) */
export function expertiseAllowed(c: Character): number {
  if (c.classId === "rogue") return c.level >= 6 ? 4 : 2;
  if (c.classId === "bard") return c.level >= 9 ? 4 : c.level >= 3 ? 2 : 0;
  if (c.classId === "ranger") return c.level >= 6 ? 2 : 1;
  return 0;
}

/** Niveles de ASI/dote disponibles hasta el nivel actual */
export function asiLevelsAvailable(c: Character): number[] {
  const klass = c.classId ? CLASS_MAP[c.classId] : null;
  if (!klass) return [];
  return klass.asiLevels.filter((l) => l <= c.level);
}

export function knownSpellObjects(c: Character) {
  return {
    cantrips: c.cantrips.map((id) => SPELL_MAP[id]).filter(Boolean),
    spells: c.spells.map((id) => SPELL_MAP[id]).filter(Boolean),
  };
}

/** Resumen textual de la clase/nivel */
export function characterSubtitle(c: Character): string {
  const parts: string[] = [];
  const sp = c.speciesId ? SPECIES_MAP[c.speciesId]?.name : null;
  const kl = c.classId ? CLASS_MAP[c.classId]?.name : null;
  const sub = c.classId
    ? CLASS_MAP[c.classId]?.subclasses.find((s) => s.id === c.subclassId)?.name
    : null;
  if (sp) parts.push(sp);
  if (kl) parts.push(sub ? `${kl} (${sub})` : kl);
  parts.push(`Nivel ${c.level}`);
  return parts.join(" · ");
}

/** Validación de completitud para la ficha */
export function completeness(c: Character): { done: number; total: number; missing: string[] } {
  const missing: string[] = [];
  if (!c.name.trim()) missing.push("Nombre");
  if (!c.speciesId) missing.push("Especie");
  if (!c.classId) missing.push("Clase");
  if (!c.backgroundId) missing.push("Trasfondo");
  const bgPoints = Object.values(c.backgroundAbilities).reduce((a, b) => a + (b ?? 0), 0);
  if (bgPoints !== 3) missing.push("Mejoras de trasfondo");
  if (c.skillProficiencies.length < classSkillCount(c)) missing.push("Habilidades de clase");
  if (c.level >= 3 && c.classId && !c.subclassId) missing.push("Subclase");
  const ct = casterType(c);
  if (ct) {
    if (c.cantrips.length < cantripsAllowed(c)) missing.push("Trucos");
    if (c.spells.length < spellsAllowed(c)) missing.push("Conjuros");
  }
  if (asiLevelsAvailable(c).some((l) => !c.asi.find((a) => a.level === l)))
    missing.push("Mejoras de característica");
  if (pendingChoices(c).length) missing.push("Elecciones de rasgos");
  const total = 9;
  return { done: Math.max(0, total - missing.length), total, missing };
}
