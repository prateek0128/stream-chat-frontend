import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { fonts } from '../config/fonts';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface WhatsAppMessageListProps {
  messages: Message[];
}

export const WhatsAppMessageList: React.FC<WhatsAppMessageListProps> = ({ messages }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = (message: Message) => {
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.isOwn ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            message.isOwn ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          <Text style={[styles.messageText, message.isOwn ? styles.ownText : styles.otherText]}>
            {message.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, message.isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
              {formatTime(message.timestamp)}
            </Text>
            {message.isOwn && (
              <View style={styles.statusContainer}>
                <Text style={[styles.statusIcon, { color: message.status === 'read' ? '#4FC3F7' : '#8696A0' }]}>
                  {message.status === 'sent' ? '✓' : '✓✓'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 1,
    marginHorizontal: 8,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 1,
  },
  ownBubble: {
    backgroundColor: '#FCE4EC',
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 19,
    fontFamily: fonts.regular,
  },
  ownText: {
    color: '#111B21',
  },
  otherText: {
    color: '#111B21',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  ownTimestamp: {
    color: '#667781',
  },
  otherTimestamp: {
    color: '#667781',
  },
  statusContainer: {
    marginLeft: 4,
  },
  statusIcon: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
});