import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChannelList } from "stream-chat-expo";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "@/context/appContext";
import { useAuth } from "@/context/authContext";
import { BASE_URL } from "@/config/chatConfig";
import { WhatsAppChannelList } from "@/components/WhatsAppChannelList";
import { predefinedUsers, getUserById } from "@/config/users";
import { fonts } from "@/config/fonts";
import { UserSelectionModal } from "@/components/UserSelectionModal";

const sort = { last_updated: -1 };
const options = { state: true, watch: true };

export default function ChannelListScreen() {
  const navigation = useNavigation();
  const { userId } = useAuth();
  const { setChannel, chatClient } = useAppContext();
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeChats, setActiveChats] = useState([]);

  if (!userId) {
    return (
      <View style={styles.center}>
        <Text
          style={{ marginBottom: 12, fontFamily: fonts.regular, color: "#fff" }}
        >
          Pick a user to start chatting
        </Text>
        <Pressable style={styles.cta} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.ctaText}>Choose User</Text>
        </Pressable>
      </View>
    );
  }

  const filters = useMemo(
    () => ({ members: { $in: [String(userId)] }, type: "messaging" }),
    [userId]
  );

  const createChat = async (otherUserId = null) => {
    const me = String(userId);
    let other;
    
    if (otherUserId) {
      other = otherUserId;
    } else {
      // Default behavior: find the first available user that's not the current user
      const availableUsers = predefinedUsers.filter(user => user.id !== me);
      other = availableUsers.length > 0 ? availableUsers[0].id : "user_b";
    }

    const r = await fetch(`${BASE_URL}/stream/channel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        members: [me, other],
        name: `Chat: ${me} & ${other}`,
      }),
    });
    const data = await r.json();
    const cid = data?.cid;
    if (!cid) return;

    const [type, id] = cid.split(":");
    const ch = chatClient.channel(type, id);
    await ch.watch();

    setChannel(ch);
    navigation.navigate("Channel", { cid });
  };

  // Show active chats
  const mockChannels = activeChats.map(chatUserId => {
    const user = getUserById(chatUserId);
    return {
      id: `messaging:${user.id}`,
      name: user.name,
      lastMessage: "Tap to continue chatting",
      timestamp: "now",
      unreadCount: 0,
      isOnline: user.status === 'online',
      avatar: user.avatar,
    };
  });

  const handleUserSelect = async (selectedUserId) => {
    setShowUserModal(false);
    
    // Add to active chats if not already there
    if (!activeChats.includes(selectedUserId)) {
      setActiveChats(prev => [...prev, selectedUserId]);
    }
    
    // Create chat
    await createChat(selectedUserId);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <WhatsAppChannelList
        channels={mockChannels}
        onChannelSelect={(channelId) => {
          // Extract user ID from channel ID and create chat
          const otherUserId = channelId.replace('messaging:', '');
          createChat(otherUserId);
        }}
        onNewChat={() => setShowUserModal(true)}
      />
      
      <UserSelectionModal
        visible={showUserModal}
        onClose={() => setShowUserModal(false)}
        onUserSelect={handleUserSelect}
        currentUserId={userId}
      />
      {/* Keep the original ChannelList hidden for functionality */}
      <View style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}>
        <ChannelList
          filters={filters}
          options={options}
          sort={sort}
          onSelect={(channel) => {
            setChannel?.(channel);
            navigation.navigate("Channel", { cid: channel.cid });
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E91E63",
  },
  cta: {
    backgroundColor: "#C2185B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
});
