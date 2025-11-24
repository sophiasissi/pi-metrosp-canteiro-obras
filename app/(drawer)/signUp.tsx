import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
  View,
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../../contexts/AuthContext";
import { useUsers } from "../../contexts/UsersContext";
import { cleanCPF, formatCPF, validateCPF } from "../../utils/cpfValidator";
import { apiService } from "../../services/apiService";

export default function SignUpScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const { addUser, updateUser } = useUsers();
  const { loggedUser, isAdmin } = useAuth();
  const params = useLocalSearchParams();

  // Verifica se está em modo de edição
  const isEditMode = params.editMode === "true";
  
  // Verifica se é um usuário comum editando seus próprios dados
  const isCurrentUserEditing = isEditMode && params.userId === "current";
  
  // Proteção: só permite acesso se for admin ou se for usuário comum editando seus próprios dados
  useEffect(() => {
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
  }, [loggedUser, isAdmin, isCurrentUserEditing]);
  
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [grupo, setGrupo] = useState("");
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [nomeError, setNomeError] = useState("");
  const [cpfError, setCpfError] = useState("");
  const [senhaError, setSenhaError] = useState("");
  const [confirmarSenhaError, setConfirmarSenhaError] = useState("");
  const [grupoError, setGrupoError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // Estados para armazenar valores originais (para detectar mudanças)
  const [originalValues, setOriginalValues] = useState({
    nome: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
    grupo: "",
    isAdmin: false,
  });

  // Preenche os campos quando estiver em modo de edição
  useEffect(() => {
    if (isEditMode) {
      if (isCurrentUserEditing && loggedUser) {
        // Editando usuário atual
        const initialValues = {
          nome: loggedUser.nomeCompleto,
          cpf: loggedUser.cpf,
          senha: "",
          confirmarSenha: "",
          grupo: "", // Precisará buscar do backend
          isAdmin: loggedUser.adm,
        };

        setNome(initialValues.nome);
        setCpf(initialValues.cpf);
        setGrupo(initialValues.grupo);
        setIsUserAdmin(initialValues.isAdmin);
        setOriginalValues(initialValues);
      } else if (params.userName) {
        // Editando outro usuário (só admin pode fazer isso)
        const initialValues = {
          nome: params.userName as string,
          cpf: params.userCpf as string,
          senha: "",
          confirmarSenha: "",
          grupo: params.userGroup as string,
          isAdmin: params.userIsAdmin === "true",
        };

        setNome(initialValues.nome);
        setCpf(initialValues.cpf);
        setGrupo(initialValues.grupo);
        setIsUserAdmin(initialValues.isAdmin);
        setOriginalValues(initialValues);
      }
    }
  }, [isEditMode, params, loggedUser, isCurrentUserEditing]);

  // Função para verificar se houve mudanças nos dados
  const hasDataChanged = () => {
    if (!isEditMode) return true; // Em modo de criação, sempre permitir

    if (isCurrentUserEditing) {
      // Para usuário editando seus próprios dados, verifica apenas campos básicos
      return nome !== originalValues.nome || grupo !== originalValues.grupo;
    } else {
      // Para admin editando outros usuários, verifica todos os campos editáveis
      const hasFieldChanges = (
        nome !== originalValues.nome ||
        grupo !== originalValues.grupo ||
        isUserAdmin !== originalValues.isAdmin
      );
      
      return hasFieldChanges;
    }
  };

  // Função para obter o título da tela
  const getScreenTitle = () => {
    if (isEditMode) {
      return isCurrentUserEditing ? "Editar Meus Dados" : "Editar Usuário";
    }
    return "Adicionar Usuário";
  };

  // Função para cancelar e voltar
  const handleCancel = () => {
    router.back();
  };

  const validateNome = (nome: string) => {
    // Permite apenas letras (incluindo acentos) e espaços
    const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;
    return nomeRegex.test(nome);
  };

  const validateCpfInput = (cpf: string) => {
    // Para validação durante digitação - permite apenas números
    const cpfNumbers = cpf.replace(/\D/g, '');
    return cpfNumbers.length <= 11 && /^\d*$/.test(cpfNumbers);
  };

  const validateGrupo = (grupo: string) => {
    // Permite apenas letras minúsculas (sem espaços)
    const grupoRegex = /^[a-z]*$/;
    return grupoRegex.test(grupo);
  };

  const handleNomeChange = (text: string) => {
    if (validateNome(text) || text === "") {
      setNome(text);
      if (nomeError) setNomeError("");
    }
  };

  const handleCpfChange = (text: string) => {
    // Usa o formatador do utilitário
    const formattedCpf = formatCPF(text);
    const cleanedCpf = cleanCPF(text);
    
    if (cleanedCpf.length <= 11) {
      setCpf(formattedCpf);
      
      // Valida o CPF em tempo real quando tiver 11 dígitos
      if (cleanedCpf.length === 11) {
        const cpfValidation = validateCPF(formattedCpf);
        if (!cpfValidation.isValid) {
          setCpfError(cpfValidation.message || "CPF inválido");
        } else {
          setCpfError("");
        }
      } else {
        // Limpa erro se ainda está digitando
        if (cpfError) setCpfError("");
      }
    }
  };

  const handleGrupoChange = (text: string) => {
    // Converte automaticamente para minúsculas
    const lowercaseText = text.toLowerCase();
    if (validateGrupo(lowercaseText) || lowercaseText === "") {
      setGrupo(lowercaseText);
      if (grupoError) setGrupoError("");
    }
  };

  const handleSenhaChange = (text: string) => {
    setSenha(text);
    if (senhaError) setSenhaError("");
  };

  const handleConfirmarSenhaChange = (text: string) => {
    setConfirmarSenha(text);
    if (confirmarSenhaError) setConfirmarSenhaError("");
  };

  const validateFields = () => {
    let isValid = true;

    // Valida nome apenas se não for usuário comum editando seus próprios dados
    if (!isCurrentUserEditing) {
      if (!nome.trim()) {
        setNomeError("Nome é obrigatório");
        isValid = false;
      } else if (nome.trim().length < 2) {
        setNomeError("Nome deve ter pelo menos 2 caracteres");
        isValid = false;
      } else if (!validateNome(nome)) {
        setNomeError("Nome deve conter apenas letras");
        isValid = false;
      } else {
        setNomeError("");
      }
    }

    // Só valida CPF se não estiver editando
    if (!isEditMode) {
      if (!cpf.trim()) {
        setCpfError("CPF é obrigatório");
        isValid = false;
      } else {
        const cpfValidation = validateCPF(cpf);
        if (!cpfValidation.isValid) {
          setCpfError(cpfValidation.message || "CPF inválido");
          isValid = false;
        } else {
          setCpfError("");
        }
      }
    }

    // Valida grupo apenas se não for usuário comum editando seus próprios dados
    if (!isCurrentUserEditing) {
      if (!grupo.trim()) {
        setGrupoError("Grupo é obrigatório");
        isValid = false;
      } else if (!validateGrupo(grupo)) {
        setGrupoError("Grupo deve conter apenas letras minúsculas (sem espaços)");
        isValid = false;
      } else {
        setGrupoError("");
      }
    }

    return isValid;
  };

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

  const clearForm = () => {
    setNome("");
    setCpf("");
    setGrupo("");
    setSelectedGroup("");
    setIsUserAdmin(false);
    setNomeError("");
    setCpfError("");
    setGrupoError("");
  };

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
      if (isEditMode) {
        // Volta para a tela anterior quando estiver editando
        router.back();
      } else {
        // Limpa o formulário apenas quando estiver cadastrando
        clearForm();
      }
    });
  };

  const handleSignUp = async () => {
    if (!validateFields()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode) {
        // Para modo de edição, ainda usa a função local (ou pode implementar API de update)
        const userData = {
          name: nome.trim(),
          cpf: cpf, // CPF já formatado
          group: grupo.trim(),
          isAdmin: isUserAdmin,
        };
        const userId = parseInt(params.userId as string);
        updateUser(userId, userData);
        showSuccessModalWithAnimation();
      } else {
        // Registrar novo usuário via API
        const result = await apiService.register({
          nomeCompleto: nome.trim(),
          cpf: cleanCPF(cpf),
          senha: senha,
          confirmarSenha: confirmarSenha,
          nomeGrupo: grupo.trim(),
          adm: isUserAdmin
        });

        if (result.success) {
          showSuccessModalWithAnimation();
        } else {
          Alert.alert("Erro", result.error || "Erro ao cadastrar usuário");
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Erro de conexão com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

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
              {isEditMode 
                ? `Dados atualizados com sucesso como ${userType}!`
                : `Cadastro realizado com sucesso como ${userType}!`
              }
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
                  isCurrentUserEditing && styles.inputDisabled,
                ]}
                placeholder="Digite seu nome completo"
                placeholderTextColor="#B0B0B0"
                value={nome}
                onChangeText={isCurrentUserEditing ? undefined : handleNomeChange}
                editable={!isCurrentUserEditing}
              />
              {nomeError ? <Text style={styles.errorText}>{nomeError}</Text> : null}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>CPF:</Text>
              <TextInput
                style={[
                  styles.input,
                  isLargeScreen && styles.inputLarge,
                  cpfError ? styles.inputError : null,
                  isEditMode && styles.inputDisabled,
                ]}
                placeholder="Digite seu CPF"
                placeholderTextColor="#B0B0B0"
                keyboardType="numeric"
                value={cpf}
                onChangeText={isEditMode ? undefined : handleCpfChange}
                maxLength={14} // XXX.XXX.XXX-XX
                editable={!isEditMode}
              />
              {cpfError ? <Text style={styles.errorText}>{cpfError}</Text> : null}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Senha:</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.inputSenha,
                    isLargeScreen && styles.inputLarge,
                    senhaError ? styles.inputError : null,
                  ]}
                  placeholder="Digite sua senha"
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
              <Text style={styles.label}>Confirmar Senha:</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.inputSenha,
                    isLargeScreen && styles.inputLarge,
                    confirmarSenhaError ? styles.inputError : null,
                  ]}
                  placeholder="Confirme sua senha"
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

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Grupo:</Text>
              <TextInput
                style={[
                  styles.input,
                  isLargeScreen && styles.inputLarge,
                  grupoError ? styles.inputError : null,
                  isCurrentUserEditing && styles.inputDisabled,
                ]}
                placeholder="Digite o nome do grupo"
                placeholderTextColor="#B0B0B0"
                autoCapitalize="none"
                value={grupo}
                onChangeText={isCurrentUserEditing ? undefined : handleGrupoChange}
                editable={!isCurrentUserEditing}
              />
              {grupoError ? <Text style={styles.errorText}>{grupoError}</Text> : null}
            </View>

            {/* Checkbox de Administrador - só aparece para novos cadastros ou quando admin está editando */}
            {!isCurrentUserEditing && (
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

            {/* Botões de ação */}
            {isEditMode ? (
              // Modo de edição - dois botões
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[
                    styles.signUpButton,
                    !hasDataChanged() && styles.buttonDisabled
                  ]} 
                  onPress={handleSignUp}
                  disabled={!hasDataChanged()}
                >
                  <Text style={[
                    styles.signUpButtonText,
                    !hasDataChanged() && styles.buttonTextDisabled
                  ]}>
                    ATUALIZAR
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>CANCELAR</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Modo de criação - botão único
              <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                <Text style={styles.signUpButtonText}>CADASTRAR</Text>
              </TouchableOpacity>
            )}
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
  signUpButton: {
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
  signUpButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginLinkText: {
    color: "#666",
    fontSize: 14,
  },
  loginLinkBold: {
    color: "#001489",
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
  
  // Novos estilos para os botões
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