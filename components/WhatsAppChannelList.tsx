import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../config/fonts";

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
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
          <Text style={styles.avatarText}>
            {safeName.charAt(0).toUpperCase()}
          </Text>
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
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={(channels || []).filter(Boolean)}
        renderItem={renderChannelItem}
        keyExtractor={(item, index) => item?.id || index.toString()}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <TouchableOpacity style={styles.fab} onPress={onNewChat}>
        <Ionicons name="chatbubble" size={24} color="#fff" />
      </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#E4E6EA',
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
});
