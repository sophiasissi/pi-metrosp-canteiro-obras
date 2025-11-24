import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../../contexts/AuthContext";
import { useUsers } from "../../contexts/UsersContext";
import { apiService } from "../../services/apiService";
import { cleanCPF, formatCPF } from "../../utils/cpfValidator";

export default function EditUserScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const { loggedUser, isAdmin, updateLoggedUser } = useAuth();
  const { getAllUsers } = useUsers();
  const params = useLocalSearchParams();
  
  // Verifica se é um usuário editando seus próprios dados
  const isCurrentUserEditing = params.userId === "current" || 
    (loggedUser && (
      params.userId === loggedUser.usuarioID?.toString() || 
      params.userCpf === loggedUser.cpf
    ));
  
  // Proteção de acesso
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loggedUser) {
        router.replace("/(auth)/login");
        return;
      }

      if (!isAdmin && !isCurrentUserEditing) {
        Alert.alert(
          "Acesso Negado", 
          "Você não tem permissão para acessar esta tela.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [loggedUser, isAdmin, isCurrentUserEditing]);

  // Limpar estado quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      console.log('Tela de edição recebeu foco - limpando estado');
      setIsInitialized(false);
      // Limpar todos os campos
      setNome("");
      setCpf("");
      setSenha("");
      setConfirmarSenha("");
      setGrupo("");
      setIsUserAdmin(false);
      // Limpar erros
      setNomeError("");
      setSenhaError("");
      setConfirmarSenhaError("");
      setGrupoError("");
      setShowSuccessModal(false);
      setIsLoading(false);
      setShowGrupoDropdown(false);
    }, [])
  );
  
  // Carregar grupos disponíveis
  useEffect(() => {
    const loadGrupos = async () => {
      try {
        const result = await apiService.getGroups();
        if (result.success && result.data) {
          setGrupos(result.data.grupos);
        }
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
      }
    };
    
    loadGrupos();
  }, []);
  
  // Estados do formulário
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [grupo, setGrupo] = useState("");
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  
  // Estados de erro
  const [nomeError, setNomeError] = useState("");
  const [senhaError, setSenhaError] = useState("");
  const [confirmarSenhaError, setConfirmarSenhaError] = useState("");
  const [grupoError, setGrupoError] = useState("");
  
  // Estados de controle
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  
  // Estados para dropdown de grupos
  const [grupos, setGrupos] = useState<Array<{grupoID: number; nomeGrupo: string}>>([]);
  const [showGrupoDropdown, setShowGrupoDropdown] = useState(false);

  // Estados para armazenar valores originais (para detectar mudanças)
  const [originalValues, setOriginalValues] = useState({
    nome: "",
    cpf: "",
    grupo: "",
    isUserAdmin: false,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Preenche os campos com os dados do usuário
  useEffect(() => {
    if (isInitialized) return;
    
    console.log('=== DEBUG EDIÇÃO ===');
    console.log('params.userId:', params.userId);
    console.log('params.userCpf:', params.userCpf);
    console.log('params.userName:', params.userName);
    console.log('loggedUser?.usuarioID:', loggedUser?.usuarioID);
    console.log('loggedUser?.cpf:', loggedUser?.cpf);
    console.log('isCurrentUserEditing:', isCurrentUserEditing);
    console.log('isAdmin:', isAdmin);
    console.log('========================');
    
    if (isCurrentUserEditing && loggedUser) {
      // Editando usuário atual
      const initialValues = {
        nome: loggedUser.nomeCompleto || "",
        cpf: formatCPF(loggedUser.cpf),
        grupo: loggedUser.nomeGrupo || "",
        isUserAdmin: loggedUser.adm || false,
      };

      setNome(initialValues.nome);
      setCpf(initialValues.cpf);
      setGrupo(initialValues.grupo);
      setIsUserAdmin(initialValues.isUserAdmin);
      setOriginalValues(initialValues);
      setIsInitialized(true);
    } else if (params.userName) {
      // Editando outro usuário (só admin pode fazer isso)
      const initialValues = {
        nome: params.userName as string || "",
        cpf: formatCPF(params.userCpf as string),
        grupo: params.userGroup as string || "",
        isUserAdmin: params.userIsAdmin === "true",
      };

      setNome(initialValues.nome);
      setCpf(initialValues.cpf);
      setGrupo(initialValues.grupo);
      setIsUserAdmin(initialValues.isUserAdmin);
      setOriginalValues(initialValues);
      setIsInitialized(true);
    }
  }, [params, loggedUser, isCurrentUserEditing, isInitialized]);

  // Função para verificar se houve mudanças nos dados
  const hasDataChanged = () => {
    const nomeChanged = nome.trim() !== originalValues.nome.trim();
    const grupoChanged = grupo.trim() !== originalValues.grupo.trim();
    const senhaChanged = senha.trim() !== "";
    const adminChanged = !isCurrentUserEditing && (isUserAdmin !== originalValues.isUserAdmin);
    
    return nomeChanged || grupoChanged || senhaChanged || adminChanged;
  };

  // Função para obter o título da tela
  const getScreenTitle = () => {
    return isCurrentUserEditing ? "Editar Meus Dados" : "Editar Usuário";
  };

  // Função para cancelar e voltar
  const handleCancel = () => {
    router.back();
  };

  // Validação do nome
  const validateNome = (nome: string) => {
    // Aceita qualquer caractere, apenas verifica se não está vazio
    return nome.trim().length > 0;
  };

  // Handlers de mudança
  const handleNomeChange = (text: string) => {
    console.log('Nome alterado para:', text);
    setNome(text);
    if (nomeError) setNomeError("");
  };

  const handleSenhaChange = (text: string) => {
    setSenha(text);
    if (senhaError) setSenhaError("");
  };

  const handleConfirmarSenhaChange = (text: string) => {
    setConfirmarSenha(text);
    if (confirmarSenhaError) setConfirmarSenhaError("");
  };

  // Validação dos campos
  const validateFields = () => {
    let isValid = true;

    // Valida nome (sempre obrigatório)
    if (!nome.trim()) {
      setNomeError("Nome é obrigatório");
      isValid = false;
    } else if (nome.trim().length < 2) {
      setNomeError("Nome deve ter pelo menos 2 caracteres");
      isValid = false;
    } else {
      setNomeError("");
    }

    // Valida grupo apenas se não for usuário comum editando seus próprios dados
    if (!isCurrentUserEditing) {
      if (!grupo.trim()) {
        setGrupoError("Grupo é obrigatório");
        isValid = false;
      } else {
        setGrupoError("");
      }
    }

    // Valida senhas apenas se foram preenchidas
    if (senha.trim() !== "") {
      if (senha.length < 6) {
        setSenhaError("Senha deve ter pelo menos 6 caracteres");
        isValid = false;
      } else {
        setSenhaError("");
      }

      if (confirmarSenha !== senha) {
        setConfirmarSenhaError("As senhas não coincidem");
        isValid = false;
      } else {
        setConfirmarSenhaError("");
      }
    }

    return isValid;
  };

  // Animação do modal de sucesso
  const showSuccessModalWithAnimation = () => {
    setShowSuccessModal(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Fechar modal de sucesso
  const hideSuccessModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessModal(false);
      router.back();
    });
  };

  // Função principal para atualizar usuário
  const handleUpdateUser = async () => {
    if (!validateFields()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepara os dados para envio
      const userData: any = {
        cpf: cleanCPF(cpf),
        nomeCompleto: nome.trim(),
        nomeGrupo: grupo.trim(),
      };
      
      // Só inclui adm se não for usuário comum editando seus próprios dados
      if (!isCurrentUserEditing) {
        userData.adm = isUserAdmin;
      }
      
      // Só inclui senha se foi alterada
      if (senha.trim() !== "") {
        userData.senha = senha;
        userData.confirmarSenha = confirmarSenha;
      }
      
      console.log('Enviando dados para API:', userData);
      
      const result = await apiService.updateUserInfo(userData);
      
      if (result.success) {
        // Se é o usuário atual editando seus próprios dados, atualiza o contexto de auth
        if (isCurrentUserEditing) {
          updateLoggedUser({
            nomeCompleto: nome.trim(),
            nomeGrupo: grupo.trim(),
          });
        }
        
        // Se é admin editando outro usuário, força reload da lista de usuários
        if (isAdmin && !isCurrentUserEditing) {
          try {
            await getAllUsers();
          } catch (error) {
            console.log('Erro ao recarregar usuários:', error);
          }
        }
        
        showSuccessModalWithAnimation();
      } else {
        Alert.alert("Erro", result.error || "Erro ao atualizar dados do usuário");
      }
    } catch (err) {
      console.error('Erro na atualização:', err);
      Alert.alert("Erro", "Erro de conexão com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // Modal de sucesso
  const SuccessModal = () => {
    const userType = isUserAdmin ? "Administrador" : "Usuário";

    return (
      <Modal
        transparent={true}
        visible={showSuccessModal}
        animationType="none"
        onRequestClose={hideSuccessModal}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.successIconContainer}>
              <Icon
                name="check-circle"
                size={60}
                color="#4CAF50"
              />
            </View>

            <Text style={styles.modalTitle}>Sucesso!</Text>

            <Text style={styles.modalMessage}>
              Dados atualizados com sucesso!
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={hideSuccessModal}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.container,
            isLargeScreen && styles.containerLarge,
          ]}
        >
          <View
            style={[
              styles.formWrapper,
              isLargeScreen && styles.formWrapperLarge,
            ]}
          >
            <Image
              source={require("@/assets/images/assinatura-chapada.png")}
              style={[styles.logo, isLargeScreen && styles.logoLarge]}
            />

            <Text style={styles.title}>{getScreenTitle()}</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Nome Completo:</Text>
              <TextInput
                style={[
                  styles.input,
                  isLargeScreen && styles.inputLarge,
                  nomeError ? styles.inputError : null,
                ]}
                placeholder="Digite seu nome completo"
                placeholderTextColor="#B0B0B0"
                value={nome}
                onChangeText={handleNomeChange}
                editable={true}
                autoCorrect={false}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {nomeError ? <Text style={styles.errorText}>{nomeError}</Text> : null}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>CPF:</Text>
              <TextInput
                style={[
                  styles.input,
                  isLargeScreen && styles.inputLarge,
                  styles.inputDisabled,
                ]}
                placeholder="CPF do usuário"
                placeholderTextColor="#B0B0B0"
                value={cpf}
                editable={false}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Nova Senha (opcional):</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.inputSenha,
                    isLargeScreen && styles.inputLarge,
                    senhaError ? styles.inputError : null,
                  ]}
                  placeholder="Digite a nova senha (deixe em branco para não alterar)"
                  placeholderTextColor="#B0B0B0"
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={handleSenhaChange}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                >
                  <Icon
                    name={mostrarSenha ? "eye-slash" : "eye"}
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>
              {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirmar Nova Senha:</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.inputSenha,
                    isLargeScreen && styles.inputLarge,
                    confirmarSenhaError ? styles.inputError : null,
                  ]}
                  placeholder="Confirme a nova senha"
                  placeholderTextColor="#B0B0B0"
                  secureTextEntry={!mostrarConfirmarSenha}
                  value={confirmarSenha}
                  onChangeText={handleConfirmarSenhaChange}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                >
                  <Icon
                    name={mostrarConfirmarSenha ? "eye-slash" : "eye"}
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>
              {confirmarSenhaError ? (
                <Text style={styles.errorText}>{confirmarSenhaError}</Text>
              ) : null}
            </View>

            <View style={[
              styles.fieldContainer, 
              showGrupoDropdown && { zIndex: 99999, elevation: 20 }
            ]}>
              <Text style={styles.label}>Grupo:</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.dropdownButton,
                  isLargeScreen && styles.inputLarge,
                  grupoError ? styles.inputError : null,
                  isCurrentUserEditing && styles.inputDisabled,
                ]}
                onPress={isCurrentUserEditing ? undefined : () => setShowGrupoDropdown(!showGrupoDropdown)}
                disabled={!!isCurrentUserEditing}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  !grupo && { color: '#B0B0B0' },
                  isCurrentUserEditing && { color: '#999' }
                ]}>
                  {grupo || "Selecione um grupo"}
                </Text>
                {!isCurrentUserEditing && (
                  <Icon
                    name={showGrupoDropdown ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#666"
                  />
                )}
              </TouchableOpacity>
              
              {showGrupoDropdown && !isCurrentUserEditing && (
                <View style={styles.dropdownContainer}>
                  {grupos.map((grupoItem) => (
                    <TouchableOpacity
                      key={grupoItem.grupoID}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setGrupo(grupoItem.nomeGrupo);
                        setShowGrupoDropdown(false);
                        setGrupoError("");
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{grupoItem.nomeGrupo}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {grupoError ? <Text style={styles.errorText}>{grupoError}</Text> : null}
            </View>

            {/* Checkbox de Administrador - só aparece quando admin está editando OUTRO usuário E o usuário sendo editado já é admin */}
            {/* DEBUG: isAdmin={isAdmin}, isCurrentUserEditing={isCurrentUserEditing}, originalValues.isUserAdmin={originalValues.isUserAdmin} */}
            {isAdmin && !isCurrentUserEditing && originalValues.isUserAdmin && (
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    isUserAdmin && { backgroundColor: "#001489" }
                  ]}
                  onPress={() => setIsUserAdmin(!isUserAdmin)}
                >
                  {isUserAdmin && (
                    <Icon
                      name="check"
                      size={14}
                      color="#fff"
                    />
                  )}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>
                  Administrador
                </Text>
              </View>
            )}
            
            {/* Overlay para fechar dropdown quando tocar fora */}
            {showGrupoDropdown && !isCurrentUserEditing && (
              <TouchableOpacity
                style={styles.dropdownBackdrop}
                activeOpacity={1}
                onPress={() => setShowGrupoDropdown(false)}
              />
            )}

            {/* Botões de ação */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[
                  styles.updateButton,
                  (!hasDataChanged() || isLoading) && styles.buttonDisabled
                ]} 
                onPress={handleUpdateUser}
                disabled={!hasDataChanged() || isLoading}
              >
                <Text style={[
                  styles.updateButtonText,
                  (!hasDataChanged() || isLoading) && styles.buttonTextDisabled
                ]}>
                  {isLoading ? "ATUALIZANDO..." : "ATUALIZAR"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <SuccessModal />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F7FA",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  containerLarge: {
    paddingHorizontal: 0,
  },
  formWrapper: {
    width: "100%",
    alignItems: "center",
  },
  formWrapperLarge: {
    width: 450,
    padding: 60,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  logo: {
    width: 120,
    height: 150,
    marginBottom: 20,
    resizeMode: "contain",
  },
  logoLarge: {
    width: 150,
    height: 180,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001489",
    marginBottom: 30,
    textAlign: "center",
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 15,
    position: 'relative',
  },
  label: {
    color: "#001489",
    fontWeight: "bold",
    marginLeft: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#CFCFCF",
    paddingHorizontal: 15,
    fontSize: 16,
  },
  inputLarge: {
    height: 55,
    fontSize: 18,
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
  },
  inputSenha: {
    backgroundColor: "#FFFFFF",
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#CFCFCF",
    paddingHorizontal: 15,
    paddingRight: 50,
    fontSize: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  updateButton: {
    width: "80%",
    height: 50,
    backgroundColor: "#001489",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputError: {
    borderColor: "#e74c3c",
    borderWidth: 2,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
    width: "100%",
    paddingLeft: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#001489",
    borderRadius: 4,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 15,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 2,
    maxHeight: 200,
    zIndex: 99999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99998,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 350,
    width: "90%",
  },
  successIconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001489",
    marginBottom: 15,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: "#001489",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
  
  buttonContainer: {
    width: "100%",
    marginTop: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#001489",
    width: "80%",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelButtonText: {
    color: "#001489",
    fontSize: 16,
    fontWeight: "bold",
  },
});