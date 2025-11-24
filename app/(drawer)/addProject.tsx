import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../../contexts/AuthContext";
import { useProjects } from "../../contexts/ProjectContext";
import { apiService } from "../../services/apiService";

export default function AddProjectScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const { loggedUser } = useAuth();
  const { refreshProjects } = useProjects();

  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [currentDateType, setCurrentDateType] = useState<
    "start" | "end" | null
  >(null);
  const [group, setGroup] = useState("");
  const [projectImage, setProjectImage] = useState<string | null>(null);

  // Estados para grupos
  const [availableGroups, setAvailableGroups] = useState<
    { grupoID: number; nomeGrupo: string }[]
  >([]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [projectNameError, setProjectNameError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [periodError, setPeriodError] = useState("");
  const [groupError, setGroupError] = useState("");
  const [imageError, setImageError] = useState("");

  const formatDate = (date: Date | null) => {
    if (!date) return "Selecione uma data";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Carregar grupos disponíveis quando o componente monta
  useEffect(() => {
    const loadGroups = async () => {
      setLoadingGroups(true);
      try {
        const result = await apiService.getGroups();
        if (result.success && result.data) {
          setAvailableGroups(result.data.grupos);

          // Se o usuário logado tem grupo, defini-lo como padrão
          if (loggedUser?.nomeGrupo) {
            const userGroup = result.data.grupos.find(
              (g) => g.nomeGrupo === loggedUser.nomeGrupo
            );
            if (userGroup) {
              setGroup(userGroup.nomeGrupo);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);
        Alert.alert("Erro", "Não foi possível carregar os grupos disponíveis.");
      } finally {
        setLoadingGroups(false);
      }
    };

    loadGroups();
  }, [loggedUser?.nomeGrupo]);

  const CustomCalendar = ({
    onDateSelect,
    isEndDate,
  }: {
    onDateSelect: (date: Date) => void;
    isEndDate?: boolean;
  }) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const getDaysInMonth = (month: number, year: number) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
      return new Date(year, month, 1).getDay();
    };

    const generateDays = () => {
      const daysInMonth = getDaysInMonth(currentMonth, currentYear);
      const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
      const days = [];

      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today;
        const isSelected =
          (startDate && date.toDateString() === startDate.toDateString()) ||
          (endDate && date.toDateString() === endDate.toDateString());
        const isDisabled =
          isPast || (isEndDate && startDate && date <= startDate);

        days.push({
          day,
          date,
          isToday,
          isPast,
          isSelected,
          isDisabled,
        });
      }

      return days;
    };

    const handlePrevMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    };

    const handleNextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    };

    const days = generateDays();

    return (
      <View style={styles.customCalendar}>
        {}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Icon name="chevron-left" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.monthYear}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Icon name="chevron-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.dayNamesRow}>
          {dayNames.map((dayName) => (
            <Text key={dayName} style={styles.dayName}>
              {dayName}
            </Text>
          ))}
        </View>

        {}
        <View style={styles.daysGrid}>
          {Array.from({ length: Math.ceil(days.length / 7) }).map(
            (_, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {days
                  .slice(weekIndex * 7, (weekIndex + 1) * 7)
                  .map((dayData, dayIndex) => (
                    <View key={dayIndex} style={styles.dayCell}>
                      {dayData && (
                        <TouchableOpacity
                          style={[
                            styles.dayButton,
                            dayData.isSelected && styles.selectedDay,
                            dayData.isToday &&
                              !dayData.isSelected &&
                              styles.todayDay,
                            dayData.isDisabled && styles.disabledDay,
                          ]}
                          onPress={() =>
                            !dayData.isDisabled && onDateSelect(dayData.date)
                          }
                          disabled={dayData.isDisabled || false}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              dayData.isSelected && styles.selectedDayText,
                              dayData.isToday &&
                                !dayData.isSelected &&
                                styles.todayDayText,
                              dayData.isDisabled && styles.disabledDayText,
                            ]}
                          >
                            {dayData.day}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
              </View>
            )
          )}
        </View>
      </View>
    );
  };

  const handleDateSelect = (selectedDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      Alert.alert("Data Inválida", "Selecione uma data futura.");
      return;
    }

    if (currentDateType === "start") {
      setStartDate(selectedDate);

      if (endDate && endDate <= selectedDate) {
        setEndDate(null);
        setPeriodError(
          "Selecione uma nova data de fim posterior à data de início"
        );
      } else {
        setPeriodError("");
      }

      setShowStartDatePicker(false);
    } else if (currentDateType === "end") {
      if (startDate && selectedDate <= startDate) {
        setPeriodError("A data de fim deve ser posterior à data de início");
        return;
      }

      setEndDate(selectedDate);
      setPeriodError("");
      setShowEndDatePicker(false);
    }

    setCurrentDateType(null);
  };

  const openStartDatePicker = () => {
    setCurrentDateType("start");
    setShowStartDatePicker(true);
  };

  const openEndDatePicker = () => {
    setCurrentDateType("end");
    setShowEndDatePicker(true);
  };

  const validateFields = () => {
    let isValid = true;

    if (!projectName.trim()) {
      setProjectNameError("Nome do projeto é obrigatório");
      isValid = false;
    } else {
      setProjectNameError("");
    }

    if (!location.trim()) {
      setLocationError("Localização é obrigatória");
      isValid = false;
    } else {
      setLocationError("");
    }

    if (!startDate) {
      setPeriodError("Data de início é obrigatória");
      isValid = false;
    } else if (!endDate) {
      setPeriodError("Data de fim é obrigatória");
      isValid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (endDate <= startDate) {
        setPeriodError("A data de fim deve ser posterior à data de início");
        isValid = false;
      } else if (endDate <= today) {
        setPeriodError("A data de fim deve ser uma data futura");
        isValid = false;
      } else {
        setPeriodError("");
      }
    }

    if (!group.trim()) {
      setGroupError("Grupo é obrigatório");
      isValid = false;
    } else {
      setGroupError("");
    }

    if (!projectImage) {
      setImageError("Imagem do projeto é obrigatória");
      isValid = false;
    } else {
      setImageError("");
    }

    return isValid;
  };

  const handleSelectImage = async () => {
    if (Platform.OS === "web") {
      openGallery();
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar a câmera.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert("Adicionar Foto", "Escolha uma opção:", [
      {
        text: "Câmera",
        onPress: openCamera,
      },
      {
        text: "Galeria",
        onPress: openGallery,
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  const openCamera = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Câmera indisponível",
        "A funcionalidade de câmera não está disponível na versão web. Use a galeria para selecionar uma imagem.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProjectImage(result.assets[0].uri);
        setImageError("");
      }
    } catch {
      Alert.alert("Erro", "Não foi possível abrir a câmera.");
    }
  };

  const openGallery = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permissão necessária",
            "Precisamos de permissão para acessar a galeria de fotos.",
            [{ text: "OK" }]
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProjectImage(result.assets[0].uri);
        setImageError("");
      }
    } catch {
      const errorMessage =
        Platform.OS === "web"
          ? "Não foi possível selecionar a imagem. Verifique se o arquivo é uma imagem válida."
          : "Não foi possível abrir a galeria.";
      Alert.alert("Erro", errorMessage);
    }
  };

  const handleCreateProject = async () => {
    if (!validateFields()) {
      return;
    }

    if (!loggedUser) {
      Alert.alert("Erro", "Usuário não está logado");
      return;
    }

    try {
      // Criar FormData para envio de arquivo
      const formData = new FormData();
      formData.append("nomeProjeto", projectName.trim());
      formData.append("localizacao", location.trim());
      formData.append(
        "dataInicio",
        startDate ? startDate.toISOString().split("T")[0] : ""
      );
      formData.append(
        "dataFim",
        endDate ? endDate.toISOString().split("T")[0] : ""
      );
      formData.append("nomeGrupo", group.trim());

      if (projectImage) {
        // Diferenciar envio entre web e React Native
        if (Platform.OS === "web") {
          // Web: usar File
          const response = await fetch(projectImage);
          const blob = await response.blob();
          const file = new File([blob], "project-image.jpg", {
            type: "image/jpeg",
          });
          formData.append("imagemInicial", file);
        } else {
          // React Native (Android/iOS/Expo): anexar objeto com uri/nome/tipo
          // FormData em RN espera este formato ao enviar arquivos
          // @ts-ignore - FormData type in React Native can vary
          formData.append("imagemInicial", {
            uri: projectImage,
            name: "project-image.jpg",
            type: "image/jpeg",
          } as any);
        }
      }

      const result = await apiService.addProject(formData);

      if (result.success) {
        Alert.alert(
          "Sucesso!",
          result.data?.message || "Projeto criado com sucesso!"
        );
        // Atualiza lista de projetos no contexto e volta para a home
        try {
          // passar o nome do grupo selecionado para garantir que o refresh traga os projetos corretos
          await refreshProjects(group.trim());
        } catch (e) {
          console.warn("refreshProjects falhou", e);
        }
        router.replace("/(drawer)/home");
      } else {
        Alert.alert(
          "Erro",
          result.error || "Não foi possível criar o projeto."
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao conectar com o servidor.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.container, isLargeScreen && styles.containerLarge]}
        >
          <View
            style={[
              styles.formWrapper,
              isLargeScreen && styles.formWrapperLarge,
            ]}
          >
            <Text style={styles.title}>Adicione Novo Projeto</Text>

            {}
            <View style={styles.fieldContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Nome do Projeto</Text>
                <Icon name="edit" size={16} color="#666" />
              </View>
              <TextInput
                style={[
                  styles.input,
                  isLargeScreen && styles.inputLarge,
                  projectNameError ? styles.inputError : null,
                ]}
                placeholder="Digite o nome do projeto"
                placeholderTextColor="#B0B0B0"
                value={projectName}
                onChangeText={(text) => {
                  setProjectName(text);
                  if (projectNameError) setProjectNameError("");
                }}
              />
              {projectNameError ? (
                <Text style={styles.errorText}>{projectNameError}</Text>
              ) : null}
            </View>

            {}
            <TouchableOpacity
              style={[
                styles.imageContainer,
                imageError ? styles.imageContainerError : null,
              ]}
              onPress={handleSelectImage}
            >
              {projectImage ? (
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: projectImage }}
                    style={styles.projectImage}
                  />
                  <View style={styles.imageOverlay}>
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={handleSelectImage}
                    >
                      <Icon name="camera" size={20} color="#FFFFFF" />
                      <Text style={styles.changeImageText}>Trocar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <Icon name="camera" size={40} color="#B0B0B0" />
                  <Text style={styles.cameraText}>
                    {Platform.OS === "web"
                      ? "Toque para selecionar foto"
                      : "Toque para tirar foto ou selecionar da galeria"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {}
            {imageError ? (
              <Text style={styles.errorText}>{imageError}</Text>
            ) : null}

            {}
            <Text style={styles.instructionText}>
              📷 Certifique-se de adicionar a versão final do projeto para que
              ela possa ser comparada posteriormente com as fotos reais do
              canteiro de obras.
              {Platform.OS === "web" &&
                "\n\n💡 Dica: Na versão web, use a opção de selecionar arquivo para escolher uma imagem do seu computador."}
            </Text>

            {}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Localização:</Text>
              <TextInput
                style={[
                  styles.input,
                  isLargeScreen && styles.inputLarge,
                  locationError ? styles.inputError : null,
                ]}
                placeholder="Digite a localização"
                placeholderTextColor="#B0B0B0"
                value={location}
                onChangeText={(text) => {
                  setLocation(text);
                  if (locationError) setLocationError("");
                }}
              />
              {locationError ? (
                <Text style={styles.errorText}>{locationError}</Text>
              ) : null}
            </View>

            {}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Período de Tempo:</Text>

              {}
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>Data de Início:</Text>
                  <TouchableOpacity
                    style={[
                      styles.dateInput,
                      isLargeScreen && styles.inputLarge,
                      periodError ? styles.inputError : null,
                    ]}
                    onPress={openStartDatePicker}
                  >
                    <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                    <Icon name="calendar" size={16} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>Data de Fim:</Text>
                  <TouchableOpacity
                    style={[
                      styles.dateInput,
                      isLargeScreen && styles.inputLarge,
                      periodError ? styles.inputError : null,
                    ]}
                    onPress={openEndDatePicker}
                  >
                    <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                    <Icon name="calendar" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              {}
              <Modal
                visible={showStartDatePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowStartDatePicker(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.calendarModal}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>
                        Selecione a Data de Início
                      </Text>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowStartDatePicker(false)}
                      >
                        <Icon name="times" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <CustomCalendar onDateSelect={handleDateSelect} />
                  </View>
                </View>
              </Modal>

              {}
              <Modal
                visible={showEndDatePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowEndDatePicker(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.calendarModal}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>
                        Selecionar Data de Fim
                      </Text>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowEndDatePicker(false)}
                      >
                        <Icon name="times" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <CustomCalendar
                      onDateSelect={handleDateSelect}
                      isEndDate={true}
                    />
                  </View>
                </View>
              </Modal>

              {periodError ? (
                <Text style={styles.errorText}>{periodError}</Text>
              ) : null}
            </View>

            {}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Grupo:</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  isLargeScreen && styles.inputLarge,
                  groupError ? styles.inputError : null,
                  styles.dropdownButton,
                ]}
                onPress={() => setShowGroupDropdown(!showGroupDropdown)}
                disabled={loadingGroups}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !group && styles.placeholderText,
                  ]}
                >
                  {loadingGroups
                    ? "Carregando grupos..."
                    : group || "Selecione um grupo"}
                </Text>
                <Icon
                  name={showGroupDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>

              {showGroupDropdown && !loadingGroups && (
                <View style={styles.dropdownList}>
                  {availableGroups.length > 0 ? (
                    availableGroups.map((grupo) => (
                      <TouchableOpacity
                        key={grupo.grupoID}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setGroup(grupo.nomeGrupo);
                          setShowGroupDropdown(false);
                          if (groupError) setGroupError("");
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {grupo.nomeGrupo}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.dropdownItem}>
                      <Text
                        style={[styles.dropdownItemText, styles.noOptionsText]}
                      >
                        Nenhum grupo encontrado
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {groupError ? (
                <Text style={styles.errorText}>{groupError}</Text>
              ) : null}
            </View>

            {}
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateProject}
            >
              <Text style={styles.createButtonText}>Criar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F7FA",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  containerLarge: {
    paddingHorizontal: 0,
  },
  formWrapper: {
    width: "100%",
    alignItems: "center",
  },
  formWrapperLarge: {
    width: 450,
    padding: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001489",
    marginBottom: 30,
    textAlign: "center",
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    marginBottom: 8,
  },
  label: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 8,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#CFCFCF",
    paddingHorizontal: 20,
    fontSize: 16,
  },
  inputLarge: {
    height: 55,
    fontSize: 18,
  },
  imageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#F0F0F0",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  imageContainerError: {
    borderColor: "#E74C3C",
    borderWidth: 2,
  },
  projectImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  changeImageButton: {
    backgroundColor: "rgba(0, 20, 137, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  changeImageText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  cameraPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  cameraText: {
    color: "#B0B0B0",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    textAlign: "left",
    lineHeight: 20,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  createButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#001489",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputError: {
    borderColor: "#e74c3c",
    borderWidth: 2,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 15,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 5,
  },
  dateInput: {
    backgroundColor: "#FFFFFF",
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#CFCFCF",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  datePickerModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 0,
    textAlign: "center",
  },
  modalHint: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
    lineHeight: 18,
  },
  dateInputField: {
    backgroundColor: "#F5F7FA",
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CFCFCF",
    paddingHorizontal: 15,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#CFCFCF",
  },
  confirmButton: {
    backgroundColor: "#001489",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  calendarModal: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    maxWidth: 400,
    width: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#082A85",
    borderBottomWidth: 0,
  },
  closeButton: {
    padding: 5,
  },
  customCalendar: {
    backgroundColor: "#FFFFFF",
    padding: 15,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 10,
  },
  navButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#082A85",
    minWidth: 40,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  monthYear: {
    fontSize: 18,
    fontWeight: "700",
    color: "#082A85",
  },
  dayNamesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    paddingVertical: 8,
    backgroundColor: "#F0F4FF",
    borderRadius: 8,
  },
  dayName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#082A85",
    textAlign: "center",
    flex: 1,
  },
  daysGrid: {
    gap: 5,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 5,
  },
  dayCell: {
    flex: 1,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  selectedDay: {
    backgroundColor: "#082A85",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  todayDay: {
    backgroundColor: "#E6F0FF",
    borderWidth: 2,
    borderColor: "#082A85",
  },
  disabledDay: {
    backgroundColor: "transparent",
  },
  dayText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  todayDayText: {
    color: "#082A85",
    fontWeight: "700",
  },
  disabledDayText: {
    color: "#d9e1e8",
  },

  // Estilos para o dropdown de grupos
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  placeholderText: {
    color: "#B0B0B0",
  },
  dropdownList: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333333",
  },
  noOptionsText: {
    fontStyle: "italic",
    color: "#999999",
  },
});
