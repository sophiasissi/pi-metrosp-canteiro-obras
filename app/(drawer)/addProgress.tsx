import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useProjects } from "../../contexts/ProjectContext";

export default function AddProgressScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const { projectId } = useLocalSearchParams();
  const { projects, addProgressEntry } = useProjects();

  const [progressImage, setProgressImage] = useState<string | null>(null);

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Projeto não encontrado</Text>
      </View>
    );
  }

  const handleSelectImage = async () => {
    if (Platform.OS === 'web') {
      openGallery();
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para acessar a câmera.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      "Adicionar Foto",
      "Escolha uma opção:",
      [
        { text: "Câmera", onPress: openCamera },
        { text: "Galeria", onPress: openGallery },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setProgressImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao abrir câmera:', error);
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setProgressImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao abrir galeria:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  };

  const handleSaveProgress = () => {
    if (!progressImage) {
      Alert.alert('Erro', 'Por favor, adicione uma foto do progresso.');
      return;
    }


    const currentProgressCount = project?.progressHistory?.length || 0;
    const newProgressPercent = Math.min(100, (currentProgressCount + 1) * 10);


    addProgressEntry(projectId as string, {
      progress: newProgressPercent,
      image: progressImage,
    });


    setProgressImage(null);

    Alert.alert(
      "Sucesso!",
      "Progresso adicionado com sucesso! Você pode adicionar mais fotos.",
      [
        {
          text: "OK",
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {}
          <View style={styles.header}>
            <Text style={styles.title}>Adicionar Progresso</Text>
            <Text style={styles.projectName}>{project.name}</Text>
            <View style={styles.divider} />
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Foto do Progresso</Text>
            <TouchableOpacity
              style={styles.imageSelector}
              onPress={handleSelectImage}
            >
              {progressImage ? (
                <Image source={{ uri: progressImage }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="camera" size={30} color="#001489" />
                  <Text style={styles.imagePlaceholderText}>
                    Toque para adicionar foto
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.infoText}>
              📊 O progresso será calculado automaticamente baseado no número de fotos
            </Text>
            <Text style={styles.infoText}>
              📅 A data será definida automaticamente para hoje
            </Text>
          </View>

          {}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProgress}
          >
            <Text style={styles.saveButtonText}>Salvar Progresso</Text>
          </TouchableOpacity>

          {}
          {project.progressHistory && project.progressHistory.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progresso Atual ({project.progressHistory.length} fotos)</Text>
              <View style={styles.progressGrid}>
                {}
                {project.image && (
                  <View style={styles.progressCard}>
                    <Image source={{ uri: project.image }} style={styles.progressCardImage} />
                    <Text style={styles.progressCardText}>Inicial</Text>
                    <Text style={styles.progressCardDate}>
                      {typeof project.createdAt === 'string'
                        ? new Date(project.createdAt).toLocaleDateString('pt-BR')
                        : project.createdAt.toLocaleDateString('pt-BR')
                      }
                    </Text>
                  </View>
                )}

                {}
                {project.progressHistory.map((progress, index) => (
                  <View key={progress.id} style={styles.progressCard}>
                    <Image source={{ uri: progress.image }} style={styles.progressCardImage} />
                    <Text style={styles.progressCardText}>#{index + 1}</Text>
                    <Text style={styles.progressCardDate}>
                      {typeof progress.createdAt === 'string'
                        ? new Date(progress.createdAt).toLocaleDateString('pt-BR')
                        : progress.createdAt.toLocaleDateString('pt-BR')
                      }
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001489",
    marginBottom: 10,
  },
  projectName: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  divider: {
    height: 2,
    backgroundColor: "#CCCCCC",
    width: "100%",
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  imageSelector: {
    height: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  imagePlaceholder: {
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#001489",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 100,
  },
  saveButton: {
    backgroundColor: "#001489",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 30,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 5,
    fontStyle: "italic",
  },
  progressGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  progressCard: {
    width: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressCardImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginBottom: 5,
  },
  progressCardText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#001489",
    marginBottom: 2,
  },
  progressCardDate: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
});