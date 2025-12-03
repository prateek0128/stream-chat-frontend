import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { predefinedUsers, getUserById } from '@/config/users';
import { fonts } from '@/config/fonts';

interface UsersListProps {
  onUserSelect?: (userId: string) => void;
  selectedUserId?: string;
  showStatus?: boolean;
}

export const UsersList: React.FC<UsersListProps> = ({
  onUserSelect,
  selectedUserId,
  showStatus = true,
}) => {
  const renderUser = ({ item }) => {
    const isSelected = selectedUserId === item.id;
    
    return (
      <Pressable
        style={[
          styles.userItem,
          isSelected && styles.selectedUserItem
        ]}
        onPress={() => onUserSelect?.(item.id)}
      >
        <View style={styles.userInfo}>
          <Text style={styles.userAvatar}>{item.avatar}</Text>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userId}>@{item.id}</Text>
          </View>
        </View>
        
        {showStatus && (
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    item.status === 'online' ? '#4CAF50' :
                    item.status === 'away' ? '#FF9800' :
                    item.status === 'busy' ? '#F44336' : '#9E9E9E'
                }
              ]}
            />
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Users ({predefinedUsers.length})</Text>
      <FlatList
        data={predefinedUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#333',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  listContainer: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedUserItem: {
    borderColor: '#E91E63',
    backgroundColor: '#FCE4EC',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    fontSize: 32,
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#333',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#666',
  },
});