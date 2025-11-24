import * as ImagePicker from 'expo-image-picker';
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useProjects } from "../contexts/ProjectContext";

interface AddProgressModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
}

export default function AddProgressModal({ visible, onClose, projectId }: AddProgressModalProps) {
  const { projects, addProgressEntry } = useProjects();
  const [progressImage, setProgressImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return null;
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
      'Selecionar Imagem',
      'Como você gostaria de adicionar a imagem?',
      [
        { text: 'Câmera', onPress: openCamera },
        { text: 'Galeria', onPress: openGallery },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
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
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setProgressImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao abrir galeria:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  };

  const handleSaveProgress = async () => {
    if (!progressImage) {
      Alert.alert('Erro', 'Por favor, adicione uma foto do progresso.');
      return;
    }

    setIsAnalyzing(true);

    try {
      // TODO: Integração com CNN do backend
      // const analysisResult = await analyzProgressWithCNN(progressImage, project.image);
      
      // Simulação do tempo de análise da CNN
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Por enquanto, mantemos um progresso temporário até a integração com a CNN
      // Futuramente, será: progress: analysisResult.progressPercentage
      const temporaryProgress = Math.min(100, ((project?.progressHistory?.length || 0) + 1) * 10);

      addProgressEntry(projectId, {
        progress: temporaryProgress,
        image: progressImage,
      });
      
      setIsAnalyzing(false);
      handleClose();
    } catch {
      setIsAnalyzing(false);
      Alert.alert('Erro', 'Falha ao analisar o progresso. Tente novamente.');
    }
  };

  const handleClose = () => {
    setProgressImage(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Adicionar Progresso</Text>

          {}
          <View style={styles.section}>
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.confirmButton, 
                (isAnalyzing || !progressImage) && styles.buttonDisabled
              ]}
              onPress={handleSaveProgress}
              disabled={isAnalyzing || !progressImage}
            >
              <Text style={[
                styles.confirmButtonText,
                !progressImage && styles.disabledButtonText
              ]}>
                Confirmar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, isAnalyzing && styles.buttonDisabled]}
              onPress={handleClose}
              disabled={isAnalyzing}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          {/* Loading de Análise */}
          {isAnalyzing && (
            <View style={styles.analysisOverlay}>
              <View style={styles.analysisContainer}>
                <ActivityIndicator size="large" color="#001489" />
                <Text style={styles.analysisTitle}>Analisando progresso...</Text>
                <Text style={styles.analysisSubtitle}>
                  Comparando com a planta baixa
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 25,
    width: "100%",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001489",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  imageSelector: {
    height: 120,
    backgroundColor: "#F8F9FA",
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
    marginTop: 8,
    fontSize: 12,
    color: "#001489",
    textAlign: "center",
  },
  buttonContainer: {
    gap: 12,
  },
  confirmButton: {
    backgroundColor: "#001489",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButtonText: {
    color: "#CCCCCC",
  },
  cancelButton: {
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#001489",
  },
  cancelButtonText: {
    color: "#001489",
    fontSize: 16,
    fontWeight: "normal",
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: "#E0E0E0",
  },
  analysisOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  analysisContainer: {
    alignItems: 'center',
    padding: 30,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001489',
    marginTop: 15,
    textAlign: 'center',
  },
  analysisSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});