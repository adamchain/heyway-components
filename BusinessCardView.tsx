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

// Lazy load FavoritesContent for business favorites
const FavoritesContent = React.lazy(() => import('@/components/FavoritesContent'));

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
    backgroundColor: IOS_COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },

  loadingText: {
    fontSize: 16,
    color: IOS_COLORS.text.secondary,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: IOS_COLORS.text.primary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },

  subtitle: {
    fontSize: 14,
    color: IOS_COLORS.text.secondary,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  businessCard: {
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  businessCardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  businessInfo: {
    flex: 1,
    gap: 8,
  },

  businessHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  businessIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,122,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  businessDetails: {
    flex: 1,
  },

  businessName: {
    fontSize: 17,
    fontWeight: '600',
    color: IOS_COLORS.text.primary,
    marginBottom: 4,
  },

  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  ratingText: {
    fontSize: 13,
    color: IOS_COLORS.text.secondary,
    fontWeight: '500',
  },

  priceLevel: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '600',
  },

  distance: {
    fontSize: 13,
    color: IOS_COLORS.text.secondary,
  },

  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 52,
  },

  businessAddress: {
    fontSize: 14,
    color: IOS_COLORS.text.secondary,
    lineHeight: 18,
    flex: 1,
  },

  businessPhone: {
    fontSize: 15,
    color: IOS_COLORS.accent,
    fontWeight: '500',
    paddingLeft: 52,
  },

  businessActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },

  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  selectButtonActive: {
    backgroundColor: IOS_COLORS.accent,
    borderColor: IOS_COLORS.accent,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: IOS_COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 15,
    color: IOS_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});