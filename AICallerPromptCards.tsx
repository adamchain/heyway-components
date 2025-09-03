import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Phone, ShoppingCart, PhoneCall, Calendar } from 'lucide-react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';

interface AICallerPromptCardsProps {
  onPromptSelect: (promptType: 'standard' | 'order' | 'callback' | 'schedule') => void;
  selectedPrompt?: string | null;
}

export default function AICallerPromptCards({ onPromptSelect, selectedPrompt }: AICallerPromptCardsProps) {
  const promptCards = [
    {
      id: 'standard',
      title: 'Standard',
      subtitle: 'General call',
      icon: Phone,
    },
    {
      id: 'order',
      title: 'Order',
      subtitle: 'Place order',
      icon: ShoppingCart,
    },
    {
      id: 'callback',
      title: 'Call Back',
      subtitle: 'Return call',
      icon: PhoneCall,
    },
    {
      id: 'schedule',
      title: 'Schedule',
      subtitle: 'Book appointment',
      icon: Calendar,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>AI Caller</Text>
      <View style={styles.cardsContainer}>
        {promptCards.map((card) => {
          const IconComponent = card.icon;
          const isSelected = selectedPrompt === card.id;
          
          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.promptCard,
                isSelected && styles.promptCardSelected
              ]}
              onPress={() => onPromptSelect(card.id as 'standard' | 'order' | 'callback' | 'schedule')}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <IconComponent size={16} color={COLORS.text.primary} />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: HEYWAY_SPACING.lg,
  },
  sectionTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: HEYWAY_SPACING.sm,
  },
  promptCard: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.sm,
    alignItems: 'center',
    minHeight: 80,
    ...HEYWAY_SHADOWS.light.xs,
  },
  promptCardSelected: {
    borderWidth: 2,
    borderColor: HEYWAY_COLORS.interactive.primary,
    backgroundColor: HEYWAY_COLORS.interactive.selected,
    ...HEYWAY_SHADOWS.light.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: HEYWAY_RADIUS.component.avatar.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HEYWAY_SPACING.xs,
  },
  cardTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  cardSubtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.tertiary,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});