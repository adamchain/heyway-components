import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Phone,
  Mail,
  HelpCircle,
  LogOut,
  ChevronRight,
  Settings as SettingsIcon,
  Mic,
  Volume2,
  Moon,
  Palette,
  Zap,
  X,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS, RADIUS, SHADOWS } from '../../components/designSystem';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '../../services/apiService';
import notificationService from '@/utils/notificationService';
import AutomationsManager from '@/components/AutomationsManager';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  // Settings state
  const [notifications, setNotifications] = useState(true);
  // Initialize notifications toggle from stored preference
  useEffect(() => {
    (async () => {
      const enabled = await notificationService.areNotificationsEnabled();
      setNotifications(enabled);
    })();
  }, []);

  const onToggleNotifications = async (value: boolean) => {
    setNotifications(value);
    await notificationService.setNotificationsEnabled(value);
  };

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoAnswer, setAutoAnswer] = useState(false);
  const [showAutomations, setShowAutomations] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    rightElement,
    showArrow = true
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon size={20} color={COLORS.text.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (showArrow && (
        <ChevronRight size={20} color={COLORS.text.tertiary} />
      ))}
    </TouchableOpacity>
  );

  const SwitchItem = ({
    icon: Icon,
    title,
    subtitle,
    value,
    onValueChange
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Icon size={20} color={COLORS.text.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: COLORS.state.inactive,
          true: COLORS.state.active
        }}
        thumbColor={value ? COLORS.success : COLORS.text.tertiary}
        ios_backgroundColor={COLORS.state.inactive}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Enhanced Background with Gradient */}
      <LinearGradient
        colors={COLORS.gradient.background as any}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" backgroundColor="transparent" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionCard}>
              <SettingItem
                icon={User}
                title="Profile"
                subtitle="Manage your account information"
                onPress={() => Alert.alert('Profile', 'Profile settings coming soon')}
              />
              <SettingItem
                icon={Phone}
                title="Caller ID Management"
                subtitle="Configure your caller ID numbers"
                onPress={() => Alert.alert('Caller ID', 'Caller ID management coming soon')}
              />
              <SettingItem
                icon={Zap}
                title="Automations"
                subtitle="Schedule appointment reminders and follow-ups"
                onPress={() => setShowAutomations(true)}
              />
            </View>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications & Sounds</Text>
            <View style={styles.sectionCard}>
              <SwitchItem
                icon={Bell}
                title="Push Notifications"
                subtitle="Receive call and message notifications"
                value={notifications}
                onValueChange={onToggleNotifications}
              />
              <SwitchItem
                icon={Volume2}
                title="Sound Effects"
                subtitle="Play sounds for app interactions"
                value={soundEnabled}
                onValueChange={setSoundEnabled}
              />
              <SwitchItem
                icon={Mic}
                title="Vibration"
                subtitle="Vibrate for notifications and calls"
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
              />
            </View>
          </View>

          {/* Call Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Call Settings</Text>
            <View style={styles.sectionCard}>
              <SwitchItem
                icon={Phone}
                title="Auto Answer"
                subtitle="Automatically answer incoming calls"
                value={autoAnswer}
                onValueChange={setAutoAnswer}
              />
              <SettingItem
                icon={Shield}
                title="Call Blocking"
                subtitle="Manage blocked numbers"
                onPress={() => Alert.alert('Call Blocking', 'Call blocking settings coming soon')}
              />
            </View>
          </View>

          {/* Appearance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={styles.sectionCard}>
              <SwitchItem
                icon={Moon}
                title="Dark Mode"
                subtitle="Use dark theme throughout the app"
                value={darkMode}
                onValueChange={setDarkMode}
              />
              <SettingItem
                icon={Palette}
                title="Theme Customization"
                subtitle="Customize app colors and styling"
                onPress={() => Alert.alert('Themes', 'Theme customization coming soon')}
              />
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.sectionCard}>
              <SettingItem
                icon={HelpCircle}
                title="Help & FAQ"
                subtitle="Get help and find answers"
                onPress={() => Alert.alert('Help', 'Help center coming soon')}
              />
              <SettingItem
                icon={Mail}
                title="Contact Support"
                subtitle="Get in touch with our team"
                onPress={() => Alert.alert('Support', 'Support contact coming soon')}
              />
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <View style={styles.sectionCard}>
              <SettingItem
                icon={LogOut}
                title="Sign Out"
                subtitle="Sign out of your account"
                onPress={handleLogout}
                showArrow={false}
                rightElement={null}
              />
              <SettingItem
                icon={LogOut}
                title="Delete Account"
                subtitle="Permanently delete your account and all data"
                onPress={() => {
                  Alert.alert(
                    'Delete Account',
                    'This will permanently delete your account and all associated data. This action cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await apiService.deleteUserAccount();
                            Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
                            logout();
                          } catch (error) {
                            Alert.alert('Error', 'Failed to delete account. Please try again.');
                          }
                        }
                      }
                    ]
                  );
                }}
                showArrow={false}
                rightElement={null}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Automations Modal */}
      <Modal
        visible={showAutomations}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAutomations(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAutomations(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Automations</Text>
            <View style={styles.modalCloseButton} />
          </View>
          <AutomationsManager />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },

  // Header - Professional styling
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.3,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Section Styling - Professional presentation
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 16,
    paddingLeft: 4,
    letterSpacing: -0.2,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },

  // Setting Items - Professional card design
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  settingSubtitle: {
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // Modal Styles - Professional presentation
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.2,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});