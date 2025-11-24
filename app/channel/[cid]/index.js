import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  ActivityIndicator,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import { hapticFeedback, shareMessage } from "../../../utils/chatUtils";
import {
  Channel,
  MessageList,
  MessageInput,
  MessageSimple,
} from "stream-chat-expo";
import { useAppContext } from "@/context/appContext";
import { useChatContext } from "stream-chat-expo";
import { Pressable } from "react-native";
import { WhatsAppChatHeader } from "@/components/WhatsAppChatHeader";
import { KeyboardCompatibleView } from "stream-chat-expo";
import { fonts } from "@/config/fonts";

export default function ChannelScreen() {
  const { cid } = useLocalSearchParams(); // e.g. "messaging:demo" or "messaging:xxxxx"
  const headerHeight = useHeaderHeight();
  const router = useRouter();
  const { chatClient, callManager } = useAppContext();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  // create stable callId: 'call_dm_<A>_<B>'
  function callIdFromMembers(members) {
    const ids = members
      .map((m) => m.user?.id || m.user_id)
      .filter(Boolean)
      .map(String)
      .sort();
    return `call_dm_${ids[0]}_${ids[1]}`;
  }

  // create unique callId each time by appending timestamp
  function uniqueCallIdFromMembers(members) {
    const base = callIdFromMembers(members);
    return `${base}_${Date.now()}`;
  }
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!chatClient || !cid) return;
        const [type, id] = String(cid).split(":");
        const ch = chatClient.channel(type, id);
        await ch.watch(); // start watching so we get live events + messages
        if (mounted) {
          setChannel(ch);
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
  }, [chatClient, cid]);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={{ marginTop: 8 }}>Loading channel…</Text>
      </SafeAreaView>
    );
  }

  if (err || !channel) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>
          Failed to open channel
        </Text>
        <Text selectable style={{ opacity: 0.8 }}>
          {String(err || "Unknown error")}
        </Text>
      </SafeAreaView>
    );
  }

  const handleVideoCall = async () => {
    try {
      const members =
        (channel.state?.members && Object.values(channel.state.members)) || [];

      if (members.length < 2) {
        alert("Cannot start call: No other participants in this channel");
        return;
      }

      const id = uniqueCallIdFromMembers(members);
      const memberIds = members
        .map((m) => m.user?.id || m.user_id)
        .filter(Boolean);

      console.log("Starting video call with ID:", id, "Members:", memberIds);

      if (callManager && callManager.isInitialized()) {
        // Listen for call answered event
        const handleCallAnswered = () => {
          callManager.joinCallWhenAnswered();
          router.replace({ pathname: `/call/${id}` });
          callManager.removeListener('callAnswered', handleCallAnswered);
        };
        
        callManager.on('callAnswered', handleCallAnswered);
        
        await callManager.startCall(id, memberIds, true);
        
        // Show outgoing call UI immediately
        router.push({ pathname: `/call/${id}`, params: { status: 'calling' } });
      } else {
        throw new Error("Call manager not ready. Please try again.");
      }
    } catch (error) {
      console.error("Error starting video call:", error);
      alert("Failed to start video call. Please try again.");
    }
  };

  const handleAudioCall = async () => {
    try {
      const members =
        (channel.state?.members && Object.values(channel.state.members)) || [];

      if (members.length < 2) {
        alert("Cannot start call: No other participants in this channel");
        return;
      }

      const id = uniqueCallIdFromMembers(members);
      const memberIds = members
        .map((m) => m.user?.id || m.user_id)
        .filter(Boolean);

      console.log("Starting audio call with ID:", id, "Members:", memberIds);

      if (callManager && callManager.isInitialized()) {
        // Listen for call answered event
        const handleCallAnswered = () => {
          callManager.joinCallWhenAnswered();
          router.replace({ pathname: `/call/${id}`, params: { mode: "audio" } });
          callManager.removeListener('callAnswered', handleCallAnswered);
        };
        
        callManager.on('callAnswered', handleCallAnswered);
        
        await callManager.startCall(id, memberIds, false);
        
        // Show outgoing call UI immediately
        router.push({ pathname: `/call/${id}`, params: { mode: "audio", status: 'calling' } });
      } else {
        throw new Error("Call manager not ready. Please try again.");
      }
    } catch (error) {
      console.error("Error starting audio call:", error);
      alert("Failed to start audio call. Please try again.");
    }
  };

  // Custom message component with WhatsApp styling
  const CustomMessage = (props) => {
    const { message, isMyMessage } = props;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myBubble : styles.otherBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myText : styles.otherText,
            ]}
          >
            {message.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isMyMessage ? styles.myTimestamp : styles.otherTimestamp,
            ]}
          >
            {new Date(message.created_at).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </View>
      </View>
    );
  };
  // Get the other person's name from channel members
  const getChannelDisplayName = () => {
    if (channel.data?.name) return channel.data.name;

    const members = Object.values(channel.state?.members || {});
    const otherMember = members.find(
      (member) => member.user?.id !== chatClient?.userID
    );
    return otherMember?.user?.name || otherMember?.user?.id || "Chat";
  };

  const QuickActionButton = ({ icon, label, color = "#075E54", onPress }) => (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIconWrapper}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <WhatsAppChatHeader
        channelName={getChannelDisplayName()}
        onVideoCall={handleVideoCall}
        onAudioCall={handleAudioCall}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <Channel
          channel={channel}
          AttachmentPicker={() => null}
          AttachmentPickerProvider={() => null}
          AttachmentPickerBottomSheet={() => null}
          FileAttachmentPicker={() => null}
          ImageGallery={() => null}
          ImageGalleryGrid={() => null}
          BottomSheetHandle={() => null}
          MessageInputFlatList={() => null}
        >
          <MessageList
            onThreadSelect={(parentMessage) => {
              router.push(`/channel/${cid}/thread/${parentMessage?.id}`);
            }}
          />
          {/* 👇 Show this row ONLY when keyboard is open */}
          <MessageInput
            hasCommands={false}
            hasFilePicker={false}
            hasImagePicker={false}
            hasCameraPicker={false}
            audioRecordingEnabled={true}
            showAttachmentPickerBottomSheet={false}
          />
        </Channel>
      </KeyboardAvoidingView>
      <SafeAreaView style={styles.bottomSafeArea} edges={["bottom"]} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5DDD5", // WhatsApp chat background
  },
  bottomSafeArea: {
    backgroundColor: "#E91E63", // Same as header color
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#E5DDD5",
  },
  messageContainer: {
    marginVertical: 2,
    marginHorizontal: 16,
  },
  myMessage: {
    alignItems: "flex-end",
  },
  otherMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myBubble: {
    backgroundColor: "#DCF8C6",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#000",
    fontFamily: fonts.regular,
  },
  myText: {
    color: "#000",
  },
  otherText: {
    color: "#000",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
    fontFamily: fonts.regular,
  },
  myTimestamp: {
    color: "#666",
  },
  otherTimestamp: {
    color: "#999",
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
    backgroundColor: "#f5f5f5",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#075E54", // WhatsApp-ish green
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  quickActionLabel: {
    fontSize: 11,
    color: "#444",
  },
});
