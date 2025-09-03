import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {
  Clock,
  Users,
  Plus,
  Settings,
  Upload,
  Trash2,
  Play,
  Pause,
  Edit3,
  Target,
  ChevronRight,
  X,
  Check,
  UserPlus,
  Building,
  Phone,
  List,
  Search,
  RefreshCw,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '@/components/designSystem';
import CSVImportModal from './CSVImportModal';
import ImportResultsModal from './ImportResultsModal';
import CreateAutomationModal, { Automation, CreateAutomationModalProps } from './CreateAutomationModal';
import { apiService } from '@/services/apiService';
import { useRealTimeAutomations } from '@/hooks/useRealTimeAutomations';

// Import HEYWAY Style Guide
//import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS } from '@/styles/HEYWAY_STYLE_GUIDE';
import { HEYWAY_COLORS } from '@/styles/HEYWAY_STYLE_GUIDE';



interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
}

interface BusinessResult {
  id: string;
  name: string;
  phoneNumber: string;
  address?: string;
  rating?: number;
}

interface ContactList {
  id: string;
  name: string;
  contacts: Contact[];
}


export default function AutomationsManager() {
  // Use real-time automations hook
  const {
    automations,
    isLoading,
    error: realTimeError,
    lastUpdated,
    refresh: refreshAutomations,
    setAutomations
  } = useRealTimeAutomations({
    enabled: true,
    pollingInterval: 5000, // Poll every 5 seconds
    onUpdate: (updatedAutomations) => {
      console.log('🔄 Automations updated via real-time polling:', updatedAutomations.length);
    }
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showImportResults, setShowImportResults] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [importExecutionResult, setImportExecutionResult] = useState<any>(null);
  const [preImportEstimate, setPreImportEstimate] = useState<number | null>(null);
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);
  const [expandedAutomation, setExpandedAutomation] = useState<string | null>(null);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [availableContactLists, setAvailableContactLists] = useState<ContactList[]>([]);
  const [selectedContactsForAutomation, setSelectedContactsForAutomation] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<'contacts' | 'lists' | 'business'>('contacts');
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [businessSearchResults, setBusinessSearchResults] = useState<BusinessResult[]>([]);

  useEffect(() => {
    loadContactsAndLists();
  }, []);

  const loadContactsAndLists = async () => {
    try {
      const [contacts, contactLists] = await Promise.all([
        apiService.getContacts(),
        apiService.getContactLists()
      ]);
      setAvailableContacts(contacts);
      setAvailableContactLists(contactLists);
    } catch (error) {
      console.error('Failed to load contacts and lists:', error);
    }
  };

  const loadAutomations = async () => {
    // This function is now handled by the useRealTimeAutomations hook
    // Just call the refresh function instead
    await refreshAutomations();
  };

  const handleCreateAutomation = async (automationData: Partial<Automation>) => {
    try {
      const newAutomation = await apiService.createAutomation({
        name: automationData.name!,
        description: automationData.description || '',
        triggerType: automationData.triggerType || 'date_offset',
        offsetDays: automationData.offsetDays,
        offsetDirection: automationData.offsetDirection,
        offsetTime: automationData.offsetTime,
        onDate: automationData.onDate,
        onTime: automationData.onTime,
        aiInstructions: automationData.aiInstructions!,
        voiceMessage: automationData.voiceMessage,
        voiceAudioUri: automationData.voiceAudioUri,
        voiceAudioDuration: automationData.voiceAudioDuration,
        isActive: false, // Start as paused
      });

      await refreshAutomations(); // Refresh the list with real-time hook
      Alert.alert('Success', 'Automation created successfully! It starts paused - activate it when ready.');
    } catch (error) {
      console.error('Failed to create automation:', error);
      Alert.alert('Error', 'Failed to create automation');
    }
  };

  const handleEditAutomation = async (automationData: Partial<Automation>) => {
    try {
      if (!editingAutomation) return;

      await apiService.updateAutomation(editingAutomation.id, {
        name: automationData.name,
        description: automationData.description,
        triggerType: automationData.triggerType,
        offsetDays: automationData.offsetDays,
        offsetDirection: automationData.offsetDirection,
        offsetTime: automationData.offsetTime,
        onDate: automationData.onDate,
        onTime: automationData.onTime,
        aiInstructions: automationData.aiInstructions,
        voiceMessage: automationData.voiceMessage,
        voiceAudioUri: automationData.voiceAudioUri,
        voiceAudioDuration: automationData.voiceAudioDuration,
      });

      setEditingAutomation(null);
      await refreshAutomations(); // Refresh the list with real-time hook
      Alert.alert('Success', 'Automation updated successfully!');
    } catch (error) {
      console.error('Failed to update automation:', error);
      Alert.alert('Error', 'Failed to update automation');
    }
  };

  const toggleAutomation = async (automationId: string) => {
    try {
      console.log('🔍 Toggling automation with ID:', automationId);
      console.log('🔍 Available automations:', automations.map(a => ({ id: a.id, name: a.name })));

      if (!automationId) {
        console.error('❌ Automation ID is undefined or null');
        return;
      }

      const automation = automations.find(a => a.id === automationId);
      if (!automation) {
        console.error('❌ Automation not found with ID:', automationId);
        console.log('Available automations:', automations.map(a => ({ id: a.id, name: a.name })));
        return;
      }

      console.log('✅ Found automation:', { id: automation.id, name: automation.name, isActive: automation.isActive });

      // Optimistic update for immediate UI feedback
      setAutomations(prev => prev.map(a =>
        a.id === automationId
          ? { ...a, isActive: !a.isActive }
          : a
      ));

      await apiService.toggleAutomation(automationId, !automation.isActive);
      // Real-time polling will update the state automatically, but we can also force a refresh
      await refreshAutomations();
    } catch (error: any) {
      console.error('❌ Failed to toggle automation:', error);
      console.log('Error type:', typeof error);
      console.log('Error structure:', error);

      // Revert optimistic update on error
      setAutomations(prev => prev.map(a =>
        a.id === automationId
          ? { ...a, isActive: !a.isActive } // Revert to original state
          : a
      ));

      // Handle the specific "Cannot read property 'data' of undefined" error
      if (error && error.message && error.message.includes("Cannot read property 'data' of undefined")) {
        console.error('🔍 Detected "data of undefined" error - this suggests a response structure issue');
        Alert.alert('Error', 'Failed to update automation status: Server response format error');
        return;
      }

      let errorMessage = 'Failed to update automation status';
      if (error && typeof error === 'object') {
        // Axios error structure
        if ('isAxiosError' in error && error.isAxiosError) {
          if (error.response) {
            if (error.response?.data && error.response.data.error) {
              errorMessage += `: ${error.response.data.error}`;
            } else if (typeof error.response.data === 'string') {
              errorMessage += `: ${error.response.data}`;
            } else if (error.response.status) {
              errorMessage += ` (HTTP ${error.response.status})`;
            }
          } else if (error.message) {
            errorMessage += `: ${error.message}`;
          }
        } else if ('message' in error && error.message) {
          errorMessage += `: ${error.message}`;
        }
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`;
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const deleteAutomation = async (automationId: string) => {
    Alert.alert(
      'Delete Automation',
      'Are you sure you want to delete this automation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAutomation(automationId);
              // Remove from local state immediately for better UX
              setAutomations(prev => prev.filter(a => a.id !== automationId));
              Alert.alert('Success', 'Automation deleted successfully');
            } catch (error: any) {
              // Log automationId for debugging
              console.error(`Failed to delete automation (id: ${automationId}):`, error);
              let errorMessage = `Failed to delete automation (id: ${automationId})`;
              // AxiosError type guard
              if (error && typeof error === 'object') {
                if (
                  'isAxiosError' in error && error.isAxiosError &&
                  error.response && error.response?.data
                ) {
                  if (error.response?.data?.error) {
                    errorMessage += `: ${error.response.data.error}`;
                  } else if (typeof error.response?.data === 'string') {
                    errorMessage += `: ${error.response.data}`;
                  }
                } else if ('message' in error && error.message) {
                  errorMessage += `: ${error.message}`;
                }
              }
              Alert.alert('Error', errorMessage);
            }
          }
        }
      ]
    );
  };

  const handleImportContacts = async (contacts: any[], automationId: string, referenceDateColumn?: string) => {
    try {
      console.log('🔄 Starting contact import...', { automationId, contactsLength: contacts.length });

      // Store the pre-import estimate for discrepancy notice
      setPreImportEstimate(contacts.length);

      const result = await apiService.executeAutomation(automationId, contacts, referenceDateColumn);

      // Extract execution result from API response
      const executionResult = result.result;
      console.log('✅ Contact import completed successfully', executionResult);

      // Store results and show modal
      setImportExecutionResult(executionResult);
      setShowImportResults(true);

      // Refresh automations to get updated contact counts
      await refreshAutomations();
    } catch (error) {
      console.error('❌ Failed to import contacts for automation:', error);
      Alert.alert('Error', 'Failed to import contacts for automation');
    }
  };

  const handleAddContactsToAutomation = async (automationId: string, contacts: Contact[]) => {
    try {
      // First, check if the automation is active, if not, activate it
      const automation = automations.find(a => a.id === automationId);
      if (!automation) {
        Alert.alert('Error', 'Automation not found');
        return;
      }

      if (!automation.isActive) {
        // Ask user if they want to activate the automation
        Alert.alert(
          'Automation Inactive',
          'This automation is currently paused. Would you like to activate it to add contacts?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Activate & Add',
              style: 'default',
              onPress: async () => {
                try {
                  // Activate the automation first
                  await apiService.toggleAutomation(automationId, true);

                  // Then add the contacts
                  await addContactsToAutomation(automationId, contacts);
                } catch (error) {
                  console.error('Failed to activate automation:', error);
                  Alert.alert('Error', 'Failed to activate automation');
                }
              }
            }
          ]
        );
        return;
      }

      // If automation is already active, just add contacts
      await addContactsToAutomation(automationId, contacts);
    } catch (error) {
      console.error('Failed to add contacts to automation:', error);
      Alert.alert('Error', 'Failed to add contacts to automation');
    }
  };

  const addContactsToAutomation = async (automationId: string, contacts: Contact[]) => {
    try {
      // Convert contacts to the format expected by the API
      const contactData = contacts.map(contact => ({
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        email: contact.email
      }));

      await apiService.addContactsToAutomation(automationId, contactData);

      Alert.alert(
        'Success',
        `Successfully added ${contacts.length} contacts to automation.`
      );

      // Refresh automations to get updated contact counts
      await refreshAutomations();
      setShowContactsModal(false);
      setSelectedContactsForAutomation([]);
    } catch (error) {
      console.error('Failed to add contacts to automation:', error);
      Alert.alert('Error', 'Failed to add contacts to automation');
    }
  };

  const openContactsModal = (automationId: string) => {
    setSelectedAutomation(automationId);
    setShowContactsModal(true);
    setSelectedContactsForAutomation([]);
  };

  const performBusinessSearch = async () => {
    if (!businessSearchQuery.trim()) return;

    try {
      const results = await apiService.searchBusinesses({
        query: businessSearchQuery.trim()
      });
      setBusinessSearchResults(results);
    } catch (error) {
      console.error('Failed to search businesses:', error);
      Alert.alert('Error', 'Failed to search businesses');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading automations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Navigation */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Automations</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.6}
            >
              <Plus size={16} color={HEYWAY_COLORS.text.secondary} />
              <Text style={styles.headerActionText}>New Automation</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            {automations.length} automation{automations.length !== 1 ? 's' : ''}
          </Text>
          {lastUpdated && (
            <View style={styles.realTimeIndicator}>
              <RefreshCw size={12} color={HEYWAY_COLORS.status.success} />
              <Text style={styles.lastUpdatedText}>
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.description}>
          Automate appointment reminders, follow-ups, and customer outreach based on reference dates
        </Text>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {automations.length === 0 ? (
            <View style={styles.emptyState}>
              <Target size={48} color={COLORS.text.tertiary} />
              <Text style={styles.emptyStateTitle}>No Automations Yet</Text>
              <Text style={styles.emptyText}>
                Create your first automation to start automating your customer communications
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createButtonText}>Create Automation</Text>
              </TouchableOpacity>
            </View>
          ) : (
            automations.map((automation) => (
              <View key={automation.id} style={styles.automationCard}>
                <TouchableOpacity
                  style={styles.automationCardContent}
                  onPress={() => setExpandedAutomation(
                    expandedAutomation === automation.id ? null : automation.id
                  )}
                  activeOpacity={0.8}
                >
                  {/* Automation Icon and Header Row */}
                  <View style={styles.automationHeader}>
                    <View style={styles.automationIconContainer}>
                      <View style={styles.automationIcon}>
                        <Text style={styles.automationIconText}>
                          {automation.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.automationInfo}>
                        <View style={styles.automationTitleRow}>
                          <Text style={styles.automationName} numberOfLines={1}>
                            {automation.name}
                          </Text>
                          <View style={[styles.statusIndicator, { backgroundColor: automation.isActive ? HEYWAY_COLORS.status.success : HEYWAY_COLORS.status.warning }]} />
                        </View>
                        <Text style={styles.automationDescription} numberOfLines={1}>
                          {automation.description}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.automationActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleAutomation(automation.id);
                        }}
                        activeOpacity={0.7}
                      >
                        {automation.isActive ? (
                          <Pause size={14} color={HEYWAY_COLORS.text.secondary} />
                        ) : (
                          <Play size={14} color={HEYWAY_COLORS.text.secondary} />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          setEditingAutomation(automation);
                          setShowCreateModal(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <Edit3 size={14} color={HEYWAY_COLORS.interactive.primary} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          deleteAutomation(automation.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={14} color={HEYWAY_COLORS.status.error} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Footer Row - Trigger and Stats */}
                  <View style={styles.automationFooter}>
                    <View style={styles.triggerInfo}>
                      <Clock size={12} color={HEYWAY_COLORS.text.secondary} />
                      <Text style={styles.triggerText} numberOfLines={1}>
                        {automation.offsetDirection
                          ? `${automation.offsetDays === 0 ? 'Same day' :
                            `${automation.offsetDays} ${automation.offsetDays === 1 ? 'day' : 'days'} ${automation.offsetDirection}`} at ${automation.offsetTime}`
                          : `${automation.offsetDays === 0 ? 'Same day' :
                            automation.offsetDays > 0 ? `${automation.offsetDays} days after` :
                              `${Math.abs(automation.offsetDays)} days before`} at ${automation.offsetTime}`}
                      </Text>
                    </View>
                    <View style={styles.statsInfo}>
                      <Text style={styles.statText}>{automation.contactsCount} contacts</Text>
                      {automation.pendingCount > 0 && (
                        <Text style={styles.pendingText}>{automation.pendingCount} pending</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {expandedAutomation === automation.id && (
                  <View style={styles.automationDetails}>
                    {/* Stats */}
                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{automation.completedCount}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{automation.pendingCount}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                          {automation.contactsCount > 0
                            ? Math.round((automation.completedCount / automation.contactsCount) * 100)
                            : 0}%
                        </Text>
                        <Text style={styles.statLabel}>Success Rate</Text>
                      </View>
                    </View>

                    {/* AI Instructions */}
                    <View style={styles.instructionsContainer}>
                      <Text style={styles.instructionsLabel}>Call Prompt:</Text>
                      <Text style={styles.instructionsText}>{automation.aiInstructions}</Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity
                        style={styles.expandedActionButton}
                        onPress={() => openContactsModal(automation.id)}
                        activeOpacity={0.7}
                      >
                        <UserPlus size={16} color={COLORS.accent} />
                        <Text style={styles.actionButtonText}>Add Contacts</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.expandedActionButton}
                        onPress={() => {
                          setSelectedAutomation(automation.id);
                          setShowImportModal(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <Upload size={16} color={COLORS.accent} />
                        <Text style={styles.actionButtonText}>Import CSV</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.expandedActionButton}
                        onPress={() => toggleAutomation(automation.id)}
                        activeOpacity={0.7}
                      >
                        {automation.isActive ? (
                          <Pause size={16} color={COLORS.warning} />
                        ) : (
                          <Play size={16} color={COLORS.success} />
                        )}
                        <Text style={styles.actionButtonText}>
                          {automation.isActive ? 'Pause' : 'Resume'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.expandedActionButton}
                        onPress={() => {
                          setEditingAutomation(automation);
                          setShowCreateModal(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <Edit3 size={16} color={COLORS.text.secondary} />
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.expandedActionButton}
                        onPress={() => deleteAutomation(automation.id)}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={16} color={COLORS.error} />
                        <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Create/Edit Automation Modal */}
      <CreateAutomationModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAutomation(null);
        }}
        onSave={editingAutomation ? handleEditAutomation : handleCreateAutomation}
        editingAutomation={editingAutomation}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        visible={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setSelectedAutomation(null);
        }}
        onImport={(contacts, referenceDateColumn) => {
          if (selectedAutomation) {
            handleImportContacts(contacts, selectedAutomation, referenceDateColumn);
          }
          setShowImportModal(false);
          setSelectedAutomation(null);
        }}
        title="Import Contacts for Automation"
        subtitle={selectedAutomation && automations.find(a => a.id === selectedAutomation)?.triggerType === 'date_offset'
          ? "Select a CSV file with contact information and specify which column contains the reference date"
          : "Select a CSV file with contact information"}
        requireReferenceDate={selectedAutomation ? automations.find(a => a.id === selectedAutomation)?.triggerType === 'date_offset' : false}
      />

      {/* Import Results Modal */}
      <ImportResultsModal
        visible={showImportResults}
        onClose={() => {
          setShowImportResults(false);
          setImportExecutionResult(null);
          setPreImportEstimate(null);
        }}
        executionResult={importExecutionResult}
        preImportEstimate={preImportEstimate ?? undefined}
        title="Automation Import Results"
      />

      {/* Add Contacts Modal */}
      <Modal
        visible={showContactsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Contacts to Automation</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowContactsModal(false)}
            >
              <X size={24} color={HEYWAY_COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Tabs for different contact sources */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
                onPress={() => setActiveTab('contacts')}
              >
                <Users size={16} color={HEYWAY_COLORS.text.primary} />
                <Text style={styles.tabText}>Contacts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'lists' && styles.activeTab]}
                onPress={() => setActiveTab('lists')}
              >
                <List size={16} color={HEYWAY_COLORS.text.primary} />
                <Text style={styles.tabText}>Lists</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'business' && styles.activeTab]}
                onPress={() => setActiveTab('business')}
              >
                <Building size={16} color={HEYWAY_COLORS.text.primary} />
                <Text style={styles.tabText}>Business</Text>
              </TouchableOpacity>
            </View>

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <View style={styles.tabContent}>
                <FlatList
                  data={availableContacts}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.contactItem,
                        selectedContactsForAutomation.some(c => c.id === item.id) && styles.selectedContactItem
                      ]}
                      onPress={() => {
                        const isSelected = selectedContactsForAutomation.some(c => c.id === item.id);
                        if (isSelected) {
                          setSelectedContactsForAutomation(prev =>
                            prev.filter(c => c.id !== item.id)
                          );
                        } else {
                          setSelectedContactsForAutomation(prev => [...prev, item]);
                        }
                      }}
                    >
                      <View style={styles.contactItemContent}>
                        <Text style={styles.contactName}>{item.name}</Text>
                        <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
                      </View>
                      {selectedContactsForAutomation.some(c => c.id === item.id) && (
                        <Check size={20} color={HEYWAY_COLORS.interactive.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Contact Lists Tab */}
            {activeTab === 'lists' && (
              <View style={styles.tabContent}>
                <FlatList
                  data={availableContactLists}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.contactListItem}
                      onPress={() => {
                        // Add all contacts from this list
                        const newContacts = item.contacts.filter(contact =>
                          !selectedContactsForAutomation.some(c => c.id === contact.id)
                        );
                        setSelectedContactsForAutomation(prev => [...prev, ...newContacts]);
                        Alert.alert('Success', `Added ${newContacts.length} contacts from ${item.name}`);
                      }}
                    >
                      <View style={styles.contactListItemContent}>
                        <Text style={styles.contactListName}>{item.name}</Text>
                        <Text style={styles.contactListCount}>{item.contacts.length} contacts</Text>
                      </View>
                      <Plus size={20} color={HEYWAY_COLORS.interactive.primary} />
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Business Search Tab */}
            {activeTab === 'business' && (
              <View style={styles.tabContent}>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search for businesses..."
                    placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                    value={businessSearchQuery}
                    onChangeText={setBusinessSearchQuery}
                  />
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={performBusinessSearch}
                  >
                    <Search size={20} color={HEYWAY_COLORS.text.primary} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={businessSearchResults}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.businessItem}
                      onPress={() => {
                        const contact: Contact = {
                          id: item.id,
                          name: item.name,
                          phoneNumber: item.phoneNumber
                        };
                        if (!selectedContactsForAutomation.some(c => c.phoneNumber === contact.phoneNumber)) {
                          setSelectedContactsForAutomation(prev => [...prev, contact]);
                        }
                      }}
                    >
                      <View style={styles.businessItemContent}>
                        <Text style={styles.businessName}>{item.name}</Text>
                        <Text style={styles.businessPhone}>{item.phoneNumber}</Text>
                        {item.address && (
                          <Text style={styles.businessAddress}>{item.address}</Text>
                        )}
                      </View>
                      <Plus size={20} color={HEYWAY_COLORS.interactive.primary} />
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Selected Contacts Summary */}
            {selectedContactsForAutomation.length > 0 && (
              <View style={styles.selectedContactsSummary}>
                <Text style={styles.summaryTitle}>
                  Selected: {selectedContactsForAutomation.length} contacts
                </Text>
                <TouchableOpacity
                  style={styles.addToAutomationButton}
                  onPress={() => {
                    if (selectedAutomation) {
                      handleAddContactsToAutomation(selectedAutomation, selectedContactsForAutomation);
                    }
                  }}
                >
                  <Text style={styles.addToAutomationButtonText}>
                    Add to Automation
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },

  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
  },

  headerActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.3,
  },

  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  subtitle: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
  },

  realTimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.success,
  },

  lastUpdatedText: {
    fontSize: 11,
    color: HEYWAY_COLORS.status.success,
    fontWeight: '500',
  },

  contentContainer: {
    flex: 1,
  },

  description: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    lineHeight: 20,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },

  loadingText: {
    fontSize: 16,
    color: HEYWAY_COLORS.text.secondary,
  },

  scrollView: {
    flex: 1,
    paddingTop: 20,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },

  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 15,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  createButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  createButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: 15,
    fontWeight: '600',
  },

  automationCard: {
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },

  automationCardContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },

  automationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  automationIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  automationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    // Use a solid success color instead of undefined gradient token
    backgroundColor: HEYWAY_COLORS.status.success,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  automationIconText: {
    fontSize: 14,
    fontWeight: '600',
    color: HEYWAY_COLORS.status.success,
    letterSpacing: -0.1,
  },

  automationInfo: {
    flex: 1,
  },

  automationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },

  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  automationName: {
    fontSize: 15,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.1,
  },

  automationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  actionButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  automationDescription: {
    fontSize: 13,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 16,
  },

  automationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  triggerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },

  triggerText: {
    fontSize: 12,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: 0,
    lineHeight: 16,
  },

  statsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  statText: {
    fontSize: 12,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: 0,
  },

  pendingText: {
    fontSize: 12,
    color: HEYWAY_COLORS.interactive.primary,
    letterSpacing: 0,
  },

  automationDetails: {
    borderTopWidth: 1,
    borderTopColor: HEYWAY_COLORS.border.secondary,
    padding: 16,
    paddingTop: 16,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: 8,
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: HEYWAY_COLORS.text.primary,
  },

  statLabel: {
    fontSize: 11,
    color: HEYWAY_COLORS.text.secondary,
    marginTop: 4,
  },

  instructionsContainer: {
    marginBottom: 16,
  },

  instructionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 4,
  },

  instructionsText: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 20,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    padding: 12,
    borderRadius: 8,
  },

  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  expandedActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
  },

  actionButtonText: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: '500',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
  },

  modalContent: {
    flex: 1,
    padding: 16,
  },

  closeButton: {
    padding: 8,
  },

  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: 8,
    padding: 4,
  },

  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    gap: 4,
  },

  activeTab: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.primary,
  },

  tabContent: {
    flex: 1,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: 6,
    marginBottom: 8,
  },

  selectedContactItem: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
  },

  contactItemContent: {
    flex: 1,
  },

  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 4,
  },

  contactPhone: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
  },

  contactListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: 6,
    marginBottom: 8,
  },

  contactListItemContent: {
    flex: 1,
  },

  contactListName: {
    fontSize: 16,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 4,
  },

  contactListCount: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
  },

  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: HEYWAY_COLORS.text.primary,
  },

  searchButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: 6,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: 6,
    marginBottom: 8,
  },

  businessItemContent: {
    flex: 1,
  },

  businessName: {
    fontSize: 16,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 4,
  },

  businessPhone: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: 4,
  },

  businessAddress: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.tertiary,
  },

  selectedContactsSummary: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },

  addToAutomationButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },

  addToAutomationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.inverse,
  },
});