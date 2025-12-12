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
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/authContext";
import { getVideoClient } from "../../lib/videoClient";
import {
  StreamVideo,
  StreamCall,
  CallContent,
  Call,
  useCallStateHooks,
  ParticipantView,
} from "@stream-io/video-react-native-sdk";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  addCallToHistory,
  CallHistoryItem,
} from "../../components/CallHistory";
import { fonts } from "../../config/fonts";

const { width, height } = Dimensions.get("window");

// Custom Video Layout Component
const CustomVideoLayout = ({ currentUserId }: { currentUserId: string }) => {
  const { useLocalParticipant, useRemoteParticipants } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const remoteParticipant = remoteParticipants[0];

  return (
    <View style={styles.videoCallContainer}>
      {/* Main Video - Remote Participant (Other User) */}
      {remoteParticipant ? (
        <ParticipantView
          participant={remoteParticipant}
          style={styles.mainVideo}
          trackType="videoTrack"
        />
      ) : (
        <View style={styles.mainVideo}>
          <Text style={styles.waitingText}>
            Waiting for other participant...
          </Text>
        </View>
      )}

      {/* PIP Video - Local Participant (Self) */}
      {localParticipant && (
        <ParticipantView
          participant={localParticipant}
          style={styles.pipVideo}
          trackType="videoTrack"
        />
      )}
    </View>
  );
};

