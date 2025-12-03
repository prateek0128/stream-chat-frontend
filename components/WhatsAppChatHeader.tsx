import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { fonts } from "../config/fonts";
import { ProfileModal } from "./ProfileModal";
import { ThemeModal } from "./ThemeModal";
import { SettingsModal } from "./SettingsModal";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/authContext";

interface WhatsAppChatHeaderProps {
  channelName: string;
  onVideoCall: () => void;
  onAudioCall: () => void;
  channel: any;
}

export const WhatsAppChatHeader: React.FC<WhatsAppChatHeaderProps> = ({
  channelName,
  onVideoCall,
  onAudioCall,
  channel,
}) => {
  const router = useRouter();
  const { colors } = useTheme();
  const { logout } = useAuth();
  const [activeStatus, setActiveStatus] = useState("last seen recently");
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const getOtherUser = () => {
    const members = Object.values(channel?.state?.members || {}) as any[];
    return members.find(member => member.user?.id !== channel?.state?.membership?.user?.id)?.user;
  };

  const getActiveStatus = () => {
    const members = Object.values(channel?.state?.members || {}) as any[];
    const otherMember = members.find(
      (member) => member.user?.id !== channel?.state?.membership?.user?.id
    );

    if (otherMember?.user?.online) {
      return "online";
    }

    if (otherMember?.user?.last_active) {
      const lastActive = new Date(otherMember.user.last_active);
      const now = new Date();
      const diffMinutes = Math.floor(
        (now.getTime() - lastActive.getTime()) / (1000 * 60)
      );

      if (diffMinutes < 1) return "online";
      if (diffMinutes < 60) return `last seen ${diffMinutes}m ago`;
      if (diffMinutes < 1440)
        return `last seen ${Math.floor(diffMinutes / 60)}h ago`;
      return `last seen ${Math.floor(diffMinutes / 1440)}d ago`;
    }

    return "last seen recently";
  };

  useEffect(() => {
    if (!channel) return;

    const updateStatus = async () => {
      try {
        // Force refresh channel data
        await channel.query({ presence: true });
        setActiveStatus(getActiveStatus());
      } catch (error) {
        console.log("Error updating status:", error);
        setActiveStatus(getActiveStatus());
      }
    };

    // Initial status
    updateStatus();

    // Polling for immediate updates
    const interval = setInterval(updateStatus, 3000);

    // Listen for member updates
    const handleMemberUpdate = () => updateStatus();
    const handleUserPresence = () => updateStatus();

    channel.on("member.updated", handleMemberUpdate);
    channel.on("user.presence.changed", handleUserPresence);
    channel.on("user.updated", handleUserPresence);

    return () => {
      clearInterval(interval);
      channel.off("member.updated", handleMemberUpdate);
      channel.off("user.presence.changed", handleUserPresence);
      channel.off("user.updated", handleUserPresence);
    };
  }, [channel]);

  return (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
          <Text style={styles.avatarText}>
            {channelName.charAt(0).toUpperCase()}
          </Text>
        </View>
        {activeStatus === "online" && <View style={[styles.onlineIndicator, { borderColor: colors.primary }]} />}
      </View>

      <TouchableOpacity style={styles.headerInfo} activeOpacity={0.8}>
        <Text style={styles.channelName}>{channelName}</Text>
        <Text style={styles.status}>{activeStatus}</Text>
      </TouchableOpacity>

      <View style={styles.headerActions}>
        <TouchableOpacity onPress={onVideoCall} style={styles.actionButton}>
          <Ionicons name="videocam" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAudioCall} style={styles.actionButton}>
          <Ionicons name="call" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowMenu(true)}>
          <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
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
                setShowProfile(true);
              }}
            >
              <Ionicons name="person-outline" size={20} color="#333" />
              <Text style={styles.menuText}>View Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setShowMenu(false);
                setShowTheme(true);
              }}
            >
              <Ionicons name="color-palette-outline" size={20} color="#333" />
              <Text style={styles.menuText}>Change Theme</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setShowMenu(false);
                setShowSettings(true);
              }}
            >
              <Ionicons name="settings-outline" size={20} color="#333" />
              <Text style={styles.menuText}>Chat Settings</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <ProfileModal
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        user={getOtherUser()}
      />
      
      <ThemeModal
        visible={showTheme}
        onClose={() => setShowTheme(false)}
      />
      
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.medium || fonts.semiBold,
  },
  headerInfo: {
    flex: 1,
    paddingVertical: 4,
  },
  channelName: {
    color: "#fff",
    fontSize: 18,
    fontFamily: fonts.medium || fonts.semiBold,
    lineHeight: 22,
  },
  status: {
    color: "#fff",
    fontSize: 13,
    fontFamily: fonts.regular,
    opacity: 0.8,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  iconText: {
    color: "#fff",
    fontSize: 20,
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
});
