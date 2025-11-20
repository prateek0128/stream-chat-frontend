import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import { Channel, Thread } from "stream-chat-expo";
import { useAppContext } from "@/context/appContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts } from "@/config/fonts";
export default function ThreadScreen() {
  const { cid, mid } = useLocalSearchParams(); // parent channel cid + parent message id
  const { chatClient } = useAppContext();
  const router = useRouter();
  const headerHeight = useHeaderHeight();

  const [channel, setChannel] = useState(null);
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!chatClient || !cid || !mid) return;
        const [type, id] = String(cid).split(":");
        const ch = chatClient.channel(type, id);
        await ch.watch();

        // fetch parent message (ensures we have it even if not in current state)
        const resp = await chatClient.getMessage(String(mid));
        const parentMsg = resp?.message;

        if (!parentMsg) throw new Error("Parent message not found");

        if (mounted) {
          setChannel(ch);
          setParent(parentMsg);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          setErr(e);
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [chatClient, cid, mid]);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, fontFamily: fonts.regular }}>Loading thread…</Text>
      </SafeAreaView>
    );
  }

  if (err || !channel || !parent) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Text style={{ fontFamily: fonts.semiBold, marginBottom: 8 }}>
          Failed to open thread
        </Text>
        <Text selectable style={{ opacity: 0.8, fontFamily: fonts.regular }}>
          {String(err || "Unknown error")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen options={{ 
        title: "Thread",
        headerTitleStyle: {
          fontFamily: fonts.semiBold,
          fontSize: 18,
        },
        headerStyle: {
          backgroundColor: '#075E54',
        },
        headerTintColor: '#fff',
      }} />
      <Channel
        channel={channel}
        thread={parent}
        threadList
        keyboardVerticalOffset={headerHeight}
      >
        <View style={{ flex: 1 }}>
          <Thread
            onThreadDismount={() => {
              // when Thread unmounts, go back to the channel
              router.back();
            }}
          />
        </View>
      </Channel>
    </SafeAreaView>
  );
}
