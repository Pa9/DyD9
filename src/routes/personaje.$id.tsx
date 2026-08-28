import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronsUp, Copy, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Section,
  IdentitySection,
  SpeciesSection,
  ClassSection,
  BackgroundSection,
  AbilitiesSection,
  SkillsSection,
  FeaturesSection,
  AsiSection,
  SpellsSection,
  EquipmentSection,
  NotesSection,
  ChoiceGroup,
} from "@/components/character/parts";
import { useCharacter } from "@/hooks/useCharacters";
import { store } from "@/lib/storage";
import {
  abilityMod,
  armorClass,
  characterSubtitle,
  completeness,
  featuresGainedBetween,
  finalAbilities,
  fmtMod,
  hitDie,
  maxHp,
  pendingChoices,
  saveBonuses,
  skillLines,
  speed,
  spellcastingStats,
} from "@/lib/derive";
import { ABILITIES, XP_BY_LEVEL, proficiencyBonus } from "@/data/rules";
import type { Character } from "@/lib/types";

type Tab = "ficha" | "nivel";

export const Route = createFileRoute("/personaje/$id")({
  validateSearch: (search: Record<string, unknown>): { tab: Tab } => ({
    tab: search['tab'] === "nivel" ? "nivel" : "ficha",
  }),
  head: () => ({
    meta: [
      { title: "Ficha del personaje — Grimorio 5.5e" },
      {
        name: "description",
        content:
          "Consulta y edita la ficha completa de tu personaje de D&D 5.5e y gestiona su subida de nivel del 1 al 20.",
      },
      { property: "og:title", content: "Ficha del personaje — Grimorio 5.5e" },
      {
        property: "og:description",
        content: "Ficha viva con rasgos, conjuros, equipo y progresión de nivel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CharacterPage,
});

function CharacterPage() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const { character, update, loading } = useCharacter(id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-muted-foreground">Cargando ficha…</p>
      </main>
    );
  }

  if (!character) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-10">
        <h1 className="font-display text-2xl">Personaje no encontrado</h1>
        <p className="text-sm text-muted-foreground">
          Puede que se haya eliminado o que estés en otro dispositivo.
        </p>
        <Button asChild>
          <Link to="/">Volver a mis personajes</Link>
        </Button>
      </main>
    );
  }

  const status = completeness(character);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-wide sm:text-3xl">
            {character.name || "Sin nombre"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{characterSubtitle(character)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={status.missing.length ? "outline" : "secondary"}>
            {status.missing.length ? `Completado ${status.done}/${status.total}` : "Ficha completa"}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const copy = store.duplicate(character.id);
              if (copy) {
                toast.success("Personaje duplicado");
                void navigate({ to: "/personaje/$id", params: { id: copy.id }, search: { tab: "ficha" } });
              }
            }}
          >
            <Copy className="size-4" /> Duplicar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" /> Eliminar
          </Button>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Secciones del personaje"
        className="mb-4 inline-flex gap-1 rounded-lg border border-border bg-card/60 p-1"
      >
        {([
          ["ficha", "Ficha"],
          ["nivel", "Subida de nivel"],
        ] as [Tab, string][]).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() =>
              void navigate({ to: "/personaje/$id", params: { id }, search: { tab: value } })
            }
            className={
              tab === value
                ? "rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-primary shadow-gold"
                : "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "ficha" ? (
        <div className="space-y-5">
          <StatSummary character={character} />
          <IdentitySection character={character} update={update} />
          <SpeciesSection character={character} update={update} />
          <ClassSection character={character} update={update} />
          <BackgroundSection character={character} update={update} />
          <AbilitiesSection character={character} update={update} />
          <SkillsSection character={character} update={update} />
          <FeaturesSection character={character} update={update} />
          <AsiSection character={character} update={update} />
          <SpellsSection character={character} update={update} />
          <EquipmentSection character={character} update={update} />
          <NotesSection character={character} update={update} />
        </div>
      ) : (
        <div className="space-y-5">
          <LevelUpPanel character={character} update={update} />
        </div>
      )}


      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar «{character.name || "Sin nombre"}»?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                store.remove(character.id);
                toast.success("Personaje eliminado");
                void navigate({ to: "/" });
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

/* ------------------------------ Resumen ---------------------------------- */

