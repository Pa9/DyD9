import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetView } from "@/components/sheet/SheetView";
import { SheetActions } from "@/components/sheet/SheetActions";
import { useCharacter } from "@/hooks/useCharacters";
import { buildSheetDoc, buildSheetModel } from "@/lib/sheet";

export const Route = createFileRoute("/ficha/$id")({
  head: () => ({
    meta: [
      { title: "Ficha imprimible — Grimorio 5.5e" },
      {
        name: "description",
        content:
          "Ficha completa en A4 de tu personaje de D&D 5.5e, lista para imprimir, descargar en PDF o exportar a Excel.",
      },
      { property: "og:title", content: "Ficha imprimible — Grimorio 5.5e" },
      {
        property: "og:description",
        content: "Ficha dinámica en A4 con características, rasgos, conjuros, equipo y progresión.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SheetPage,
});

function SheetPage() {
  const { id } = Route.useParams();
  const { character, loading } = useCharacter(id);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-muted-foreground">Cargando ficha…</p>
      </main>
    );
  }

  if (!character) {
    return (
      <main className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        <h1 className="font-display text-2xl">Personaje no encontrado</h1>
        <Button asChild>
          <Link to="/">Volver a mis personajes</Link>
        </Button>
      </main>
    );
  }

  const doc = buildSheetDoc(buildSheetModel(character));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link to="/personaje/$id" params={{ id }} search={{ tab: "ficha" as const }}>
            <ArrowLeft className="size-4" /> Volver al personaje
          </Link>
        </Button>
        <SheetActions character={character} showView={false} />
      </div>
      <SheetView doc={doc} />
    </main>
  );
}
