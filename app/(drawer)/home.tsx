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
  Alert,
} from "react-native";
import ImageModal from "../../components/ImageModal";
import { useProjects } from "../../contexts/ProjectContext";
import { Modal, TextInput } from "react-native";
import type { Project, ProgressImage } from "../../types/api";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const { projects, deleteProject, updateProject } = useProjects();

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

  const handleDeleteProject = (projetoID: number) => {
    Alert.alert("Confirmação", "Deseja realmente excluir este projeto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deleteProject(projetoID);
        },
      },
    ]);
  };

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingDate, setEditingDate] = useState("");
  // Overflow menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuProjectId, setMenuProjectId] = useState<number | null>(null);

  const openEditModal = (projetoID: number, currentDate?: string | null) => {
    setEditingProjectId(projetoID);
    setEditingDate(currentDate ?? "");
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProjectId) return;
    // Expect format YYYY-MM-DD
    await updateProject(editingProjectId, { dataFim: editingDate });
    setEditModalVisible(false);
    setEditingProjectId(null);
    setEditingDate("");
  };

  const getProjectColor = (progress: number) => {
    if (progress === 0) return "#95A5A6"; // Cinza - Não iniciado
    if (progress <= 20) return "#E74C3C"; // Vermelho - Muito baixo
    if (progress <= 40) return "#FF6B35"; // Laranja avermelhado - Baixo
    if (progress <= 60) return "#F39C12"; // Laranja - Médio baixo
    if (progress <= 80) return "#F1C40F"; // Amarelo - Médio alto
    if (progress < 100) return "#2ECC71"; // Verde claro - Alto
    return "#27AE60"; // Verde escuro - Completo
  };

  const getProgressBarColor = (progress: number) => {
    if (progress === 0) return "#BDC3C7"; // Cinza claro - Não iniciado
    if (progress <= 20) return "#E74C3C"; // Vermelho - Muito baixo
    if (progress <= 40) return "#FF6B35"; // Laranja avermelhado - Baixo
    if (progress <= 60) return "#F39C12"; // Laranja - Médio baixo
    if (progress <= 80) return "#F1C40F"; // Amarelo - Médio alto
    if (progress < 100) return "#2ECC71"; // Verde claro - Alto
    return "#27AE60"; // Verde escuro - Completo
  };

  const handleProjectPress = (projectId: string) => {
    router.push({
      pathname: "/(drawer)/projectDetails" as any,
      params: { projectId },
    });
  };

  // Retorna a imagem a ser exibida no card: preferir imagemInicial, senão última imagem de progresso
  const getCardImage = (project: Project) => {
    // Preferir a última imagem de progresso (se existir). Caso não exista, usar imagemInicial.
    const lastProgressImage =
      project.imagensProgresso && project.imagensProgresso.length > 0
        ? project.imagensProgresso[project.imagensProgresso.length - 1]
            ?.caminhoImagem
        : // fallback para progressHistory (compatibilidade)
        project.progressHistory && project.progressHistory.length > 0
        ? project.progressHistory[project.progressHistory.length - 1]?.image
        : null;

    if (lastProgressImage) return lastProgressImage;
    return project.imagemInicial ?? null;
  };

  // Retorna a maior porcentagem entre as imagens de progresso, ou null se não houver imagens
  const getMaxProgress = (project: Project): number | null => {
    if (project.imagensProgresso && project.imagensProgresso.length > 0) {
      return Math.max(
        ...project.imagensProgresso.map((img) => img.porcentagem || 0)
      );
    }
    return null;
  };

  const renderProject = ({ item }: { item: Project }) => {
    const imageList: string[] =
      item.imagensProgresso && item.imagensProgresso.length > 0
        ? item.imagensProgresso.map((img) => img.caminhoImagem).filter(Boolean)
        : item.progressHistory && item.progressHistory.length > 0
        ? item.progressHistory.map((h: any) => h.image).filter(Boolean)
        : item.imagemInicial
        ? [item.imagemInicial]
        : [];

    const lastImage =
      imageList.length > 0 ? imageList[imageList.length - 1] : null;
    const maxProgress = getMaxProgress(item);
    return (
      <View style={styles.projectContainer}>
        {/* overflow menu in top-right of the card */}
        <TouchableOpacity
          style={styles.cardMenuButton}
          onPress={() => {
            setMenuProjectId(item.projetoID);
            setMenuVisible(true);
          }}
        >
          <Text style={styles.menuText}>⋮</Text>
        </TouchableOpacity>
        <View style={styles.projectImageContainer}>
          {imageList.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center", padding: 5 }}
            >
              {imageList.map((uri, idx) => (
                <TouchableOpacity
                  key={String(idx)}
                  onPress={() => uri && handleImagePress(uri)}
                  activeOpacity={0.8}
                  style={styles.thumbWrapper}
                >
                  <Image
                    source={{ uri }}
                    style={styles.thumbImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.projectImagePlaceholder,
                { backgroundColor: getProjectColor(maxProgress ?? 0) },
              ]}
            >
              <Text style={styles.projectImageText}>sem imagens</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.projectDetails}
          onPress={() => handleProjectPress(item.projetoID.toString())}
        >
          <Text style={styles.projectName}>{item.nomeProjeto}</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progresso</Text>
            {maxProgress === null ? (
              <Text style={[styles.progressPercent, { color: "#666" }]}>
                Sem dados
              </Text>
            ) : (
              <Text
                style={[
                  styles.progressPercent,
                  { color: getProgressBarColor(maxProgress) },
                ]}
              >
                {maxProgress}%
              </Text>
            )}
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${maxProgress ?? 0}%`,
                    backgroundColor: getProgressBarColor(maxProgress ?? 0),
                  },
                ]}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Menu modal for per-card actions (edit / delete)
  const MenuModal = () => {
    const projId = menuProjectId;
    const projeto = projects.find((p) => p.projetoID === projId);
    return (
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setMenuVisible(false);
                if (projId)
                  openEditModal(
                    projId,
                    String(projeto?.dataFim ?? projeto?.createdAt ?? "")
                  );
              }}
            >
              <Text style={styles.menuOptionText}>Editar data final</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuOption,
                { borderTopWidth: 1, borderTopColor: "#EEE" },
              ]}
              onPress={() => {
                setMenuVisible(false);
                if (projId) handleDeleteProject(projId);
              }}
            >
              <Text style={[styles.menuOptionText, { color: "#E74C3C" }]}>
                Excluir projeto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuOption, { marginTop: 8 }]}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={[styles.menuOptionText, { color: "#666" }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Edit Modal UI
  const EditModal = () => (
    <Modal
      visible={editModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.editContainer}>
          <Text style={styles.editTitle}>Editar Data Final (YYYY-MM-DD)</Text>
          <TextInput
            value={editingDate}
            onChangeText={setEditingDate}
            style={styles.input}
            placeholder="2025-12-31"
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              style={[styles.cancelButton, { flex: 1, marginRight: 8 }]}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveEdit}
              style={[styles.confirmButton, { flex: 1, marginLeft: 8 }]}
            >
              <Text style={styles.confirmButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
              data={projects}
              renderItem={renderProject}
              keyExtractor={(item) => item.projetoID.toString()}
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
  thumbWrapper: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
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

  cardMenuButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 6,
  },
  menuText: {
    fontSize: 20,
    color: "#666",
  },
  menuContainer: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    overflow: "hidden",
  },
  menuOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuOptionText: {
    fontSize: 16,
    color: "#001489",
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  editContainer: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#001489",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  confirmButton: {
    backgroundColor: "#001489",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: { color: "#FFF", fontWeight: "700" },
  cancelButton: {
    backgroundColor: "#EEE",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: { color: "#001489", fontWeight: "700" },
});
