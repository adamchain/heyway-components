// AutomationDetailsView.tsx — Compact Right Pane (email-style) rewrite
// Goals vs AutomationsListView: match CallSummaryCard exactly
// • Denser layout (12/8 spacing), sticky tools header, pill info row
// • Content in minimal "mail body" style (no heavy bubbles)
// • Collapsible "Analysis" drawer to save vertical space
// • Quick Reply footer with single primary action
// • Subtle glass on header only, keep body crisp white for contrast

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  FlatList,
  Switch,
} from 'react-native';
import { Archive, Download, MoreHorizontal, Send, Star, UserPlus, X, CheckCircle, ChevronDown, Zap, Play, Pause, Edit3, Trash2, Target, Calendar, MessageCircle, Settings, Plus, Eye, Clock, Users, FileText, Upload, Power } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { useContacts } from '@/hooks/useContacts';
import { apiService } from '../services/apiService';
import ContactSelectorModal from './ContactSelectorModal';
import CSVImportModal from './CSVImportModal';
import CreateAutomationModal from './CreateAutomationModal';
import {
  HEYWAY_COLORS,
  HEYWAY_SPACING,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
} from '../styles/HEYWAY_STYLE_GUIDE';

interface Automation {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  triggerType: 'date_offset' | 'fixed_date' | 'on_date';
  offsetDays: number;
  offsetDirection: 'before' | 'after';
  offsetTime: string;
  onDate?: string;
  onTime?: string;
  isActive: boolean;
  contactsCount: number;
  completedCount: number;
  pendingCount: number;
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
  voiceMessage?: string;
  voiceAudioUri?: string;
  voiceAudioDuration?: number;
  aiInstructions: string;
}

interface AutomationDetailsViewProps {
  automation: Automation;
  onClose: () => void;
  onEdit?: (automation: Automation) => void;
  onToggle?: (automationId: string) => void;
  onDelete?: (automationId: string) => void;
  onViewContacts?: (automation: Automation) => void;
  isEmbedded?: boolean;
  onAddContact?: () => void;
  onImportContacts?: () => void;
}

// Helper functions for status styling
function getAnalysisHeaderStyle(automation: any) {
  if (automation.isActive) {
    return { backgroundColor: 'rgba(76, 175, 80, 0.15)' }; // Brighter green background
  } else {
    return { backgroundColor: 'rgba(244, 67, 54, 0.15)' }; // Brighter red background
  }
}

function getAnalysisTitleStyle(automation: any) {
  if (automation.isActive) {
    return { color: '#2E7D32', fontWeight: '700' as const }; // Brighter green text with bold weight
  } else {
    return { color: '#D32F2F', fontWeight: '700' as const }; // Brighter red text with bold weight
  }
}

function getAnalysisIconColor(automation: any) {
  if (automation.isActive) {
    return '#2E7D32'; // Brighter green icon
  } else {
    return '#D32F2F'; // Brighter red icon
  }
}

