import React, { useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useProjects } from "../contexts/ProjectContext";
import ImageModal from "./ImageModal"; // ✅ importando o modal reutilizável

interface PhotoProgressListProps {
  projectId: string;
}

interface PhotoProgress {
  id: string;
  imageNumber: string;
  progress?: number;
  date: string;
  image?: string;
}

export default function PhotoProgressList({ projectId }: PhotoProgressListProps) {
  const { projects } = useProjects();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const project = projects.find(p => p.id === projectId);
  const photoProgress: PhotoProgress[] = [];

  if (project?.progressHistory) {
    const totalImages = project.progressHistory.length;
    const sortedHistory = [...project.progressHistory].reverse();
    
    sortedHistory.forEach((entry, index) => {
      photoProgress.push({
        id: entry.id,
        imageNumber: `Imagem ${totalImages - index}`,
        progress: entry.progress,
        date: entry.createdAt.toLocaleDateString('pt-BR'),
        image: entry.image,
      });
    });
  }

  if (project?.image) {
    photoProgress.push({
      id: 'initial',
      imageNumber: 'Planta Baixa',
      progress: 0,
      date: project.createdAt.toLocaleDateString('pt-BR'),
      image: project.image,
    });
  }

  if (photoProgress.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhuma imagem adicionada ainda</Text>
          <Text style={styles.emptySubtext}>
            Adicione fotos para acompanhar o desenvolvimento do projeto
          </Text>
        </View>
      </View>
    );
  }

  const getProgressColor = (progress: number) => {
    if (progress === 0) return '#95A5A6';
    if (progress <= 20) return '#E74C3C';
    if (progress <= 40) return '#FF6B35';
    if (progress <= 60) return '#F39C12';
    if (progress <= 80) return '#F1C40F';
    if (progress < 100) return '#2ECC71';
    return '#27AE60';
  };

  const handleImagePress = (imageUri?: string) => {
    if (!imageUri) return;
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const renderProgressItem = (item: PhotoProgress) => (
    <View key={item.id} style={styles.progressItem}>
      <TouchableOpacity
        style={styles.imageContainer}
        activeOpacity={0.8}
        onPress={() => handleImagePress(item.image)}
      >
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.progressImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: getProgressColor(item.progress || 0) },
            ]}
          >
            <Text style={styles.imageText}>{item.imageNumber}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.progressInfo}>
        <Text style={styles.imageName}>{item.imageNumber}</Text>
        <Text style={styles.dateText}>Data: {item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {photoProgress.map(renderProgressItem)}

      {/* ✅ Modal de imagem reutilizável */}
      <ImageModal
        visible={modalVisible}
        imageUri={selectedImage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  progressItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginBottom: 15,
    borderRadius: 10,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    alignItems: "center",
  },
  imageContainer: {
    width: 120,
    height: 80,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: 15,
    overflow: "hidden",
  },
  progressImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  progressInfo: {
    flex: 1,
    paddingVertical: 15,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  imageName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
  },
});
