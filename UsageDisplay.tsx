import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Crown, Zap, TrendingUp } from 'lucide-react-native';
import { subscriptionService, SubscriptionStatus } from '@/services/subscriptionService';
import { router } from 'expo-router';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';

interface UsageDisplayProps {
  compact?: boolean;
  onPress?: () => void;
}

export default function UsageDisplay({ compact = false, onPress }: UsageDisplayProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadSubscriptionStatus();
  }, [refreshKey]);

  const loadSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(tabs)/settings');
    }
  };

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <ActivityIndicator size="small" color="#34C759" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!subscriptionStatus) {
    return null;
  }

  const displayInfo = subscriptionService.getSubscriptionDisplayInfo(subscriptionStatus);
  const isProUser = subscriptionStatus.plan === 'pro';
  const isLimitReached = displayInfo.isLimitReached;
  const progressPercentage = displayInfo.progressPercentage;

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactContainer, isLimitReached && styles.warningContainer]} 
        onPress={handlePress}
      >
        <View style={styles.compactContent}>
          {isProUser ? (
            <Crown size={16} color="#FFD700" />
          ) : (
            <Zap size={16} color={isLimitReached ? "#FF3B30" : "#34C759"} />
          )}
          <Text style={[styles.compactText, isLimitReached && styles.warningText]}>
            {subscriptionStatus.remaining} calls left
          </Text>
        </View>
        {!isProUser && progressPercentage > 60 && (
          <View style={styles.upgradeHint}>
            <TrendingUp size={12} color="#FF9500" />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.planInfo}>
          {isProUser ? (
            <Crown size={20} color="#FFD700" />
          ) : (
            <Zap size={20} color="#8E8E93" />
          )}
          <Text style={styles.planText}>{displayInfo.planName}</Text>
        </View>
        {!isProUser && (
          <View style={styles.upgradeBadge}>
            <Text style={styles.upgradeBadgeText}>Upgrade</Text>
          </View>
        )}
      </View>

      <View style={styles.usageInfo}>
        <Text style={styles.usageText}>{displayInfo.callsText}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(progressPercentage, 100)}%` },
              isLimitReached && styles.progressWarning
            ]} 
          />
        </View>
        <Text style={styles.periodText}>{displayInfo.renewalText}</Text>
      </View>

      {isLimitReached && (
        <View style={styles.limitReachedBanner}>
          <Zap size={16} color="#FF3B30" />
          <Text style={styles.limitReachedText}>
            {isProUser ? 'Monthly limit reached' : 'Upgrade for 100 calls/month'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Export refresh function for parent components
UsageDisplay.refresh = () => {
  // This will be called from parent components to trigger refresh
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    padding: HEYWAY_SPACING.lg,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    marginHorizontal: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    marginHorizontal: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactText: {
    marginLeft: HEYWAY_SPACING.xs,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  upgradeHint: {
    padding: HEYWAY_SPACING.xs,
  },
  loadingText: {
    marginLeft: HEYWAY_SPACING.sm,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.md,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planText: {
    marginLeft: HEYWAY_SPACING.sm,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  upgradeBadge: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    borderRadius: HEYWAY_RADIUS.component.badge.sm,
  },
  upgradeBadgeText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  usageInfo: {
    marginBottom: HEYWAY_SPACING.sm,
  },
  usageText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.sm,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  progressBar: {
    height: 6,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    borderRadius: HEYWAY_RADIUS.xs,
    marginBottom: HEYWAY_SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: HEYWAY_COLORS.status.success,
    borderRadius: HEYWAY_RADIUS.xs,
  },
  progressWarning: {
    backgroundColor: HEYWAY_COLORS.status.error,
  },
  periodText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  limitReachedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    padding: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.error,
    marginTop: HEYWAY_SPACING.sm,
  },
  limitReachedText: {
    marginLeft: HEYWAY_SPACING.sm,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.status.error,
    flex: 1,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  warningContainer: {
    borderColor: HEYWAY_COLORS.status.error,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
  },
  warningText: {
    color: HEYWAY_COLORS.status.error,
  },
});