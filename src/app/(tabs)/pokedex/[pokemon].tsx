import { useLocalSearchParams } from "expo-router";

export default function PokemonDetails() {
  useLocalSearchParams<{ pokemon?: string }>();
  return null;
}

