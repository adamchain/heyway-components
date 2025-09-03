import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Phone, ShoppingCart, PhoneCall, Calendar } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '@/components/designSystem';

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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  promptCard: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 80,
  },
  promptCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.text.primary,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 10,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
});