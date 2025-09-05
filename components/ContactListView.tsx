// ContactListView.tsx — Liquid-Glass pass to match HomeSidebar vibe
// - Floating frosted container with BlurView (web fallback)
// - Semi-transparent panels, soft shadows, rounded rims
// - Typography & color tokens aligned with HEYWAY_STYLE_GUIDE

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ChevronLeft,
  Mail,
  Phone,
  Search,
  Share2,
  Trash2,
  Users,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { apiService } from '../services/apiService';
import {
  HEYWAY_COLORS,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
  HEYWAY_SPACING,
  HEYWAY_TYPOGRAPHY,
} from '../styles/HEYWAY_STYLE_GUIDE';

// --- Web-only style helpers (typed) to mirror HomeSidebar
import type { ViewStyle, TextStyle } from 'react-native';
const webView = (obj: Partial<ViewStyle>): Partial<ViewStyle> =>
  Platform.OS === 'web' ? obj : {};
const webText = (obj: Partial<TextStyle>): Partial<TextStyle> =>
  Platform.OS === 'web' ? obj : {};

interface ContactListViewProps {
  visible: boolean;
  onClose: () => void;
  listId: string;
  listName: string;
  listColor: string;
  onContactSelect?: (contact: Contact) => void;
  allowMultiSelect?: boolean;
}

interface Contact {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  addedAt?: string;
}

