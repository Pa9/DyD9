import { useMemo, type ReactNode } from "react";
import { Check, Info, Minus, Plus, Sparkles, Trash2 } from "lucide-react";

import { BACKGROUNDS, BACKGROUND_MAP } from "@/data/backgrounds";
import { CLASSES, CLASS_MAP } from "@/data/classes";
import { SPECIES, SPECIES_MAP } from "@/data/species";
import { FEATS } from "@/data/feats";
import { spellsForClass } from "@/data/spells";
import { ABILITIES, SKILL_MAP, STANDARD_ARRAY, proficiencyBonus } from "@/data/rules";
import {
  ABILITY_KEYS,
  abilityMod,
  allSkillProficiencies,
  asiLevelsAvailable,
  cantripsAllowed,
  casterType,
  classSkillCount,
  expertiseAllowed,
  featuresFor,
  finalAbilities,
  fmtMod,
  maxSpellLevel,
  spellsAllowed,
} from "@/lib/derive";
import type { AbilityKey, Character } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type Patch = Partial<Character> | ((c: Character) => Partial<Character>);
export interface SectionProps {
  character: Character;
  update: (patch: Patch) => void;
}

export function Section({
  title,
  hint,
  children,
  action,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="panel p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-lg">{title}</h2>
          {hint ? <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p> : null}
        </div>
        {action}
      </div>
      <div className="gold-rule mb-4" />
      {children}
    </section>
  );
}

export function OptionCard({
  selected,
  onSelect,
  title,
  subtitle,
  meta,
  disabled,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle?: string;
  meta?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-all",
        selected
          ? "border-primary bg-secondary shadow-gold"
          : "border-border bg-card/60 hover:border-primary/50 hover:bg-secondary/60",
        disabled && "cursor-not-allowed opacity-45",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-display text-sm leading-tight">{title}</span>
        {selected ? <Check className="mt-0.5 size-4 shrink-0 text-primary" /> : null}
      </div>
      {subtitle ? (
        <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
      ) : null}
      {meta ? <p className="mt-1.5 text-[11px] uppercase tracking-wide text-primary/80">{meta}</p> : null}
    </button>
  );
}

/* ------------------------------- Identidad ------------------------------- */

