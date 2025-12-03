import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChatWrapper } from "../components/chatWrapper";
import { WhatsAppStatusBar } from "../components/WhatsAppStatusBar";
import { AuthProvider } from "@/context/authContext";
import { AppProvider } from "@/context/appContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useEffect } from "react";
import { setupNotificationListeners, setupNotifications } from "../lib/push";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const router = useRouter();
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  
  useEffect(() => {
    if (!fontsLoaded) return;
    
    // Temporarily disabled to debug navigation issue
    // const timer = setTimeout(() => {
    //   setupNotifications(router);
    //   setupNotificationListeners(router);
    // }, 5000);
    
    // return () => clearTimeout(timer);
  }, [router, fontsLoaded]);
  
  if (!fontsLoaded) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <WhatsAppStatusBar />
      <GestureHandlerRootView style={styles.container}>
        <ThemeProvider>
          <AuthProvider>
            <AppProvider>
              <ChatWrapper>
                <Stack screenOptions={{ headerShown: false }} />
              </ChatWrapper>
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({ container: { flex: 1 } });
