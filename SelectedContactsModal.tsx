import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Trash2 } from 'lucide-react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';
import { ContactSelectionManager } from '@/utils/contactSelection';

interface SelectedContactsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedContacts: string[];
  contactMap?: Record<string, { name: string; displayName: string; groups?: string[]; tags?: string[] }>;
  onContactsChanged: () => void;
}

export default function SelectedContactsModal({
  visible,
  onClose,
  selectedContacts,
  contactMap = {},
  onContactsChanged
}: SelectedContactsModalProps) {
  const removeContact = async (phoneNumber: string) => {
    try {
      const newSelected = selectedContacts.filter(phone => phone !== phoneNumber);
      await ContactSelectionManager.saveSelectedContacts(newSelected);
      onContactsChanged();
    } catch (error) {
      console.error('Failed to remove contact:', error);
    }
  };

  const clearAllContacts = async () => {
    try {
      await ContactSelectionManager.clearSelectedContacts();
      onContactsChanged();
      onClose();
    } catch (error) {
      console.error('Failed to clear contacts:', error);
    }
  };

  const getContactName = (phoneNumber: string) => {
    return contactMap?.[phoneNumber]?.displayName || phoneNumber;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Selected Contacts</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {selectedContacts.length > 0 ? (
            <>
              <FlatList
                data={selectedContacts}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactName}>{getContactName(item)}</Text>
                    <Text style={styles.contactPhone}>{item}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeContact(item)}
                    >
                      <X size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                )}
                contentContainerStyle={styles.listContent}
              />

              <LinearGradient
                colors={COLORS.gradient.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.clearButton}
              >
                <TouchableOpacity
                  onPress={clearAllContacts}
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={20} color="#FFFFFF" />
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              </LinearGradient>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No contacts selected</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  title: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  content: {
    flex: 1,
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingTop: HEYWAY_SPACING.xl,
  },
  listContent: {
    paddingBottom: HEYWAY_SPACING.xl,
  },
  contactItem: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.sm,
    padding: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  contactName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    flex: 1,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactPhone: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    marginRight: HEYWAY_SPACING.md,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  removeButton: {
    padding: HEYWAY_SPACING.xs,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor replaced with LinearGradient component
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.lg,
    marginVertical: HEYWAY_SPACING.xl,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
  },
  clearButtonText: {
    marginLeft: HEYWAY_SPACING.sm,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});