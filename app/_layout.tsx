import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { ProjectProvider } from "../contexts/ProjectContext";
import { UsersProvider } from "../contexts/UsersContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <UsersProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(drawer)" />
          </Stack>
        </UsersProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}