import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  IdentitySection,
  SpeciesSection,
  ClassSection,
  BackgroundSection,
  AbilitiesSection,
  SkillsSection,
  FeaturesSection,
  SpellsSection,
  EquipmentSection,
  NotesSection,
} from "@/components/character/parts";
import { useCharacter } from "@/hooks/useCharacters";
import { createCharacter, store } from "@/lib/storage";
import { classSkillCount, completeness, pendingChoices, casterType, cantripsAllowed, spellsAllowed } from "@/lib/derive";
import type { Character } from "@/lib/types";

export const Route = createFileRoute("/crear")({
  head: () => ({
    meta: [
      { title: "Crear personaje — Grimorio 5.5e" },
      { name: "description", content: "Crea tu personaje de D&D 5.5e paso a paso." },
    ],
  }),
  component: CreatePage,
});

const STEPS = [
  "Datos",
  "Especie",
  "Clase",
  "Trasfondo",
  "Atributos",
  "Habilidades",
  "Rasgos",
  "Magia",
  "Equipo",
  "Notas",
  "Finalizar",
] as const;

function stepError(c: Character, step: number): string | null {
  switch (step) {
    case 0: return c.name.trim() ? null : "Escribe el nombre del personaje.";
    case 1: return c.speciesId ? null : "Selecciona una especie.";
    case 2: return c.classId ? null : "Selecciona una clase.";
    case 3: return c.backgroundId ? null : "Selecciona un trasfondo.";
    case 4: return Object.values(c.backgroundAbilities).reduce((sum, value) => sum + (value ?? 0), 0) === 3
      ? null : "Reparte las 3 mejoras de características del trasfondo.";
    case 5: return c.skillProficiencies.length >= classSkillCount(c)
      ? null : "Selecciona las habilidades de clase necesarias.";
    case 6: return pendingChoices(c).length === 0
      ? null : "Completa las elecciones de rasgos pendientes.";
    case 7: {
      if (!casterType(c)) return null;
      if (c.cantrips.length < cantripsAllowed(c)) return "Selecciona los trucos disponibles.";
      if (c.spells.length < spellsAllowed(c)) return "Selecciona los conjuros disponibles.";
      return null;
    }
    default: return null;
  }
}

function CreatePage() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    if (id) return;
    const created = store.add(createCharacter());
    setId(created.id);
  }, [id]);

  if (!id) {
    return <main className="mx-auto max-w-4xl px-4 py-10">Preparando la ficha…</main>;
  }
  return <CreateEditor id={id} />;
}

function CreateEditor({ id }: { id: string }) {
  const navigate = useNavigate();
  const { character, update } = useCharacter(id);
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);

  if (!character) {
    return <main className="mx-auto max-w-4xl px-4 py-10">Cargando…</main>;
  }

  const status = completeness(character);
  const sections = [
    <IdentitySection character={character} update={update} />,
    <SpeciesSection character={character} update={update} />,
    <ClassSection character={character} update={update} />,
    <BackgroundSection character={character} update={update} />,
    <AbilitiesSection character={character} update={update} />,
    <SkillsSection character={character} update={update} />,
    <FeaturesSection character={character} update={update} />,
    <SpellsSection character={character} update={update} />,
    <EquipmentSection character={character} update={update} />,
    <NotesSection character={character} update={update} />,
  ];

  function goTo(next: number) {
    setStep(next);
    setMaxReached((current) => Math.max(current, next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextStep() {
    const error = stepError(character!, step);
    if (error) {
      toast.error(error);
      return;
    }
    goTo(Math.min(step + 1, STEPS.length - 1));
  }

  function finish() {
    if (status.missing.length) {
      toast.error("Completa antes: " + status.missing.join(", "));
      return;
    }
    toast.success("Personaje creado y guardado");
    void navigate({ to: "/personaje/$id", params: { id }, search: { tab: "combate" } });
  }

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <header className="space-y-2">
        <h1 className="font-display text-2xl tracking-wide">Crear personaje paso a paso</h1>
        <p className="text-sm text-muted-foreground">
          Nivel 1 · Paso {step + 1} de {STEPS.length}: {STEPS[step]}. Los cambios se guardan automáticamente.
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
          <div className="h-full bg-primary transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </header>


      {step < sections.length ? sections[step] : (
        <section className="panel space-y-4 p-5">
          <h2 className="font-display text-xl">Revisar y terminar</h2>
          <p className="text-sm text-muted-foreground">
            {status.missing.length
              ? "Quedan elecciones pendientes. Puedes volver a los pasos anteriores para completarlas."
              : "¡Tu personaje está listo para comenzar la aventura!"}
          </p>
          {status.missing.length ? (
            <ul className="list-inside list-disc space-y-1 text-sm">
              {status.missing.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : null}
          <p className="text-sm">Completado: {status.done}/{status.total}</p>
        </section>
      )}

      <div className="sticky bottom-0 z-30 -mx-4 space-y-2 border-t border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur sm:mx-0 sm:rounded-lg sm:border sm:px-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={step === 0} onClick={() => goTo(step - 1)}>
              Anterior
            </Button>
            {step > 0 && (
              <Button variant="ghost" onClick={() => goTo(0)}>
                Volver al nombre
              </Button>
            )}
          </div>
          {step < STEPS.length - 1 ? (
            <Button onClick={nextStep}>Confirmar y siguiente</Button>
          ) : (
            <Button onClick={finish} disabled={status.missing.length > 0}>Guardar y ver ficha</Button>
          )}
        </div>
        <nav className="flex gap-1.5 overflow-x-auto pb-1" aria-label="Apartados de creación">
          {STEPS.map((label, index) => (
            <button
              key={label}
              type="button"
              disabled={index > maxReached}
              onClick={() => goTo(index)}
              aria-current={index === step ? "step" : undefined}
              className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-colors ${index === step ? "border-primary bg-secondary font-semibold text-primary" : "border-border text-muted-foreground"} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
      <div className="pb-2 text-right">
        <Button variant="ghost" size="sm" onClick={() => { store.remove(id); void navigate({ to: "/" }); }}>
          Descartar personaje
        </Button>
      </div>
    </main>
  );
}
