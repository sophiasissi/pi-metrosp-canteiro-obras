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

export default function Settings() {
  const { projects } = useProjects();

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [user, setUser] = useState({
    name: "Nome Usuário",
    email: "nomeusuario@gmail.com",
    group: "Amarelo",
  });


  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNoGroupsModal, setShowNoGroupsModal] = useState(false);


  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [selectedGroup, setSelectedGroup] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);


  const [searchQuery, setSearchQuery] = useState("");

  // Lista de usuários cadastrados (simulação)
  const [registeredUsers] = useState([
    {
      id: 1,
      name: "Ana Silva",
      email: "ana.silva@metrosp.com.br",
      group: "Engenharia Civil"
    },
    {
      id: 2,
      name: "João Santos",
      email: "joao.santos@metrosp.com.br",
      group: "Engenharia Elétrica"
    },
    {
      id: 3,
      name: "Maria Oliveira",
      email: "maria.oliveira@metrosp.com.br",
      group: "Arquitetura"
    },
    {
      id: 4,
      name: "Carlos Pereira",
      email: "carlos.pereira@metrosp.com.br",
      group: "Topografia"
    },
    {
      id: 5,
      name: "Fernanda Costa",
      email: "fernanda.costa@metrosp.com.br",
      group: "Gestão de Projetos"
    }
  ]);

  // Busca grupos únicos apenas dos projetos cadastrados
  const availableGroups = useMemo(() => {
    const projectGroups = projects.map(project => project.group);
    const uniqueGroups = Array.from(new Set(projectGroups)).filter(Boolean);
    
    return uniqueGroups.sort();
  }, [projects]);

  // Verifica se há grupos disponíveis
  const hasGroups = availableGroups.length > 0;

  // Função para filtrar usuários por nome ou email
  const filteredUsers = useMemo(() => {
    if (searchQuery.length < 3) return [];
    
    return registeredUsers.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, registeredUsers]);

  // Verifica se houve alterações nos campos
  const isEmailChanged = emailInput.trim() !== user.email;
  const isGroupChanged = selectedGroup !== user.group;
  const isPasswordValid = passwordInput.length >= 6 && confirmPasswordInput.length >= 6 && passwordInput === confirmPasswordInput && !passwordError && !confirmPasswordError;
  const { width, height } = Dimensions.get("window");
  const isSmallScreen = width < 400;

  function validateEmail(value: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return "Email é obrigatório";
    if (!re.test(value)) return "Email inválido";
    return "";
  }

  function validatePassword(value: string) {
    if (!value) return "Senha é obrigatória";
    if (value.length < 6) return "A senha deve ter ao menos 6 caracteres";
    return "";
  }

  function openEmailModal() {
    setEmailInput(user.email);
    setEmailError("");
    setShowEmailModal(true);
  }

  function openPasswordModal() {
    setPasswordInput("");
    setConfirmPasswordInput("");
    setPasswordError("");
    setConfirmPasswordError("");
    setShowPasswordModal(true);
  }

  function handleConfirmEmail() {
    const err = validateEmail(emailInput.trim());
    setEmailError(err);
    if (err) return;
    
    // Verifica se houve alteração
    if (emailInput.trim() === user.email) {
      Alert.alert("Aviso", "Nenhuma alteração foi feita no email");
      return;
    }
    
    setUser({ ...user, email: emailInput.trim() });
    setShowEmailModal(false);
    Alert.alert("Sucesso", "Email alterado com sucesso");
  }

  function handleConfirmPassword() {
    const err = validatePassword(passwordInput);
    setPasswordError(err);
    if (err) return;
    if (passwordInput !== confirmPasswordInput) {
      setConfirmPasswordError("As senhas não conferem");
      return;
    }
    
    // Validação adicional de segurança
    if (!isPasswordValid) {
      Alert.alert("Erro", "Preencha todos os campos corretamente");
      return;
    }
    
    setShowPasswordModal(false);
    Alert.alert("Sucesso", "Senha alterada com sucesso");
  }

  function openGroupModal() {
    if (!hasGroups) {
      setShowNoGroupsModal(true);
      return;
    }
    setSelectedGroup(user.group);
    setShowDropdown(false);
    setShowGroupModal(true);
  }

  function handleConfirmGroup() {
    if (!selectedGroup) return;
    
    // Verifica se houve alteração
    if (selectedGroup === user.group) {
      Alert.alert("Aviso", "Nenhuma alteração foi feita no grupo");
      return;
    }
    
    setUser({ ...user, group: selectedGroup });
    setShowGroupModal(false);
    Alert.alert("Sucesso", `Grupo alterado para ${selectedGroup}`);
  }

  function openDeleteModal() {
    setShowDeleteModal(true);
  }

  function handleConfirmDelete() {
    setShowDeleteModal(false);
    Alert.alert(
      "Conta Deletada",
      "A conta foi deletada com sucesso (simulação)"
    );
  }

  // Funções para ações de administrador em outros usuários
  function handleSearchUserEmailAction(foundUser: any) {
    Alert.alert(
      "Alterar Email",
      `Deseja alterar o email de ${foundUser.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Alterar", 
          onPress: () => {
            Alert.alert("Sucesso", `Email de ${foundUser.name} alterado com sucesso (simulação)`);
          }
        }
      ]
    );
  }

  function handleSearchUserPasswordAction(foundUser: any) {
    Alert.alert(
      "Alterar Senha",
      `Deseja alterar a senha de ${foundUser.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Alterar", 
          onPress: () => {
            Alert.alert("Sucesso", `Senha de ${foundUser.name} alterada com sucesso (simulação)`);
          }
        }
      ]
    );
  }

  function handleSearchUserGroupAction(foundUser: any) {
    if (!hasGroups) {
      setShowNoGroupsModal(true);
      return;
    }

    Alert.alert(
      "Alterar Grupo",
      `Grupo atual de ${foundUser.name}: ${foundUser.group}\n\nEscolha o novo grupo:`,
      [
        { text: "Cancelar", style: "cancel" },
        ...availableGroups.slice(0, 3).map(group => ({
          text: group,
          onPress: () => {
            if (group === foundUser.group) {
              Alert.alert("Aviso", "O usuário já pertence a este grupo");
            } else {
              Alert.alert("Sucesso", `Grupo de ${foundUser.name} alterado para ${group} (simulação)`);
            }
          }
        })),
        ...(availableGroups.length > 3 ? [{ 
          text: "Ver mais...", 
          onPress: () => {
            Alert.alert("Grupos disponíveis", availableGroups.join("\n"));
          }
        }] : [])
      ]
    );
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
            Alert.alert("Sucesso", `Conta de ${foundUser.name} deletada com sucesso (simulação)`);
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
            onPress={() => setIsAdmin(!isAdmin)}
            style={styles.roleToggle}
            accessibilityLabel="Trocar tipo de conta"
          >
            <Text style={styles.roleToggleText}>
              {isAdmin ? "Administrador" : "Usuário"}
            </Text>
          </TouchableOpacity>
        </View>

        {isAdmin && (
          <View style={styles.searchCard}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>Pesquisar Usuário</Text>
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Digite nome ou email (mín. 3 caracteres)"
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
                        <Text style={styles.infoLabel}>Email: </Text>
                        <Text style={styles.infoValue}>{foundUser.email}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Grupo: </Text>
                        <Text style={styles.infoValue}>{foundUser.group}</Text>
                      </View>
                    </View>

                    <View style={styles.buttonsRow}>
                      <TouchableOpacity
                        style={styles.blueButton}
                        onPress={() => handleSearchUserEmailAction(foundUser)}
                      >
                        <Text style={styles.blueButtonText}>Alterar Email</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.blueButton}
                        onPress={() => handleSearchUserPasswordAction(foundUser)}
                      >
                        <Text style={styles.blueButtonText}>Alterar Senha</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.buttonsRow}>
                      <TouchableOpacity
                        style={styles.blueButton}
                        onPress={() => handleSearchUserGroupAction(foundUser)}
                      >
                        <Text style={styles.blueButtonText}>Alterar Grupo</Text>
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
                      Tente buscar por nome ou email diferente
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {isAdmin && <View style={styles.divider} />}

        <View style={styles.card}>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.userInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email: </Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Grupo: </Text>
              <Text style={styles.infoValue}>{user.group}</Text>
            </View>
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.blueButton}
              onPress={openEmailModal}
            >
              <Text style={styles.blueButtonText}>Alterar Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.blueButton}
              onPress={openPasswordModal}
            >
              <Text style={styles.blueButtonText}>Alterar Senha</Text>
            </TouchableOpacity>
          </View>

          {isAdmin && (
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.blueButton}
                onPress={openGroupModal}
              >
                <Text style={styles.blueButtonText}>Alterar Grupo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.redButton}
                onPress={openDeleteModal}
              >
                <Text style={styles.redButtonText}>Deletar Conta</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>


        <Modal
          visible={showEmailModal}
          animationType="fade"
          transparent={true}
          statusBarTranslucent={true}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowEmailModal(false)}
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
                  Alterar Email
                </Text>
                <TextInput
                  value={emailInput}
                  onChangeText={(t) => {
                    setEmailInput(t);
                    setEmailError(validateEmail(t));
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  placeholder="Digite o novo email"
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.blueButton, 
                      styles.modalButton,
                      (!isEmailChanged || emailError) && styles.disabledButton
                    ]}
                    onPress={handleConfirmEmail}
                    disabled={!isEmailChanged || !!emailError}
                  >
                    <Text style={[
                      styles.blueButtonText,
                      (!isEmailChanged || emailError) && styles.disabledButtonText
                    ]}>
                      Confirmar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.outlineButton, styles.modalButton]}
                    onPress={() => setShowEmailModal(false)}
                  >
                    <Text style={styles.outlineButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </Modal>


        <Modal
          visible={showPasswordModal}
          animationType="fade"
          transparent={true}
          statusBarTranslucent={true}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPasswordModal(false)}
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
                  Alterar Senha
                </Text>
                <TextInput
                  value={passwordInput}
                  onChangeText={(t) => {
                    setPasswordInput(t);
                    setPasswordError(validatePassword(t));
                  }}
                  secureTextEntry
                  style={[
                    styles.input,
                    isSmallScreen && styles.inputSmall
                  ]}
                  placeholder="Nova senha"
                  placeholderTextColor={isSmallScreen ? "#999" : "#999"}
                />
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}

                <TextInput
                  value={confirmPasswordInput}
                  onChangeText={(t) => {
                    setConfirmPasswordInput(t);
                    setConfirmPasswordError(
                      t === passwordInput ? "" : "As senhas não conferem"
                    );
                  }}
                  secureTextEntry
                  style={[
                    styles.input,
                    isSmallScreen && styles.inputSmall
                  ]}
                  placeholder="Confirmar senha"
                  placeholderTextColor={isSmallScreen ? "#999" : "#999"}
                />
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : null}

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.blueButton, 
                      styles.modalButton,
                      !isPasswordValid && styles.disabledButton
                    ]}
                    onPress={handleConfirmPassword}
                    disabled={!isPasswordValid}
                  >
                    <Text style={[
                      styles.blueButtonText,
                      !isPasswordValid && styles.disabledButtonText
                    ]}>
                      Confirmar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.outlineButton, styles.modalButton]}
                    onPress={() => setShowPasswordModal(false)}
                  >
                    <Text style={styles.outlineButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </Modal>


        <Modal
          visible={showGroupModal}
          animationType="fade"
          transparent={true}
          statusBarTranslucent={true}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowGroupModal(false)}
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
                  Alterar Grupo
                </Text>

                <Text style={styles.dropdownLabel}>
                  Selecione o novo grupo:
                </Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowDropdown(!showDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {selectedGroup || "Selecionar grupo"}
                  </Text>
                  <Text style={styles.dropdownArrow}>
                    {showDropdown ? "▲" : "▼"}
                  </Text>
                </TouchableOpacity>

                {showDropdown && (
                  <ScrollView
                    style={styles.dropdownList}
                    nestedScrollEnabled={true}
                  >
                    {hasGroups ? (
                      availableGroups.map((group) => (
                        <TouchableOpacity
                          key={group}
                          style={[
                            styles.dropdownItem,
                            selectedGroup === group &&
                              styles.dropdownItemSelected,
                          ]}
                          onPress={() => {
                            setSelectedGroup(group);
                            setShowDropdown(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedGroup === group &&
                                styles.dropdownItemTextSelected,
                            ]}
                          >
                            {group}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.emptyGroupContainer}>
                        <Text style={styles.emptyGroupText}>
                          Nenhum grupo cadastrado
                        </Text>
                        <Text style={styles.emptyGroupSubtext}>
                          Crie um projeto primeiro para ter grupos disponíveis
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                )}

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.blueButton, 
                      styles.modalButton,
                      (!isGroupChanged || !selectedGroup || !hasGroups) && styles.disabledButton
                    ]}
                    onPress={handleConfirmGroup}
                    disabled={!isGroupChanged || !selectedGroup || !hasGroups}
                  >
                    <Text style={[
                      styles.blueButtonText,
                      (!isGroupChanged || !selectedGroup || !hasGroups) && styles.disabledButtonText
                    ]}>
                      Confirmar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.outlineButton, styles.modalButton]}
                    onPress={() => setShowGroupModal(false)}
                  >
                    <Text style={styles.outlineButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </Modal>


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

        {/* Modal de Nenhum Grupo Disponível */}
        <Modal
          visible={showNoGroupsModal}
          animationType="fade"
          transparent={true}
          statusBarTranslucent={true}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowNoGroupsModal(false)}
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
                  },
                ]}
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <Text style={[styles.modalTitle, { fontSize: isSmallScreen ? 18 : 16 }]}>
                  📂 Nenhum Grupo Disponível
                </Text>
                
                <Text style={styles.noGroupsModalText}>
                  {projects.length === 0 
                    ? "Não há projetos cadastrados no sistema ainda." 
                    : "Os projetos cadastrados não possuem grupos definidos."
                  }
                </Text>
                
                <Text style={styles.noGroupsModalSubtext}>
                  {projects.length === 0 
                    ? "Para ter grupos disponíveis, você precisa primeiro adicionar algum projeto. Cada projeto pode ter um grupo específico." 
                    : "Verifique os projetos existentes e certifique-se de que eles possuem grupos definidos."
                  }
                </Text>

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[styles.outlineButton, styles.modalButton]}
                    onPress={() => setShowNoGroupsModal(false)}
                  >
                    <Text style={styles.outlineButtonText}>Fechar</Text>
                  </TouchableOpacity>
                  
                  {projects.length === 0 && (
                    <TouchableOpacity
                      style={[styles.blueButton, styles.modalButton]}
                      onPress={() => {
                        setShowNoGroupsModal(false);
                        router.push("/(drawer)/addProject");
                      }}
                    >
                      <Text style={styles.blueButtonText}>Adicionar Projeto</Text>
                    </TouchableOpacity>
                  )}
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
    minWidth: 50,
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
});