import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { StreamChat } from "stream-chat";
import { OverlayProvider, Chat } from "stream-chat-expo";
import { chatApiKey, BASE_URL } from "@/config/chatConfig";
import { whatsappTheme } from "@/config/whatsappTheme";
import { useAuth } from "@/context/authContext";
import registerExpoToken, { setupNotifications } from "@/lib/push";
import { callManager, IncomingCall } from "@/lib/callManager";
import { IncomingCallNotification } from "@/components/IncomingCallNotification";
import { useRouter } from "expo-router";
const client = StreamChat.getInstance(chatApiKey);

const AppContext = createContext({
  chatClient: null,
  channel: null,
  setChannel: () => {},
  thread: null,
  setThread: () => {},
  callManager: null,
  incomingCall: null,
});

export const AppProvider = ({ children }) => {
  const { userId, userName } = useAuth();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [thread, setThread] = useState(null);
  const [error, setError] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!userId) {
        setChatClient(null);
        return;
      }

      try {
        try {
          await client.disconnectUser();
        } catch {}

        const user = {
          id: String(userId),
          name: userName || String(userId),
          image: "https://randomuser.me/api/portraits/men/4.jpg",
        };

        const res = await fetch(`${BASE_URL}/stream/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            name: user.name,
            image: user.image,
          }),
        });
        if (!res.ok)
          throw new Error(`Token HTTP ${res.status}: ${await res.text()}`);
        const { token } = await res.json();
        if (!token) throw new Error("No token from backend");

        await client.connectUser(user, token);

        // Push notifications setup is handled in _layout.jsx
        // 🔐 Register this device’s Expo push token on your backend
        await registerExpoToken(BASE_URL, user.id);

        if (!cancelled) {
          setChatClient(client);
          setError(null);
          
          // Initialize call manager after chat client is ready
          try {
            await callManager.initialize(user.id, user.name);
            
            // Listen for incoming calls
            callManager.on('incomingCall', (call) => {
              setIncomingCall(call);
            });
            
            callManager.on('callEnded', () => {
              setIncomingCall(null);
            });
            
            callManager.on('callAccepted', () => {
              setIncomingCall(null);
            });
          } catch (callError) {
            console.warn('Failed to initialize call manager:', callError);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e);
        }
        console.warn("Stream connectUser failed:", e);
      }
    })();

    return () => {
      cancelled = true;
      client.disconnectUser().catch(() => {});
    };
  }, [userId, userName, router]);

  // Loader / errors
  if (!userId) return children; // let screens redirect to /login
  if (!chatClient && !error) {
    return (
      <OverlayProvider>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Connecting to chat…</Text>
          <Text style={{ marginTop: 4, opacity: 0.6 }} selectable>
            {BASE_URL}
          </Text>
        </View>
      </OverlayProvider>
    );
  }
  if (error) {
    return (
      <OverlayProvider>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
            Chat failed to start
          </Text>
          <Text style={{ textAlign: "center" }} selectable>
            {String(error)}
          </Text>
          <Text style={{ marginTop: 8, opacity: 0.6 }} selectable>
            {BASE_URL}
          </Text>
        </View>
      </OverlayProvider>
    );
  }

  const handleAcceptCall = async () => {
    if (incomingCall) {
      try {
        await callManager.acceptCall(incomingCall.callId);
        setIncomingCall(null);
      } catch (error) {
        console.error("Failed to accept call:", error);
        setIncomingCall(null);
      }
    }
  };

  const handleDeclineCall = async () => {
    if (incomingCall) {
      try {
        await callManager.declineCall(incomingCall.callId);
      } catch (error) {
        console.error("Failed to decline call:", error);
      }
      setIncomingCall(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        chatClient,
        channel,
        setChannel,
        thread,
        setThread,
        callManager,
        incomingCall,
      }}
    >
      <OverlayProvider>
        <Chat client={chatClient} style={whatsappTheme}>
          {children}
          {incomingCall && (
            <IncomingCallNotification
              visible={!!incomingCall}
              callerName={incomingCall.callerName}
              callId={incomingCall.callId}
              isVideoCall={incomingCall.isVideoCall}
              onAccept={handleAcceptCall}
              onDecline={handleDeclineCall}
            />
          )}
        </Chat>
      </OverlayProvider>
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
