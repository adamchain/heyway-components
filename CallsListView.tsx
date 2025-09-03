import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  ArrowRight,
  Calendar,
  Clock,
  Search,
  MoreVertical,
  FolderPlus,
  Plus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useContacts } from '@/hooks/useContacts';
import { useCallAnalysis } from '@/hooks/useCallAnalysis';
import { apiService } from '@/services/apiService';
import {
  HEYWAY_COLORS,
  HEYWAY_SPACING,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
  HEYWAY_LAYOUT,
  HEYWAY_COMPONENTS,
  HEYWAY_CHAT_PATTERNS,
  HEYWAY_ACCESSIBILITY,
} from '@/styles/HEYWAY_STYLE_GUIDE';
import CallAnalysisTag from '@/components/CallAnalysisTag';

// Lazy load ScheduledActivityBanner
const ScheduledActivityBanner = React.lazy(() => import('@/components/ScheduledActivityBanner'));

interface Group { id: string; name: string; calls: any[] }

type FilterType =
  | 'all'
  | 'inbound'
  | 'outbound'
  | 'scheduled'
  | 'analysis-good'
  | 'analysis-bad'
  | 'analysis-opportunity'
  | 'manual'
  | string;

interface FilterOption {
  key: FilterType;
  label: string;
  icon?: any;
  category?: 'type' | 'analysis' | 'source';
}

interface CallsListViewProps {
  activeSection: string;
  onCallSelect?: (call: any) => void;
  selectedCallId?: string;
  showScheduledActivityBanner?: boolean;
  onScheduledActivityPress?: () => void;
  onScheduledActivityDataChange?: () => void;
  onNewCallInitiated?: (recipients: string[], searchQuery: string) => void;
  groups?: Group[];
  onAddCallToGroup?: (callId: string, groupId: string) => void;
}

