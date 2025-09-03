import React, { useState, useEffect, useCallback, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { Search, Phone, Star, Plus, Check, List, Download, X, FolderPlus, Edit3, Trash2, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ContactSelectionManager } from '@/utils/contactSelection';
import { apiService } from '@/services/apiService';
import { useFavorites } from '@/hooks/useFavorites';
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_RADIUS, HEYWAY_TYPOGRAPHY, HEYWAY_SHADOWS, HEYWAY_MACOS_PATTERNS, HEYWAY_ACCESSIBILITY } from '@styles/HEYWAY_STYLE_GUIDE';

// Lazy load FavoritesContent
const FavoritesContent = React.lazy(() => import('@/components/FavoritesContent'));

interface ContactsCardViewProps {
  activeSection: string;
  onAddToCallList?: (contact: any) => void;
  onSectionChange?: (section: string) => void;
  onImportContacts?: () => void;
  onAddContact?: () => void;
  selectedAutomation?: any;
}

export default function ContactsCardView({
  activeSection,
  onAddToCallList,
  onSectionChange,
  onImportContacts,
  onAddContact,
  selectedAutomation
}: ContactsCardViewProps) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contactLists, setContactLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [selectedContactForList, setSelectedContactForList] = useState<any>(null);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [automationContacts, setAutomationContacts] = useState<any[]>([]);
  const favorites = useFavorites();

  const handleHapticFeedback = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const navItems = [
    { key: 'all', icon: Users, label: 'All Contacts' },
    { key: 'lists', icon: List, label: 'Lists' },
    { key: 'favorites', icon: Star, label: 'Favorites' },
    // Only show 'automations' nav item when we're in that section or have a selected automation
    ...(activeSection === 'automations' || selectedAutomation ? [{ key: 'automations', icon: Users, label: 'Automation Contacts' }] : []),
  ];

  const actionItems = [
    { key: 'import', icon: Download, label: 'Import', action: onImportContacts },
    { key: 'add', icon: Plus, label: 'Add Contact', action: onAddContact },
  ];

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const loadedContacts = await apiService.getContacts(3000);
      const dedupedContacts = ContactSelectionManager.deduplicateContactsByNameAndPhone(loadedContacts).slice(0, 3000);
      setContacts(dedupedContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      setContacts([]);
    } finally {
      setIsLoading(false);
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

  const loadContactLists = async () => {
    try {
      const lists = await apiService.getContactLists(true, true);
      setContactLists(lists);
    } catch (error) {
      console.error('Failed to load contact lists:', error);
      setContactLists([]);
    }
  };

  const loadAutomationContacts = async () => {
    try {
      if (!selectedAutomation) {
        setAutomationContacts([]);
        return;
      }

      console.log('📱 Loading contacts for automation:', selectedAutomation.id);

      try {
        // Try the new API endpoint first
        const automationContactsData = await apiService.getAutomationContacts(selectedAutomation.id);
        setAutomationContacts(automationContactsData);
        console.log('📱 Loaded automation contacts from API:', automationContactsData.length);
      } catch (error) {
        // If the API endpoint doesn't exist, fall back to getting automation calls
        // and extracting contact information from them
        console.log('📱 API endpoint not available, falling back to call history...');

        const automationCalls = await apiService.getAutomationCalls(selectedAutomation.id || selectedAutomation._id);
        const allContacts = await apiService.getContacts(5000); // Get more contacts to ensure we find matches

        // Extract unique phone numbers from automation calls
        const callPhoneNumbers = new Set<string>();
        automationCalls.forEach(call => {
          if (call.participants) {
            call.participants.forEach((participant: any) => {
              if (participant.phoneNumber) {
                callPhoneNumbers.add(participant.phoneNumber);
              }
            });
          }
          if (call.recipients) {
            call.recipients.forEach((recipient: string) => {
              callPhoneNumbers.add(recipient);
            });
          }
        });

        // Find matching contacts
        const matchingContacts = allContacts.filter(contact =>
          callPhoneNumbers.has(contact.phoneNumber)
        );

        setAutomationContacts(matchingContacts);
        console.log('📱 Loaded automation contacts from calls:', matchingContacts.length);
      }
    } catch (error) {
      console.error('Failed to load automation contacts:', error);
      setAutomationContacts([]);
    }
  };

  const filterContacts = useCallback(() => {
    let filtered = contacts;

    // Only apply filtering if not showing favorites (favorites handled by FavoritesContent)
    if (activeSection !== 'favorites') {
      // For 2-section layout, handle filtering differently
      const needsTwoSections = activeSection === 'lists' || activeSection === 'favorites';

      if (needsTwoSections) {
        // In two-section mode, left panel always shows all contacts
        // Right panel content is handled separately
        filtered = contacts;
      } else {
        // For single-section layout
        if (activeSection === 'lists' && selectedList && selectedList.id !== 'all') {
          filtered = selectedList.contacts || [];
        } else if (activeSection === 'automations') {
          filtered = automationContacts;
        }
        // For 'all' section, show all contacts
      }

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(contact =>
          contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact?.phoneNumber?.includes(searchQuery)
        );
      }
    }

    setFilteredContacts(filtered);
  }, [contacts, automationContacts, activeSection, selectedList, searchQuery]);

  useEffect(() => {
    loadContacts();
    loadSelectedContacts();
    loadContactLists();
  }, []);

  // Load automation contacts when selectedAutomation changes
  useEffect(() => {
    if (activeSection === 'automations') {
      loadAutomationContacts();
    }
  }, [selectedAutomation, activeSection]);

  useEffect(() => {
    filterContacts();
  }, [filterContacts]);

  const toggleContactSelection = async (contact: any) => {
    try {
      handleHapticFeedback();
      if (!contact?.id) return;

      const phoneNumber = contact?.phoneNumber;
      if (!phoneNumber) return;

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
        onAddToCallList({
          name: contact?.name || 'Unknown Contact',
          phoneNumber: contact?.phoneNumber,
        });
      }
    } catch (error) {
      console.error('Error toggling contact selection:', error);
    }
  };

  const toggleFavorite = async (contact: any) => {
    try {
      handleHapticFeedback();
      const existingFavorite = favorites.favorites.find(fav =>
        fav.phoneNumber === contact.phoneNumber && fav.type === 'contact'
      );

      if (existingFavorite) {
        await favorites.removeFromFavorites(existingFavorite.id);
      } else {
        await favorites.addToFavorites({
          name: contact.name,
          phoneNumber: contact.phoneNumber,
          type: 'contact' as const,
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleAddToList = (contact: any) => {
    handleHapticFeedback();
    setSelectedContactForList(contact);
    setShowAddToListModal(true);
  };

  const addContactToList = async (listId: string) => {
    if (!selectedContactForList) return;

    try {
      console.log('Adding contact to list:', {
        listId,
        contactId: selectedContactForList.id,
        contact: selectedContactForList
      });

      // Validate contact ID format before sending
      if (!selectedContactForList.id || selectedContactForList.id.length !== 24) {
        throw new Error('Invalid contact ID format');
      }

      await apiService.addContactsToList(listId, [selectedContactForList.id]);
      await loadContactLists(); // Refresh lists
      setShowAddToListModal(false);
      setSelectedContactForList(null);
    } catch (error) {
      console.error('Failed to add contact to list:', error);

      let errorMessage = 'Failed to add contact to list';

      if ((error as any)?.response?.status === 400) {
        // Handle validation errors
        if ((error as any)?.response?.data?.errors) {
          const validationErrors = (error as any).response.data.errors;
          errorMessage = validationErrors.map((err: any) => err.msg).join(', ');
        } else if ((error as any)?.response?.data?.error) {
          errorMessage = (error as any).response.data.error;
        } else {
          errorMessage = 'Invalid data provided. Please check and try again.';
        }
      } else if ((error as any)?.response?.status === 404) {
        errorMessage = 'Contact list not found. Please refresh and try again.';
      } else if ((error as any)?.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if ((error as any)?.response?.data?.error) {
        errorMessage = (error as any).response.data.error;
      } else if ((error as any)?.response?.status) {
        errorMessage = `Server error (${(error as any).response.status})`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    }
  };

  const createNewList = async () => {
    if (!newListName.trim()) return;

    try {
      const listData = {
        name: newListName.trim(),
        description: '',
        color: 'blue',
        settings: {
          isPrivate: false,
          allowDuplicates: false,
        }
      };

      console.log('Creating list with data:', listData);
      const newList = await apiService.createContactList(listData);

      console.log('List created successfully:', newList);

      if (selectedContactForList && newList?.id) {
        console.log('Adding contact to new list:', selectedContactForList.id, 'to list:', newList.id);
        await apiService.addContactsToList(newList.id, [selectedContactForList.id]);
      }

      await loadContactLists();
      setNewListName('');
      setShowCreateListModal(false);
      setShowAddToListModal(false);
      setSelectedContactForList(null);
    } catch (error) {
      console.error('Failed to create list:', error);

      // More detailed error handling
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to create list: ${error.message}`);
      } else {
        Alert.alert('Error', 'Failed to create list');
      }
    }
  };

  const handleDeleteList = async (list: any) => {
    handleHapticFeedback();

    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteContactList(list.id);
              await loadContactLists();

              // If we're currently viewing this list, go back to lists view
              if (selectedList && selectedList.id === list.id) {
                setSelectedList(null);
              }
            } catch (error) {
              console.error('Failed to delete list:', error);
              if (error instanceof Error) {
                Alert.alert('Error', `Failed to delete list: ${error.message}`);
              } else {
                Alert.alert('Error', 'Failed to delete list');
              }
            }
          }
        }
      ]
    );
  };

  const removeContactFromList = async (contact: any) => {
    if (!selectedList) return;

    handleHapticFeedback();

    Alert.alert(
      'Remove Contact',
      `Remove "${contact?.name || 'this contact'}" from "${selectedList.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.removeContactFromList(selectedList.id, contact.id);
              await loadContactLists();
              // Refresh the current list view
              const updatedList = await apiService.getContactList(selectedList.id);
              setSelectedList(updatedList);
            } catch (error) {
              console.error('Failed to remove contact from list:', error);
              if (error instanceof Error) {
                Alert.alert('Error', `Failed to remove contact: ${error.message}`);
              } else {
                Alert.alert('Error', 'Failed to remove contact from list');
              }
            }
          }
        }
      ]
    );
  };

  const renderContactCard = ({ item: contact }: { item: any }) => {
    if (!contact) return null;

    const phoneNumber = contact?.phoneNumber || '';
    const isSelected = selectedContacts.includes(phoneNumber);
    const isFavorite = favorites.favorites.some(fav =>
      fav.phoneNumber === phoneNumber && fav.type === 'contact'
    );

    return (
      <TouchableOpacity
        style={[
          styles.contactCard,
          isSelected && styles.contactCardSelected
        ]}
        onPress={() => toggleContactSelection(contact)}
        activeOpacity={0.8}
      >
        <View style={styles.contactCardContent}>
          <View style={styles.contactCardHeader}>
            <View style={styles.contactCardHeaderLeft}>
              <Text style={[styles.contactCardName, isSelected && styles.contactCardNameSelected]} numberOfLines={1}>
                {contact?.name || 'Unknown Contact'}
              </Text>
            </View>
            <View style={styles.contactCardHeaderRight}>
              {isFavorite && (
                <Star size={12} color="#FFD700" fill="#FFD700" />
              )}
              <TouchableOpacity
                style={styles.contactActionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  if (!contact?.id) {
                    Alert.alert('Error', 'This contact cannot be selected due to missing ID');
                    return;
                  }
                  toggleContactSelection(contact);
                }}
                activeOpacity={0.7}
              >
                {isSelected ? (
                  <Check size={14} color={HEYWAY_COLORS.text.primary} />
                ) : (
                  <Plus size={14} color={HEYWAY_COLORS.text.tertiary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.contactCardMessage, isSelected && styles.contactCardMessageSelected]} numberOfLines={1}>
            {contact?.phoneNumber || 'No phone number'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Helper function to get avatar background color
  const getAvatarColor = (name: string) => {
    const colors = [
      HEYWAY_COLORS.interactive.whatsappGreen,
      HEYWAY_COLORS.interactive.primary,
      HEYWAY_COLORS.secondary,
      HEYWAY_COLORS.tertiary,
      HEYWAY_COLORS.quaternary,
    ];
    const index = name.length % colors.length;
    return colors[index] + '20'; // Add transparency
  };

  const getTitle = () => {
    switch (activeSection) {
      case 'all':
        return 'All Contacts';
      case 'lists':
        return selectedList ? selectedList.name : 'Contact Lists';
      case 'favorites':
        return 'Favorites';
      case 'automations':
        return selectedAutomation ? `Contacts for ${selectedAutomation.name}` : 'Automation Contacts';
      default:
        return 'Contacts';
    }
  };

  const renderListCard = ({ item: list }: { item: any }) => {
    if (!list) return null;

    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={() => {
          handleHapticFeedback();
          setSelectedList(list);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.listCardContent}>
          <View style={[styles.listColor, { backgroundColor: list.color || '#007AFF' }]} />
          <View style={styles.listInfo}>
            <Text style={styles.listName}>{list.name}</Text>
            <Text style={styles.listCount}>
              {list.contacts?.length || 0} contact{(list.contacts?.length || 0) !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.listActions}>
            <TouchableOpacity
              style={styles.listActionButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent list selection
                handleDeleteList(list);
              }}
              activeOpacity={0.7}
            >
              <Trash2 size={14} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  // If favorites section is active, show the FavoritesContent component
  if (activeSection === 'favorites') {
    return (
      <View style={styles.container}>
        <Suspense fallback={
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
            <Text style={styles.loadingText}>Loading favorites...</Text>
          </View>
        }>
          <FavoritesContent
            onClose={() => { }} // No close action needed in embedded mode
            onContactSelected={onAddToCallList || (() => { })}
            onAddToCallList={onAddToCallList || (() => { })}
          />
        </Suspense>
      </View>
    );
  }

  // Always use two-section layout for contacts to match automations and calls
  return (
    <>
      <View style={styles.container}>
        {/* Left Panel - All Contacts */}
        <View style={styles.leftHalfPanel}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.titleSection}>
                <Text style={styles.title}>Contacts</Text>
              </View>
              <TouchableOpacity style={styles.toolbarButton} onPress={onAddContact}>
                <Plus size={20} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Bar */}
          <View style={styles.filterBar}>
            <View style={styles.filterContent}>
              <View style={styles.typeFilters}>
                {navItems.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.filterButton, activeSection === item.key && styles.filterButtonActive]}
                    onPress={() => {
                      handleHapticFeedback();
                      if (item.key !== 'lists') {
                        setSelectedList(null);
                      }
                      onSectionChange?.(item.key);
                    }}
                    activeOpacity={0.8}
                  >
                    <item.icon size={10} color={activeSection === item.key ? HEYWAY_COLORS.text.inverse : HEYWAY_COLORS.text.secondary} />
                    <Text style={[styles.filterButtonText, activeSection === item.key && styles.filterButtonTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* All Contacts List */}
          <FlatList
            data={filteredContacts}
            renderItem={renderContactCard}
            keyExtractor={(item, index) => item?.id?.toString() || item?.phoneNumber || `contact-${index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Users size={48} color={HEYWAY_COLORS.text.tertiary} />
                <Text style={styles.emptyTitle}>No Contacts</Text>
                <Text style={styles.emptyText}>
                  No contacts match your search
                </Text>
              </View>
            }
          />
        </View>

        {/* Right Panel - Lists or Favorites */}
        <View style={styles.rightHalfPanel}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.titleSection}>
                {selectedList && activeSection === 'lists' && (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                      handleHapticFeedback();
                      setSelectedList(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <X size={18} color={HEYWAY_COLORS.text.secondary} />
                  </TouchableOpacity>
                )}
                <Text style={styles.title}>{getTitle()}</Text>
              </View>
              <TouchableOpacity style={styles.toolbarButton} onPress={onImportContacts}>
                <Plus size={20} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          {activeSection === 'lists' && !selectedList ? (
            // Show contact lists
            <FlatList
              data={contactLists}
              renderItem={renderListCard}
              keyExtractor={(item, index) => item?.id?.toString() || item?.name || `list-${index}`}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <FolderPlus size={48} color={HEYWAY_COLORS.text.tertiary} />
                  <Text style={styles.emptyTitle}>No Lists</Text>
                  <Text style={styles.emptyText}>
                    Create your first contact list to organize your contacts
                  </Text>
                </View>
              }
            />
          ) : activeSection === 'lists' && selectedList ? (
            // Show contacts from selected list
            <>
              <FlatList
                data={selectedList?.contacts?.filter(contact =>
                  searchQuery ? (
                    contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    contact?.phoneNumber?.includes(searchQuery)
                  ) : true
                ) || []}
                renderItem={renderContactCard}
                keyExtractor={(item, index) => item?.id?.toString() || item?.phoneNumber || `contact-${index}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>List is Empty</Text>
                    <Text style={styles.emptyText}>
                      No contacts in this list
                    </Text>
                  </View>
                }
              />
            </>
          ) : activeSection === 'favorites' ? (
            // Show favorites
            <Suspense fallback={
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
                <Text style={styles.loadingText}>Loading favorites...</Text>
              </View>
            }>
              <FavoritesContent
                onClose={() => { }}
                onContactSelected={() => { }}
                onAddToCallList={onAddToCallList}
              />
            </Suspense>
          ) : (
            // For 'all' and 'automations' sections, show placeholder or related content
            <View style={styles.detailsPlaceholder}>
              <View style={styles.placeholderCard}>
                <Users size={48} color={HEYWAY_COLORS.text.tertiary} />
                <Text style={styles.detailsPlaceholderText}>
                  {activeSection === 'automations'
                    ? 'Automation Contact Management'
                    : 'Contact Management'}
                </Text>
                <Text style={styles.detailsPlaceholderSubtext}>
                  {activeSection === 'automations' && selectedAutomation
                    ? `Manage contacts for the "${selectedAutomation.name}" automation. Add or remove contacts from the left panel.`
                    : activeSection === 'automations'
                      ? 'Select an automation to manage its contacts'
                      : 'Select contacts from the left panel to add them to lists or mark as favorites'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Add to List Modal */}
      <Modal
        visible={showAddToListModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddToListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to List</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAddToListModal(false)}
                activeOpacity={0.7}
              >
                <X size={20} color={HEYWAY_COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={contactLists}
              keyExtractor={(item) => item.id}
              renderItem={({ item: list }) => (
                <TouchableOpacity
                  style={styles.modalListItem}
                  onPress={() => addContactToList(list.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.modalListColor, { backgroundColor: list.color || '#007AFF' }]} />
                  <Text style={styles.modalListName}>{list.name}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.createListButton}
              onPress={() => {
                setShowAddToListModal(false);
                setShowCreateListModal(true);
              }}
              activeOpacity={0.7}
            >
              <FolderPlus size={16} color={HEYWAY_COLORS.interactive.primary} />
              <Text style={styles.createListButtonText}>Create New List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create List Modal */}
      <Modal
        visible={showCreateListModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create List</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCreateListModal(false)}
                activeOpacity={0.7}
              >
                <X size={20} color={HEYWAY_COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.createListForm}>
              <TextInput
                style={styles.createListInput}
                placeholder="List name..."
                placeholderTextColor={HEYWAY_COLORS.text.secondary}
                value={newListName}
                onChangeText={setNewListName}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.createListSubmitButton, !newListName.trim() && styles.disabledButton]}
                onPress={createNewList}
                disabled={!newListName.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.createListSubmitText}>Create List</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    flexDirection: 'row',
  },

  /* LAYOUT PANELS */
  leftHalfPanel: {
    width: 420,
    minWidth: 360,
    maxWidth: 460,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRightWidth: 0.5,
    borderRightColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  rightHalfPanel: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    ...HEYWAY_SHADOWS.light.sm,
  },

  /* HEADERS / TOOLBAR */
  header: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    paddingBottom: 8,
    paddingTop: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.tertiary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 48,
  },
  titleContainer: { flex: 1 },
  titleSection: {
    borderRadius: HEYWAY_RADIUS.md,
    alignItems: 'center',
    gap: 8,
    flexDirection: 'row',
  },
  backButton: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.elevated,
    marginRight: 8,
  },
  title: {
    borderRadius: HEYWAY_RADIUS.md,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.2,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 13,
  },
  toolbarButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
  },

  /* FILTER BAR / NAV TABS */
  filterBar: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderBottomWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.tertiary,
  },
  typeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.xs,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.xs,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    borderRadius: 18,
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.tertiary,
  },
  filterButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.whatsappGreen,
    borderColor: HEYWAY_COLORS.interactive.whatsappGreen,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
  },
  filterButtonTextActive: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: '600',
  },

  /* SEARCH */
  searchContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 20,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.tertiary,
    minHeight: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
  },

  /* LOADING */
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: HEYWAY_SPACING.md,
  },
  loadingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    color: HEYWAY_COLORS.text.secondary,
  },

  /* LISTS */
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: HEYWAY_SPACING.xxl,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },

  /* CONTACT CARDS */
  contactCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.divider,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  contactCardSelected: {
    backgroundColor: HEYWAY_COLORS.interactive.whatsappLight,
    borderLeftWidth: 4,
    borderLeftColor: HEYWAY_COLORS.interactive.whatsappGreen,
  },
  contactCardContent: {
    gap: 6,
  },
  contactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  contactCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactCardName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    color: HEYWAY_COLORS.text.primary,
    fontWeight: 600,
  },
  contactCardNameSelected: {
    color: HEYWAY_COLORS.text.primary,
  },
  contactCardMessage: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.secondary,
  },
  contactCardMessageSelected: {
    color: HEYWAY_COLORS.text.primary,
  },
  contactActionButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.light.xs,
  },

  /* AVATAR */
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.tertiary,
    backgroundColor: HEYWAY_COLORS.background.elevated,
  },
  contactAvatarText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    color: HEYWAY_COLORS.text.primary,
  },

  /* ROW LAYOUTS */
  contactInfo: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    paddingTop: 2,
  },
  contactTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  /* EMPTY STATES */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 16,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },

  /* LIST CARDS (RIGHT PANEL: LISTS) */
  listCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    marginHorizontal: 8,
    marginVertical: 2,
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.divider,
  },
  listCardContent: {
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
    flex: 1,
  },
  listColor: { width: 10, height: 10, borderRadius: 5 },
  listInfo: { flex: 1 },
  listName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.small,
    fontWeight: 500,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    marginBottom: 2,
  },
  listCount: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.secondary,
  },
  listActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listActionButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.light.xs,
  },

  /* MODALS */
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  modalContent: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 16,
    width: '86%',
    maxWidth: 420,
    maxHeight: '72%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.divider,
    backgroundColor: HEYWAY_COLORS.background.content,
  },
  modalTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: 600,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: HEYWAY_COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  modalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.divider,
    minHeight: 56,
    gap: HEYWAY_SPACING.md,
  },
  modalListColor: { width: 8, height: 8, borderRadius: 4 },
  modalListName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: 500,
    color: HEYWAY_COLORS.text.primary,
  },
  createListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: HEYWAY_SPACING.xs,
    paddingVertical: HEYWAY_SPACING.md,
    marginHorizontal: HEYWAY_SPACING.lg,
    marginVertical: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.interactive.primary,
  },
  createListButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: 600,
    color: HEYWAY_COLORS.interactive.primary,
  },
  createListForm: { padding: HEYWAY_SPACING.lg, gap: HEYWAY_SPACING.md },
  createListInput: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  createListSubmitButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingVertical: HEYWAY_SPACING.sm,
    alignItems: 'center',
    ...HEYWAY_SHADOWS.light.md,
  },
  createListSubmitText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: 600,
    color: HEYWAY_COLORS.text.inverse,
  },
  disabledButton: { backgroundColor: HEYWAY_COLORS.interactive.primaryDisabled },

  /* PLACEHOLDER */
  detailsPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  placeholderCard: {
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.xl,
    paddingHorizontal: HEYWAY_SPACING.lg,
    backgroundColor: HEYWAY_COLORS.background.elevated,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.divider,
    ...HEYWAY_SHADOWS.light.xs,
    maxWidth: 320,
  },
  detailsPlaceholderText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: 600,
    color: HEYWAY_COLORS.text.primary,
    marginTop: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.sm,
    textAlign: 'center',
  },
  detailsPlaceholderSubtext: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed,
  },
});
