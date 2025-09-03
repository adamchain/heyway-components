import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Crown, Check, Zap, Star, RefreshCw, CreditCard } from 'lucide-react-native';
import { subscriptionService, SubscriptionStatus } from '@/services/subscriptionService';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '@/components/designSystem';
import { isWeb } from '@/utils/platformUtils';

interface SubscriptionManagerProps {
  onSubscriptionChanged?: () => void;
}

export default function SubscriptionManager({ onSubscriptionChanged }: SubscriptionManagerProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    initializeSubscription();
  }, []);

  const initializeSubscription = async () => {
    try {
      setIsLoading(true);
      await subscriptionService.initialize();
      const [status, availableProducts] = await Promise.all([
        subscriptionService.getSubscriptionStatus(),
        subscriptionService.getProducts(),
      ]);
      setSubscriptionStatus(status);
      setProducts(availableProducts);
    } catch (error) {
      console.error('Failed to initialize subscription:', error);
      Alert.alert('Error', 'Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsPurchasing(true);
      
      if (isWeb) {
        // Web: Use Stripe Checkout
        await handleWebCheckout();
      } else {
        // Mobile: Use in-app purchases
        const productId = 'com.heyway.pro_monthly';
        const success = await subscriptionService.purchaseProduct(productId);
        if (success) {
          const updatedStatus = await subscriptionService.getSubscriptionStatus();
          setSubscriptionStatus(updatedStatus);
          Alert.alert(
            'Upgrade Successful!',
            'Welcome to HeyWay Pro! You now have 100 calls per month.',
            [{ text: 'Great!', onPress: onSubscriptionChanged }]
          );
        }
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      Alert.alert(
        'Purchase Failed',
        error instanceof Error ? error.message : 'Unable to complete purchase'
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleWebCheckout = async () => {
    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_heyway_pro_monthly', // Your Stripe price ID
          successUrl: `${window.location.origin}/subscription-success`,
          cancelUrl: `${window.location.origin}/subscription-cancelled`,
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = (window as any).Stripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Stripe checkout failed:', error);
      throw new Error('Payment processing failed');
    }
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      const restored = await subscriptionService.restorePurchases();
      if (restored) {
        const updatedStatus = await subscriptionService.getSubscriptionStatus();
        setSubscriptionStatus(updatedStatus);
        Alert.alert(
          'Purchases Restored',
          'Your subscription has been restored successfully!',
          [{ text: 'Great!', onPress: onSubscriptionChanged }]
        );
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found to restore.');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert('Restore Failed', 'Unable to restore purchases');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your Pro subscription? You\'ll be downgraded to the free plan.',
      [
        { text: 'Keep Pro', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await subscriptionService.cancelSubscription();
              if (success) {
                const updatedStatus = await subscriptionService.getSubscriptionStatus();
                setSubscriptionStatus(updatedStatus);
                Alert.alert('Subscription Cancelled', 'You\'ve been downgraded to the free plan.');
                onSubscriptionChanged?.();
              }
            } catch (error) {
              console.error('Cancel failed:', error);
              Alert.alert('Error', 'Failed to cancel subscription');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading subscription...</Text>
      </View>
    );
  }

  if (!subscriptionStatus) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load subscription information</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeSubscription}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayInfo = subscriptionService.getSubscriptionDisplayInfo(subscriptionStatus) || {
    planName: '',
    callsText: '',
    progressPercentage: 0,
    renewalText: '',
    isLimitReached: false,
  };
  const isProUser = subscriptionStatus?.plan === 'pro';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Current Plan Status */}
      <View style={[styles.planCard, isProUser ? styles.proCard : styles.freeCard]}>
        <View style={styles.planHeader}>
          <View style={styles.planTitleRow}>
            {isProUser ? (
              <Crown size={24} color="#FFD700" />
            ) : (
              <Star size={24} color="#8E8E93" />
            )}
            <Text style={styles.planTitle}>{displayInfo.planName}</Text>
          </View>
          {isProUser && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>

        {/* Usage Display */}
        <View style={styles.usageContainer}>
          <Text style={styles.usageText}>{displayInfo.callsText}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(displayInfo.progressPercentage, 100)}%` }
              ]}
            />
          </View>
          <Text style={styles.renewalText}>{displayInfo.renewalText}</Text>
        </View>

        {/* Limit Warning */}
        {displayInfo.isLimitReached && (
          <View style={styles.warningContainer}>
            <Zap size={16} color="#FF3B30" />
            <Text style={styles.warningText}>
              Monthly limit reached! {!isProUser && 'Upgrade to continue making calls.'}
            </Text>
          </View>
        )}
      </View>

      {/* Upgrade Section */}
      {!isProUser && (
        <View style={styles.upgradeSection}>
          <Text style={styles.sectionTitle}>Upgrade to HeyWay Pro</Text>

          <View style={styles.proFeaturesCard}>
            {[
              '100 AI calls per month',
              'All AI voice options',
              'Advanced call scheduling',
              'Priority support',
            ].map((feature, idx) => (
              <View style={styles.proFeature} key={feature}>
                <Check size={20} color="#34C759" />
                <Text style={styles.proFeatureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.upgradeButton, isPurchasing && styles.buttonDisabled]}
            onPress={handleUpgrade}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                {isWeb ? (
                  <CreditCard size={20} color="#FFFFFF" />
                ) : (
                  <Crown size={20} color="#FFFFFF" />
                )}
                <Text style={styles.upgradeButtonText}>
                  {isWeb ? 'Subscribe with Card - $9.99/month' : 'Upgrade to Pro - $9.99/month'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Management Actions */}
      <View style={styles.actionsSection}>
        {!isWeb && (
          <TouchableOpacity
            style={[styles.actionButton, isRestoring && styles.buttonDisabled]}
            onPress={handleRestore}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="#34C759" />
            ) : (
              <RefreshCw size={18} color="#34C759" />
            )}
            <Text style={styles.actionButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        )}

        {isProUser && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Manage Subscription</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer Info */}
      <View style={styles.footerInfo}>
        <Text style={styles.footerText}>
          {isWeb 
            ? 'Secure payment processing by Stripe. Cancel anytime from your account settings.'
            : 'Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.'
          }
        </Text>
        {!isWeb && (
          <Text style={styles.footerText}>
            Manage your subscription in your App Store account settings.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxxl,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxxl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: COLORS.background.secondary,
    margin: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.md,
  },
  freeCard: {
    borderColor: COLORS.border.primary,
  },
  proCard: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.background.tertiary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  proBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  proBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  usageContainer: {
    marginBottom: SPACING.lg,
  },
  usageText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background.quaternary,
    borderRadius: RADIUS.xs,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.xs,
  },
  renewalText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.tertiary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  warningText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error,
    flex: 1,
    fontWeight: '500',
  },
  upgradeSection: {
    margin: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  proFeaturesCard: {
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  proFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  proFeatureText: {
    marginLeft: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.accent,
  },
  upgradeButtonText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionsSection: {
    margin: SPACING.lg,
  },
  actionButton: {
    backgroundColor: COLORS.background.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  actionButtonText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
    color: COLORS.green,
  },
  cancelButton: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.background.tertiary,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: COLORS.error,
  },
  footerInfo: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.background.secondary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
});