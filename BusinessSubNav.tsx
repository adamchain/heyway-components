import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Search, MapPin, History, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ContactSelectionManager } from '@/utils/contactSelection';

const IOS_COLORS = {
  background: '#000000',
  cardBackground: '#1C1C1E',
  secondaryBackground: '#2C2C2E',
  text: {
    primary: '#FFFFFF',
    secondary: '#AEAEB2',
    tertiary: '#636366',
  },
  accent: '#007AFF',
  separator: '#3A3A3C',
};

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
              color={activeSection === item.key ? IOS_COLORS.accent : IOS_COLORS.text.secondary}
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
              <Search size={16} color={IOS_COLORS.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Business name or type..."
                placeholderTextColor={IOS_COLORS.text.secondary}
                value={searchQuery}
                onChangeText={onSearchQueryChange}
                onSubmitEditing={onSearch}
                returnKeyType="search"
              />
            </View>

            {/* Location Input */}
            <View style={styles.inputContainer}>
              <MapPin size={16} color={IOS_COLORS.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Location (optional)..."
                placeholderTextColor={IOS_COLORS.text.secondary}
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
                    <History size={14} color={IOS_COLORS.text.secondary} />
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
    backgroundColor: 'rgba(28, 28, 30, 0.3)',
    paddingTop: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: IOS_COLORS.text.primary,
    paddingHorizontal: 20,
    marginBottom: 24,
    letterSpacing: -0.3,
  },

  navSection: {
    paddingHorizontal: 12,
    marginBottom: 20,
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
    color: IOS_COLORS.text.secondary,
    letterSpacing: 0.1,
  },

  activeNavItemText: {
    color: IOS_COLORS.accent,
    fontWeight: '600',
  },

  searchSection: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 20,
  },

  searchSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: IOS_COLORS.text.tertiary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: IOS_COLORS.text.primary,
  },

  searchButton: {
    backgroundColor: IOS_COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  searchButtonDisabled: {
    backgroundColor: 'rgba(0,122,255,0.3)',
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  searchButtonTextDisabled: {
    color: 'rgba(255,255,255,0.6)',
  },

  historySection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },

  historySectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: IOS_COLORS.text.tertiary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  historyItemText: {
    fontSize: 14,
    color: IOS_COLORS.text.secondary,
    flex: 1,
  },
});