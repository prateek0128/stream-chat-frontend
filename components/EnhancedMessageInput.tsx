import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AudioRecorderButton } from './AudioRecorderButton';
import { hapticFeedback, pasteFromClipboard, shareMessage, showImagePickerOptions } from '../utils/chatUtils';

interface EnhancedMessageInputProps {
  onSendMessage: (message: string) => void;
  onAudioMessage?: (uri: string) => void;
  onImageMessage?: (imageUri: string) => void;
  placeholder?: string;
}

export const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({
  onSendMessage,
  onAudioMessage,
  onImageMessage,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState('');
  const textInputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (message.trim()) {
      hapticFeedback.light();
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handlePaste = async () => {
    const clipboardText = await pasteFromClipboard();
    if (clipboardText) {
      setMessage(prev => prev + clipboardText);
      hapticFeedback.selection();
    }
  };

  const handleAudioRecorded = (uri: string) => {
    if (onAudioMessage) {
      onAudioMessage(uri);
    }
  };

  const handleImagePicker = async () => {
    const image = await showImagePickerOptions();
    if (image && onImageMessage) {
      onImageMessage(image.uri);
    }
  };

  const showAttachmentOptions = () => {
    hapticFeedback.medium();
    Alert.alert(
      'Attachment Options',
      'Choose an action',
      [
        { text: 'Select Image', onPress: handleImagePicker },
        { text: 'Paste Text', onPress: handlePaste },
        { text: 'Share Current Text', onPress: () => message && shareMessage(message) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleImagePicker}
          onLongPress={showAttachmentOptions}
        >
          <Ionicons name="attach-outline" size={20} color="#54656F" />
        </TouchableOpacity>

        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#54656F"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
          onFocus={() => hapticFeedback.selection()}
        />

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            hapticFeedback.selection();
            // Could add emoji picker here
          }}
        >
          <Ionicons name="happy-outline" size={20} color="#54656F" />
        </TouchableOpacity>
      </View>

      {message.trim() ? (
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: "#E91E63" }]}
          onPress={handleSend}
        >
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      ) : (
        <AudioRecorderButton onAudioRecorded={handleAudioRecorded} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F2',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 50,
  },
  actionButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});