import { Redirect } from "expo-router";

export default function Index() {
  // Typed routes may not include group paths; runtime route still works.
  return <Redirect href={"/(tabs)/pokedex" as any} />;
}
