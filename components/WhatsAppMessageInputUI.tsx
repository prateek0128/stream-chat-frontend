import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useChannelContext, useMessageInputContext } from "stream-chat-expo";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

export const WhatsAppMessageInputUI = () => {
  const [text, setText] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const { channel } = useChannelContext();
  const messageInputContext = useMessageInputContext();

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant gallery access to select images"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await channel.sendMessage({
          attachments: [
            {
              type: "image",
              image_url: result.assets[0].uri,
              fallback: "Image",
            },
          ],
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera access to take photos"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await channel.sendMessage({
          attachments: [
            {
              type: "image",
              image_url: result.assets[0].uri,
              fallback: "Photo",
            },
          ],
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleTakeVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera access to record videos"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: 60,
        quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      if (!result.canceled && result.assets[0]) {
        await channel.sendMessage({
          attachments: [
            {
              type: "video",
              asset_url: result.assets[0].uri,
              fallback: "Video",
            },
          ],
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to record video");
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        await channel.sendMessage({
          attachments: [
            {
              type: "file",
              asset_url: file.uri,
              title: file.name,
              file_size: file.size,
              mime_type: file.mimeType,
              fallback: file.name,
            },
          ],
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const handleAudioRecord = async () => {
    Alert.alert(
      "Audio Recording",
      "Audio recording will be implemented after proper setup"
    );
  };

  const handleSend = async () => {
    if (text && text.trim()) {
      await channel.sendMessage({ text: text.trim() });
      setText("");
    }
  };

  const toggleAttachments = () => {
    if (showAttachments) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowAttachments(false));
    } else {
      setShowAttachments(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.wrapper}
    >
      {showAttachments && (
        <Animated.View
          style={[
            styles.attachmentOptions,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0],
                  }),
                },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.attachmentOption}
            onPress={() => {
              handleTakePhoto();
              setShowAttachments(false);
            }}
          >
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.attachmentText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.attachmentOption}
            onPress={() => {
              handleTakeVideo();
              setShowAttachments(false);
            }}
          >
            <Ionicons name="videocam" size={24} color="#fff" />
            <Text style={styles.attachmentText}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.attachmentOption}
            onPress={() => {
              handlePickImage();
              setShowAttachments(false);
            }}
          >
            <Ionicons name="image" size={24} color="#fff" />
            <Text style={styles.attachmentText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.attachmentOption}
            onPress={() => {
              handlePickFile();
              setShowAttachments(false);
            }}
          >
            <Ionicons name="document" size={24} color="#fff" />
            <Text style={styles.attachmentText}>Document</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={toggleAttachments}
        >
          <Ionicons name="attach" size={24} color="#8696A0" />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Message"
            placeholderTextColor="#8696A0"
            value={text}
            onChangeText={setText}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy-outline" size={24} color="#8696A0" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={text && text.trim() ? handleSend : handleAudioRecord}
        >
          <Ionicons
            name={text && text.trim() ? "send" : "mic"}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    flex: 1,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#F0F2F5",
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 8,
    maxHeight: 100,
  },
  emojiButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E91E63",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingButton: {
    backgroundColor: "#FF5722",
  },
  attachmentOptions: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#075E54",
    paddingVertical: 16,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  attachmentOption: {
    alignItems: "center",
    gap: 8,
  },
  attachmentText: {
    color: "#fff",
    fontSize: 12,
  },
});
