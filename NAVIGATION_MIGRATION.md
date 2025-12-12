# Navigation Migration Complete

## Summary
The app now uses **@react-navigation/native** exclusively. Expo Router is installed but not used.

## Changes Made

### 1. Created Navigation Service
- **File**: `lib/navigationService.js`
- Provides a centralized `navigationRef` and `navigate()` function
- Allows navigation from anywhere in the app, including Modals

### 2. Updated App.js
- Uses `NavigationContainer` with the shared `navigationRef`
- All screens are registered with React Navigation Stack

### 3. Updated Components
- **appContext.jsx**: Uses `navigate()` from navigationService
- **CallHistory.tsx**: Uses `navigate()` instead of `router.push()`
- **IncomingCallNotification.tsx**: Receives navigation callback as prop

### 4. Removed Expo Router Usage
- **app/channel/[cid]/thread/[cid]/index.js**: Removed `Stack.Screen` from expo-router

## Files Using React Navigation

### Entry Point
- `index.js` → `App.js` (uses NavigationContainer)

### Navigation Service
- `lib/navigationService.js` - Centralized navigation

### Components Using Navigation
- `context/appContext.jsx` - Uses `navigate()`
- `components/CallHistory.tsx` - Uses `navigate()`
- `components/IncomingCallNotification.tsx` - Receives callback

## Note
The `app/_layout.jsx` file still exists but is **NOT USED** since the app entry point is `App.js`.
You can safely delete `app/_layout.jsx` if desired.

## How to Navigate

```javascript
import { navigate } from '@/lib/navigationService';

// Navigate to a screen
navigate('Call', { callId: '123', status: 'incoming' });
```

## Available Screens
- Home
- Login
- Channel
- Thread
- Call
- Calls
- BlockedAccounts
- CreateGroup
- ProfileSettings
- Users
- Health
