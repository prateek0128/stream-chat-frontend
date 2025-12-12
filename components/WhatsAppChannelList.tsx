import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import { fonts } from "../config/fonts";
import { useAuth } from "../context/authContext";

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  avatar?: string;
}

interface WhatsAppChannelListProps {
  channels: ChatItem[];
  onChannelSelect: (channelId: string) => void;
  onNewChat: () => void;
}

export const WhatsAppChannelList: React.FC<WhatsAppChannelListProps> = ({
  channels,
  onChannelSelect,
  onNewChat,
}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels || [];
    return (channels || []).filter(
      (channel) =>
        channel?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel?.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, searchQuery]);

  const renderChannelItem = ({ item }: { item: ChatItem }) => {
    console.log("CHANNEL ITEM:", item);
    if (!item) return null;

    const safeName = String(item.name || "Unknown");
    const safeLastMessage = String(item.lastMessage || "");
    const safeTimestamp = String(item.timestamp || "");

    return (
      <TouchableOpacity
        style={styles.channelItem}
        onPress={() => onChannelSelect(item.id)}
      >
        <View style={styles.avatar}>
          {item.avatar && item.avatar.startsWith("http") ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {item.avatar || safeName.charAt(0).toUpperCase()}
            </Text>
          )}
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.channelInfo}>
          <View style={styles.channelHeader}>
            <Text style={styles.channelName}>{safeName}</Text>
            <Text style={styles.timestamp}>{safeTimestamp}</Text>
          </View>
          <View style={styles.channelFooter}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {safeLastMessage}
            </Text>
            {Number(item.unreadCount) > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unreadCount > 99 ? "99+" : String(item.unreadCount)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowMenu(true)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search chats..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <FlatList
        data={filteredChannels.filter(Boolean)}
        renderItem={renderChannelItem}
        keyExtractor={(item, index) => item?.id || index.toString()}
        style={styles.list}
        contentContainerStyle={filteredChannels.length === 0 ? styles.listEmpty : undefined}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {searchQuery.trim() ? (
              <>
                <Ionicons name="search" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No chats found</Text>
                <Text style={styles.emptySubtext}>
                  Try searching with different keywords
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySubtext}>
                  Start a conversation by tapping the button below
                </Text>
                <TouchableOpacity style={styles.startChatButton} onPress={onNewChat}>
                  <Text style={styles.startChatText}>Start Chat</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={onNewChat}>
        <Ionicons name="chatbubble" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                navigation.navigate("Users");
              }}
            >
              <Ionicons name="people-circle-outline" size={20} color="#333" />
              <Text style={styles.menuText}>All Users</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                navigation.navigate("ProfileSettings");
              }}
            >
              <Ionicons name="person-circle-outline" size={20} color="#333" />
              <Text style={styles.menuText}>Profile Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                navigation.navigate("CreateGroup");
              }}
            >
              <Ionicons name="people-outline" size={20} color="#333" />
              <Text style={styles.menuText}>Create Group</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                navigation.navigate("BlockedAccounts");
              }}
            >
              <Ionicons name="ban-outline" size={20} color="#333" />
              <Text style={styles.menuText}>Blocked Accounts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                logout();
                navigation.navigate("Login");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#d32f2f" />
              <Text style={[styles.menuText, { color: "#d32f2f" }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E91E63",
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: fonts.medium || fonts.semiBold,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  list: {
    flex: 1,
  },
  channelItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  separator: {
    height: 0.5,
    backgroundColor: "#E4E6EA",
    marginLeft: 81,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#C2185B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    position: "relative",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: fonts.medium || fonts.semiBold,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#E91E63",
    borderWidth: 2,
    borderColor: "#fff",
  },
  channelInfo: {
    flex: 1,
  },
  channelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  channelName: {
    fontSize: 16,
    fontFamily: fonts.medium || fonts.semiBold,
    color: "#111B21",
  },
  timestamp: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#8696A0",
  },
  channelFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#8696A0",
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#E91E63",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerIconText: {
    color: "#fff",
    fontSize: 20,
  },
  fabIconText: {
    color: "#fff",
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 16,
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 180,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
    fontFamily: fonts.regular,
  },
  searchContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EA",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: "#1a1a1a",
    paddingVertical: 4,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  listEmpty: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: fonts.semiBold,
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  startChatButton: {
    backgroundColor: "#E91E63",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startChatText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
});
