import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChannelList } from "stream-chat-expo";
import { Stack, useRouter } from "expo-router";
import { useAppContext } from "@/context/appContext";
import { useAuth } from "@/context/authContext";
import { BASE_URL } from "@/config/chatConfig";
import { WhatsAppChannelList } from "@/components/WhatsAppChannelList";
import { fonts } from "@/config/fonts";

const sort = { last_updated: -1 };
const options = { state: true, watch: true };

export default function ChannelListScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { setChannel, chatClient } = useAppContext();

  if (!userId) {
    return (
      <View style={styles.center}>
        <Text
          style={{ marginBottom: 12, fontFamily: fonts.regular, color: "#fff" }}
        >
          Pick a user to start chatting
        </Text>
        <Pressable style={styles.cta} onPress={() => router.push("/login")}>
          <Text style={styles.ctaText}>Choose User</Text>
        </Pressable>
      </View>
    );
  }

  const filters = useMemo(
    () => ({ members: { $in: [String(userId)] }, type: "messaging" }),
    [userId]
  );

  const createChat = async () => {
    const me = String(userId);
    const other = me === "ronit63" ? "user_b" : "ronit63"; // simple toggle for demo

    const r = await fetch(`${BASE_URL}/stream/channel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        members: [me, other],
        name: `Chat: ${me} & ${other}`,
      }),
    });
    const data = await r.json();
    const cid = data?.cid;
    if (!cid) return;

    const [type, id] = cid.split(":");
    const ch = chatClient.channel(type, id);
    await ch.watch();

    setChannel(ch);
    router.push(`/channel/${cid}`);
  };

  // Show only the other user based on current user
  const otherUser = userId === "ronit63" ? "user_b" : "ronit63";
  const mockChannels = [
    {
      id: `messaging:${otherUser}`,
      name: String(otherUser || "User"),
      lastMessage: "Tap to start chatting",
      timestamp: "now",
      unreadCount: 0,
      isOnline: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <WhatsAppChannelList
        channels={mockChannels}
        onChannelSelect={(channelId) => {
          // For demo, create a new channel or navigate to existing
          createChat();
        }}
        onNewChat={createChat}
      />
      {/* Keep the original ChannelList hidden for functionality */}
      <View style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}>
        <ChannelList
          filters={filters}
          options={options}
          sort={sort}
          onSelect={(channel) => {
            setChannel?.(channel);
            router.push(`/channel/${channel.cid}`);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E91E63",
  },
  cta: {
    backgroundColor: "#C2185B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
});
