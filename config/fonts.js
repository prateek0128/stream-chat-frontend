import { Platform } from 'react-native';

export const fonts = {
  regular: Platform.select({
    ios: 'Inter_400Regular',
    android: 'Inter_400Regular',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'Inter_500Medium',
    android: 'Inter_500Medium',
    default: 'System',
  }),
  semiBold: Platform.select({
    ios: 'Inter_600SemiBold',
    android: 'Inter_600SemiBold',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'Inter_700Bold',
    android: 'Inter_700Bold',
    default: 'System',
  }),
};

export const defaultTextStyle = {
  fontFamily: fonts.regular,
};