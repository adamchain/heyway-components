import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  FlatList,
  Keyboard,
  Platform,
} from 'react-native';
import { ChevronDown, ChevronUp, Phone, X, User, Plus } from 'lucide-react-native';
import { useContacts } from '@/hooks/useContacts';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';

interface Contact {
  id: string;
  name: string;
  number: string;
}

interface StickyNewCallFormProps {
  onCallInitiated?: (recipients: string[], searchQuery: string) => void;
}

export default function StickyNewCallForm({ onCallInitiated }: StickyNewCallFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showResults, setShowResults] = useState(false);

  const contacts = useContacts();
  const animatedHeight = useRef(new Animated.Value(48)).current; // Collapsed height
  const searchInputRef = useRef<TextInput>(null);

  // Phone number validation regex
  const phoneRegex = /^[\+]?[\s\-\(\)]?[0-9\s\-\(\)]{10,}$/;

  useEffect(() => {
    if (searchQuery.trim()) {
      const isPhoneNumber = phoneRegex.test(searchQuery.replace(/\s/g, ''));

      if (isPhoneNumber) {
        // For phone numbers, don't show contact results
        setFilteredContacts([]);
      } else {
        // Filter contacts by name or number
        const filtered = contacts.contacts
          .filter(contact =>
            contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.number?.includes(searchQuery)
          )
          .slice(0, 10); // Limit to 10 results for performance

        setFilteredContacts(filtered);
      }
      setShowResults(true);
    } else {
      setFilteredContacts([]);
      setShowResults(false);
    }
  }, [searchQuery, contacts.contacts]);

  const toggleExpanded = () => {
    const toValue = isExpanded ? 48 : 220; // Collapsed: 48, Expanded: 220

    Animated.spring(animatedHeight, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();

    setIsExpanded(!isExpanded);

    // Focus search input when expanding
    if (!isExpanded) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      Keyboard.dismiss();
      setShowResults(false);
      setSearchQuery('');
    }
  };

  const addRecipient = (recipient: string, name?: string) => {
    if (!selectedRecipients.includes(recipient)) {
      setSelectedRecipients([...selectedRecipients, recipient]);
    }
    setSearchQuery('');
    setShowResults(false);
    setFilteredContacts([]);
  };

  const removeRecipient = (recipient: string) => {
    setSelectedRecipients(selectedRecipients.filter(r => r !== recipient));
  };

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      const isPhoneNumber = phoneRegex.test(trimmedQuery.replace(/\s/g, ''));
      if (isPhoneNumber) {
        addRecipient(trimmedQuery);
      }
    }
  };

  const handleCall = () => {
    if (selectedRecipients.length > 0) {
      onCallInitiated?.(selectedRecipients, searchQuery);
      // Reset form after call
      setSelectedRecipients([]);
      setSearchQuery('');
      setIsExpanded(false);
      Animated.spring(animatedHeight, {
        toValue: 48,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => addRecipient(item.number, item.name)}
      activeOpacity={0.7}
    >
      <View style={styles.contactAvatar}>
        <User size={16} color="#8E8E93" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.contactNumber} numberOfLines={1}>
          {item.number}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecipientChip = (recipient: string, index: number) => (
    <View key={index} style={styles.recipientChip}>
      <Text style={styles.recipientChipText} numberOfLines={1}>
        {recipient}
      </Text>
      <TouchableOpacity
        style={styles.removeChipButton}
        onPress={() => removeRecipient(recipient)}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      >
        <X size={14} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { height: animatedHeight }]}>
      {/* Expanded Content - Appears above header */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Add contacts or enter phone number"
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="done"
              keyboardType={phoneRegex.test(searchQuery.replace(/\s/g, '')) ? 'phone-pad' : 'default'}
            />
          </View>

          {/* Selected Recipients */}
          {selectedRecipients.length > 0 && (
            <View style={styles.recipientsContainer}>
              <Text style={styles.recipientsLabel}>To:</Text>
              <View style={styles.recipientsList}>
                {selectedRecipients.map(renderRecipientChip)}
              </View>
            </View>
          )}

          {/* Search Results */}
          {showResults && filteredContacts.length > 0 && (
            <View style={styles.resultsContainer}>
              <FlatList
                data={filteredContacts}
                renderItem={renderContactItem}
                keyExtractor={(item) => item.id}
                style={styles.resultsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {/* Call Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.callButton,
                selectedRecipients.length === 0 && styles.callButtonDisabled
              ]}
              onPress={handleCall}
              disabled={selectedRecipients.length === 0}
              activeOpacity={0.8}
            >
              <Phone size={18} color={selectedRecipients.length > 0 ? "#FFFFFF" : "#8E8E93"} />
              <Text style={[
                styles.callButtonText,
                selectedRecipients.length === 0 && styles.callButtonTextDisabled
              ]}>
                Start Call ({selectedRecipients.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header - Always at bottom */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.composeIcon}>
              <Plus size={16} color="#007AFF" />
            </View>
            <Text style={styles.headerTitle}>New Call</Text>
          </View>
          <View style={styles.headerRight}>
            {isExpanded ? (
              <ChevronDown size={20} color="#8E8E93" />
            ) : (
              <ChevronUp size={20} color="#8E8E93" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderTopWidth: 1,
    borderTopColor: HEYWAY_COLORS.border.primary,
    zIndex: 1000,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        ...HEYWAY_SHADOWS.light.lg,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  header: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: HEYWAY_SPACING.lg,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  composeIcon: {
    width: 24,
    height: 24,
    borderRadius: HEYWAY_RADIUS.component.avatar.sm,
    backgroundColor: HEYWAY_COLORS.interactive.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HEYWAY_SPACING.sm,
  },

  headerTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  headerRight: {
    padding: HEYWAY_SPACING.xs,
  },

  expandedContent: {
    flex: 1,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingBottom: HEYWAY_SPACING.md,
  },

  searchContainer: {
    marginBottom: HEYWAY_SPACING.md,
  },

  searchInput: {
    height: 36,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    borderRadius: HEYWAY_RADIUS.component.input.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  recipientsContainer: {
    marginBottom: HEYWAY_SPACING.md,
  },

  recipientsLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.tertiary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  recipientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HEYWAY_SPACING.sm,
  },

  recipientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    paddingLeft: HEYWAY_SPACING.md,
    paddingRight: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    maxWidth: 200,
    ...HEYWAY_SHADOWS.light.xs,
  },

  recipientChipText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.inverse,
    marginRight: HEYWAY_SPACING.xs,
    flex: 1,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  removeChipButton: {
    width: 20,
    height: 20,
    borderRadius: HEYWAY_RADIUS.component.button.sm,
    backgroundColor: HEYWAY_COLORS.background.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultsContainer: {
    flex: 1,
    maxHeight: 120,
    marginBottom: HEYWAY_SPACING.lg,
  },

  resultsList: {
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },

  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: HEYWAY_RADIUS.component.avatar.md,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HEYWAY_SPACING.md,
  },

  contactInfo: {
    flex: 1,
  },

  contactName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  contactNumber: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  actionContainer: {
    paddingTop: HEYWAY_SPACING.sm,
  },

  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.xxl,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.sm,
  },

  callButtonDisabled: {
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    opacity: 0.6,
  },

  callButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    marginLeft: HEYWAY_SPACING.sm,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  callButtonTextDisabled: {
    color: HEYWAY_COLORS.text.tertiary,
  },
});