import React, { Suspense, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { X, Calendar } from 'lucide-react-native';

// Import HEYWAY Style Guide
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_COMPONENTS, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';

// Lazy loaded modal components
const NewCallModal = React.lazy(() => import('@/components/NewCallModal'));
const SettingsSidebar = React.lazy(() => import('@/components/SettingsSidebar'));
const InboundModal = React.lazy(() => import('@/components/InboundModal'));
const CreateAutomationModal = React.lazy(() => import('@/components/CreateAutomationModal'));
const CSVImportModal = React.lazy(() => import('@/components/CSVImportModal'));
const AddContactModal = React.lazy(() => import('@/components/AddContactModal'));
const NewUserOnboarding = React.lazy(() => import('@/components/NewUserOnboarding'));
const CallerIdPromptBanner = React.lazy(() => import('@/components/CallerIdPromptBanner'));
const ContactsCardView = React.lazy(() => import('@/components/ContactsCardView'));
const CreateGroupModal = React.lazy(() => import('@/components/CreateGroupModal'));

interface HomeModalsProps {
  // Modal visibility states
  showNewCallModal: boolean;
  showSettingsSidebar: boolean;
  showInboundModal: boolean;
  showCreateAutomationModal: boolean;
  showEditAutomationModal: boolean;
  showCSVImportModal: boolean;
  showAddContactModal: boolean;
  showAutomationContactsModal: boolean;
  showOnboarding: boolean;
  showCallerIdBanner: boolean;
  showCreateGroupModal: boolean;
  
  // Modal data
  selectedContacts: any[];
  editingAutomation: any;
  selectedContactsForAutomation: any[];
  
  // Modal handlers
  onCloseNewCallModal: () => void;
  onCloseSettingsSidebar: () => void;
  onCloseInboundModal: () => void;
  onCloseCreateAutomationModal: () => void;
  onCloseEditAutomationModal: () => void;
  onCloseCSVImportModal: () => void;
  onCloseAddContactModal: () => void;
  onCloseAutomationContactsModal: () => void;
  onCloseOnboarding: () => void;
  onDismissCallerIdBanner: () => void;
  onCloseCreateGroupModal: () => void;
  
  // Action handlers
  onCreateAutomation: (automationData: any) => Promise<void>;
  onEditAutomation: (automationData: any) => Promise<void>;
  onImportContacts: (contacts: any[], referenceDateColumn?: string) => Promise<void>;
  onAddContactsToAutomation: (contacts: any[]) => Promise<void>;
  onCompleteOnboarding: () => Promise<void>;
  onSkipOnboarding: () => Promise<void>;
  onNavigateToRecents: () => void;
  onCallerIdSetup: () => void;
  onCreateGroup: (groupName: string) => void;
  onContactSelectedForAutomation?: (contact: any) => void;
}

const HomeModals: React.FC<HomeModalsProps> = ({
  showNewCallModal,
  showSettingsSidebar,
  showInboundModal,
  showCreateAutomationModal,
  showEditAutomationModal,
  showCSVImportModal,
  showAddContactModal,
  showAutomationContactsModal,
  showOnboarding,
  showCallerIdBanner,
  showCreateGroupModal,
  selectedContacts,
  editingAutomation,
  selectedContactsForAutomation,
  onCloseNewCallModal,
  onCloseSettingsSidebar,
  onCloseInboundModal,
  onCloseCreateAutomationModal,
  onCloseEditAutomationModal,
  onCloseCSVImportModal,
  onCloseAddContactModal,
  onCloseAutomationContactsModal,
  onCloseOnboarding,
  onDismissCallerIdBanner,
  onCloseCreateGroupModal,
  onCreateAutomation,
  onEditAutomation,
  onImportContacts,
  onAddContactsToAutomation,
  onCompleteOnboarding,
  onSkipOnboarding,
  onNavigateToRecents,
  onCallerIdSetup,
  onCreateGroup,
  onContactSelectedForAutomation,
}) => {
  const [showReferenceDateModal, setShowReferenceDateModal] = useState(false);
  const [referenceDate, setReferenceDate] = useState(() => {
    // Pre-set to current date
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  });

  const handleAddContactsToAutomation = async (providedReferenceDate?: string) => {
    try {
      if (editingAutomation && selectedContactsForAutomation.length > 0) {
        // Add reference date to each contact if this is a date_offset automation
        let contactsWithReferenceDate = selectedContactsForAutomation;
        
        if (editingAutomation.triggerType === 'date_offset' && providedReferenceDate) {
          contactsWithReferenceDate = selectedContactsForAutomation.map(contact => ({
            ...contact,
            referenceDate: providedReferenceDate
          }));
          
          console.log('🔍 Adding contacts to date_offset automation:', {
            automationId: editingAutomation.id,
            automationType: editingAutomation.triggerType,
            providedReferenceDate,
            contactsCount: contactsWithReferenceDate.length,
            sampleContact: contactsWithReferenceDate[0]
          });
        }

        await onAddContactsToAutomation(contactsWithReferenceDate);
        Alert.alert(
          'Success',
          `Successfully added ${selectedContactsForAutomation.length} contacts to ${editingAutomation.name}.${editingAutomation.triggerType === 'date_offset' ? ' Calls will be scheduled based on their reference dates.' : ''}`
        );
        onCloseAutomationContactsModal();
        setShowReferenceDateModal(false);
      }
    } catch (error) {
      console.error('Failed to add contacts to automation:', error);
      Alert.alert('Error', 'Failed to add contacts to automation');
    }
  };

  return (
    <>
      {/* Caller ID Prompt Banner */}
      <Suspense fallback={null}>
        <CallerIdPromptBanner
          visible={showCallerIdBanner}
          onDismiss={onDismissCallerIdBanner}
        />
      </Suspense>

      {/* New Call Modal */}
      <Suspense fallback={null}>
        <NewCallModal
          visible={showNewCallModal}
          onClose={onCloseNewCallModal}
          preSelectedContacts={selectedContacts}
          onNavigateToRecents={onNavigateToRecents}
        />
      </Suspense>

      {/* Settings Sidebar */}
      <Suspense fallback={null}>
        <SettingsSidebar
          visible={showSettingsSidebar}
          onClose={onCloseSettingsSidebar}
          onCallerIdSetup={onCallerIdSetup}
        />
      </Suspense>

      {/* Inbound Modal */}
      <Suspense fallback={null}>
        <InboundModal
          visible={showInboundModal}
          onClose={onCloseInboundModal}
        />
      </Suspense>

      {/* Automation Modals */}
      <Suspense fallback={null}>
        <CreateAutomationModal
          visible={showCreateAutomationModal}
          onClose={onCloseCreateAutomationModal}
          onSave={onCreateAutomation}
          editingAutomation={null}
        />
        <CreateAutomationModal
          visible={showEditAutomationModal}
          onClose={onCloseEditAutomationModal}
          onSave={onEditAutomation}
          editingAutomation={editingAutomation}
        />
      </Suspense>

      {/* Contacts Modals */}
      <Suspense fallback={null}>
        <CSVImportModal
          visible={showCSVImportModal}
          onClose={onCloseCSVImportModal}
          title={editingAutomation ? `Import Contacts for ${editingAutomation.name}` : 'Import Contacts'}
          subtitle={editingAutomation ?
            editingAutomation.triggerType === 'date_offset'
              ? "Select a CSV file with contact information and specify which column contains the reference date"
              : "Select a CSV file with contact information"
            : "Import contacts from a CSV file"
          }
          requireReferenceDate={!!editingAutomation && editingAutomation.triggerType === 'date_offset'}
          onImport={editingAutomation ? async (contacts, referenceDateColumn) => {
            try {
              // Validate required data
              if (editingAutomation.triggerType === 'date_offset' && !referenceDateColumn) {
                Alert.alert('Missing Reference Date', 'Please select a reference date column for this automation.');
                return;
              }

              console.log('🔍 Automation import debug:', {
                automationId: editingAutomation.id,
                automationType: editingAutomation.triggerType,
                contactsCount: contacts.length,
                referenceDateColumn,
                hasReferenceDate: !!referenceDateColumn
              });

              await onImportContacts(contacts, referenceDateColumn);
              Alert.alert(
                'Import Complete',
                `Successfully imported ${contacts.length} contacts for automation. ${editingAutomation.triggerType === 'date_offset' ? 'Calls will be scheduled based on their reference dates.' : 'Calls will be scheduled according to the automation settings.'}`
              );
              onCloseCSVImportModal();
            } catch (error) {
              console.error('Failed to import contacts to automation:', error);
              const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error occurred';
              Alert.alert('Import Failed', `There was an error importing contacts: ${errorMessage}`);
            }
          } : async (contacts) => {
            try {
              console.log('🔍 Direct contact import:', {
                contactsCount: contacts.length
              });

              // Convert contacts array to CSV format
              const csvHeaders = 'name,phone,email\n';
              const csvRows = contacts.map(contact =>
                `${contact.name || ''},${contact.phone || ''},${contact.email || ''}`
              ).join('\n');
              const csvData = csvHeaders + csvRows;

              await onImportContacts(contacts);
              Alert.alert(
                'Import Complete',
                `Successfully imported ${contacts.length} contacts.`
              );
              onCloseCSVImportModal();
            } catch (error) {
              console.error('Failed to import contacts:', error);
              const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error occurred';
              Alert.alert('Import Failed', `There was an error importing contacts: ${errorMessage}`);
            }
          }}
          onImportComplete={!editingAutomation ? () => {
            onCloseCSVImportModal();
            // Refresh contacts if needed
          } : undefined}
        />
      </Suspense>

      {/* Add Contact Modal */}
      <Suspense fallback={null}>
        <AddContactModal
          visible={showAddContactModal}
          onClose={onCloseAddContactModal}
          automationId={editingAutomation?.id}
          onContactAdded={(newContact) => {
            console.log('New contact added:', newContact);
            // Refresh any relevant data if needed
          }}
        />
      </Suspense>

      {/* Automation Contact Selection Modal */}
      <Modal
        visible={showAutomationContactsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={onCloseAutomationContactsModal}
              style={styles.modalCloseButton}
            >
              <X size={20} color={HEYWAY_COLORS.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Add Contacts to {editingAutomation?.name}
            </Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ContactsCardView
            activeSection="all"
            onAddToCallList={(contact) => {
              console.log('Contact selected for automation:', contact);
              // Use the parent component's handler to update selected contacts
              if (onContactSelectedForAutomation) {
                onContactSelectedForAutomation(contact);
              }
            }}
            onSectionChange={() => { }}
            onImportContacts={() => { }}
            onAddContact={() => { }}
          />

          {selectedContactsForAutomation.length > 0 && (
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.addToAutomationButton}
                onPress={() => {
                  if (editingAutomation && selectedContactsForAutomation.length > 0) {
                    // Check if this is a date_offset automation
                    if (editingAutomation.triggerType === 'date_offset') {
                      setShowReferenceDateModal(true);
                    } else {
                      // For non-date_offset automations, add contacts directly
                      handleAddContactsToAutomation();
                    }
                  }
                }}
              >
                <Text style={styles.addToAutomationButtonText}>
                  Add {selectedContactsForAutomation.length} Contact{selectedContactsForAutomation.length !== 1 ? 's' : ''} to Automation
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* New User Onboarding */}
      <Suspense fallback={null}>
        <NewUserOnboarding
          visible={showOnboarding}
          onComplete={onCompleteOnboarding}
          onSkip={onSkipOnboarding}
        />
      </Suspense>

      {/* Create Group Modal */}
      <Suspense fallback={null}>
        <CreateGroupModal
          visible={showCreateGroupModal}
          onClose={onCloseCreateGroupModal}
          onCreateGroup={onCreateGroup}
        />
      </Suspense>

      {/* Reference Date Modal */}
      <Modal
        visible={showReferenceDateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={styles.referenceDateModalOverlay}>
          <View style={styles.referenceDateModalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowReferenceDateModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={20} color={HEYWAY_COLORS.text.secondary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Reference Date</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <View style={styles.referenceDateContent}>
              <Text style={styles.referenceDateDescription}>
                This automation schedules calls "{editingAutomation?.offsetDays} days {editingAutomation?.offsetDirection}" a reference date.
                {'\n\n'}Choose the reference date for these {selectedContactsForAutomation.length} contacts:
              </Text>

              <View style={styles.dateInputContainer}>
                <Calendar size={20} color={HEYWAY_COLORS.interactive.primary} />
                <TextInput
                  style={styles.dateInput}
                  value={referenceDate}
                  onChangeText={setReferenceDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                />
              </View>

              <View style={styles.referenceDateActions}>
                <TouchableOpacity
                  style={styles.referenceDateCancelButton}
                  onPress={() => setShowReferenceDateModal(false)}
                >
                  <Text style={styles.referenceDateCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.referenceDateConfirmButton}
                  onPress={() => handleAddContactsToAutomation(referenceDate)}
                >
                  <Text style={styles.referenceDateConfirmText}>
                    Add Contacts
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // WhatsApp-inspired modal container
  modalContainer: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    maxWidth: 600,
    borderRadius: HEYWAY_RADIUS.xl,
    ...HEYWAY_SHADOWS.light.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    backgroundColor: HEYWAY_COLORS.interactive.whatsappDark,
    ...HEYWAY_SHADOWS.light.sm,
    borderTopLeftRadius: HEYWAY_RADIUS.xl,
    borderTopRightRadius: HEYWAY_RADIUS.xl,
  },
  modalCloseButton: {
    width: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    height: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    borderRadius: HEYWAY_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse, // White text for dark header
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  modalHeaderSpacer: {
    width: 36,
  },
  modalFooter: {
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.xl,
    borderTopWidth: 0.5,
    borderTopColor: HEYWAY_COLORS.border.secondary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    ...HEYWAY_SHADOWS.light.xs,
    borderBottomLeftRadius: HEYWAY_RADIUS.xl,
    borderBottomRightRadius: HEYWAY_RADIUS.xl,
  },
  addToAutomationButton: {
    backgroundColor: HEYWAY_COLORS.interactive.whatsappGreen,
    borderRadius: HEYWAY_RADIUS.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.light.md,
  },
  addToAutomationButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },

  // Reference Date Modal - WhatsApp-inspired
  referenceDateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 20, 26, 0.7)', // WhatsApp dark overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: HEYWAY_SPACING.xl,
  },
  referenceDateModalContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.xl,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.light.xl,
  },
  referenceDateContent: {
    padding: HEYWAY_SPACING.xl,
  },
  referenceDateDescription: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: HEYWAY_SPACING.xl,
    textAlign: 'center',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.lg,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    borderWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.secondary,
    marginBottom: HEYWAY_SPACING.xl,
    ...HEYWAY_SHADOWS.light.xs,
  },
  dateInput: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
  },
  referenceDateActions: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.md,
  },
  referenceDateCancelButton: {
    flex: 1,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.xl,
    borderRadius: HEYWAY_RADIUS.lg,
    borderWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.secondary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    alignItems: 'center',
    ...HEYWAY_SHADOWS.light.xs,
  },
  referenceDateCancelText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
  },
  referenceDateConfirmButton: {
    flex: 1,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.xl,
    borderRadius: HEYWAY_RADIUS.lg,
    backgroundColor: HEYWAY_COLORS.interactive.whatsappGreen,
    alignItems: 'center',
    ...HEYWAY_SHADOWS.light.md,
  },
  referenceDateConfirmText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
  },
});

export default HomeModals;
