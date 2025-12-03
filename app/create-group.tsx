import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fonts } from '../config/fonts';

const mockContacts = [
  { id: '1', name: 'John Doe', selected: false },
  { id: '2', name: 'Jane Smith', selected: false },
  { id: '3', name: 'Mike Johnson', selected: false },
  { id: '4', name: 'Sarah Wilson', selected: false },
  { id: '5', name: 'David Brown', selected: false },
];

export default function CreateGroup() {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [contacts, setContacts] = useState(mockContacts);
  const [selectedCount, setSelectedCount] = useState(0);

  const toggleContact = (id: string) => {
    setContacts(prev => {
      const updated = prev.map(contact => 
        contact.id === id ? { ...contact, selected: !contact.selected } : contact
      );
      setSelectedCount(updated.filter(c => c.selected).length);
      return updated;
    });
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (selectedCount < 1) {
      Alert.alert('Error', 'Please select at least one contact');
      return;
    }
    Alert.alert('Success', 'Group created successfully!');
    navigation.goBack();
  };

  const renderContact = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.contactItem, item.selected && styles.selectedContact]} 
      onPress={() => toggleContact(item.id)}
    >
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactStatus}>Available</Text>
      </View>
      <View style={[styles.checkbox, item.selected && styles.checkedBox]}>
        {item.selected && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.groupSection}>
          <View style={styles.groupAvatar}>
            <Ionicons name="people" size={40} color="#fff" />
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Ionicons name="camera" size={16} color="#E91E63" />
            <Text style={styles.changePhotoText}>Add Group Photo</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Group Information</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.iconContainer}>
              <Ionicons name="people-outline" size={20} color="#E91E63" />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Group Name *</Text>
              <TextInput
                style={styles.textInput}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.inputGroup}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text-outline" size={20} color="#E91E63" />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.descriptionInput]}
                value={groupDescription}
                onChangeText={setGroupDescription}
                placeholder="Describe your group"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.contactsCard}>
          <View style={styles.contactsHeader}>
            <Text style={styles.cardTitle}>Add Participants</Text>
            <Text style={styles.selectedText}>{selectedCount} selected</Text>
          </View>
          
          <FlatList
            data={contacts}
            renderItem={renderContact}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
          />
        </View>
        
        <View style={styles.actionCard}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create Group</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={20} color="#666" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E91E63',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontFamily: fonts.medium,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  groupSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  groupAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 2,
  },
  changePhotoText: {
    marginLeft: 8,
    color: '#E91E63',
    fontFamily: fonts.medium,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: '#1a1a1a',
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 8,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: fonts.regular,
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: fonts.regular,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
  },
  descriptionInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  contactsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedText: {
    fontSize: 14,
    color: '#E91E63',
    fontFamily: fonts.medium,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  selectedContact: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#1a1a1a',
  },
  contactStatus: {
    fontSize: 14,
    color: '#666',
    fontFamily: fonts.regular,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  actionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  createButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
});