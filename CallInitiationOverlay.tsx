import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { Phone } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '@/components/designSystem';

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
    backgroundColor: 'none'.dark,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'rgba(52, 199, 89, 0.9)', // Using rgba for transparency
    borderRadius: RADIUS.xl,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: 'none'.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  message: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontFamily: 'System',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 10,
  },
  ripple: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(52, 199, 89, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(52, 199, 89, 0.5)',
  }
});