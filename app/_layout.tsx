import { Stack } from "expo-router";
import { ProjectProvider } from "../contexts/ProjectContext";

export default function RootLayout() {
  return (
    <ProjectProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(drawer)" />
      </Stack>
    </ProjectProvider>
  );
}