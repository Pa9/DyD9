/**
 * Exportación a Excel a partir de los bloques de la ficha.
 * Cada bloque se vuelca en filas; las tablas grandes van en su propia hoja.
 */
import * as XLSX from "xlsx";
import type { SheetBlock, SheetDoc } from "./blocks";

type Row = (string | number)[];

function blockRows(block: SheetBlock): Row[] {
  const rows: Row[] = [[block.title.toUpperCase()]];
  switch (block.kind) {
    case "pairs":
    case "stats":
      for (const i of block.items) rows.push([i.label, i.value, ...(("hint" in i && i.hint) ? [i.hint] : [])]);
      break;
    case "table":
      rows.push(block.columns);
      for (const r of block.rows) rows.push(r);
      break;
    case "list":
      rows.push(["Nombre", "Detalle", "Descripción"]);
      for (const i of block.items) rows.push([i.name, i.meta ?? "", i.desc ?? ""]);
      break;
    case "text":
      rows.push([block.text]);
      break;
  }
  rows.push([]);
  return rows;
}

const OWN_SHEET = new Set(["progresion", "habilidades"]);

export function sheetToWorkbook(doc: SheetDoc): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const main: Row[] = [[doc.title], [doc.subtitle], []];

  for (const block of doc.blocks) {
    if (OWN_SHEET.has(block.id) && block.kind === "table") {
      const ws = XLSX.utils.aoa_to_sheet([block.columns, ...block.rows]);
      ws["!cols"] = block.columns.map(() => ({ wch: 22 }));
      XLSX.utils.book_append_sheet(wb, ws, block.title.slice(0, 28));
      continue;
    }
    main.push(...blockRows(block));
  }

  const ws = XLSX.utils.aoa_to_sheet(main);
  ws["!cols"] = [{ wch: 34 }, { wch: 30 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, ws, "Ficha");

  // La hoja principal debe ir primero
  const idx = wb.SheetNames.indexOf("Ficha");
  if (idx > 0) {
    wb.SheetNames.splice(idx, 1);
    wb.SheetNames.unshift("Ficha");
  }
  return wb;
}

export function downloadSheetXlsx(doc: SheetDoc, fileName: string) {
  XLSX.writeFile(sheetToWorkbook(doc), fileName);
}
