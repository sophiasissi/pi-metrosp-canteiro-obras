// components/ImageModal.tsx
import React from "react";
import { Modal, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ImageModal({ visible, imageUri, onClose }: {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}) {
  if (!imageUri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "95%",
    height: "80%",
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 30,
    zIndex: 10,
  },
});
