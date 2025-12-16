import { useCallback } from "react";
import { useLocalStorageState } from "../useLocalStorageState.ts";

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorageState<string[]>(
    "currency-favorites",
    []
  );

  const toggleFavorite = useCallback(
    (code: string) => {
      setFavorites((current) =>
        current.includes(code)
          ? current.filter((c) => c !== code)
          : [...current, code]
      );
    },
    [setFavorites]
  );

  const isFavorite = useCallback(
    (code: string) => favorites.includes(code),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
