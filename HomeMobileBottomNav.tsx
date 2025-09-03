import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Phone, Users, Briefcase, Hash, Zap, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Import HEYWAY Style Guide
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';

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
    { key: 'business', icon: Briefcase, label: 'Business Search' },
  ];

  return (
    <View style={styles.mobileBottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.mobileBottomNavItem,
            activeNavItem === item.key && styles.activeMobileBottomNavItem
          ]}
          onPress={() => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onNavItemPress(item.key);
          }}
          activeOpacity={0.7}
        >
          <item.icon
            size={20}
            color={activeNavItem === item.key ? HEYWAY_COLORS.interactive.whatsappGreen : HEYWAY_COLORS.text.tertiary}
          />
          <Text style={[
            styles.mobileBottomNavText,
            activeNavItem === item.key && styles.activeMobileBottomNavText
          ]}>
            {item.label === 'Business Search' ? 'Business' : item.label}
          </Text>
        </TouchableOpacity>
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
        <Settings size={20} color={HEYWAY_COLORS.text.tertiary} />
        <Text style={styles.mobileBottomNavText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mobileBottomNav: {
    flexDirection: 'row',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: HEYWAY_COLORS.border.divider,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    paddingBottom: HEYWAY_SPACING.md, // Extra padding for safe area
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },

  mobileBottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.xs,
    paddingHorizontal: HEYWAY_SPACING.micro,
    borderRadius: HEYWAY_RADIUS.sm,
    gap: HEYWAY_SPACING.micro,
    minHeight: 56,
  },

  activeMobileBottomNavItem: {
    backgroundColor: HEYWAY_COLORS.background.intelligenceSubtle,
    borderTopWidth: 2,
    borderTopColor: HEYWAY_COLORS.interactive.whatsappGreen,
  },

  mobileBottomNavText: {
    fontSize: 10,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.tertiary,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },

  activeMobileBottomNavText: {
    color: HEYWAY_COLORS.interactive.whatsappGreen,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
});

export default HomeMobileBottomNav;
