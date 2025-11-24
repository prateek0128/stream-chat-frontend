import React, { useState, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AudioRecorder, hapticFeedback } from '../utils/chatUtils';

interface AudioRecorderButtonProps {
  onAudioRecorded: (uri: string) => void;
}

export const AudioRecorderButton: React.FC<AudioRecorderButtonProps> = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const audioRecorder = useRef(new AudioRecorder()).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout>();

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulse = () => {
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const startRecording = async () => {
    await audioRecorder.startRecording();
    setIsRecording(true);
    setRecordingTime(0);
    startPulse();
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    const uri = await audioRecorder.stopRecording();
    setIsRecording(false);
    stopPulse();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (uri && recordingTime > 0) {
      onAudioRecorded(uri);
    }
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.recordingInfo}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.button, isRecording && styles.recordingButton]}
        onPressIn={() => {
          hapticFeedback.medium();
          startRecording();
        }}
        onPressOut={() => {
          hapticFeedback.light();
          stopRecording();
        }}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Ionicons 
            name={isRecording ? "stop" : "mic"} 
            size={20} 
            color="#fff" 
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ff4444',
    borderRadius: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  recordingTime: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: '#ff4444',
  },
});