import { useCallback, useSyncExternalStore } from "react";
import { store } from "@/lib/storage";
import type { Character } from "@/lib/types";

export function useCharacters(): Character[] {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

export function useCharacter(id: string): {
  character: Character | undefined;
  update: (patch: Partial<Character> | ((c: Character) => Partial<Character>)) => void;
  loading: boolean;
} {
  const all = useCharacters();
  const character = all.find((c) => c.id === id);
  const update = useCallback(
    (patch: Partial<Character> | ((c: Character) => Partial<Character>)) => store.update(id, patch),
    [id],
  );
  return { character, update, loading: typeof window === "undefined" };
}
