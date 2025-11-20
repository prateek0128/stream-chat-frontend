import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useAuth } from "../../context/authContext";
import { getVideoClient } from "../../lib/videoClient";
import {
  StreamVideo,
  StreamCall,
  CallContent,
  Call,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  addCallToHistory,
  CallHistoryItem,
} from "../../components/CallHistory";
import { fonts } from "../../config/fonts";

const { width, height } = Dimensions.get("window");

// Custom Call Controls Component
const WhatsAppCallControls = ({
  audioOnly,
  onEndCall,
  call,
}: {
  audioOnly: boolean;
  onEndCall: () => void;
  call: Call;
}) => {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(audioOnly);

  const toggleAudio = async () => {
    try {
      if (isMuted) {
        await call.microphone.enable();
      } else {
        await call.microphone.disable();
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  };

  const toggleVideo = async () => {
    try {
      if (isVideoOff) {
        await call.camera.enable();
      } else {
        await call.camera.disable();
      }
      setIsVideoOff(!isVideoOff);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  return (
    <View style={styles.controlsContainer}>
      <View style={styles.topControls}>
        <Text style={styles.callStatus}>
          {callingState === "ringing"
            ? "Calling..."
            : callingState === "joined"
            ? `Connected (${participants.length})`
            : "Connecting..."}
        </Text>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={[styles.controlButton, isMuted && styles.mutedButton]} 
          onPress={toggleAudio}
        >
          <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
        </TouchableOpacity>
        {!audioOnly && (
          <TouchableOpacity 
            style={[styles.controlButton, isVideoOff && styles.mutedButton]} 
            onPress={toggleVideo}
          >
            <Text style={styles.controlIcon}>{isVideoOff ? '📹' : '📷'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.endCallButton} onPress={onEndCall}>
          <Text style={styles.endCallIcon}>📞</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function CallScreen() {
  const { callId, mode } = useLocalSearchParams<{
    callId: string;
    mode?: string;
  }>();
  const audioOnly = mode === "audio";
  const { userId, userName } = useAuth();
  const router = useRouter();

  const me = useMemo(
    () => ({
      id: String(userId),
      name: userName || String(userId),
      image: "https://randomuser.me/api/portraits/men/4.jpg",
    }),
    [userId, userName]
  );

  const [client, setClient] = useState<any>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [err, setErr] = useState<Error | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [otherParticipantName, setOtherParticipantName] =
    useState<string>("Unknown");

  const handleEndCall = async () => {
    try {
      // Add call to history before ending
      if (callStartTime) {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        await addCallToHistory({
          callId: String(callId),
          participantName: otherParticipantName,
          participantId: "unknown",
          type: audioOnly ? "audio" : "video",
          direction: "outgoing",
          timestamp: callStartTime,
          duration,
        });
      }

      if (call) {
        await call.leave();
      }
      router.back();
    } catch (error) {
      console.error("Error ending call:", error);
      router.back();
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!userId || !callId) {
          console.log('Missing userId or callId:', { userId, callId });
          return;
        }

        console.log('Setting up call:', { userId, callId, audioOnly });
        setIsConnecting(true);
        
        const vc = await getVideoClient(String(userId), userName);
        console.log('Video client created successfully');
        
        const c = vc.call("default", String(callId));
        console.log('Call instance created:', callId);

        // Set up call event listeners
        c.on("call.session_participant_joined", (event: any) => {
          console.log("Participant joined:", event);
          if (!callStartTime) {
            setCallStartTime(Date.now());
          }
          // Get participant name
          if (
            event.participant?.user?.name &&
            event.participant.user.id !== userId
          ) {
            setOtherParticipantName(event.participant.user.name);
          }
        });

        c.on("call.session_participant_left", (event: any) => {
          console.log("Participant left:", event);
        });

        c.on("call.ended", async (event: any) => {
          console.log("Call ended:", event);

          // Add call to history
          if (callStartTime) {
            try {
              const duration = Math.floor((Date.now() - callStartTime) / 1000);
              await addCallToHistory({
                callId: String(callId),
                participantName: otherParticipantName,
                participantId: "unknown", // You'd get this from the call participants
                type: audioOnly ? "audio" : "video",
                direction: "outgoing", // Assuming outgoing for now
                timestamp: callStartTime,
                duration,
              });
            } catch (historyError) {
              console.warn('Failed to add call to history:', historyError);
            }
          }

          if (mounted) {
            router.back();
          }
        });

        // Join the call
        console.log('Joining call...');
        await c.join({
          create: true,
          data: {
            members: [{ user_id: me.id }],
            settings_override: {
              audio: {
                default_device: 'speaker',
                mic_default_on: true,
                speaker_default_on: true,
              },
              video: {
                enabled: !audioOnly,
                camera_default_on: !audioOnly,
                target_resolution: {
                  width: 640,
                  height: 480,
                },
              },
            },
          },
        });
        console.log('Call joined successfully');

        // Configure media based on call type
        try {
          if (audioOnly) {
            await c.camera.disable();
            await c.microphone.enable();
            console.log('Audio-only call configured');
          } else {
            await c.camera.enable();
            await c.microphone.enable();
            console.log('Video call configured');
          }
        } catch (mediaError) {
          console.warn('Media configuration error:', mediaError);
          // Continue anyway
        }

        if (mounted) {
          setClient(vc);
          setCall(c);
          setIsConnecting(false);
          console.log('Call setup completed successfully');
        }
      } catch (e: any) {
        console.error("Call setup error:", e);
        if (mounted) {
          setErr(e);
          setIsConnecting(false);
        }
      }
    })();

    return () => {
      mounted = false;
      if (call) {
        console.log('Cleaning up call...');
        call.leave().catch(console.error);
      }
    };
  }, [userId, callId, audioOnly, me.id, userName]);

  if (err) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Call Failed</Text>
          <Text style={styles.errorMessage}>{String(err.message || err)}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isConnecting || !client || !call) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.callingText}>
            {audioOnly ? "Starting audio call..." : "Starting video call..."}
          </Text>
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StreamVideo client={client}>
        <StreamCall call={call}>
          {audioOnly ? (
            <View style={styles.audioCallContainer}>
              <View style={styles.audioCallContent}>
                <View style={styles.largeAvatar}>
                  <Text style={styles.largeAvatarText}>👤</Text>
                </View>
                <Text style={styles.participantName}>Audio Call</Text>
                <WhatsAppCallControls
                  audioOnly={true}
                  onEndCall={handleEndCall}
                  call={call}
                />
              </View>
            </View>
          ) : (
            <View style={styles.videoCallContainer}>
              <CallContent />
              <WhatsAppCallControls
                audioOnly={false}
                onEndCall={handleEndCall}
                call={call}
              />
            </View>
          )}
        </StreamCall>
      </StreamVideo>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#E91E63",
  },
  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  avatarText: {
    fontSize: 50,
  },
  callingText: {
    fontSize: 18,
    fontFamily: fonts.regular,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  loader: {
    marginTop: 20,
  },
  cancelButton: {
    position: "absolute",
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff4444",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelIcon: {
    fontSize: 24,
    color: "#fff",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  errorContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: "#fff",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: "#E91E63",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  audioCallContainer: {
    flex: 1,
    backgroundColor: "#E91E63",
  },
  audioCallContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  largeAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  largeAvatarText: {
    fontSize: 60,
  },
  participantName: {
    fontSize: 24,
    fontFamily: fonts.semiBold,
    color: "#fff",
    marginBottom: 40,
  },
  videoCallContainer: {
    flex: 1,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingBottom: 40,
  },
  topControls: {
    alignItems: "center",
    paddingVertical: 20,
  },
  callStatus: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  mutedButton: {
    backgroundColor: "#ff4444",
  },
  controlIcon: {
    fontSize: 24,
  },
  endCallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff4444",
    alignItems: "center",
    justifyContent: "center",
  },
  endCallIcon: {
    fontSize: 24,
    color: "#fff",
  },
});
