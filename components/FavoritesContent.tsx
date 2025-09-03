import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { 
  Heart, 
  X, 
  Users, 
  Building, 
  Phone, 
  Star, 
  Trash2,
  ArrowLeft,
} from 'lucide-react-native';
import { useFavorites, FavoriteItem } from '@/hooks/useFavorites';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_TYPOGRAPHY, HEYWAY_SPACING } from '../styles/HEYWAY_STYLE_GUIDE';

interface FavoritesContentProps {
  onClose: () => void;
  onContactSelected?: (contact: FavoriteItem) => void;
  onAddToCallList?: (item: FavoriteItem) => void;
  filterType?: 'all' | 'contact' | 'business';
}

export default function FavoritesContent({ onClose, onContactSelected, onAddToCallList, filterType }: FavoritesContentProps) {
  const favorites = useFavorites();
  const [activeTab, setActiveTab] = useState<'all' | 'contacts' | 'businesses'>(
    filterType === 'contact' ? 'contacts' : 
    filterType === 'business' ? 'businesses' : 
    'all'
  );

  const getFilteredFavorites = () => {
    // If filterType is provided, use it directly
    if (filterType && filterType !== 'all') {
      return favorites.getFavoritesByType(filterType);
    }
    
    // Otherwise use tab-based filtering
    switch (activeTab) {
      case 'contacts':
        return favorites.getFavoritesByType('contact');
      case 'businesses':
        return favorites.getFavoritesByType('business');
      default:
        return favorites.favorites;
    }
  };

  const handleRemoveFavorite = async (item: FavoriteItem) => {
    Alert.alert(
      'Remove Favorite',
      `Remove "${item.name}" from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await favorites.removeFromFavorites(item.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove from favorites');
            }
          }
        }
      ]
    );
  };

  const handleContactSelect = (item: FavoriteItem) => {
    onContactSelected?.(item);
    onClose();
  };

  const handleAddToCallList = (item: FavoriteItem) => {
    onAddToCallList?.(item);
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity
      style={styles.favoriteItem}
      onPress={() => handleAddToCallList(item)}
      activeOpacity={0.7}
    >
      <View style={styles.favoriteIcon}>
        {item.type === 'contact' ? (
          <Users size={20} color={HEYWAY_COLORS.text.primary} />
        ) : (
          <Building size={20} color={HEYWAY_COLORS.text.primary} />
        )}
      </View>
      
      <View style={styles.favoriteContent}>
        <Text style={styles.favoriteName}>{item.name}</Text>
        <Text style={styles.favoritePhone}>{item.phoneNumber}</Text>
        {item.address && (
          <Text style={styles.favoriteAddress} numberOfLines={1}>
            {item.address}
          </Text>
        )}
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Star size={12} color={HEYWAY_COLORS.text.primary} fill={HEYWAY_COLORS.text.primary} />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      <View style={styles.favoriteActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            console.log('Call:', item.phoneNumber);
          }}
        >
          <Phone size={16} color={HEYWAY_COLORS.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={(e) => {
            e.stopPropagation();
            handleRemoveFavorite(item);
          }}
        >
          <Trash2 size={16} color={HEYWAY_COLORS.status.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Heart size={48} color={HEYWAY_COLORS.text.tertiary} />
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyText}>
        {activeTab === 'contacts' 
          ? 'Add contacts to favorites from your contact list'
          : activeTab === 'businesses'
          ? 'Add businesses to favorites from search results'
          : 'Add contacts and businesses to your favorites for quick access'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            activeOpacity={0.6}
          >
            <ArrowLeft size={20} color={HEYWAY_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.sectionHeader}>Favorites</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {(['all', 'contacts', 'businesses'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'all' ? 'All' : tab === 'contacts' ? 'Contacts' : 'Businesses'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {favorites.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
              <Text style={styles.loadingText}>Loading favorites...</Text>
            </View>
          ) : getFilteredFavorites().length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={getFilteredFavorites()}
              renderItem={renderFavoriteItem}
              keyExtractor={(item) => item.id}
              style={styles.favoritesList}
              contentContainerStyle={styles.favoritesContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  safeArea: {
    flex: 1,
  },

  // Header Container
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    marginBottom: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
  },

  // Section Header - Enhanced typography
  sectionHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.3,
    flex: 1,
    textAlign: 'center',
  },

  headerSpacer: {
    width: 56, // Same as back button width + margin to center title
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.xl,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.dark.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderRadius: HEYWAY_RADIUS.lg,
  },
  activeTab: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    shadowColor: HEYWAY_COLORS.interactive.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: 0.1,
  },
  activeTabText: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 17,
    color: HEYWAY_COLORS.text.primary,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: HEYWAY_COLORS.text.primary,
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  emptyText: {
    fontSize: 15,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  favoritesList: {
    flex: 1,
  },
  favoritesContent: {
    paddingBottom: 100,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    borderRadius: HEYWAY_RADIUS.xl,
    padding: 18,
    marginVertical: 6,
    ...HEYWAY_SHADOWS.dark.sm,
  },
  favoriteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    ...HEYWAY_SHADOWS.dark.sm,
  },
  favoriteContent: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 17,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  favoritePhone: {
    fontSize: 15,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  favoriteAddress: {
    fontSize: 13,
    color: HEYWAY_COLORS.text.tertiary,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: {
    fontSize: 13,
    color: HEYWAY_COLORS.text.primary,
    marginLeft: 6,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  favoriteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.dark.sm,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    shadowColor: HEYWAY_COLORS.status.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
});