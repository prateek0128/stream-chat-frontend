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
      this.events[event].forEach(listener => listener(...args));
    }
  }

  removeListener(event: string, listener: Function) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
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
import { getVideoClient } from './videoClient';

export interface IncomingCall {
  callId: string;
  callerName: string;
  callerUserId: string;
  isVideoCall: boolean;
  timestamp: number;
}

class CallManager extends EventEmitter {
  private activeCall: any = null;
  private incomingCall: IncomingCall | null = null;
  private videoClient: any = null;

  async initialize(userId: string, userName?: string) {
    try {
      console.log('Initializing call manager for user:', userId);
      this.videoClient = await getVideoClient(userId, userName);
      
      // Clear any existing listeners
      this.videoClient.off('call.ring');
      this.videoClient.off('call.session_participant_joined');
      this.videoClient.off('call.session_participant_left');
      this.videoClient.off('call.ended');
      
      // Listen for incoming calls
      this.videoClient.on('call.ring', (event: any) => {
        console.log('Incoming call:', event);
        this.handleIncomingCall(event);
      });

      // Listen for call updates
      this.videoClient.on('call.session_participant_joined', (event: any) => {
        console.log('Participant joined:', event);
        this.emit('participantJoined', event);
      });

      this.videoClient.on('call.session_participant_left', (event: any) => {
        console.log('Participant left:', event);
        this.emit('participantLeft', event);
      });

      this.videoClient.on('call.ended', (event: any) => {
        console.log('Call ended:', event);
        this.handleCallEnded(event);
      });

      console.log('Call manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize call manager:', error);
      // Don't throw error, just log it to prevent breaking the app
      // throw error;
    }
  }

  private handleIncomingCall(event: any) {
    const call = event.call;
    const caller = event.user;
    
    const incomingCall: IncomingCall = {
      callId: call.id,
      callerName: caller.name || caller.id,
      callerUserId: caller.id,
      isVideoCall: call.settings?.video?.enabled !== false,
      timestamp: Date.now(),
    };

    this.incomingCall = incomingCall;
    this.emit('incomingCall', incomingCall);
  }

  private handleCallEnded(event: any) {
    this.activeCall = null;
    this.incomingCall = null;
    this.emit('callEnded', event);
  }

  async acceptCall(callId: string) {
    try {
      if (!this.videoClient) {
        throw new Error('Call manager not initialized');
      }

      console.log('Accepting call:', callId);
      const call = this.videoClient.call('default', callId);
      await call.join();
      
      this.activeCall = call;
      this.incomingCall = null;
      
      this.emit('callAccepted', { callId });
      console.log('Call accepted successfully:', callId);
      return call;
    } catch (error) {
      console.error('Failed to accept call:', error);
      throw error;
    }
  }

  async declineCall(callId: string) {
    try {
      if (!this.videoClient) {
        throw new Error('Call manager not initialized');
      }

      const call = this.videoClient.call('default', callId);
      await call.reject();
      
      this.incomingCall = null;
      this.emit('callDeclined', { callId });
    } catch (error) {
      console.error('Failed to decline call:', error);
      throw error;
    }
  }

  async startCall(callId: string, memberIds: string[], isVideoCall: boolean = true) {
    try {
      if (!this.videoClient) {
        console.log('Video client not initialized, attempting to initialize...');
        throw new Error('Call manager not initialized');
      }

      console.log('Starting call:', { callId, memberIds, isVideoCall });
      const call = this.videoClient.call('default', callId);
      
      // Create the call with members
      await call.getOrCreate({
        data: {
          members: memberIds.map(id => ({ user_id: id })),
          settings_override: {
            audio: {
              default_device: 'speaker',
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
      
      this.activeCall = call;
      this.emit('callStarted', { callId, isVideoCall });
      
      console.log('Call started successfully:', callId);
      return call;
    } catch (error) {
      console.error('Failed to start call:', error);
      throw error;
    }
  }

  async endCall() {
    try {
      if (this.activeCall) {
        await this.activeCall.leave();
        this.activeCall = null;
      }
      this.emit('callEnded', {});
    } catch (error) {
      console.error('Failed to end call:', error);
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

  hasIncomingCall(): boolean {
    return this.incomingCall !== null;
  }
}

// Singleton instance
export const callManager = new CallManager();