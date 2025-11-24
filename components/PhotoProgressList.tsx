import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
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

export default function PhotoProgressList({
  projectId,
}: PhotoProgressListProps) {
  const { projects, removeProgressImage } = useProjects();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const project = projects.find(
    (p) => p.id === projectId || String(p.projetoID) === String(projectId)
  );
  const photoProgress: PhotoProgress[] = [];

  const formatDate = (d?: string | Date | null) => {
    if (!d) return "";
    try {
      const dateObj = typeof d === "string" ? new Date(d) : d;
      if (!dateObj || isNaN((dateObj as Date).getTime())) return String(d);
      return (dateObj as Date).toLocaleDateString("pt-BR");
    } catch {
      return String(d);
    }
  };

  if (project?.progressHistory) {
    const totalImages = project.progressHistory.length;
    const sortedHistory = [...project.progressHistory].reverse();

    sortedHistory.forEach((entry, index) => {
      photoProgress.push({
        id: entry.id,
        imageNumber: `Imagem ${totalImages - index}`,
        progress: entry.progress,
        date: formatDate(entry.createdAt),
        image: entry.image,
      });
    });
  }

  if (project?.image) {
    photoProgress.push({
      id: "initial",
      imageNumber: "Planta Baixa",
      progress: 0,
      date: formatDate(project.createdAt),
      image: project.image,
    });
  }

  if (photoProgress.length === 0) {
    console.log("PhotoProgressList: project", project);
    console.log(
      "PhotoProgressList: photoProgress length",
      photoProgress.length
    );
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
    if (progress === 0) return "#95A5A6";
    if (progress <= 20) return "#E74C3C";
    if (progress <= 40) return "#FF6B35";
    if (progress <= 60) return "#F39C12";
    if (progress <= 80) return "#F1C40F";
    if (progress < 100) return "#2ECC71";
    return "#27AE60";
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

      {/* Delete button for each progress image */}
      {item.id !== "initial" && (
        <TouchableOpacity
          style={styles.deleteImageButton}
          onPress={() => {
            Alert.alert(
              "Confirmar",
              "Deseja excluir esta imagem de progresso?",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Excluir",
                  style: "destructive",
                  onPress: async () => {
                    const imgIdNum = Number(item.id);
                    const projIdNum = Number(projectId);
                    await removeProgressImage(projIdNum, imgIdNum);
                    // Optionally you can handle res.success here
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      )}

      <View style={styles.progressInfo}>
        <Text style={styles.imageName}>{item.imageNumber}</Text>
        <Text style={styles.dateText}>Data: {item.date}</Text>
        {/* Progress bar for this specific image */}
        <View style={styles.singleProgressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progresso</Text>
            <Text
              style={[
                styles.progressPercent,
                { color: getProgressColor(item.progress || 0) },
              ]}
            >
              {item.progress ?? 0}%
            </Text>
          </View>
          <View style={styles.progressBarContainerSmall}>
            <View style={styles.progressBarBackgroundSmall}>
              <View
                style={[
                  styles.progressBarFillSmall,
                  {
                    width: `${item.progress ?? 0}%`,
                    backgroundColor: getProgressColor(item.progress ?? 0),
                  },
                ]}
              />
            </View>
          </View>
        </View>
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
  singleProgressSection: {
    marginTop: 8,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarContainerSmall: {
    width: "100%",
  },
  progressBarBackgroundSmall: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFillSmall: {
    height: "100%",
    borderRadius: 3,
  },
  deleteImageButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  deleteText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
  },
});
