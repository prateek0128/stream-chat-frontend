import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export const WhatsAppStatusBar: React.FC = () => {
  return (
    <StatusBar
      style="light"
      backgroundColor="#E91E63"
      translucent={false}
    />
  );
};