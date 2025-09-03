import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { X, FolderPlus } from 'lucide-react-native';

// Import HEYWAY Style Guide
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS } from '@styles/HEYWAY_STYLE_GUIDE';

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  visible,
  onClose,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');

  const handleCreate = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    onCreateGroup(groupName.trim());
    setGroupName('');
    onClose();
  };

  const handleClose = () => {
    setGroupName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <FolderPlus size={20} color={HEYWAY_COLORS.interactive.primary} />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Create Group</Text>
                <Text style={styles.subtitle}>Organize your calls into groups</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <X size={20} color={HEYWAY_COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Group Name</Text>
              <TextInput
                style={styles.textInput}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                maxLength={50}
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createButton,
                !groupName.trim() && styles.createButtonDisabled
              ]}
              onPress={handleCreate}
              activeOpacity={0.8}
              disabled={!groupName.trim()}
            >
              <Text style={[
                styles.createButtonText,
                !groupName.trim() && styles.createButtonTextDisabled
              ]}>
                Create Group
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: HEYWAY_SPACING.xl,
  },
  
  modalContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.lg,
    width: '100%',
    maxWidth: 400,
    ...HEYWAY_SHADOWS.light.lg,
    elevation: 8,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: HEYWAY_SPACING.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.divider,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: HEYWAY_SPACING.md,
  },
  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HEYWAY_COLORS.background.intelligenceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  titleContainer: {
    flex: 1,
    gap: HEYWAY_SPACING.xs,
  },
  
  title: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  
  subtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.content,
  },
  
  content: {
    padding: HEYWAY_SPACING.xl,
  },
  
  inputContainer: {
    gap: HEYWAY_SPACING.sm,
  },
  
  inputLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  
  textInput: {
    backgroundColor: HEYWAY_COLORS.background.content,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
    minHeight: 44,
  },
  
  footer: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.md,
    padding: HEYWAY_SPACING.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HEYWAY_COLORS.border.divider,
  },
  
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.md,
    backgroundColor: HEYWAY_COLORS.background.content,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  
  cancelButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  
  createButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.md,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
  },
  
  createButtonDisabled: {
    backgroundColor: HEYWAY_COLORS.background.content,
  },
  
  createButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.white,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  
  createButtonTextDisabled: {
    color: HEYWAY_COLORS.text.tertiary,
  },
});

export default CreateGroupModal;