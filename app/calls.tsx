import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { CallHistory } from '@/components/CallHistory';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '@/context/appContext';
import { fonts } from '@/config/fonts';

export default function CallsScreen() {
  const navigation = useNavigation();
  const { callManager } = useAppContext();

  const handleCallPress = async (callId: string, isVideo: boolean) => {
    try {
      // For call history, we'll create a new call with the same participants
      // In a real app, you'd want to get the participant IDs from the call history
      navigation.navigate('Call', {
        callId,
        ...(isVideo ? {} : { mode: 'audio' }),
      });
    } catch (error) {
      console.error('Failed to start call from history:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CallHistory onCallPress={handleCallPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});