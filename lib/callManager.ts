// lib/callManager.ts

// Simple EventEmitter implementation for React Native
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(...args));
    }
  }

  removeListener(event: string, listener: Function) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((l) => l !== listener);
    }
  }

  removeAllListeners(event?: string) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

import { getVideoClient } from "./videoClient";

export interface IncomingCall {
  callId: string;
  callerName: string;
  callerUserId: string;
  isVideoCall: boolean;
  timestamp: number;
}

class CallManager extends EventEmitter {
  private activeCall: any = null;
  private outgoingCall: any = null;
  private incomingCall: IncomingCall | null = null;
  private videoClient: any = null;
  private initializing: Promise<void> | null = null;

  /** Public check so UI can know if it’s ready */
  isInitialized() {
    return !!this.videoClient;
  }

  /** Call this once after login / userId is known */
  async initialize(userId: string, userName?: string) {
    // If already ready, do nothing
    if (this.videoClient) {
      console.log("CallManager already initialized");
      return;
    }

    // Avoid double-init races
    if (this.initializing) {
      await this.initializing;
      return;
    }

    this.initializing = (async () => {
      try {
        console.log("Initializing call manager for user:", userId);
        this.videoClient = await getVideoClient(userId, userName);

        // Clear any existing listeners (defensive)
        if (this.videoClient.off) {
          this.videoClient.off("call.ring");
          this.videoClient.off("call.session_participant_joined");
          this.videoClient.off("call.session_participant_left");
          this.videoClient.off("call.ended");
        }

        // Listen for incoming calls
        this.videoClient.on("call.ring", (event: any) => {
          console.log("Incoming call:", event);
          this.handleIncomingCall(event);
        });

        // Listen for call updates
        this.videoClient.on(
          "call.session_participant_joined",
          (event: any) => {
            console.log("Participant joined:", event);
            this.emit("participantJoined", event);
          }
        );

        this.videoClient.on(
          "call.session_participant_left",
          (event: any) => {
            console.log("Participant left:", event);
            this.emit("participantLeft", event);
          }
        );

        this.videoClient.on("call.ended", (event: any) => {
          console.log("Call ended:", event);
          this.handleCallEnded(event);
        });

        console.log("✅ Call manager initialized successfully");
      } catch (error) {
        console.error("Failed to initialize call manager:", error);
        // if init fails, make sure videoClient stays null
        this.videoClient = null;
        throw error;
      } finally {
        this.initializing = null;
      }
    })();

    return this.initializing;
  }

  private handleIncomingCall(event: any) {
    const call = event.call;
    const caller = event.user;

    const incomingCall: IncomingCall = {
      callId: call.id,
      callerName: caller?.name || caller?.id,
      callerUserId: caller?.id,
      isVideoCall: call.settings?.video?.enabled !== false,
      timestamp: Date.now(),
    };

    this.incomingCall = incomingCall;
    this.emit("incomingCall", incomingCall);
  }

  private handleCallEnded(event: any) {
    this.activeCall = null;
    this.outgoingCall = null;
    this.incomingCall = null;
    this.emit("callEnded", event);
  }

  async acceptCall(callId: string) {
    if (!this.videoClient) {
      throw new Error("Call manager not initialized");
    }

    try {
      console.log("Accepting call:", callId);
      const call = this.videoClient.call("default", callId);
      await call.join();

      this.activeCall = call;
      this.incomingCall = null;

      this.emit("callAccepted", { callId });
      console.log("Call accepted successfully:", callId);
      return call;
    } catch (error) {
      console.error("Failed to accept call:", error);
      throw error;
    }
  }

  async declineCall(callId: string) {
    if (!this.videoClient) {
      throw new Error("Call manager not initialized");
    }

    try {
      const call = this.videoClient.call("default", callId);
      await call.reject();

      this.incomingCall = null;
      this.emit("callDeclined", { callId });
    } catch (error) {
      console.error("Failed to decline call:", error);
      throw error;
    }
  }

  async startCall(
    callId: string,
    memberIds: string[],
    isVideoCall: boolean = true
  ) {
    if (!this.videoClient) {
      throw new Error("Call manager not initialized");
    }

    try {
      console.log("Starting call:", { callId, memberIds, isVideoCall });
      const call = this.videoClient.call("default", callId);

      // Listen for when someone joins the call (indicates they accepted)
      call.on("call.session_participant_joined", (event: any) => {
        console.log("Participant joined call:", event.participant?.user?.id);
        // Only emit if it's not the caller themselves
        if (event.participant?.user?.id !== this.videoClient.user?.id) {
          this.emit("callAnswered", { callId, acceptedBy: event.participant?.user });
        }
      });

      // Create the call with members but don't join yet
      await call.create({
        data: {
          members: memberIds.map((id) => ({ user_id: id })),
          settings_override: {
            audio: {
              default_device: "speaker",
              mic_default_on: true,
              speaker_default_on: true,
            },
            video: {
              enabled: isVideoCall,
              camera_default_on: isVideoCall,
              target_resolution: {
                width: 640,
                height: 480,
              },
            },
          },
        },
      });

      // Ring the call to notify other participants
      await call.ring();

      this.outgoingCall = call;
      this.emit("callStarted", { callId, isVideoCall });

      console.log("Call started successfully:", callId);
      return call;
    } catch (error) {
      console.error("Failed to start call:", error);
      throw error;
    }
  }

  async endCall() {
    try {
      if (this.activeCall) {
        await this.activeCall.endCall();
        this.activeCall = null;
      } else if (this.outgoingCall) {
        await this.outgoingCall.endCall();
        this.outgoingCall = null;
      }
      this.emit("callEnded", {});
    } catch (error) {
      console.error("Failed to end call:", error);
      throw error;
    }
  }

  getIncomingCall(): IncomingCall | null {
    return this.incomingCall;
  }

  getActiveCall() {
    return this.activeCall;
  }

  isInCall(): boolean {
    return this.activeCall !== null;
  }

  isRinging(): boolean {
    return this.outgoingCall !== null;
  }

  async joinOutgoingCall() {
    if (this.outgoingCall) {
      try {
        await this.outgoingCall.join();
        this.activeCall = this.outgoingCall;
        this.outgoingCall = null;
        this.emit("callConnected", {});
      } catch (error) {
        console.error("Failed to join outgoing call:", error);
      }
    }
  }

  // Method to join call when answered
  async joinCallWhenAnswered() {
    if (this.outgoingCall) {
      try {
        console.log('Joining outgoing call after being answered');
        await this.outgoingCall.join();
        this.activeCall = this.outgoingCall;
        this.outgoingCall = null;
        this.emit("callConnected", {});
        console.log('Successfully joined answered call');
      } catch (error) {
        console.error('Failed to join answered call:', error);
        throw error;
      }
    }
  }

  hasIncomingCall(): boolean {
    return this.incomingCall !== null;
  }
}

// Singleton instance
export const callManager = new CallManager();
