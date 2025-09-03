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
import { Delete, Plus, Phone, Search, User, Calendar, Send } from 'lucide-react-native';
import { ContactSelectionManager } from '@/utils/contactSelection';
import { useContacts } from '@/hooks/useContacts';
import { useAICallerPrompts } from '@/hooks/useAICallerPrompts';

import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';
// Using HEYWAY_COLORS from the style guide

interface CallPanelProps {
  onClose?: () => void;
  onAddToCallList?: (contact: any) => void;
  onStartCall?: (phoneNumber: string) => void;
  selectedContacts?: any[];
}

export default function CallPanel({ onClose, onAddToCallList, onStartCall, selectedContacts = [] }: CallPanelProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [callMessage, setCallMessage] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);

  const contacts = useContacts();
  const aiCallerPrompts = useAICallerPrompts();

  useEffect(() => {
    // Load contacts when component mounts
    if (contacts.contacts.length === 0) {
      contacts.loadContacts();
    }

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

  const handleCall = (number?: string) => {
    const numberToCall = number || phoneNumber;
    if (!numberToCall.trim()) {
      Alert.alert('No Number', 'Please enter a phone number first.');
      return;
    }

    if (onStartCall) {
      onStartCall(numberToCall);
    } else {
      Alert.alert('Call', `Would call ${numberToCall}`);
    }
  };

  const addNumberToCallList = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('No Number', 'Please enter a phone number first.');
      return;
    }

    try {
      const contact = {
        id: phoneNumber,
        name: phoneNumber,
        phoneNumber: phoneNumber,
      };

      if (onAddToCallList) {
        onAddToCallList(contact);
      }

      setPhoneNumber('');
      Alert.alert('Success', `Added ${phoneNumber} to call list`);
    } catch (error) {
      console.error('Failed to add number to call list:', error);
      Alert.alert('Error', 'Failed to add number to call list');
    }
  };

  const addContactToCallList = (contact: any) => {
    if (onAddToCallList) {
      onAddToCallList(contact);
    }
    Alert.alert('Success', `Added ${contact.name} to call list`);
  };

  const handleMakeCall = async () => {
    if (selectedContacts.length === 0) {
      Alert.alert('No Recipients', 'Please select contacts first.');
      return;
    }

    if (!callMessage.trim()) {
      Alert.alert('No Message', 'Please enter call instructions.');
      return;
    }

    try {
      await aiCallerPrompts.makeAICall({ recipients: selectedContacts, message: callMessage });
      setCallMessage('');
    } catch (error) {
      console.error('Failed to make call:', error);
    }
  };

  const handleScheduleCall = () => {
    // This would open the scheduler modal
    Alert.alert('Schedule Call', 'Schedule call functionality would be implemented here');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Filter contacts based on search query (only if 2+ characters)
  const filteredContacts = searchQuery.length >= 2 ? contacts.contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  ) : [];

  const renderKeypad = () => (
    <View style={styles.keypadView}>
      <View style={styles.displayContainer}>
        <View style={styles.phoneNumberContainer}>
          <TextInput
            style={styles.phoneNumberInput}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter number"
            placeholderTextColor={HEYWAY_COLORS.text.secondary}
            keyboardType="phone-pad"
          />
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
            style={styles.secondaryButton}
            onPress={addNumberToCallList}
            disabled={!phoneNumber}
          >
            <Plus size={20} color={phoneNumber ? HEYWAY_COLORS.status.success : HEYWAY_COLORS.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.callButton, !phoneNumber && styles.callButtonDisabled]}
            onPress={() => handleCall()}
            disabled={!phoneNumber}
          >
            <Phone size={24} color={HEYWAY_COLORS.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleKeypadDelete}
            disabled={!phoneNumber}
          >
            <Delete size={20} color={phoneNumber ? HEYWAY_COLORS.text.secondary : HEYWAY_COLORS.text.tertiary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderContacts = () => (
    <View style={styles.contactsView}>
      <View style={styles.searchContainer}>
        <Search size={16} color={HEYWAY_COLORS.text.secondary} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search contacts"
          placeholderTextColor={HEYWAY_COLORS.text.secondary}
        />
      </View>

      <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={false}>
        {filteredContacts.map((contact) => (
          <View key={contact.id} style={styles.contactItem}>
            <View style={styles.contactInfo}>
              <View style={styles.contactAvatar}>
                <User size={16} color={HEYWAY_COLORS.text.secondary} />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
              </View>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => addContactToCallList(contact)}
                activeOpacity={0.7}
              >
                <Plus size={14} color={HEYWAY_COLORS.status.success} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleCall(contact.phoneNumber)}
                activeOpacity={0.7}
              >
                <Phone size={16} color={HEYWAY_COLORS.interactive.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderCallPanel = () => (
    <View style={styles.callView}>
      {/* Selected Contacts */}
      {selectedContacts.length > 0 && (
        <View style={styles.selectedContactsSection}>
          <Text style={styles.sectionTitle}>Recipients ({selectedContacts.length})</Text>
          <ScrollView style={styles.selectedContactsList} showsVerticalScrollIndicator={false}>
            {selectedContacts.map((contact, index) => (
              <View key={index} style={styles.selectedContactItem}>
                <View style={styles.selectedContactIcon}>
                  <User size={12} color={HEYWAY_COLORS.text.secondary} />
                </View>
                <View style={styles.selectedContactDetails}>
                  <Text style={styles.selectedContactName}>{contact.name}</Text>
                  {contact.address && (
                    <Text style={styles.selectedContactAddress} numberOfLines={1}>
                      {contact.address}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Call Message Input */}
      <View style={styles.messageSection}>
        <Text style={styles.sectionTitle}>Call Instructions</Text>
        <TextInput
          style={styles.messageInput}
          multiline
          placeholder="Enter call instructions..."
          placeholderTextColor={HEYWAY_COLORS.text.secondary}
          value={callMessage}
          onChangeText={setCallMessage}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.callActions}>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={handleScheduleCall}
          activeOpacity={0.7}
        >
          <Calendar size={18} color={HEYWAY_COLORS.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendButton,
            (selectedContacts.length === 0 || !callMessage.trim()) && styles.sendButtonDisabled
          ]}
          onPress={handleMakeCall}
          disabled={selectedContacts.length === 0 || !callMessage.trim()}
          activeOpacity={0.8}
        >
          <Send size={18} color={HEYWAY_COLORS.text.primary} />
          <Text style={styles.sendButtonText}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <ScrollView
          style={[styles.scrollContainer, showKeypad && styles.scrollContainerWithKeypad]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Search size={14} color={HEYWAY_COLORS.text.secondary} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search contacts or enter number"
              placeholderTextColor={HEYWAY_COLORS.text.secondary}
              keyboardType="default"
            />
          </View>

          {/* Show Keypad Link */}
          <TouchableOpacity
            style={styles.showKeypadLink}
            onPress={() => setShowKeypad(!showKeypad)}
            activeOpacity={0.7}
          >
            <Text style={styles.showKeypadText}>
              {showKeypad ? 'Hide Keypad' : 'Show Keypad'}
            </Text>
          </TouchableOpacity>

          {/* Keypad - Collapsible */}
          {showKeypad && (
            <View style={styles.keypadContainer}>
              {keypadButtons.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.keypadRow}>
                  {row.map((button) => (
                    <TouchableOpacity
                      key={button.number}
                      style={styles.keypadButton}
                      onPress={() => {
                        handleKeyPress(button.number);
                        setSearchQuery(prev => prev + button.number);
                      }}
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

          {/* Selected Contacts */}
          {selectedContacts.length > 0 && (
            <View style={styles.selectedContactsSection}>
              <Text style={styles.sectionTitle}>Selected ({selectedContacts.length})</Text>
              <ScrollView style={styles.selectedContactsList} showsVerticalScrollIndicator={false}>
                {selectedContacts.map((contact, index) => (
                  <View key={index} style={styles.selectedContactItem}>
                    <View style={styles.selectedContactIcon}>
                      <User size={10} color={HEYWAY_COLORS.text.secondary} />
                    </View>
                    <View style={styles.selectedContactDetails}>
                      <Text style={styles.selectedContactName}>{contact.name}</Text>
                      {contact.phoneNumber && (
                        <Text style={styles.selectedContactAddress} numberOfLines={1}>
                          {contact.phoneNumber}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Call Message Input */}
          <View style={styles.messageSection}>
            <Text style={styles.sectionTitle}>Call Instructions</Text>
            <TextInput
              style={styles.messageInput}
              multiline
              placeholder="Enter call instructions..."
              placeholderTextColor={HEYWAY_COLORS.text.secondary}
              value={callMessage}
              onChangeText={setCallMessage}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.callActions}>
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={handleScheduleCall}
              activeOpacity={0.7}
            >
              <Calendar size={16} color={HEYWAY_COLORS.text.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                (selectedContacts.length === 0 || !callMessage.trim()) && styles.sendButtonDisabled
              ]}
              onPress={handleMakeCall}
              disabled={selectedContacts.length === 0 || !callMessage.trim()}
              activeOpacity={0.8}
            >
              <Send size={16} color='#ffffff' />
              <Text style={styles.sendButtonText}>Call</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Contact Results Overlay (if searching) */}
        {searchQuery.length >= 2 && filteredContacts.length > 0 && (
          <View style={styles.contactResultsOverlay}>
            <ScrollView style={styles.contactResults} showsVerticalScrollIndicator={false}>
              {filteredContacts.slice(0, 3).map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactResultItem}
                  onPress={() => addContactToCallList(contact)}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactInfo}>
                    <View style={styles.contactAvatar}>
                      <User size={10} color={HEYWAY_COLORS.text.secondary} />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
                    </View>
                  </View>
                  <Plus size={14} color={HEYWAY_COLORS.status.success} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '85%', // Make it 85% height as requested
    width: '30%', // Set to 30% width to be a right side panel
    position: 'absolute',
    right: HEYWAY_SPACING.xl,
    bottom: HEYWAY_SPACING.xl,
    backgroundColor: HEYWAY_COLORS.background.whatsappPanel,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    ...HEYWAY_SHADOWS.light.xl,
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingTop: HEYWAY_SPACING.xxl,
    paddingBottom: HEYWAY_SPACING.xxl,
  },

  // Missing styles for renderKeypad function
  keypadView: {
    flex: 1,
  },

  displayContainer: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.lg,
  },

  phoneNumberContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.input.lg,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },

  phoneNumberInput: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
  },

  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    backgroundColor: HEYWAY_COLORS.interactive.hover,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    ...HEYWAY_SHADOWS.light.xs,
  },

  callButton: {
    width: 64,
    height: 64,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    backgroundColor: HEYWAY_COLORS.status.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    ...HEYWAY_SHADOWS.light.md,
  },

  callButtonDisabled: {
    backgroundColor: HEYWAY_COLORS.text.tertiary,
    opacity: 0.6,
  },

  // Missing styles for renderContacts function
  contactsView: {
    flex: 1,
  },

  contactsList: {
    flex: 1,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },

  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Missing styles for renderCallPanel function
  callView: {
    flex: 1,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.input.lg,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    marginBottom: HEYWAY_SPACING.lg,
    ...HEYWAY_SHADOWS.light.xs,
  },

  searchInput: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    minHeight: 28,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  contactResultsOverlay: {
    position: 'absolute',
    top: 72,
    left: HEYWAY_SPACING.xl,
    right: HEYWAY_SPACING.xl,
    zIndex: 1000,
    backgroundColor: HEYWAY_COLORS.background.overlayDark,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    ...HEYWAY_SHADOWS.light.xl,
  },

  contactResults: {
    maxHeight: 140,
    backgroundColor: 'transparent',
  },

  contactResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.tertiary,
  },


  keypadContainer: {
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xl,
    marginBottom: HEYWAY_SPACING.xl,
  },

  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
  },

  keypadButton: {
    width: 60,
    height: 60,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    backgroundColor: HEYWAY_COLORS.interactive.hover,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    ...HEYWAY_SHADOWS.light.xs,
  },

  keypadNumber: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  keypadLetters: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.secondary,
    marginTop: -HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },


  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: HEYWAY_SPACING.md,
  },

  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: HEYWAY_RADIUS.component.avatar.md,
    backgroundColor: HEYWAY_COLORS.interactive.hover,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    ...HEYWAY_SHADOWS.light.xs,
  },

  contactDetails: {
    flex: 1,
  },

  contactName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  contactPhone: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  selectedContactsSection: {
    marginBottom: HEYWAY_SPACING.xl,
    maxHeight: 120, // Slightly increase max height
  },

  sectionTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.md,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  selectedContactsList: {
    flex: 1,
  },

  selectedContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.card.sm,
    marginBottom: HEYWAY_SPACING.xs,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },

  selectedContactIcon: {
    width: 24,
    height: 24,
    borderRadius: HEYWAY_RADIUS.component.avatar.sm,
    backgroundColor: HEYWAY_COLORS.interactive.hover,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HEYWAY_SPACING.sm,
  },

  selectedContactDetails: {
    flex: 1,
  },

  selectedContactName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  selectedContactAddress: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  messageSection: {
    marginBottom: HEYWAY_SPACING.xl,
    minHeight: 120, // Set minimum height instead of flex: 1
  },

  messageInput: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.input.lg,
    padding: HEYWAY_SPACING.lg,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    minHeight: 80,
    height: 80,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    textAlignVertical: 'top',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    ...HEYWAY_SHADOWS.light.xs,
  },

  callActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
    paddingBottom: HEYWAY_SPACING.xl,
    marginTop: HEYWAY_SPACING.sm,
  },

  scheduleButton: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    width: 48,
    height: 48,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },

  sendButton: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.status.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.xl,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    gap: HEYWAY_SPACING.sm,
    shadowColor: HEYWAY_COLORS.status.success,
    ...HEYWAY_SHADOWS.light.md,
  },

  sendButtonDisabled: {
    backgroundColor: HEYWAY_COLORS.text.tertiary,
    opacity: 0.6,
  },

  sendButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContainerWithKeypad: {
    // Additional styles when keypad is shown - could reduce available space for other content
    maxHeight: '85%',
  },

  scrollContent: {
    flexGrow: 1,
  },

  showKeypadLink: {
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.sm,
    marginBottom: HEYWAY_SPACING.sm,
  },

  showKeypadText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.interactive.primary,
    textDecorationLine: 'underline',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});