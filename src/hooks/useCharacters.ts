import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { store } from "@/lib/storage";
import type { Character } from "@/lib/types";

const EMPTY: Character[] = [];

/** true solo después de la hidratación en el cliente (evita desajustes SSR) */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function useCharacters(): Character[] {
  const hydrated = useHydrated();
  const all = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return hydrated ? all : EMPTY;
}

export function useCharacter(id: string): {
  character: Character | undefined;
  update: (patch: Partial<Character> | ((c: Character) => Partial<Character>)) => void;
  loading: boolean;
} {
  const hydrated = useHydrated();
  const all = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const character = hydrated ? all.find((c) => c.id === id) : undefined;
  const update = useCallback(
    (patch: Partial<Character> | ((c: Character) => Partial<Character>)) => store.update(id, patch),
    [id],
  );
  return { character, update, loading: !hydrated };
}
