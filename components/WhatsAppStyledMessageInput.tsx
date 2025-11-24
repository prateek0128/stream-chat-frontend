import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MessageInput } from 'stream-chat-expo';
import { fonts } from '../config/fonts';

export const WhatsAppStyledMessageInput = (props) => {
  return (
    <MessageInput
      {...props}
      additionalTextInputProps={{
        style: styles.textInput,
        placeholder: "Type a message",
        placeholderTextColor: "#54656F",
      }}
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: '#F2F2F2',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
    borderWidth: 0,
    maxHeight: 100,
    color: '#000',
    marginHorizontal: 16,
    marginVertical: 8,
  },
});