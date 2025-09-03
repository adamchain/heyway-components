import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Copy,
  List,
  ChevronRight,
  X,
  Check,
  Search,
  UserPlus,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '@/components/designSystem';
import { apiService } from '@/services/apiService';

// iOS Native Colors to match existing design
const IOS_COLORS = {
  background: '#000000',
  cardBackground: '#1C1C1E',
  secondaryBackground: '#2C2C2E',
  buttonBackground: '#3A3A3C',
  text: {
    primary: '#FFFFFF',
    secondary: '#AEAEB2',
    tertiary: '#636366',
  },
  accent: '#007AFF',
  separator: '#3A3A3C',
};

interface ContactList {
  _id: string;
  name: string;
  description: string;
  color: string;
  contactsCount: number;
  isSystem: boolean;
  settings: {
    isPrivate: boolean;
    allowDuplicates: boolean;
  };
  metadata: {
    lastUsed: string;
    usageCount: number;
    createdFrom: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ContactListsManagerProps {
  visible: boolean;
  onClose: () => void;
  onListSelect?: (list: ContactList) => void;
  selectedContacts?: any[];
}

const COLOR_OPTIONS = [
  { key: 'blue', color: '#007AFF', name: 'Blue' },
  { key: 'green', color: '#34C759', name: 'Green' },
  { key: 'purple', color: '#AF52DE', name: 'Purple' },
  { key: 'orange', color: '#FF9500', name: 'Orange' },
  { key: 'red', color: '#FF3B30', name: 'Red' },
  { key: 'pink', color: '#FF2D92', name: 'Pink' },
  { key: 'indigo', color: '#5856D6', name: 'Indigo' },
  { key: 'teal', color: '#5AC8FA', name: 'Teal' },
];

export default function ContactListsManager({ 
  visible, 
  onClose, 
  onListSelect,
  selectedContacts = []
}: ContactListsManagerProps) {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState<ContactList | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for create/edit modal
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('blue');
  const [formIsPrivate, setFormIsPrivate] = useState(false);
  const [formAllowDuplicates, setFormAllowDuplicates] = useState(false);

  useEffect(() => {
    if (visible) {
      loadLists();
    }
  }, [visible]);

  const loadLists = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getContactLists(true, false);
      setLists(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading contact lists:', error);
      Alert.alert('Error', 'Failed to load contact lists');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormColor('blue');
    setFormIsPrivate(false);
    setFormAllowDuplicates(false);
    setEditingList(null);
  };

  const handleCreateList = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditList = (list: ContactList) => {
    if (list.isSystem) {
      Alert.alert('Cannot Edit', 'System lists cannot be modified');
      return;
    }
    setFormName(list.name);
    setFormDescription(list.description);
    setFormColor(list.color);
    setFormIsPrivate(list.settings.isPrivate);
    setFormAllowDuplicates(list.settings.allowDuplicates);
    setEditingList(list);
    setShowCreateModal(true);
  };

  const handleSaveList = async () => {
    if (!formName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    try {
      const listData = {
        name: formName.trim(),
        description: formDescription.trim(),
        color: formColor,
        settings: {
          isPrivate: formIsPrivate,
          allowDuplicates: formAllowDuplicates,
        },
      };

      if (editingList) {
        await apiService.updateContactList(editingList._id, listData);
      } else {
        await apiService.createContactList(listData);
      }

      setShowCreateModal(false);
      resetForm();
      await loadLists();
    } catch (error) {
      console.error('Error saving list:', error);
      Alert.alert('Error', 'Failed to save list');
    }
  };

  const handleDeleteList = (list: ContactList) => {
    if (list.isSystem) {
      Alert.alert('Cannot Delete', 'System lists cannot be deleted');
      return;
    }

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
              await apiService.deleteContactList(list._id);
              await loadLists();
            } catch (error) {
              console.error('Error deleting list:', error);
              Alert.alert('Error', 'Failed to delete list');
            }
          },
        },
      ]
    );
  };

  const handleDuplicateList = (list: ContactList) => {
    Alert.prompt(
      'Duplicate List',
      'Enter a name for the duplicated list:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Duplicate',
          onPress: async (newName) => {
            if (!newName || !newName.trim()) {
              Alert.alert('Error', 'Please enter a valid name');
              return;
            }

            try {
              await apiService.duplicateContactList(list._id, newName.trim());
              await loadLists();
            } catch (error) {
              console.error('Error duplicating list:', error);
              Alert.alert('Error', 'Failed to duplicate list');
            }
          },
        },
      ],
      'plain-text',
      `Copy of ${list.name}`
    );
  };

  const handleAddContactsToList = async (list: ContactList) => {
    if (selectedContacts.length === 0) {
      Alert.alert('No Contacts', 'Please select contacts to add to the list');
      return;
    }

    try {
      const contactIds = selectedContacts.map(contact => contact._id || contact.id);
      await apiService.addContactsToList(list._id, contactIds);
      Alert.alert('Success', `Added ${selectedContacts.length} contact(s) to ${list.name}`);
      await loadLists();
    } catch (error) {
      console.error('Error adding contacts to list:', error);
      Alert.alert('Error', 'Failed to add contacts to list');
    }
  };

  const getColorValue = (colorKey: string) => {
    const colorOption = COLOR_OPTIONS.find(c => c.key === colorKey);
    return colorOption ? colorOption.color : COLOR_OPTIONS[0].color;
  };

  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    list.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <X size={24} color={IOS_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Lists</Text>
          <TouchableOpacity onPress={handleCreateList} style={styles.headerButton}>
            <Plus size={24} color={IOS_COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={16} color={IOS_COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lists..."
            placeholderTextColor={IOS_COLORS.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Selected Contacts Info */}
        {selectedContacts.length > 0 && (
          <View style={styles.selectedContactsInfo}>
            <UserPlus size={16} color={IOS_COLORS.accent} />
            <Text style={styles.selectedContactsText}>
              {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected to add
            </Text>
          </View>
        )}

        {/* Lists */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={IOS_COLORS.accent} />
              <Text style={styles.loadingText}>Loading lists...</Text>
            </View>
          ) : filteredLists.length === 0 ? (
            <View style={styles.emptyState}>
              <List size={48} color={IOS_COLORS.text.tertiary} />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No matching lists' : 'No lists yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first contact list to organize your contacts'
                }
              </Text>
              {!searchQuery && (
                <TouchableOpacity style={styles.createButton} onPress={handleCreateList}>
                  <Plus size={20} color={IOS_COLORS.text.primary} />
                  <Text style={styles.createButtonText}>Create List</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredLists.map((list) => (
              <View key={list._id} style={styles.listCard}>
                <TouchableOpacity
                  style={styles.listCardMain}
                  onPress={() => onListSelect ? onListSelect(list) : null}
                  activeOpacity={0.7}
                >
                  <View style={styles.listCardHeader}>
                    <View style={[styles.colorIndicator, { backgroundColor: getColorValue(list.color) }]} />
                    <View style={styles.listCardInfo}>
                      <View style={styles.listCardTitleRow}>
                        <Text style={styles.listCardTitle}>{list.name}</Text>
                        {list.isSystem && (
                          <View style={styles.systemBadge}>
                            <Text style={styles.systemBadgeText}>System</Text>
                          </View>
                        )}
                      </View>
                      {list.description && (
                        <Text style={styles.listCardDescription} numberOfLines={1}>
                          {list.description}
                        </Text>
                      )}
                      <View style={styles.listCardMeta}>
                        <Users size={14} color={IOS_COLORS.text.secondary} />
                        <Text style={styles.listCardMetaText}>
                          {list.contactsCount} contact{list.contactsCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color={IOS_COLORS.text.secondary} />
                  </View>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.listCardActions}>
                  {selectedContacts.length > 0 && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleAddContactsToList(list)}
                    >
                      <UserPlus size={16} color={IOS_COLORS.accent} />
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDuplicateList(list)}
                  >
                    <Copy size={16} color={IOS_COLORS.text.secondary} />
                  </TouchableOpacity>

                  {!list.isSystem && (
                    <>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditList(list)}
                      >
                        <Edit3 size={16} color={IOS_COLORS.text.secondary} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteList(list)}
                      >
                        <Trash2 size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Create/Edit Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color={IOS_COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingList ? 'Edit List' : 'Create List'}
              </Text>
              <TouchableOpacity onPress={handleSaveList}>
                <Check size={24} color={IOS_COLORS.accent} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>List Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="e.g., VIP Customers"
                  placeholderTextColor={IOS_COLORS.text.tertiary}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={styles.formInput}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Optional description..."
                  placeholderTextColor={IOS_COLORS.text.tertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Color</Text>
                <View style={styles.colorGrid}>
                  {COLOR_OPTIONS.map((color) => (
                    <TouchableOpacity
                      key={color.key}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color.color },
                        formColor === color.key && styles.colorOptionSelected
                      ]}
                      onPress={() => setFormColor(color.key)}
                    >
                      {formColor === color.key && (
                        <Check size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Settings</Text>
                
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => setFormIsPrivate(!formIsPrivate)}
                >
                  <Text style={styles.settingText}>Private List</Text>
                  <View style={[styles.toggle, formIsPrivate && styles.toggleActive]}>
                    {formIsPrivate && <View style={styles.toggleIndicator} />}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => setFormAllowDuplicates(!formAllowDuplicates)}
                >
                  <Text style={styles.settingText}>Allow Duplicate Contacts</Text>
                  <View style={[styles.toggle, formAllowDuplicates && styles.toggleActive]}>
                    {formAllowDuplicates && <View style={styles.toggleIndicator} />}
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IOS_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: IOS_COLORS.separator,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: IOS_COLORS.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: IOS_COLORS.cardBackground,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: IOS_COLORS.text.primary,
  },
  selectedContactsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  selectedContactsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: IOS_COLORS.accent,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: IOS_COLORS.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: IOS_COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: IOS_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: IOS_COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  createButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: IOS_COLORS.text.primary,
  },
  listCard: {
    backgroundColor: IOS_COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: IOS_COLORS.separator,
    overflow: 'hidden',
  },
  listCardMain: {
    padding: SPACING.lg,
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  listCardInfo: {
    flex: 1,
  },
  listCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  listCardTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: IOS_COLORS.text.primary,
  },
  systemBadge: {
    backgroundColor: 'rgba(255,149,0,0.2)',
    borderRadius: RADIUS.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  systemBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FF9500',
  },
  listCardDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: IOS_COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  listCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  listCardMetaText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: IOS_COLORS.text.secondary,
  },
  listCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: IOS_COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: IOS_COLORS.separator,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: IOS_COLORS.text.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  formSection: {
    marginBottom: SPACING.xl,
  },
  formLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: IOS_COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  formInput: {
    backgroundColor: IOS_COLORS.cardBackground,
    borderWidth: 1,
    borderColor: IOS_COLORS.separator,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: IOS_COLORS.text.primary,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: IOS_COLORS.text.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: IOS_COLORS.separator,
  },
  settingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: IOS_COLORS.text.primary,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: IOS_COLORS.buttonBackground,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: IOS_COLORS.accent,
  },
  toggleIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
  },
});