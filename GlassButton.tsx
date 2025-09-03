import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS } from '@styles/HEYWAY_STYLE_GUIDE';

interface GlassButtonProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  onPress: () => void;
  size?: number;
  variant?: 'default' | 'accent' | 'success' | 'warning';
  disabled?: boolean;
}

export default function GlassButton({ 
  icon: Icon, 
  onPress, 
  size = 44, 
  variant = 'default',
  disabled = false 
}: GlassButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'accent':
        return {
          backgroundColor: HEYWAY_COLORS.interactive.primary + '25',
          borderColor: HEYWAY_COLORS.interactive.primary + '50',
        };
      case 'success':
        return {
          backgroundColor: HEYWAY_COLORS.status.success + '25',
          borderColor: HEYWAY_COLORS.status.success + '50',
        };
      case 'warning':
        return {
          backgroundColor: HEYWAY_COLORS.accent.warning + '25',
          borderColor: HEYWAY_COLORS.accent.warning + '50',
        };
      default:
        return {
          backgroundColor: HEYWAY_COLORS.background.secondary,
          borderColor: HEYWAY_COLORS.border.secondary,
        };
    }
  };

  const getIconColor = () => {
    if (disabled) return HEYWAY_COLORS.text.tertiary;
    
    switch (variant) {
      case 'accent':
        return HEYWAY_COLORS.interactive.primary;
      case 'success':
        return HEYWAY_COLORS.status.success;
      case 'warning':
        return HEYWAY_COLORS.accent.warning;
      default:
        return HEYWAY_COLORS.text.primary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: disabled ? 0.5 : 1,
        },
        getVariantStyles(),
      ]}
      activeOpacity={0.7}
    >
      <Icon size={size * 0.45} color={getIconColor()} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...HEYWAY_SHADOWS.light.md,
  },
});