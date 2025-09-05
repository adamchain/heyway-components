import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
} from 'react-native';
import { Menu, Settings, Search, Plus, X } from 'lucide-react-native';

// Import HEYWAY Style Guide
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS } from '../styles/HEYWAY_STYLE_GUIDE';

interface HomeMobileHeaderProps {
  onMenuPress: () => void;
  onSettingsPress: () => void;
  onNewCallPress?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeNavItem?: string;
}

const HomeMobileHeader: React.FC<HomeMobileHeaderProps> = ({
  onMenuPress,
  onSettingsPress,
  onNewCallPress,
  searchQuery = '',
  onSearchChange,
  activeNavItem = 'recents',
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchAnimation] = useState(new Animated.Value(0));

  const toggleSearch = () => {
    const toValue = isSearchExpanded ? 0 : 1;
    setIsSearchExpanded(!isSearchExpanded);
    
    Animated.spring(searchAnimation, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const closeSearch = () => {
    setIsSearchExpanded(false);
    Animated.spring(searchAnimation, {
      toValue: 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
    onSearchChange?.('');
  };

  if (isSearchExpanded) {
    return (
      <View style={styles.mobileHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={closeSearch}
          activeOpacity={0.7}
        >
          <X size={24} color={HEYWAY_COLORS.text.primary} />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={HEYWAY_COLORS.text.tertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeNavItem}...`}
              placeholderTextColor={HEYWAY_COLORS.text.tertiary}
              value={searchQuery}
              onChangeText={onSearchChange}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearchChange?.('')}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <X size={16} color={HEYWAY_COLORS.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileHeader}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        activeOpacity={0.7}
      >
        <Menu size={24} color={HEYWAY_COLORS.text.primary} />
      </TouchableOpacity>

      <View style={styles.mobileHeaderCenter}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.mobileHeaderLogo}
          resizeMode="contain"
        />
        <Text style={styles.mobileHeaderTitle}>Heyway</Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={toggleSearch}
          activeOpacity={0.7}
        >
          <Search size={22} color={HEYWAY_COLORS.text.secondary} />
        </TouchableOpacity>
        
        {onNewCallPress && (
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={onNewCallPress}
            activeOpacity={0.8}
          >
            <Plus size={20} color={HEYWAY_COLORS.text.inverse} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
    minHeight: 66,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: HEYWAY_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.secondary,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: HEYWAY_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  mobileHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
  },

  mobileHeaderLogo: {
    width: 32,
    height: 32,
    borderRadius: HEYWAY_RADIUS.md,
  },

  mobileHeaderTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
  },

  actionButton: {
    width: 44,
    height: 44,
    borderRadius: HEYWAY_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.secondary,
  },

  primaryActionButton: {
    width: 44,
    height: 44,
    borderRadius: HEYWAY_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.whatsappGreen,
    shadowColor: HEYWAY_COLORS.interactive.whatsappGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  searchContainer: {
    flex: 1,
    marginHorizontal: HEYWAY_SPACING.md,
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    paddingHorizontal: HEYWAY_SPACING.md,
    minHeight: 44,
  },

  searchIcon: {
    marginRight: HEYWAY_SPACING.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: HEYWAY_COLORS.text.primary,
    paddingVertical: HEYWAY_SPACING.sm,
  },

  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    marginLeft: HEYWAY_SPACING.sm,
  },

  mobileSettingsButton: {
    width: 44,
    height: 44,
    borderRadius: HEYWAY_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default HomeMobileHeader;
