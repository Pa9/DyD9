/**
 * Exportación a PDF (A4) a partir de los bloques de la ficha.
 * Es un renderizador: no conoce las reglas de D&D, sólo dibuja bloques.
 */
import { jsPDF } from "jspdf";
import type { SheetBlock, SheetDoc } from "./blocks";

const PAGE_W = 210;
const PAGE_H = 297;
const M = 14;
const CONTENT_W = PAGE_W - M * 2;

/** Las fuentes base de jsPDF sólo cubren Latin-1: sustituimos glifos ajenos. */
const GLYPHS: [RegExp, string][] = [
  [/[→⟶]/g, "-"],
  [/[←⟵]/g, "*"],
  [/[◆◇•]/g, "-"],
  [/[’‘]/g, "'"],
  [/[“”]/g, '"'],
  [/[–—]/g, "-"],
  [/…/g, "..."],
];

const ascii = (v: string) => GLYPHS.reduce((acc, [re, rep]) => acc.replace(re, rep), v);

export function sheetToPdf(doc: SheetDoc): jsPDF {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = M;

  const ensure = (needed: number) => {
    if (y + needed > PAGE_H - M) {
      pdf.addPage();
      y = M;
    }
  };

  const text = (value: string, size: number, style: "normal" | "bold" | "italic", width = CONTENT_W, x = M) => {
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(ascii(value), width) as string[];
    const lh = size * 0.42;
    for (const line of lines) {
      ensure(lh + 1);
      pdf.text(line, x, y);
      y += lh;
    }
  };

  // Cabecera
  text(doc.title, 22, "bold");
  y += 1;
  text(doc.subtitle, 11, "italic");
  y += 2;
  pdf.setDrawColor(150, 120, 60);
  pdf.line(M, y, PAGE_W - M, y);
  y += 6;

  for (const block of doc.blocks) {
    ensure(14);
    text(block.title.toUpperCase(), 12, "bold");
    y += 1;
    pdf.setDrawColor(210, 200, 180);
    pdf.line(M, y - 2, PAGE_W - M, y - 2);
    y += 1.5;
    renderBlock(pdf, block, { text, ensure, getY: () => y, setY: (v) => (y = v) });
    y += 5;
  }

  return pdf;
}

interface Ctx {
  text: (value: string, size: number, style: "normal" | "bold" | "italic", width?: number, x?: number) => void;
  ensure: (needed: number) => void;
  getY: () => number;
  setY: (v: number) => void;
}

function renderBlock(pdf: jsPDF, block: SheetBlock, ctx: Ctx) {
  switch (block.kind) {
    case "pairs":
    case "stats": {
      const col = CONTENT_W / 2;
      let i = 0;
      for (const item of block.items) {
        const x = M + (i % 2) * col;
        if (i % 2 === 0) ctx.ensure(6);
        const y = ctx.getY();
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.text(ascii(`${item.label}:`), x, y);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        const labelW = pdf.getTextWidth(`${item.label}: `) + 1;
        const value = pdf.splitTextToSize(ascii(String(item.value)), col - labelW - 3) as string[];
        pdf.text(value[0] ?? "", x + labelW, y);
        if (i % 2 === 1 || i === block.items.length - 1) ctx.setY(y + 5);
        i++;
      }
      break;
    }
    case "table": {
      const widths = columnWidths(block.columns.length, block.id);
      const header = () => {
        ctx.ensure(6);
        let x = M;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        const y = ctx.getY();
        block.columns.forEach((c, i) => {
          pdf.text(ascii(c), x, y);
          x += widths[i]!;
        });
        ctx.setY(y + 4);
      };
      header();
      pdf.setFont("helvetica", "normal");
      for (const row of block.rows) {
        const cells = row.map((cell, i) => pdf.splitTextToSize(ascii(cell || "-"), widths[i]! - 2) as string[]);
        const h = Math.max(...cells.map((c) => c.length)) * 3.4 + 1.5;
        if (ctx.getY() + h > PAGE_H - M) {
          pdf.addPage();
          ctx.setY(M);
          header();
          pdf.setFont("helvetica", "normal");
        }
        const y0 = ctx.getY();
        let x = M;
        pdf.setFontSize(8);
        cells.forEach((lines, i) => {
          lines.forEach((line, li) => pdf.text(line, x, y0 + li * 3.4));
          x += widths[i]!;
        });
        ctx.setY(y0 + h);
      }
      break;
    }
    case "list": {
      for (const item of block.items) {
        ctx.ensure(8);
        ctx.text(item.name, 10, "bold");
        if (item.meta) ctx.text(item.meta, 8, "italic");
        if (item.desc) ctx.text(item.desc, 8.5, "normal");
        ctx.setY(ctx.getY() + 2);
      }
      break;
    }
    case "text": {
      ctx.text(block.text, 9, "normal");
      break;
    }
  }
}

function columnWidths(count: number, id: string): number[] {
  if (id === "progresion") {
    const rel = [12, 16, 14, 76, 14, 20, 30];
    const total = rel.reduce((a, b) => a + b, 0);
    return rel.map((r) => (r / total) * CONTENT_W);
  }
  if (count === 3) return [CONTENT_W * 0.45, CONTENT_W * 0.2, CONTENT_W * 0.35];
  const base = CONTENT_W / count;
  return Array.from({ length: count }, () => base);
}

export function downloadSheetPdf(doc: SheetDoc, fileName: string) {
  sheetToPdf(doc).save(fileName);
}
