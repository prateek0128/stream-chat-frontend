import React, { useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from "react-native";
import { Text as IconText } from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import { fonts } from "../config/fonts";
import { AudioRecorderButton } from './AudioRecorderButton';
import { pasteFromClipboard, hapticFeedback, showImagePickerOptions } from '../utils/chatUtils';

interface WhatsAppMessageInputProps {
  onSendMessage: (message: string) => void;
  onAudioMessage?: (uri: string) => void;
  onImageMessage?: (imageUri: string) => void;
}

export const WhatsAppMessageInput: React.FC<WhatsAppMessageInputProps> = ({
  onSendMessage,
  onAudioMessage,
  onImageMessage,
}) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      hapticFeedback.light();
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handlePaste = async () => {
    const clipboardText = await pasteFromClipboard();
    if (clipboardText) {
      setMessage(prev => prev + clipboardText);
      hapticFeedback.selection();
    }
  };

  const handleImagePicker = async () => {
    const image = await showImagePickerOptions();
    if (image && onImageMessage) {
      onImageMessage(image.uri);
    }
  };

  const handleAudioRecorded = (uri: string) => {
    if (onAudioMessage) {
      onAudioMessage(uri);
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const audioRecorder = useRef(new (require('../utils/chatUtils').AudioRecorder)()).current;

  const startRecording = async () => {
    setIsRecording(true);
    await audioRecorder.startRecording();
  };

  const stopRecording = async () => {
    const uri = await audioRecorder.stopRecording();
    setIsRecording(false);
    if (uri) handleAudioRecorded(uri);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.attachButton}
          onPress={handleImagePicker}
          onLongPress={() => {
            hapticFeedback.medium();
            Alert.alert('Options', 'Choose an action', [
              { text: 'Select Image', onPress: handleImagePicker },
              { text: 'Paste Text', onPress: handlePaste },
              { text: 'Cancel', style: 'cancel' }
            ]);
          }}
        >
          <IconText style={styles.iconText}>📎</IconText>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          placeholderTextColor="#54656F"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity 
          style={styles.emojiButton}
          onPress={() => {
            hapticFeedback.selection();
            setShowEmojiPicker(true);
          }}
        >
          <IconText style={styles.iconText}>😊</IconText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: message.trim() ? "#E91E63" : "#54656F" },
        ]}
        onPress={handleSend}
        onPressIn={!message.trim() ? startRecording : undefined}
        onPressOut={!message.trim() ? stopRecording : undefined}
        disabled={!message.trim()}
      >
        <IconText style={styles.sendIconText}>
          {message.trim() ? "➤" : "🎤"}
        </IconText>
      </TouchableOpacity>
      
      <Modal
        visible={showEmojiPicker}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <View style={styles.emojiPickerContainer}>
          <View style={styles.emojiPickerHeader}>
            <TouchableOpacity 
              onPress={() => setShowEmojiPicker(false)}
              style={styles.closeButton}
            >
              <IconText style={styles.closeButtonText}>✕</IconText>
            </TouchableOpacity>
          </View>
          <EmojiSelector
            onEmojiSelected={(emoji) => {
              setMessage(prev => prev + emoji);
              setShowEmojiPicker(false);
            }}
            showTabs={true}
            showSearchBar={true}
            showSectionTitles={true}
            category={undefined}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F2F2F2",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 50,
  },
  attachButton: {
    padding: 4,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    maxHeight: 100,
    paddingVertical: 8,
    fontFamily: fonts.regular,
  },
  emojiButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 20,
    color: "#54656F",
  },
  sendIconText: {
    fontSize: 16,
    color: "#fff",
  },
  emojiPickerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emojiPickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#E91E63",
    paddingTop: 50,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },

});
