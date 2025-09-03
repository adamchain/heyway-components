import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import {
  Clock,
  Users,
  Play,
  Pause,
  Edit3,
  Trash2,
  Target,
  Calendar,
  MessageCircle,
  Settings,
  X,
  Plus,
  Download,
  Eye,
  CheckCircle,
  UserPlus,
  Upload
} from 'lucide-react-native';
import { apiService } from '@/services/apiService';
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_MACOS_PATTERNS, HEYWAY_COMPONENTS, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';

// Helpers
const toLocalDate = (iso?: string) => {
  if (!iso) return null;
  // Avoid UTC off-by-one by anchoring midday when we only have a date
  const hasTime = /T\d{2}:\d{2}/.test(iso);
  return new Date(hasTime ? iso : `${iso}T12:00:00`);
};

const formatDateTime = (iso?: string) => {
  try {
    const d = toLocalDate(iso || '');
    if (!d) return 'Unknown';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown';
  }
};

const pluralize = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

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

interface CallRecord {
  id: string;
  automationId?: string;
  recipients?: Array<{
    id?: string;
    name?: string;
    phoneNumber?: string;
  }>;
  participants?: Array<{
    phoneNumber: string;
    status: string;
    _id?: string;
  }>;
  status: 'completed' | 'scheduled' | 'failed' | 'in_progress';
  createdAt: string;
  scheduledTime?: string;
  duration?: string;
  outcome?: string;
  notes?: string;
  date?: string;
}

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  addedAt?: string;
}

interface AutomationDetailsViewProps {
  automation: Automation;
  onClose: () => void;
  onEdit?: (automation: Automation) => void;
  onToggle?: (automationId: string) => void;
  onDelete?: (automationId: string) => void;
  onAddContacts?: (automation: Automation) => void;
  onImportContacts?: (automation: Automation) => void;
  onViewContacts?: (automation: Automation) => void;
}