// Custom Call Controls Component
const WhatsAppCallControls = ({
  audioOnly,
  onEndCall,
  call,
  callDuration,
}: {
  audioOnly: boolean;
  onEndCall: () => void;
  call: Call;
  callDuration?: number;
}) => {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(audioOnly);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // Initialize speaker state - always start with speaker off
  useEffect(() => {
    setIsSpeakerOn(false);
  }, []);

  const toggleAudio = async () => {
    try {
      if (!call?.microphone) return;
      const newMutedState = !isMuted;

      if (newMutedState) {
        await call.microphone.disable();
      } else {
        await call.microphone.enable();
      }

      setIsMuted(newMutedState);
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  const toggleVideo = async () => {
    try {
      if (!call?.camera) return;
      if (isVideoOff) {
        await call.camera.enable();
      } else {
        await call.camera.disable();
      }
      setIsVideoOff(!isVideoOff);
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

  const flipCamera = async () => {
    try {
      if (!call?.camera) return;
      await call.camera.flip();
    } catch (error) {
      console.error("Error flipping camera:", error);
    }
  };

  const toggleSpeaker = () => {
    const newSpeakerState = !isSpeakerOn;
    setIsSpeakerOn(newSpeakerState);
    console.log("Speaker toggled to:", newSpeakerState);
  };

  return (
    <View style={styles.controlsContainer}>
      <View style={styles.topControls}>
        <Text style={styles.callStatus}>
          {callingState === "ringing"
            ? "Calling..."
            : callingState === "joined" && participants.length >= 2
            ? callDuration !== undefined
              ? `${Math.floor(callDuration / 60)
                  .toString()
                  .padStart(2, "0")}:${(callDuration % 60)
                  .toString()
                  .padStart(2, "0")}`
              : `Connected (${Math.min(participants.length, 2)})`
            : "Calling..."}
        </Text>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.mutedButton]}
          onPress={toggleAudio}
        >
          <Text style={styles.controlIcon}>{isMuted ? "🔇" : "🎤"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !isSpeakerOn && styles.mutedButton]}
          onPress={toggleSpeaker}
        >
          <Text style={styles.controlIcon}>{isSpeakerOn ? "🔊" : "🔇"}</Text>
        </TouchableOpacity>

        {!audioOnly && (
          <>
            <TouchableOpacity
              style={[styles.controlButton, isVideoOff && styles.mutedButton]}
              onPress={toggleVideo}
            >
              <Text style={styles.controlIcon}>{isVideoOff ? "📹" : "📷"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={flipCamera}>
              <Text style={styles.controlIcon}>🔄</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.endCallButton} onPress={onEndCall}>
          <Text style={styles.endCallIcon}>📞</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function CallScreen() {
  const route = useRoute<any>();
  const { callId, mode, status } = route.params || {};
  const audioOnly = mode === "audio";
  const isOutgoingCall = status === "calling";
  const { userId, userName } = useAuth();
  const navigation = useNavigation();

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
  const [isCallAnswered, setIsCallAnswered] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Format call duration to MM:SS
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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
        await call.endCall();
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error ending call:", error);
      navigation.goBack();
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!userId || !callId) {
          console.log("Missing userId or callId:", { userId, callId });
          return;
        }

        console.log("Setting up call:", { userId, callId, audioOnly });
        setIsConnecting(true);

        const vc = await getVideoClient(String(userId), userName);
        console.log("Video client created successfully");

        const c = vc.call("default", String(callId));
        console.log("Call instance created:", callId);

        // Set up call event listeners
        c.on("call.session_participant_joined", async (event: any) => {
          console.log("Participant joined:", event);

          // Get participant name
          if (
            event.participant?.user?.name &&
            event.participant.user.id !== userId
          ) {
            setOtherParticipantName(event.participant.user.name);
          }

          if (!callStartTime && mounted) {
            setCallStartTime(Date.now());
          }
        });

        c.on("call.session_participant_left", (event: any) => {
          console.log("Participant left:", event);
        });

        c.on("call.rejected", async (event: any) => {
          console.log("Call rejected:", event);
          // Only navigate back if this is an outgoing call that was rejected
          if (mounted && isOutgoingCall) {
            navigation.goBack();
          }
        });

        c.on("call.ended", async (event: any) => {
          console.log("Call ended:", event);

          // Only navigate back if call was actually answered or if it's not an outgoing call
          const shouldNavigateBack = !isOutgoingCall || isCallAnswered;

          // Add call to history only if call actually started
          if (callStartTime) {
            try {
              const duration = Math.floor((Date.now() - callStartTime) / 1000);
              await addCallToHistory({
                callId: String(callId),
                participantName: otherParticipantName,
                participantId: "unknown",
                type: audioOnly ? "audio" : "video",
                direction: isOutgoingCall ? "outgoing" : "incoming",
                timestamp: callStartTime,
                duration,
              });
            } catch (historyError) {
              console.warn("Failed to add call to history:", historyError);
            }
          }

          if (mounted && shouldNavigateBack) {
            navigation.goBack();
          }
        });

        // Both users join the call
        try {
          if (isOutgoingCall) {
            console.log("Caller creating and joining call...");
            await c.getOrCreate();
          } else {
            console.log("Receiver joining call...");
          }

          // Join with camera enabled for video calls
          if (!audioOnly) {
            console.log("Joining with camera enabled...");
            await c.join({ create: isOutgoingCall });
            await c.camera.enable();
            await c.microphone.enable();
            console.log("Joined with video and audio");
          } else {
            await c.join({ create: isOutgoingCall });
            await c.microphone.enable();
            console.log("Joined with audio only");
          }

          if (mounted) {
            setClient(vc);
            setCall(c);
            setIsCallAnswered(true);
            setCallStartTime(Date.now());
            setIsConnecting(false);
          }
        } catch (joinError: any) {
          console.error("Failed to join call:", joinError);
          if (mounted) {
            setErr(new Error(joinError.message || "Failed to join call"));
            setIsConnecting(false);
          }
          return;
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
        console.log("Cleaning up call...");
        call.leave().catch(console.error);
      }
    };
  }, [userId, callId, audioOnly, me.id, userName]);

  // Timer effect for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (callStartTime && isCallAnswered) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStartTime, isCallAnswered]);

  if (err) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Call Failed</Text>
          <Text style={styles.errorMessage}>{String(err.message || err)}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
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
        <View style={styles.loadingContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.callingText}>
            {isCallAnswered
              ? "Connecting..."
              : audioOnly
              ? "Starting audio call..."
              : "Starting video call..."}
          </Text>
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show calling UI for outgoing calls that haven't been answered
  if (isOutgoingCall && !isCallAnswered && callStartTime === null) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.callingText}>
            {audioOnly ? "Audio calling..." : "Video calling..."}
          </Text>
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          <TouchableOpacity style={styles.cancelButton} onPress={handleEndCall}>
            <Text style={styles.cancelIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
                  callDuration={callDuration}
                />
              </View>
            </View>
          ) : (
            <View style={styles.videoCallContainer}>
              <CustomVideoLayout currentUserId={String(userId)} />
              <WhatsAppCallControls
                audioOnly={false}
                onEndCall={handleEndCall}
                call={call}
                callDuration={callDuration}
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
  fullScreenVideo: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  mainVideo: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  pipVideo: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 999,
    elevation: 999,
  },
  waitingText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginTop: 100,
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
