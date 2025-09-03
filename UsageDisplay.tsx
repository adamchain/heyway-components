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
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '@/components/designSystem';

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
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    ...SHADOWS.sm,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xxl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactText: {
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  upgradeHint: {
    padding: SPACING.xs,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  upgradeBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  upgradeBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  usageInfo: {
    marginBottom: SPACING.sm,
  },
  usageText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background.quaternary,
    borderRadius: RADIUS.xs,
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.xs,
  },
  progressWarning: {
    backgroundColor: COLORS.error,
  },
  periodText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  limitReachedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.tertiary,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    marginTop: SPACING.sm,
  },
  limitReachedText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.error,
    flex: 1,
  },
  warningContainer: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.background.tertiary,
  },
  warningText: {
    color: COLORS.error,
  },
});