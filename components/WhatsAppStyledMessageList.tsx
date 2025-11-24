import React from 'react';
import { StyleSheet } from 'react-native';
import { MessageList } from 'stream-chat-expo';

export const WhatsAppStyledMessageList = (props) => {
  return (
    <MessageList
      {...props}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5DDD5',
  },
});