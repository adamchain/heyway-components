import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isMobile = isIOS || isAndroid;

export const platformStyles = {
  shadow: isWeb 
    ? { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }
    : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  
  borderRadius: isWeb ? 8 : 12,
  
  containerPadding: isWeb ? 20 : 16,
};

export const getConditionalImport = async (webModule: () => Promise<any>, nativeModule: () => Promise<any>) => {
  if (isWeb) {
    return await webModule();
  } else {
    return await nativeModule();
  }
};

// Web-specific utilities
export const webOnly = <T>(component: T): T | null => {
  return isWeb ? component : null;
};

// Mobile-specific utilities  
export const mobileOnly = <T>(component: T): T | null => {
  return isMobile ? component : null;
};

// Platform-specific component wrapper
export const PlatformComponent = ({ 
  web, 
  mobile, 
  ios, 
  android 
}: { 
  web?: React.ReactNode; 
  mobile?: React.ReactNode; 
  ios?: React.ReactNode; 
  android?: React.ReactNode; 
}) => {
  if (isWeb && web) return web;
  if (isIOS && ios) return ios;
  if (isAndroid && android) return android;
  if (isMobile && mobile) return mobile;
  return null;
};