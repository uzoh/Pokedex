import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="pokedex">
        <Icon sf="list.bullet" />
        <Label>Pokedex</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favorites">
        <Icon sf="star.fill" />
        <Label>Favorites</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

