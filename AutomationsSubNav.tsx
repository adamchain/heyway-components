import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { List, Plus, Play, Pause, Phone } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS } from '@/styles/HEYWAY_STYLE_GUIDE';

interface AutomationsSubNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCreateAutomation?: () => void;
}

export default function AutomationsSubNav({ 
  activeSection, 
  onSectionChange, 
  onCreateAutomation
}: AutomationsSubNavProps) {
  const handleHapticFeedback = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const navItems = [
    { key: 'all', icon: List, label: 'All Automations' },
    { key: 'active', icon: Play, label: 'Active' },
    { key: 'inactive', icon: Pause, label: 'Inactive' },
    { key: 'calls', icon: Phone, label: 'All Calls' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Automations</Text>
      
      {/* Main Navigation */}
      <View style={styles.navSection}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.navItem,
              activeSection === item.key && styles.activeNavItem
            ]}
            onPress={() => {
              handleHapticFeedback();
              onSectionChange(item.key);
            }}
            activeOpacity={0.6}
          >
            <item.icon
              size={18}
              color={activeSection === item.key ? HEYWAY_COLORS.interactive.primary : HEYWAY_COLORS.text.secondary}
            />
            <Text style={[
              styles.navItemText,
              activeSection === item.key && styles.activeNavItemText
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Items */}
      <View style={styles.actionSection}>
        <Text style={styles.actionSectionTitle}>Actions</Text>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            handleHapticFeedback();
            onCreateAutomation?.();
          }}
          activeOpacity={0.6}
        >
          <Plus
            size={18}
            color={HEYWAY_COLORS.text.secondary}
          />
          <Text style={styles.actionItemText}>
            Create Automation
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.3)',
    paddingTop: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: HEYWAY_COLORS.text.primary,
    paddingHorizontal: 20,
    marginBottom: 24,
    letterSpacing: -0.3,
  },

  navSection: {
    paddingHorizontal: 12,
    marginBottom: 32,
  },

  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
    gap: 12,
  },

  activeNavItem: {
    backgroundColor: 'rgba(0,122,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.3)',
  },

  navItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: 0.1,
  },

  activeNavItemText: {
    color: HEYWAY_COLORS.interactive.primary,
    fontWeight: '600',
  },

  actionSection: {
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 20,
  },

  actionSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.tertiary,
    paddingHorizontal: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
    gap: 12,
  },

  actionItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: 0.1,
  },
});