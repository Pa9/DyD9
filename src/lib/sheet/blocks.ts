/**
 * Capa de PRESENTACIÓN NEUTRA de la ficha.
 * Convierte el SheetModel en bloques genéricos que consumen, sin saber nada
 * unos de otros: la vista en pantalla, el PDF y el Excel.
 * Cambiar el diseño visual = cambiar sólo el renderizador, no estos bloques.
 */
import { fmtMod } from "@/lib/derive";
import { ABILITIES } from "@/data/rules";
import type { SheetModel } from "./model";

export interface StatsBlock {
  kind: "stats";
  id: string;
  title: string;
  items: { label: string; value: string; hint?: string }[];
}
export interface PairsBlock {
  kind: "pairs";
  id: string;
  title: string;
  items: { label: string; value: string }[];
}
export interface TableBlock {
  kind: "table";
  id: string;
  title: string;
  columns: string[];
  rows: string[][];
}
export interface ListBlock {
  kind: "list";
  id: string;
  title: string;
  items: { name: string; meta?: string; desc?: string }[];
}
export interface TextBlock {
  kind: "text";
  id: string;
  title: string;
  text: string;
}

export type SheetBlock = StatsBlock | PairsBlock | TableBlock | ListBlock | TextBlock;

export interface SheetDoc {
  title: string;
  subtitle: string;
  blocks: SheetBlock[];
}

const yesNo = (v: boolean) => (v ? "Sí" : "No");
const join = (arr: string[]) => (arr.length ? arr.join(", ") : "—");

