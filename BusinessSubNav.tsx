import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Search, MapPin, History, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ContactSelectionManager } from '@/utils/contactSelection';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';


interface BusinessSubNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  locationQuery: string;
  onLocationQueryChange: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export default function BusinessSubNav({ 
  activeSection, 
  onSectionChange,
  searchQuery,
  onSearchQueryChange,
  locationQuery,
  onLocationQueryChange,
  onSearch,
  isLoading
}: BusinessSubNavProps) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const handleHapticFeedback = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await ContactSelectionManager.loadSearchHistory();
      setSearchHistory(history || []);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const handleSearchHistorySelect = (query: string) => {
    handleHapticFeedback();
    onSearchQueryChange(query);
    onSearch();
  };

  const navItems = [
    { key: 'search', icon: Search, label: 'Search' },
    { key: 'favorites', icon: Star, label: 'Favorites' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Business Search</Text>
      
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
              color={activeSection === item.key ? HEYWAY_COLORS.accent.info : HEYWAY_COLORS.text.secondary}
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

      {/* Search Form - Only show when search section is active */}
      {activeSection === 'search' && (
        <>
          {/* Search Input */}
          <View style={styles.searchSection}>
            <Text style={styles.searchSectionTitle}>Search Businesses</Text>
            
            <View style={styles.inputContainer}>
              <Search size={16} color={HEYWAY_COLORS.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Business name or type..."
                placeholderTextColor={HEYWAY_COLORS.text.secondary}
                value={searchQuery}
                onChangeText={onSearchQueryChange}
                onSubmitEditing={onSearch}
                returnKeyType="search"
              />
            </View>

            {/* Location Input */}
            <View style={styles.inputContainer}>
              <MapPin size={16} color={HEYWAY_COLORS.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Location (optional)..."
                placeholderTextColor={HEYWAY_COLORS.text.secondary}
                value={locationQuery}
                onChangeText={onLocationQueryChange}
              />
            </View>

            {/* Search Button */}
            <TouchableOpacity
              style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
              onPress={() => {
                handleHapticFeedback();
                onSearch();
              }}
              disabled={isLoading || !searchQuery.trim()}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.searchButtonText,
                isLoading && styles.searchButtonTextDisabled
              ]}>
                {isLoading ? 'Searching...' : 'Search'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historySectionTitle}>Recent Searches</Text>
              <FlatList
                data={searchHistory.slice(0, 5)}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.historyItem}
                    onPress={() => handleSearchHistorySelect(item)}
                    activeOpacity={0.7}
                  >
                    <History size={14} color={HEYWAY_COLORS.text.secondary} />
                    <Text style={styles.historyItemText} numberOfLines={1}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    paddingTop: HEYWAY_SPACING.xl,
  },

  sectionTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    paddingHorizontal: HEYWAY_SPACING.xl,
    marginBottom: HEYWAY_SPACING.xxl,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },

  navSection: {
    paddingHorizontal: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.xl,
  },

  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    marginVertical: HEYWAY_SPACING.xs,
    gap: HEYWAY_SPACING.md,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
  },

  activeNavItem: {
    backgroundColor: HEYWAY_COLORS.interactive.selected,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },

  navItemText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  activeNavItemText: {
    color: HEYWAY_COLORS.interactive.primary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },

  searchSection: {
    paddingHorizontal: HEYWAY_SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: HEYWAY_COLORS.border.tertiary,
    paddingTop: HEYWAY_SPACING.xl,
  },

  searchSectionTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.tertiary,
    marginBottom: HEYWAY_SPACING.lg,
    textTransform: 'uppercase',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.input.lg,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },

  searchInput: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  searchButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    paddingVertical: HEYWAY_SPACING.md,
    alignItems: 'center',
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    marginTop: HEYWAY_SPACING.sm,
    ...HEYWAY_SHADOWS.light.sm,
  },

  searchButtonDisabled: {
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    opacity: 0.6,
  },

  searchButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  searchButtonTextDisabled: {
    color: HEYWAY_COLORS.text.tertiary,
  },

  historySection: {
    marginTop: HEYWAY_SPACING.xxl,
    paddingHorizontal: HEYWAY_SPACING.xl,
  },

  historySectionTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.tertiary,
    marginBottom: HEYWAY_SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },

  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    marginBottom: HEYWAY_SPACING.xs,
    gap: HEYWAY_SPACING.sm,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },

  historyItemText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    flex: 1,
  },
});