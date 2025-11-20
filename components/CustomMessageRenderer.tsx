import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WhatsAppMessageBubble } from './WhatsAppMessageBubble';

interface CustomMessageRendererProps {
  message: any;
  currentUserId: string;
}

export const CustomMessageRenderer: React.FC<CustomMessageRendererProps> = ({
  message,
  currentUserId,
}) => {
  const isOwn = message.user?.id === currentUserId;
  
  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <WhatsAppMessageBubble
      message={message.text || ''}
      timestamp={formatTime(message.created_at || new Date())}
      isOwn={isOwn}
      isRead={message.status === 'read'}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
  },
});