import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Phone, PhoneIncoming, PhoneOutgoing, Calendar, Plus, Clock, ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS } from '@/styles/HEYWAY_STYLE_GUIDE';

interface CallsSubNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onNewCall?: () => void;
}

export default function CallsSubNav({ 
  activeSection, 
  onSectionChange, 
  onNewCall
}: CallsSubNavProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleHapticFeedback = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const navItems = [
    { key: 'all', icon: Phone, label: 'All Calls' },
    { key: 'inbound', icon: PhoneIncoming, label: 'Inbound' },
    { key: 'outbound', icon: PhoneOutgoing, label: 'Outbound' },
    { key: 'scheduled', icon: Calendar, label: 'Scheduled' },
  ];

  const activeItem = navItems.find(item => item.key === activeSection) || navItems[0];

  const handleSectionSelect = (section: string) => {
    handleHapticFeedback();
    onSectionChange(section);
    setIsDropdownOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
       
      </View>

      {/* Dropdown Navigation */}
      <View style={styles.dropdownSection}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => {
            handleHapticFeedback();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.dropdownButtonContent}>
            <activeItem.icon 
              size={16} 
              color="#FFFFFF" 
            />
            <Text style={styles.dropdownButtonText}>
              {activeItem.label}
            </Text>
            <ChevronDown 
              size={16} 
              color="#8E8E93" 
              style={[
                styles.chevron,
                isDropdownOpen && styles.chevronRotated
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <View style={styles.dropdownMenu}>
            <ScrollView 
              style={styles.dropdownScroll}
              showsVerticalScrollIndicator={false}
            >
              {navItems.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.dropdownItem,
                    activeSection === item.key && styles.activeDropdownItem
                  ]}
                  onPress={() => handleSectionSelect(item.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dropdownItemContent}>
                    <item.icon 
                      size={16} 
                      color={activeSection === item.key ? '#007AFF' : '#8E8E93'} 
                    />
                    <Text style={[
                      styles.dropdownItemText,
                      activeSection === item.key && styles.activeDropdownItemText
                    ]}>
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.recentSection}>
       
        <View style={styles.recentDivider} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  newCallButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },



  recentSection: {
    marginTop: 16,
    paddingHorizontal: 12,
  },

  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },

  recentTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#636366',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  recentDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  dropdownSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },

  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  dropdownButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },

  chevron: {
    // React Native doesn't support CSS transitions
  },

  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },



  dropdownMenu: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    marginTop: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: 200,
  },

  dropdownScroll: {
    maxHeight: '60%',
  },

  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },

  activeDropdownItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },

  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  dropdownItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    letterSpacing: -0.1,
  },

  activeDropdownItemText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});