export function IdentitySection({ character, update }: SectionProps) {
  return (
    <Section title="Identidad" hint="Datos básicos de tu personaje.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre del personaje</Label>
          <Input
            id="name"
            value={character.name}
            placeholder="p. ej. Marduk el Errante"
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="player">Jugador</Label>
          <Input
            id="player"
            value={character.playerName ?? ""}
            onChange={(e) => update({ playerName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="alignment">Alineamiento</Label>
          <Input
            id="alignment"
            value={character.alignment ?? ""}
            placeholder="Neutral bueno"
            onChange={(e) => update({ alignment: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="appearance">Apariencia</Label>
          <Input
            id="appearance"
            value={character.appearance}
            placeholder="Alto, cicatriz en la ceja..."
            onChange={(e) => update({ appearance: e.target.value })}
          />
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------- Especie -------------------------------- */

export function SpeciesSection({ character, update }: SectionProps) {
  const species = character.speciesId ? SPECIES_MAP[character.speciesId] : null;
  return (
    <Section title="Especie" hint="Determina rasgos, velocidad y capacidades innatas.">
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {SPECIES.map((s) => (
          <OptionCard
            key={s.id}
            title={s.name}
            subtitle={s.desc}
            meta={`${s.size} · ${s.speed} pies`}
            selected={character.speciesId === s.id}
            onSelect={() =>
              update((c) => ({
                speciesId: s.id,
                choices: pruneChoices(c.choices, s.id, c.classId),
              }))
            }
          />
        ))}
      </div>
      {species ? (
        <div className="mt-4 space-y-2">
          <p className="heading-rune">Rasgos de {species.name}</p>
          {species.traits.map((t) => (
            <div key={t.name} className="stat-block p-3">
              <p className="text-sm font-medium">
                {t.name}{" "}
                {t.level > 1 ? (
                  <Badge variant="outline" className="ml-1 text-[10px]">
                    Nivel {t.level}
                  </Badge>
                ) : null}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      ) : null}
    </Section>
  );
}

function pruneChoices(
  choices: Record<string, string[]>,
  speciesId: string | null,
  classId: string | null,
) {
  const validIds = new Set<string>();
  if (speciesId) {
    SPECIES_MAP[speciesId]?.traits.forEach((t) => t.choice && validIds.add(t.choice.id));
  }
  if (classId) {
    CLASS_MAP[classId]?.features.forEach((f) => f.choice && validIds.add(f.choice.id));
    CLASS_MAP[classId]?.subclasses.forEach((s) =>
      s.features.forEach((f) => f.choice && validIds.add(f.choice.id)),
    );
  }
  return Object.fromEntries(Object.entries(choices).filter(([k]) => validIds.has(k)));
}

/* --------------------------------- Clase --------------------------------- */

export function ClassSection({ character, update }: SectionProps) {
  const klass = character.classId ? CLASS_MAP[character.classId] : null;
  const subclassUnlocked = klass ? character.level >= klass.subclassLevel : false;
  return (
    <Section title="Clase" hint="Define tus dados de golpe, competencias y progresión.">
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {CLASSES.map((k) => (
          <OptionCard
            key={k.id}
            title={k.name}
            subtitle={k.desc}
            meta={`d${k.hitDie} · ${k.primary.map((p) => ABILITIES.find((a) => a.key === p)?.short).join("/")}`}
            selected={character.classId === k.id}
            onSelect={() =>
              update((c) => ({
                classId: k.id,
                subclassId: null,
                skillProficiencies: [],
                expertise: [],
                cantrips: [],
                spells: [],
                preparedSpells: [],
                choices: pruneChoices(c.choices, c.speciesId, k.id),
              }))
            }
          />
        ))}
      </div>

      {klass ? (
        <div className="mt-5">
          <p className="heading-rune mb-2">
            Subclase {subclassUnlocked ? "" : `(se desbloquea en nivel ${klass.subclassLevel})`}
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {klass.subclasses.map((s) => (
              <OptionCard
                key={s.id}
                title={s.name}
                subtitle={s.desc}
                disabled={!subclassUnlocked}
                selected={character.subclassId === s.id}
                onSelect={() => update({ subclassId: s.id, cantrips: [], spells: [] })}
              />
            ))}
          </div>
          <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <p>
              <span className="text-foreground">Salvaciones:</span>{" "}
              {klass.saves.map((s) => ABILITIES.find((a) => a.key === s)?.name).join(", ")}
            </p>
            <p>
              <span className="text-foreground">Armaduras:</span> {klass.armor.join(", ") || "Ninguna"}
            </p>
            <p>
              <span className="text-foreground">Armas:</span> {klass.weapons.join(", ")}
            </p>
            <p>
              <span className="text-foreground">Herramientas:</span>{" "}
              {klass.tools.join(", ") || "Ninguna"}
            </p>
          </div>
        </div>
      ) : null}
    </Section>
  );
}

/* ------------------------------- Trasfondo ------------------------------- */

export function BackgroundSection({ character, update }: SectionProps) {
  const bg = character.backgroundId ? BACKGROUND_MAP[character.backgroundId] : null;
  const total = Object.values(character.backgroundAbilities).reduce((a, b) => a + (b ?? 0), 0);

  const setSpread = (spread: "2-1" | "1-1-1", keys: AbilityKey[]) => {
    if (spread === "1-1-1") {
      update({
        backgroundAbilities: Object.fromEntries(keys.map((k) => [k, 1])) as Partial<
          Record<AbilityKey, number>
        >,
      });
    } else {
      const [first, second] = keys;
      if (!first || !second) return;
      update({ backgroundAbilities: { [first]: 2, [second]: 1 } });
    }
  };

  return (
    <Section title="Trasfondo" hint="Otorga habilidades, una dote de origen y mejoras de característica.">
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {BACKGROUNDS.map((b) => (
          <OptionCard
            key={b.id}
            title={b.name}
            subtitle={b.desc}
            meta={b.skills.map((s) => SKILL_MAP[s]?.name).join(" · ")}
            selected={character.backgroundId === b.id}
            onSelect={() => update({ backgroundId: b.id, backgroundAbilities: {} })}
          />
        ))}
      </div>

      {bg ? (
        <div className="mt-5 space-y-3">
          <p className="heading-rune">
            Mejoras de característica del trasfondo (elige +2/+1 o +1/+1/+1) — asignados {total}/3
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSpread("1-1-1", bg.abilityOptions)}
            >
              +1 a las tres
            </Button>
            {bg.abilityOptions.map((primary) =>
              bg.abilityOptions
                .filter((k) => k !== primary)
                .map((secondary) => (
                  <Button
                    key={`${primary}-${secondary}`}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSpread("2-1", [primary, secondary])}
                  >
                    +2 {ABILITIES.find((a) => a.key === primary)?.short} / +1{" "}
                    {ABILITIES.find((a) => a.key === secondary)?.short}
                  </Button>
                )),
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {bg.abilityOptions.map((k) => (
              <Badge key={k} variant={character.backgroundAbilities[k] ? "default" : "outline"}>
                {ABILITIES.find((a) => a.key === k)?.name} +{character.backgroundAbilities[k] ?? 0}
              </Badge>
            ))}
          </div>
          <div className="stat-block p-3 text-xs text-muted-foreground">
            <p>
              <span className="text-foreground">Competencias:</span>{" "}
              {bg.skills.map((s) => SKILL_MAP[s]?.name).join(", ")} · {bg.toolProficiency}
            </p>
            <p className="mt-1">
              <span className="text-foreground">Equipo:</span>{" "}
              {bg.equipment.map((e) => `${e.name}${e.qty > 1 ? ` ×${e.qty}` : ""}`).join(", ")}
            </p>
          </div>
        </div>
      ) : null}
    </Section>
  );
}

/* ----------------------------- Características ---------------------------- */

export function AbilitiesSection({ character, update }: SectionProps) {
  const final = finalAbilities(character);
  const applyArray = () => {
    const klass = character.classId ? CLASS_MAP[character.classId] : null;
    const order: AbilityKey[] = klass
      ? [...klass.primary, ...klass.saves, ...ABILITY_KEYS].filter(
          (v, i, arr) => arr.indexOf(v) === i,
        )
      : ABILITY_KEYS;
    const next = { ...character.abilities };
    order.forEach((k, i) => {
      next[k] = STANDARD_ARRAY[i] ?? 10;
    });
    update({ abilities: next });
  };

  return (
    <Section
      title="Características"
      hint="Puntuaciones base + mejoras de trasfondo + mejoras por nivel."
      action={
        <Button type="button" variant="outline" size="sm" onClick={applyArray}>
          <Sparkles className="mr-1.5 size-3.5" /> Array estándar
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ABILITIES.map((a) => {
          const base = character.abilities[a.key];
          const bonus = final[a.key] - base;
          return (
            <div key={a.key} className="stat-block p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-sm">{a.name}</p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {a.short}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-primary">{final[a.key]}</p>
                  <p className="text-xs text-muted-foreground">{fmtMod(abilityMod(final[a.key]))}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-7"
                  onClick={() =>
                    update((c) => ({
                      abilities: { ...c.abilities, [a.key]: Math.max(3, c.abilities[a.key] - 1) },
                    }))
                  }
                >
                  <Minus className="size-3" />
                </Button>
                <Input
                  className="h-8 text-center"
                  inputMode="numeric"
                  value={base}
                  onChange={(e) => {
                    const v = Number(e.target.value.replace(/\D/g, "")) || 0;
                    update((c) => ({
                      abilities: { ...c.abilities, [a.key]: Math.min(20, Math.max(3, v)) },
                    }));
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-7"
                  onClick={() =>
                    update((c) => ({
                      abilities: { ...c.abilities, [a.key]: Math.min(20, c.abilities[a.key] + 1) },
                    }))
                  }
                >
                  <Plus className="size-3" />
                </Button>
                {bonus ? (
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    +{bonus} extra
                  </Badge>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* -------------------------------- Habilidades ----------------------------- */

export function SkillsSection({ character, update }: SectionProps) {
  const klass = character.classId ? CLASS_MAP[character.classId] : null;
  const allowed = classSkillCount(character);
  const chosen = character.skillProficiencies;
  const bgSkills = character.backgroundId ? (BACKGROUND_MAP[character.backgroundId]?.skills ?? []) : [];
  const options = klass
    ? [...new Set([...klass.skillOptions, ...(character.speciesId === "human" ? Object.keys(SKILL_MAP) : [])])]
    : [];
  const expAllowed = expertiseAllowed(character);
  const { proficient } = allSkillProficiencies(character);
  const pb = proficiencyBonus(character.level);
  const final = finalAbilities(character);

  const toggle = (id: string) => {
    if (chosen.includes(id)) {
      update((c) => ({
        skillProficiencies: c.skillProficiencies.filter((s) => s !== id),
        expertise: c.expertise.filter((s) => s !== id),
      }));
    } else if (chosen.length < allowed) {
      update((c) => ({ skillProficiencies: [...c.skillProficiencies, id] }));
    }
  };

  return (
    <Section
      title="Habilidades y competencias"
      hint={
        klass
          ? `Elige ${allowed} habilidades de ${klass.name}. Las del trasfondo se añaden automáticamente.`
          : "Elige primero una clase."
      }
    >
      {bgSkills.length ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {bgSkills.map((s) => (
            <Badge key={s} variant="secondary">
              {SKILL_MAP[s]?.name} (trasfondo)
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((id) => {
          const skill = SKILL_MAP[id];
          if (!skill) return null;
          const fromBg = bgSkills.includes(id);
          const active = chosen.includes(id) || fromBg;
          const isExpert = character.expertise.includes(id);
          const bonus =
            abilityMod(final[skill.ability]) + (isExpert ? pb * 2 : active ? pb : 0);
          return (
            <div
              key={id}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                active ? "border-primary/60 bg-secondary" : "border-border bg-card/50",
              )}
            >
              <Checkbox
                checked={active}
                disabled={fromBg || (!active && chosen.length >= allowed)}
                onCheckedChange={() => toggle(id)}
              />
              <span className="flex-1">{skill.name}</span>
              <span className="text-xs text-muted-foreground">
                {ABILITIES.find((a) => a.key === skill.ability)?.short} {fmtMod(bonus)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Seleccionadas {chosen.length}/{allowed}
      </p>

      {expAllowed > 0 ? (
        <div className="mt-5">
          <p className="heading-rune mb-2">
            Pericia — duplica tu competencia ({character.expertise.length}/{expAllowed})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {proficient.map((id) => {
              const active = character.expertise.includes(id);
              return (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  disabled={!active && character.expertise.length >= expAllowed}
                  onClick={() =>
                    update((c) => ({
                      expertise: active
                        ? c.expertise.filter((e) => e !== id)
                        : [...c.expertise, id],
                    }))
                  }
                >
                  {SKILL_MAP[id]?.name}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}
    </Section>
  );
}

/* ---------------------------- Rasgos y elecciones ------------------------- */

export function FeaturesSection({ character, update }: SectionProps) {
  const features = featuresFor(character);
  const grouped = useMemo(() => {
    const map = new Map<number, typeof features>();
    for (const f of features) {
      const arr = map.get(f.level) ?? [];
      arr.push(f);
      map.set(f.level, arr);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [features]);

  return (
    <Section
      title="Rasgos y habilidades"
      hint="Todo lo desbloqueado por especie, clase, subclase, trasfondo y nivel."
    >
      <div className="space-y-4">
        {grouped.map(([level, items]) => (
          <div key={level}>
            <p className="heading-rune mb-2">Nivel {level}</p>
            <div className="space-y-2">
              {items.map((f) => (
                <div key={`${f.source}-${f.name}`} className="stat-block p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm">{f.name}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {f.source}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                  {f.choice ? (
                    <ChoiceGroup character={character} update={update} choice={f.choice} />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
        {!grouped.length ? (
          <p className="text-sm text-muted-foreground">
            Selecciona especie, clase y trasfondo para ver tus rasgos.
          </p>
        ) : null}
      </div>
    </Section>
  );
}

export function ChoiceGroup({
  character,
  update,
  choice,
}: SectionProps & { choice: NonNullable<import("@/lib/types").Feature["choice"]> }) {
  const selected = character.choices[choice.id] ?? [];
  const toggle = (id: string) => {
    const isSel = selected.includes(id);
    let next: string[];
    if (isSel) next = selected.filter((s) => s !== id);
    else if (choice.count === 1) next = [id];
    else if (selected.length < choice.count) next = [...selected, id];
    else return;
    update((c) => ({ choices: { ...c.choices, [choice.id]: next } }));
  };
  return (
    <div className="mt-3">
      <p className="heading-rune mb-1.5">
        {choice.label} ({selected.length}/{choice.count})
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {choice.options.map((o) => (
          <OptionCard
            key={o.id}
            title={o.name}
            {...(o.desc ? { subtitle: o.desc } : {})}
            selected={selected.includes(o.id)}
            onSelect={() => toggle(o.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------ Mejoras de característica ---------------------- */

export function AsiSection({ character, update }: SectionProps) {
  const levels = asiLevelsAvailable(character);
  const generalFeats = FEATS.filter((f) => f.category === "general" && f.id !== "ability-improvement");

  const setChoice = (level: number, patch: Partial<import("@/lib/types").AsiChoice>) => {
    update((c) => {
      const existing = c.asi.find((a) => a.level === level);
      const next = existing
        ? c.asi.map((a) => (a.level === level ? { ...a, ...patch } : a))
        : [...c.asi, { level, type: "asi" as const, abilities: [], ...patch }];
      return { asi: next.sort((a, b) => a.level - b.level) };
    });
  };

  if (!levels.length) {
    return (
      <Section title="Mejoras de característica y dotes" hint="Disponibles a partir del nivel 4.">
        <p className="text-sm text-muted-foreground">
          Tu personaje aún no ha alcanzado un nivel con mejora de característica.
        </p>
      </Section>
    );
  }

  return (
    <Section
      title="Mejoras de característica y dotes"
      hint="En cada nivel indicado eliges una mejora (+2 a una o +1 a dos) o una dote general."
    >
      <div className="space-y-4">
        {levels.map((level) => {
          const choice = character.asi.find((a) => a.level === level);
          const abilities = choice?.abilities ?? [];
          const type = choice?.type ?? "asi";
          return (
            <div key={level} className="stat-block p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge>Nivel {level}</Badge>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={type === "asi" ? "default" : "outline"}
                    onClick={() => setChoice(level, { type: "asi", featId: undefined })}
                  >
                    Mejora de característica
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={type === "feat" ? "default" : "outline"}
                    onClick={() => setChoice(level, { type: "feat", abilities: [] })}
                  >
                    Dote
                  </Button>
                </div>
              </div>

              {type === "asi" ? (
                <div className="flex flex-wrap gap-1.5">
                  {ABILITIES.map((a) => {
                    const count = abilities.filter((x) => x === a.key).length;
                    return (
                      <Button
                        key={a.key}
                        type="button"
                        size="sm"
                        variant={count ? "default" : "outline"}
                        onClick={() => {
                          let next = [...abilities];
                          if (count === 0 && next.length < 2) next.push(a.key);
                          else if (count === 1 && next.length === 1) next = [a.key, a.key];
                          else next = next.filter((x) => x !== a.key);
                          setChoice(level, { abilities: next });
                        }}
                      >
                        {a.short} {count ? `+${count}` : ""}
                      </Button>
                    );
                  })}
                  <span className="self-center pl-1 text-xs text-muted-foreground">
                    {abilities.length}/2 puntos asignados
                  </span>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {generalFeats.map((f) => (
                    <OptionCard
                      key={f.id}
                      title={f.name}
                      subtitle={f.desc}
                      selected={choice?.featId === f.id}
                      onSelect={() => setChoice(level, { featId: f.id })}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* --------------------------------- Conjuros ------------------------------- */

export function SpellsSection({ character, update }: SectionProps) {
  const ct = casterType(character);
  const list = spellsForClass(character.classId, character.subclassId);
  const maxLvl = maxSpellLevel(character);
  const cantripLimit = cantripsAllowed(character);
  const spellLimit = spellsAllowed(character);

  if (!ct) {
    return (
      <Section title="Conjuros" hint="Esta clase no lanza conjuros en su nivel actual.">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="size-4" /> Si eliges una subclase mágica (p. ej. Caballero Arcano o
          Embaucador Arcano) aparecerán aquí sus conjuros.
        </p>
      </Section>
    );
  }

  const cantrips = list.filter((s) => s.level === 0);
  const leveled = list.filter((s) => s.level > 0 && s.level <= maxLvl);

  const toggle = (id: string, isCantrip: boolean) => {
    update((c) => {
      if (isCantrip) {
        const has = c.cantrips.includes(id);
        if (!has && c.cantrips.length >= cantripLimit) return {};
        return { cantrips: has ? c.cantrips.filter((s) => s !== id) : [...c.cantrips, id] };
      }
      const has = c.spells.includes(id);
      if (!has && c.spells.length >= spellLimit) return {};
      return { spells: has ? c.spells.filter((s) => s !== id) : [...c.spells, id] };
    });
  };

  return (
    <Section
      title="Conjuros"
      hint={`Trucos ${character.cantrips.length}/${cantripLimit} · Conjuros ${character.spells.length}/${spellLimit} · Nivel máximo de conjuro: ${maxLvl || "—"}`}
    >
      {cantripLimit > 0 ? (
        <>
          <p className="heading-rune mb-2">Trucos</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cantrips.map((s) => (
              <OptionCard
                key={s.id}
                title={s.name}
                subtitle={s.desc}
                meta={`${s.school} · ${s.castingTime}`}
                selected={character.cantrips.includes(s.id)}
                disabled={!character.cantrips.includes(s.id) && character.cantrips.length >= cantripLimit}
                onSelect={() => toggle(s.id, true)}
              />
            ))}
          </div>
        </>
      ) : null}

      {[...Array(maxLvl)].map((_, i) => {
        const lvl = i + 1;
        const spells = leveled.filter((s) => s.level === lvl);
        if (!spells.length) return null;
        return (
          <div key={lvl} className="mt-5">
            <p className="heading-rune mb-2">Conjuros de nivel {lvl}</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {spells.map((s) => (
                <OptionCard
                  key={s.id}
                  title={s.name}
                  subtitle={s.desc}
                  meta={`${s.school} · ${s.range} · ${s.duration}`}
                  selected={character.spells.includes(s.id)}
                  disabled={!character.spells.includes(s.id) && character.spells.length >= spellLimit}
                  onSelect={() => toggle(s.id, false)}
                />
              ))}
            </div>
          </div>
        );
      })}
      {maxLvl === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no tienes espacios de conjuro: llegarán al subir de nivel.
        </p>
      ) : null}
    </Section>
  );
}

/* --------------------------------- Equipo -------------------------------- */

export function EquipmentSection({ character, update }: SectionProps) {
  const klass = character.classId ? CLASS_MAP[character.classId] : null;
  const bg = character.backgroundId ? BACKGROUND_MAP[character.backgroundId] : null;

  const applyPackage = (id: string) => {
    const pkg = klass?.equipment.find((p) => p.id === id);
    if (!pkg) return;
    update((c) => {
      const existing = new Set(c.equipment.map((e) => e.name));
      const additions = pkg.items.filter((i) => !existing.has(i.name));
      return { equipment: [...c.equipment, ...additions] };
    });
  };

  const addBackgroundGear = () => {
    if (!bg) return;
    update((c) => {
      const existing = new Set(c.equipment.map((e) => e.name));
      return { equipment: [...c.equipment, ...bg.equipment.filter((i) => !existing.has(i.name))] };
    });
  };

  return (
    <Section title="Inventario" hint="Añade el equipo inicial de clase y trasfondo, o tus propios objetos.">
      <div className="flex flex-wrap gap-2">
        {klass?.equipment.map((p) => (
          <Button key={p.id} type="button" size="sm" variant="outline" onClick={() => applyPackage(p.id)}>
            <Plus className="mr-1.5 size-3.5" /> {p.label}
          </Button>
        ))}
        {bg ? (
          <Button type="button" size="sm" variant="outline" onClick={addBackgroundGear}>
            <Plus className="mr-1.5 size-3.5" /> Equipo de {bg.name}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 space-y-1.5">
        {character.equipment.map((item, idx) => (
          <div key={`${item.name}-${idx}`} className="flex items-center gap-2 rounded-md border border-border bg-card/50 px-3 py-2">
            <Input
              className="h-8 flex-1"
              value={item.name}
              onChange={(e) =>
                update((c) => ({
                  equipment: c.equipment.map((it, i) =>
                    i === idx ? { ...it, name: e.target.value } : it,
                  ),
                }))
              }
            />
            <Input
              className="h-8 w-16 text-center"
              inputMode="numeric"
              value={item.qty}
              onChange={(e) =>
                update((c) => ({
                  equipment: c.equipment.map((it, i) =>
                    i === idx ? { ...it, qty: Number(e.target.value.replace(/\D/g, "")) || 1 } : it,
                  ),
                }))
              }
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8 text-destructive"
              onClick={() => update((c) => ({ equipment: c.equipment.filter((_, i) => i !== idx) }))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => update((c) => ({ equipment: [...c.equipment, { name: "Objeto nuevo", qty: 1 }] }))}
        >
          <Plus className="mr-1.5 size-3.5" /> Añadir objeto
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["pp", "gp", "sp", "cp"] as const).map((k) => (
          <div key={k} className="space-y-1">
            <Label className="text-xs uppercase tracking-wider">{k}</Label>
            <Input
              className="h-8"
              inputMode="numeric"
              value={character.currency[k]}
              onChange={(e) =>
                update((c) => ({
                  currency: { ...c.currency, [k]: Number(e.target.value.replace(/\D/g, "")) || 0 },
                }))
              }
            />
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------------- Notas -------------------------------- */

export function NotesSection({ character, update }: SectionProps) {
  return (
    <Section title="Notas" hint="Historia, vínculos, objetivos o cualquier detalle de mesa.">
      <Textarea
        rows={6}
        value={character.notes}
        placeholder="Trasfondo narrativo, aliados, secretos..."
        onChange={(e) => update({ notes: e.target.value })}
      />
    </Section>
  );
}
