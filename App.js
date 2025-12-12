import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { navigationRef } from "./lib/navigationService";
import { ChatWrapper } from "./components/chatWrapper";
import { WhatsAppStatusBar } from "./components/WhatsAppStatusBar";
import { AuthProvider } from "./context/authContext";
import { AppProvider } from "./context/appContext";
import { ThemeProvider } from "./context/ThemeContext";
import { setupNotificationListeners, setupNotifications } from "./lib/push";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";

// Import screens from app folder
import ChannelListScreen from "./app/index";
import LoginScreen from "./app/login";
import ChannelScreen from "./app/channel/[cid]/index";
import ThreadScreen from "./app/channel/[cid]/thread/[mid]";
import CallScreen from "./app/call/[callId]";
import CallsScreen from "./app/calls";
import BlockedAccountsScreen from "./app/blocked-accounts";
import CreateGroupScreen from "./app/create-group";
import ProfileSettingsScreen from "./app/profile-settings";
import UsersScreen from "./app/users";
import HealthScreen from "./app/health";

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {
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

    // Setup notifications with navigation reference
    const timer = setTimeout(() => {
      setupNotifications(navigationRef);
      setupNotificationListeners(navigationRef);
    }, 5000);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

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
                <NavigationContainer ref={navigationRef}>
                  <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Home" component={ChannelListScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Channel" component={ChannelScreen} />
                    <Stack.Screen name="Thread" component={ThreadScreen} />
                    <Stack.Screen name="Call" component={CallScreen} />
                    <Stack.Screen name="Calls" component={CallsScreen} />
                    <Stack.Screen
                      name="BlockedAccounts"
                      component={BlockedAccountsScreen}
                    />
                    <Stack.Screen
                      name="CreateGroup"
                      component={CreateGroupScreen}
                    />
                    <Stack.Screen
                      name="ProfileSettings"
                      component={ProfileSettingsScreen}
                    />
                    <Stack.Screen name="Users" component={UsersScreen} />
                    <Stack.Screen name="Health" component={HealthScreen} />
                  </Stack.Navigator>
                </NavigationContainer>
              </ChatWrapper>
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
