/**
 * Lógica de subida/bajada de nivel. Reutiliza las reglas de derive.ts y los datos
 * de clase/especie; no introduce reglas nuevas.
 */
import { CLASS_MAP } from "@/data/classes";
import { SPECIES_MAP } from "@/data/species";
import { proficiencyBonus } from "@/data/rules";
import {
  cantripsAllowed,
  casterType,
  classSkillCount,
  expertiseAllowed,
  featuresGainedBetween,
  pendingChoices,
  spellSlots,
  spellsAllowed,
  type SourcedFeature,
} from "@/lib/derive";
import type { Character } from "@/lib/types";

export interface LevelDelta {
  level: number;
  features: SourcedFeature[];
  profBonus: { from: number; to: number };
  slots: { level: number; from: number; to: number }[];
  pact?: { from: string; to: string };
  cantrips: { from: number; to: number };
  spells: { from: number; to: number };
  subclassUnlocked: boolean;
  asi: boolean;
}

/** Lo que cambia exactamente al pasar de c.level a c.level + 1 */
export function levelUpDelta(c: Character): LevelDelta {
  const next = Math.min(20, c.level + 1);
  const after: Character = { ...c, level: next };
  const klass = c.classId ? CLASS_MAP[c.classId] : null;
  const sBefore = spellSlots(c);
  const sAfter = spellSlots(after);
  const slots: LevelDelta["slots"] = [];
  for (let i = 0; i < Math.max(sBefore.slots.length, sAfter.slots.length); i++) {
    const from = sBefore.slots[i] ?? 0;
    const to = sAfter.slots[i] ?? 0;
    if (from !== to) slots.push({ level: i + 1, from, to });
  }
  const pactStr = (p?: { slots: number; level: number }) =>
    p ? `${p.slots} × nivel ${p.level}` : "—";
  const delta: LevelDelta = {
    level: next,
    features: featuresGainedBetween(c, c.level, next),
    profBonus: { from: proficiencyBonus(c.level), to: proficiencyBonus(next) },
    slots,
    cantrips: { from: cantripsAllowed(c), to: cantripsAllowed(after) },
    spells: { from: spellsAllowed(c), to: spellsAllowed(after) },
    subclassUnlocked: !!klass && klass.subclassLevel === next,
    asi: !!klass && klass.asiLevels.includes(next),
  };
  if (pactStr(sBefore.pact) !== pactStr(sAfter.pact)) {
    delta.pact = { from: pactStr(sBefore.pact), to: pactStr(sAfter.pact) };
  }
  return delta;
}

/** Elecciones obligatorias que faltan en el borrador (personaje ya con el nivel nuevo) */
export function missingForLevel(draft: Character): string[] {
  const missing: string[] = [];
  const klass = draft.classId ? CLASS_MAP[draft.classId] : null;
  if (!klass) return ["Clase"];
  if (draft.level >= klass.subclassLevel && !draft.subclassId) missing.push("Subclase");
  if (klass.asiLevels.includes(draft.level)) {
    const a = draft.asi.find((x) => x.level === draft.level);
    const ok = a && (a.type === "feat" ? !!a.featId : (a.abilities?.length ?? 0) === 2);
    if (!ok) missing.push("Mejora de característica o dote");
  }
  for (const p of pendingChoices(draft)) missing.push(p.choice.label);
  if (draft.skillProficiencies.length < classSkillCount(draft)) missing.push("Habilidades");
  if (draft.expertise.length < expertiseAllowed(draft)) missing.push("Pericias");
  if (casterType(draft)) {
    if (draft.cantrips.length < cantripsAllowed(draft)) missing.push("Trucos");
    if (draft.spells.length < spellsAllowed(draft)) missing.push("Conjuros");
  }
  return missing;
}

/** Nivel en el que se obtiene cada elección de rasgo (choiceId -> nivel) */
export function choiceLevels(c: Character): Record<string, number> {
  const out: Record<string, number> = {};
  const sp = c.speciesId ? SPECIES_MAP[c.speciesId] : null;
  const klass = c.classId ? CLASS_MAP[c.classId] : null;
  const feats = [
    ...(sp?.traits ?? []),
    ...(klass?.features ?? []),
    ...(klass?.subclasses.flatMap((s) => s.features) ?? []),
  ];
  for (const f of feats) if (f.choice) out[f.choice.id] = f.level;
  return out;
}

/** Aplica la subida si no faltan elecciones; si faltan, devuelve null y no cambia nada */
export function applyLevelUp(draft: Character, original: Character): Character | null {
  if (draft.level !== original.level + 1 || draft.level > 20) return null;
  if (missingForLevel(draft).length) return null;
  return {
    ...draft,
    levelLog: [...original.levelLog, { level: draft.level, date: new Date().toISOString() }],
  };
}

/** Deja al personaje coherente con un nivel inferior, eliminando lo ganado después */
export function pruneToLevel(c: Character, level: number): Character {
  const target = Math.max(1, Math.min(c.level, level));
  const klass = c.classId ? CLASS_MAP[c.classId] : null;
  const lv = choiceLevels(c);
  const hpRolls = Object.fromEntries(
    Object.entries(c.hpRolls).filter(([k]) => Number(k) <= target),
  );
  let next: Character = {
    ...c,
    level: target,
    hpRolls,
    asi: c.asi.filter((a) => a.level <= target),
    levelLog: c.levelLog.filter((l) => l.level <= target),
    choices: Object.fromEntries(Object.entries(c.choices).filter(([k]) => (lv[k] ?? 1) <= target)),
  };
  if (klass && target < klass.subclassLevel) next = { ...next, subclassId: null };
  const cap = <T>(arr: T[], n: number) => (arr.length > n ? arr.slice(0, n) : arr);
  next = {
    ...next,
    skillProficiencies: cap(next.skillProficiencies, classSkillCount(next)),
    expertise: cap(next.expertise, expertiseAllowed(next)),
    cantrips: cap(next.cantrips, cantripsAllowed(next)),
  };
  const spells = cap(next.spells, spellsAllowed(next));
  return { ...next, spells, preparedSpells: next.preparedSpells.filter((s) => spells.includes(s)) };
}
