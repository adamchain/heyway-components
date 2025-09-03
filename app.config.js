import 'dotenv/config';

export default {
  expo: {
    name: 'HeyWay',
    slug: 'callphone',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/logo.webp',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/logo.webp',
      resizeMode: 'contain',
      backgroundColor: '#000000'
    },
    newArchEnabled: false,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.recordedmail.app',
      buildNumber: '83',
      jsEngine: 'hermes',
      deploymentTarget: '13.0',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSContactsUsageDescription: 'This app needs access to your contacts to sync and make calls to your saved contacts. You can import your device contacts for easy calling.',
        NSCameraUsageDescription: 'This app may need camera access for future features. Camera access is optional and not currently used.',
        NSMicrophoneUsageDescription: 'This app needs microphone access to record and make audio calls.',
        NSUserNotificationUsageDescription: 'This app uses notifications to alert you about important call events and updates.',
        NSLocationWhenInUseUsageDescription: 'This app needs location access to find businesses near you when searching for places to call.',
        UIBackgroundModes: ['audio', 'voip'],
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            localhost: {
              NSExceptionAllowsInsecureHTTPLoads: true
            }
          }
        }
      }
    },
    android: {
      package: 'com.recordedmail.app',
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION'
      ]
    },
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favlogo.webp'
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-web-browser',
      [
        'expo-notifications',
        {
          icon: './assets/images/logo.webp',
          color: '#FF3B30',
          sounds: []
        }
      ],
      'expo-audio'
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // Expose environment variables to the app
      BASE_URL: process.env.BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
      GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
      ELEVENLABS_AGENT_ID: process.env.ELEVENLABS_AGENT_ID,
      WEBSOCKET_SERVER_URL: process.env.WEBSOCKET_SERVER_URL,
      router: {},
      eas: {
        projectId: '75f2d9c0-0376-434d-baae-5f683ed3711d'
      }
    },
    owner: 'adamchain'
  }
};