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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#8E8E93',
    marginBottom: 20,
    lineHeight: 20,
  },
  reasonsContainer: {
    marginBottom: 20,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedReasonOption: {
    backgroundColor: '#E1F5E6',
    borderColor: '#34C759',
  },
  reasonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  reasonText: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  selectedReasonText: {
    color: '#000000',
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customReasonInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 16,
    fontFamily: 'System',
    color: '#000000',
    marginBottom: 20,
    minHeight: 80,
  },
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#FFFFFF',
  },
});