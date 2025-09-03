import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react-native';
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS } from '@styles/HEYWAY_STYLE_GUIDE';
import type { CallAnalysis } from '@/services/callAnalysisService';

interface CallAnalysisTagProps {
  analysis: CallAnalysis;
  size?: 'small' | 'medium' | 'large';
  showScore?: boolean;
  showIcon?: boolean;
}

export default function CallAnalysisTag({
  analysis,
  size = 'medium',
  showScore = false,
  showIcon = true
}: CallAnalysisTagProps) {
  const getTagConfig = () => {
    switch (analysis.category) {
      case 'good':
        return {
          label: 'Good',
          backgroundColor: '#E8F5E8',
          textColor: '#2D5A2D',
          borderColor: '#4CAF50',
          icon: CheckCircle
        };
      case 'bad':
        return {
          label: 'Bad',
          backgroundColor: '#FFEBEE',
          textColor: '#B71C1C',
          borderColor: '#F44336',
          icon: AlertTriangle
        };
      case 'opportunity':
        return {
          label: 'Opportunity',
          backgroundColor: '#FFF3E0',
          textColor: '#E65100',
          borderColor: '#FF9800',
          icon: Clock
        };
      default:
        return {
          label: 'Unknown',
          backgroundColor: HEYWAY_COLORS.background.secondary,
          textColor: HEYWAY_COLORS.text.secondary,
          borderColor: HEYWAY_COLORS.border.primary,
          icon: Clock
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: HEYWAY_SPACING.xs,
          paddingHorizontal: HEYWAY_SPACING.sm,
          fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.small,
          iconSize: 10,
          borderRadius: HEYWAY_RADIUS.sm
        };
      case 'large':
        return {
          paddingVertical: HEYWAY_SPACING.sm,
          paddingHorizontal: HEYWAY_SPACING.md,
          fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
          iconSize: 16,
          borderRadius: HEYWAY_RADIUS.md
        };
      default: // medium
        return {
          paddingVertical: HEYWAY_SPACING.xs,
          paddingHorizontal: HEYWAY_SPACING.sm,
          fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.medium,
          iconSize: 12,
          borderRadius: HEYWAY_RADIUS.sm
        };
    }
  };

  const tagConfig = getTagConfig();
  const sizeConfig = getSizeConfig();
  const IconComponent = tagConfig.icon;

  const displayText = showScore 
    ? `${tagConfig.label} (${analysis.score}%)`
    : tagConfig.label;

  return (
    <View style={[
      styles.tag,
      {
        backgroundColor: tagConfig.backgroundColor,
        borderColor: tagConfig.borderColor,
        paddingVertical: sizeConfig.paddingVertical,
        paddingHorizontal: sizeConfig.paddingHorizontal,
        borderRadius: sizeConfig.borderRadius,
      }
    ]}>
      <View style={styles.tagContent}>
        {showIcon && (
          <IconComponent 
            size={sizeConfig.iconSize} 
            color={tagConfig.textColor}
            style={styles.icon}
          />
        )}
        <Text style={[
          styles.tagText,
          {
            color: tagConfig.textColor,
            fontSize: sizeConfig.fontSize,
          }
        ]}>
          {displayText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  tagContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: HEYWAY_SPACING.xs,
  },
  tagText: {
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});