import { Image } from "expo-image";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useFavorites } from "../../hooks/useFavorites";
import {
  spriteUrlForPokemonUrl
} from "../../lib/pokeapi";
import type { PokemonListItem } from "../../types/pokemon";

export default function Favorites() {
  const router = useRouter();
  const { favorites, loading, reloadFavorites } = useFavorites();
  const [displayFavorites, setDisplayFavorites] = useState<PokemonListItem[]>([]);

  // Reload and update favorites when route is focused
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        await reloadFavorites();
      };
      loadData();
    }, [reloadFavorites])
  );

  // Update displayed favorites when favorites change
  useEffect(() => {
    setDisplayFavorites(favorites);
  }, [favorites]);

  if (loading) {
    return (
      <View style={[styles.centered, styles.screen]}>
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (displayFavorites.length === 0) {
    return (
      <View style={[styles.centered, styles.screen]}>
        <Text style={styles.emptyText}>No favorites yet</Text>
        <Text style={styles.emptySubText}>Mark Pokémon as favorites to see them here</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      data={displayFavorites}
      keyExtractor={(item) => item.name}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Favorites</Text>
          <Text style={styles.headerSubtitle}>{displayFavorites.length} Pokémon</Text>
        </View>
      }
      renderItem={({ item }) => {
        const label = item.name.charAt(0).toUpperCase() + item.name.slice(1);
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
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 24,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  sprite: {
    width: 56,
    height: 56,
    marginRight: 12,
  },
  spritePlaceholder: {
    width: 56,
    height: 56,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
  },
  name: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});

