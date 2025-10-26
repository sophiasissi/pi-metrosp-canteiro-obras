import React from "react";
import {
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useProjects } from "../contexts/ProjectContext";

interface PhotoProgressListProps {
  projectId: string;
}

interface PhotoProgress {
  id: string;
  imageNumber: string;
  progress: number;
  date: string;
  image?: string;
}

export default function PhotoProgressList({ projectId }: PhotoProgressListProps) {
  const { projects } = useProjects();

  const project = projects.find(p => p.id === projectId);


  const photoProgress: PhotoProgress[] = [];


  if (project?.image) {
    photoProgress.push({
      id: 'initial',
      imageNumber: 'imagem #1',
      progress: 0,
      date: project.createdAt.toLocaleDateString('pt-BR'),
      image: project.image,
    });
  }


  if (project?.progressHistory) {
    project.progressHistory.forEach((entry, index) => {
      photoProgress.push({
        id: entry.id,
        imageNumber: `imagem #${photoProgress.length + 1}`,
        progress: entry.progress,
        date: entry.createdAt.toLocaleDateString('pt-BR'),
        image: entry.image,
      });
    });
  }


  if (photoProgress.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum progresso adicionado ainda</Text>
          <Text style={styles.emptySubtext}>Adicione fotos do progresso para acompanhar o desenvolvimento</Text>
        </View>
      </View>
    );
  }

  const getProgressColor = (progress: number) => {
    if (progress <= 25) return '#8E44AD';
    if (progress <= 50) return '#E67E22';
    if (progress <= 75) return '#E74C3C';
    return '#F39C12';
  };

  const renderProgressItem = (item: PhotoProgress) => (
    <View key={item.id} style={styles.progressItem}>
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.progressImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: getProgressColor(item.progress) }]}>
            <Text style={styles.imageText}>{item.imageNumber}</Text>
          </View>
        )}
      </View>
      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>Progresso: {item.progress}%</Text>
        <Text style={styles.dateText}>Data: {item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {photoProgress.map(renderProgressItem)}
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
  dateText: {
    fontSize: 12,
    color: "#666",
  },
});