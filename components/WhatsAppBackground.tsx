import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const WhatsAppBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.background}>
        {/* WhatsApp-like subtle pattern */}
        <View style={styles.pattern} />
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E5F5',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F3E5F5',
  },
  pattern: {
    flex: 1,
    backgroundColor: '#F3E5F5',
    opacity: 0.1,
  },
});