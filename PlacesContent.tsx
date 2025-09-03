import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  Keyboard,
  Linking,
  SafeAreaView,
} from 'react-native';
import { Search, MapPin, Copy, Plus, Star, ExternalLink, Phone, Building, Heart, Check, ArrowLeft, X } from 'lucide-react-native';
import { ContactSelectionManager } from '@/utils/contactSelection';
import { apiService } from '@/services/apiService';
import { useFavorites } from '@/hooks/useFavorites';
import * as Location from 'expo-location';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';

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

interface PlacesContentProps {
  onContactsSelected: () => void;
  onDone: () => void;
  externalSearchQuery?: string;
  hideHeader?: boolean;
  onAddToCallList?: (business: BusinessResult) => void;
}

export default function PlacesContent({ onContactsSelected, onDone, externalSearchQuery, hideHeader = false, onAddToCallList }: PlacesContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BusinessResult[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [contactMap, setContactMap] = useState<Record<string, string>>({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Favorites hook
  const favorites = useFavorites();

  useEffect(() => {
    loadSelectedContacts();
    loadSearchHistory();
    getCurrentLocation();
  }, []);

  // Sync external search query with internal state
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Trigger search when search query changes and we have external query control
  useEffect(() => {
    if (externalSearchQuery !== undefined && searchQuery.length > 0 && currentLocation) {
      // Use a timeout to debounce the search
      const searchTimeout = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(searchTimeout);
    }
  }, [searchQuery, currentLocation, externalSearchQuery]);

  const loadSelectedContacts = async () => {
    try {
      const selected = await ContactSelectionManager.loadSelectedContacts();
      setSelectedContacts(selected);
    } catch { }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await ContactSelectionManager.loadSearchHistory();
      setSearchHistory(history || []);
    } catch { }
  };

  const saveSearchHistory = async (query: string) => {
    try {
      const updatedHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
      setSearchHistory(updatedHistory);
      await ContactSelectionManager.saveSearchHistory(updatedHistory);
    } catch { }
  };

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);

      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'To show nearby businesses, please enable location access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Settings', onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });

      console.log('📍 Current location obtained:', {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });

    } catch (error) {
      console.warn('Failed to get current location:', error);
      // Fallback for web browsers
      if (Platform.OS === 'web' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            console.log('📍 Web location obtained:', {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.warn('Web geolocation failed:', error);
          }
        );
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Required', 'Please enter a business name or type');
      return;
    }
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await saveSearchHistory(searchQuery.trim());
      const searchParams = {
        query: searchQuery.trim(),
        location: locationQuery.trim() || undefined,
        coordinates: currentLocation || undefined,
        radius: 10000,
      };

      console.log('🔍 Search parameters:', {
        query: searchParams.query,
        location: searchParams.location,
        hasCoordinates: !!searchParams.coordinates,
        coordinates: searchParams.coordinates
      });

      const response = await apiService.searchBusinesses(searchParams);
      if (response && Array.isArray(response)) {
        const formattedResults: BusinessResult[] = response.map((place: any) => ({
          id: place.place_id || place.id,
          name: place.name || 'Unknown Business',
          phoneNumber: place.formatted_phone_number || place.international_phone_number || 'No phone number',
          address: place.formatted_address || place.vicinity || 'Address not available',
          distance: place.distance || undefined,
          rating: place.rating || undefined,
          priceLevel: place.price_level || undefined,
          website: place.website || undefined,
          businessStatus: place.business_status || undefined,
          types: place.types || [],
        }));
        const validResults = formattedResults.filter(result =>
          result.phoneNumber && result.phoneNumber !== 'No phone number'
        );
        setResults(validResults);
        if (validResults.length === 0) {
          Alert.alert(
            'No Results with Phone Numbers',
            'We found businesses matching your search, but none have publicly available phone numbers for calling.'
          );
        }
      } else {
        setResults([]);
        Alert.alert('No Results', 'No businesses found matching your search criteria.');
      }
    } catch (error: any) {
      setResults([]);
      Alert.alert('Search Error', 'Failed to search for businesses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const runSearchForQuery = async (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setIsLoading(true);
    try {
      await saveSearchHistory(query.trim());
      const searchParams = {
        query: query.trim(),
        location: locationQuery.trim() || undefined,
        coordinates: currentLocation || undefined,
        radius: 10000,
      };
      const response = await apiService.searchBusinesses(searchParams);
      if (response && Array.isArray(response)) {
        const formattedResults: BusinessResult[] = response.map((place: any) => ({
          id: place.place_id || place.id,
          name: place.name || 'Unknown Business',
          phoneNumber: place.formatted_phone_number || place.international_phone_number || 'No phone number',
          address: place.formatted_address || place.vicinity || 'Address not available',
          distance: place.distance || undefined,
          rating: place.rating || undefined,
          priceLevel: place.price_level || undefined,
          website: place.website || undefined,
          businessStatus: place.business_status || undefined,
          types: place.types || [],
        }));
        const validResults = formattedResults.filter(result =>
          result.phoneNumber && result.phoneNumber !== 'No phone number'
        );
        setResults(validResults);
        if (validResults.length === 0) {
          Alert.alert(
            'No Results with Phone Numbers',
            'We found businesses matching your search, but none have publicly available phone numbers for calling.'
          );
        }
      } else {
        setResults([]);
        Alert.alert('No Results', 'No businesses found matching your search criteria.');
      }
    } catch {
      setResults([]);
      Alert.alert('Search Error', 'Failed to search for businesses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (phoneNumber: string, id: string) => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(phoneNumber);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      Alert.alert('Copied', `${phoneNumber} copied to clipboard`);
    } catch {
      Alert.alert('Copy Failed', 'Unable to copy phone number to clipboard');
    }
  };

  const addToCallList = async (business: BusinessResult) => {
    try {
      if (business.phoneNumber === 'No phone number') {
        Alert.alert('No Phone Number', 'This business does not have a publicly available phone number.');
        return;
      }
      if (selectedContacts.includes(business.phoneNumber)) {
        Alert.alert('Already Added', 'This number is already in your call list');
        return;
      }
      const newSelected = ContactSelectionManager.deduplicateContactsByNameAndPhone([
        ...selectedContacts.map(phone => ({ id: '', phoneNumber: phone, name: contactMap[phone] || phone })),
        { id: '', phoneNumber: business.phoneNumber, name: business.name }
      ]).map(contact => contact.phoneNumber);
      setSelectedContacts(newSelected);
      await ContactSelectionManager.saveSelectedContacts(newSelected);
      try {
        await apiService.createContact({
          name: business.name,
          phoneNumber: business.phoneNumber,
        });
      } catch { }
      onContactsSelected();
      Alert.alert('Success', `Added ${business.name} to call list`);
    } catch {
      Alert.alert('Error', 'Failed to add to call list');
    }
  };

  const openWebsite = (website: string) => {
    if (website) {
      if (Platform.OS === 'web') {
        window.open(website.startsWith('http') ? website : `https://${website}`, '_blank');
      }
    }
  };

  const callBusiness = (phoneNumber: string) => {
    if (phoneNumber && phoneNumber !== 'No phone number') {
      if (Platform.OS === 'web') {
        window.open(`tel:${phoneNumber}`, '_blank');
      }
    }
  };

  const handleAddToCallList = (business: BusinessResult) => {
    onAddToCallList?.(business);
  };

  const handleToggleFavorite = async (business: BusinessResult) => {
    try {
      const isFavorite = favorites.isFavorite(business.phoneNumber, 'business');

      if (isFavorite) {
        // Find the favorite item and remove it
        const favoriteItem = favorites.favorites.find(fav =>
          fav.phoneNumber === business.phoneNumber && fav.type === 'business'
        );
        if (favoriteItem) {
          await favorites.removeFromFavorites(favoriteItem.id);
        }
      } else {
        // Add to favorites
        await favorites.addToFavorites({
          name: business.name,
          phoneNumber: business.phoneNumber,
          type: 'business',
          address: business.address,
          rating: business.rating,
        });
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update favorites'
      );
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} color="#000" fill="#000" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" size={12} color="#000" fill="#000" opacity={0.5} />);
    }
    return stars;
  };

  const renderBusinessItem = ({ item }: { item: BusinessResult }) => {
    const isSelected = selectedContacts.includes(item.phoneNumber);
    const isDisabled = item.phoneNumber === 'No phone number';
    const isFavorite = favorites.isFavorite(item.phoneNumber, 'business');
    const orangeColor = '#FF8C00'; // Orange color for favorites

    return (
      <TouchableOpacity
        style={styles.businessItem}
        onPress={() => handleAddToCallList(item)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <View style={styles.businessMainContent}>
          <Text style={styles.businessName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.businessMeta}>
            <Text style={styles.businessPhone} numberOfLines={1}>{item.phoneNumber}</Text>
            {item.address && (
              <Text style={styles.businessAddress} numberOfLines={1}>{item.address}</Text>
            )}
            <View style={styles.businessRating}>
              {item.rating && (
                <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
              )}
              {item.distance && <Text style={styles.businessDistance}>{item.distance}</Text>}
            </View>
            {isSelected && <View style={styles.selectedDot} />}
          </View>
        </View>

        <View style={styles.businessActions}>
         

          <TouchableOpacity
            style={[styles.actionButton, isFavorite && styles.favoriteButton]}
            onPress={(e) => {
              e.stopPropagation();
              handleToggleFavorite(item);
            }}
            disabled={isDisabled}
          >
            <Star
              size={16}
              color={isDisabled ? "#636366" : (isFavorite ? orangeColor : "#FFFFFF")}
              fill={isFavorite ? orangeColor : 'none'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Title Header */}
      <Text style={styles.sectionHeader}>Business</Text>

      {/* Minimalist Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={16} color="#AEAEB2" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses..."
            placeholderTextColor="#636366"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <X size={14} color="#AEAEB2" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Location Input */}
      <View style={styles.locationContainer}>
        <View style={styles.locationInputWrapper}>
          <TextInput
            style={styles.locationInput}
            placeholder={currentLocation ? "Using your location" : "Enter location (optional)"}
            value={locationQuery}
            onChangeText={setLocationQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            placeholderTextColor="#636366"
          />
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <MapPin size={16} color={currentLocation ? "#007AFF" : "#AEAEB2"} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {/* Search History */}
      {searchHistory.length > 0 && !isLoading && results.length === 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Searches</Text>
          <View style={styles.historyTags}>
            {searchHistory.slice(0, 5).map((query, index) => (
              <TouchableOpacity
                key={index}
                style={styles.historyTag}
                onPress={() => runSearchForQuery(query)}
              >
                <Text style={styles.historyTagText}>{query}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* List Container */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Searching for businesses...</Text>
            <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderBusinessItem}
            keyExtractor={(item) => item.id}
            style={styles.resultsList}
            contentContainerStyle={styles.resultsContent}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={() => {
              if (searchQuery.trim()) {
                handleSearch();
              }
            }}
          />
        ) : searchQuery && !isLoading ? (
          <View style={styles.emptyContainer}>
            <Building size={48} color="#636366" />
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptyText}>
              Try searching with different keywords or check your spelling
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Building size={48} color="#636366" />
            <Text style={styles.emptyTitle}>Search for Businesses</Text>
            <Text style={styles.emptyText}>
              Enter a business name or type to find nearby places
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.whatsappPanel,
  },

  // Section Header - Enhanced typography
  sectionHeader: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    paddingHorizontal: HEYWAY_SPACING.xl,
    marginBottom: HEYWAY_SPACING.xl,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  searchContainer: {
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.input.lg,
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.md,
  },
  searchInput: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    backgroundColor: 'transparent',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    backgroundColor: HEYWAY_COLORS.interactive.hover,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.light.xs,
  },
  locationContainer: {
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingBottom: HEYWAY_SPACING.lg,
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.input.lg,
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    gap: HEYWAY_SPACING.md,
    ...HEYWAY_SHADOWS.light.xs,
  },
  locationInput: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    backgroundColor: 'transparent',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  locationButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContainer: {
    paddingVertical: HEYWAY_SPACING.xl,
    paddingHorizontal: HEYWAY_SPACING.xl,
  },
  historyTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.lg,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  historyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HEYWAY_SPACING.sm,
  },
  historyTag: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    marginRight: HEYWAY_SPACING.sm,
    marginBottom: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  historyTagText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
  },
  loadingText: {
    marginTop: HEYWAY_SPACING.xl,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  loadingSubtext: {
    marginTop: HEYWAY_SPACING.sm,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.xxxxl,
  },
  emptyTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    marginTop: HEYWAY_SPACING.xl,
    marginBottom: HEYWAY_SPACING.md,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  emptyText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.large,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: HEYWAY_SPACING.xl,
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: 100,
  },
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.lg,
    marginVertical: HEYWAY_SPACING.xs,
    ...HEYWAY_SHADOWS.light.xs,
  },
  businessMainContent: {
    flex: 1,
  },
  businessActions: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.sm,
    marginLeft: HEYWAY_SPACING.lg,
  },
  businessName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  businessMeta: {
    gap: HEYWAY_SPACING.xs,
  },
  businessPhone: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  businessAddress: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.tertiary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  businessRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
  },
  ratingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  businessDistance: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.tertiary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: HEYWAY_RADIUS.xs,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    position: 'absolute',
    top: HEYWAY_SPACING.sm,
    right: HEYWAY_SPACING.sm,
    shadowColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    backgroundColor: HEYWAY_COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 140, 0, 0.2)',
    borderColor: '#FF8C00',
  },
});