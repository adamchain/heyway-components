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
import { COLORS } from './designSystem';

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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    maxHeight: 120,
  },
  selectedContactsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AEAEB2',
    marginBottom: 8,
    textAlign: 'center',
  },
  selectedContactsList: {
    flex: 1,
  },
  selectedContactItem: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  selectedContactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  selectedContactPhone: {
    fontSize: 12,
    fontWeight: '400',
    color: '#AEAEB2',
  },
  displayContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  phoneNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    paddingBottom: 12,
  },
  phoneNumberInput: {
    flex: 1,
    fontSize: 36,
    fontFamily: 'System',
    color: '#FFFFFF',
    textAlign: 'center',
    minHeight: 48,
    fontWeight: '600',
    letterSpacing: 1,
  },
  addButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  keypadContainer: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keypadButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  keypadNumber: {
    fontSize: 28,
    fontFamily: 'System',
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  keypadLetters: {
    fontSize: 11,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#AEAEB2',
    marginTop: -1,
    letterSpacing: 0.2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  deleteButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
});