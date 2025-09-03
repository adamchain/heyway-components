import React, { useState, useEffect, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Phone, Star, ExternalLink, MapPin, Plus, Check, Building } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { apiService } from '@/services/apiService';
import { useFavorites } from '@/hooks/useFavorites';
import { ContactSelectionManager } from '@/utils/contactSelection';
import * as Location from 'expo-location';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';

// Lazy load FavoritesContent for business favorites
const FavoritesContent = React.lazy(() => import('@/components/FavoritesContent'));


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

interface BusinessCardViewProps {
  activeSection: string;
  searchQuery: string;
  locationQuery: string;
  onAddToCallList?: (business: BusinessResult) => void;
  isLoading: boolean;
  onSearchComplete: () => void;
}

export default function BusinessCardView({ 
  activeSection, 
  searchQuery, 
  locationQuery, 
  onAddToCallList, 
  isLoading,
  onSearchComplete
}: BusinessCardViewProps) {
  const [results, setResults] = useState<BusinessResult[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const favorites = useFavorites();

  useEffect(() => {
    loadSelectedContacts();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (activeSection === 'search' && searchQuery.trim() && currentLocation && !isLoading) {
      handleSearch();
    }
  }, [searchQuery, locationQuery, currentLocation, activeSection]);

  const handleHapticFeedback = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const loadSelectedContacts = async () => {
    try {
      const selected = await ContactSelectionManager.loadSelectedContacts();
      setSelectedContacts(selected);
    } catch (error) {
      console.error('Failed to load selected contacts:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });
    } catch (error) {
      console.warn('Failed to get current location:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || isLoading) return;

    try {
      setSearchExecuted(true);
      
      const searchParams = {
        query: searchQuery.trim(),
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
      } else {
        setResults([]);
      }
      
      onSearchComplete();
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      onSearchComplete();
    }
  };

  const toggleBusinessSelection = async (business: BusinessResult) => {
    try {
      handleHapticFeedback();
      const phoneNumber = business.phoneNumber;
      const isCurrentlySelected = selectedContacts.includes(phoneNumber);
      let newSelected: string[];

      if (isCurrentlySelected) {
        newSelected = selectedContacts.filter(phone => phone !== phoneNumber);
      } else {
        newSelected = [...selectedContacts, phoneNumber];
      }

      setSelectedContacts(newSelected);
      await ContactSelectionManager.saveSelectedContacts(newSelected);

      if (onAddToCallList && !isCurrentlySelected) {
        onAddToCallList(business);
      }
    } catch (error) {
      console.error('Error toggling business selection:', error);
    }
  };

  const toggleFavorite = async (business: BusinessResult) => {
    try {
      handleHapticFeedback();
      const existingFavorite = favorites.favorites.find(fav => 
        fav.phoneNumber === business.phoneNumber && fav.type === 'business'
      );
      
      if (existingFavorite) {
        await favorites.removeFromFavorites(existingFavorite.id);
      } else {
        await favorites.addToFavorites({
          name: business.name,
          phoneNumber: business.phoneNumber,
          type: 'business' as const,
          address: business.address,
          rating: business.rating,
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const openWebsite = (website: string) => {
    if (website) {
      Linking.openURL(website);
    }
  };

  const renderPriceLevel = (level?: number) => {
    if (!level) return null;
    return '$'.repeat(level);
  };

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <View style={styles.ratingContainer}>
        <Star size={14} color="#FFD700" fill="#FFD700" />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderBusinessCard = ({ item: business }: { item: BusinessResult }) => {
    const isSelected = selectedContacts.includes(business.phoneNumber);
    const isFavorite = favorites.favorites.some(fav => 
      fav.phoneNumber === business.phoneNumber && fav.type === 'business'
    );

    return (
      <View style={styles.businessCard}>
        <View style={styles.businessCardContent}>
          {/* Business Info */}
          <View style={styles.businessInfo}>
            <View style={styles.businessHeader}>
              <View style={styles.businessIcon}>
                <Building size={20} color={IOS_COLORS.accent} />
              </View>
              <View style={styles.businessDetails}>
                <Text style={styles.businessName} numberOfLines={1}>
                  {business.name}
                </Text>
                <View style={styles.businessMeta}>
                  {renderRating(business.rating)}
                  {business.priceLevel && (
                    <Text style={styles.priceLevel}>
                      {renderPriceLevel(business.priceLevel)}
                    </Text>
                  )}
                  {business.distance && (
                    <Text style={styles.distance}>{business.distance}</Text>
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.addressContainer}>
              <MapPin size={14} color={IOS_COLORS.text.secondary} />
              <Text style={styles.businessAddress} numberOfLines={2}>
                {business.address}
              </Text>
            </View>
            
            <Text style={styles.businessPhone}>
              {business.phoneNumber}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.businessActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleFavorite(business)}
              activeOpacity={0.7}
            >
              <Star
                size={16}
                color={isFavorite ? '#FFD700' : IOS_COLORS.text.secondary}
                fill={isFavorite ? '#FFD700' : 'none'}
              />
            </TouchableOpacity>

            {business.website && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openWebsite(business.website!)}
                activeOpacity={0.7}
              >
                <ExternalLink size={16} color={IOS_COLORS.text.secondary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {/* Handle direct call */}}
              activeOpacity={0.7}
            >
              <Phone size={16} color={IOS_COLORS.accent} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.selectButton,
                isSelected && styles.selectButtonActive
              ]}
              onPress={() => toggleBusinessSelection(business)}
              activeOpacity={0.7}
            >
              {isSelected ? (
                <Check size={14} color="#FFFFFF" />
              ) : (
                <Plus size={14} color={IOS_COLORS.text.secondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // If favorites section is active, show the FavoritesContent component filtered for businesses
  if (activeSection === 'favorites') {
    return (
      <View style={styles.container}>
        <Suspense fallback={
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={IOS_COLORS.accent} />
            <Text style={styles.loadingText}>Loading favorites...</Text>
          </View>
        }>
          <FavoritesContent
            onClose={() => {}} // No close action needed in embedded mode
            onContactSelected={onAddToCallList ? (contact) => {
              // Convert contact to business format for consistency
              const businessContact = {
                id: contact.id || contact.phoneNumber,
                name: contact.name,
                phoneNumber: contact.phoneNumber,
                address: contact.address || '',
                rating: contact.rating,
              };
              onAddToCallList(businessContact);
            } : () => {}}
            onAddToCallList={onAddToCallList ? (contact) => {
              // Convert contact to business format for consistency
              const businessContact = {
                id: contact.id || contact.phoneNumber,
                name: contact.name,
                phoneNumber: contact.phoneNumber,
                address: contact.address || '',
                rating: contact.rating,
              };
              onAddToCallList(businessContact);
            } : () => {}}
            filterType="business" // Only show business favorites
          />
        </Suspense>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={IOS_COLORS.accent} />
        <Text style={styles.loadingText}>Searching businesses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search Results</Text>
        <Text style={styles.subtitle}>
          {results.length} business{results.length !== 1 ? 'es' : ''} found
        </Text>
      </View>

      {/* Results List */}
      <FlatList
        data={results}
        renderItem={renderBusinessCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Building size={48} color={IOS_COLORS.text.tertiary} />
            <Text style={styles.emptyTitle}>
              {searchExecuted ? 'No Results Found' : 'Ready to Search'}
            </Text>
            <Text style={styles.emptyText}>
              {searchExecuted 
                ? 'Try adjusting your search terms or location'
                : 'Enter a business name or type to get started'
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.whatsappPanel,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: HEYWAY_SPACING.lg,
  },

  loadingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  header: {
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingTop: HEYWAY_SPACING.xl,
    paddingBottom: HEYWAY_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.tertiary,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },

  title: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },

  subtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  listContent: {
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingBottom: HEYWAY_SPACING.xl,
  },

  businessCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    marginBottom: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },

  businessCardContent: {
    padding: HEYWAY_SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  businessInfo: {
    flex: 1,
    gap: HEYWAY_SPACING.sm,
  },

  businessHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: HEYWAY_SPACING.md,
  },

  businessIcon: {
    width: 40,
    height: 40,
    borderRadius: HEYWAY_RADIUS.xl,
    backgroundColor: HEYWAY_COLORS.interactive.selected,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.light.xs,
  },

  businessDetails: {
    flex: 1,
  },

  businessName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },

  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.xs,
  },

  ratingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  priceLevel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.status.success,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  distance: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: HEYWAY_SPACING.sm,
    paddingLeft: 52,
  },

  businessAddress: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 18,
    flex: 1,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  businessPhone: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.interactive.primary,
    paddingLeft: 52,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  businessActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
    marginLeft: HEYWAY_SPACING.md,
  },

  actionButton: {
    width: 32,
    height: 32,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    backgroundColor: HEYWAY_COLORS.interactive.hover,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.light.xs,
  },

  selectButton: {
    width: 32,
    height: 32,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    backgroundColor: HEYWAY_COLORS.interactive.hover,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
  },

  selectButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.xxxxl * 2,
    paddingHorizontal: HEYWAY_SPACING.xxxxl,
  },

  emptyTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginTop: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.sm,
    textAlign: 'center',
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
});