import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { Phone, Users, Briefcase, Hash, Zap, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Import HEYWAY Style Guide
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';

interface HomeMobileBottomNavProps {
  activeNavItem: string;
  onNavItemPress: (key: string) => void;
  onSettingsPress: () => void;
}

const HomeMobileBottomNav: React.FC<HomeMobileBottomNavProps> = ({
  activeNavItem,
  onNavItemPress,
  onSettingsPress,
}) => {
  // Navigation items for bottom nav (limited to 4 + settings)
  const navItems = [
    { key: 'recents', icon: Phone, label: 'Calls' },
    { key: 'automations', icon: Zap, label: 'Automations' },
    { key: 'contacts', icon: Users, label: 'Contacts' },
    { key: 'business', icon: Briefcase, label: 'Business' },
  ];

  const animationRefs = useRef<{[key: string]: Animated.Value}>({});
  
  // Initialize animations for each nav item
  navItems.forEach(item => {
    if (!animationRefs.current[item.key]) {
      animationRefs.current[item.key] = new Animated.Value(activeNavItem === item.key ? 1 : 0);
    }
  });

  useEffect(() => {
    // Animate active state changes
    navItems.forEach(item => {
      const targetValue = activeNavItem === item.key ? 1 : 0;
      Animated.spring(animationRefs.current[item.key], {
        toValue: targetValue,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    });
  }, [activeNavItem]);

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = activeNavItem === item.key;
    const animation = animationRefs.current[item.key];
    
    const backgroundColor = animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', HEYWAY_COLORS.background.intelligenceSubtle],
    });

    const iconColor = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [HEYWAY_COLORS.text.tertiary, HEYWAY_COLORS.interactive.whatsappGreen],
    });

    const textColor = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [HEYWAY_COLORS.text.tertiary, HEYWAY_COLORS.interactive.whatsappGreen],
    });

    const indicatorHeight = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 3],
    });

    return (
      <TouchableOpacity
        key={item.key}
        style={styles.mobileBottomNavItem}
        onPress={() => {
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onNavItemPress(item.key);
        }}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.navItemIndicator, { height: indicatorHeight }]} />
        <Animated.View style={[styles.navItemContainer, { backgroundColor }]}>
          <Animated.View style={styles.iconContainer}>
            <item.icon size={22} color={iconColor} />
          </Animated.View>
          <Animated.Text style={[styles.mobileBottomNavText, { color: textColor }]}>
            {item.label}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mobileBottomNav}>
      {navItems.map((item) => (
        <NavItem key={item.key} item={item} />
      ))}
      {/* Settings in bottom nav */}
      <TouchableOpacity
        style={styles.mobileBottomNavItem}
        onPress={() => {
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onSettingsPress();
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.navItemIndicator, { height: 0 }]} />
        <View style={styles.navItemContainer}>
          <View style={styles.iconContainer}>
            <Settings size={22} color={HEYWAY_COLORS.text.tertiary} />
          </View>
          <Text style={styles.mobileBottomNavText}>Settings</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mobileBottomNav: {
    flexDirection: 'row',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderTopWidth: 0.5,
    borderTopColor: HEYWAY_COLORS.border.divider,
    paddingHorizontal: HEYWAY_SPACING.xs,
    paddingVertical: HEYWAY_SPACING.xs,
    paddingBottom: HEYWAY_SPACING.lg, // Extra padding for safe area
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },

  mobileBottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    minHeight: 60,
  },

  navItemIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 24,
    backgroundColor: HEYWAY_COLORS.interactive.whatsappGreen,
    borderRadius: 2,
    marginLeft: -12,
  },

  navItemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.xs,
    borderRadius: HEYWAY_RADIUS.md,
    marginTop: HEYWAY_SPACING.xs,
    gap: HEYWAY_SPACING.micro,
    minWidth: 50,
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  mobileBottomNavText: {
    fontSize: 11,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    lineHeight: 13,
  },

  activeMobileBottomNavItem: {
    backgroundColor: HEYWAY_COLORS.background.intelligenceSubtle,
    borderTopWidth: 2,
    borderTopColor: HEYWAY_COLORS.interactive.whatsappGreen,
  },

  activeMobileBottomNavText: {
    color: HEYWAY_COLORS.interactive.whatsappGreen,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
});

export default HomeMobileBottomNav;
