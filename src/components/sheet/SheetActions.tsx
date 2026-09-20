import { FileSpreadsheet, FileText, Printer, ScrollText } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  buildSheetDoc,
  buildSheetModel,
  downloadSheetPdf,
  downloadSheetXlsx,
  sheetFileName,
} from "@/lib/sheet";
import type { Character } from "@/lib/types";

export function SheetActions({
  character,
  showView = true,
}: {
  character: Character;
  showView?: boolean;
}) {
  const doc = () => buildSheetDoc(buildSheetModel(character));

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      {showView ? (
        <Button asChild size="sm">
          <Link to="/ficha/$id" params={{ id: character.id }}>
            <ScrollText className="size-4" /> Ver ficha
          </Link>
        </Button>
      ) : null}
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          try {
            downloadSheetPdf(doc(), sheetFileName(character.name, "pdf"));
            toast.success("PDF descargado");
          } catch {
            toast.error("No se pudo generar el PDF");
          }
        }}
      >
        <FileText className="size-4" /> Descargar PDF
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          try {
            downloadSheetXlsx(doc(), sheetFileName(character.name, "xlsx"));
            toast.success("Excel descargado");
          } catch {
            toast.error("No se pudo generar el Excel");
          }
        }}
      >
        <FileSpreadsheet className="size-4" /> Exportar a Excel
      </Button>
      <Button size="sm" variant="outline" onClick={() => window.print()}>
        <Printer className="size-4" /> Imprimir ficha
      </Button>
    </div>
  );
}
