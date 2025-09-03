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
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';

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
  { key: 'blue', color: HEYWAY_COLORS.interactive.primary, name: 'Blue' },
  { key: 'green', color: HEYWAY_COLORS.status.success, name: 'Green' },
  { key: 'purple', color: '#AF52DE', name: 'Purple' },
  { key: 'orange', color: HEYWAY_COLORS.accent.warning, name: 'Orange' },
  { key: 'red', color: HEYWAY_COLORS.status.error, name: 'Red' },
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
    backgroundColor: HEYWAY_COLORS.background.whatsappPanel,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.input.md,
    marginHorizontal: HEYWAY_SPACING.lg,
    marginVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: HEYWAY_SPACING.md,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  selectedContactsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.selected,
    borderRadius: HEYWAY_RADIUS.component.card.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    marginHorizontal: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.interactive.primary,
  },
  selectedContactsText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.interactive.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: HEYWAY_SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.xxxxl + HEYWAY_SPACING.xl,
  },
  loadingText: {
    marginTop: HEYWAY_SPACING.md,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.xxxxl * 2,
    paddingHorizontal: HEYWAY_SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginTop: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.sm,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  emptySubtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    marginBottom: HEYWAY_SPACING.xl,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.sm,
  },
  createButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  listCard: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    marginBottom: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    overflow: 'hidden',
    ...HEYWAY_SHADOWS.light.xs,
  },
  listCardMain: {
    padding: HEYWAY_SPACING.lg,
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: HEYWAY_RADIUS.xs,
  },
  listCardInfo: {
    flex: 1,
  },
  listCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
    marginBottom: HEYWAY_SPACING.xs,
  },
  listCardTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  systemBadge: {
    backgroundColor: HEYWAY_COLORS.accent.warning + '30',
    borderRadius: HEYWAY_RADIUS.component.badge.sm,
    paddingHorizontal: HEYWAY_SPACING.xs,
    paddingVertical: 2,
  },
  systemBadgeText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.accent.warning,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  listCardDescription: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.sm,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  listCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.xs,
  },
  listCardMetaText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  listCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingBottom: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    backgroundColor: HEYWAY_COLORS.interactive.hover,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.light.xs,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.whatsappPanel,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  modalTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingTop: HEYWAY_SPACING.lg,
  },
  formSection: {
    marginBottom: HEYWAY_SPACING.xl,
  },
  formLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.sm,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  formInput: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.component.input.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    ...HEYWAY_SHADOWS.light.xs,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HEYWAY_SPACING.md,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: HEYWAY_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...HEYWAY_SHADOWS.light.xs,
  },
  colorOptionSelected: {
    borderColor: HEYWAY_COLORS.text.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HEYWAY_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },
  settingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: HEYWAY_RADIUS.component.button.xl,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    justifyContent: 'center',
    paddingHorizontal: HEYWAY_SPACING.xs,
  },
  toggleActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
  },
  toggleIndicator: {
    width: 22,
    height: 22,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    backgroundColor: HEYWAY_COLORS.background.primary,
    alignSelf: 'flex-end',
    ...HEYWAY_SHADOWS.light.xs,
  },
});