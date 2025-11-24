import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// Audio recording utilities
export class AudioRecorder {
  constructor() {
    this.recording = null;
    this.sound = null;
  }

  async startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async stopRecording() {
    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return uri;
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  async playSound(uri) {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      this.sound = sound;
      await sound.playAsync();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      console.error('Failed to play sound', err);
    }
  }

  async stopSound() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
}

// Clipboard utilities
export const copyToClipboard = async (text) => {
  try {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
};

export const pasteFromClipboard = async () => {
  try {
    const text = await Clipboard.getStringAsync();
    return text;
  } catch (err) {
    console.error('Failed to paste from clipboard', err);
    return '';
  }
};

// Sharing utilities
export const shareMessage = async (message) => {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(message);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Alert.alert('Sharing not available', 'Sharing is not available on this device');
    }
  } catch (err) {
    console.error('Failed to share message', err);
  }
};

export const shareFile = async (uri, mimeType = 'application/octet-stream') => {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Alert.alert('Sharing not available', 'Sharing is not available on this device');
    }
  } catch (err) {
    console.error('Failed to share file', err);
  }
};



// Image picker utilities
export const pickImageFromLibrary = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to select images.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      hapticFeedback.success();
      return result.assets[0];
    }
    return null;
  } catch (err) {
    console.error('Failed to pick image', err);
    return null;
  }
};

export const takePhoto = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera access to take photos.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      hapticFeedback.success();
      return result.assets[0];
    }
    return null;
  } catch (err) {
    console.error('Failed to take photo', err);
    return null;
  }
};

export const showImagePickerOptions = () => {
  return new Promise((resolve) => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: async () => resolve(await takePhoto()) },
        { text: 'Photo Library', onPress: async () => resolve(await pickImageFromLibrary()) },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) }
      ]
    );
  });
};

// Haptic feedback utilities
export const hapticFeedback = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),
};