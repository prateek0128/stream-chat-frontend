import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { CallHistory } from '@/components/CallHistory';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/appContext';
import { fonts } from '@/config/fonts';

export default function CallsScreen() {
  const router = useRouter();
  const { callManager } = useAppContext();

  const handleCallPress = async (callId: string, isVideo: boolean) => {
    try {
      // For call history, we'll create a new call with the same participants
      // In a real app, you'd want to get the participant IDs from the call history
      router.push({
        pathname: `/call/${callId}`,
        params: isVideo ? {} : { mode: 'audio' },
      });
    } catch (error) {
      console.error('Failed to start call from history:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Calls',
          headerStyle: {
            backgroundColor: '#E91E63',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontFamily: fonts.semiBold,
            fontSize: 18,
          },
        }} 
      />
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