/** Construye el documento de la ficha (independiente del formato de salida). */
export function buildSheetDoc(m: SheetModel): SheetDoc {
  const blocks: SheetBlock[] = [];

  blocks.push({
    kind: "pairs",
    id: "identidad",
    title: "Identidad",
    items: [
      { label: "Nombre del personaje", value: m.identity.name },
      { label: "Jugador", value: m.identity.playerName || "—" },
      { label: "Especie", value: m.identity.speciesName },
      { label: "Clase", value: m.identity.className },
      { label: "Subclase", value: m.identity.subclassName || "—" },
      { label: "Trasfondo", value: m.identity.backgroundName },
      { label: "Nivel", value: String(m.identity.level) },
      { label: "PX (puntos de experiencia)", value: String(m.identity.xp) },
      { label: "Alineamiento", value: m.identity.alignment || "—" },
      { label: "Tamaño", value: m.identity.size },
    ],
  });

  blocks.push({
    kind: "stats",
    id: "combate",
    title: "Combate",
    items: [
      { label: "PG (puntos de golpe) máx.", value: String(m.combat.maxHp) },
      { label: "PG actuales", value: m.combat.currentHp === null ? "—" : String(m.combat.currentHp) },
      { label: "PG temporales", value: m.combat.tempHp === null ? "—" : String(m.combat.tempHp) },
      { label: "CA (clase de armadura)", value: String(m.combat.ac), ...(m.combat.acNote ? { hint: m.combat.acNote } : {}) },
      { label: "Iniciativa", value: fmtMod(m.combat.initiative) },
      { label: "Velocidad", value: `${m.combat.speed} pies` },
      { label: "Dados de golpe", value: m.combat.hitDice },
      { label: "Competencia", value: fmtMod(m.combat.profBonus) },
      { label: "Percepción pasiva", value: String(m.combat.passivePerception) },
      { label: "Investigación pasiva", value: String(m.combat.passiveInvestigation) },
      { label: "Perspicacia pasiva", value: String(m.combat.passiveInsight) },
    ],
  });

  blocks.push({
    kind: "table",
    id: "caracteristicas",
    title: "Características y salvaciones",
    columns: ["Característica", "Valor", "Mod.", "Salvación", "Competente"],
    rows: m.abilities.map((a) => [
      a.name,
      String(a.score),
      fmtMod(a.mod),
      fmtMod(a.save),
      yesNo(a.saveProficient),
    ]),
  });

  blocks.push({
    kind: "table",
    id: "habilidades",
    title: "Habilidades",
    columns: ["Habilidad", "Característica", "Bonificador", "Competente", "Pericia"],
    rows: m.skills.map((s) => [
      s.name,
      ABILITIES.find((a) => a.key === s.ability)?.short ?? "",
      fmtMod(s.bonus),
      yesNo(s.proficient),
      yesNo(s.expert),
    ]),
  });

  blocks.push({
    kind: "pairs",
    id: "competencias",
    title: "Competencias",
    items: [
      { label: "Armaduras", value: join(m.proficiencies.armor) },
      { label: "Armas", value: join(m.proficiencies.weapons) },
      { label: "Herramientas", value: join(m.proficiencies.tools) },
      { label: "Salvaciones", value: join(m.proficiencies.saves) },
      { label: "Habilidades", value: join(m.proficiencies.skills) },
    ],
  });

  if (m.speciesTraits.length) {
    blocks.push({
      kind: "list",
      id: "rasgos-especie",
      title: `Rasgos de especie (${m.identity.speciesName})`,
      items: m.speciesTraits.map((t) => ({ name: t.name, meta: `Nivel ${t.level}`, desc: t.desc })),
    });
  }

  if (m.features.length) {
    blocks.push({
      kind: "list",
      id: "rasgos",
      title: "Rasgos de clase y subclase",
      items: m.features.map((f) => ({ name: f.name, meta: `Nivel ${f.level} · ${f.source}`, desc: f.desc })),
    });
  }

  if (m.feats.length) {
    blocks.push({
      kind: "list",
      id: "dotes",
      title: "Dotes",
      items: m.feats.map((f) => ({ name: f.name, meta: f.origin, desc: f.desc })),
    });
  }

  if (m.choices.length) {
    blocks.push({
      kind: "pairs",
      id: "elecciones",
      title: "Elecciones",
      items: m.choices.map((c) => ({ label: c.label, value: join(c.values) })),
    });
  }

  if (m.spellcasting) {
    const sc = m.spellcasting;
    blocks.push({
      kind: "stats",
      id: "magia",
      title: "Lanzamiento de conjuros",
      items: [
        { label: "Característica", value: ABILITIES.find((a) => a.key === sc.ability)?.name ?? "—" },
        { label: "CD de salvación", value: String(sc.dc) },
        { label: "Ataque de conjuro", value: fmtMod(sc.attack) },
        { label: "Nivel máx.", value: String(sc.maxSpellLevel) },
        {
          label: "Espacios",
          value: sc.pact
            ? `${sc.pact.slots} × nivel ${sc.pact.level}`
            : sc.slots.filter((n) => n > 0).join(" / ") || "—",
        },
      ],
    });

    if (m.cantrips.length) {
      blocks.push({
        kind: "list",
        id: "trucos",
        title: "Trucos",
        items: m.cantrips.map((s) => ({
          name: s.name,
          meta: `${s.school} · ${s.castingTime} · ${s.range}`,
          desc: s.desc,
        })),
      });
    }

    for (const group of m.spellsByLevel) {
      blocks.push({
        kind: "list",
        id: `conjuros-${group.level}`,
        title: `Conjuros de nivel ${group.level}`,
        items: group.spells.map((s) => ({
          name: `${s.name}${group.prepared.includes(s.id) ? " (preparado)" : ""}`,
          meta: [s.school, s.castingTime, s.range, s.duration, s.concentration ? "Concentración" : "", s.ritual ? "Ritual" : ""]
            .filter(Boolean)
            .join(" · "),
          desc: s.upcast ? `${s.desc}\nA niveles superiores: ${s.upcast}` : s.desc,
        })),
      });
    }
  }

  if (m.resources.length) {
    blocks.push({
      kind: "table",
      id: "recursos",
      title: "Recursos de clase",
      columns: ["Recurso", "Valor", "Recuperación"],
      rows: m.resources.map((r) => [
        r.label,
        r.value,
        r.recovery === "short" ? "Descanso corto" : r.recovery === "long" ? "Descanso largo" : "—",
      ]),
    });
  }

  blocks.push({
    kind: "table",
    id: "equipo",
    title: "Equipo",
    columns: ["Objeto", "Cantidad", "Notas"],
    rows: m.equipment.length
      ? m.equipment.map((e) => [e.name, String(e.qty), e.notes ?? ""])
      : [["—", "—", ""]],
  });

  blocks.push({
    kind: "pairs",
    id: "monedas",
    title: "Monedas",
    items: m.currency.map((c) => ({ label: c.label, value: String(c.value) })),
  });

  blocks.push({
    kind: "table",
    id: "progresion",
    title: "Progresión 1 → 20",
    columns: ["Nivel", "PX", "Comp.", "Obtiene", "Trucos", "Preparados", "Espacios"],
    rows: m.progression.map((r) => [
      `${r.level}${r.current ? " ←" : ""}`,
      String(r.xp),
      fmtMod(r.profBonus),
      r.entries.map((e) => e.name).join("; ") || "—",
      r.cantrips ? String(r.cantrips) : "—",
      r.prepared ? String(r.prepared) : "—",
      r.pact
        ? `${r.pact.slots} × niv. ${r.pact.level}`
        : r.slots.filter((n) => n > 0).join("/") || "—",
    ]),
  });

  if (m.appearance) blocks.push({ kind: "text", id: "apariencia", title: "Apariencia", text: m.appearance });
  if (m.notes) blocks.push({ kind: "text", id: "notas", title: "Notas e historia", text: m.notes });
  if (m.manualNotes)
    blocks.push({ kind: "text", id: "casa", title: "Reglas de la casa", text: m.manualNotes });

  return { title: m.identity.name, subtitle: m.identity.subtitle, blocks };
}
