import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Plane, Calendar, Briefcase, Clock, Edit3 } from 'lucide-react-native';
import { apiService } from '@/services/apiService';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';

interface InboundReasonModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (reason: string) => void;
}

type ReasonOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

export default function InboundReasonModal({ visible, onClose, onSave }: InboundReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const reasonOptions: ReasonOption[] = [
    { id: 'airplane', label: 'On a Flight', icon: <Plane size={20} color="#007AFF" /> },
    { id: 'meetings', label: 'In Meetings', icon: <Calendar size={20} color="#FF9500" /> },
    { id: 'work', label: 'Working', icon: <Briefcase size={20} color="#5856D6" /> },
    { id: 'busy', label: 'Just Busy', icon: <Clock size={20} color="#FF3B30" /> },
    { id: 'custom', label: 'Custom Reason', icon: <Edit3 size={20} color="#34C759" /> },
  ];

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      let finalReason = '';

      if (selectedReason === 'custom') {
        if (!customReason.trim()) {
          Alert.alert('Error', 'Please enter a custom reason');
          setIsSubmitting(false);
          return;
        }
        finalReason = customReason.trim();
      } else if (selectedReason) {
        // Get the label for the selected reason
        const option = reasonOptions.find(opt => opt.id === selectedReason);
        finalReason = option ? option.label : '';
      } else {
        Alert.alert('Error', 'Please select a reason');
        setIsSubmitting(false);
        return;
      }

      // Save the reason to the backend
      await apiService.saveInboundReason(finalReason);

      // Call the onSave callback
      onSave(finalReason);

      // Reset state and close modal
      setSelectedReason(null);
      setCustomReason('');
      onClose();

    } catch (error) {
      console.error('Failed to save inbound reason:', error);
      Alert.alert('Error', 'Failed to save reason. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ModalComponent = Platform.OS === 'web' ? WebModal : Modal;

  return (
    <ModalComponent
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Why are you unavailable?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalDescription}>
            Select a reason to help the HeyWay explain your unavailability to callers
          </Text>

          <View style={styles.reasonsContainer}>
            {reasonOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.reasonOption,
                  selectedReason === option.id && styles.selectedReasonOption
                ]}
                onPress={() => setSelectedReason(option.id)}
              >
                <View style={styles.reasonIconContainer}>
                  {option.icon}
                </View>
                <Text style={[
                  styles.reasonText,
                  selectedReason === option.id && styles.selectedReasonText
                ]}>
                  {option.label}
                </Text>
                {selectedReason === option.id && (
                  <View style={styles.checkmark}>
                    <Check size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedReason === 'custom' && (
            <TextInput
              style={styles.customReasonInput}
              placeholder="Enter your custom reason..."
              value={customReason}
              onChangeText={setCustomReason}
              multiline
              numberOfLines={2}
              maxLength={100}
            />
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedReason || (selectedReason === 'custom' && !customReason.trim())) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={isSubmitting || !selectedReason || (selectedReason === 'custom' && !customReason.trim())}
          >
            {isSubmitting ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <Text style={styles.saveButtonText}>Save Reason</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ModalComponent>
  );
}

// Web Modal component for React Native Web
const WebModal = ({ visible, children }: any) => {
  if (!visible) return null;

  return (
    <View style={webModalStyles.overlay}>
      <View style={webModalStyles.container}>
        {children}
      </View>
    </View>
  );
};

const webModalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.overlay,
  },
  modalContent: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    width: '90%',
    maxWidth: 500,
    padding: HEYWAY_SPACING.xl,
    ...HEYWAY_SHADOWS.light.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.lg,
  },
  modalTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  closeButton: {
    padding: HEYWAY_SPACING.xs,
  },
  modalDescription: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.xl,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  reasonsContainer: {
    marginBottom: HEYWAY_SPACING.xl,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  selectedReasonOption: {
    backgroundColor: HEYWAY_COLORS.interactive.selected,
    borderColor: HEYWAY_COLORS.status.success,
    ...HEYWAY_SHADOWS.light.sm,
  },
  reasonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: HEYWAY_RADIUS.xl,
    backgroundColor: HEYWAY_COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: HEYWAY_SPACING.md,
    ...HEYWAY_SHADOWS.light.xs,
  },
  reasonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    flex: 1,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  selectedReasonText: {
    color: HEYWAY_COLORS.text.primary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    backgroundColor: HEYWAY_COLORS.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...HEYWAY_SHADOWS.light.sm,
  },
  customReasonInput: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.input.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xl,
    minHeight: 80,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    ...HEYWAY_SHADOWS.light.xs,
  },
  saveButton: {
    backgroundColor: HEYWAY_COLORS.status.success,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    padding: HEYWAY_SPACING.lg,
    alignItems: 'center',
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.sm,
  },
  saveButtonDisabled: {
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});