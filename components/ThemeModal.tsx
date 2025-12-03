import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../config/fonts';
import { useTheme } from '../context/ThemeContext';

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
}

const themeOptions = [
  { id: 'default', name: 'Default Pink', color: '#E91E63' },
  { id: 'blue', name: 'Ocean Blue', color: '#2196F3' },
  { id: 'green', name: 'Nature Green', color: '#4CAF50' },
  { id: 'purple', name: 'Royal Purple', color: '#9C27B0' },
  { id: 'orange', name: 'Sunset Orange', color: '#FF9800' },
];

export const ThemeModal: React.FC<ThemeModalProps> = ({ visible, onClose }) => {
  const { currentTheme, setTheme } = useTheme();

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Theme</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.subtitle}>Select a theme for your chat</Text>
          
          {themeOptions.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={styles.themeItem}
              onPress={() => handleThemeSelect(theme.id)}
            >
              <View style={[styles.colorPreview, { backgroundColor: theme.color }]} />
              <Text style={styles.themeName}>{theme.name}</Text>
              {currentTheme === theme.id && (
                <Ionicons name="checkmark" size={20} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  closeButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: fonts.medium,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 16,
  },
  themeName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: fonts.regular,
  },
});