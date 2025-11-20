// app/channel/[cid]/thread/[cid]/index.js
import React from "react";
import { Text, View } from "react-native";
import { Channel, Thread } from "stream-chat-expo";
import { Stack } from "expo-router";
import { useAppContext } from "@/context/appContext";
import { useHeaderHeight } from "@react-navigation/elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts } from "@/config/fonts";
export default function ThreadScreen() {
  const { channel, thread, setThread } = useAppContext();
  const headerHeight = useHeaderHeight();

  if (!channel || !thread) {
    return (
      <SafeAreaView>
        <Text style={{ fontFamily: fonts.regular }}>Loading thread ...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Thread",
          headerTitleStyle: {
            fontFamily: fonts.semiBold,
            fontSize: 18,
          },
          headerStyle: {
            backgroundColor: "#075E54",
          },
          headerTintColor: "#fff",
        }}
      />
      <Channel
        channel={channel}
        keyboardVerticalOffset={headerHeight}
        thread={thread}
        threadList
      >
        <View style={{ flex: 1, justifyContent: "flex-start" }}>
          <Thread onThreadDismount={() => setThread(undefined)} />
        </View>
      </Channel>
    </SafeAreaView>
  );
}
