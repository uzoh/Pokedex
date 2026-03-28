import { router } from "expo-router";
import { Button, View } from "react-native";

export default function Pokedex() {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <Button
        title="Go to Pikachu details"
        onPress={() => router.push("/pokedex/pikachu")}
      />
    </View>
  );
}