function StatSummary({ character }: { character: Character }) {
  const ab = finalAbilities(character);
  const ac = armorClass(character);
  const saves = saveBonuses(character);
  const sc = spellcastingStats(character);
  const skills = skillLines(character).filter((s) => s.proficient || s.expert);

  return (
    <Section title="Resumen" hint={`Bonificador de competencia +${proficiencyBonus(character.level)}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ABILITIES.map((a) => (
            <div key={a.key} className="stat-block px-2 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{a.short}</p>
              <p className="font-display text-lg">{ab[a.key]}</p>
              <p className="text-xs text-primary">{fmtMod(abilityMod(ab[a.key]))}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Salv. {fmtMod(saves[a.key].bonus)}
                {saves[a.key].proficient ? "*" : ""}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStat label="Puntos de golpe" value={String(maxHp(character))} />
          <MiniStat label="Clase de armadura" value={String(ac.value)} hint={ac.note} />
          <MiniStat label="Velocidad" value={`${speed(character)} pies`} />
          <MiniStat label="Dado de golpe" value={`${character.level}d${hitDie(character)}`} />
        </div>

        {sc ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat label="CD de conjuros" value={String(sc.dc)} />
            <MiniStat label="Ataque de conjuro" value={fmtMod(sc.attack)} />
            <MiniStat label="Nivel máx. de conjuro" value={String(sc.maxSpellLevel)} />
            <MiniStat
              label="Espacios"
              value={
                sc.pact
                  ? `${sc.pact.slots} × nivel ${sc.pact.level}`
                  : sc.slots.filter((n) => n > 0).join(" / ") || "—"
              }
            />
          </div>
        ) : null}

        {skills.length ? (
          <div>
            <p className="heading-rune mb-2">Habilidades competentes</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <Badge key={s.id} variant="outline">
                  {s.name} {fmtMod(s.bonus)}
                  {s.expert ? " ◆" : ""}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Section>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stat-block px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-base">{value}</p>
      {hint ? <p className="text-[10px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/* --------------------------- Subida de nivel ----------------------------- */

function LevelUpPanel({
  character,
  update,
}: {
  character: Character;
  update: (patch: Partial<Character> | ((c: Character) => Partial<Character>)) => void;
}) {
  const next = character.level + 1;
  const die = hitDie(character);
  const avg = Math.floor(die / 2) + 1;
  const conMod = abilityMod(finalAbilities(character).con);
  const [roll, setRoll] = useState<number | "">("");
  const preview = character.classId ? featuresGainedBetween(character, character.level, next) : [];
  const pending = pendingChoices(character);
  const atMax = character.level >= 20;

  const levelUp = () => {
    if (!character.classId) {
      toast.error("Elige una clase antes de subir de nivel");
      return;
    }
    if (atMax) return;
    update((c) => ({
      level: next,
      ...(roll === ""
        ? {}
        : { hpMode: "manual" as const, hpRolls: { ...c.hpRolls, [String(next)]: Number(roll) } }),
      levelLog: [...c.levelLog, { level: next, date: new Date().toISOString() }],
    }));
    setRoll("");
    toast.success(`¡Nivel ${next} alcanzado!`);
  };

  const levelDown = () => {
    if (character.level <= 1) return;
    const prev = character.level - 1;
    update((c) => {
      const hpRolls = { ...c.hpRolls };
      delete hpRolls[String(c.level)];
      return {
        level: prev,
        hpRolls,
        asi: c.asi.filter((a) => a.level <= prev),
        levelLog: c.levelLog.filter((l) => l.level <= prev),
      };
    });
    toast.success(`Nivel revertido a ${prev}`);
  };

  return (
    <>
      <Section
        title={atMax ? "Nivel máximo alcanzado" : `Subir al nivel ${next}`}
        hint={
          atMax
            ? "Tu personaje ha llegado al nivel 20, el techo de progresión en 5.5e."
            : `Requiere ${XP_BY_LEVEL[next] ?? 0} PX. La progresión es estricta: un nivel a la vez.`
        }
        action={
          character.level > 1 ? (
            <Button variant="outline" size="sm" onClick={levelDown}>
              <RotateCcw className="size-4" /> Deshacer nivel {character.level}
            </Button>
          ) : null
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat label="Nivel actual" value={String(character.level)} />
            <MiniStat label="Competencia" value={fmtMod(proficiencyBonus(character.level))} />
            <MiniStat label="PG actuales" value={String(maxHp(character))} />
            <MiniStat
              label="PG al subir"
              value={atMax ? "—" : `+${Math.max(1, (roll === "" ? avg : Number(roll)) + conMod)}`}
              hint={`d${die} ${roll === "" ? `(media ${avg})` : ""} ${fmtMod(conMod)} Con`}
            />
          </div>

          {!atMax ? (
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-40">
                <Label htmlFor="hp-roll" className="text-xs">
                  Tirada de PG (opcional)
                </Label>
                <Input
                  id="hp-roll"
                  type="number"
                  min={1}
                  max={die}
                  placeholder={`Media ${avg}`}
                  value={roll}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") return setRoll("");
                    setRoll(Math.min(die, Math.max(1, Number(v))));
                  }}
                />
              </div>
              <Button onClick={levelUp} disabled={!character.classId}>
                <ChevronsUp className="size-4" /> Subir a nivel {next}
              </Button>
            </div>
          ) : null}

          {!character.classId ? (
            <p className="text-sm text-destructive">
              Necesitas una clase para progresar. Vuelve a la pestaña «Ficha».
            </p>
          ) : null}

          {!atMax && preview.length ? (
            <div>
              <p className="heading-rune mb-2">Ganarás al nivel {next}</p>
              <div className="space-y-2">
                {preview.map((f) => (
                  <div key={`${f.source}-${f.name}`} className="stat-block p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-sm">{f.name}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {f.source}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {!atMax && character.classId && !preview.length ? (
            <p className="text-sm text-muted-foreground">
              El nivel {next} no otorga rasgos nuevos, pero mejora dados de golpe y progresión.
            </p>
          ) : null}
        </div>
      </Section>

      {pending.length ? (
        <Section
          title="Elecciones pendientes"
          hint="Resuélvelas para mantener la ficha válida en tu nivel actual."
        >
          <div className="space-y-3">
            {pending.map(({ feature, choice }) => (
              <div key={choice.id} className="stat-block p-3">
                <p className="font-display text-sm">
                  {feature.name} <span className="text-muted-foreground">· nivel {feature.level}</span>
                </p>
                <ChoiceGroup character={character} update={update} choice={choice} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <AsiSection character={character} update={update} />

      <Section title="Historial de progresión" hint="Cada nivel alcanzado con su fecha.">
        <ol className="space-y-1.5">
          {[...character.levelLog]
            .sort((a, b) => b.level - a.level)
            .map((l) => (
              <li key={`${l.level}-${l.date}`} className="flex items-center justify-between text-sm">
                <span className="font-display">Nivel {l.level}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(l.date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
        </ol>
      </Section>
    </>
  );
}
