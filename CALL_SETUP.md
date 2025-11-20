# WhatsApp-Style Video & Audio Calling Setup

## Overview
This implementation provides WhatsApp-style video and audio calling functionality using Stream Video SDK with the following features:

- **Video & Audio Calls**: High-quality calls with camera/microphone controls
- **Incoming Call Notifications**: Full-screen incoming call interface
- **Call History**: Track and display recent calls
- **WhatsApp-like UI**: Familiar interface matching WhatsApp's design
- **Call Management**: Proper call state handling and notifications

## Installation

1. **Install the new dependency:**
```bash
npm install @react-native-async-storage/async-storage
```

2. **For iOS (if using bare React Native):**
```bash
cd ios && pod install
```

## Features Implemented

### 1. Enhanced Call Screen (`app/call/[callId].tsx`)
- WhatsApp-style UI for both video and audio calls
- Proper call controls with mute, video toggle, and end call
- Loading states and error handling
- Call duration tracking

### 2. Incoming Call Notifications (`components/IncomingCallNotification.tsx`)
- Full-screen incoming call interface
- Accept/decline call buttons
- Caller information display
- Animated UI elements

### 3. Call Manager (`lib/callManager.ts`)
- Centralized call state management
- Event handling for incoming/outgoing calls
- Call history integration
- Proper cleanup and error handling

### 4. Call History (`components/CallHistory.tsx`)
- Track all calls (incoming, outgoing, missed)
- Display call duration and timestamps
- Quick redial functionality
- Clear history option

### 5. Enhanced Channel Screen
- Better error handling for call initiation
- Integration with call manager
- Participant validation before starting calls

## How It Works

### Starting a Call
1. User taps video/audio call button in chat header
2. System validates participants are available
3. Call manager creates and rings the call
4. Participants receive incoming call notification
5. Call screen opens with proper UI

### Receiving a Call
1. Call manager detects incoming call event
2. Incoming call notification appears
3. User can accept/decline the call
4. If accepted, call screen opens automatically

### Call History
1. All calls are automatically tracked
2. Duration is calculated for completed calls
3. History is stored locally using AsyncStorage
4. Users can redial from history

## Configuration

### Backend Requirements
Make sure your backend supports:
- Video token generation (`/video/token` endpoint)
- Proper Stream Video SDK configuration
- Call event webhooks (optional)

### Stream Dashboard
1. Enable Video calling in your Stream dashboard
2. Configure call types and permissions
3. Set up push notifications for incoming calls

## Usage Examples

### Basic Video Call
```javascript
const handleVideoCall = async () => {
  const members = channel.state?.members || [];
  const callId = callIdFromMembers(members);
  const memberIds = members.map(m => m.user?.id).filter(Boolean);
  
  await callManager.startCall(callId, memberIds, true);
  router.push(`/call/${callId}`);
};
```

### Audio Call
```javascript
const handleAudioCall = async () => {
  const members = channel.state?.members || [];
  const callId = callIdFromMembers(members);
  const memberIds = members.map(m => m.user?.id).filter(Boolean);
  
  await callManager.startCall(callId, memberIds, false);
  router.push(`/call/${callId}?mode=audio`);
};
```

## Troubleshooting

### Common Issues

1. **Calls not connecting:**
   - Check video token generation
   - Verify Stream Video SDK configuration
   - Ensure proper permissions for camera/microphone

2. **Incoming calls not showing:**
   - Verify call manager initialization
   - Check event listeners setup
   - Ensure proper user authentication

3. **Call history not saving:**
   - Check AsyncStorage permissions
   - Verify call event handling
   - Ensure proper cleanup on call end

### Debug Tips

1. Enable console logging for call events
2. Check Stream dashboard for call logs
3. Verify network connectivity
4. Test with multiple devices/users

## Next Steps

To further enhance the calling experience:

1. **Push Notifications**: Implement background call notifications
2. **Group Calls**: Support for multi-participant calls
3. **Screen Sharing**: Add screen sharing capabilities
4. **Call Recording**: Implement call recording features
5. **Call Quality**: Add network quality indicators

## Support

For issues related to:
- Stream Video SDK: Check [Stream Documentation](https://getstream.io/video/docs/)
- React Native: Check [React Native Documentation](https://reactnative.dev/)
- Expo: Check [Expo Documentation](https://docs.expo.dev/)