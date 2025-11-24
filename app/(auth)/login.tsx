import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../../contexts/AuthContext";
import { cleanCPF, formatCPF, validateCPF } from "../../utils/cpfValidator";

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const { setLoggedUser } = useAuth();

  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [cpfError, setCpfError] = useState("");
  const [senhaError, setSenhaError] = useState("");

  // Simulação de usuários pré-cadastrados (em produção viria do backend)
  const usuariosPrecadastrados = [
    {
      id: 1,
      cpf: "123.456.789-00",
      senha: "admin123",
      name: "Administrador Metrô",
      group: "Administração",
      isAdmin: true
    },
    {
      id: 2,
      cpf: "987.654.321-00", 
      senha: "user123",
      name: "Usuário Comum",
      group: "Operação",
      isAdmin: false
    }
  ];

  const handleCpfChange = (text: string) => {
    // Usa o formatador do utilitário
    const formattedCpf = formatCPF(text);
    const cleanedCpf = cleanCPF(text);
    
    if (cleanedCpf.length <= 11) {
      setCpf(formattedCpf);
      if (cpfError) setCpfError("");
    }
  };

  const validateFields = () => {
    let isValid = true;

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

    if (!senha.trim()) {
      setSenhaError("Senha é obrigatória");
      isValid = false;
    } else if (senha.length < 6) {
      setSenhaError("Senha deve ter pelo menos 6 caracteres");
      isValid = false;
    } else {
      setSenhaError("");
    }

    return isValid;
  };

  const handleLogin = () => {
    if (!validateFields()) {
      return;
    }

    // Simula chamada para o backend
    const usuario = usuariosPrecadastrados.find(
      u => u.cpf === cpf && u.senha === senha
    );

    if (usuario) {
      // Simula resposta do backend (sem a senha)
      const { senha: _, ...dadosUsuario } = usuario;
      setLoggedUser(dadosUsuario);
      router.push("/(drawer)/home");
    } else {
      Alert.alert("Erro", "CPF ou senha inválidos");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
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

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>CPF:</Text>
          <TextInput
            style={[
              styles.input,
              isLargeScreen && styles.inputLarge,
              cpfError ? styles.inputError : null
            ]}
            placeholder="Digite seu CPF"
            placeholderTextColor="#B0B0B0"
            keyboardType="numeric"
            autoCapitalize="none"
            value={cpf}
            onChangeText={handleCpfChange}
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
                senhaError ? styles.inputError : null
              ]}
              placeholder="Digite sua senha"
              placeholderTextColor="#B0B0B0"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={(text) => {
                setSenha(text);
                if (senhaError) setSenhaError("");
              }}
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
          <Text
            style={styles.forgotPassword}
            onPress={() => router.push("/(auth)/forgotPassword")}
          >
            Esqueceu a senha?
          </Text>
        </View>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>ENTRAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    width: 140,
    height: 190,
    marginBottom: 40,
    resizeMode: "contain",
  },
  logoLarge: {
    width: 180,
    height: 200,
    marginBottom: 50,
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 20,
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
    fontSize: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  forgotPassword: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 8,
    marginLeft: 10,
  },
  createAccount: {
    color: "#0A0486",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10,
    marginLeft: 10,
  },
  loginButton: {
    width: "60%",
    height: 50,
    backgroundColor: "#001489",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
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
});