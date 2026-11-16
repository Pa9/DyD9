import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Dices,
  FolderClosed,
  Menu,
  ScrollText,
  Shield,
  Swords,
  X,
} from "lucide-react";
import { useCharacters } from "@/hooks/useCharacters";

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const characters = useCharacters();
  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú lateral"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-4 z-40 rounded-lg border border-primary/50 bg-background p-3 text-primary shadow-lg lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      {open && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/70 bg-background transition-all duration-200 lg:sticky lg:top-0 lg:z-30 lg:h-screen ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${collapsed ? "w-16" : "w-72"}`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/70 p-3">
          {!collapsed && (
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-display text-primary"
            >
              <Dices className="size-5" /> Grimorio 5.5e
            </Link>
          )}
          <div className="flex gap-1">
            <button
              type="button"
              aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded p-2 text-muted-foreground hover:bg-secondary lg:block"
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
            <button
              type="button"
              aria-label="Cerrar menú lateral"
              onClick={() => setOpen(false)}
              className="rounded p-2 lg:hidden"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-2 text-sm">
          <Link
            to="/crear"
            onClick={() => setOpen(false)}
            title="Creación de personajes"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-foreground hover:bg-secondary"
          >
            <Swords className="size-4 shrink-0 text-primary" />
            {!collapsed && "Creación de personajes"}
          </Link>
          <Link
            to="/"
            onClick={() => setOpen(false)}
            title="Mis personajes"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-foreground hover:bg-secondary"
          >
            <ScrollText className="size-4 shrink-0 text-primary" />
            {!collapsed && "Mis personajes"}
          </Link>
          <div
            title="Creación de monstruos: pendiente de definir"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-muted-foreground/70"
          >
            <Shield className="size-4 shrink-0" />
            {!collapsed && (
              <span>
                Creación de monstruos <small className="block text-[10px]">Pendiente</small>
              </span>
            )}
          </div>
          <div
            title="Información para la historia: pendiente de desarrollar"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-muted-foreground/70"
          >
            <BookOpen className="size-4 shrink-0" />
            {!collapsed && (
              <span>
                Información para la historia <small className="block text-[10px]">Pendiente</small>
              </span>
            )}
          </div>
          <div className="my-3 border-t border-border/70" />
          <div
            title="Proyectos: pendiente de desarrollar"
            className="flex items-center gap-3 px-3 py-2 text-muted-foreground"
          >
            <FolderClosed className="size-4 shrink-0" />
            {!collapsed && (
              <span>
                Proyectos <small className="block text-[10px]">Pendiente</small>
              </span>
            )}
          </div>
          {!collapsed && (
            <>
              <div className="mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recientes
              </div>
              <div className="mt-2 space-y-1">
                {[...characters]
                  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                  .slice(0, 12)
                  .map((c) => (
                    <Link
                      key={c.id}
                      to="/personaje/$id"
                      params={{ id: c.id }}
                      search={{ tab: "combate" }}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 truncate rounded-md px-3 py-2 text-sm hover:bg-secondary"
                    >
                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                      <span className="truncate">{c.name || "Sin nombre"}</span>
                    </Link>
                  ))}
                {!characters.length && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    Todavía no hay personajes
                  </p>
                )}
              </div>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
