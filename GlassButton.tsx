import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from './designSystem';

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
          backgroundColor: 'rgba(0,122,255,0.15)',
          borderColor: 'rgba(0,122,255,0.3)',
        };
      case 'success':
        return {
          backgroundColor: 'rgba(52,199,89,0.15)',
          borderColor: 'rgba(52,199,89,0.3)',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(255,159,10,0.15)',
          borderColor: 'rgba(255,159,10,0.3)',
        };
      default:
        return {
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.border.secondary,
        };
    }
  };

  const getIconColor = () => {
    if (disabled) return COLORS.text.disabled;
    
    switch (variant) {
      case 'accent':
        return COLORS.accent;
      case 'success':
        return COLORS.success;
      case 'warning':
        return COLORS.warning;
      default:
        return COLORS.text.primary;
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
    ...SHADOWS.glassEnhanced,
  },
});