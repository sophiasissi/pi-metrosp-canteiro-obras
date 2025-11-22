import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useProjects } from "../../contexts/ProjectContext";
import { useUsers } from "../../contexts/UsersContext";

export default function Settings() {
  const { projects } = useProjects();
  const { users, getAvailableGroups, hasUsers } = useUsers();

  const [user, setUser] = useState({
    name: "Sophia Sissi Curcio Guedes",
    group: "amarelo",
    cpf: "384.645.928-33", // CPF do usuário atual
    isAdmin: true, // O usuário atual é admin para poder acessar esta funcionalidade
  });


  const [showDeleteModal, setShowDeleteModal] = useState(false);


  const [searchQuery, setSearchQuery] = useState("");



  // Função para filtrar usuários por nome
  const filteredUsers = useMemo(() => {
    if (searchQuery.length < 3) return [];
    
    return users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  const { width, height } = Dimensions.get("window");
  const isSmallScreen = width < 400;

  function openDeleteModal() {
    setShowDeleteModal(true);
  }

  function handleConfirmDelete() {
    setShowDeleteModal(false);
    Alert.alert(
      "Conta Deletada",
      "A conta foi deletada com sucesso"
    );
  }

  // Função para navegar para edição de dados do usuário
  function handleEditUserData(userData: any) {
    // Navega para a tela de signUp passando os dados do usuário para edição
    router.push({
      pathname: "/(drawer)/signUp",
      params: {
        editMode: "true",
        userId: userData.id || "current",
        userName: userData.name,
        userCpf: userData.cpf,
        userGroup: userData.group,
        userIsAdmin: userData.isAdmin?.toString() || "false"
      }
    });
  }

  function handleSearchUserDeleteAction(foundUser: any) {
    Alert.alert(
      "Deletar Usuário",
      `Tem certeza que deseja deletar a conta de ${foundUser.name}?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Deletar", 
          style: "destructive",
          onPress: () => {
            Alert.alert("Sucesso", `Conta de ${foundUser.name} deletada com sucesso`);
          }
        }
      ]
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => setUser(prev => ({...prev, isAdmin: !prev.isAdmin}))}
            style={styles.roleToggle}
            accessibilityLabel="Trocar tipo de conta"
          >
            <Text style={styles.roleToggleText}>
              {user.isAdmin ? "Administrador" : "Usuário"}
            </Text>
          </TouchableOpacity>
        </View>

        {user.isAdmin && (
          <View style={styles.searchCard}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>Pesquisar Usuário</Text>
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Digite nome (mín. 3 caracteres)"
              placeholderTextColor="#999"
              style={styles.searchInput}
              autoCapitalize="none"
              autoComplete="off"
            />

            {searchQuery.length > 2 && (
              <>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((foundUser) => (
                  <View key={foundUser.id} style={styles.resultCard}>
                    <Text style={styles.userName}>{foundUser.name}</Text>
                    <View style={styles.userInfo}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nome: </Text>
                        <Text style={styles.infoValue}>{foundUser.name}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>CPF: </Text>
                        <Text style={styles.infoValue}>{foundUser.cpf}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Grupo: </Text>
                        <Text style={styles.infoValue}>{foundUser.group}</Text>
                      </View>
                    </View>

                    <View style={styles.buttonsRow}>
                      <TouchableOpacity
                        style={styles.blueButton}
                        onPress={() => handleEditUserData(foundUser)}
                      >
                        <Text style={styles.blueButtonText}>Alterar Dados</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.redButton}
                        onPress={() => handleSearchUserDeleteAction(foundUser)}
                      >
                        <Text style={styles.redButtonText}>Deletar Conta</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  ))
                ) : (
                  <View style={styles.noResultsCard}>
                    <Text style={styles.noResultsText}>
                      {searchQuery.length >= 2 ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
                    </Text>
                    <Text style={styles.noResultsSubtext}>
                      Tente buscar por nome diferente
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Lista de usuários (sempre visível no modo Admin) */}
            {searchQuery.length <= 2 && (
              <View style={styles.allUsersContainer}>
                <Text style={styles.allUsersTitle}>Todos os Usuários Cadastrados</Text>
                
                {/* Seção de Administradores */}
                <Text style={styles.sectionTitle}>👑 Administradores</Text>
                
                {/* Usuário atual se for admin */}
                {user.isAdmin && (
                  <View style={styles.adminUserCard}>
                    <View style={styles.currentUserBadge}>
                      <Text style={styles.currentUserBadgeText}>👤 Você</Text>
                    </View>
                    <Text style={styles.adminUserName}>{user.name}</Text>
                    <View style={styles.userInfo}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>CPF: </Text>
                        <Text style={styles.infoValue}>{user.cpf}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Grupo: </Text>
                        <Text style={styles.infoValue}>{user.group}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Outros administradores */}
                {users.filter(registeredUser => 
                  registeredUser.isAdmin && registeredUser.cpf !== user.cpf
                ).map((registeredUser) => (
                  <View key={registeredUser.id} style={styles.adminUserCard}>
                    <Text style={styles.adminUserName}>{registeredUser.name}</Text>
                    <View style={styles.userInfo}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nome: </Text>
                        <Text style={styles.infoValue}>{registeredUser.name}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>CPF: </Text>
                        <Text style={styles.infoValue}>{registeredUser.cpf}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Grupo: </Text>
                        <Text style={styles.infoValue}>{registeredUser.group}</Text>
                      </View>
                    </View>

                    <View style={styles.buttonsRow}>
                      <TouchableOpacity
                        style={styles.blueButton}
                        onPress={() => handleEditUserData(registeredUser)}
                      >
                        <Text style={styles.blueButtonText}>Alterar Dados</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.redButton}
                        onPress={() => handleSearchUserDeleteAction(registeredUser)}
                      >
                        <Text style={styles.redButtonText}>Deletar Conta</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Seção de Usuários Normais */}
                {users.some(user => !user.isAdmin) && (
                  <>
                    <Text style={styles.sectionTitle}>👤 Usuários</Text>
                    
                    {/* Usuário atual se não for admin */}
                    {!user.isAdmin && (
                      <View style={styles.normalUserCard}>
                        <View style={styles.currentUserBadge}>
                          <Text style={styles.currentUserBadgeText}>👤 Você</Text>
                        </View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <View style={styles.userInfo}>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>CPF: </Text>
                            <Text style={styles.infoValue}>{user.cpf}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Grupo: </Text>
                            <Text style={styles.infoValue}>{user.group}</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Outros usuários normais */}
                    {users.filter(registeredUser => 
                      !registeredUser.isAdmin && registeredUser.cpf !== user.cpf
                    ).map((registeredUser) => (
                      <View key={registeredUser.id} style={styles.normalUserCard}>
                        <Text style={styles.userName}>{registeredUser.name}</Text>
                        <View style={styles.userInfo}>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>CPF: </Text>
                            <Text style={styles.infoValue}>{registeredUser.cpf}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Grupo: </Text>
                            <Text style={styles.infoValue}>{registeredUser.group}</Text>
                          </View>
                        </View>

                        <View style={styles.buttonsRow}>
                          <TouchableOpacity
                            style={styles.blueButton}
                            onPress={() => handleEditUserData(registeredUser)}
                          >
                            <Text style={styles.blueButtonText}>Alterar Dados</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.redButton}
                            onPress={() => handleSearchUserDeleteAction(registeredUser)}
                          >
                            <Text style={styles.redButtonText}>Deletar Conta</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {/* Mensagem quando não há usuários cadastrados */}
                {users.length === 0 && (
                  <View style={styles.noUsersMessage}>
                    <Text style={styles.noUsersText}>Nenhum usuário cadastrado ainda</Text>
                    <Text style={styles.noUsersSubtext}>Os usuários aparecerão aqui quando se cadastrarem</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {!user.isAdmin && (
          <>
            <View style={styles.divider} />
            <View style={styles.card}>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={styles.userInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CPF: </Text>
                  <Text style={styles.infoValue}>{user.cpf}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Grupo: </Text>
                  <Text style={styles.infoValue}>{user.group}</Text>
                </View>
              </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.blueButton}
              onPress={() => handleEditUserData(user)}
            >
              <Text style={styles.blueButtonText}>Alterar Dados</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.redButton}
              onPress={openDeleteModal}
            >
              <Text style={styles.redButtonText}>Deletar Conta</Text>
            </TouchableOpacity>
          </View>

            </View>
          </>
        )}








        <Modal
          visible={showDeleteModal}
          animationType="fade"
          transparent={true}
          statusBarTranslucent={true}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDeleteModal(false)}
          >
            <KeyboardAvoidingView
              style={styles.modalOverlayInner}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <TouchableOpacity
                style={[
                  styles.modalContainer,
                  {
                    width: isSmallScreen ? "95%" : 400,
                    padding: isSmallScreen ? 24 : 20,
                    transform: isSmallScreen
                      ? [{ scale: 1.1 }]
                      : [{ scale: 1 }],
                  },
                ]}
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <Text
                  style={[
                    styles.modalTitle,
                    { fontSize: isSmallScreen ? 18 : 16 },
                  ]}
                >
                  Confirmar Exclusão
                </Text>

                <View style={styles.deleteWarning}>
                  <Text style={styles.deleteWarningText}>⚠️</Text>
                  <Text style={styles.deleteMessage}>
                    Tem certeza que deseja deletar esta conta?
                    {"\n\n"}Esta ação não pode ser desfeita.
                  </Text>
                </View>

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[styles.redButton, styles.modalButton]}
                    onPress={handleConfirmDelete}
                  >
                    <Text style={styles.redButtonText}>Deletar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.outlineButton, styles.modalButton]}
                    onPress={() => setShowDeleteModal(false)}
                  >
                    <Text style={styles.outlineButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </Modal>


      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  scroll: { padding: 16 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: { fontWeight: "bold", fontSize: 18, color: "#082A85" },
  roleToggle: { padding: 6, backgroundColor: "#082A85", borderRadius: 8 },
  roleToggleText: { color: "#fff", fontSize: 12 },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    width: "80%",
    justifyContent: "center",
    alignSelf: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  divider: { 
    height: 1, 
    backgroundColor: "#ddd", 
    marginVertical: 16,
    width: "80%",
    alignSelf: "center"
  },
  label: { fontSize: 14, fontWeight: "500", marginVertical: 4, color: "#222" },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  blueButton: {
    flex: 0.48,
    backgroundColor: "#082A85",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  blueButtonText: { color: "#fff", fontWeight: "700" },

  redButton: {
    flex: 0.48,
    borderWidth: 2,
    borderColor: "#D50000",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  redButtonText: { color: "#D50000", fontWeight: "700" },

  searchCard: {
    marginTop: "2%",
    width: "80%",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  searchHeader: { alignItems: "center", marginBottom: 8 },
  searchTitle: { color: "#082A85", fontWeight: "bold", fontSize: 18 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },

  resultCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  resultLabel: { color: "#222", marginBottom: 4 },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalOverlayInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontWeight: "700",
    marginBottom: 15,
    color: "#082A85",
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  inputSmall: {
    padding: 14,
    fontSize: 16,
    minHeight: 48,
  },
  errorText: { color: "#D50000", marginBottom: 6 },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: { flex: 0.48 },
  outlineButton: {
    flex: 0.48,
    borderWidth: 1,
    borderColor: "#082A85",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  outlineButtonText: { color: "#082A85", fontWeight: "700" },


  dropdownLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#082A85",
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  dropdownText: { fontSize: 14, color: "#333" },
  dropdownArrow: { fontSize: 12, color: "#666" },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 8,
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemSelected: {
    backgroundColor: "#E1EFFE",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333",
  },
  dropdownItemTextSelected: {
    color: "#082A85",
    fontWeight: "600",
  },


  deleteWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  deleteWarningText: {
    fontSize: 20,
    marginRight: 8,
  },
  deleteMessage: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  emptyGroupContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyGroupText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyGroupSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  disabledButtonText: {
    color: "#999999",
  },
  noResultsCard: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  userInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    minWidth: 35,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  noGroupsModalText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "600",
  },
  noGroupsModalSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
  },
  
  // Estilos para lista completa de usuários
  allUsersContainer: {
    marginTop: 20,
  },
  allUsersTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#082A85",
    textAlign: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 8,
  },
  
  // Estilos para o usuário atual (destacado)
  currentUserCard: {
    backgroundColor: "#E8F4FD", // Azul muito claro
    borderWidth: 2,
    borderColor: "#082A85", // Azul principal
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#082A85",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserBadge: {
    backgroundColor: "#082A85",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  currentUserBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  currentUserName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#082A85", // Nome em azul para destacar
    marginBottom: 8,
  },
  
  // Estilos para outros usuários
  otherUserCard: {
    backgroundColor: "#F8F9FA", // Cinza bem claro
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  
  // Estilos para seções
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 12,
    paddingLeft: 4,
  },
  
  // Estilos para administradores (cor especial dourada/amarela)
  adminUserCard: {
    backgroundColor: "#FFF9E6", // Fundo dourado claro
    borderWidth: 2,
    borderColor: "#FFB800", // Borda dourada
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#FFB800",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  adminUserName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#B8860B", // Texto dourado escuro
    marginBottom: 8,
  },
  
  // Estilos para usuários normais
  normalUserCard: {
    backgroundColor: "#F8F9FA", // Cinza bem claro
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  
  // Mensagem quando não há usuários
  noUsersMessage: {
    backgroundColor: "#F5F5F5",
    padding: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  noUsersText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
  },
  noUsersSubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
});