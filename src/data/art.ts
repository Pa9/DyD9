/** Ilustraciones opcionales por id de contenido. Si no hay imagen, la UI muestra un icono. */
const files = import.meta.glob("../assets/art/*.jpg", { eager: true, import: "default" }) as Record<
  string,
  string
>;

const ART: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const name = path.split("/").pop()!.replace(/\.jpg$/, "");
  ART[name] = url;
}

export function classArt(id: string | null | undefined): string | undefined {
  return id ? ART[`class-${id}`] : undefined;
}
export function speciesArt(id: string | null | undefined): string | undefined {
  return id ? ART[`species-${id}`] : undefined;
}
