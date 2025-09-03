/*
 * CHANGES:
 * - Created user profile component for displaying user info
 * - Added logout functionality
 * - Beautiful design with user avatar and subscription info
 * - Fixed undefined charAt error with proper null checking
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, User, Crown } from 'lucide-react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileProps {
  showLogout?: boolean;
  compact?: boolean;
}

export default function UserProfile({ showLogout = true, compact = false }: UserProfileProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout
        },
      ]
    );
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'premium': return HEYWAY_COLORS.accent.warning;
      case 'basic': return HEYWAY_COLORS.interactive.primary;
      default: return HEYWAY_COLORS.text.secondary;
    }
  };

  const getSubscriptionLabel = (plan: string) => {
    switch (plan) {
      case 'premium': return 'Premium';
      case 'basic': return 'Basic';
      default: return 'Free';
    }
  };

  // Safe way to get user initials
  const getUserInitials = () => {
    const firstName = user.profile?.firstName || '';
    const lastName = user.profile?.lastName || '';

    const firstInitial = firstName.charAt(0) || '';
    const lastInitial = lastName.charAt(0) || '';

    return (firstInitial + lastInitial).toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U';
  };

  // Safe way to get user name
  const getUserName = () => {
    const firstName = user.profile?.firstName || '';
    const lastName = user.profile?.lastName || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return user.email?.split('@')[0] || 'User';
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <LinearGradient
          colors={[HEYWAY_COLORS.accent.success, HEYWAY_COLORS.accent.info]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactAvatar}
        >
          <Text style={styles.compactAvatarText}>
            {getUserInitials()}
          </Text>
        </LinearGradient>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName}>
            {getUserName()}
          </Text>
          <Text style={styles.compactEmail}>{user.email}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={[HEYWAY_COLORS.accent.success, HEYWAY_COLORS.accent.info]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {getUserInitials()}
          </Text>
        </LinearGradient>
        <View style={styles.userInfo}>
          <Text style={styles.name}>
            {getUserName()}
          </Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.subscriptionBadge}>
            <Crown size={14} color={getSubscriptionColor(user.subscription?.plan || 'free')} />
            <Text style={[styles.subscriptionText, { color: getSubscriptionColor(user.subscription?.plan || 'free') }]}>
              {getSubscriptionLabel(user.subscription?.plan || 'free')}
            </Text>
          </View>
        </View>
      </View>

      {showLogout && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.xl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.xl,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: HEYWAY_RADIUS.component.avatar.xl,
    // backgroundColor replaced with LinearGradient component
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HEYWAY_SPACING.lg,
    ...HEYWAY_SHADOWS.light.sm,
  },
  avatarText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  email: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.sm,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    borderRadius: HEYWAY_RADIUS.component.badge.lg,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  subscriptionText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    marginLeft: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.status.error + '20',
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    paddingVertical: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.error,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.xs,
  },
  logoutText: {
    marginLeft: HEYWAY_SPACING.sm,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.status.error,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: HEYWAY_RADIUS.xl,
    // backgroundColor replaced with LinearGradient component
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HEYWAY_SPACING.md,
  },
  compactAvatarText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  compactEmail: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});