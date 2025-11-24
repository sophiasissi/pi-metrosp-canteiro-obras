import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useUsers } from "../../contexts/UsersContext";

export default function Settings() {
  const { users } = useUsers();
  const { loggedUser, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");

  // Função para filtrar usuários por CPF para administradores
  const filteredUsers = useMemo(() => {
    if (!isAdmin || searchQuery.length < 3) return [];
    
    return users.filter(user => 
      user.cpf.replace(/\D/g, '').includes(searchQuery.replace(/\D/g, ''))
    );
  }, [searchQuery, users, isAdmin]);

  const { width } = Dimensions.get("window");
  const isSmallScreen = width < 400;

  // Função para navegar para edição de dados do usuário
  function handleEditUserData(userData?: any) {
    const userToEdit = userData || loggedUser;
    if (!userToEdit) return;

    router.push({
      pathname: "/(drawer)/signUp",
      params: {
        editMode: "true",
        userId: userToEdit.id || "current",
        userName: userToEdit.name,
        userCpf: userToEdit.cpf,
        userGroup: userToEdit.group || "",
        userIsAdmin: userToEdit.isAdmin?.toString() || "false"
      }
    });
  }

  function handleDeleteUser(userToDelete: any) {
    Alert.alert(
      "Deletar Usuário",
      `Tem certeza que deseja deletar a conta de ${userToDelete.name}?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Deletar", 
          style: "destructive",
          onPress: () => {
            Alert.alert("Sucesso", `Conta de ${userToDelete.name} deletada com sucesso`);
          }
        }
      ]
    );
  }

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
              <Text style={styles.userName}>{loggedUser.name}</Text>
              <View style={styles.userInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CPF: </Text>
                  <Text style={styles.infoValue}>{loggedUser.cpf}</Text>
                </View>
                {loggedUser.group && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Grupo: </Text>
                    <Text style={styles.infoValue}>{loggedUser.group}</Text>
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
            {/* Barra de pesquisa por CPF */}
            <View style={styles.searchCard}>
              <View style={styles.searchHeader}>
                <Text style={styles.searchTitle}>Pesquisar Usuário por CPF</Text>
              </View>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Digite o CPF (mín. 3 dígitos)"
                placeholderTextColor="#999"
                style={styles.searchInput}
                keyboardType="numeric"
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
                            <Text style={styles.infoLabel}>CPF: </Text>
                            <Text style={styles.infoValue}>{foundUser.cpf}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Grupo: </Text>
                            <Text style={styles.infoValue}>{foundUser.group}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Tipo: </Text>
                            <Text style={styles.infoValue}>
                              {foundUser.isAdmin ? "Administrador" : "Usuário"}
                            </Text>
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
                            onPress={() => handleDeleteUser(foundUser)}
                          >
                            <Text style={styles.redButtonText}>Deletar Conta</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noResults}>Nenhum usuário encontrado</Text>
                  )}
                </>
              )}
            </View>

            {/* Seção de Administradores */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👑 Administradores</Text>
              
              {/* Usuário atual se for admin */}
              <View style={styles.adminUserCard}>
                <Text style={styles.adminUserName}>{loggedUser.name} (Você)</Text>
                <View style={styles.userInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>CPF: </Text>
                    <Text style={styles.infoValue}>{loggedUser.cpf}</Text>
                  </View>
                  {loggedUser.group && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Grupo: </Text>
                      <Text style={styles.infoValue}>{loggedUser.group}</Text>
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
              {users
                .filter(user => user.isAdmin && user.id !== loggedUser.id)
                .map((admin) => (
                  <View key={admin.id} style={styles.adminUserCard}>
                    <Text style={styles.adminUserName}>{admin.name}</Text>
                    <View style={styles.userInfo}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>CPF: </Text>
                        <Text style={styles.infoValue}>{admin.cpf}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Grupo: </Text>
                        <Text style={styles.infoValue}>{admin.group}</Text>
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
            {users.some(user => !user.isAdmin) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 Usuários Normais</Text>
                
                {users
                  .filter(user => !user.isAdmin)
                  .map((normalUser) => (
                    <View key={normalUser.id} style={styles.userCard}>
                      <Text style={styles.userName}>{normalUser.name}</Text>
                      <View style={styles.userInfo}>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>CPF: </Text>
                          <Text style={styles.infoValue}>{normalUser.cpf}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Grupo: </Text>
                          <Text style={styles.infoValue}>{normalUser.group}</Text>
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
});