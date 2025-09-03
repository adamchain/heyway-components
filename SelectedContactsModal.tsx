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
import { COLORS } from './designSystem';
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
    backgroundColor: '#181818',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 18,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  contactItem: {
    backgroundColor: '#232323',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#CCCCCC',
    marginRight: 12,
  },
  removeButton: {
    padding: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor replaced with LinearGradient component
    borderRadius: 8,
    paddingVertical: 16,
    marginVertical: 20,
  },
  clearButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#CCCCCC',
    textAlign: 'center',
  },
});