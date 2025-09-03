/*
 * CHANGES:
 * - Created authentication guard component
 * - Protects routes that require authentication
 * - Shows loading state while checking auth
 * - Redirects to login if not authenticated
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import RegisterScreen from '@/app/auth/register';
import { HEYWAY_COLORS, HEYWAY_TYPOGRAPHY, HEYWAY_SPACING } from '../styles/HEYWAY_STYLE_GUIDE';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return fallback || <RegisterScreen />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },
  loadingText: {
    marginTop: HEYWAY_SPACING.lg,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});