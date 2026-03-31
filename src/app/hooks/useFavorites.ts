import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import type { PokemonListItem } from "../types/pokemon";

const FAVORITES_KEY = "pokedex_favorites";

// Fallback in-memory storage for when AsyncStorage fails
let inMemoryFavorites: PokemonListItem[] = [];

export function useFavorites() {
  const [favorites, setFavorites] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        if (stored) {
          setFavorites(JSON.parse(stored));
          inMemoryFavorites = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("Failed to load favorites from AsyncStorage, using in-memory storage:", e);
        // Use in-memory storage as fallback
        setFavorites([...inMemoryFavorites]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Save to AsyncStorage whenever favorites change
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        inMemoryFavorites = favorites;
      } catch (e) {
        console.warn("Failed to save favorites to AsyncStorage, using in-memory storage:", e);
        // Fallback: keep in memory
        inMemoryFavorites = favorites;
      }
    };

    if (!loading) {
      saveFavorites();
    }
  }, [favorites, loading]);

  const isFavorite = useCallback(
    (pokemonName: string) => {
      // Check both AsyncStorage state and in-memory fallback
      return favorites.some((fav) => fav.name === pokemonName) || 
             inMemoryFavorites.some((fav) => fav.name === pokemonName);
    },
    [favorites]
  );

  const addFavorite = useCallback(
    (pokemon: PokemonListItem) => {
      if (!isFavorite(pokemon.name)) {
        const updated = [...favorites, pokemon];
        setFavorites(updated);
        inMemoryFavorites = updated;
      }
    },
    [isFavorite, favorites]
  );

  const removeFavorite = useCallback(
    (pokemonName: string) => {
      const updated = favorites.filter((fav) => fav.name !== pokemonName);
      setFavorites(updated);
      inMemoryFavorites = updated;
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (pokemon: PokemonListItem) => {
      if (isFavorite(pokemon.name)) {
        removeFavorite(pokemon.name);
      } else {
        addFavorite(pokemon);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  const reloadFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
        inMemoryFavorites = parsed;
      } else {
        setFavorites([...inMemoryFavorites]);
      }
    } catch (e) {
      console.warn("Failed to reload favorites:", e);
      setFavorites([...inMemoryFavorites]);
    }
  }, []);

  return {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    reloadFavorites,
  };
}
