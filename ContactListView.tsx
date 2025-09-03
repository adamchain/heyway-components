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
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '@/components/designSystem';
import { apiService } from '@/services/apiService';

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
      blue: '#007AFF',
      green: '#34C759',
      purple: '#AF52DE',
      orange: '#FF9500',
      red: '#FF3B30',
      pink: '#FF2D92',
      indigo: '#5856D6',
      teal: '#5AC8FA',
    };
    return colorMap[colorKey] || colorMap.blue;
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
    backgroundColor: IOS_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: IOS_COLORS.text.primary,
    maxWidth: 200,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: IOS_COLORS.text.secondary,
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
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  selectedInfoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: IOS_COLORS.accent,
    fontWeight: '500',
  },
  clearSelectionButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  clearSelectionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: IOS_COLORS.accent,
    fontWeight: '600',
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
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: IOS_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: IOS_COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: IOS_COLORS.separator,
    overflow: 'hidden',
  },
  contactCardSelected: {
    borderColor: IOS_COLORS.accent,
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  contactCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: IOS_COLORS.buttonBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: IOS_COLORS.text.primary,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: IOS_COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  contactPhone: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: IOS_COLORS.accent,
    marginBottom: SPACING.xs,
  },
  contactEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: IOS_COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  contactAddedDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: IOS_COLORS.text.tertiary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: IOS_COLORS.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: IOS_COLORS.accent,
    backgroundColor: IOS_COLORS.accent,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactActions: {
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
});