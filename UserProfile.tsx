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
import { COLORS } from './designSystem';
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
      case 'premium': return '#FFD700';
      case 'basic': return '#007AFF';
      default: return '#8E8E93';
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
          colors={COLORS.gradient.accent as any}
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
          colors={COLORS.gradient.accent as any}
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
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    // backgroundColor replaced with LinearGradient component
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#CCCCCC',
    marginBottom: 8,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  subscriptionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A1A1A',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF3B30',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor replaced with LinearGradient component
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  compactAvatarText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  compactEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#CCCCCC',
  },
});