export default function CallsListView({
  activeSection,
  onCallSelect,
  selectedCallId,
  showScheduledActivityBanner = false,
  onScheduledActivityPress,
  onScheduledActivityDataChange,
  onNewCallInitiated,
  groups = [],
  onAddCallToGroup,
}: CallsListViewProps) {
  const callHistory = useCallHistory();
  const contacts = useContacts();
  const [scheduledCalls, setScheduledCalls] = useState<any[]>([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [hideNoTranscript, setHideNoTranscript] = useState(true);
  const [openGroupMenuForCallId, setOpenGroupMenuForCallId] = useState<string | null>(null);
  const [automations, setAutomations] = useState<any[]>([]);

  const onPressHaptic = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(style);
  }, []);

  useEffect(() => {
    if (activeSection === 'scheduled') loadScheduledCalls();
  }, [activeSection]);

  // Load automations for dynamic source filters
  useEffect(() => {
    (async () => {
      try {
        const automationData = await apiService.getAutomations();
        setAutomations(Array.isArray(automationData) ? automationData : []);
      } catch (err) {
        console.warn('Failed to load automations for filter:', err);
        setAutomations([]);
      }
    })();
  }, []);

  const loadScheduledCalls = async () => {
    try {
      setIsLoadingScheduled(true);
      const [manualScheduled, autos] = await Promise.all([
        apiService.getScheduledCalls('scheduled'),
        apiService.getAutomations(),
      ]);

      let all: any[] = [];
      if (Array.isArray(manualScheduled)) {
        all.push(
          ...manualScheduled.map((c) => ({ ...c, source: 'manual' }))
        );
      }

      if (Array.isArray(autos)) {
        for (const automation of autos) {
          if (automation.isActive && automation.pendingCount > 0) {
            try {
              const automationCalls = await apiService.getAutomationCalls(
                automation.id || automation._id
              );
              if (Array.isArray(automationCalls)) {
                const pending = automationCalls
                  .filter((c) => c.status === 'scheduled' || c.status === 'pending')
                  .map((c) => ({
                    ...c,
                    source: 'automation',
                    automationName: automation.name,
                    automationId: automation.id || automation._id,
                  }));
                all.push(...pending);
              }
            } catch (e) {
              console.warn('Failed to load automation calls for', automation.name, e);
            }
          }
        }
      }

      all.sort((a, b) => {
        const da = new Date(a.scheduledTime || a.date).getTime();
        const db = new Date(b.scheduledTime || b.date).getTime();
        return da - db;
      });

      setScheduledCalls(all);
    } catch (e) {
      console.error('Failed to load scheduled calls:', e);
      setScheduledCalls([]);
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  // Utilities
  const formatDayOfWeek = (iso: string) => {
    try {
      const d = new Date(iso);
      const today = new Date();
      const y = new Date();
      y.setDate(today.getDate() - 1);
      if (d.toDateString() === today.toDateString()) return 'Today';
      if (d.toDateString() === y.toDateString()) return 'Yesterday';
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return 'Unknown';
    }
  };

  const formatScheduledTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return 'Unknown';
    }
  };

  const getLastMessage = useCallback((call: any) => {
    const transcript = call.transcript || call.transcription;
    if (transcript && Array.isArray(transcript) && transcript.length > 0) {
      const last = transcript[transcript.length - 1];
      return last.text || '';
    }
    if (call.participants && Array.isArray(call.participants)) {
      let msg = '';
      let ts = 0;
      for (const p of call.participants) {
        if (p.transcription && Array.isArray(p.transcription)) {
          for (const entry of p.transcription) {
            const t = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
            if (t > ts || (t === 0 && !msg)) {
              ts = t;
              msg = entry.text || '';
            }
          }
        }
      }
      return msg;
    }
    return '';
  }, []);

  const truncate = (s: string, n = 80) => (s && s.length > n ? `${s.slice(0, n - 3)}...` : s);

  const getDisplayNameForCall = useCallback(
    (call: any) => {
      const isInbound = call.isInbound === true || call.isInbound === 'true';
      const firstRecipient = call.recipients?.[0] || null;
      if (isInbound) {
        const inboundNumber = call.fromNumber || call.caller;
        if (inboundNumber) {
          const found = contacts.contacts.find(
            (c: any) => c.number === inboundNumber || c.phone === inboundNumber
          );
          return found?.name || inboundNumber || 'Unknown Caller';
        }
        return 'Unknown Caller';
      }
      if (firstRecipient?.name) return firstRecipient.name;
      if (firstRecipient?.number) {
        const found = contacts.contacts.find(
          (c: any) => c.number === firstRecipient.number || c.phone === firstRecipient.number
        );
        return found?.name || firstRecipient.number || 'Unknown Recipient';
      }
      return 'Unknown Recipient';
    },
    [contacts.contacts]
  );

  const { getCallAnalysis } = useCallAnalysis(callHistory.callHistory);

  // FILTER OPTIONS (memoized)
  const filterOptions: FilterOption[] = useMemo(() => (
    [
      { key: 'all', label: 'All Calls', icon: Phone, category: 'type' },
      { key: 'inbound', label: 'Inbound', icon: PhoneIncoming, category: 'type' },
      { key: 'outbound', label: 'Outbound', icon: PhoneOutgoing, category: 'type' },
      { key: 'scheduled', label: 'Scheduled', icon: Calendar, category: 'type' },
      { key: 'analysis-good', label: 'Good Calls', category: 'analysis' },
      { key: 'analysis-bad', label: 'Bad Calls', category: 'analysis' },
      { key: 'analysis-opportunity', label: 'Opportunities', category: 'analysis' },
      { key: 'manual', label: 'Manual Calls', category: 'source' },
      ...automations.map((a) => ({ key: `automation-${a.id || a._id}`, label: a.name, category: 'source' as const })),
    ]
  ), [automations]);

  // FILTERING (memoized)
  const displayedCalls = useMemo(() => {
    let calls = selectedFilter === 'scheduled' ? scheduledCalls : callHistory.callHistory;

    switch (selectedFilter) {
      case 'inbound':
        calls = calls.filter((c) => c.isInbound === true || c.isInbound === 'true');
        break;
      case 'outbound':
        calls = calls.filter((c) => !(c.isInbound === true || c.isInbound === 'true'));
        break;
      case 'scheduled':
        break; // already selected
      case 'analysis-good':
        calls = calls.filter((c) => (getCallAnalysis(c)?.score ?? 0) >= 7);
        break;
      case 'analysis-bad':
        calls = calls.filter((c) => (getCallAnalysis(c)?.score ?? 10) <= 4);
        break;
      case 'analysis-opportunity':
        calls = calls.filter((c) => !!getCallAnalysis(c)?.followUpNeeded);
        break;
      case 'manual':
        calls = calls.filter((c) => !c.automationId && !c.automationName);
        break;
      default:
        if (typeof selectedFilter === 'string' && selectedFilter.startsWith('automation-')) {
          const id = selectedFilter.replace('automation-', '');
          const auto = automations.find((a) => (a.id || a._id) === id);
          calls = calls.filter((c) => c.automationId === id || c.automationName === auto?.name);
        }
        break;
    }

    if (hideNoTranscript) {
      calls = calls.filter((c) => !!getLastMessage(c)?.trim());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      calls = calls.filter((c) => {
        const name = getDisplayNameForCall(c).toLowerCase();
        const msg = (getLastMessage(c) || '').toLowerCase();
        return name.includes(q) || msg.includes(q);
      });
    }

    return calls;
  }, [selectedFilter, scheduledCalls, callHistory.callHistory, searchQuery, hideNoTranscript, getDisplayNameForCall, getLastMessage, getCallAnalysis, automations]);

  const loadMoreCalls = useCallback(() => {
    if (selectedFilter !== 'scheduled') callHistory.loadMoreCallHistory();
  }, [selectedFilter, callHistory]);

  // RENDERERS
  const renderCallCard = useCallback(({ item: call }: { item: any }) => {
    const isSelected = selectedCallId === (call.id || call.callId);
    const isInbound = call.isInbound === true || call.isInbound === 'true';
    const display = getDisplayNameForCall(call);
    const day = selectedFilter === 'scheduled' ? formatScheduledTime(call.scheduledTime || call.date) : formatDayOfWeek(call.date);
    const lastMsg = truncate(getLastMessage(call) || '', 80);
    const duration = ((): string | null => {
      if (typeof call.duration === 'number' && !isNaN(call.duration)) {
        const secs = Math.floor(call.duration);
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
      }
      return null;
    })();
    const analysis = getCallAnalysis(call);

    return (
      <CallCard
        key={call.id || call.callId}
        isSelected={isSelected}
        name={display}
        timeLabel={day}
        duration={duration}
        lastMessage={lastMsg}
        analysis={analysis}
        showGroupKebab={groups.length > 0 && !!onAddCallToGroup}
        isGroupMenuOpen={openGroupMenuForCallId === (call.id || call.callId)}
        onPress={() => { onPressHaptic(); onCallSelect?.(call); }}
        onToggleGroupMenu={() => {
          onPressHaptic();
          setOpenGroupMenuForCallId((cur) => (cur === (call.id || call.callId) ? null : (call.id || call.callId)));
        }}
        groups={groups}
        onPickGroup={(groupId) => {
          onPressHaptic();
          onAddCallToGroup?.(call.id || call.callId, groupId);
          setOpenGroupMenuForCallId(null);
        }}
      />
    );
  }, [selectedCallId, selectedFilter, getDisplayNameForCall, getLastMessage, getCallAnalysis, groups, onAddCallToGroup, onCallSelect, onPressHaptic, openGroupMenuForCallId]);

  const keyExtractor = useCallback((item: any, index: number) => `${item.id || item.callId || item.scheduledTime || 'call'}-${index}`, [/* stable */]);

  // LOADING STATES
  if (callHistory.isLoading && !callHistory.refreshing) {
    return (
      <LoadingState title="Loading calls…" />
    );
  }

  if (activeSection === 'scheduled' && isLoadingScheduled) {
    return (
      <LoadingState title="Loading scheduled calls…" />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        count={displayedCalls.length}
        onOpenMenu={() => { }}
      />

      {/* Overlay to close any open group menu */}
      {openGroupMenuForCallId && (
        <TouchableOpacity style={styles.groupMenuOverlay} onPress={() => setOpenGroupMenuForCallId(null)} activeOpacity={1} />
      )}

      {/* Filter Bar */}
      <FilterBar
        options={filterOptions.filter((o) => o.category === 'type').slice(0, 4)}
        selectedKey={selectedFilter}
        onSelect={(k) => { onPressHaptic(); setSelectedFilter(k as FilterType); }}
        hideEmpty={hideNoTranscript}
        onToggleHideEmpty={() => { onPressHaptic(); setHideNoTranscript((v) => !v); }}
      />

      {/* List + Optional Scheduled Banner */}
      <View style={styles.listWrapper}>
        {selectedFilter === 'all' && showScheduledActivityBanner && (
          <Suspense fallback={null}>
            <ScheduledActivityBanner
              visible
              onPress={onScheduledActivityPress || (() => { })}
              onDataChange={onScheduledActivityDataChange}
            />
          </Suspense>
        )}

        <FlatList
          data={displayedCalls}
          renderItem={renderCallCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={Phone}
              title={getEmptyTitle(activeSection)}
              subtitle={getEmptySubtitle(activeSection)}
            />
          }
          ListFooterComponent={
            activeSection !== 'scheduled' ? (
              callHistory.hasMore ? (
                <LoadMore onPress={loadMoreCalls} loaded={callHistory.callHistory.length} />
              ) : callHistory.callHistory.length > 0 ? (
                <AllLoaded total={callHistory.callHistory.length} />
              ) : null
            ) : null
          }
        />
      </View>
    </View>
  );
}

/*************************
 * Subcomponents
 *************************/
const Header = ({ count, onOpenMenu }: { count: number; onOpenMenu: () => void }) => (
  <View style={styles.header}>
    <View style={styles.headerRow}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Calls</Text>
      </View>
      <TouchableOpacity style={styles.toolbarButton} onPress={onOpenMenu}>
        <Plus size={20} color="#000000" />
      </TouchableOpacity>
    </View>
  </View>
);

const FilterBar = ({
  options,
  selectedKey,
  onSelect,
  hideEmpty,
  onToggleHideEmpty,
}: {
  options: FilterOption[];
  selectedKey: FilterType;
  onSelect: (k: FilterType) => void;
  hideEmpty: boolean;
  onToggleHideEmpty: () => void;
}) => (
  <View style={styles.whatsappFilterBar}>
    <View style={styles.whatsappFilterContent}>
      <View style={styles.whatsappTypeFilters}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.whatsappFilterButton, selectedKey === opt.key && styles.whatsappFilterButtonActive]}
            onPress={() => onSelect(opt.key)}
            activeOpacity={0.8}
          >
            {opt.icon && (
              <opt.icon size={10} color={selectedKey === opt.key ? HEYWAY_COLORS.text.inverse : HEYWAY_COLORS.text.secondary} />
            )}
            <Text style={[styles.whatsappFilterButtonText, selectedKey === opt.key && styles.whatsappFilterButtonTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.whatsappOptionsToggle, hideEmpty && styles.whatsappOptionsToggleActive]}
        onPress={onToggleHideEmpty}
        activeOpacity={0.8}
      >
        <View style={[styles.whatsappToggleIndicator, hideEmpty && styles.whatsappToggleIndicatorActive]} />
        <Text style={[styles.whatsappOptionsText, hideEmpty && styles.whatsappOptionsTextActive]}>Hide empty</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const CallCard = React.memo(({
  isSelected,
  name,
  timeLabel,
  duration,
  lastMessage,
  analysis,
  showGroupKebab,
  isGroupMenuOpen,
  onPress,
  onToggleGroupMenu,
  groups,
  onPickGroup,
}: {
  isSelected: boolean;
  name: string;
  timeLabel: string;
  duration: string | null;
  lastMessage: string | undefined;
  analysis: any;
  showGroupKebab: boolean;
  isGroupMenuOpen: boolean;
  onPress: () => void;
  onToggleGroupMenu: () => void;
  groups: Group[];
  onPickGroup: (groupId: string) => void;
}) => {
  return (
    <TouchableOpacity style={[styles.callCard, isSelected && styles.callCardSelected]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.callCardContent}>
        <View style={styles.callCardHeader}>
          <View style={styles.callCardHeaderLeft}>
            <Text style={[styles.callCardName, isSelected && styles.callCardNameSelected]} numberOfLines={1}>
              {name}
            </Text>
          </View>
          <View style={styles.callCardHeaderRight}>
            <Text style={[styles.callCardTime, isSelected && styles.callCardTimeSelected]}>{timeLabel}</Text>
            {!!duration && (
              <Text style={[styles.callCardDuration, isSelected && styles.callCardDurationSelected]}>• {duration}</Text>
            )}
            {!!analysis && (
              <View style={styles.analysisTagContainer}>
                <CallAnalysisTag analysis={analysis} size="small" showIcon={false} showScore={false} />
              </View>
            )}
            {showGroupKebab && (
              <TouchableOpacity style={styles.groupMenuButton} onPress={onToggleGroupMenu}>
                <MoreVertical size={14} color={isSelected ? HEYWAY_COLORS.text.primary : HEYWAY_COLORS.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!!lastMessage && (
          <Text style={[styles.callCardMessage, isSelected && styles.callCardMessageSelected]} numberOfLines={2}>
            {lastMessage}
          </Text>
        )}
      </View>

      {isGroupMenuOpen && (
        <View style={styles.groupDropdownMenu}>
          <Text style={styles.groupDropdownTitle}>Add to Group</Text>
          {groups.map((g) => (
            <TouchableOpacity key={g.id} style={styles.groupDropdownItem} onPress={() => onPickGroup(g.id)}>
              <FolderPlus size={14} color={HEYWAY_COLORS.text.secondary} />
              <Text style={styles.groupDropdownItemText}>{g.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
});

const LoadingState = ({ title }: { title: string }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
    <Text style={styles.loadingText}>{title}</Text>
  </View>
);

const EmptyState = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
  <View style={styles.emptyState}>
    <Icon size={48} color={HEYWAY_COLORS.text.tertiary} />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyText}>{subtitle}</Text>
  </View>
);

const LoadMore = ({ onPress, loaded }: { onPress: () => void; loaded: number }) => (
  <TouchableOpacity style={styles.loadMoreButton} onPress={onPress} activeOpacity={0.85}>
    <Text style={styles.loadMoreText}>Load More Calls ({loaded} loaded)</Text>
    <ArrowRight size={14} color={HEYWAY_COLORS.interactive.primary} />
  </TouchableOpacity>
);

const AllLoaded = ({ total }: { total: number }) => (
  <View style={styles.loadMoreButton}>
    <Text style={[styles.loadMoreText, { color: HEYWAY_COLORS.text.tertiary }]}>All calls loaded ({total} total)</Text>
  </View>
);

/*************************
 * Helpers
 *************************/
const getEmptyTitle = (section: string) => {
  switch (section) {
    case 'inbound':
      return 'No inbound calls yet';
    case 'outbound':
      return 'No outbound calls yet';
    case 'scheduled':
      return 'No scheduled calls';
    default:
      return 'No conversations yet';
  }
};

const getEmptySubtitle = (section: string) => {
  switch (section) {
    case 'inbound':
      return 'Incoming calls will appear here';
    case 'outbound':
      return 'Your outbound calls will appear here';
    case 'scheduled':
      return 'Manual scheduled calls and automation calls will appear here';
    default:
      return 'Your conversations will appear here';
  }
};

/*************************
 * Styles
 *************************/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    overflow: 'hidden',
  },

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
  titleContainer: { flex: 1 },
  title: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: HEYWAY_COLORS.text.tertiary,
    lineHeight: 13,
  },
  toolbarButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000'
  },

  listWrapper: { flex: 1 },

  // Filter bar - WhatsApp-inspired
  whatsappFilterBar: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.xs,
    ...HEYWAY_SHADOWS.light.xs,
  },
  whatsappFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  whatsappTypeFilters: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  whatsappFilterButton: {
    ...HEYWAY_COMPONENTS.chatItem.default,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    gap: HEYWAY_SPACING.xs,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum / 2,
  },
  whatsappFilterButtonActive: {
    ...HEYWAY_COMPONENTS.chatItem.selected,
    backgroundColor: HEYWAY_COLORS.interactive.whatsappGreen,
    borderColor: HEYWAY_COLORS.interactive.whatsappGreen,
  },
  whatsappFilterButtonText: {
    fontSize: 10,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
  },
  whatsappFilterButtonTextActive: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  whatsappOptionsToggle: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 3, gap: 3, borderRadius: 10 },
  whatsappOptionsToggleActive: { backgroundColor: HEYWAY_COLORS.background.secondary, borderWidth: StyleSheet.hairlineWidth, borderColor: HEYWAY_COLORS.border.tertiary },
  whatsappToggleIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: HEYWAY_COLORS.background.primary, borderWidth: StyleSheet.hairlineWidth, borderColor: HEYWAY_COLORS.border.tertiary },
  whatsappToggleIndicatorActive: { backgroundColor: HEYWAY_COLORS.interactive.primary, borderColor: HEYWAY_COLORS.interactive.primary },
  whatsappOptionsText: { fontSize: 9, fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular, color: HEYWAY_COLORS.text.tertiary },
  whatsappOptionsTextActive: { color: HEYWAY_COLORS.text.secondary, fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium },

  // Group menu
  groupMenuButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: HEYWAY_RADIUS.sm,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.secondary,
  },
  groupDropdownMenu: {
    position: 'absolute',
    top: 32,
    right: 0,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.lg,
    zIndex: 1000,
    minWidth: 160,
    paddingVertical: HEYWAY_SPACING.sm,
    overflow: 'hidden',
  },
  groupDropdownTitle: {
    fontSize: 10,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.tertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingBottom: HEYWAY_SPACING.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.divider,
    marginBottom: HEYWAY_SPACING.xs,
  },
  groupDropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: HEYWAY_SPACING.md, paddingVertical: HEYWAY_SPACING.sm, gap: HEYWAY_SPACING.sm },
  groupDropdownItemText: { fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium, fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium, color: HEYWAY_COLORS.text.primary },
  groupMenuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },

  // List / cards
  listContent: { paddingHorizontal: 0, paddingTop: 6, paddingBottom: HEYWAY_SPACING.xxl },
  callCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.card.sm,
    marginHorizontal: HEYWAY_SPACING.sm,
    marginVertical: HEYWAY_SPACING.xs,
    padding: HEYWAY_SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    minHeight: HEYWAY_LAYOUT.chatItem.height,
    ...HEYWAY_SHADOWS.light.xs,
  },
  callCardSelected: {
    backgroundColor: HEYWAY_COLORS.background.intelligenceSubtle,
    borderLeftWidth: 3,
    borderLeftColor: HEYWAY_COLORS.interactive.whatsappGreen,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  callCardContent: { flex: 1, flexDirection: 'column', gap: 6 },
  callCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  callCardHeaderLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  callCardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  callCardName: { fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small, fontWeight: '600', color: HEYWAY_COLORS.text.primary, letterSpacing: -0.1, lineHeight: 20 },
  callCardNameSelected: { color: HEYWAY_COLORS.text.primary, fontWeight: '700' },
  callCardTime: { fontSize: 11, fontWeight: '500', color: HEYWAY_COLORS.text.tertiary },
  callCardTimeSelected: { color: HEYWAY_COLORS.text.secondary },
  callCardDuration: { fontSize: 11, fontWeight: '500', color: HEYWAY_COLORS.text.tertiary },
  callCardDurationSelected: { color: HEYWAY_COLORS.text.secondary },
  callCardMessage: { fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium, fontWeight: '400', color: HEYWAY_COLORS.text.secondary, lineHeight: 18, letterSpacing: -0.1 },
  callCardMessageSelected: { color: HEYWAY_COLORS.text.primary },
  analysisTagContainer: { marginLeft: 6 },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: HEYWAY_SPACING.lg, backgroundColor: HEYWAY_COLORS.background.content },
  loadingText: { fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large, color: HEYWAY_COLORS.text.secondary, fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium },

  // Empty state
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: HEYWAY_SPACING.xxl * 2, paddingHorizontal: HEYWAY_SPACING.xl },
  emptyTitle: { marginTop: HEYWAY_SPACING.lg, marginBottom: HEYWAY_SPACING.sm, textAlign: 'center', fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large, fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold, color: HEYWAY_COLORS.text.primary, letterSpacing: -0.5 },
  emptyText: { textAlign: 'center', maxWidth: 280, fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium, color: HEYWAY_COLORS.text.secondary, lineHeight: 20 },

  // Footer buttons
  loadMoreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: HEYWAY_SPACING.sm, marginHorizontal: HEYWAY_SPACING.lg, marginVertical: HEYWAY_SPACING.lg, paddingHorizontal: HEYWAY_SPACING.lg, paddingVertical: HEYWAY_SPACING.md, backgroundColor: HEYWAY_COLORS.background.primary, borderRadius: HEYWAY_RADIUS.lg, borderWidth: 1, borderColor: HEYWAY_COLORS.border.secondary, ...HEYWAY_SHADOWS.light.sm },
  loadMoreText: { fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium, fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold, color: HEYWAY_COLORS.interactive.primary },
});
