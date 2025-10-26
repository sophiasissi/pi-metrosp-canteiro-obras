import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, StatusBar, Platform, Dimensions } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function CustomSplash() {
  const router = useRouter();
  const [isSplashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const showSplash = async () => {
      const { width } = Dimensions.get("window");
      const isLargeScreen = width >= 768;

      try {
        const hasOpenedBefore = await AsyncStorage.getItem("hasOpenedBefore");


        const delay = !hasOpenedBefore ? 2000 : 2000;


        if (Platform.OS === "web" || isLargeScreen) {
          setSplashVisible(true);
          await new Promise((resolve) => setTimeout(resolve, delay));
          setSplashVisible(false);
          router.replace("/(auth)/login");
          return;
        }


        await new Promise((resolve) => setTimeout(resolve, delay));
        await SplashScreen.hideAsync();
        await AsyncStorage.setItem("hasOpenedBefore", "true");
        router.replace("/(auth)/login");
      } catch (error) {
        console.warn(error);
      }
    };

    showSplash();
  }, []);


  if (isSplashVisible && (Platform.OS === "web" || Dimensions.get("window").width >= 768)) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#001789" />
        <Image
          source={require("@/assets/images/logo-metro.png")}
          style={styles.logo}
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001789",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
});