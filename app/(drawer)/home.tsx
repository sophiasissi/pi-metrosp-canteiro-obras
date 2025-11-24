import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import ImageModal from "../../components/ImageModal";
import { Project, useProjects } from "../../contexts/ProjectContext";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const { projects } = useProjects();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleImagePress = (imageUri: string | null) => {
    if (!imageUri) return;
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const handleNewProject = () => {
    router.push("/(drawer)/addProject");
  };

  const getProjectColor = (progress: number) => {
    if (progress === 0) return "#95A5A6";        // Cinza - Não iniciado
    if (progress <= 20) return "#E74C3C";        // Vermelho - Muito baixo
    if (progress <= 40) return "#FF6B35";        // Laranja avermelhado - Baixo
    if (progress <= 60) return "#F39C12";        // Laranja - Médio baixo
    if (progress <= 80) return "#F1C40F";        // Amarelo - Médio alto
    if (progress < 100) return "#2ECC71";        // Verde claro - Alto
    return "#27AE60";                            // Verde escuro - Completo
  };

  const getProgressBarColor = (progress: number) => {
    if (progress === 0) return "#BDC3C7";        // Cinza claro - Não iniciado
    if (progress <= 20) return "#E74C3C";        // Vermelho - Muito baixo
    if (progress <= 40) return "#FF6B35";        // Laranja avermelhado - Baixo
    if (progress <= 60) return "#F39C12";        // Laranja - Médio baixo
    if (progress <= 80) return "#F1C40F";        // Amarelo - Médio alto
    if (progress < 100) return "#2ECC71";        // Verde claro - Alto
    return "#27AE60";                            // Verde escuro - Completo
  };

  const getProgressTextColor = (progress: number) => {
    if (progress === 0) return "#666";           // Cinza escuro para contraste com cinza claro
    if (progress <= 60) return "#FFF";           // Branco para cores escuras (vermelho, laranja)
    if (progress <= 80) return "#333";           // Escuro para amarelo
    return "#FFF";                               // Branco para verdes
  };

  const handleProjectPress = (projectId: string) => {
    router.push({
      pathname: "/(drawer)/projectDetails" as any,
      params: { projectId },
    });
  };

  const getLastImage = (project: Project) => {
    const lastProgressImage =
      project.progressHistory && project.progressHistory.length > 0
        ? project.progressHistory[project.progressHistory.length - 1]?.image
        : null;
    return lastProgressImage || project.image;
  };

  const renderProject = ({ item }: { item: Project }) => {
    const lastImage = getLastImage(item);
    return (
      <View style={styles.projectContainer}>
        <TouchableOpacity
          style={styles.projectImageContainer}
          onPress={() => lastImage && handleImagePress(lastImage)}
          activeOpacity={0.8}
        >
          {lastImage ? (
            <Image
              source={{ uri: lastImage }}
              style={styles.projectImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.projectImagePlaceholder,
                { backgroundColor: getProjectColor(item.progress) },
              ]}
            >
              <Text style={styles.projectImageText}>
                última{"\n"}imagem{"\n"}adicionada
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.projectDetails}
          onPress={() => handleProjectPress(item.id)}
        >
          <Text style={styles.projectName}>{item.name}</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progresso</Text>
            <Text 
              style={[
                styles.progressPercent,
                { color: getProgressBarColor(item.progress) }
              ]}
            >
              {item.progress}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${item.progress}%`,
                    backgroundColor: getProgressBarColor(item.progress),
                  },
                ]}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Sem Dados</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.newProjectSection}>
          <TouchableOpacity
            style={[
              styles.newProjectButton,
              isLargeScreen && styles.newProjectButtonLarge,
            ]}
            onPress={handleNewProject}
          >
            <Text style={styles.newProjectButtonText}>
              Adicionar Novo Projeto
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.projectsSection}>
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>Seus Projetos</Text>

          {projects.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={projects.slice(0, 5)}
              renderItem={renderProject}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <ImageModal
        visible={modalVisible}
        imageUri={selectedImage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { flex: 1, paddingHorizontal: 20 },
  newProjectSection: { alignItems: "center", paddingVertical: 40 },
  newProjectButton: {
    backgroundColor: "#001489",
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
    elevation: 5,
  },
  newProjectButtonLarge: { width: 300, paddingVertical: 18 },
  newProjectButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  projectsSection: { flex: 1, paddingBottom: 30 },
  sectionDivider: { height: 2, backgroundColor: "#CCCCCC", marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001489",
    textAlign: "center",
    marginBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center" },
  projectContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: "#000",
    elevation: 3,
  },
  projectImageContainer: {
    width: 120,
    height: 100,
    padding: 5,
    overflow: "hidden",
  },
  projectImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  projectImagePlaceholder: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  projectImageText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 16,
  },
  projectDetails: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
  },
  projectName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 14, color: "#666" },
  progressPercent: { fontSize: 14, fontWeight: "bold", color: "#000" },
  progressBarContainer: { width: "100%" },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 4 },
});
