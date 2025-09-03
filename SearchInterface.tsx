import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Search, Phone, User } from 'lucide-react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';

interface SearchInterfaceProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isNumberInput: boolean;
  showContactResults: boolean;
  filteredContacts: any[];
  onContactSelect: (contact: any) => void;
  onDirectCall: (number: string) => void;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  searchQuery,
  onSearchChange,
  isNumberInput,
  showContactResults,
  filteredContacts,
  onContactSelect,
  onDirectCall,
}) => {
  const renderContactResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.contactResult}
      onPress={() => onContactSelect(item)}
    >
      <View style={styles.contactResultContent}>
        <View style={styles.contactInfo}>
          <View style={styles.contactIcon}>
            <User size={20} color={COLORS.text.secondary} />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactPhone}>{item.phone}</Text>
          </View>
        </View>
        <View style={styles.callIconContainer}>
          <Phone size={16} color={COLORS.accent} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.bottomSearchContainer}>
      <View style={styles.searchInputContainer}>
        <View style={styles.searchIcon}>
          <Search size={20} color={COLORS.text.tertiary} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts or enter phone number..."
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor={COLORS.text.tertiary}
          keyboardType={isNumberInput ? 'phone-pad' : 'default'}
        />
        {isNumberInput && searchQuery.length >= 10 && (
          <TouchableOpacity
            style={styles.directCallButton}
            onPress={() => onDirectCall(searchQuery)}
          >
            <Phone size={18} color={COLORS.background.primary} />
          </TouchableOpacity>
        )}
      </View>

      {showContactResults && filteredContacts.length > 0 && (
        <View style={styles.contactResults}>
          <FlatList
            data={filteredContacts}
            renderItem={renderContactResult}
            keyExtractor={(item) => item.id?.toString() || item.phone}
            showsVerticalScrollIndicator={false}
            style={styles.contactResultsList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSearchContainer: {
    position: 'absolute',
    bottom: HEYWAY_SPACING.xxxl,
    left: HEYWAY_SPACING.xl,
    right: HEYWAY_SPACING.xl,
    zIndex: 999,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.input.lg,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  searchIcon: {
    marginRight: HEYWAY_SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    paddingVertical: 0,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  directCallButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    padding: HEYWAY_SPACING.sm,
    marginLeft: HEYWAY_SPACING.sm,
    ...HEYWAY_SHADOWS.light.sm,
  },
  contactResults: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    marginTop: HEYWAY_SPACING.sm,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  contactResultsList: {
    maxHeight: 200,
  },
  contactResult: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
  },
  contactResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: HEYWAY_RADIUS.component.avatar.lg,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HEYWAY_SPACING.md,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactPhone: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  callIconContainer: {
    padding: HEYWAY_SPACING.sm,
  },
});

export default SearchInterface;