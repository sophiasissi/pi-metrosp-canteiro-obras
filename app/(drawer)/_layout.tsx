import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialIcons";
import HeaderWithLogo from "../../components/header-with-logo";
import { useAuth } from "../../contexts/AuthContext";

function CustomDrawerContent(props: any) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { width } = Dimensions.get("window");
  const isSmallScreen = width < 400;
  const { isAdmin, logout } = useAuth();

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    if (props.navigation?.closeDrawer) props.navigation.closeDrawer();
    
    // Chama o logout do contexto de autenticação
    logout();
    
    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 300);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
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
        {/* Só mostra "Adicionar Usuário" se for administrador */}
        {isAdmin && (
          <DrawerItem
            label="Adicionar Usuário"
            onPress={() => router.push("/(drawer)/signUp")}
            icon={({ color, size }) => (
              <Icon name="person-add" size={size} color={color} />
            )}
            labelStyle={styles.drawerLabel}
            activeTintColor="#001489"
          />
        )}
      </DrawerContentScrollView>

      <View style={styles.logoutContainer}>
        <DrawerItem
          label="Sair"
          onPress={handleLogout}
          icon={({ color, size }) => (
            <Icon name="logout" size={size} color="#D50000" />
          )}
          labelStyle={[styles.drawerLabel, { color: "#D50000" }]}
        />
      </View>

      {/* Modal de Confirmação de Logout */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={handleCancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                width: isSmallScreen ? "90%" : 350,
                padding: isSmallScreen ? 24 : 20,
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.logoutIcon}>🚪</Text>
            </View>
            
            <Text style={[styles.modalTitle, { fontSize: isSmallScreen ? 20 : 18 }]}>
              Confirmar Saída
            </Text>
            
            <Text style={styles.modalMessage}>
              Tem certeza que deseja sair da aplicação?
            </Text>
            
            <Text style={styles.modalSubMessage}>
              Você precisará fazer login novamente para acessar o sistema.
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.cancelButton, styles.modalButton]}
                onPress={handleCancelLogout}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, styles.modalButton]}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.confirmButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
        <Drawer.Screen
          name="editUser"
          options={{
            title: "Editar Usuário",
            drawerLabel: "Editar Usuário",
            drawerItemStyle: { display: "none" },
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => router.back()}
                style={{ marginLeft: 16, padding: 8 }}
              >
                <Icon 
                  name="arrow-back" 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
            ),
            swipeEnabled: false,
          }}
        />
        <Drawer.Screen
          name="addProject"
          options={{
            title: "Adicionar Projeto",
            drawerLabel: "Adicionar Projeto",
          }}
        />
        <Drawer.Screen
          name="addProgress"
          options={{
            title: "Adicionar Progresso",
            drawerLabel: "Adicionar Progresso",
          }}
        />
        <Drawer.Screen
          name="projectDetails"
          options={{
            title: "Detalhes do Projeto",
            drawerLabel: "Detalhes do Projeto",
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => router.back()}
                style={{ marginLeft: 16, padding: 8 }}
              >
                <Icon 
                  name="arrow-back" 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
            ),
            swipeEnabled: false,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  logoutIcon: {
    fontSize: 48,
    textAlign: "center",
  },
  modalTitle: {
    fontWeight: "700",
    marginBottom: 15,
    color: "#082A85",
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
  modalSubMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#CFCFCF",
  },
  confirmButton: {
    backgroundColor: "#D50000",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});