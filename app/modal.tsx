import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  Alert,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { Link, router } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation(); // Definindo a navegação
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = () => {
    fetch("http://192.168.0.171:4002/login", {
      // PORTA DO BANCO DE DADOS MUDE DE ACORDO COM O SEU
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Resposta recebida:", data); // Log para verificar a resposta do servidor
        if (data.success) {
          Alert.alert("Sucesso", data.message);
          router.push("/(tabs)/rastreio"); // Navegar para a tela de rastreio
        } else {
          Alert.alert("Erro", data.message);
        }
      })
      .catch((error) => {
        console.error("Erro:", error);
        Alert.alert("Erro", "Não foi possível realizar o login");
      });
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require("@/assets/images/assinatura-chapada.png")}
        style={styles.logo}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="white"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputSenha}
          placeholder="Senha"
          placeholderTextColor="white"
          secureTextEntry={!mostrarSenha}
          value={senha}
          onChangeText={setSenha}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setMostrarSenha(!mostrarSenha)}
        >
          <Icon
            name={mostrarSenha ? "eye-slash" : "eye"}
            size={20}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>

      <Link href="/(tabs)/rastreio">View details</Link>

      <TouchableOpacity
        onPress={() => router.push("/forgot/ResetPasswordScreen")}
      >
        <Text style={styles.forgotPassword}>Esqueci a senha</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.navigate("/cadastrar")}>
        <Text style={styles.register}>Realizar Cadastro</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E1EFFE",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#799DD4",
    width: "90%",
    height: 60,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  logo: {
    width: 150,
    height: 200,
    marginBottom: 30,
  },
  inputSenha: {
    backgroundColor: "#799DD4",
    width: "100%",
    height: 60,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  passwordContainer: {
    width: "90%",
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 20,
  },
  loginButton: {
    width: "70%",
    height: 50,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    marginBottom: 15,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPassword: {
    color: "#007bff",
    marginTop: 10,
    textAlign: "center",
  },
  register: {
    color: "#007bff",
    marginTop: 20,
    textAlign: "center",
  },
});