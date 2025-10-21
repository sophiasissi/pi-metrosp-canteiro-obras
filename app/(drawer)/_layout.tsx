import React from "react";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "react-native";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#001489" />
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: "#001489" },
          headerTintColor: "#fff",
          drawerActiveTintColor: "#001489",
          drawerLabelStyle: { fontSize: 16 },
        }}
      >
        <Drawer.Screen
          name="home"
          options={{ title: "Home", drawerLabel: "Home" }}
        />
        <Drawer.Screen
          name="settings"
          options={{ title: "Configurações", drawerLabel: "Configurações" }}
        />
        <Drawer.Screen
          name="addUser"
          options={{
            title: "Adicionar Usuário",
            drawerLabel: "Adicionar Usuário",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
