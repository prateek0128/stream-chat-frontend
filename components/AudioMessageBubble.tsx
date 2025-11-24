import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AudioRecorder, hapticFeedback } from '../utils/chatUtils';

interface AudioMessageBubbleProps {
  audioUri: string;
  duration?: number;
  isOwn: boolean;
  timestamp: string;
}

export const AudioMessageBubble: React.FC<AudioMessageBubbleProps> = ({
  audioUri,
  duration = 0,
  isOwn,
  timestamp,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRecorder = useRef(new AudioRecorder()).current;

  const handlePlayPause = async () => {
    hapticFeedback.light();
    
    if (isPlaying) {
      await audioRecorder.stopSound();
      setIsPlaying(false);
    } else {
      await audioRecorder.playSound(audioUri);
      setIsPlaying(true);
      // In a real implementation, you'd track playback progress
      setTimeout(() => setIsPlaying(false), duration * 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <View style={styles.audioContent}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={20} 
              color={isOwn ? "#075E54" : "#fff"} 
            />
          </TouchableOpacity>
          
          <View style={styles.waveform}>
            {[...Array(20)].map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.waveBar,
                  { 
                    height: Math.random() * 20 + 5,
                    backgroundColor: isOwn ? "#075E54" : "#fff",
                    opacity: i < (currentTime / duration) * 20 ? 1 : 0.3
                  }
                ]} 
              />
            ))}
          </View>
          
          <Text style={[styles.duration, isOwn ? styles.ownText : styles.otherText]}>
            {formatTime(duration)}
          </Text>
        </View>
        
        <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
          {timestamp}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  ownBubble: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#075E54',
    borderBottomLeftRadius: 4,
  },
  audioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    marginRight: 8,
  },
  waveBar: {
    width: 2,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
  },
  ownText: {
    color: '#075E54',
  },
  otherText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownTimestamp: {
    color: '#666',
  },
  otherTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
});