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
    <View style={styles.container}>
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
  container: { 
    flex: 1, 
    backgroundColor: HEYWAY_COLORS.background.primary 
  },

  headerWrap: {
    position: 'relative',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    ...HEYWAY_SHADOWS.xs,
  },
  headerGlassFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.sm,
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: HEYWAY_SPACING.sm, 
    flex: 1 
  },
  titleCol: { flex: 1 },
  subject: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.headline,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  metaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: HEYWAY_SPACING.xs, 
    marginTop: HEYWAY_SPACING.xs, 
    flexWrap: 'wrap' 
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  metaPill: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
    color: HEYWAY_COLORS.text.primary,
    backgroundColor: HEYWAY_COLORS.background.active,
    paddingHorizontal: HEYWAY_SPACING.xs,
    paddingVertical: HEYWAY_SPACING.xxs,
    borderRadius: HEYWAY_RADIUS.full,
  },
  dot: { 
    color: HEYWAY_COLORS.text.tertiary, 
    marginHorizontal: HEYWAY_SPACING.xxs 
  },
  metaText: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption, 
    color: HEYWAY_COLORS.text.secondary 
  },
  headerRight: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: HEYWAY_SPACING.md 
  },
  headerInfo: { flex: 1, alignItems: 'flex-end', marginRight: 8 },

  // Toggle Button Styles
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.xs,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.xs,
    borderRadius: HEYWAY_RADIUS.xl,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 64,
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.xs,
  },
  toggleButtonActive: {
    backgroundColor: HEYWAY_COLORS.status.success,
    borderColor: HEYWAY_COLORS.status.success,
  },
  toggleButtonInactive: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  toggleButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },
  toggleButtonTextActive: {
    color: HEYWAY_COLORS.text.inverse,
  },
  toggleButtonTextInactive: {
    color: HEYWAY_COLORS.text.secondary,
  },

  body: { flex: 1 },
  bodyContent: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingTop: HEYWAY_SPACING.md,
    paddingBottom: HEYWAY_SPACING.lg,
    maxWidth: 800, // Max width for larger screens
    alignSelf: 'center', // Center the content
    width: '100%', // Take full width on smaller screens
  },

  drawer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.md,
    ...HEYWAY_SHADOWS.sm,
    marginBottom: HEYWAY_SPACING.sm,
    maxWidth: 950, // Much wider than transcript bubbles (400px)
    alignSelf: 'center', // Center the drawer
    width: '100%', // Take full width on smaller screens
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderTopLeftRadius: HEYWAY_RADIUS.md,
    borderTopRightRadius: HEYWAY_RADIUS.md,
  },
  drawerTitle: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption, 
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold, 
    color: HEYWAY_COLORS.text.primary, 
    textTransform: 'uppercase',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },
  drawerBody: { 
    paddingHorizontal: HEYWAY_SPACING.sm, 
    paddingVertical: HEYWAY_SPACING.xs, 
    gap: HEYWAY_SPACING.xs 
  },
  drawerLine: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption, 
    color: HEYWAY_COLORS.text.secondary 
  },
  drawerStrong: { 
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold, 
    color: HEYWAY_COLORS.text.primary 
  },
  drawerMuted: { 
    color: HEYWAY_COLORS.text.tertiary, 
    fontStyle: 'italic' 
  },
  drawerReason: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption, 
    color: HEYWAY_COLORS.text.secondary, 
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.caption 
  },

  thread: { gap: HEYWAY_SPACING.md },
  messageRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    marginVertical: HEYWAY_SPACING.xs 
  },
  leftAlignedRow: { justifyContent: 'flex-start' },
  messageBubble: {
    maxWidth: 360,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    borderRadius: HEYWAY_RADIUS.md,
    ...HEYWAY_SHADOWS.xs,
  },
  leftAlignedBubble: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderBottomLeftRadius: HEYWAY_RADIUS.xs,
  },
  messageText: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline, 
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.subheadline 
  },
  leftAlignedText: { 
    color: HEYWAY_COLORS.text.primary 
  },
  messageBold: { 
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold 
  },

  // Contacts Section Styles
  contactsSection: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.md,
    ...HEYWAY_SHADOWS.sm,
    marginBottom: HEYWAY_SPACING.sm,
    maxWidth: 950,
    alignSelf: 'center',
    width: '100%',
  },
  contactsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderTopLeftRadius: HEYWAY_RADIUS.md,
    borderTopRightRadius: HEYWAY_RADIUS.md,
  },
  contactsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
    flex: 1,
  },
  contactsToggleText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
  },
  contactsActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.xs,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    borderRadius: HEYWAY_RADIUS.xs,
    ...HEYWAY_SHADOWS.xs,
  },
  contactsActionText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactsList: {
    paddingVertical: HEYWAY_SPACING.md,
  },
  contactsLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.xl,
    gap: HEYWAY_SPACING.md,
  },
  contactsLoadingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactsEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.xxl,
    gap: HEYWAY_SPACING.md,
  },
  contactsEmptyText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactsEmptySubtext: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.caption,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactsFlatList: {
    maxHeight: 200,
  },
  contactsFlatListContent: {
    paddingHorizontal: HEYWAY_SPACING.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xxs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactPhone: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  contactMeta: {
    alignItems: 'flex-end',
  },
  contactDate: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    color: HEYWAY_COLORS.text.tertiary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  empty: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: HEYWAY_SPACING.xxxl 
  },
  emptyTitle: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.headline, 
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold, 
    color: HEYWAY_COLORS.text.primary, 
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  emptyText: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline, 
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  inputWrap: {
    flex: 1,
    borderRadius: HEYWAY_RADIUS.md,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  input: {
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    color: HEYWAY_COLORS.text.primary,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.xs,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.md,
    ...HEYWAY_SHADOWS.sm,
  },
  primaryBtnLabel: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline, 
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold, 
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  retryButton: {
    marginTop: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.lg,
    ...HEYWAY_SHADOWS.sm,
  },
  retryButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
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
    width: HEYWAY_SPACING.xxxl,
    height: HEYWAY_SPACING.xxxl,
    borderRadius: HEYWAY_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.xs,
  },
});
