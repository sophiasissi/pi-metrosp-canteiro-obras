import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import { Project, useProjects } from "../../contexts/ProjectContext";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const { projects } = useProjects();

  useEffect(() => {

  }, [projects]);

  const handleNewProject = () => {
    router.push("/(drawer)/addProject");
  };

  const getProjectColor = (progress: number) => {
    if (progress <= 25) return '#8E44AD';
    if (progress <= 50) return '#E67E22';
    if (progress <= 75) return '#E74C3C';
    if (progress < 100) return '#F39C12';
    return '#27AE60';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress <= 25) return '#E74C3C';
    if (progress <= 50) return '#F39C12';
    if (progress < 100) return '#e8d718';
    return '#27AE60';
  };

  const handleProjectPress = (projectId: string) => {
    router.push({
      pathname: "/(drawer)/projectDetails" as any,
      params: { projectId }
    });
  };

  const getLastImage = (project: Project) => {

    const lastProgressImage = project.progressHistory && project.progressHistory.length > 0
      ? project.progressHistory[project.progressHistory.length - 1]?.image
      : null;
    return lastProgressImage || project.image;
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectContainer}
      onPress={() => handleProjectPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.projectImageContainer}>
        {getLastImage(item) ? (
          <Image
            source={{ uri: getLastImage(item) }}
            style={styles.projectImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.projectImagePlaceholder, { backgroundColor: getProjectColor(item.progress) }]}>
            <Text style={styles.projectImageText}>última{'\n'}imagem{'\n'}adicionada</Text>
          </View>
        )}
      </View>
      <View style={styles.projectDetails}>
        <Text style={styles.projectName}>{item.name}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Progresso</Text>
          <Text style={styles.progressPercent}>{item.progress}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${item.progress}%`,
                  backgroundColor: getProgressBarColor(item.progress)
                }
              ]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Sem Dados</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.newProjectSection}>
          <TouchableOpacity
            style={[
              styles.newProjectButton,
              isLargeScreen && styles.newProjectButtonLarge,
            ]}
            onPress={handleNewProject}
          >
            <Text style={styles.newProjectButtonText}>Adicionar Novo Projeto</Text>
          </TouchableOpacity>
        </View>

        {}
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
    </View>
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
  newProjectSection: {
    alignItems: "center",
    paddingVertical: 40,
  },
  newProjectButton: {
    backgroundColor: "#001489",
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newProjectButtonLarge: {
    width: 300,
    paddingVertical: 18,
  },
  newProjectButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  projectsSection: {
    flex: 1,
    paddingBottom: 30,
  },
  sectionDivider: {
    height: 2,
    backgroundColor: "#CCCCCC",
    marginBottom: 20,
  },
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
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  projectContainer: {
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
  },
  projectImageContainer: {
    width: 120,
    height: 100,
    padding: 5,
    overflow: "hidden",
  },
  projectImageText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 16,
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
  progressLabel: {
    fontSize: 14,
    color: "#666",
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  progressBarContainer: {
    width: "100%",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});