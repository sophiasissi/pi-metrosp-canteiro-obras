import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from "react-native";
import AddProgressModal from "../../components/AddProgressModal";
import PhotoProgressList from "../../components/PhotoProgressList";
import { useProjects } from "../../contexts/ProjectContext";

export default function ProjectDetailsScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const { projectId } = useLocalSearchParams();
  const { projects } = useProjects();
  const [modalVisible, setModalVisible] = useState(false);

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Projeto não encontrado</Text>
      </View>
    );
  }

  const handleAddProgress = () => {
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.header}>
          <Text style={styles.projectName}>{project.name}</Text>
          <View style={styles.divider} />
        </View>

        {}
        <View style={styles.projectInfo}>
          <Text style={styles.infoText}>
            Período de Tempo: {project.period}
          </Text>
          <Text style={styles.infoText}>
            Localização: {project.location}
          </Text>
          <Text style={styles.infoText}>
            Grupo: {project.group}
          </Text>
        </View>

        <View style={styles.divider} />

        {}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.addProgressButton,
              isLargeScreen && styles.addProgressButtonLarge,
            ]}
            onPress={handleAddProgress}
          >
            <Text style={styles.addProgressButtonText}>
              Adicionar Novo Progresso
            </Text>
          </TouchableOpacity>
        </View>

        {}
        <PhotoProgressList projectId={project.id} />
      </ScrollView>

      {}
      <AddProgressModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        projectId={project.id}
      />
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
  header: {
    paddingVertical: 20,
    alignItems: "center",
  },
  projectName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001489",
    textAlign: "center",
    marginBottom: 15,
  },
  divider: {
    height: 2,
    backgroundColor: "#CCCCCC",
    width: "100%",
  },
  projectInfo: {
    paddingVertical: 20,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  addProgressButton: {
    backgroundColor: "#001489",
    paddingHorizontal: 30,
    paddingVertical: 12,
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
  addProgressButtonLarge: {
    width: 280,
    paddingVertical: 15,
  },
  addProgressButtonText: {
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
});