import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export const WhatsAppBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  
  console.log('Background color:', colors.background);
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pattern: {
    flex: 1,
    opacity: 0.05,
  },
});