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

      <View style={styles.headerInfo}>
        <Text style={styles.channelName}>{channelName}</Text>
        <Text style={styles.status}>Online</Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity onPress={onVideoCall} style={styles.actionButton}>
          <Ionicons name="videocam" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAudioCall} style={styles.actionButton}>
          <Ionicons name="call" size={24} color="#fff" />
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
    paddingVertical: 12,
    //paddingTop: 50,
  },
  backButton: {
    marginRight: 12,
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
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  headerInfo: {
    flex: 1,
  },
  channelName: {
    color: "#fff",
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  status: {
    color: "#fff",
    fontSize: 14,
    fontFamily: fonts.regular,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  iconText: {
    color: "#fff",
    fontSize: 20,
  },
});