interface ContactListData {
  _id: string;
  name: string;
  description: string;
  color: string;
  contacts: { contactId: Contact; addedAt: string }[];
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
    if (visible && listId) loadListData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    Alert.alert('Remove Contact', `Remove ${contactName} from this list?`, [
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
    ]);
  };

  const handleContactPress = (contact: Contact) => {
    if (allowMultiSelect) {
      setSelectedContacts((prev) =>
        prev.includes(contact._id)
          ? prev.filter((id) => id !== contact._id)
          : [...prev, contact._id]
      );
    } else if (onContactSelect) {
      onContactSelect(contact);
    }
  };

  const handleCall = (contact: Contact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert('Call', `Call ${contact.name} at ${contact.phoneNumber}?`);
  };

  const handleShareList = async () => {
    if (!listData) return;
    const contactsText = listData.contacts
      .map(({ contactId }) => `${contactId.name}: ${contactId.phoneNumber}`)
      .join('\n');
    const shareContent = `${listData.name}\n${listData.description}\n\nContacts:\n${contactsText}`;
    try {
      await Share.share({ message: shareContent, title: listData.name });
    } catch (error) {
      console.error('Error sharing list:', error);
    }
  };

  const getColorValue = (colorKey: string) => {
    const colorMap: Record<string, string> = {
      blue: HEYWAY_COLORS.interactive.primary,
      green: HEYWAY_COLORS.accent.success,
      purple: '#AF52DE',
      orange: HEYWAY_COLORS.accent.warning,
      red: HEYWAY_COLORS.status.error,
      pink: '#FF2D92',
      indigo: '#5856D6',
      teal: '#5AC8FA',
    };
    return colorMap[colorKey] || HEYWAY_COLORS.interactive.primary;
  };

  const filteredContacts =
    listData?.contacts.filter(({ contactId }) => {
      const q = searchQuery.toLowerCase();
      return (
        contactId.name.toLowerCase().includes(q) ||
        contactId.phoneNumber.includes(searchQuery) ||
        (!!contactId.email && contactId.email.toLowerCase().includes(q))
      );
    }) || [];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.outerWrapper}>
        {/* Liquid Glass layer */}
        {Platform.OS !== 'web' ? (
          <BlurView tint="light" intensity={40} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={styles.webGlassFallback} />
        )}
        {/* Inner highlight (glass rim) */}
        <View pointerEvents="none" style={styles.innerHighlight} />

        {/* Content */}
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.headerButton}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <ChevronLeft size={22} color={HEYWAY_COLORS.text.macosPrimary} />
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <View style={styles.headerTitleRow}>
                <View
                  style={[styles.colorIndicator, { backgroundColor: getColorValue(listColor) }]}
                />
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {listName}
                </Text>
              </View>
              <Text style={styles.headerSubtitle}>
                {listData?.contactsCount || 0} contact
                {(listData?.contactsCount || 0) !== 1 ? 's' : ''}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleShareList}
              style={styles.headerButton}
              accessibilityRole="button"
              accessibilityLabel="Share list"
            >
              <Share2 size={20} color={HEYWAY_COLORS.text.macosSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={16} color={HEYWAY_COLORS.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts..."
              placeholderTextColor={HEYWAY_COLORS.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Selected Contacts Info (for multi-select) */}
          {allowMultiSelect && selectedContacts.length > 0 && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoText}>
                {selectedContacts.length} contact
                {selectedContacts.length !== 1 ? 's' : ''} selected
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
                <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
                <Text style={styles.loadingText}>Loading contacts...</Text>
              </View>
            ) : filteredContacts.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Users size={32} color={HEYWAY_COLORS.text.tertiary} />
                </View>
                <Text style={styles.emptyTitle}>
                  {searchQuery ? 'No matching contacts' : 'No contacts in this list'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Add contacts to this list to see them here'}
                </Text>
              </View>
            ) : (
              filteredContacts.map(({ contactId, addedAt }) => {
                const isSelected = selectedContacts.includes(contactId._id);
                return (
                  <TouchableOpacity
                    key={contactId._id}
                    style={[styles.contactCard, isSelected && styles.contactCardSelected]}
                    onPress={() => handleContactPress(contactId)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
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
                        {!!contactId.email && (
                          <Text style={styles.contactEmail} numberOfLines={1}>
                            {contactId.email}
                          </Text>
                        )}
                        {!!addedAt && (
                          <Text style={styles.contactAddedDate}>
                            Added {new Date(addedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </View>

                      {/* Actions */}
                      <View style={styles.contactActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleCall(contactId)}
                          accessibilityRole="button"
                          accessibilityLabel={`Call ${contactId.name}`}
                        >
                          <Phone size={16} color={HEYWAY_COLORS.text.macosPrimary} />
                        </TouchableOpacity>

                        {!!contactId.email && (
                          <TouchableOpacity style={styles.actionButton} accessibilityRole="button">
                            <Mail size={16} color={HEYWAY_COLORS.text.macosSecondary} />
                          </TouchableOpacity>
                        )}

                        {!listData?.isSystem && (
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleRemoveContact(contactId._id, contactId.name)}
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${contactId.name}`}
                          >
                            <Trash2 size={16} color={HEYWAY_COLORS.status.error} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// --- Styles (glass + Tahoe)
const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    margin: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.md,
    overflow: 'hidden',
    ...HEYWAY_SHADOWS.sm,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  webGlassFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  innerHighlight: {
    ...StyleSheet.absoluteFillObject,
    shadowColor: HEYWAY_COLORS.background.primary,
    shadowOpacity: 0.55,
    shadowRadius: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingTop: HEYWAY_SPACING.giant,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  headerButton: {
    width: HEYWAY_SPACING.xxxxl,
    height: HEYWAY_SPACING.xxxxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...webView({ cursor: 'pointer' as any }),
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.lg,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.sm,
  },
  colorIndicator: {
    width: HEYWAY_SPACING.md,
    height: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.xs,
  },
  headerTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title1,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    maxWidth: 240,
    ...webText({ userSelect: 'none' as any }),
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.md,
    marginHorizontal: HEYWAY_SPACING.xl,
    marginVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: HEYWAY_SPACING.lg,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: HEYWAY_COLORS.interactive.focus,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    marginHorizontal: HEYWAY_SPACING.xl,
    marginBottom: HEYWAY_SPACING.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.interactive.primary,
  },
  selectedInfoText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.interactive.primary,
  },
  clearSelectionButton: {
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.xs,
    ...webView({ cursor: 'pointer' as any }),
  },
  clearSelectionText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.interactive.primary,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: HEYWAY_SPACING.xl,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.giant,
  },
  loadingText: {
    marginTop: HEYWAY_SPACING.lg,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.giant,
    paddingHorizontal: HEYWAY_SPACING.xxxxl,
  },
  emptyIconWrap: {
    width: HEYWAY_SPACING.giant + HEYWAY_SPACING.lg,
    height: HEYWAY_SPACING.giant + HEYWAY_SPACING.lg,
    borderRadius: HEYWAY_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.xs,
  },
  emptyTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title2,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginTop: HEYWAY_SPACING.xl,
    marginBottom: HEYWAY_SPACING.sm,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    ...webText({ userSelect: 'none' as any }),
  },
  emptySubtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  contactCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 8,
    marginBottom: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    overflow: 'hidden',
    ...HEYWAY_SHADOWS.light.sm,
  },
  contactCardSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#007AFF',
    ...HEYWAY_SHADOWS.light.md,
  },
  contactCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.md,
  },
  contactAvatar: {
    width: HEYWAY_SPACING.giant,
    height: HEYWAY_SPACING.giant,
    borderRadius: HEYWAY_SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },
  contactAvatarText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    color: HEYWAY_COLORS.text.primary,
  },
  contactInfo: { flex: 1 },
  contactName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.macosPrimary,
    marginBottom: HEYWAY_SPACING.xs,
  },
  contactPhone: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.macosPrimary,
  },
  contactEmail: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.macosSecondary,
  },
  contactAddedDate: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.tertiary,
  },

  contactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: HEYWAY_SPACING.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    ...HEYWAY_SHADOWS.light.xs,
    ...webView({ cursor: 'pointer' as any }),
  },
});