import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Crown, Check, Zap, CreditCard } from 'lucide-react-native';
import { subscriptionService, SubscriptionStatus } from '@/services/subscriptionService';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '@/components/designSystem';
import { isWeb } from '@/utils/platformUtils';

interface WebSubscriptionManagerProps {
  onSubscriptionChanged?: () => void;
}

// Stripe integration for web payments
const handleStripeCheckout = async () => {
  try {
    // Initialize Stripe checkout
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

export default function WebSubscriptionManager({ onSubscriptionChanged }: WebSubscriptionManagerProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      Alert.alert('Error', 'Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsPurchasing(true);
      
      if (isWeb) {
        // Use Stripe for web payments
        await handleStripeCheckout();
      } else {
        // Use in-app purchases for mobile (existing flow)
        const success = await subscriptionService.purchaseProduct('com.heyway.pro_monthly');
        if (success) {
          const updatedStatus = await subscriptionService.getSubscriptionStatus();
          setSubscriptionStatus(updatedStatus);
          Alert.alert('Upgrade Successful!', 'Welcome to HeyWay Pro!');
          onSubscriptionChanged?.();
        }
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert('Purchase Failed', 'Unable to complete purchase');
    } finally {
      setIsPurchasing(false);
    }
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
        <TouchableOpacity style={styles.retryButton} onPress={loadSubscriptionStatus}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayInfo = subscriptionService.getSubscriptionDisplayInfo(subscriptionStatus);
  const isProUser = subscriptionStatus?.plan === 'pro';

  return (
    <View style={styles.container}>
      {/* Current Plan Status */}
      <View style={[styles.planCard, isProUser ? styles.proCard : styles.freeCard]}>
        <View style={styles.planHeader}>
          <View style={styles.planTitleRow}>
            {isProUser ? (
              <Crown size={24} color="#FFD700" />
            ) : (
              <Zap size={24} color="#8E8E93" />
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
            ].map((feature) => (
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

      {/* Platform-specific footer */}
      <View style={styles.footerInfo}>
        <Text style={styles.footerText}>
          {isWeb 
            ? 'Secure payment processing by Stripe. Cancel anytime from your account settings.'
            : 'Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = {
  // ... (copy styles from original SubscriptionManager.tsx)
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxxl },
  loadingText: { marginTop: SPACING.lg, fontSize: TYPOGRAPHY.sizes.md, color: COLORS.text.secondary, fontWeight: '500' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxxl },
  errorText: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.error, textAlign: 'center', marginBottom: SPACING.xl, fontWeight: '500' },
  retryButton: { backgroundColor: COLORS.green, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  retryButtonText: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.sizes.md, fontWeight: '600' },
  planCard: { backgroundColor: COLORS.background.secondary, margin: SPACING.lg, padding: SPACING.xl, borderRadius: RADIUS.lg, borderWidth: 1, ...SHADOWS.md },
  freeCard: { borderColor: COLORS.border.primary },
  proCard: { borderColor: COLORS.accent, backgroundColor: COLORS.background.tertiary },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  planTitleRow: { flexDirection: 'row', alignItems: 'center' },
  planTitle: { fontSize: TYPOGRAPHY.sizes.xxxl, fontWeight: '700', color: COLORS.text.primary, marginLeft: SPACING.sm },
  proBadge: { backgroundColor: COLORS.accent, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.sm },
  proBadgeText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '700', color: COLORS.text.primary },
  usageContainer: { marginBottom: SPACING.lg },
  usageText: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '600', color: COLORS.text.primary, marginBottom: SPACING.sm },
  progressBar: { height: 6, backgroundColor: COLORS.background.quaternary, borderRadius: RADIUS.xs, marginBottom: SPACING.sm },
  progressFill: { height: '100%', backgroundColor: COLORS.green, borderRadius: RADIUS.xs },
  renewalText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, fontWeight: '500' },
  warningContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background.tertiary, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.error },
  warningText: { marginLeft: SPACING.sm, fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.error, flex: 1, fontWeight: '500' },
  upgradeSection: { margin: SPACING.lg },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.lg },
  proFeaturesCard: { backgroundColor: COLORS.background.secondary, padding: SPACING.xl, borderRadius: RADIUS.lg, marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.border.primary },
  proFeature: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  proFeatureText: { marginLeft: SPACING.md, fontSize: TYPOGRAPHY.sizes.md, color: COLORS.text.primary, fontWeight: '500' },
  upgradeButton: { backgroundColor: COLORS.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: SPACING.lg, borderRadius: RADIUS.lg, ...SHADOWS.accent },
  upgradeButtonText: { marginLeft: SPACING.sm, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.text.primary },
  buttonDisabled: { opacity: 0.6 },
  footerInfo: { margin: SPACING.lg, padding: SPACING.lg, backgroundColor: COLORS.background.secondary, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border.primary },
  footerText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, textAlign: 'center', marginBottom: SPACING.xs, fontWeight: '500' }
} as const;