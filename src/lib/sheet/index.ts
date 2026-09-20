export { buildSheetModel } from "./model";
export { buildSheetDoc } from "./blocks";
export type { SheetBlock, SheetDoc } from "./blocks";
export { downloadSheetPdf, sheetToPdf } from "./export-pdf";
export { downloadSheetXlsx, sheetToWorkbook } from "./export-xlsx";

export function sheetFileName(name: string, ext: string): string {
  const slug =
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "ficha";
  return `ficha-${slug}.${ext}`;
}
