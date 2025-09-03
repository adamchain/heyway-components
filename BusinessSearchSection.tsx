import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {
  Search,
  Star,
  Phone,
  ExternalLink,
  MapPin,
  Building,
  Plus,
  Check,
  History,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { apiService } from '@/services/apiService';
import { useFavorites } from '@/hooks/useFavorites';
import { ContactSelectionManager } from '@/utils/contactSelection';
import {
  HEYWAY_COLORS,
  HEYWAY_SPACING,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
} from '@/styles/HEYWAY_STYLE_GUIDE';

interface BusinessResult {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  distance?: string;
  rating?: number;
  priceLevel?: number;
  website?: string;
  businessStatus?: string;
  types?: string[];
}

interface BusinessSearchSectionProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  locationQuery: string;
  onLocationQueryChange: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  onSearchComplete: () => void;
  onAddToCallList?: (contact: any) => void;
}

export default function BusinessSearchSection({
  activeSection,
  onSectionChange,
  searchQuery,
  onSearchQueryChange,
  locationQuery,
  onLocationQueryChange,
  onSearch,
  isLoading,
  onSearchComplete,
  onAddToCallList,
}: BusinessSearchSectionProps) {
  const [businesses, setBusinesses] = useState<BusinessResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const handleHapticFeedback = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(style);
    }
  }, []);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await ContactSelectionManager.loadSearchHistory();
      setSearchHistory(history || []);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const saveSearchToHistory = async (query: string) => {
    if (!query.trim()) return;
    try {
      await ContactSelectionManager.saveToSearchHistory(query.trim());
      await loadSearchHistory();
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const handleSearchPress = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Required', 'Please enter a business name or type');
      return;
    }

    handleHapticFeedback();
    setIsSearching(true);
    
    try {
      let coordinates = null;
      if (!locationQuery.trim()) {
        // Try to get current location if no location specified
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          coordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
        }
      }

      const params = {
        query: searchQuery.trim(),
        location: locationQuery.trim() || undefined,
        coordinates,
        radius: 5000, // 5km radius
      };

      const results = await apiService.searchBusinesses(params);
      setBusinesses(results);
      await saveSearchToHistory(searchQuery.trim());
      onSearchComplete();
    } catch (error) {
      console.error('Business search failed:', error);
      Alert.alert('Search Error', 'Failed to search businesses. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCall = (business: BusinessResult) => {
    handleHapticFeedback(Haptics.ImpactFeedbackStyle.Medium);
    const phoneUrl = `tel:${business.phoneNumber}`;
    Linking.openURL(phoneUrl);
  };

  const handleWebsite = (business: BusinessResult) => {
    if (!business.website) return;
    handleHapticFeedback();
    Linking.openURL(business.website);
  };

  const toggleFavorite = (business: BusinessResult) => {
    handleHapticFeedback();
    const businessData = {
      id: business.id,
      name: business.name,
      phoneNumber: business.phoneNumber,
      address: business.address,
    };

    if (favorites.some(fav => fav.id === business.id)) {
      removeFavorite(business.id);
    } else {
      addFavorite(businessData);
    }
  };

  const toggleBusinessSelection = (business: BusinessResult) => {
    handleHapticFeedback();
    const newSelection = new Set(selectedBusinesses);
    if (newSelection.has(business.id)) {
      newSelection.delete(business.id);
    } else {
      newSelection.add(business.id);
    }
    setSelectedBusinesses(newSelection);
  };

  const handleAddSelectedToCallList = () => {
    if (selectedBusinesses.size === 0) {
      Alert.alert('No Selection', 'Please select businesses to add to call list');
      return;
    }

    handleHapticFeedback(Haptics.ImpactFeedbackStyle.Medium);
    const selectedBusiness = businesses.filter(b => selectedBusinesses.has(b.id));
    
    selectedBusiness.forEach(business => {
      onAddToCallList?.({
        name: business.name,
        phoneNumber: business.phoneNumber,
        address: business.address,
      });
    });

    setSelectedBusinesses(new Set());
    Alert.alert('Success', `Added ${selectedBusiness.length} businesses to call list`);
  };

  const handleHistorySelect = (query: string) => {
    handleHapticFeedback();
    onSearchQueryChange(query);
  };

  const clearHistory = async () => {
    try {
      await ContactSelectionManager.clearSearchHistory();
      setSearchHistory([]);
      handleHapticFeedback();
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  const filteredFavorites = useMemo(() => {
    return favorites.filter(fav => fav.phoneNumber); // Only show favorites with phone numbers
  }, [favorites]);

  const renderSearchForm = () => (
    <View style={styles.searchForm}>
      <View style={styles.inputContainer}>
        <Search size={16} color={HEYWAY_COLORS.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          placeholderTextColor={HEYWAY_COLORS.text.tertiary}
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          returnKeyType="search"
          onSubmitEditing={handleSearchPress}
        />
      </View>

      <View style={styles.inputContainer}>
        <MapPin size={16} color={HEYWAY_COLORS.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Location (optional)"
          placeholderTextColor={HEYWAY_COLORS.text.tertiary}
          value={locationQuery}
          onChangeText={onLocationQueryChange}
          returnKeyType="search"
          onSubmitEditing={handleSearchPress}
        />
      </View>

      <TouchableOpacity
        style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
        onPress={handleSearchPress}
        disabled={isSearching || !searchQuery.trim()}
        activeOpacity={0.7}
      >
        {isSearching ? (
          <ActivityIndicator size="small" color={HEYWAY_COLORS.text.inverse} />
        ) : (
          <Search size={16} color={HEYWAY_COLORS.text.inverse} />
        )}
        <Text style={styles.searchButtonText}>
          {isSearching ? 'Searching...' : 'Search'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBusinessItem = ({ item }: { item: BusinessResult }) => {
    const isSelected = selectedBusinesses.has(item.id);
    const isFavorited = favorites.some(fav => fav.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.businessItem, isSelected && styles.businessItemSelected]}
        onPress={() => toggleBusinessSelection(item)}
        activeOpacity={0.7}
      >
        <View style={styles.businessItemLeft}>
          <View style={styles.businessIcon}>
            <Building size={20} color={HEYWAY_COLORS.interactive.primary} />
          </View>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.businessAddress} numberOfLines={2}>
              {item.address}
            </Text>
            {item.distance && (
              <Text style={styles.businessDistance}>
                {item.distance}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.businessActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleFavorite(item)}
          >
            <Star
              size={18}
              color={isFavorited ? HEYWAY_COLORS.accent.warning : HEYWAY_COLORS.text.secondary}
              fill={isFavorited ? HEYWAY_COLORS.accent.warning : 'transparent'}
            />
          </TouchableOpacity>

          {item.website && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleWebsite(item)}
            >
              <ExternalLink size={18} color={HEYWAY_COLORS.text.secondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCall(item)}
          >
            <Phone size={18} color={HEYWAY_COLORS.interactive.primary} />
          </TouchableOpacity>

          <View style={styles.selectionIndicator}>
            {isSelected ? (
              <Check size={16} color={HEYWAY_COLORS.interactive.primary} />
            ) : (
              <Plus size={16} color={HEYWAY_COLORS.text.secondary} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistorySelect(item)}
      activeOpacity={0.7}
    >
      <History size={16} color={HEYWAY_COLORS.text.secondary} />
      <Text style={styles.historyText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderFavoriteItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.businessItem}
      onPress={() => handleCall(item)}
      activeOpacity={0.7}
    >
      <View style={styles.businessItemLeft}>
        <View style={styles.businessIcon}>
          <Star size={20} color={HEYWAY_COLORS.accent.warning} fill={HEYWAY_COLORS.accent.warning} />
        </View>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.businessAddress} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleCall(item)}
      >
        <Phone size={18} color={HEYWAY_COLORS.interactive.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (activeSection === 'favorites') {
      return (
        <View style={styles.content}>
          {filteredFavorites.length > 0 ? (
            <FlatList
              data={filteredFavorites}
              renderItem={renderFavoriteItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <Star size={32} color={HEYWAY_COLORS.text.tertiary} />
              <Text style={styles.emptyTitle}>No Favorites Yet</Text>
              <Text style={styles.emptyText}>
                Star businesses from your search results to save them here
              </Text>
            </View>
          )}
        </View>
      );
    }

    // Search section
    return (
      <View style={styles.content}>
        {renderSearchForm()}

        {businesses.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {businesses.length} businesses found
            </Text>
            {selectedBusinesses.size > 0 && (
              <TouchableOpacity
                style={styles.addToCallListButton}
                onPress={handleAddSelectedToCallList}
              >
                <Plus size={14} color={HEYWAY_COLORS.text.inverse} />
                <Text style={styles.addToCallListText}>
                  Add {selectedBusinesses.size} to Call List
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {businesses.length > 0 ? (
          <FlatList
            data={businesses}
            renderItem={renderBusinessItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : searchHistory.length > 0 ? (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historySectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={clearHistory}>
                <X size={16} color={HEYWAY_COLORS.text.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={searchHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item, index) => `${item}-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.historyListContent}
            />
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'search' && styles.tabActive]}
          onPress={() => {
            handleHapticFeedback();
            onSectionChange('search');
          }}
        >
          <Search size={16} color={activeSection === 'search' ? HEYWAY_COLORS.text.inverse : HEYWAY_COLORS.text.secondary} />
          <Text style={[styles.tabText, activeSection === 'search' && styles.tabTextActive]}>
            Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSection === 'favorites' && styles.tabActive]}
          onPress={() => {
            handleHapticFeedback();
            onSectionChange('favorites');
          }}
        >
          <Star size={16} color={activeSection === 'favorites' ? HEYWAY_COLORS.text.inverse : HEYWAY_COLORS.text.secondary} />
          <Text style={[styles.tabText, activeSection === 'favorites' && styles.tabTextActive]}>
            Favorites
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  
  // Tab bar styles
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    gap: HEYWAY_SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: HEYWAY_SPACING.xs,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.md,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  tabActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.colored.accent,
  },
  tabText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
  },
  tabTextActive: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semiBold,
  },

  // Content styles
  content: {
    flex: 1,
    paddingHorizontal: HEYWAY_SPACING.md,
  },

  // Search form styles
  searchForm: {
    paddingVertical: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.input.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    gap: HEYWAY_SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.sm,
    ...HEYWAY_SHADOWS.colored.accent,
  },
  searchButtonDisabled: {
    backgroundColor: HEYWAY_COLORS.interactive.disabled,
    ...HEYWAY_SHADOWS.light.xs,
  },
  searchButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semiBold,
    color: HEYWAY_COLORS.text.inverse,
  },

  // Results styles
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HEYWAY_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    marginBottom: HEYWAY_SPACING.sm,
  },
  resultsCount: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
  },
  addToCallListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    paddingHorizontal: HEYWAY_SPACING.sm,
    gap: HEYWAY_SPACING.xs,
  },
  addToCallListText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.inverse,
  },

  listContent: {
    paddingBottom: HEYWAY_SPACING.xl,
  },

  // Business item styles
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.sm,
    ...HEYWAY_SHADOWS.light.xs,
  },
  businessItemSelected: {
    borderColor: HEYWAY_COLORS.interactive.primary,
    backgroundColor: HEYWAY_COLORS.background.accent,
    ...HEYWAY_SHADOWS.colored.accent,
  },
  businessItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: HEYWAY_SPACING.sm,
  },
  businessIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semiBold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 2,
  },
  businessAddress: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 16,
  },
  businessDistance: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.interactive.primary,
    marginTop: 2,
  },
  businessActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: HEYWAY_RADIUS.sm,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: HEYWAY_SPACING.xs,
  },

  // History styles
  historySection: {
    paddingTop: HEYWAY_SPACING.md,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: HEYWAY_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },
  historySectionTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semiBold,
    color: HEYWAY_COLORS.text.primary,
  },
  historyListContent: {
    paddingTop: HEYWAY_SPACING.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.sm,
    marginBottom: HEYWAY_SPACING.xs,
  },
  historyText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.secondary,
  },

  // Empty state styles
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.heading.h3,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semiBold,
    color: HEYWAY_COLORS.text.primary,
    marginTop: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.xs,
  },
  emptyText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
  },
});