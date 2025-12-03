import React, { useEffect, useState, useRef } from "react";
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
import { useRoute, useNavigation } from "@react-navigation/native";
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
import { WhatsAppMessageInputUI } from "@/components/WhatsAppMessageInputUI";
import { WhatsAppBackground } from "@/components/WhatsAppBackground";
import { KeyboardCompatibleView } from "stream-chat-expo";
import { fonts } from "@/config/fonts";
import { whatsappChatTheme } from "@/config/whatsappChatTheme";
import { useTheme } from "@/context/ThemeContext";

export default function ChannelScreen() {
  const route = useRoute();
  const { cid } = route.params; // e.g. "messaging:demo" or "messaging:xxxxx"
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { chatClient, callManager } = useAppContext();
  const { colors } = useTheme();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef(null);
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
          navigation.replace("Call", { callId: id });
          callManager.removeListener("callAnswered", handleCallAnswered);
        };

        callManager.on("callAnswered", handleCallAnswered);

        await callManager.startCall(id, memberIds, true);

        // Show outgoing call UI immediately
        navigation.navigate("Call", { callId: id, status: "calling" });
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
          navigation.replace("Call", { callId: id, mode: "audio" });
          callManager.removeListener("callAnswered", handleCallAnswered);
        };

        callManager.on("callAnswered", handleCallAnswered);

        await callManager.startCall(id, memberIds, false);

        // Show outgoing call UI immediately
        navigation.navigate("Call", { callId: id, mode: "audio", status: "calling" });
      } else {
        throw new Error("Call manager not ready. Please try again.");
      }
    } catch (error) {
      console.error("Error starting audio call:", error);
      alert("Failed to start audio call. Please try again.");
    }
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]} edges={["top"]}>
      <WhatsAppChatHeader
        channelName={getChannelDisplayName()}
        onVideoCall={handleVideoCall}
        onAudioCall={handleAudioCall}
        channel={channel}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
        <WhatsAppBackground key={colors.background}>
          <Channel
            theme={{
              ...whatsappChatTheme,
              messageList: {
                ...whatsappChatTheme.messageList,
                container: {
                  ...whatsappChatTheme.messageList.container,
                  backgroundColor: colors.background,
                },
              },
            }}
            channel={channel}
            /* ---------------------------
     🔥 MessageInput Core Features
     --------------------------- */
            audioRecordingEnabled={true}
            hasImagePicker={true}
            hasFilePicker={true}
            hasCameraPicker={true}
            showAttachmentPickerBottomSheet={true}
            /* ---------------------------
     🔥 Attachment Picker
     --------------------------- */
            attachmentPickerBottomSheetHeight={0.4} // 40% of screen height
            attachmentSelectionBarHeight={52}
            closeAttachmentPicker={() => {}} // Optional override
            /* ---------------------------
     🔥 Text Input Customization
     --------------------------- */
            additionalTextInputProps={{
              placeholder: "Message",
              placeholderTextColor: "#8696A0",
              multiline: true,
              style: {
                fontSize: 16,
                color: "#000",
                fontFamily: fonts.regular,
              },
            }}
            inputBoxRef={inputRef}
            /* ---------------------------
     🔥 Audio Recording Controls
     --------------------------- */
            asyncMessagesMinimumPressDuration={500} // long press before recording starts
            asyncMessagesLockDistance={50} // slide-up to lock recording
            asyncMessagesSlideToCancelDistance={100} // slide-left to cancel
            AsyncMessagesMultiSendEnabled={true} // allow multiple voice snippets
            asyncMessagesLockEnabled={true}
            /* ---------------------------
     🔥 Poll Creation
     --------------------------- */
            showPollCreationDialog={false} // true if using polls
            closePollCreationDialog={() => {}}
            /* ---------------------------
     🔥 Channel State
     --------------------------- */
            isOnline={true}
            threadList={false} // set true inside Thread component
            watchers={{}}
            members={{}}
            cooldownEndsAt={null}
            /* ---------------------------
     🔥 Sending Message
     --------------------------- */
            // sendMessage={sendMessageFn}
            /* ---------------------------
     🔥 UI Overrides (EVERY slot enabled)
     ----------------------------------- */

            // // Attachment / File Previews
            // AttachmentUploadPreviewList={AttachmentUploadPreviewList}
            // AttachmentPickerSelectionBar={AttachmentPickerSelectionBar}
            // // Audio recording UI
            // AudioRecorder={AudioRecorder}
            // AudioRecordingInProgress={AudioRecordingInProgress}
            // AudioRecordingPreview={AudioRecordingPreview}
            // AudioRecordingLockIndicator={AudioRecordingLockIndicator}
            // AudioRecordingWaveform={AudioRecordingWaveform}
            // // Input Areas
            // Input={MessageInputUI} // your custom UI
            // InputButtons={InputButtonsUI} // custom left+right icons
            // InputEditingStateHeader={InputEditingStateHeader}
            // InputReplyStateHeader={InputReplyStateHeader}
            // // Reply Component
            // Reply={ReplyPreview}
            // // Dropdown UI / Suggestions
            // AutoCompleteSuggestionList={AutoCompleteSuggestionList}
            // // Send Button
            // SendButton={SendButton}
            // // Thread checkbox message
            // ShowThreadMessageInChannelButton={ShowThreadMessageInChannelButton}
            // // Audio Buttons
            // StartAudioRecordingButton={StartAudioRecordingButton}
            // // Streaming / AI Generation
            // StopMessageStreamingButton={StopMessageStreamingButton}
            // // Replace native TextInput
            // TextInputComponent={TextInput}
            // // Commands UI
            // CommandInput={CommandInput}
            // // Poll UI
            // CreatePollContent={CreatePollContent}
            // // Cooldown
            // CooldownTimer={CooldownTimer}
          >
            <MessageList
              onThreadSelect={(parentMessage) => {
                navigation.navigate("Thread", { cid, mid: parentMessage?.id });
              }}
            />
            <MessageInput
              /* ------------------------------------
     🔥 Core Feature Toggles
     ------------------------------------ */
              hasCommands={true}
              hasFilePicker={true}
              hasImagePicker={true}
              hasCameraPicker={true}
              audioRecordingEnabled={true}
              showAttachmentPickerBottomSheet={false}
              /* ------------------------------------
     🔥 TextInput Config
     ------------------------------------ */
              additionalTextInputProps={{
                style: {
                  fontSize: 16,
                  color: "#000",
                  fontFamily: fonts.regular,
                },
                width: "100%",
                placeholder: "Message",
                placeholderTextColor: "#777",
                fontFamily: fonts.regular,
                multiline: true,
                padding: 12,
              }}
              /* ------------------------------------
     🔥 FULL CUSTOM INPUT UI
     ------------------------------------ */
              // Input={CustomInputUI}
              //Input={WhatsAppMessageInputUI}
              /* ------------------------------------
     🔥 UI OVERRIDE SLOTS — ALL ENABLED
     ------------------------------------ */

              // Upload preview inside input bar
              // AttachmentUploadPreviewList={CustomAttachmentPreviewList}
              // // Sliding attachment picker icons (image, file, camera)
              // AttachmentPickerSelectionBar={CustomAttachmentPickerSelectionBar}
              // /* --- Audio Recording UI --- */
              // AudioRecorder={CustomAudioRecorder}
              // AudioRecordingInProgress={CustomAudioRecordingInProgress}
              // AudioRecordingLockIndicator={CustomAudioRecordingLockIndicator}
              // AudioRecordingPreview={CustomAudioRecordingPreview}
              // AudioRecordingWaveform={CustomAudioRecordingWaveform}
              // /* --- Suggestions dropdown (commands, mentions, emojis) --- */
              // AutoCompleteSuggestionList={CustomAutoCompleteSuggestionList}
              // /* --- Input State Headers (reply, edit) --- */
              // InputEditingStateHeader={CustomInputEditingStateHeader}
              // InputReplyStateHeader={CustomInputReplyStateHeader}
              // /* --- Reply Preview inside input --- */
              // Reply={CustomReplyPreview}
              // /* --- Left & Right Buttons --- */
              // InputButtons={CustomInputButtons}
              // /* --- Send Button --- */
              // SendButton={CustomSendButton} // WhatsApp green send button here
              // /* --- Thread checkbox button --- */
              // ShowThreadMessageInChannelButton={
              //   CustomShowThreadMessageInChannelButton
              // }
              // /* --- Audio Recording Icon --- */
              // StartAudioRecordingButton={CustomStartAudioRecordingButton}
              // /* --- AI Streaming UI --- */
              // StopMessageStreamingButton={CustomStopMessageStreamingButton}
              // /* --- Replace native input (use for emoji integration) --- */
              // TextInputComponent={CustomTextInputComponent}
              // /* --- Commands UI --- */
              // CommandInput={CustomCommandInput}
              // /* --- Poll creation UI --- */
              // CreatePollContent={CustomCreatePollContent}
              // /* --- Cooldown timer (for slow-mode channels) --- */
              // CooldownTimer={CustomCooldownTimer}
            />
          </Channel>
        </WhatsAppBackground>
        </View>
      </KeyboardAvoidingView>
      <SafeAreaView style={styles.bottomSafeArea} edges={["bottom"]} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomSafeArea: {
    backgroundColor: "#F0F2F5",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#EFEAE2",
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
    backgroundColor: "#FCE4EC",
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 19,
    color: "#111B21",
    fontFamily: fonts.regular,
  },
  myText: {
    color: "#111B21",
  },
  otherText: {
    color: "#111B21",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
    alignSelf: "flex-end",
    fontFamily: fonts.regular,
  },
  myTimestamp: {
    color: "#667781",
  },
  otherTimestamp: {
    color: "#667781",
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
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  quickActionLabel: {
    fontSize: 11,
    color: "#444",
  },
});
