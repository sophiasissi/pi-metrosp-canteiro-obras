import * as ImagePicker from 'expo-image-picker';
import React, { useState } from "react";
import {
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

  const handleSaveProgress = () => {
    if (!progressImage) {
      Alert.alert('Erro', 'Por favor, adicione uma foto do progresso.');
      return;
    }

    const currentProgressCount = project?.progressHistory?.length || 0;
    const newProgressPercent = Math.min(100, (currentProgressCount + 1) * 10);

    addProgressEntry(projectId, {
      progress: newProgressPercent,
      image: progressImage,
    });
    handleClose();
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
              style={styles.confirmButton}
              onPress={handleSaveProgress}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
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
});