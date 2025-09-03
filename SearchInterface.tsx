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
import { COLORS, RADIUS, SHADOWS } from '@/components/designSystem';

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
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    ...SHADOWS.sm,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    paddingVertical: 0,
  },
  directCallButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: 8,
    marginLeft: 8,
  },
  contactResults: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: RADIUS.lg,
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    ...SHADOWS.sm,
  },
  contactResultsList: {
    maxHeight: 200,
  },
  contactResult: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.secondary,
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
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  callIconContainer: {
    padding: 8,
  },
});

export default SearchInterface;