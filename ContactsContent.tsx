import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Plus, Check, Users, Upload, X, Heart, Phone, Star } from 'lucide-react-native';
import CSVImportModal from '@/components/CSVImportModal';
import { ContactSelectionManager } from '@/utils/contactSelection';
import { apiService } from '@/services/apiService';
import { useFavorites } from '@/hooks/useFavorites';

interface ContactsContentProps {
  onContactsSelected: () => void;
  onDone: () => void;
  onAddToCallList?: (contact: any) => void;
}

export default function ContactsContent({ onContactsSelected, onDone, onAddToCallList }: ContactsContentProps) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncingContacts, setSyncingContacts] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phoneNumber: '', email: '' });
  
  // Favorites hook
  const favorites = useFavorites();

  useEffect(() => {
    loadContacts();
    loadSelectedContacts();
  }, []);

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumber.includes(searchQuery)
    );
    setFilteredContacts(filtered);
  }, [contacts, searchQuery]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedContacts = await apiService.getContacts(3000);
      const dedupedContacts = ContactSelectionManager.deduplicateContactsByNameAndPhone(loadedContacts).slice(0, 3000);
      setContacts(dedupedContacts);
    } catch (error) {
      setError('Failed to load contacts. Please try again.');
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSelectedContacts = async () => {
    try {
      const selected = await ContactSelectionManager.loadSelectedContacts();
      setSelectedContacts(selected);
    } catch (error) { }
  };

  const toggleContactSelection = async (contact: any) => {
    try {
      if (!contact.id) {
        Alert.alert('Error', 'This contact cannot be selected due to missing ID');
        return;
      }
      const phoneNumber = contact.phoneNumber;
      const isCurrentlySelected = selectedContacts.includes(phoneNumber);
      let newSelected: string[];
      if (isCurrentlySelected) {
        newSelected = selectedContacts.filter(phone => phone !== phoneNumber);
      } else {
        newSelected = [...selectedContacts, phoneNumber];
      }
      setSelectedContacts(newSelected);
      await ContactSelectionManager.saveSelectedContacts(newSelected);
      try {
        await apiService.updateContact(contact.id, { selected: !isCurrentlySelected });
      } catch { }
      onContactsSelected();
    } catch {
      Alert.alert('Error', 'Failed to update contact selection');
    }
  };

  const addContact = () => setShowAddModal(true);

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phoneNumber.trim()) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }
    try {
      setIsLoading(true);
      await apiService.createContact({
        name: newContact.name.trim(),
        phoneNumber: newContact.phoneNumber.trim(),
        email: newContact.email.trim() || undefined,
        selected: false,
      });
      await loadContacts();
      setNewContact({ name: '', phoneNumber: '', email: '' });
      setShowAddModal(false);
      Alert.alert('Success', 'Contact added successfully');
    } catch (error: any) {
      setIsLoading(false);
      if (error?.response?.status === 409) {
        Alert.alert('Duplicate', 'A contact with this phone number already exists.');
      } else {
        Alert.alert('Error', 'Failed to add contact. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const syncDeviceContacts = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Contact sync is not available on web platform');
      return;
    }

    try {
      setSyncingContacts(true);
      setError(null);

      // Import expo-contacts dynamically
      const Contacts = require('expo-contacts');

      // Request permissions
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Contact access is required to sync your contacts. Please enable contacts permission in your device settings.',
          [{ text: 'OK', onPress: () => setSyncingContacts(false) }]
        );
        return;
      }

      console.log('📱 Reading device contacts...');

      // Get device contacts
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      console.log(`📱 Found ${data.length} device contacts`);

      // Transform to API format and filter out contacts without names or phone numbers
      const contactsToSync = data
        .map((contact: any) => {
          const phoneNumber = contact.phoneNumbers?.[0]?.number || '';
          const name = contact.name || contact.firstName || 'Unknown';

          return {
            name: name.trim(),
            phoneNumber: phoneNumber.replace(/[^\d+]/g, ''), // Remove formatting
            email: contact.emails?.[0]?.email || undefined
          };
        })
        .filter((contact: any) =>
          contact.name &&
          contact.name !== 'Unknown' &&
          contact.phoneNumber &&
          contact.phoneNumber.length >= 10 // Valid phone number
        );

      console.log(`📱 Prepared ${contactsToSync.length} contacts for sync`);

      if (contactsToSync.length === 0) {
        setSyncingContacts(false);
        Alert.alert('No Contacts Found', 'No valid contacts with both names and phone numbers were found on your device.');
        return;
      }

      // Send to API in batches to avoid timeouts
      const batchSize = 50;
      let totalImported = 0;
      let totalUpdated = 0;
      let totalErrors = 0;

      for (let i = 0; i < contactsToSync.length; i += batchSize) {
        const batch = contactsToSync.slice(i, i + batchSize);
        console.log(`📱 Syncing batch ${Math.floor(i / batchSize) + 1} (${batch.length} contacts)`);

        try {
          const result = await apiService.syncDeviceContacts(batch);
          totalImported += result.imported || 0;
          totalUpdated += result.updated || 0;
          totalErrors += result.errors?.length || 0;
        } catch (batchError) {
          console.error('Batch sync error:', batchError);
          totalErrors += batch.length;
        }
      }

      setSyncingContacts(false);

      // Show success message
      const message = `Sync completed!\n• ${totalImported} new contacts imported\n• ${totalUpdated} contacts updated${totalErrors > 0 ? `\n• ${totalErrors} errors occurred` : ''}`;
      Alert.alert('Sync Complete', message);

      // Reload contacts to show synced data
      await loadContacts();

    } catch (error) {
      console.error('Contact sync error:', error);
      setError('Failed to sync contacts. Please try again.');

      let errorMessage = 'Failed to sync contacts from your device';
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = 'Contact permission was denied. Please enable it in device settings.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }

      Alert.alert('Sync Error', errorMessage);
      setSyncingContacts(false);
    }
  };

  const importCSV = async () => {
    setShowCSVModal(true);
  };

  const handleAddToCallList = (contact: any) => {
    onAddToCallList?.(contact);
  };

  const handleToggleFavorite = async (contact: any) => {
    try {
      const isFavorite = favorites.isFavorite(contact.phoneNumber, 'contact');
      
      if (isFavorite) {
        // Find the favorite item and remove it
        const favoriteItem = favorites.favorites.find(fav => 
          fav.phoneNumber === contact.phoneNumber && fav.type === 'contact'
        );
        if (favoriteItem) {
          await favorites.removeFromFavorites(favoriteItem.id);
        }
      } else {
        // Add to favorites
        await favorites.addToFavorites({
          name: contact.name,
          phoneNumber: contact.phoneNumber,
          type: 'contact',
        });
      }
    } catch (error) {
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to update favorites'
      );
    }
  };

  const renderContact = ({ item }: { item: any }) => {
    const isSelected = selectedContacts.includes(item.phoneNumber);
    const isFavorite = favorites.isFavorite(item.phoneNumber, 'contact');
    const orangeColor = '#FF8C00'; // Orange color for favorites
    
    return (
      <TouchableOpacity 
        style={[styles.contactItem, isSelected && styles.contactItemSelected]}
        onPress={() => handleAddToCallList(item)}
        activeOpacity={0.7}
      >
        <View style={styles.contactMainContent}>
          <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.contactMeta}>
            <Text style={styles.contactPhone} numberOfLines={1}>{item.phoneNumber}</Text>
            {isSelected && <View style={styles.selectedDot} />}
          </View>
        </View>
        
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              if (!item.id) {
                Alert.alert('Error', 'This contact cannot be selected due to missing ID');
                return;
              }
              toggleContactSelection(item);
            }}
          >
            <Check size={16} color={HEYWAY_COLORS.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, isFavorite && styles.favoriteButton]}
            onPress={(e) => {
              e.stopPropagation();
              handleToggleFavorite(item);
            }}
          >
            <Star 
              size={16} 
              color={isFavorite ? orangeColor : HEYWAY_COLORS.text.primary}
              fill={isFavorite ? orangeColor : 'none'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Users size={48} color={HEYWAY_COLORS.text.tertiary} />
      <Text style={styles.emptyTitle}>No Contacts</Text>
      <Text style={styles.emptyText}>
        Add contacts manually, sync from your device, or import a CSV file to get started
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={addContact}>
        <Text style={styles.emptyButtonText}>Add Contact</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Enhanced Background with Gradient */}
      <LinearGradient
        colors={[HEYWAY_COLORS.background.primary, HEYWAY_COLORS.background.secondary]}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header - Modal Style */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onDone} style={styles.headerButton}>
            <X size={24} color={HEYWAY_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contacts</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={addContact}>
              <Plus size={16} color={HEYWAY_COLORS.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={syncDeviceContacts} disabled={syncingContacts}>
              {syncingContacts ? (
                <ActivityIndicator size="small" color={HEYWAY_COLORS.text.primary} />
              ) : (
                <Users size={16} color={HEYWAY_COLORS.text.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={importCSV} disabled={isLoading}>
              <Upload size={16} color={HEYWAY_COLORS.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={HEYWAY_COLORS.text.tertiary}
            />
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadContacts}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List Container */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
              <Text style={styles.loadingText}>Loading contacts...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              renderItem={renderContact}
              keyExtractor={(item, index) => item.id || item.phoneNumber || `contact-${index}`}
              style={styles.contactsList}
              contentContainerStyle={styles.contactsListContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyState}
              refreshing={isLoading}
              onRefresh={loadContacts}
            />
          )}
        </View>
      </SafeAreaView>

      {/* Add Contact Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalBackdrop}>
          <View style={styles.addModalCard}>
            <Text style={styles.addModalTitle}>Add Contact</Text>
            <Text style={styles.addModalLabel}>Name</Text>
            <TextInput
              style={styles.addModalInput}
              placeholder="Enter name"
              value={newContact.name}
              onChangeText={text => setNewContact(prev => ({ ...prev, name: text }))}
              placeholderTextColor={HEYWAY_COLORS.text.tertiary}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <Text style={styles.addModalLabel}>Contact</Text>
            <TextInput
              style={styles.addModalInput}
              placeholder="Enter phone number"
              value={newContact.phoneNumber}
              onChangeText={text => setNewContact(prev => ({ ...prev, phoneNumber: text }))}
              keyboardType="phone-pad"
              placeholderTextColor={HEYWAY_COLORS.text.tertiary}
              returnKeyType="next"
            />
            <Text style={styles.addModalLabel}>Email (optional)</Text>
            <TextInput
              style={[styles.addModalInput, { marginBottom: 24 }]}
              placeholder="Enter email (optional)"
              value={newContact.email}
              onChangeText={text => setNewContact(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              placeholderTextColor={HEYWAY_COLORS.text.tertiary}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[
                styles.addModalButton,
                {
                  backgroundColor:
                    newContact.name.trim() && newContact.phoneNumber.trim() && !isLoading
                      ? HEYWAY_COLORS.interactive.primary
                      : HEYWAY_COLORS.background.tertiary,
                },
              ]}
              onPress={handleAddContact}
              disabled={!newContact.name.trim() || !newContact.phoneNumber.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addModalButtonText}>Add</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addModalCancel}
              onPress={() => setShowAddModal(false)}
              disabled={isLoading}
            >
              <Text style={styles.addModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* CSV Import Modal */}
      <CSVImportModal
        visible={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onImportComplete={loadContacts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    marginTop: HEYWAY_SPACING.xxl,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },
  headerTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  headerActions: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.light.md,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginHorizontal: HEYWAY_SPACING.xl,
    marginBottom: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: HEYWAY_RADIUS.lg,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    paddingVertical: HEYWAY_SPACING.xl,
    paddingHorizontal: HEYWAY_SPACING.xxxl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    gap: HEYWAY_SPACING.sm,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.large,
    ...HEYWAY_SHADOWS.light.md,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  searchContainer: {
    marginVertical: HEYWAY_SPACING.lg,
  },
  searchInput: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.input.xl,
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.light.md,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.md,
    marginHorizontal: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.error,
  },
  errorText: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.status.error,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  retryButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    paddingHorizontal: HEYWAY_SPACING.md,
  },
  retryButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  listContainer: {
    flex: 1,
    marginHorizontal: HEYWAY_SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.xxxxl,
  },
  loadingText: {
    marginTop: HEYWAY_SPACING.lg,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactsList: {
    flex: 1,
  },
  contactsListContent: {
    paddingBottom: HEYWAY_SPACING.xl,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.xl,
    marginHorizontal: HEYWAY_SPACING.lg,
    marginVertical: HEYWAY_SPACING.xs,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  contactMainContent: {
    flex: 1,
  },
  contactActions: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.sm,
    marginLeft: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.light.xs,
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
    borderColor: 'rgba(255, 140, 0, 0.2)',
  },
  contactItemSelected: {
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    borderColor: HEYWAY_COLORS.interactive.focus,
    ...HEYWAY_SHADOWS.light.md,
  },
  contactName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactPhone: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.tertiary,
    flex: 1,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: HEYWAY_RADIUS.xs,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.xxxxl + HEYWAY_SPACING.xl,
  },
  emptyTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginTop: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.sm,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  emptyText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    marginBottom: HEYWAY_SPACING.xxl,
    paddingHorizontal: HEYWAY_SPACING.xxxxl,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  emptyButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.xxl,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.sm,
  },
  emptyButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  doneButtonContainer: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: HEYWAY_COLORS.border.primary,
  },
  doneButton: {
    backgroundColor: HEYWAY_COLORS.status.success,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    paddingVertical: HEYWAY_SPACING.xl,
    paddingHorizontal: HEYWAY_SPACING.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.success,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.large,
    ...HEYWAY_SHADOWS.light.md,
  },
  doneButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModalCard: {
    width: 340,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.xxl,
    padding: HEYWAY_SPACING.xxl + HEYWAY_SPACING.xs,
    alignItems: 'stretch',
    ...HEYWAY_SHADOWS.light.xl,
  },
  addModalTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.lg,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  addModalLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    marginTop: HEYWAY_SPACING.sm,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  addModalInput: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.input.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    color: HEYWAY_COLORS.text.primary,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    marginBottom: HEYWAY_SPACING.sm,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    ...HEYWAY_SHADOWS.light.xs,
  },
  addModalButton: {
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.md,
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.sm,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
  },
  addModalButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  addModalCancel: {
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.sm,
  },
  addModalCancelText: {
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});