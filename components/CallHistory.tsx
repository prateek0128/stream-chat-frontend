import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
// Simple in-memory storage to replace AsyncStorage
class SimpleStorage {
  private storage: { [key: string]: string } = {};

  async getItem(key: string): Promise<string | null> {
    return this.storage[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage[key] = value;
  }

  async removeItem(key: string): Promise<void> {
    delete this.storage[key];
  }
}

const AsyncStorage = new SimpleStorage();
import { navigate } from '../lib/navigationService';
import { fonts } from '../config/fonts';

export interface CallHistoryItem {
  id: string;
  callId: string;
  participantName: string;
  participantId: string;
  type: 'video' | 'audio';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  duration?: number; // in seconds
}

interface CallHistoryProps {
  onCallPress?: (callId: string, isVideo: boolean) => void;
}

const CALL_HISTORY_KEY = 'call_history';

export const CallHistory: React.FC<CallHistoryProps> = ({ onCallPress }) => {
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);


  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(CALL_HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        setCallHistory(history.sort((a: CallHistoryItem, b: CallHistoryItem) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Failed to load call history:', error);
    }
  };

  const addCallToHistory = async (call: Omit<CallHistoryItem, 'id'>) => {
    try {
      const newCall: CallHistoryItem = {
        ...call,
        id: `${call.callId}_${Date.now()}`,
      };

      const stored = await AsyncStorage.getItem(CALL_HISTORY_KEY);
      const existingHistory: CallHistoryItem[] = stored ? JSON.parse(stored) : [];
      
      const updatedHistory = [newCall, ...existingHistory].slice(0, 100); // Keep last 100 calls
      
      await AsyncStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(updatedHistory));
      setCallHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to save call to history:', error);
    }
  };

  const clearCallHistory = async () => {
    Alert.alert(
      'Clear Call History',
      'Are you sure you want to clear all call history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(CALL_HISTORY_KEY);
              setCallHistory([]);
            } catch (error) {
              console.error('Failed to clear call history:', error);
            }
          },
        },
      ]
    );
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (item: CallHistoryItem) => {
    if (item.direction === 'missed') {
      return item.type === 'video' ? '📹❌' : '📞❌';
    }
    if (item.direction === 'incoming') {
      return item.type === 'video' ? '📹⬇️' : '📞⬇️';
    }
    return item.type === 'video' ? '📹⬆️' : '📞⬆️';
  };

  const getCallColor = (direction: string) => {
    switch (direction) {
      case 'missed':
        return '#ff4444';
      case 'incoming':
        return '#4CAF50';
      case 'outgoing':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const handleCallPress = (item: CallHistoryItem) => {
    if (onCallPress) {
      onCallPress(item.callId, item.type === 'video');
    } else {
      // Default behavior - start a new call
      navigate('Call', {
        callId: item.callId,
        ...(item.type === 'audio' ? { mode: 'audio' } : {}),
      });
    }
  };

  const renderCallItem = ({ item }: { item: CallHistoryItem }) => (
    <TouchableOpacity
      style={styles.callItem}
      onPress={() => handleCallPress(item)}
    >
      <View style={styles.callIcon}>
        <Text style={styles.iconText}>{getCallIcon(item)}</Text>
      </View>
      
      <View style={styles.callInfo}>
        <Text style={styles.participantName}>{item.participantName}</Text>
        <View style={styles.callDetails}>
          <Text style={[styles.callDirection, { color: getCallColor(item.direction) }]}>
            {item.direction === 'missed' ? 'Missed' : 
             item.direction === 'incoming' ? 'Incoming' : 'Outgoing'}
          </Text>
          {item.duration && (
            <Text style={styles.duration}> • {formatDuration(item.duration)}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.callTime}>
        <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCallPress(item)}
        >
          <Text style={styles.callButtonIcon}>
            {item.type === 'video' ? '📹' : '📞'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Calls</Text>
        {callHistory.length > 0 && (
          <TouchableOpacity onPress={clearCallHistory}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {callHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📞</Text>
          <Text style={styles.emptyText}>No recent calls</Text>
          <Text style={styles.emptySubtext}>
            Your call history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={callHistory}
          renderItem={renderCallItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

// Export the function to add calls to history
export const addCallToHistory = async (call: Omit<CallHistoryItem, 'id'>) => {
  try {
    console.log('Call added to history:', call);
    // For now, just log the call since we're using in-memory storage
  } catch (error) {
    console.error('Failed to save call to history:', error);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: '#E91E63',
  },
  clearButton: {
    color: '#ff4444',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  callIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
  },
  callInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#000',
    marginBottom: 2,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callDirection: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  duration: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#666',
  },
  callTime: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#666',
    marginBottom: 4,
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonIcon: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#999',
    textAlign: 'center',
  },
});