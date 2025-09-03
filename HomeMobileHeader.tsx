import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Menu, Settings } from 'lucide-react-native';

// Import HEYWAY Style Guide
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_ACCESSIBILITY } from '@styles/HEYWAY_STYLE_GUIDE';

interface HomeMobileHeaderProps {
  onMenuPress: () => void;
  onSettingsPress: () => void;
}

const HomeMobileHeader: React.FC<HomeMobileHeaderProps> = ({
  onMenuPress,
  onSettingsPress,
}) => {
  return (
    <View style={styles.mobileHeader}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        activeOpacity={0.7}
      >
        <Menu size={24} color={HEYWAY_COLORS.text.primary} />
      </TouchableOpacity>

      <View style={styles.mobileHeaderCenter}>
        <Image
          source={require('../assets/images/logo.webp')}
          style={styles.mobileHeaderLogo}
          resizeMode="contain"
        />
        <Text style={styles.mobileHeaderTitle}>Heyway</Text>
      </View>

      <TouchableOpacity
        style={styles.mobileSettingsButton}
        onPress={onSettingsPress}
        activeOpacity={0.7}
      >
        <Settings size={20} color={HEYWAY_COLORS.text.secondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: HEYWAY_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.secondary,
  },

  mobileHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
  },

  mobileHeaderLogo: {
    width: 32,
    height: 32,
    borderRadius: HEYWAY_RADIUS.md,
  },

  mobileHeaderTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },

  mobileSettingsButton: {
    width: 44,
    height: 44,
    borderRadius: HEYWAY_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default HomeMobileHeader;
