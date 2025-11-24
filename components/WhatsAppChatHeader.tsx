import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { fonts } from "../config/fonts";

interface WhatsAppChatHeaderProps {
  channelName: string;
  onVideoCall: () => void;
  onAudioCall: () => void;
}

export const WhatsAppChatHeader: React.FC<WhatsAppChatHeaderProps> = ({
  channelName,
  onVideoCall,
  onAudioCall,
}) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {channelName.charAt(0).toUpperCase()}
        </Text>
      </View>

      <TouchableOpacity style={styles.headerInfo} activeOpacity={0.8}>
        <Text style={styles.channelName}>{channelName}</Text>
        <Text style={styles.status}>last seen today at 12:30 PM</Text>
      </TouchableOpacity>

      <View style={styles.headerActions}>
        <TouchableOpacity onPress={onVideoCall} style={styles.actionButton}>
          <Ionicons name="videocam" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAudioCall} style={styles.actionButton}>
          <Ionicons name="call" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E91E63",
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#C2185B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
    marginLeft: 8,
  },
  iconText: {
    color: "#fff",
    fontSize: 20,
  },
});
