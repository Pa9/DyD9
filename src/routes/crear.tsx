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
  AsiSection,
  SpellsSection,
  EquipmentSection,
  NotesSection,
} from "@/components/character/parts";
import { useCharacter } from "@/hooks/useCharacters";
import { createCharacter, store } from "@/lib/storage";
import { completeness } from "@/lib/derive";

export const Route = createFileRoute("/crear")({
  head: () => ({
    meta: [
      { title: "Crear personaje — Grimorio 5.5e" },
      {
        name: "description",
        content:
          "Asistente paso a paso para crear un personaje de D&D 5.5e: especie, clase, trasfondo, características, conjuros y equipo.",
      },
      { property: "og:title", content: "Crear personaje — Grimorio 5.5e" },
      {
        property: "og:description",
        content: "Crea tu personaje de D&D 5.5e con progresión y reglas automáticas.",
      },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    if (id) return;
    const created = store.add(createCharacter());
    setId(created.id);
  }, [id]);

  if (!id) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-muted-foreground">Preparando la ficha…</p>
      </main>
    );
  }

  return <CreateEditor id={id} />;
}

function CreateEditor({ id }: { id: string }) {
  const navigate = useNavigate();
  const { character, update } = useCharacter(id);

  if (!character) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </main>
    );
  }

  const status = completeness(character);

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <header className="space-y-1">
        <h1 className="font-display text-2xl tracking-wide">Crear personaje</h1>
        <p className="text-sm text-muted-foreground">
          Los cambios se guardan automáticamente. Completado {status.done}/{status.total}.
        </p>
      </header>

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

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            toast.success("Personaje guardado");
            navigate({ to: "/personaje/$id", params: { id }, search: { tab: "ficha" } });
          }}
        >
          Guardar y ver ficha
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            store.remove(id);
            navigate({ to: "/" });
          }}
        >
          Descartar
        </Button>
      </div>
    </main>
  );
}
