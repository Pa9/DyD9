/**
 * Renderizador visual de la ficha en A4 (una cara por bloque de contenido).
 * Consume únicamente SheetDoc, así que puede sustituirse por completo
 * sin tocar la lógica de reglas ni las exportaciones.
 */
import type { SheetBlock, SheetDoc } from "@/lib/sheet/blocks";

export function SheetView({ doc }: { doc: SheetDoc }) {
  return (
    <div className="sheet-page mx-auto w-full max-w-[210mm] rounded-lg border border-border bg-card px-6 py-8 sm:px-10">
      <header className="mb-6 border-b border-primary/40 pb-4">
        <h1 className="font-display text-3xl tracking-wide">{doc.title}</h1>
        <p className="mt-1 text-sm italic text-muted-foreground">{doc.subtitle}</p>
      </header>
      <div className="space-y-6">
        {doc.blocks.map((b) => (
          <BlockView key={b.id} block={b} />
        ))}
      </div>
    </div>
  );
}

function BlockView({ block }: { block: SheetBlock }) {
  return (
    <section className="sheet-block break-inside-avoid">
      <h2 className="heading-rune mb-2 border-b border-border pb-1">{block.title}</h2>
      {block.kind === "stats" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {block.items.map((i) => (
            <div key={i.label} className="stat-block px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{i.label}</p>
              <p className="font-display text-base">{i.value}</p>
              {i.hint ? <p className="text-[10px] text-muted-foreground">{i.hint}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {block.kind === "pairs" ? (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {block.items.map((i) => (
            <div
              key={i.label}
              className="flex justify-between gap-3 border-b border-dashed border-border/60 py-1"
            >
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{i.label}</dt>
              <dd className="text-right text-sm">{i.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {block.kind === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {block.columns.map((c) => (
                  <th
                    key={c}
                    className="border-b border-border px-2 py-1 text-left text-[11px] uppercase tracking-wide text-muted-foreground"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="align-top">
                  {row.map((cell, ci) => (
                    <td key={ci} className="border-b border-border/50 px-2 py-1 text-xs">
                      {cell || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {block.kind === "list" ? (
        <ul className="space-y-2">
          {block.items.map((i) => (
            <li key={i.name} className="stat-block break-inside-avoid p-3">
              <p className="font-display text-sm">{i.name}</p>
              {i.meta ? <p className="text-[11px] italic text-muted-foreground">{i.meta}</p> : null}
              {i.desc ? (
                <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                  {i.desc}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {block.kind === "text" ? (
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {block.text}
        </p>
      ) : null}
    </section>
  );
}
