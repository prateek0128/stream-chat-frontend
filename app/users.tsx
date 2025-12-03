import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UsersList } from '@/components/UsersList';
import { predefinedUsers, getUserById } from '@/config/users';
import { useAuth } from '@/context/authContext';
import { fonts } from '@/config/fonts';

export default function UsersScreen() {
  const navigation = useNavigation();
  const { userId: currentUserId, setAuth } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(currentUserId || undefined);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleSwitchUser = () => {
    if (!selectedUserId) return;
    
    const user = getUserById(selectedUserId);
    if (user) {
      Alert.alert(
        'Switch User',
        `Switch to ${user.name} (@${user.id})?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Switch',
            onPress: () => {
              setAuth(user.id, user.name);
              navigation.navigate('Home');
            }
          }
        ]
      );
    }
  };

  const currentUser = currentUserId ? getUserById(currentUserId) : null;

  return (
    <SafeAreaView style={styles.container}>
      
      {currentUser && (
        <View style={styles.currentUserSection}>
          <Text style={styles.sectionTitle}>Current User</Text>
          <View style={styles.currentUserCard}>
            <Text style={styles.currentUserAvatar}>{currentUser.avatar}</Text>
            <View style={styles.currentUserInfo}>
              <Text style={styles.currentUserName}>{currentUser.name}</Text>
              <Text style={styles.currentUserId}>@{currentUser.id}</Text>
            </View>
            <View style={[
              styles.statusDot,
              { backgroundColor: '#4CAF50' }
            ]} />
          </View>
        </View>
      )}

      <View style={styles.usersSection}>
        <UsersList
          onUserSelect={handleUserSelect}
          selectedUserId={selectedUserId}
          showStatus={true}
        />
      </View>

      {selectedUserId && selectedUserId !== currentUserId && (
        <View style={styles.actionSection}>
          <Pressable style={styles.switchButton} onPress={handleSwitchUser}>
            <Text style={styles.switchButtonText}>
              Switch to {getUserById(selectedUserId)?.name}
            </Text>
          </Pressable>
        </View>
      )}

      <View style={styles.statsSection}>
        <Text style={styles.statsText}>
          Total Users: {predefinedUsers.length} | 
          Online: {predefinedUsers.filter(u => u.status === 'online').length} | 
          Away: {predefinedUsers.filter(u => u.status === 'away').length} | 
          Busy: {predefinedUsers.filter(u => u.status === 'busy').length}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  currentUserSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#333',
    marginBottom: 12,
  },
  currentUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    position: 'relative',
  },
  currentUserAvatar: {
    fontSize: 32,
    marginRight: 16,
  },
  currentUserInfo: {
    flex: 1,
  },
  currentUserName: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#333',
    marginBottom: 4,
  },
  currentUserId: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#666',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 12,
    right: 12,
  },
  usersSection: {
    flex: 1,
  },
  actionSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  switchButton: {
    backgroundColor: '#E91E63',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  statsSection: {
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  statsText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#666',
    textAlign: 'center',
  },
});