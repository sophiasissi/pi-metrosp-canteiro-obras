import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function Logout() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { width } = Dimensions.get("window");
  const isSmallScreen = width < 400;

  useEffect(() => {
    // Mostra o modal de confirmação assim que a tela é carregada
    setShowLogoutModal(true);
  }, []);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    // Pequeno delay para permitir que o modal feche antes de navegar
    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 100);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
    // Redireciona para Home ao cancelar
    router.replace("/(drawer)/home");
  };

  return (
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
            Tem certeza que deseja sair?
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
  );
}

const styles = StyleSheet.create({
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