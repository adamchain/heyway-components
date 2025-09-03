import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Crown, Check, Zap, CreditCard } from 'lucide-react-native';
import { subscriptionService, SubscriptionStatus } from '@/services/subscriptionService';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';
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
  container: { flex: 1, backgroundColor: HEYWAY_COLORS.background.primary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: HEYWAY_SPACING.xxxxl },
  loadingText: { marginTop: HEYWAY_SPACING.lg, fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium, fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium, color: HEYWAY_COLORS.text.secondary, letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: HEYWAY_SPACING.xxxxl },
  errorText: { fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium, fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium, color: HEYWAY_COLORS.status.error, textAlign: 'center', marginBottom: HEYWAY_SPACING.xl, letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal },