import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Alert,
  Animated,
} from 'react-native';
import { X, Search, Check, Plus, Users, CheckCircle } from 'lucide-react-native';
import { apiService, Contact } from '../services/apiService';
import { ContactSelectionManager } from '../utils/contactSelection';
import { 
  HEYWAY_COLORS, 
  HEYWAY_RADIUS, 
  HEYWAY_SHADOWS, 
  HEYWAY_TYPOGRAPHY, 
  HEYWAY_SPACING 
} from '../styles/HEYWAY_STYLE_GUIDE';

interface ContactSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onContactsSelected: (selectedContacts: Contact[]) => void;
  initialSelectedContacts?: string[]; // phone numbers
  title?: string;
  allowMultiSelect?: boolean;
  maxSelections?: number;
}

export default function ContactSelectorModal({
  visible,
  onClose,
  onContactsSelected,
  initialSelectedContacts = [],
  title = "Select Contacts",
  allowMultiSelect = true,
  maxSelections,
}: ContactSelectorModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>(initialSelectedContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation refs
  const modalAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(modalAnim, {
          toValue: 1,
          tension: 280,
          friction: 30,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 280,
          friction: 30,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, modalAnim, scaleAnim]);

  // Load contacts when modal opens
  useEffect(() => {
    if (visible) {
      loadContacts();
    }
  }, [visible]);

  // Filter contacts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.phoneNumber.includes(query) ||
        (contact.email && contact.email.toLowerCase().includes(query))
      );
      setFilteredContacts(filtered);
    }
  }, [contacts, searchQuery]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const contactsData = await apiService.getContacts();
      
      // Deduplicate contacts if needed and ensure name is present
      const deduplicatedContacts = ContactSelectionManager.deduplicateContactsByNameAndPhone(
        contactsData
      ).filter(contact => contact.name); // Filter out contacts without names
      
      setContacts(deduplicatedContacts as Contact[]);
    } catch (err) {
      console.error('Failed to load contacts:', err);
      setError('Failed to load contacts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContactSelection = useCallback((contact: Contact) => {
    const phoneNumber = contact.phoneNumber;
    const isCurrentlySelected = selectedContacts.includes(phoneNumber);

    if (!allowMultiSelect && !isCurrentlySelected) {
      // Single select mode - replace selection
      setSelectedContacts([phoneNumber]);
      return;
    }

    if (allowMultiSelect) {
      let newSelected: string[];
      
      if (isCurrentlySelected) {
        // Remove from selection
        newSelected = selectedContacts.filter(phone => phone !== phoneNumber);
      } else {
        // Add to selection (check max limit)
        if (maxSelections && selectedContacts.length >= maxSelections) {
          Alert.alert(
            'Selection Limit Reached',
            `You can only select up to ${maxSelections} contact${maxSelections > 1 ? 's' : ''}.`
          );
          return;
        }
        newSelected = [...selectedContacts, phoneNumber];
      }
      
      setSelectedContacts(newSelected);
    }
  }, [selectedContacts, allowMultiSelect, maxSelections]);

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      // Deselect all
      setSelectedContacts([]);
    } else {
      // Select all (respect max limit)
      let contactsToSelect = filteredContacts.map(c => c.phoneNumber);
      if (maxSelections && contactsToSelect.length > maxSelections) {
        contactsToSelect = contactsToSelect.slice(0, maxSelections);
        Alert.alert(
          'Selection Limit',
          `Only the first ${maxSelections} contact${maxSelections > 1 ? 's' : ''} will be selected due to the limit.`
        );
      }
      setSelectedContacts(contactsToSelect);
    }
  };

  const handleConfirm = async () => {
    try {
      // Get the full contact objects for the selected phone numbers
      const selectedContactObjects = contacts.filter(contact =>
        selectedContacts.includes(contact.phoneNumber)
      );

      // Save selection state for persistence
      await ContactSelectionManager.saveSelectedContacts(selectedContacts);

      // Call the callback with selected contacts
      onContactsSelected(selectedContactObjects);
      onClose();
    } catch (error) {
      console.error('Error confirming selection:', error);
      Alert.alert('Error', 'Failed to process selected contacts. Please try again.');
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.includes(item.phoneNumber);
    
    return (
      <TouchableOpacity
        style={[
          styles.contactItem,
          isSelected && styles.contactItemSelected
        ]}
        onPress={() => toggleContactSelection(item)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
      >
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
          {item.email && (
            <Text style={styles.contactEmail}>{item.email}</Text>
          )}
        </View>
        <View style={styles.selectionIndicator}>
          {isSelected ? (
            <View style={styles.selectedCheckbox}>
              <Check size={14} color={HEYWAY_COLORS.text.inverse} />
            </View>
          ) : (
            <View style={styles.unselectedCheckbox}>
              <Plus size={14} color={HEYWAY_COLORS.text.tertiary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Users size={48} color={HEYWAY_COLORS.text.tertiary} />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No contacts found' : 'No contacts available'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery 
          ? 'Try adjusting your search terms'
          : 'Add contacts to your address book to get started'
        }
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: modalAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>{title}</Text>
                {selectedContacts.length > 0 && (
                  <Text style={styles.selectionCount}>
                    {selectedContacts.length} selected
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color={HEYWAY_COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Search size={16} color={HEYWAY_COLORS.text.tertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search contacts..."
                placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            {/* Actions */}
            {allowMultiSelect && filteredContacts.length > 0 && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  onPress={handleSelectAll}
                  style={styles.selectAllButton}
                >
                  <CheckCircle 
                    size={16} 
                    color={selectedContacts.length === filteredContacts.length 
                      ? HEYWAY_COLORS.interactive.primary 
                      : HEYWAY_COLORS.text.tertiary
                    } 
                  />
                  <Text style={[
                    styles.selectAllText,
                    selectedContacts.length === filteredContacts.length && styles.selectAllTextActive
                  ]}>
                    {selectedContacts.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Contact List */}
            <View style={styles.contactsContainer}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
                  <Text style={styles.loadingText}>Loading contacts...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>Error</Text>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={loadContacts}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : filteredContacts.length === 0 ? (
                renderEmptyState()
              ) : (
                <FlatList
                  data={filteredContacts}
                  renderItem={renderContactItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.contactsList}
                />
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  selectedContacts.length === 0 && styles.confirmButtonDisabled
                ]}
                onPress={handleConfirm}
                disabled={selectedContacts.length === 0}
              >
                <Text style={[
                  styles.confirmButtonText,
                  selectedContacts.length === 0 && styles.confirmButtonTextDisabled
                ]}>
                  Add {selectedContacts.length > 0 ? `(${selectedContacts.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.lg,
  },
  modalContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    ...HEYWAY_SHADOWS.lg,
  },
  modalContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 2,
  },
  selectionCount: {
    fontSize: 13,
    color: HEYWAY_COLORS.text.secondary,
  },
  closeButton: {
    padding: HEYWAY_SPACING.xs,
    borderRadius: HEYWAY_RADIUS.sm,
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    marginHorizontal: HEYWAY_SPACING.lg,
    marginVertical: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: HEYWAY_COLORS.text.primary,
  },
  actionsContainer: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingBottom: HEYWAY_SPACING.sm,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.xs,
    paddingVertical: HEYWAY_SPACING.xs,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
  },
  selectAllTextActive: {
    color: HEYWAY_COLORS.interactive.primary,
  },
  contactsContainer: {
    flex: 1,
  },
  contactsList: {
    paddingHorizontal: HEYWAY_SPACING.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.md,
    marginBottom: HEYWAY_SPACING.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  contactItemSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#007AFF',
    borderLeftWidth: 4,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: 1,
  },
  contactEmail: {
    fontSize: 13,
    color: HEYWAY_COLORS.text.tertiary,
  },
  selectionIndicator: {
    marginLeft: HEYWAY_SPACING.md,
  },
  selectedCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HEYWAY_COLORS.border.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.xl,
  },
  loadingText: {
    marginTop: HEYWAY_SPACING.md,
    fontSize: 16,
    color: HEYWAY_COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.xl,
    paddingHorizontal: HEYWAY_SPACING.lg,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HEYWAY_COLORS.status.error,
    marginBottom: HEYWAY_SPACING.sm,
  },
  errorText: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: HEYWAY_SPACING.lg,
  },
  retryButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.md,
  },
  retryButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.xl,
    paddingHorizontal: HEYWAY_SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    marginTop: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.sm,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: HEYWAY_COLORS.border.primary,
    gap: HEYWAY_SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    borderRadius: HEYWAY_RADIUS.md,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    alignItems: 'center',
    ...HEYWAY_SHADOWS.sm,
  },
  confirmButtonDisabled: {
    backgroundColor: HEYWAY_COLORS.background.tertiary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.inverse,
  },
  confirmButtonTextDisabled: {
    color: HEYWAY_COLORS.text.tertiary,
  },
});