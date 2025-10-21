import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed-view";

export default function Home() {
	return (
		<ThemedView style={styles.container}>
			<Text style={styles.title}>Home</Text>
			<Text style={styles.subtitle}>Se esta tela aparece, o app está rodando corretamente.</Text>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
		backgroundColor: "#E1EFFE",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		color: "#333",
	},
});
