import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Platform,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Delete, Plus } from 'lucide-react-native';
import { ContactSelectionManager } from '@/utils/contactSelection';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';

interface KeypadContentProps {
  onContactsSelected: () => void;
  onDone: () => void;
  onAddToCallList?: (contact: any) => void;
  selectedContacts?: string[];
  contactMap?: Record<string, { name: string; displayName: string; groups?: string[]; tags?: string[] }>;
}

export default function KeypadContent({
  onContactsSelected,
  onDone,
  onAddToCallList,
  selectedContacts: propSelectedContacts = [],
  contactMap = {}
}: KeypadContentProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    loadSelectedContacts();

    // Add keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const loadSelectedContacts = async () => {
    try {
      const selected = await ContactSelectionManager.loadSelectedContacts();
      setSelectedContacts(selected);
    } catch (error) {
      console.error('Failed to load selected contacts:', error);
    }
  };

  const keypadButtons = [
    [
      { number: '1', letters: '' },
      { number: '2', letters: 'ABC' },
      { number: '3', letters: 'DEF' },
    ],
    [
      { number: '4', letters: 'GHI' },
      { number: '5', letters: 'JKL' },
      { number: '6', letters: 'MNO' },
    ],
    [
      { number: '7', letters: 'PQRS' },
      { number: '8', letters: 'TUV' },
      { number: '9', letters: 'WXYZ' },
    ],
    [
      { number: '*', letters: '' },
      { number: '0', letters: '+' },
      { number: '#', letters: '' },
    ],
  ];

  const handleKeyPress = (key: string) => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    setPhoneNumber(prev => prev + key);
  };

  const handleKeypadDelete = () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const addNumberToCallList = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('No Number', 'Please enter a phone number first.');
      return;
    }

    try {
      // Create contact object for the phone number
      const contact = {
        id: phoneNumber,
        name: phoneNumber,
        phoneNumber: phoneNumber,
      };

      // Add to parent component's call list if callback provided
      if (onAddToCallList) {
        onAddToCallList(contact);
      }

      // Also maintain local selected contacts for backwards compatibility
      const newSelected = ContactSelectionManager.deduplicateContactsByNameAndPhone([
        ...selectedContacts.map(phone => ({ id: '', phoneNumber: phone, name: '' })),
        { id: '', phoneNumber: phoneNumber, name: phoneNumber }
      ]).map(contact => contact.phoneNumber);

      setSelectedContacts(newSelected);
      await ContactSelectionManager.saveSelectedContacts(newSelected);

      // Notify parent component
      onContactsSelected();

      // Clear keypad
      setPhoneNumber('');

      Alert.alert('Success', `Added ${phoneNumber} to call list`);
    } catch (error) {
      console.error('Failed to add number to call list:', error);
      Alert.alert('Error', 'Failed to add number to call list');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        {/* Selected Contacts Display */}
        {propSelectedContacts.length > 0 && (
          <View style={styles.selectedContactsSection}>
            <Text style={styles.selectedContactsTitle}>
              Selected ({propSelectedContacts.length})
            </Text>
            <ScrollView style={styles.selectedContactsList} showsVerticalScrollIndicator={false}>
              {propSelectedContacts.map((phone, index) => {
                const contactInfo = contactMap[phone];
                const displayName = contactInfo?.displayName || phone;

                return (
                  <View key={index} style={styles.selectedContactItem}>
                    <Text style={styles.selectedContactName} numberOfLines={1}>
                      {displayName}
                    </Text>
                    {contactInfo && contactInfo.name !== phone && (
                      <Text style={styles.selectedContactPhone} numberOfLines={1}>
                        {phone}
                      </Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.displayContainer}>
          <View style={styles.phoneNumberContainer}>
            <TextInput
              style={styles.phoneNumberInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter number"
              placeholderTextColor="#AEAEB2"
              keyboardType="phone-pad"
            />
            {phoneNumber && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={addNumberToCallList}
              >
                <Plus size={24} color="#34C759" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!keyboardVisible && (
          <View style={styles.keypadContainer}>
            {keypadButtons.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keypadRow}>
                {row.map((button) => (
                  <TouchableOpacity
                    key={button.number}
                    style={styles.keypadButton}
                    onPress={() => handleKeyPress(button.number)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keypadNumber}>{button.number}</Text>
                    {button.letters && (
                      <Text style={styles.keypadLetters}>{button.letters}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}

        {!keyboardVisible && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleKeypadDelete}
              disabled={!phoneNumber}
            >
              <Delete size={24} color={phoneNumber ? "#34C759" : "#666"} />
            </TouchableOpacity>
          </View>
        )}

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  selectedContactsSection: {
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingTop: HEYWAY_SPACING.lg,
    paddingBottom: HEYWAY_SPACING.md,
    maxHeight: 120,
  },
  selectedContactsTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.sm,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  selectedContactsList: {
    flex: 1,
  },
  selectedContactItem: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.card.sm,
    padding: HEYWAY_SPACING.sm,
    marginBottom: HEYWAY_SPACING.xs,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  selectedContactName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  selectedContactPhone: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  displayContainer: {
    paddingVertical: HEYWAY_SPACING.xxl,
    alignItems: 'center',
  },
  phoneNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    paddingBottom: HEYWAY_SPACING.md,
  },
  phoneNumberInput: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large * 2,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    minHeight: 48,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },
  addButton: {
    padding: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.md,
  },
  keypadContainer: {
    flex: 1,
    paddingHorizontal: HEYWAY_SPACING.xxxl,
    justifyContent: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HEYWAY_SPACING.lg,
  },
  keypadButton: {
    width: 72,
    height: 72,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    backgroundColor: HEYWAY_COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.md,
  },
  keypadNumber: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large * 2,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  keypadLetters: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.secondary,
    marginTop: -HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingBottom: HEYWAY_SPACING.xxxxl,
  },
  deleteButton: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    width: 64,
    height: 64,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.md,
  },
});