import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, Download, FilePlus2, Trash2, Upload, ArrowUpRight, ChevronsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useCharacters } from "@/hooks/useCharacters";
import { createCharacter, store } from "@/lib/storage";
import { armorClass, characterSubtitle, completeness, maxHp } from "@/lib/derive";
import type { Character } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mis personajes — Grimorio 5.5e" },
      {
        name: "description",
        content:
          "Gestiona tus personajes de Dungeons & Dragons 5.5e: crea, duplica, sube de nivel, exporta e importa fichas.",
      },
      { property: "og:title", content: "Mis personajes — Grimorio 5.5e" },
      {
        property: "og:description",
        content: "Tu colección de fichas de D&D 5.5e con progresión de nivel automática.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CharactersPage,
});

function CharactersPage() {
  const characters = useCharacters();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingDelete, setPendingDelete] = useState<Character | null>(null);

  const exportAll = () => {
    const blob = new Blob([store.exportAll()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grimorio-personajes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (file: File) => {
    try {
      const n = store.importAll(await file.text());
      toast.success(`${n} personaje(s) importado(s)`);
    } catch {
      toast.error("El archivo no tiene un formato válido");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-wide sm:text-3xl">Mis personajes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {characters.length
              ? `${characters.length} ficha(s) guardada(s) en este dispositivo.`
              : "Aún no has forjado ninguna leyenda."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importFile(f);
              e.target.value = "";
            }}
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Importar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAll}
            disabled={!characters.length}
          >
            <Download className="size-4" /> Exportar
          </Button>
          <Button size="sm" asChild>
            <Link to="/crear">
              <FilePlus2 className="size-4" /> Nuevo personaje
            </Link>
          </Button>
        </div>
      </header>

      {!characters.length ? (
        <div className="panel flex flex-col items-center gap-3 p-10 text-center">
          <p className="font-display text-lg">El grimorio está en blanco</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Crea tu primer personaje con el asistente paso a paso: especie, clase, trasfondo,
            características, conjuros y equipo.
          </p>
          <Button asChild>
            <Link to="/crear">Empezar creación</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((c) => {
            const status = completeness(c);
            const ac = armorClass(c);
            return (
              <article key={c.id} className="panel flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg leading-tight">
                      {c.name || "Sin nombre"}
                    </h2>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {characterSubtitle(c)}
                    </p>
                  </div>
                  <Badge variant={status.missing.length ? "outline" : "secondary"}>
                    {status.missing.length ? `${status.done}/${status.total}` : "Lista"}
                  </Badge>
                </div>

                <div className="gold-rule" />

                <dl className="grid grid-cols-3 gap-2 text-center">
                  <div className="stat-block px-2 py-1.5">
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Nivel</dt>
                    <dd className="font-display text-base">{c.level}</dd>
                  </div>
                  <div className="stat-block px-2 py-1.5">
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">PG</dt>
                    <dd className="font-display text-base">{maxHp(c)}</dd>
                  </div>
                  <div className="stat-block px-2 py-1.5">
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">CA</dt>
                    <dd className="font-display text-base">{ac.value}</dd>
                  </div>
                </dl>

                {status.missing.length ? (
                  <p className="text-xs text-muted-foreground">
                    Falta: {status.missing.slice(0, 3).join(", ")}
                    {status.missing.length > 3 ? "…" : ""}
                  </p>
                ) : null}

                <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                  <Button size="sm" asChild>
                    <Link to="/personaje/$id" params={{ id: c.id }}>
                      <ArrowUpRight className="size-4" /> Abrir ficha
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/personaje/$id" params={{ id: c.id }} search={{ tab: "nivel" }}>
                      <ChevronsUp className="size-4" /> Subir nivel
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Duplicar personaje"
                    onClick={() => {
                      const copy = store.duplicate(c.id);
                      if (copy) toast.success("Personaje duplicado");
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Eliminar personaje"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setPendingDelete(c)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </article>
            );
          })}

          <button
            type="button"
            onClick={() => {
              const created = store.add(createCharacter());
              void navigate({ to: "/personaje/$id", params: { id: created.id } });
            }}
            className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
          >
            <FilePlus2 className="size-6" />
            <span className="font-display text-sm">Añadir ficha en blanco</span>
          </button>
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar «{pendingDelete?.name || "Sin nombre"}»?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La ficha se borrará de este dispositivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) store.remove(pendingDelete.id);
                setPendingDelete(null);
                toast.success("Personaje eliminado");
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
