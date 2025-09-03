import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Phone, Calendar, ShoppingBag, History } from 'lucide-react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';

interface PromptCardsProps {
  onPromptSelect: (promptType: 'call' | 'schedule' | 'order' | 'history') => void;
}

const PromptCards: React.FC<PromptCardsProps> = ({ onPromptSelect }) => {
  const promptTypes = [
    {
      type: 'call' as const,
      title: 'Make a Call',
      subtitle: 'Call contacts immediately',
      icon: Phone,
      color: HEYWAY_COLORS.interactive.primary,
    },
    {
      type: 'schedule' as const,
      title: 'Schedule Call',
      subtitle: 'Schedule for later',
      icon: Calendar,
      color: HEYWAY_COLORS.status.success,
    },
    {
      type: 'order' as const,
      title: 'Place Order',
      subtitle: 'Order items or services',
      icon: ShoppingBag,
      color: HEYWAY_COLORS.accent.warning,
    },
    {
      type: 'history' as const,
      title: 'Call History',
      subtitle: 'View past calls',
      icon: History,
      color: HEYWAY_COLORS.text.secondary,
    },
  ];

  return (
    <View style={styles.promptCardsContainer}>
      <Text style={styles.promptCardsTitle}>What would you like to do?</Text>
      <View style={styles.promptCardsGrid}>
        {promptTypes.map((prompt) => {
          const IconComponent = prompt.icon;
          return (
            <TouchableOpacity
              key={prompt.type}
              style={styles.promptCard}
              onPress={() => onPromptSelect(prompt.type)}
            >
              <View style={[styles.promptCardIcon, { backgroundColor: `${prompt.color}15` }]}>
                <IconComponent size={24} color={prompt.color} />
              </View>
              <Text style={styles.promptCardTitle}>{prompt.title}</Text>
              <Text style={styles.promptCardSubtitle}>{prompt.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  promptCardsContainer: {
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.xxl,
  },
  promptCardsTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: HEYWAY_SPACING.xxl,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  promptCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: HEYWAY_SPACING.lg,
  },
  promptCard: {
    width: '47%',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.large * 2,
    ...HEYWAY_SHADOWS.light.sm,
  },
  promptCardIcon: {
    width: 50,
    height: 50,
    borderRadius: HEYWAY_RADIUS.component.avatar.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HEYWAY_SPACING.md,
    ...HEYWAY_SHADOWS.light.xs,
  },
  promptCardTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  promptCardSubtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});

export default PromptCards;