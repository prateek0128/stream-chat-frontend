import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';

interface IncomingCallNotificationProps {
  visible: boolean;
  callerName: string;
  callId: string;
  isVideoCall: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const { width, height } = Dimensions.get('window');

export const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({
  visible,
  callerName,
  callId,
  isVideoCall,
  onAccept,
  onDecline,
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      // Start pulsing animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [visible, pulseAnim]);

  const handleAccept = () => {
    onAccept();
    router.push({
      pathname: `/call/${callId}`,
      params: isVideoCall ? {} : { mode: 'audio' },
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Caller Info */}
          <View style={styles.callerInfo}>
            <Animated.View
              style={[
                styles.avatar,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Text style={styles.avatarText}>
                {callerName.charAt(0).toUpperCase()}
              </Text>
            </Animated.View>
            
            <Text style={styles.callerName}>{callerName}</Text>
            <Text style={styles.callType}>
              Incoming {isVideoCall ? 'video' : 'audio'} call...
            </Text>
          </View>

          {/* Call Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={onDecline}
            >
              <Text style={styles.declineIcon}>📞</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
            >
              <Text style={styles.acceptIcon}>📞</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>🔇</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    backgroundColor: '#E91E63',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  callerInfo: {
    alignItems: 'center',
    marginBottom: 50,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#AD1457',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  callerName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  callType: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  declineButton: {
    backgroundColor: '#ff4444',
    transform: [{ rotate: '135deg' }],
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineIcon: {
    fontSize: 28,
    color: '#fff',
  },
  acceptIcon: {
    fontSize: 28,
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 20,
  },
  quickActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 20,
  },
});