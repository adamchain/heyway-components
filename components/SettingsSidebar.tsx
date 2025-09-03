import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import {
  X,
  User,
  Phone,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Settings,
  Crown,
  CreditCard,
  Zap,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useCallerId } from '@/hooks/useCallerId';
import { apiService } from '../services/apiService';
import CallerIdManagement from './CallerIdManagement';
import SubscriptionManager from '@/components/SubscriptionManager';
import AutomationsManager from '@/components/AutomationsManager';
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS } from '../styles/HEYWAY_STYLE_GUIDE';

interface SettingsSidebarProps {
  visible: boolean;
  onClose: () => void;
  onCallerIdSetup: () => void;
}

export default function SettingsSidebar({
  visible,
  onClose,
  onCallerIdSetup
}: SettingsSidebarProps) {
  const { logout, user, updateProfile } = useAuth();
  const callerId = useCallerId();
  const [showCallerIdModal, setShowCallerIdModal] = useState(false);
  const [openAddCallerId, setOpenAddCallerId] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState(user?.profile?.firstName || '');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showAutomationsModal, setShowAutomationsModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSaveFirstName = async () => {
    if (!editedFirstName.trim()) {
      Alert.alert('Error', 'First name cannot be empty');
      return;
    }

    try {
      await updateProfile({ firstName: editedFirstName.trim() });
      setIsEditingName(false);
      Alert.alert('Success', 'Your name has been updated! This is what the AI caller will refer to you as.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update your name. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditedFirstName(user?.profile?.firstName || '');
    setIsEditingName(false);
  };

  const handleUpgradePress = () => {
    setShowSubscriptionModal(true);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.\n\nType "DELETE" to confirm:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteUserAccount();
              Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
              await logout();
              onClose();
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };
  const settingsItems = [
    {
      icon: Phone,
      title: 'Caller ID Management',
      subtitle: callerId?.callerIdInfo?.last4Digits
        ? `Active: ***-***-${callerId.callerIdInfo.last4Digits}`
        : 'Set up your caller ID',
      onPress: () => {
        // Open the management modal and jump straight to Add Number flow
        setOpenAddCallerId(true);
        setShowCallerIdModal(true);
      },
    },
    {
      icon: Zap,
      title: 'Automations',
      subtitle: 'Schedule appointment reminders and follow-ups',
      onPress: () => {
        setShowAutomationsModal(true);
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.sidebar}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Settings size={24} color="#FFFFFF" />
                <Text style={styles.headerTitle}>Settings</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={20} color="#AEAEB2" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Profile Section */}
              <View style={styles.section}>
                <View style={styles.profileCard}>
                  <View style={styles.profileIcon}>
                    <User size={24} color="#AEAEB2" />
                  </View>
                  <View style={styles.profileInfo}>
                    {isEditingName ? (
                      <View style={styles.editNameContainer}>
                        <TextInput
                          style={styles.nameInput}
                          value={editedFirstName}
                          onChangeText={setEditedFirstName}
                          placeholder="Enter your first name"
                          placeholderTextColor="#AEAEB2"
                          autoFocus
                          maxLength={30}
                        />
                        <View style={styles.editButtons}>
                          <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSaveFirstName}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.saveButtonText}>Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancelEdit}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setIsEditingName(true)}
                        style={styles.nameContainer}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.profileName}>
                          {user?.profile?.firstName || 'Tap to set your name'}
                        </Text>
                        <Text style={styles.profileSubtitle}>
                          Heyway will refer to you by this name
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Caller ID (placed right after profile) */}
              <View style={styles.section}>
                {settingsItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.settingsItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.settingsIcon}>
                      <item.icon size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.settingsContent}>
                      <Text style={styles.settingsTitle}>{item.title}</Text>
                      <Text style={styles.settingsSubtitle}>{item.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Subscription Section */}
              <View style={styles.section}>
                <View style={styles.subscriptionCard}>
                  <Text style={styles.subscriptionTitle}>Upgrade to HeyWay Pro</Text>
                  <Text style={styles.subscriptionSubtitle}>Includes 100 calls</Text>
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    activeOpacity={0.8}
                    onPress={handleUpgradePress}
                  >
                    <Text style={styles.upgradeButtonText}>Upgrade</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Account Actions */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <LogOut size={20} color="#FF3B30" />
                  <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>

              {/* App Info & Delete Account at bottom */}
              <View style={styles.section}>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>Heyway</Text>
                  <Text style={styles.appVersion}>Version 1.0.0</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteAccount}
                  activeOpacity={0.7}
                >
                  <LogOut size={20} color="#FF3B30" />
                  <Text style={styles.deleteText}>Delete Account</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>

        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />
      </View>

      {/* Caller ID Management Modal */}
      <CallerIdManagement
        visible={showCallerIdModal}
        initialShowAddModal={openAddCallerId}
        onClose={() => {
          setShowCallerIdModal(false);
          setOpenAddCallerId(false);
          // Refresh caller ID subtitle after closing
          callerId.loadCallerIdPreference?.();
        }}
        onCallerIdChange={() => {
          // Refresh Caller ID info in subtitle when user changes preference
          callerId.loadCallerIdPreference?.();
        }}
      />

      {/* Subscription Manager Modal */}
      <Modal
        visible={showSubscriptionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            paddingTop: 60,
            backgroundColor: '#18181A',
            borderBottomWidth: 1,
            borderBottomColor: '#232326',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#FFF',
            }}>HeyWay Pro</Text>
            <TouchableOpacity onPress={() => setShowSubscriptionModal(false)}>
              <X size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          <SubscriptionManager
            onSubscriptionChanged={() => {
              // Handle subscription change if needed
              console.log('Subscription changed');
            }}
          />
        </View>
      </Modal>

      {/* Automations Manager Modal */}
      <Modal
        visible={showAutomationsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            paddingTop: 60,
            backgroundColor: '#18181A',
            borderBottomWidth: 1,
            borderBottomColor: '#232326',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#FFF',
            }}>Automations</Text>
            <TouchableOpacity onPress={() => setShowAutomationsModal(false)}>
              <X size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          <AutomationsManager />
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.overlay,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '85%',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRightWidth: 1,
    borderRightColor: HEYWAY_COLORS.border.secondary,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '15%',
  },

  // Header - HeyWay styling
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.md,
    paddingTop: Platform.OS === 'ios' ? HEYWAY_SPACING.huge : HEYWAY_SPACING.xxxl,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
  },
  headerTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: '600' as const,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.tertiary,
  },

  // Content
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.sm,
  },

  // Profile Card - HeyWay design
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: HEYWAY_RADIUS.lg,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: HEYWAY_RADIUS.lg,
    backgroundColor: HEYWAY_COLORS.interactive.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HEYWAY_SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '500' as const,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.micro,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  profileSubtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 16,
  },
  nameContainer: {
    flex: 1,
  },
  editNameContainer: {
    flex: 1,
  },
  nameInput: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '600' as const,
    color: HEYWAY_COLORS.text.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.xl,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.lg,
    flex: 1,
    shadowColor: HEYWAY_COLORS.interactive.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.lg,
    flex: 1,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  cancelButtonText: {
    color: HEYWAY_COLORS.text.secondary,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: '500' as const,
    textAlign: 'center',
  },

  // Settings Items - HeyWay styling
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.lg,
    marginBottom: HEYWAY_SPACING.xs,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: HEYWAY_RADIUS.lg,
    backgroundColor: HEYWAY_COLORS.interactive.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HEYWAY_SPACING.md,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '500' as const,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.micro,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  settingsSubtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 16,
  },

  // Subscription Section - HeyWay design
  subscriptionCard: {
    borderRadius: HEYWAY_RADIUS.lg,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  subscriptionTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '600' as const,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.micro,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  subscriptionSubtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.md,
    lineHeight: 16,
  },
  upgradeButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.lg,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.lg,
    shadowColor: HEYWAY_COLORS.interactive.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  upgradeButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: '600' as const,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  // Action Buttons - HeyWay styling
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.status.error + '20',
    borderRadius: HEYWAY_RADIUS.lg,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.error + '40',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  logoutText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '500' as const,
    color: HEYWAY_COLORS.status.error,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.status.error + '20',
    borderRadius: HEYWAY_RADIUS.lg,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.error + '40',
    marginTop: HEYWAY_SPACING.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  deleteText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '500' as const,
    color: HEYWAY_COLORS.status.error,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  // App Info - HeyWay design
  appInfo: {
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    borderRadius: HEYWAY_RADIUS.lg,
    marginBottom: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  appName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '600' as const,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.micro,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  appVersion: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});