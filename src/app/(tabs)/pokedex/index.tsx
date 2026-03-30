import { Image } from "expo-image";
import { useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  fetchPokemonList,
  spriteUrlForPokemonUrl
} from "../../lib/pokeapi";
import type { PokemonListItem } from "../../types/pokemon";

const ITEMS_PER_PAGE = 30;

export default function Pokedex() {
  const router = useRouter();
  const [items, setItems] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const inFlightRef = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    const data = await fetchPokemonList(ITEMS_PER_PAGE, 0);
    setItems(data.results);
    setOffset(ITEMS_PER_PAGE);
    setHasMore(data.hasMore);
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
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const loadMore = useCallback(async () => {
    if (!hasMore || inFlightRef.current) return;
    inFlightRef.current = true;
    setLoadingMore(true);
    try {
      const data = await fetchPokemonList(ITEMS_PER_PAGE, offset);
      setItems((prev) => [...prev, ...data.results]);
      setOffset((prev) => prev + ITEMS_PER_PAGE);
      setHasMore(data.hasMore);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      inFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [offset, hasMore]);

  const retry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [load]);

  const retryLoadMore = useCallback(() => {
    inFlightRef.current = false;
    loadMore();
  }, [loadMore]);

  if (loading && items.length === 0) {
    return (
      <View style={[styles.centered, styles.screen]}>
        <ActivityIndicator size="large" color="#ef5350" />
      </View>
    );
  }

  if (error && items.length === 0) {
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
      data={items}
      keyExtractor={(item) => item.name}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        error && items.length > 0 ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
            <Pressable
              style={styles.errorRetry}
              onPress={retryLoadMore}
            >
              <Text style={styles.errorRetryLabel}>Retry</Text>
            </Pressable>
          </View>
        ) : null
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color="#ef5350" />
          </View>
        ) : null
      }
      renderItem={({ item }) => {
        const label =
          item.name.charAt(0).toUpperCase() + item.name.slice(1);
        const sprite = spriteUrlForPokemonUrl(item.url);
        return (
          <Pressable
            style={styles.row}
            onPress={() =>
              router.push({
                pathname: "/pokedex/[pokemon]",
                params: { pokemon: item.name },
              } as unknown as Href)
            }
          >
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
  sprite: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  spritePlaceholder: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
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
});
