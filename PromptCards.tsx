import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Phone, Calendar, ShoppingBag, History } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '@/components/designSystem';

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
      color: COLORS.accent,
    },
    {
      type: 'schedule' as const,
      title: 'Schedule Call',
      subtitle: 'Schedule for later',
      icon: Calendar,
      color: COLORS.green,
    },
    {
      type: 'order' as const,
      title: 'Place Order',
      subtitle: 'Order items or services',
      icon: ShoppingBag,
      color: COLORS.warning,
    },
    {
      type: 'history' as const,
      title: 'Call History',
      subtitle: 'View past calls',
      icon: History,
      color: COLORS.text.secondary,
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  promptCardsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  promptCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  promptCard: {
    width: '47%',
    backgroundColor: COLORS.background.secondary,
    borderRadius: RADIUS.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    ...SHADOWS.sm,
  },
  promptCardIcon: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  promptCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  promptCardSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default PromptCards;