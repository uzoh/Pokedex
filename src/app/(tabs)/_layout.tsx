import Ionicons from "@expo/vector-icons/Ionicons";
import { Icon, Label, NativeTabs, VectorIcon } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <NativeTabs
      barTintColor="#121212"
      tintColor="#ef5350"
      unselectedTintColor="#888"
    >
      <NativeTabs.Trigger name="pokedex">
        <Icon
          {...(Platform.OS === "web"
            ? {
                src: <VectorIcon family={Ionicons} name="list" />,
              }
            : {
                sf: "list.bullet",
                drawable: "ic_menu_view",
              })}
        />
        <Label>Pokedex</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favorites">
        <Icon
          {...(Platform.OS === "web"
            ? {
                src: <VectorIcon family={Ionicons} name="star" />,
              }
            : {
                sf: "star.fill",
                drawable: "star_big_on",
              })}
        />
        <Label>Favorites</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