export default function AutomationDetailsView({
  automation,
  onClose,
  onEdit,
  onToggle,
  onDelete,
  onAddContacts,
  onImportContacts,
  onViewContacts
}: AutomationDetailsViewProps) {
  const automationId = automation.id ?? automation._id ?? '';
  const [completedCalls, setCompletedCalls] = useState<CallRecord[]>([]);
  const [scheduledCalls, setScheduledCalls] = useState<CallRecord[]>([]);
  const [addedContacts, setAddedContacts] = useState<Contact[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [activeCallsTab, setActiveCallsTab] = useState<'added' | 'completed' | 'scheduled'>('added');
  const [error, setError] = useState<string | null>(null);
  const [automationMismatchWarning, setAutomationMismatchWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!automationId) return;
    loadAutomationCalls();
    loadAutomationContacts();

    // Set up periodic refresh for real-time updates
    const interval = setInterval(() => {
      loadAutomationCalls();
      loadAutomationContacts();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automationId]);

  const handleRefresh = async () => {
    setError(null);
    await Promise.all([loadAutomationCalls(), loadAutomationContacts()]);
  };

  const loadAutomationCalls = async () => {
    try {
      setError(null);
      setLoadingCalls(true);

      // Fetch both completed automation calls and scheduled calls
      const [automationCalls, scheduledCallsData] = await Promise.all([
        apiService.getAutomationCalls(automationId),
        apiService.getScheduledCalls('scheduled')
      ]);

      // Separate completed and failed calls from automation calls
      const completedAutomationCalls = automationCalls
        .filter((call: any) => call.status === 'completed' || call.status === 'failed')
        .map((call: any) => ({
          id: String(call.id || call._id || call.scheduledTime || call.createdAt || call.date),
          automationId,
          recipients: call.participants || call.recipients,
          status: (call.status || 'completed') as 'completed' | 'scheduled' | 'failed' | 'in_progress',
          createdAt: call.createdAt || call.date,
          duration: call.duration,
          outcome: call.outcome
        })) as CallRecord[];
      setCompletedCalls(completedAutomationCalls);

      // Filter scheduled calls that belong to this automation
      const scheduledAutomationCalls = scheduledCallsData
        .filter((call: any) => {
          // Check if this scheduled call belongs to the current automation
          // Handle both string and ObjectId comparisons
          const callAutomationId = call.automationId?.toString() || call.automationId;
          const targetAutomationId = automationId?.toString() || automationId;

          return callAutomationId === targetAutomationId;
        })
        .map((call: any) => ({
          id: String(call.id || call._id || call.scheduledTime || call.createdAt || call.date),
          automationId,
          recipients: call.recipients || call.participants,
          status: 'scheduled' as const,
          createdAt: call.createdAt || call.date,
          scheduledTime: call.scheduledTime || call.date,
          duration: call.duration
        })) as CallRecord[];

      // Check if there are scheduled calls but none match this automation
      // Only show mismatch warning if there are significantly more scheduled calls than what matches this automation
      const hasSignificantMismatch = scheduledCallsData.length >= 10 && scheduledAutomationCalls.length === 0;

      if (hasSignificantMismatch) {
        // Set warning message for user
        setAutomationMismatchWarning(
          `Found ${scheduledCallsData.length} scheduled calls, but they belong to a different automation. This may happen if you're viewing a different automation than the one that created these calls.`
        );
      } else {
        setAutomationMismatchWarning(null);
      }

      setScheduledCalls(scheduledAutomationCalls);
    } catch (e: any) {
      console.error('Failed to load automation calls:', e);
      setError(e?.message || 'Failed to load calls');
    } finally {
      setLoadingCalls(false);
    }
  };

  const loadAutomationContacts = async () => {
    try {
      setLoadingContacts(true);
      const contacts = await apiService.getAutomationContacts(automationId);
      setAddedContacts(contacts.map((contact: any) => ({
        id: contact.id || contact._id,
        name: contact.name || contact.contactName || 'Unknown Contact',
        phoneNumber: contact.phoneNumber || contact.phone || 'No phone',
        createdAt: contact.createdAt || contact.addedAt || new Date().toISOString(),
        addedAt: contact.addedAt || contact.createdAt || new Date().toISOString()
      })));
    } catch (e: any) {
      console.error('Failed to load automation contacts:', e);
    } finally {
      setLoadingContacts(false);
    }
  };



  const formatTrigger = (a: Automation) => {
    if (a.triggerType === 'date_offset') {
      const days = pluralize(Math.max(0, a.offsetDays), 'day', 'days');
      return `${days} ${a.offsetDirection} • ${a.offsetTime}`;
    }
    if (a.triggerType === 'on_date') {
      const d = toLocalDate(a.onDate || '');
      const dateStr = d
        ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Unknown date';
      return `On ${dateStr} • ${a.onTime || 'Unknown time'}`;
    }
    return 'Fixed date trigger';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? HEYWAY_COLORS.status.success : HEYWAY_COLORS.status.error;
  };

  const renderCallItem = ({ item, index }: { item: CallRecord; index: number }) => {
    const isCompleted = item.status === 'completed';
    const isFailed = item.status === 'failed';
    const isFirst = index === 0;
    const recipientCount = item.recipients?.length || 0;
    const primaryRecipient = item.recipients?.[0];

    // Extract contact name and phone number from recipient data
    const getContactName = (recipient: any) => {
      if (!recipient) return 'Unknown Contact';

      // Try different possible field names for name
      return recipient.name ||
        recipient.contactName ||
        recipient.displayName ||
        recipient.fullName ||
        'Unknown Contact';
    };

    const getPhoneNumber = (recipient: any) => {
      if (!recipient) return 'No phone';

      // Try different possible field names for phone
      return recipient.phoneNumber ||
        recipient.phone ||
        recipient.number ||
        recipient.contactPhone ||
        'No phone';
    };

    const contactName = getContactName(primaryRecipient);
    const phoneNumber = getPhoneNumber(primaryRecipient);

    return (
      <TouchableOpacity style={[styles.callRow, isFirst && styles.firstCallRow]} activeOpacity={0.6}>
        <View style={styles.callRowLeft}>
          <View style={styles.statusIconContainer}>
            {isCompleted ? (
              <CheckCircle size={16} color={HEYWAY_COLORS.status.success} />
            ) : isFailed ? (
              <CheckCircle size={16} color={HEYWAY_COLORS.status.error} />
            ) : (
              <Clock size={16} color={HEYWAY_COLORS.accent.warning} />
            )}
          </View>
          <View style={styles.callRowContent}>
            <Text style={styles.callRowTitle}>
              {contactName}
              {recipientCount > 1 && (
                <Text style={styles.callRowSubtitle}> +{recipientCount - 1} more</Text>
              )}
            </Text>
            <Text style={styles.callRowPreview} numberOfLines={1}>
              {isCompleted
                ? `Call completed • ${item.duration || '0:00'} • ${item.outcome || 'Success'}`
                : isFailed
                  ? `Call failed`
                  : `Scheduled • ${phoneNumber}`}
            </Text>
          </View>
        </View>
        <View style={styles.callRowRight}>
          <Text style={styles.callRowTime}>
            {formatDateTime(isCompleted ? item.createdAt : (item.scheduledTime || item.createdAt))}
          </Text>
          {!(isCompleted || isFailed) && (
            <View style={styles.unreadIndicator} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyCallsList = (type: 'completed' | 'scheduled') => (
    <View style={styles.emptyCallsList}>
      <View style={styles.emptyCallsIcon}>
        {type === 'completed' ? (
          <CheckCircle size={24} color={HEYWAY_COLORS.text.tertiary} />
        ) : (
          <Clock size={24} color={HEYWAY_COLORS.text.tertiary} />
        )}
      </View>
      <Text style={styles.emptyCallsText}>
        No {type} calls yet
      </Text>
      <Text style={styles.emptyCallsSubtext}>
        {type === 'completed' ?
          'Calls will appear here once they are completed' :
          'Scheduled calls will appear here'
        }
      </Text>
    </View>
  );

  const currentCalls = activeCallsTab === 'completed' ? completedCalls : scheduledCalls;
  const currentContacts = addedContacts;

  const renderContactItem = ({ item, index }: { item: Contact; index: number }) => {
    const isFirst = index === 0;
    return (
      <TouchableOpacity style={[styles.callRow, isFirst && styles.firstCallRow]} activeOpacity={0.6}>
        <View style={styles.callRowLeft}>
          <View style={styles.statusIconContainer}>
            <Users size={16} color={HEYWAY_COLORS.interactive.primary} />
          </View>
          <View style={styles.callRowContent}>
            <Text style={styles.callRowTitle}>{item.name}</Text>
            <Text style={styles.callRowPreview} numberOfLines={1}>
              {item.phoneNumber}
            </Text>
          </View>
        </View>
        <View style={styles.callRowRight}>
          <Text style={styles.callRowTime}>
            {formatDateTime(item.addedAt || item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - White minimalist style */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleSection}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(automation.isActive) }]} />
            <Text style={styles.title}>{automation.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.toolbarButton, { marginRight: 8 }]} 
              onPress={() => onToggle?.(automationId)}
            >
              {automation.isActive ? (
                <Pause size={16} color="#000000" />
              ) : (
                <Play size={16} color="#000000" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton} onPress={() => onEdit?.(automation)}>
              <Edit3 size={16} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {(automation.aiInstructions || automation.voiceMessage || automation.voiceAudioUri) && (
        <View style={styles.headerInfoSection}>
          {automation.aiInstructions && (
            <View style={styles.headerInfoCard}>
              <View style={styles.headerInfoRow}>
                <Settings size={16} color={HEYWAY_COLORS.interactive.primary} />
                <Text style={styles.headerInfoTitle}>Call Instructions</Text>
              </View>
              <Text style={styles.headerInfoText} numberOfLines={2}>
                {automation.aiInstructions}
              </Text>
            </View>
          )}

          {(automation.voiceMessage || automation.voiceAudioUri) && (
            <View style={styles.headerInfoCard}>
              <View style={styles.headerInfoRow}>
                <MessageCircle size={16} color={HEYWAY_COLORS.status.success} />
                <Text style={styles.headerInfoTitle}>Audio Recording Included</Text>
              </View>
              <Text style={styles.headerInfoText}>
                {automation.voiceMessage ?
                  `${automation.voiceMessage}${automation.voiceAudioDuration ? ` (${Math.round(automation.voiceAudioDuration)}s)` : ''}` :
                  'Voice recording attached'
                }
              </Text>
            </View>
          )}
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <View style={styles.filterContent}>
            <View style={styles.typeFilters}>
              <TouchableOpacity
                style={[styles.filterButton, activeCallsTab === 'added' && styles.filterButtonActive]}
                onPress={() => setActiveCallsTab('added')}
                activeOpacity={0.8}
              >
                <Users size={10} color={activeCallsTab === 'added' ? HEYWAY_COLORS.text.inverse : HEYWAY_COLORS.text.secondary} />
                <Text style={[styles.filterButtonText, activeCallsTab === 'added' && styles.filterButtonTextActive]}>
                  Added
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterButton, activeCallsTab === 'completed' && styles.filterButtonActive]}
                onPress={() => setActiveCallsTab('completed')}
                activeOpacity={0.8}
              >
                <CheckCircle size={10} color={activeCallsTab === 'completed' ? HEYWAY_COLORS.text.inverse : HEYWAY_COLORS.text.secondary} />
                <Text style={[styles.filterButtonText, activeCallsTab === 'completed' && styles.filterButtonTextActive]}>
                  Completed
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterButton, activeCallsTab === 'scheduled' && styles.filterButtonActive]}
                onPress={() => setActiveCallsTab('scheduled')}
                activeOpacity={0.8}
              >
                <Clock size={10} color={activeCallsTab === 'scheduled' ? HEYWAY_COLORS.text.inverse : HEYWAY_COLORS.text.secondary} />
                <Text style={[styles.filterButtonText, activeCallsTab === 'scheduled' && styles.filterButtonTextActive]}>
                  Scheduled
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onAddContacts?.(automation)}
                activeOpacity={0.8}
              >
                <UserPlus size={12} color={HEYWAY_COLORS.text.secondary} />
                <Text style={styles.actionButtonText}>Add</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onImportContacts?.(automation)}
                activeOpacity={0.8}
              >
                <Upload size={12} color={HEYWAY_COLORS.text.secondary} />
                <Text style={styles.actionButtonText}>Import</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {automation.description && (
          <View style={styles.descriptionCard}>
            <View style={styles.descriptionCardContent}>
              <MessageCircle size={20} color={HEYWAY_COLORS.interactive.primary} />
              <View style={styles.descriptionInfo}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{automation.description}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Calls Section - White minimalist tabs */}
        <View style={styles.callsSection}>
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeCallsTab === 'added' && styles.tabActive
              ]}
              onPress={() => setActiveCallsTab('added')}
            >
              <Users size={16} color={
                activeCallsTab === 'added'
                  ? HEYWAY_COLORS.background.primary
                  : HEYWAY_COLORS.interactive.primary
              } />
              <Text style={[
                styles.tabText,
                activeCallsTab === 'added' && styles.tabTextActive
              ]}>
                Added ({loadingContacts ? '...' : addedContacts.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeCallsTab === 'completed' && styles.tabActive
              ]}
              onPress={() => setActiveCallsTab('completed')}
            >
              <CheckCircle size={16} color={
                activeCallsTab === 'completed'
                  ? HEYWAY_COLORS.background.primary
                  : HEYWAY_COLORS.interactive.primary
              } />
              <Text style={[
                styles.tabText,
                activeCallsTab === 'completed' && styles.tabTextActive
              ]}>
                Completed ({loadingCalls ? '...' : completedCalls.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeCallsTab === 'scheduled' && styles.tabActive
              ]}
              onPress={() => setActiveCallsTab('scheduled')}
            >
              <Clock size={16} color={
                activeCallsTab === 'scheduled'
                  ? HEYWAY_COLORS.background.primary
                  : HEYWAY_COLORS.accent.warning
              } />
              <Text style={[
                styles.tabText,
                activeCallsTab === 'scheduled' && styles.tabTextActive
              ]}>
                Scheduled ({loadingCalls ? '...' : scheduledCalls.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Automation Mismatch Warning */}
        {automationMismatchWarning && (
          <View style={styles.warningContainer}>
            <View style={styles.warningCard}>
              <View style={styles.warningContent}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <View style={styles.warningTextContainer}>
                  <Text style={styles.warningTitle}>Automation Mismatch</Text>
                  <Text style={styles.warningMessage}>{automationMismatchWarning}</Text>
                </View>
              </View>
            </View>
          </View>
        )}


        {/* Calls/Contacts List - White minimalist style */}
        <View style={styles.listWrapper}>
          {activeCallsTab === 'added' ? (
            loadingContacts ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={HEYWAY_COLORS.interactive.primary} />
                <Text style={styles.loadingText}>Loading contacts...</Text>
              </View>
            ) : currentContacts.length > 0 ? (
              <FlatList
                data={currentContacts}
                renderItem={renderContactItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Users size={24} color={HEYWAY_COLORS.text.tertiary} />
                </View>
                <Text style={styles.emptyTitle}>
                  No contacts added yet
                </Text>
                <Text style={styles.emptyText}>
                  Use the Add or Import buttons to add contacts to this automation
                </Text>
              </View>
            )
          ) : (
            loadingCalls ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={HEYWAY_COLORS.interactive.primary} />
                <Text style={styles.loadingText}>Loading calls...</Text>
              </View>
            ) : error ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Couldn't load calls</Text>
                <Text style={styles.emptyText}>{error}</Text>
                <TouchableOpacity onPress={handleRefresh} style={{ marginTop: 8 }}>
                  <Text style={[styles.emptyText, { textDecorationLine: 'underline' }]}>Try again</Text>
                </TouchableOpacity>
              </View>
            ) : currentCalls.length > 0 ? (
              <FlatList
                data={currentCalls}
                renderItem={renderCallItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  {activeCallsTab === 'completed' ? (
                    <CheckCircle size={24} color={HEYWAY_COLORS.text.tertiary} />
                  ) : (
                    <Clock size={24} color={HEYWAY_COLORS.text.tertiary} />
                  )}
                </View>
                <Text style={styles.emptyTitle}>
                  No {activeCallsTab} calls yet
                </Text>
                <Text style={styles.emptyText}>
                  {activeCallsTab === 'completed' ?
                    'Calls will appear here once they are completed' :
                    'Scheduled calls will appear here'
                  }
                </Text>
              </View>
            )
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoCardContent}>
              <Calendar size={20} color={HEYWAY_COLORS.interactive.primary} />
              <View style={styles.infoCardDetails}>
                <Text style={styles.infoCardTitle}>Timeline</Text>
                <Text style={styles.infoCardText}>
                  Created {formatDateTime(automation.createdAt)}
                  {automation.lastRun && `\nLast run: ${formatDateTime(automation.lastRun)}`}
                  {automation.nextRun && `\nNext run: ${formatDateTime(automation.nextRun)}`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.deleteSection}>
          <TouchableOpacity style={styles.deleteCard} onPress={() => onDelete?.(automationId)}>
            <View style={styles.deleteCardContent}>
              <Trash2 size={20} color={HEYWAY_COLORS.status.error} />
              <View style={styles.deleteInfo}>
                <Text style={styles.deleteName}>Delete Automation</Text>
                <Text style={styles.deleteDescription}>This action cannot be undone</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* LAYOUT */
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },

  /* HEADER */
  header: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    paddingBottom: 8,
    paddingTop: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.tertiary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 48,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.2,
    flex: 1,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 13,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButton: {
    width: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    height: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: HEYWAY_RADIUS.lg,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },

  /* HEADER INFO (chips/cards under header) */
  headerInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: HEYWAY_SPACING.sm,
    backgroundColor: HEYWAY_COLORS.background.panel,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.divider,
    gap: HEYWAY_SPACING.xs,
  },
  headerInfoCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.xs,
    marginBottom: 4,
  },
  headerInfoTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: '600' as const,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.1,
  },
  headerInfoText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: '400' as const,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: -0.1,
    lineHeight: 16,
  },

  /* CONTENT WRAPPER */
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /* FILTER BAR */
  filterBar: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.tertiary,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  typeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    gap: HEYWAY_SPACING.xs,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
  },
  filterButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  filterButtonText: {
    fontSize: 10,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
  },
  filterButtonTextActive: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  actionButtonText: {
    fontSize: 9,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
  },

  /* LIST WRAPPER */
  listWrapper: { flex: 1 },
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 6,
    paddingBottom: 40,
  },

  /* DESCRIPTION CARD */
  descriptionCard: {
    marginBottom: HEYWAY_SPACING.lg,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  descriptionCardContent: {
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: HEYWAY_SPACING.md,
  },
  descriptionInfo: { flex: 1 },
  descriptionTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: '500' as const,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '400' as const,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: -0.1,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
  },

  /* CALLS SECTION + TABS (WhatsApp-ish) */
  callsSection: { marginBottom: HEYWAY_SPACING.lg },
  tabsRow: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: HEYWAY_SPACING.xs,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.md,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  tabActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  tabText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  tabTextActive: { color: HEYWAY_COLORS.text.inverse },

  /* CALLS LIST CONTAINER */
  callsListContainer: {
    marginBottom: HEYWAY_SPACING.lg,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
    overflow: 'hidden',
    ...HEYWAY_SHADOWS.light.xs,
  },

  /* CALL ROW (single, slim, WhatsApp style) */
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.divider,
    backgroundColor: HEYWAY_COLORS.background.primary,
    minHeight: 60,
  },
  firstCallRow: { borderTopWidth: 0 },
  callRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: HEYWAY_SPACING.md,
  },
  statusIconContainer: {
    width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  callRowContent: { flex: 1 },
  callRowTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    marginBottom: 2,
  },
  callRowSubtitle: {
    color: HEYWAY_COLORS.text.tertiary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
  },
  callRowPreview: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  callRowRight: { alignItems: 'flex-end', gap: 4 },
  callRowTime: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.tertiary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  unreadIndicator: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
  },

  /* LOADING / ERROR / EMPTY */
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 16, backgroundColor: HEYWAY_COLORS.background.content,
  },
  loadingText: {
    fontSize: 16, color: HEYWAY_COLORS.text.secondary, fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.xl,
    paddingHorizontal: HEYWAY_SPACING.lg,
  },
  errorText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '500' as const,
    color: HEYWAY_COLORS.status.error,
    marginBottom: HEYWAY_SPACING.sm,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: HEYWAY_COLORS.status.error,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.error,
  },
  retryButtonText: {
    color: HEYWAY_COLORS.background.card,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '500' as const,
    letterSpacing: -0.1,
  },
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 80, paddingHorizontal: 40,
  },
  emptyIconContainer: { marginBottom: 16 },
  emptyTitle: {
    fontSize: 20, fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    marginTop: 16, marginBottom: 8, textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 16, color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center', lineHeight: 24, maxWidth: 280,
  },

  /* INFO CARDS */
  infoSection: { marginBottom: HEYWAY_SPACING.lg },
  infoCard: {
    marginBottom: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  infoCardContent: {
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: HEYWAY_SPACING.md,
  },
  infoCardDetails: { flex: 1 },
  infoCardTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: '500' as const,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '400' as const,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: -0.1,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
  },

  /* DELETE CARD */
  deleteSection: { marginBottom: HEYWAY_SPACING.lg },
  deleteCard: {
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.status.error,
    backgroundColor: 'rgba(255,59,48,0.05)',
    ...HEYWAY_SHADOWS.light.xs,
  },
  deleteCardContent: {
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
  },
  deleteInfo: { flex: 1 },
  deleteName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: '500' as const,
    color: HEYWAY_COLORS.status.error,
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  deleteDescription: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '400' as const,
    color: HEYWAY_COLORS.status.error,
    letterSpacing: -0.1,
    opacity: 0.7,
  },

  /* WARNING (mismatch) */
  warningContainer: { marginBottom: HEYWAY_SPACING.lg },
  warningCard: {
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.accent.warning,
    backgroundColor: 'rgba(255, 149, 0, 0.05)',
    ...HEYWAY_SHADOWS.light.xs,
  },
  warningContent: {
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: HEYWAY_SPACING.sm,
  },
  warningIcon: { fontSize: 20, marginTop: 2 },
  warningTextContainer: { flex: 1 },
  warningTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '600' as const,
    color: HEYWAY_COLORS.accent.warning,
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  warningMessage: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: '400' as const,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: -0.1,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    marginTop: HEYWAY_SPACING.xs,
  },
});
