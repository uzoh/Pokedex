import { Stack } from "expo-router";

export default function PokedexLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1a1a1a",
        },
        headerTintColor: "#ef5350",
        headerTitleStyle: {
          fontWeight: "600",
          color: "#fff",
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Pokedex" }} />
      <Stack.Screen name="[pokemon]" options={{ title: "Details" }} />
    </Stack>
  );
}

