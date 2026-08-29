import type { ReactNode } from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Spell } from "@/lib/types";

/** Botón ⓘ con explicación en lenguaje claro. */
export function InfoButton({
  title,
  subtitle,
  rows,
  body,
  label = "Ver explicación",
  children,
}: {
  title: string;
  subtitle?: string;
  rows?: { label: string; value: string }[];
  body?: string;
  label?: string;
  children?: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`${label}: ${title}`}
          title={label}
          className="size-7 shrink-0 text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          {subtitle ? <DialogDescription>{subtitle}</DialogDescription> : null}
        </DialogHeader>
        {body ? <p className="text-sm leading-relaxed">{body}</p> : null}
        {rows?.length ? (
          <dl className="mt-1 grid gap-1.5 text-sm">
            {rows.map((r) => (
              <div key={r.label} className="flex gap-2">
                <dt className="w-40 shrink-0 text-muted-foreground">{r.label}</dt>
                <dd className="flex-1">{r.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </DialogContent>
    </Dialog>
  );
}

/** Explicación completa de un conjuro: qué hace, dados, alcance y cómo escala. */
export function SpellInfoButton({ spell }: { spell: Spell }) {
  const levelText = spell.level === 0 ? "Truco (nivel 0)" : `Conjuro de nivel ${spell.level}`;
  return (
    <InfoButton
      title={spell.name}
      subtitle={`${levelText} · ${spell.school}`}
      body={spell.desc}
      rows={[
        { label: "Tiempo de lanzamiento", value: spell.castingTime },
        { label: "Alcance", value: spell.range },
        { label: "Duración", value: spell.duration },
        {
          label: "Concentración",
          value: spell.concentration
            ? "Sí: si te dañan y fallas la salvación de Constitución, el conjuro termina."
            : "No hace falta concentrarse.",
        },
        {
          label: "Al subir de nivel",
          value:
            spell.upcast ??
            (spell.level === 0
              ? "Este truco no mejora automáticamente; sigue las reglas de su descripción."
              : "Puedes lanzarlo con espacios de nivel superior sin efecto adicional."),
        },
      ]}
    />
  );
}
