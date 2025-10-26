import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
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

export default function ForgotPasswordScreen() {
  const { width } = useWindowDimensions(); // largura da tela
  const isLargeScreen = width > 600; // "media query" — tablets ou telas grandes

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");

  // Função para validar email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para validar campos
  const validateFields = () => {
    let isValid = true;
    
    // Validar email
    if (!email.trim()) {
      setEmailError("Email é obrigatório");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Email inválido");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Validar senha atual
    if (!currentPassword.trim()) {
      setCurrentPasswordError("Senha atual é obrigatória");
      isValid = false;
    } else if (currentPassword.length < 6) {
      setCurrentPasswordError("Senha deve ter pelo menos 6 caracteres");
      isValid = false;
    } else {
      setCurrentPasswordError("");
    }

    // Validar nova senha
    if (!newPassword.trim()) {
      setNewPasswordError("Nova senha é obrigatória");
      isValid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError("Nova senha deve ter pelo menos 6 caracteres");
      isValid = false;
    } else if (newPassword === currentPassword) {
      setNewPasswordError("Nova senha deve ser diferente da atual");
      isValid = false;
    } else {
      setNewPasswordError("");
    }

    return isValid;
  };

  const handleResetPassword = () => {
    if (!validateFields()) {
      return;
    }

    // Limpar os campos após validação bem-sucedida
    setEmail("");
    setCurrentPassword("");
    setNewPassword("");

    // Navegação direta sem Alert para garantir que funcione
    router.replace("/(auth)/login");
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

            <Text style={[styles.title, isLargeScreen && styles.titleLarge]}>
              Redefinir Senha
            </Text>

            {/* Campo de e-mail */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email:</Text>
              <TextInput
                style={[
                  styles.input, 
                  isLargeScreen && styles.inputLarge,
                  emailError ? styles.inputError : null
                ]}
                placeholder="Digite seu email"
                placeholderTextColor="#B0B0B0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(""); // Limpa erro ao digitar
                }}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Campo de senha atual */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Senha Atual:</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.inputSenha, 
                    isLargeScreen && styles.inputLarge,
                    currentPasswordError ? styles.inputError : null
                  ]}
                  placeholder="Digite sua senha atual"
                  placeholderTextColor="#B0B0B0"
                  secureTextEntry={!mostrarSenhaAtual}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (currentPasswordError) setCurrentPasswordError(""); // Limpa erro ao digitar
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                >
                  <Icon
                    name={mostrarSenhaAtual ? "eye-slash" : "eye"}
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>
              {currentPasswordError ? <Text style={styles.errorText}>{currentPasswordError}</Text> : null}
            </View>

            {/* Campo de nova senha */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Nova Senha:</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.inputSenha, 
                    isLargeScreen && styles.inputLarge,
                    newPasswordError ? styles.inputError : null
                  ]}
                  placeholder="Digite sua nova senha"
                  placeholderTextColor="#B0B0B0"
                  secureTextEntry={!mostrarNovaSenha}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (newPasswordError) setNewPasswordError(""); // Limpa erro ao digitar
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                >
                  <Icon
                    name={mostrarNovaSenha ? "eye-slash" : "eye"}
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>
              {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}
            </View>

            {/* Botão Redefinir Senha */}
            <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
              <Text style={styles.resetButtonText}>REDEFINIR SENHA</Text>
            </TouchableOpacity>

            {/* Botão Voltar */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.backButtonText}>Voltar para Login</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001489",
    marginBottom: 30,
    textAlign: "center",
  },
  titleLarge: {
    fontSize: 28,
    marginBottom: 40,
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
  resetButton: {
    width: "70%",
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
  resetButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: "#001489",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
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