import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Text as IconText } from 'react-native';

interface WhatsAppMessageBubbleProps {
  message: string;
  timestamp: string;
  isOwn: boolean;
  isRead?: boolean;
}

export const WhatsAppMessageBubble: React.FC<WhatsAppMessageBubbleProps> = ({
  message,
  timestamp,
  isOwn,
  isRead = false,
}) => {
  return (
    <View style={[styles.container, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
          {message}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
            {timestamp}
          </Text>
          {isOwn && (
            <IconText style={[styles.readStatus, { color: isRead ? "#4FC3F7" : "#999" }]}>
              ✓✓
            </IconText>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  ownBubble: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: '#000',
  },
  otherText: {
    color: '#000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 8,
  },
  ownTimestamp: {
    color: '#666',
  },
  otherTimestamp: {
    color: '#999',
  },
  readStatus: {
    marginLeft: 4,
    fontSize: 12,
  },
});