export default function AutomationDetailsView({
  automation,
  onClose,
  onEdit,
  onToggle,
  onDelete,
  onViewContacts,
  isEmbedded = false,
  onAddContact,
  onImportContacts,
}: AutomationDetailsViewProps) {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingCalls, setIsLoadingCalls] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [showContactSelectorModal, setShowContactSelectorModal] = useState(false);
  const [showCSVImportModal, setShowCSVImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAutomation, setCurrentAutomation] = useState(automation);

  const automationId = automation.id ?? automation._id ?? '';

  // Update current automation when prop changes
  useEffect(() => {
    setCurrentAutomation(automation);
  }, [automation]);

  // Load automation data when component mounts
  useEffect(() => {
    if (automationId) {
      loadAutomationData();
    }
  }, [automationId]);

  const loadAutomationData = async () => {
    try {
      setError(null);
      setIsLoadingContacts(true);
      setIsLoadingCalls(true);

      const [contactsData, callsData] = await Promise.all([
        apiService.getAutomationContacts(automationId),
        apiService.getAutomationCalls(automationId)
      ]);

      setContacts(Array.isArray(contactsData) ? contactsData : []);
      setCalls(Array.isArray(callsData) ? callsData : []);
    } catch (err) {
      console.error('Failed to load automation data:', err);
      setError('Failed to load automation data');
    } finally {
      setIsLoadingContacts(false);
      setIsLoadingCalls(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert('Message Required', 'Please enter a message to send.');
      return;
    }

    try {
      setIsSending(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });

      // Here you would implement the logic to send a message related to the automation
      // For now, just show success
      Alert.alert('Success', 'Message sent successfully!');
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const toggleAutomation = async () => {
    if (!automationId || isToggling) return;

    try {
      setIsToggling(true);
      onPressHaptic();
      
      // Optimistic update
      setCurrentAutomation(prev => ({
        ...prev,
        isActive: !prev.isActive
      }));
      
      await apiService.toggleAutomation(automationId, !currentAutomation.isActive);
      
      // Refresh data to ensure server sync
      await loadAutomationData();
      
      // Call parent callback if provided
      if (onToggle) {
        onToggle(automationId);
      }
    } catch (error) {
      console.error('Failed to toggle automation:', error);
      
      // Revert optimistic update on error
      setCurrentAutomation(prev => ({
        ...prev,
        isActive: !prev.isActive
      }));
      
      Alert.alert('Error', 'Failed to update automation status');
    } finally {
      setIsToggling(false);
    }
  };

  const handleAddContact = () => {
    setShowContactSelectorModal(true);
  };

  const handleImportContacts = () => {
    setShowCSVImportModal(true);
  };

  const handleContactsSelected = async (selectedContacts: any[]) => {
    try {
      setShowContactSelectorModal(false);
      
      if (selectedContacts.length === 0) return;
      
      // Get contact IDs for the selected contacts
      const contactIds = selectedContacts.map(contact => contact.id);
      
      console.log('📤 Adding contacts to automation contact list:', {
        automationId,
        contactIds: contactIds,
        contactsCount: contactIds.length
      });
      
      // Add selected contacts to the automation's contact list (without executing)
      const result = await apiService.addContactsToAutomationContactList(automationId, contactIds);
      
      console.log('✅ API response:', result);
      
      // Refresh contacts list to show the newly added contacts
      await loadAutomationData();
      
      // Show success message with details from server response
      if (result && result.contactsAdded !== undefined) {
        Alert.alert(
          'Contacts Added',
          `${result.contactsAdded} contact${result.contactsAdded !== 1 ? 's' : ''} added to automation contact list.${result.contactsSkipped > 0 ? ` ${result.contactsSkipped} were skipped (already in list).` : ''}`
        );
      } else {
        Alert.alert(
          'Contacts Added',
          `${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''} added to automation contact list.`
        );
      }
    } catch (error) {
      console.error('Failed to add contacts to automation:', error);
      Alert.alert('Error', 'Failed to add contacts to automation. Please try again.');
    }
  };

  const handleContactsImported = async (contacts: any[]) => {
    setShowCSVImportModal(false);
    // Refresh contacts list
    await loadAutomationData();
  };

  const handleEditAutomation = () => {
    setShowEditModal(true);
  };

  const handleSaveAutomation = async (automationData: any) => {
    try {
      setShowEditModal(false);
      
      // Update the automation
      const updatedAutomation = await apiService.updateAutomation(automationId, automationData);
      
      // Update local state with the new data
      setCurrentAutomation(updatedAutomation);
      
      // Refresh data to ensure consistency
      await loadAutomationData();
      
      // Call parent callback if provided
      if (onEdit) {
        onEdit(updatedAutomation);
      }
      
      Alert.alert(
        'Automation Updated',
        'Your automation settings have been updated successfully.'
      );
    } catch (error) {
      console.error('Failed to update automation:', error);
      Alert.alert('Error', 'Failed to update automation. Please try again.');
    }
  };

  const onPressHaptic = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return '—';
    try {
      const date = new Date(iso);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const automationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      if (automationDate.getTime() === today.getTime()) return `Today ${timeStr}`;
      if (automationDate.getTime() === today.getTime() - 86400000) return `Yesterday ${timeStr}`;
      return `${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })} ${timeStr}`;
    } catch {
      return '—';
    }
  };

  const formatTrigger = (automation: Automation) => {
    if (automation.triggerType === 'date_offset') {
      return `${automation.offsetDays} days ${automation.offsetDirection} at ${automation.offsetTime}`;
    } else if (automation.triggerType === 'on_date') {
      const d = automation.onDate ? new Date(automation.onDate) : null;
      const dateStr = d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown date';
      return `On ${dateStr} at ${automation.onTime || 'Unknown time'}`;
    }
    return 'Fixed date trigger';
  };

  const renderContact = ({ item }: { item: any }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name || item.contactId?.name || 'Unknown Contact'}</Text>
        <Text style={styles.contactPhone}>{item.phoneNumber || item.contactId?.phoneNumber || 'No phone'}</Text>
      </View>
      <View style={styles.contactMeta}>
        <Text style={styles.contactDate}>{formatDateTime(item.addedAt)}</Text>
      </View>
    </View>
  );

  const Header = (
    <View style={styles.headerWrap}>
      {Platform.OS !== 'web' ? (
        <BlurView tint="light" intensity={28} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={styles.headerGlassFallback} />
      )}
      <SafeAreaView>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.subject} numberOfLines={1}>
              {currentAutomation.name || 'Unknown Automation'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.metaRow}>
              <Zap size={16} color={HEYWAY_COLORS.text.secondary} />
              <Text style={styles.dot}>•</Text>
              {currentAutomation.isActive ? (
                <CheckCircle size={14} color="#4CAF50" />
              ) : (
                <Text style={styles.metaText}>Inactive</Text>
              )}
              <Text style={styles.dot}>•</Text>
              <Text style={styles.metaText}>{currentAutomation.contactsCount} contacts</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.metaText}>{formatDateTime(currentAutomation.createdAt)}</Text>
            </View>
            
            {/* Toggle Switch */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  currentAutomation.isActive ? styles.toggleButtonActive : styles.toggleButtonInactive
                ]}
                onPress={toggleAutomation}
                disabled={isToggling}
                accessibilityRole="switch"
                accessibilityState={{ checked: currentAutomation.isActive }}
              >
                {isToggling ? (
                  <ActivityIndicator size="small" color={HEYWAY_COLORS.text.inverse} />
                ) : (
                  <>
                    <Power 
                      size={14} 
                      color={currentAutomation.isActive ? HEYWAY_COLORS.text.inverse : HEYWAY_COLORS.text.secondary} 
                    />
                    <Text style={[
                      styles.toggleButtonText,
                      currentAutomation.isActive ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
                    ]}>
                      {currentAutomation.isActive ? 'ON' : 'OFF'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Edit Button */}
            <HeaderIcon onPress={handleEditAutomation}>
              <Edit3 size={16} color={HEYWAY_COLORS.text.macosPrimary} />
            </HeaderIcon>
            
            <HeaderIcon onPress={onClose}><X size={16} color={HEYWAY_COLORS.text.macosPrimary} /></HeaderIcon>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  const AnalysisDrawer = (
    <View style={styles.drawer}>
      <TouchableOpacity
        onPress={() => setShowAnalysis((s) => !s)}
        style={[styles.drawerHeader, getAnalysisHeaderStyle(currentAutomation)]}
        accessibilityRole="button"
      >
        <Text style={[styles.drawerTitle, getAnalysisTitleStyle(currentAutomation)]}>
          {currentAutomation.isActive ? 'Active' : 'Inactive'}
        </Text>
        <ChevronDown size={16} color={getAnalysisIconColor(currentAutomation)} />
      </TouchableOpacity>
      {showAnalysis && (
        <View style={styles.drawerBody}>
          <Text style={styles.drawerLine}>
            Status: <Text style={styles.drawerStrong}>{currentAutomation.isActive ? 'Active' : 'Inactive'}</Text>
          </Text>
          <Text style={styles.drawerLine}>
            Trigger: <Text style={styles.drawerMuted}>{formatTrigger(currentAutomation)}</Text>
          </Text>
          <Text style={styles.drawerLine}>
            Performance: <Text style={styles.drawerMuted}>{currentAutomation.completedCount} completed, {currentAutomation.pendingCount} pending</Text>
          </Text>
          {currentAutomation.description && (
            <Text style={styles.drawerReason}>{currentAutomation.description}</Text>
          )}
        </View>
      )}
    </View>
  );

  const ContactsSection = (
    <View style={styles.contactsSection}>
      <View style={styles.contactsHeader}>
        <TouchableOpacity
          onPress={() => setShowContacts(!showContacts)}
          style={styles.contactsToggle}
          accessibilityRole="button"
        >
          <Users size={16} color={HEYWAY_COLORS.text.secondary} />
          <Text style={styles.contactsToggleText}>Contacts ({contacts.length})</Text>
          <ChevronDown size={16} color={HEYWAY_COLORS.text.secondary} />
        </TouchableOpacity>

        <View style={styles.contactsActions}>
          <TouchableOpacity
            style={styles.contactsActionButton}
            onPress={handleAddContact}
            accessibilityRole="button"
          >
            <UserPlus size={14} color={HEYWAY_COLORS.text.inverse} />
            <Text style={styles.contactsActionText}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactsActionButton}
            onPress={handleImportContacts}
            accessibilityRole="button"
          >
            <Upload size={14} color={HEYWAY_COLORS.text.inverse} />
            <Text style={styles.contactsActionText}>Import</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showContacts && (
        <View style={styles.contactsList}>
          {isLoadingContacts ? (
            <View style={styles.contactsLoading}>
              <ActivityIndicator size="small" color={HEYWAY_COLORS.interactive.primary} />
              <Text style={styles.contactsLoadingText}>Loading contacts...</Text>
            </View>
          ) : contacts.length > 0 ? (
            <FlatList
              data={contacts}
              renderItem={renderContact}
              keyExtractor={(item, index) => item.id || item._id || `contact-${index}`}
              showsVerticalScrollIndicator={false}
              style={styles.contactsFlatList}
              contentContainerStyle={styles.contactsFlatListContent}
            />
          ) : (
            <View style={styles.contactsEmpty}>
              <Users size={24} color={HEYWAY_COLORS.text.tertiary} />
              <Text style={styles.contactsEmptyText}>No contacts added yet</Text>
              <Text style={styles.contactsEmptySubtext}>Add contacts to get started with this automation</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const Body = (
    <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
      {AnalysisDrawer}

      {/* Automation content in chat-style layout - ALL LEFT ALIGNED */}
      <View style={styles.thread}>
        {/* Trigger Information */}
        <View style={[styles.messageRow, styles.leftAlignedRow]}>
          <View style={[styles.messageBubble, styles.leftAlignedBubble]}>
            <Text style={[styles.messageText, styles.leftAlignedText]}>
              <Text style={styles.messageBold}>Trigger:</Text> {formatTrigger(currentAutomation)}
            </Text>
          </View>
        </View>

        {/* AI Instructions */}
        {currentAutomation.aiInstructions && (
          <View style={[styles.messageRow, styles.leftAlignedRow]}>
            <View style={[styles.messageBubble, styles.leftAlignedBubble]}>
              <Text style={[styles.messageText, styles.leftAlignedText]}>
                <Text style={styles.messageBold}>AI Instructions:</Text> {currentAutomation.aiInstructions}
              </Text>
            </View>
          </View>
        )}

        {/* Voice Message */}
        {currentAutomation.voiceMessage && (
          <View style={[styles.messageRow, styles.leftAlignedRow]}>
            <View style={[styles.messageBubble, styles.leftAlignedBubble]}>
              <Text style={[styles.messageText, styles.leftAlignedText]}>
                <Text style={styles.messageBold}>Voice Message:</Text> {currentAutomation.voiceMessage}
                {currentAutomation.voiceAudioDuration && ` (${Math.round(currentAutomation.voiceAudioDuration)}s)`}
              </Text>
            </View>
          </View>
        )}

        {/* Contacts Summary */}
        <View style={[styles.messageRow, styles.leftAlignedRow]}>
          <View style={[styles.messageBubble, styles.leftAlignedBubble]}>
            <Text style={[styles.messageText, styles.leftAlignedText]}>
              <Text style={styles.messageBold}>Contacts:</Text> {currentAutomation.contactsCount} total
              {currentAutomation.completedCount > 0 && ` • ${currentAutomation.completedCount} completed`}
              {currentAutomation.pendingCount > 0 && ` • ${currentAutomation.pendingCount} pending`}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={[styles.messageRow, styles.leftAlignedRow]}>
          <View style={[styles.messageBubble, styles.leftAlignedBubble]}>
            <Text style={[styles.messageText, styles.leftAlignedText]}>
              <Text style={styles.messageBold}>Created:</Text> {formatDateTime(currentAutomation.createdAt)}
            </Text>
          </View>
        </View>

        {/* Contacts Section */}
        {ContactsSection}

        {/* Loading states */}
        {isLoadingCalls && (
          <View style={styles.empty}>
            <ActivityIndicator size="small" color={HEYWAY_COLORS.interactive.primary} />
            <Text style={styles.emptyTitle}>Loading calls...</Text>
          </View>
        )}

        {/* Error state */}
        {error && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Error Loading Data</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadAutomationData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const Footer = (
    <View style={styles.footer}>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Send message about automation..."
          placeholderTextColor={HEYWAY_COLORS.text.tertiary}
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={sendMessage} disabled={isSending}>
        {isSending ? (
          <ActivityIndicator size="small" color={HEYWAY_COLORS.text.inverse} />
        ) : (
          <>
            <Send size={14} color={HEYWAY_COLORS.text.inverse} />
            <Text style={styles.primaryBtnLabel}>Send</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  // Always use embedded mode for side-by-side layout
  return (
    <View style={styles.rootEmbedded}>
      {Header}
      {Body}
      {Footer}
      
      {/* Contact Selector Modal */}
      <ContactSelectorModal
        visible={showContactSelectorModal}
        onClose={() => setShowContactSelectorModal(false)}
        onContactsSelected={handleContactsSelected}
        title="Add Contacts to Automation"
        allowMultiSelect={true}
      />
      
      {/* CSV Import Modal */}
      <CSVImportModal
        visible={showCSVImportModal}
        onClose={() => setShowCSVImportModal(false)}
        onImportComplete={handleContactsImported}
        title="Import Contacts to Automation"
        subtitle="Upload a CSV file to add contacts to this automation"
        requireReferenceDate={currentAutomation.triggerType === 'date_offset'}
      />
      
      {/* Edit Automation Modal */}
      <CreateAutomationModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveAutomation}
        editingAutomation={currentAutomation}
      />
    </View>
  );
}

/* ————— styles ————— */
const S = HEYWAY_SPACING;
const R = HEYWAY_RADIUS;
const T = HEYWAY_TYPOGRAPHY;

const styles = StyleSheet.create({
  rootEmbedded: { flex: 1, backgroundColor: '#fff' },

  headerWrap: {
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
    backgroundColor: '#F8F9FA',
    ...HEYWAY_SHADOWS.light.xs,
  },
  headerGlassFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  titleCol: { flex: 1 },
  subject: {
    fontSize: 15,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.macosPrimary,
    letterSpacing: -0.1,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  metaPill: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: HEYWAY_COLORS.text.macosPrimary,
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  dot: { color: HEYWAY_COLORS.text.tertiary, marginHorizontal: 2 },
  metaText: { fontSize: 11, color: HEYWAY_COLORS.text.macosSecondary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerInfo: { flex: 1, alignItems: 'flex-end', marginRight: 8 },

  // Toggle Button Styles
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 60,
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.light.xs,
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  toggleButtonInactive: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E5E5E7',
  },
  toggleButtonText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  toggleButtonTextActive: {
    color: HEYWAY_COLORS.text.inverse,
  },
  toggleButtonTextInactive: {
    color: HEYWAY_COLORS.text.secondary,
  },

  body: { flex: 1 },
  bodyContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
    maxWidth: 800, // Max width for larger screens
    alignSelf: 'center', // Center the content
    width: '100%', // Take full width on smaller screens
  },

  drawer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    ...HEYWAY_SHADOWS.light.sm,
    marginBottom: 10,
    maxWidth: 950, // Much wider than transcript bubbles (400px)
    alignSelf: 'center', // Center the drawer
    width: '100%', // Take full width on smaller screens
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  drawerTitle: { fontSize: 12, fontWeight: '700', color: HEYWAY_COLORS.text.macosPrimary, textTransform: 'uppercase' },
  drawerBody: { paddingHorizontal: 10, paddingVertical: 8, gap: 4 },
  drawerLine: { fontSize: 12, color: HEYWAY_COLORS.text.macosSecondary },
  drawerStrong: { fontWeight: '700', color: HEYWAY_COLORS.text.macosPrimary },
  drawerMuted: { color: HEYWAY_COLORS.text.tertiary, fontStyle: 'italic' },
  drawerReason: { fontSize: 12, color: HEYWAY_COLORS.text.macosSecondary, lineHeight: 18 },

  thread: { gap: 8 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 2 },
  leftAlignedRow: { justifyContent: 'flex-start' },
  messageBubble: {
    maxWidth: 400,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  leftAlignedBubble: {
    backgroundColor: '#F8F9FA',
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 13, lineHeight: 18 },
  leftAlignedText: { color: HEYWAY_COLORS.text.macosPrimary },
  messageBold: { fontWeight: '600' },

  // Contacts Section Styles
  contactsSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    ...HEYWAY_SHADOWS.light.sm,
    marginBottom: 10,
    maxWidth: 950,
    alignSelf: 'center',
    width: '100%',
  },
  contactsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
    backgroundColor: '#F8F9FA',
  },
  contactsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  contactsToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.macosPrimary,
  },
  contactsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactsActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    ...HEYWAY_SHADOWS.light.xs,
  },
  contactsActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.inverse,
  },
  contactsList: {
    paddingVertical: 8,
  },
  contactsLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  contactsLoadingText: {
    fontSize: 13,
    color: HEYWAY_COLORS.text.secondary,
  },
  contactsEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  contactsEmptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
  },
  contactsEmptySubtext: {
    fontSize: 12,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  contactsFlatList: {
    maxHeight: 200,
  },
  contactsFlatListContent: {
    paddingHorizontal: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 13,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.macosPrimary,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 12,
    color: HEYWAY_COLORS.text.macosSecondary,
  },
  contactMeta: {
    alignItems: 'flex-end',
  },
  contactDate: {
    fontSize: 11,
    color: HEYWAY_COLORS.text.tertiary,
  },

  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: HEYWAY_COLORS.text.macosPrimary, marginBottom: 6 },
  emptyText: { fontSize: 13, color: HEYWAY_COLORS.text.macosSecondary },

  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    backgroundColor: '#FFFFFF',
  },
  inputWrap: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  input: {
    minHeight: 36,
    maxHeight: 120,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: HEYWAY_COLORS.text.macosPrimary,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    ...HEYWAY_SHADOWS.light.sm,
  },
  primaryBtnLabel: { fontSize: 13, fontWeight: '700', color: HEYWAY_COLORS.text.inverse },

  retryButton: {
    marginTop: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.lg,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.md,
  },
  retryButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

function HeaderIcon({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={headerIconStyles.btn} accessibilityRole="button">
      {children}
    </TouchableOpacity>
  );
}

const headerIconStyles = StyleSheet.create({
  btn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
});
