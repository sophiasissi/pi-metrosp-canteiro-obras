import { ThemedView } from "@/components/themed-view";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useUsers } from "../../contexts/UsersContext";
import { apiService } from "../../services/apiService";

export default function Settings() {
  const { users, getAllUsers, isLoading } = useUsers();
  const { loggedUser, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  // Carrega todos os usuários quando é admin e a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      if (isAdmin && !isLoading) {
        getAllUsers().then(() => {
          if (!hasLoadedUsers) {
            setHasLoadedUsers(true);
          }
        }).catch(error => {
          console.error('Erro ao carregar usuários:', error);
        });
      }
    }, [isAdmin, isLoading, getAllUsers, hasLoadedUsers])
  );

  // Função para filtrar usuários por CPF para administradores
  const filteredUsers = useMemo(() => {
    if (!isAdmin) return [];
    
    // Se não há query de busca, retorna todos os usuários
    if (searchQuery.length === 0) return users;
    
    // Se há query, filtra por CPF ou nome
    if (searchQuery.length >= 2) {
      return users.filter(user => 
        user.cpf.replace(/\D/g, '').includes(searchQuery.replace(/\D/g, '')) ||
        user.nomeCompleto.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return [];
  }, [searchQuery, users, isAdmin]);

  // Separar usuários por tipo
  const normalUsers = useMemo(() => 
    filteredUsers.filter(user => !user.adm), 
    [filteredUsers]
  );
  
  const adminUsers = useMemo(() => 
    filteredUsers.filter(user => user.adm), 
    [filteredUsers]
  );

  // Função para navegar para edição de dados do usuário
  function handleEditUserData(userData?: any) {
    const userToEdit = userData || loggedUser;
    if (!userToEdit) return;

    router.push({
      pathname: "/(drawer)/editUser",
      params: {
        userId: userToEdit.usuarioID?.toString() || userToEdit.id || "current",
        userName: userToEdit.nomeCompleto || userToEdit.name,
        userCpf: userToEdit.cpf,
        userGroup: userToEdit.nomeGrupo || userToEdit.group || "",
        userIsAdmin: (userToEdit.adm !== undefined ? userToEdit.adm : userToEdit.isAdmin)?.toString() || "false"
      }
    });
  }

  async function handleDeleteUser(user: any) {
    if (isDeletingUser) return;
    
    setUserToDelete(user);
    setShowDeleteModal(true);
  }

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    const userName = userToDelete.nomeCompleto || userToDelete.name;
    const userCpf = userToDelete.cpf;
    
    setIsDeletingUser(true);
    setShowDeleteModal(false);
    
    try {
      const result = await apiService.deleteUser(userCpf);
      
      if (result.success) {
        await getAllUsers();
        Alert.alert("Sucesso", `Conta de ${userName} deletada com sucesso`);
      } else {
        Alert.alert("Erro", result.error || "Erro ao deletar usuário");
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      Alert.alert("Erro", "Erro de conexão com o servidor");
    } finally {
      setIsDeletingUser(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Se não há usuário logado, redireciona para login
  if (!loggedUser) {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Para usuários comuns: só mostrar seus próprios dados */}
        {!isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Minha Conta</Text>
            
            <View style={styles.userCard}>
              <Text style={styles.userName}>{loggedUser.nomeCompleto}</Text>
              <View style={styles.userInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CPF: </Text>
                  <Text style={styles.infoValue}>{loggedUser.cpf}</Text>
                </View>
                {(loggedUser.grupoID || loggedUser.nomeGrupo) && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Grupo:</Text>
                    <Text style={styles.infoValue}>
                      {loggedUser.nomeGrupo || `Grupo ${loggedUser.grupoID}`}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.blueButton}
                  onPress={() => handleEditUserData()}
                >
                  <Text style={styles.blueButtonText}>Alterar Dados</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Para administradores: interface completa */}
        {isAdmin && (
          <>
            {/* Barra de pesquisa */}
            <View style={styles.searchCard}>
              <View style={styles.searchHeader}>
                <Text style={styles.searchTitle}>
                  🔍 Pesquisar Usuários
                </Text>
                <Text style={styles.searchSubtitle}>
                  {users.length > 0 ? `Total: ${users.length} usuários cadastrados` : 'Carregando usuários...'}
                </Text>
              </View>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar por nome ou CPF..."
                placeholderTextColor="#999"
                style={styles.searchInput}
                autoComplete="off"
              />
            </View>

            {/* Seção de Administradores */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                👑 Administradores ({adminUsers.length})
              </Text>
              
              {/* Usuário atual se for admin */}
              <View style={styles.adminUserCard}>
                <Text style={styles.adminUserName}>{loggedUser.nomeCompleto} (Você)</Text>
                <View style={styles.userInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>CPF: </Text>
                    <Text style={styles.infoValue}>{loggedUser.cpf}</Text>
                  </View>
                  {(loggedUser.grupoID || loggedUser.nomeGrupo) && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Grupo:</Text>
                      <Text style={styles.infoValue}>
                        {loggedUser.nomeGrupo || `Grupo ${loggedUser.grupoID}`}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={styles.blueButton}
                    onPress={() => handleEditUserData()}
                  >
                    <Text style={styles.blueButtonText}>Alterar Dados</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Outros administradores */}
              {adminUsers
                .filter(user => user.usuarioID !== loggedUser.usuarioID)
                .map((admin) => (
                  <View key={admin.usuarioID} style={styles.adminUserCard}>
                    <Text style={styles.adminUserName}>{admin.nomeCompleto}</Text>
                    <View style={styles.userInfo}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>CPF: </Text>
                        <Text style={styles.infoValue}>{admin.cpf}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Grupo: </Text>
                        <Text style={styles.infoValue}>{admin.nomeGrupo}</Text>
                      </View>
                    </View>

                    <View style={styles.buttonsRow}>
                      <TouchableOpacity
                        style={styles.blueButton}
                        onPress={() => handleEditUserData(admin)}
                      >
                        <Text style={styles.blueButtonText}>Alterar Dados</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.redButton}
                        onPress={() => handleDeleteUser(admin)}
                      >
                        <Text style={styles.redButtonText}>Deletar Conta</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>

            {/* Seção de Usuários Normais */}
            {normalUsers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  👤 Usuários Normais ({normalUsers.length})
                </Text>
                
                {normalUsers.map((normalUser) => (
                  <View key={normalUser.usuarioID} style={styles.userCard}>
                    <Text style={styles.userName}>{normalUser.nomeCompleto}</Text>
                    <View style={styles.userInfo}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>CPF: </Text>
                        <Text style={styles.infoValue}>{normalUser.cpf}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Grupo: </Text>
                        <Text style={styles.infoValue}>{normalUser.nomeGrupo}</Text>
                      </View>
                    </View>

                    <View style={styles.buttonsRow}>
                      <TouchableOpacity
                        style={styles.blueButton}
                        onPress={() => handleEditUserData(normalUser)}
                      >
                        <Text style={styles.blueButtonText}>Alterar Dados</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.redButton}
                        onPress={() => handleDeleteUser(normalUser)}
                      >
                        <Text style={styles.redButtonText}>Deletar Conta</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal de confirmação de exclusão */}
      <Modal
        transparent={true}
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja deletar a conta de{" "}
              <Text style={styles.modalUserName}>
                {userToDelete?.nomeCompleto || userToDelete?.name}
              </Text>
              ?
            </Text>
            <Text style={styles.modalWarning}>
              Esta ação não pode ser desfeita.
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={confirmDelete}
                disabled={isDeletingUser}
              >
                <Text style={styles.modalDeleteButtonText}>
                  {isDeletingUser ? "Deletando..." : "Deletar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001489",
    marginBottom: 15,
  },
  searchCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchHeader: {
    marginBottom: 12,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#001489",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  noResults: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 12,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  adminUserCard: {
    backgroundColor: "#fff8e1",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffc107",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  adminUserName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f57c00",
    marginBottom: 8,
  },
  userInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: "500",
    color: "#666",
    minWidth: 60,
  },
  infoValue: {
    flex: 1,
    color: "#333",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  blueButton: {
    flex: 1,
    backgroundColor: "#001489",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  blueButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  redButton: {
    flex: 1,
    backgroundColor: "#d32f2f",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  redButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: "#666",
    fontSize: 16,
    fontStyle: 'italic',
  },
  searchSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    fontStyle: 'italic',
  },
  searchHint: {
    textAlign: "center",
    color: "#FFA726",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 12,
    padding: 8,
    backgroundColor: "#FFF3E0",
    borderRadius: 6,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#001489",
    marginTop: 16,
    marginBottom: 12,
  },
  searchGuide: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#001489",
  },
  searchGuideTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#001489",
    marginBottom: 8,
  },
  searchGuideText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
  // Estilos do modal de confirmação
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 22,
  },
  modalUserName: {
    fontWeight: "600",
    color: "#001489",
  },
  modalWarning: {
    fontSize: 14,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 24,
    fontStyle: "italic",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalDeleteButtonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});