import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    // Newer Expo SDKs include these iOS presentation options
    // Include them to satisfy typings and ensure banners/lists display when appropriate
    shouldShowBanner: true as any,
    shouldShowList: true as any,
  }) as any,
});

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger?: any;
}

// Event emitter for real-time app state updates
class AppStateEventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);

    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  off(event: string, listener: Function) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event)!;
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(listener => listener(data));
    }
  }
}

// Global app state event emitter
export const appStateEvents = new AppStateEventEmitter();

class NotificationService {
  private isInitialized = false;
  private notificationsEnabled = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return this.notificationsEnabled;

    try {
      // Check if notifications are enabled in user preferences
      const notificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
      this.notificationsEnabled = notificationsEnabled === 'true';

      // Request permissions if enabled
      if (this.notificationsEnabled) {
        const granted = await this.requestPermissions();

        // Ensure Android notification channel exists for high-importance alerts
        if (granted && Platform.OS === 'android') {
          try {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'Default',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#FF3B30',
              sound: 'default',
            });
          } catch (e) {
            console.log('Android channel setup failed:', e);
          }
        }
      }

      this.isInitialized = true;
      return this.notificationsEnabled;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Web doesn't support push notifications in the same way
        console.log('Push notifications not fully supported on web');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.notificationsEnabled = finalStatus === 'granted';
      await AsyncStorage.setItem('notificationsEnabled', this.notificationsEnabled.toString());

      return this.notificationsEnabled;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleLocalNotification(notification: NotificationData): Promise<string | null> {
    try {
      if (!this.notificationsEnabled) {
        await this.initialize();
        if (!this.notificationsEnabled) return null;
      }

      if (Platform.OS === 'web') {
        // Web implementation - use browser notifications if available
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.body,
              data: notification.data,
            });
            return 'web-notification';
          } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              new Notification(notification.title, {
                body: notification.body,
                data: notification.data,
              });
              return 'web-notification';
            }
          }
        }
        return null;
      }

      // Native implementation
      // Respect provided trigger (immediate if null/undefined)
      const triggerInput = notification.trigger
        ? (notification.trigger instanceof Date
          ? { date: notification.trigger }
          : notification.trigger)
        : null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
        },
        trigger: triggerInput,
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    try {
      this.notificationsEnabled = enabled;
      await AsyncStorage.setItem('notificationsEnabled', enabled.toString());

      if (enabled) {
        await this.requestPermissions();
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  }

  async areNotificationsEnabled(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.notificationsEnabled;
  }

  // Specific notification types
  async notifyCallEnded(callId: string, recipients: string[]): Promise<void> {
    const recipientText = recipients.length === 1
      ? recipients[0]
      : `${recipients.length} recipients`;

    await this.scheduleLocalNotification({
      title: 'Call Completed',
      body: `Your AI call to ${recipientText} has ended`,
      data: { type: 'call_ended', callId }
    });
  }

  async notifyInboundCallReceived(callerId: string, timestamp: string): Promise<void> {
    await this.scheduleLocalNotification({
      title: 'New Inbound Call',
      body: `Call from ${callerId} was handled by your HeyWay`,
      data: { type: 'inbound_call', callerId, timestamp }
    });
  }

  async notifyScheduledCallStarting(callId: string, recipients: string[]): Promise<void> {
    const recipientText = recipients.length === 1
      ? recipients[0]
      : `${recipients.length} recipients`;

    await this.scheduleLocalNotification({
      title: 'Scheduled Call Starting',
      body: `Your scheduled AI call to ${recipientText} is starting now`,
      data: { type: 'scheduled_call', callId }
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;