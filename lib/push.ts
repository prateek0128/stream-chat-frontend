// lib/push.ts
import Constants from "expo-constants";
import { Platform } from "react-native";

const isExpoGo = Constants.appOwnership === "expo";

export interface Navigation {
  navigate: (screen: string, params?: any) => void;
}

let listenersRegistered = false;

export async function setupNotifications(navigation: Navigation) {
  if (isExpoGo) {
    console.warn(
      "Push setup is skipped in Expo Go. Use a Dev Build to test real push notifications."
    );
    return;
  }

  const Notifications: any = await import("expo-notifications");

  // Global handler: how notifications behave when received
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    // 🔔 Messages channel
    await Notifications.setNotificationChannelAsync("chat", {
      name: "Chat messages",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
      vibrationPattern: [0, 200, 200, 200],
    });

    // 📞 Calls channel – louder + more attention
    await Notifications.setNotificationChannelAsync("calls", {
      name: "Calls",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default", // uses system default ringtone-ish sound
      vibrationPattern: [0, 500, 500, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility?.PUBLIC,
    });
  }

  // 🔁 App opened from a killed state by tapping a notification
  // Delay this to avoid navigation conflicts during app initialization
  setTimeout(async () => {
    try {
      const lastResponse =
        await Notifications.getLastNotificationResponseAsync();
      if (lastResponse?.notification) {
        const data: any = lastResponse.notification.request.content.data;
        console.log("🔁 Last notification response data:", data);
        // Only handle routing if we have valid notification data
        if (
          data &&
          (data.type === "chat" || data.type === "call") &&
          navigation &&
          typeof navigation.navigate === "function"
        ) {
          handleNotificationRouting(data, navigation);
        }
      }
    } catch (e) {
      console.warn("getLastNotificationResponseAsync failed:", e);
    }
  }, 3000);

  // 🔔 Listen for taps while app is in foreground/background
  if (!listenersRegistered) {
    Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data: any = response.notification.request.content.data;
      console.log("📲 Notification tap data:", data);
      if (navigation && typeof navigation.navigate === "function") {
        handleNotificationRouting(data, navigation);
      }
    });
    listenersRegistered = true;
  }
}

// Decide where to navigate based on the push payload
function handleNotificationRouting(data: any, navigation: Navigation) {
  if (!data || !navigation || typeof navigation.navigate !== "function") {
    console.log("Navigation skipped: invalid data or navigation");
    return;
  }

  // Additional delay to ensure navigation system is ready
  setTimeout(() => {
    try {
      // From /stream/webhook (chat messages)
      if (data.type === "chat" && data.cid) {
        console.log("Navigating to channel:", data.cid);
        navigation.navigate("Channel", { cid: data.cid });
        return;
      }

      // From /stream/video-webhook (incoming calls)
      if (data.type === "call" && data.callId) {
        console.log("Navigating to call:", data.callId);
        navigation.navigate("Call", { callId: data.callId });
        return;
      }

      // If no specific route, navigate to home instead of causing error
      if (data.type && !data.cid && !data.callId) {
        console.log(
          "Navigating to home due to incomplete notification data:",
          data
        );
        navigation.navigate("Home");
        return;
      }

      console.log("No valid navigation data found:", data);
    } catch (error) {
      console.warn("Navigation error in handleNotificationRouting:", error);
      // Fallback to home route if navigation fails
      try {
        navigation.navigate("Home");
      } catch (fallbackError) {
        console.warn("Fallback navigation also failed:", fallbackError);
      }
    }
  }, 1000);
}

export async function registerExpoToken(BASE_URL: string, userId: string) {
  if (isExpoGo) {
    console.warn(
      "Push registration skipped in Expo Go. Use a Dev Build for remote push."
    );
    return null;
  }

  const Notifications: any = await import("expo-notifications");

  const { status } = await Notifications.requestPermissionsAsync();
  console.log("🔔 Notification permission status:", status);
  if (status !== "granted") {
    console.warn("Notifications permission not granted");
    return null;
  }

  const projectId =
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    (Constants as any)?.expoConfig?.extra?.eas?.projectId ||
    (Constants as any)?.easConfig?.projectId;

  console.log("📦 Expo projectId used for push:", projectId);

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  console.log("📲 Got Expo push token:", expoPushToken);

  if (!expoPushToken) return null;

  const resp = await fetch(`${BASE_URL}/devices/expo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, expoPushToken }),
  });

  const json = await resp.json().catch(() => ({}));
  console.log("🌐 /devices/expo response:", resp.status, json);

  return expoPushToken;
}

// You don't actually need this anymore because setupNotifications already
// registers the listener, but keeping it if you want a manual-only version.
export async function setupNotificationListeners(navigation?: Navigation) {
  if (isExpoGo) return;

  const Notifications: any = await import("expo-notifications");

  Notifications.addNotificationResponseReceivedListener((response: any) => {
    const data = response.notification.request.content.data || {};
    console.log("📲 [legacy listener] Notification tap data:", data);

    if (data.type === "chat" && data.cid) {
      navigation?.navigate("Channel", { cid: data.cid });
    }
    if (data.type === "call" && data.callId) {
      navigation?.navigate("Call", { callId: data.callId });
    }
  });
}

export default registerExpoToken;