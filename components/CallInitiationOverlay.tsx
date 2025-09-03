import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { Phone } from 'lucide-react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY } from '../styles/HEYWAY_STYLE_GUIDE';

interface CallInitiationOverlayProps {
  visible: boolean;
  message?: string;
}

export default function CallInitiationOverlay({ visible, message = 'Initiating call...' }: CallInitiationOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      rotateAnim.setValue(0);
      bounceAnim.setValue(0);
      ripple1.setValue(0);
      ripple2.setValue(0);
      ripple3.setValue(0);

      // Fade in and scale up with bounce
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        })
      ]).start();

      // Start all animations
      startPulseAnimation();
      startRotateAnimation();
      startRippleAnimations();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const startPulseAnimation = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (visible) {
        startPulseAnimation();
      }
    });
  };

  const startRotateAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startRippleAnimations = () => {
    const createRipple = (ripple: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(ripple, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(ripple, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    createRipple(ripple1, 0);
    createRipple(ripple2, 400);
    createRipple(ripple3, 800);
  };

  if (!visible) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        }
      ]}
    >
      {/* Ripple Effects */}
      {[ripple1, ripple2, ripple3].map((ripple, index) => (
        <Animated.View
          key={index}
          style={[
            styles.ripple,
            {
              opacity: ripple.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 0.4, 0]
              }),
              transform: [{
                scale: ripple.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 2.5]
                })
              }]
            }
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { scale: scaleAnim },
              {
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }
            ]
          }
        ]}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: pulseAnim },
                { rotate: spin }
              ]
            }
          ]}
        >
          <Phone size={40} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.message}>{message}</Text>
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: HEYWAY_COLORS.background.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    borderRadius: HEYWAY_RADIUS.xxl,
    padding: HEYWAY_SPACING.xxxl,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    ...HEYWAY_SHADOWS.light.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: HEYWAY_RADIUS.xxxl * 2,
    backgroundColor: HEYWAY_COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.xl,
    ...HEYWAY_SHADOWS.light.md,
  },
  message: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: HEYWAY_SPACING.xl,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  spinner: {
    marginTop: HEYWAY_SPACING.sm,
  },
  ripple: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: HEYWAY_RADIUS.xxxl * 6,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(52, 199, 89, 0.5)',
  }
});