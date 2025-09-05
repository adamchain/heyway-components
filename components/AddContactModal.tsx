import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { X, User, Phone, Mail } from 'lucide-react-native';
import { apiService } from '../services/apiService';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_TYPOGRAPHY, HEYWAY_SPACING, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';

interface AddContactModalProps {
  visible: boolean;
  onClose: () => void;
  onContactAdded?: (contact: any) => void;
  automationId?: string; // If provided, contact will be added to this automation
}

export default function AddContactModal({
  visible,
  onClose,
  onContactAdded,
  automationId
}: AddContactModalProps) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
  const modalAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(modalAnim, {
          toValue: 1,
          tension: 280,
          friction: 30,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 280,
          friction: 30,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const resetForm = () => {
    setName('');
    setPhoneNumber('');
    setEmail('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a contact name.');
      return false;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter a phone number.');
      return false;
    }

    // Basic phone number validation - allow various formats
    const phoneRegex = /^[\+]?[\d\s\-\(\)\.]{7,}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return false;
    }

    // Email validation if provided
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        Alert.alert('Validation Error', 'Please enter a valid email address.');
        return false;
      }
    }

    return true;
  };

  const handleAddContact = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const contactData = {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || undefined,
      };

      console.log('Creating contact:', contactData);

      // Create the contact
      const newContact = await apiService.createContact(contactData);

      console.log('Contact created successfully:', newContact);

      // If we have an automation ID, add the contact to that automation's contact list
      if (automationId && newContact) {
        console.log('Adding contact to automation contact list:', automationId);
        await apiService.addContactsToAutomationContactList(automationId, [newContact.id]);
        console.log('Contact added to automation contact list successfully');

        Alert.alert(
          'Success',
          `Contact "${newContact.name}" has been created and added to the automation's contact list.`
        );
      } else {
        Alert.alert('Success', `Contact "${newContact.name}" has been created successfully.`);
      }

      // Notify parent component
      onContactAdded?.(newContact);

      // Close modal
      handleClose();

    } catch (error) {
      console.error('Failed to create contact:', error);

      let errorMessage = 'Failed to create contact. Please try again.';

      if ((error as any)?.response?.status === 409) {
        errorMessage = 'A contact with this phone number or email already exists.';
      } else if ((error as any)?.response?.data?.message) {
        errorMessage = `Failed to create contact: ${(error as any).response.data.message}`;
      } else if ((error as any)?.response?.status) {
        errorMessage = `Failed to create contact: Server error (${(error as any).response.status})`;
      } else if (error instanceof Error) {
        errorMessage = `Failed to create contact: ${error.message}`;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalBackground}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: modalAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Contact</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isLoading}
              style={styles.closeButton}
            >
              <X size={24} color={isLoading ? HEYWAY_COLORS.text.tertiary : HEYWAY_COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <User size={16} color={HEYWAY_COLORS.text.secondary} />
                <Text style={styles.inputLabelText}>Name *</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter contact name"
                placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                editable={!isLoading}
                autoFocus
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Phone size={16} color={HEYWAY_COLORS.text.secondary} />
                <Text style={styles.inputLabelText}>Phone Number *</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter phone number"
                placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Mail size={16} color={HEYWAY_COLORS.text.secondary} />
                <Text style={styles.inputLabelText}>Email (Optional)</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
                placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.cancelButton, isLoading && styles.disabledButton]}
                onPress={handleClose}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addButton,
                  (isLoading || !name.trim() || !phoneNumber.trim()) && styles.disabledButton
                ]}
                onPress={handleAddContact}
                disabled={isLoading || !name.trim() || !phoneNumber.trim()}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={HEYWAY_COLORS.text.inverse} />
                ) : (
                  <Text style={styles.addButtonText}>Add Contact</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: HEYWAY_SPACING.lg,
  },
  modalContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.modal.lg,
    width: '100%',
    maxWidth: 400,
    ...HEYWAY_SHADOWS.light.xl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.divider,
    borderTopLeftRadius: HEYWAY_RADIUS.component.modal.lg,
    borderTopRightRadius: HEYWAY_RADIUS.component.modal.lg,
  },
  headerTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: HEYWAY_RADIUS.component.button.sm,
    backgroundColor: HEYWAY_COLORS.interactive.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  content: {
    padding: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.lg,
  },
  inputGroup: {
    gap: HEYWAY_SPACING.sm,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
  },
  inputLabelText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
  },
  textInput: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.input.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    color: HEYWAY_COLORS.text.primary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.md,
    marginTop: HEYWAY_SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.interactive.secondary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  addButton: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.colored.accent,
  },
  disabledButton: {
    backgroundColor: HEYWAY_COLORS.interactive.disabled,
    ...HEYWAY_SHADOWS.light.none,
  },
  cancelButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
  },
  addButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
  },
});