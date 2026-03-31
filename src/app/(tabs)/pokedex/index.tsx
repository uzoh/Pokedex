import { Image } from "expo-image";
import { useRouter, type Href, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  fetchPokemonList,
  spriteUrlForPokemonUrl
} from "../../lib/pokeapi";
import { useFavorites } from "../../hooks/useFavorites";
import type { PokemonListItem } from "../../types/pokemon";

const ITEMS_PER_PAGE = 30;
const TOTAL_TO_LOAD = 150;

export default function Pokedex() {
  const router = useRouter();
  const { isFavorite, reloadFavorites } = useFavorites();
  const [allItems, setAllItems] = useState<PokemonListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const inFlightRef = useRef(false);

  // Refresh favorites when returning to this page
  useFocusEffect(
    useCallback(() => {
      reloadFavorites();
      setRefreshKey((prev) => prev + 1);
    }, [reloadFavorites])
  );

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter items based on debounced search query
  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return allItems;
    }
    const query = debouncedQuery.toLowerCase();
    return allItems.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [allItems, debouncedQuery]);

  const load = useCallback(async () => {
    setError(null);
    try {
      // Load all 150 Pokemon at once (5 batches of 30)
      const batches = Math.ceil(TOTAL_TO_LOAD / ITEMS_PER_PAGE);
      let allResults: PokemonListItem[] = [];

      for (let i = 0; i < batches; i++) {
        const offset = i * ITEMS_PER_PAGE;
        const data = await fetchPokemonList(ITEMS_PER_PAGE, offset);
        allResults = [...allResults, ...data.results];
      }

      // Only keep first 150
      setAllItems(allResults.slice(0, TOTAL_TO_LOAD));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load Pokémon");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load Pokémon");
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const retry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load Pokémon");
    } finally {
      setLoading(false);
    }
  }, [load]);

  const onScroll = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  if (loading && allItems.length === 0) {
    return (
      <View style={[styles.centered, styles.screen]}>
        <ActivityIndicator size="large" color="#ef5350" />
      </View>
    );
  }

  if (error && allItems.length === 0) {
    return (
      <View style={[styles.centered, styles.screen]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retry} onPress={retry}>
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      data={filteredItems}
      keyExtractor={(item) => item.name}
      contentContainerStyle={styles.listContent}
      scrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={onScroll}
      onMomentumScrollBegin={onScroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Pokémon..."
              placeholderTextColor="#555"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Error Banner */}
          {error && allItems.length > 0 ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {/* No Results Message */}
          {filteredItems.length === 0 && allItems.length > 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No Pokémon found</Text>
            </View>
          ) : null}
        </>
      }
      renderItem={({ item }) => {
        const label = item.name.charAt(0).toUpperCase() + item.name.slice(1);
        const sprite = spriteUrlForPokemonUrl(item.url);
        const favorited = isFavorite(item.name);
        return (
          <Pressable
            style={[styles.row, favorited && styles.rowFavorited]}
            onPress={() =>
              router.push({
                pathname: "/pokedex/[pokemon]",
                params: { pokemon: item.name },
              } as unknown as Href)
            }
          >
            <View style={styles.spriteContainer}>
              {sprite ? (
                <Image
                  source={{ uri: sprite }}
                  style={styles.sprite}
                  contentFit="contain"
                  transition={150}
                />
              ) : (
                <View style={styles.spritePlaceholder} />
              )}
              {favorited && (
                <View style={styles.favoriteStarBadge}>
                  <Text style={styles.favoriteStarText}>★</Text>
                </View>
              )}
            </View>
            <Text style={styles.name}>{label}</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#121212",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: "#c62828",
    textAlign: "center",
    marginBottom: 12,
  },
  retry: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ef5350",
    borderRadius: 8,
  },
  retryLabel: {
    color: "#fff",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  rowFavorited: {
    backgroundColor: "#1a1a1a",
  },
  spriteContainer: {
    position: "relative",
    marginRight: 12,
  },
  sprite: {
    width: 48,
    height: 48,
  },
  spritePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
  },
  favoriteStarBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef5350",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#121212",
  },
  favoriteStarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  name: {
    fontSize: 16,
    color: "#fff",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#c62828",
    borderRadius: 8,
  },
  errorBannerText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    marginRight: 12,
  },
  errorRetry: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  errorRetryLabel: {
    color: "#c62828",
    fontWeight: "600",
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#0F0F0F",
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "#333",
  },
  noResults: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  noResultsText: {
    color: "#888",
    fontSize: 16,
  },
});
