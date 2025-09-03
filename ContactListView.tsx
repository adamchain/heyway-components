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
  Share,
} from 'react-native';
import {
  Users,
  Search,
  X,
  Trash2,
  Share2,
  UserPlus,
  Phone,
  Mail,
  ChevronLeft,
  Star,
  StarOff,
} from 'lucide-react-native';
import { HEYWAY_COLORS } from '@styles/HEYWAY_STYLE_GUIDE';
import { SPACING, TYPOGRAPHY, RADIUS } from '@/components/designSystem';
import { apiService } from '@/services/apiService';

import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';

interface ContactListViewProps {
  visible: boolean;
  onClose: () => void;
  listId: string;
  listName: string;
  listColor: string;
  onContactSelect?: (contact: any) => void;
  allowMultiSelect?: boolean;
}

interface Contact {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  addedAt: string;
}

interface ContactListData {
  _id: string;
  name: string;
  description: string;
  color: string;
  contacts: {
    contactId: Contact;
    addedAt: string;
  }[];
  contactsCount: number;
  isSystem: boolean;
}

export default function ContactListView({
  visible,
  onClose,
  listId,
  listName,
  listColor,
  onContactSelect,
  allowMultiSelect = false,
}: ContactListViewProps) {
  const [listData, setListData] = useState<ContactListData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  useEffect(() => {
    if (visible && listId) {
      loadListData();
    }
  }, [visible, listId]);

  const loadListData = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getContactList(listId);
      setListData(response);
    } catch (error) {
      console.error('Error loading list data:', error);
      Alert.alert('Error', 'Failed to load list data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveContact = (contactId: string, contactName: string) => {
    Alert.alert(
      'Remove Contact',
      `Remove ${contactName} from this list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.removeContactFromList(listId, contactId);
              await loadListData();
            } catch (error) {
              console.error('Error removing contact:', error);
              Alert.alert('Error', 'Failed to remove contact');
            }
          },
        },
      ]
    );
  };

  const handleContactPress = (contact: Contact) => {
    if (allowMultiSelect) {
      setSelectedContacts(prev => {
        if (prev.includes(contact._id)) {
          return prev.filter(id => id !== contact._id);
        } else {
          return [...prev, contact._id];
        }
      });
    } else if (onContactSelect) {
      onContactSelect(contact);
    }
  };

  const handleCall = (contact: Contact) => {
    // This would integrate with the calling system
    Alert.alert('Call', `Call ${contact.name} at ${contact.phoneNumber}?`);
  };

  const handleShareList = async () => {
    if (!listData) return;

    const contactsText = listData.contacts
      .map(({ contactId }) => `${contactId.name}: ${contactId.phoneNumber}`)
      .join('\n');

    const shareContent = `${listData.name}\n${listData.description}\n\nContacts:\n${contactsText}`;

    try {
      await Share.share({
        message: shareContent,
        title: listData.name,
      });
    } catch (error) {
      console.error('Error sharing list:', error);
    }
  };

  const getColorValue = (colorKey: string) => {
    const colorMap: { [key: string]: string } = {
      blue: HEYWAY_COLORS.interactive.primary,
      green: HEYWAY_COLORS.status.success,
      purple: '#AF52DE',
      orange: HEYWAY_COLORS.accent.warning,
      red: HEYWAY_COLORS.status.error,
      pink: '#FF2D92',
      indigo: '#5856D6',
      teal: '#5AC8FA',
    };
    return colorMap[colorKey] || HEYWAY_COLORS.interactive.primary;
  };

  const filteredContacts = listData?.contacts.filter(({ contactId }) =>
    contactId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contactId.phoneNumber.includes(searchQuery) ||
    (contactId.email && contactId.email.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <ChevronLeft size={24} color={IOS_COLORS.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.colorIndicator, { backgroundColor: getColorValue(listColor) }]} />
              <Text style={styles.headerTitle} numberOfLines={1}>{listName}</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {listData?.contactsCount || 0} contact{(listData?.contactsCount || 0) !== 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity onPress={handleShareList} style={styles.headerButton}>
            <Share2 size={24} color={IOS_COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={16} color={IOS_COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={IOS_COLORS.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Selected Contacts Info (for multi-select) */}
        {allowMultiSelect && selectedContacts.length > 0 && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedInfoText}>
              {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
            </Text>
            <TouchableOpacity
              style={styles.clearSelectionButton}
              onPress={() => setSelectedContacts([])}
            >
              <Text style={styles.clearSelectionText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={IOS_COLORS.accent} />
              <Text style={styles.loadingText}>Loading contacts...</Text>
            </View>
          ) : filteredContacts.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color={IOS_COLORS.text.tertiary} />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No matching contacts' : 'No contacts in this list'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Add contacts to this list to see them here'
                }
              </Text>
            </View>
          ) : (
            filteredContacts.map(({ contactId, addedAt }) => {
              const isSelected = selectedContacts.includes(contactId._id);
              
              return (
                <TouchableOpacity
                  key={contactId._id}
                  style={[
                    styles.contactCard,
                    isSelected && styles.contactCardSelected
                  ]}
                  onPress={() => handleContactPress(contactId)}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactCardMain}>
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactAvatarText}>
                        {contactId.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contactId.name}</Text>
                      <Text style={styles.contactPhone}>{contactId.phoneNumber}</Text>
                      {contactId.email && (
                        <Text style={styles.contactEmail} numberOfLines={1}>
                          {contactId.email}
                        </Text>
                      )}
                      <Text style={styles.contactAddedDate}>
                        Added {new Date(addedAt).toLocaleDateString()}
                      </Text>
                    </View>

                    {allowMultiSelect && (
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleCall(contactId)}
                    >
                      <Phone size={16} color={IOS_COLORS.accent} />
                    </TouchableOpacity>

                    {contactId.email && (
                      <TouchableOpacity style={styles.actionButton}>
                        <Mail size={16} color={IOS_COLORS.text.secondary} />
                      </TouchableOpacity>
                    )}

                    {!listData?.isSystem && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleRemoveContact(contactId._id, contactId.name)}
                      >
                        <Trash2 size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
    marginBottom: HEYWAY_SPACING.xs,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: HEYWAY_RADIUS.xs,
  },
  headerTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    maxWidth: 200,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
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
    borderColor: HEYWAY_COLORS.border.primary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: HEYWAY_SPACING.md,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: HEYWAY_COLORS.interactive.selected,
    borderRadius: HEYWAY_RADIUS.component.card.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    marginHorizontal: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.interactive.primary,
  },
  selectedInfoText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.interactive.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  clearSelectionButton: {
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
  },
  clearSelectionText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.interactive.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
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
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  emptySubtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactCard: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    marginBottom: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    overflow: 'hidden',
    ...HEYWAY_SHADOWS.light.xs,
  },
  contactCardSelected: {
    borderColor: HEYWAY_COLORS.interactive.primary,
    backgroundColor: HEYWAY_COLORS.interactive.selected,
    ...HEYWAY_SHADOWS.light.sm,
  },
  contactCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.md,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: HEYWAY_RADIUS.component.avatar.lg,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
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
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactPhone: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.interactive.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactEmail: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactAddedDate: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.tertiary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    borderWidth: 2,
    borderColor: HEYWAY_COLORS.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: HEYWAY_COLORS.interactive.primary,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
  },
  checkmark: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
  },
  contactActions: {
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
});