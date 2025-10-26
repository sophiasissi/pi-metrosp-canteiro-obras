import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Alert, StatusBar, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialIcons";
import HeaderWithLogo from "../../components/header-with-logo";

function CustomDrawerContent(props: any) {
  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair do aplicativo?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            if (props.navigation?.closeDrawer) props.navigation.closeDrawer();

            setTimeout(() => {
              router.replace("/(auth)/login");
            }, 300);
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <DrawerItem
          label="Página Inicial"
          onPress={() => router.push("/(drawer)/home")}
          icon={({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          )}
          labelStyle={styles.drawerLabel}
          activeTintColor="#001489"
        />
        <DrawerItem
          label="Configurações"
          onPress={() => router.push("/(drawer)/settings")}
          icon={({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          )}
          labelStyle={styles.drawerLabel}
          activeTintColor="#001489"
        />
        <DrawerItem
          label="Adicionar Usuário"
          onPress={() => router.push("/(drawer)/signUp")}
          icon={({ color, size }) => (
            <Icon name="person-add" size={size} color={color} />
          )}
          labelStyle={styles.drawerLabel}
          activeTintColor="#001489"
        />
      </DrawerContentScrollView>

      <View style={styles.logoutContainer}>
        <DrawerItem
          label="Sair"
          onPress={() => router.push("/(drawer)/logout")}
          icon={({ color, size }) => (
            <Icon name="logout" size={size} color="#D50000" />
          )}
          labelStyle={[styles.drawerLabel, { color: "#D50000" }]}
        />
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#001489" />
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: "#001489" },
          headerTintColor: "#fff",
          drawerActiveTintColor: "#001489",
          drawerLabelStyle: { fontSize: 16 },
          headerRight: () => <HeaderWithLogo />,
        }}
      >
        <Drawer.Screen
          name="home"
          options={{
            title: "Página Inicial",
            drawerLabel: "Página Inicial",
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Configurações",
            drawerLabel: "Configurações",
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="signUp"
          options={{
            title: "Adicionar Usuário",
            drawerLabel: "Adicionar Usuário",
            drawerItemStyle: { display: "none" },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
    marginTop: 10,
  },
  logoutItem: {
    marginVertical: 0,
  },
});
