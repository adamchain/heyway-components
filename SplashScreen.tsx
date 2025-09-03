import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { HEYWAY_COLORS, HEYWAY_SPACING } from '@/styles/HEYWAY_STYLE_GUIDE';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  visible: boolean;
}

export default function SplashScreen({ visible }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Animated spinner in the middle */}
      <Animated.View
        style={[
          styles.spinnerContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
      </Animated.View>

      {/* Animated app icon aligned to bottom */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('@/assets/images/logo.webp')}
          style={styles.icon}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.whatsappPanel,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: HEYWAY_COLORS.text.inverse,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    bottom: HEYWAY_SPACING.xxxxl + HEYWAY_SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
  },
  icon: {
    width: 80,
    height: 80,
  },
});