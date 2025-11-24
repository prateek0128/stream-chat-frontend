import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fonts } from '../config/fonts';

const mockBlockedUsers = [
  { id: '1', name: 'Spam User', blockedDate: '2024-01-15', reason: 'Spam messages' },
  { id: '2', name: 'Fake Account', blockedDate: '2024-01-10', reason: 'Suspicious activity' },
  { id: '3', name: 'Abusive User', blockedDate: '2024-01-05', reason: 'Inappropriate content' },
];

export default function BlockedAccounts() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState(mockBlockedUsers);

  const handleUnblock = (userId: string, userName: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: () => {
            setBlockedUsers(prev => prev.filter(user => user.id !== userId));
            Alert.alert('Success', `${userName} has been unblocked`);
          }
        }
      ]
    );
  };

  const renderBlockedUser = ({ item }: { item: any }) => (
    <View style={styles.userItem}>
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.blockDate}>Blocked on {item.blockedDate}</Text>
        <Text style={styles.blockReason}>{item.reason}</Text>
      </View>
      <TouchableOpacity 
        style={styles.unblockButton}
        onPress={() => handleUnblock(item.id, item.name)}
      >
        <Ionicons name="checkmark" size={16} color="#4CAF50" />
        <Text style={styles.unblockText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked Accounts</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <View style={styles.infoIcon}>
            <Ionicons name="ban" size={40} color="#E91E63" />
          </View>
          <Text style={styles.infoTitle}>Blocked Accounts</Text>
          <Text style={styles.infoSubtitle}>
            Users you've blocked won't be able to send you messages or see your profile
          </Text>
        </View>
        
        {blockedUsers.length > 0 ? (
          <View style={styles.usersCard}>
            <View style={styles.usersHeader}>
              <Text style={styles.cardTitle}>Blocked Users</Text>
              <Text style={styles.countText}>{blockedUsers.length} blocked</Text>
            </View>
            
            <FlatList
              data={blockedUsers}
              renderItem={renderBlockedUser}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            <Text style={styles.emptyTitle}>No Blocked Users</Text>
            <Text style={styles.emptySubtitle}>
              You haven't blocked anyone yet. Blocked users will appear here.
            </Text>
          </View>
        )}
        
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>About Blocking</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="eye-off-outline" size={20} color="#E91E63" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Privacy Protection</Text>
              <Text style={styles.infoValue}>Blocked users can't see your profile or status</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubble-outline" size={20} color="#E91E63" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Message Blocking</Text>
              <Text style={styles.infoValue}>They won't be able to send you messages</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="refresh-outline" size={20} color="#E91E63" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Reversible Action</Text>
              <Text style={styles.infoValue}>You can unblock users anytime</Text>
            </View>
          </View>
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
  infoSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  infoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 24,
    fontFamily: fonts.medium,
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoSubtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  usersCard: {
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
  usersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: '#1a1a1a',
  },
  countText: {
    fontSize: 14,
    color: '#E91E63',
    fontFamily: fonts.medium,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: fonts.medium,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  blockDate: {
    fontSize: 12,
    color: '#999',
    fontFamily: fonts.regular,
    marginBottom: 2,
  },
  blockReason: {
    fontSize: 14,
    color: '#666',
    fontFamily: fonts.regular,
  },
  unblockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  unblockText: {
    marginLeft: 4,
    color: '#4CAF50',
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  emptyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: fonts.medium,
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: fonts.regular,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: fonts.medium,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
});