import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  ArrowRight,
  Calendar,
  MoreVertical,
  FolderPlus,
  Plus,
  ChevronDown,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Search,
  X,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useCallHistory } from '../hooks/useCallHistory';
import { useContacts } from '../hooks/useContacts';
import { useCallAnalysis } from '../hooks/useCallAnalysis';
import { apiService } from '../services/apiService';
import {
  HEYWAY_COLORS,
  HEYWAY_SPACING,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
  HEYWAY_CHAT_PATTERNS,
} from '../styles/HEYWAY_STYLE_GUIDE';
import CallAnalysisTag from './CallAnalysisTag';

// Lazy load ScheduledActivityBanner
const ScheduledActivityBanner = React.lazy(() => import('./ScheduledActivityBanner'));

/**
 * CallsListView
 * Mobile-first Apple-style list panel with clean navigation and modern design.
 */

interface Group { id: string; name: string; calls: any[] }

type FilterType =
  | 'all'
  | 'inbound'
  | 'outbound'
  | 'scheduled'
  | 'analysis-good'
  | 'analysis-bad'
  | 'analysis-opportunity'
  | 'analysis-followup'
  | 'analysis-keywords'
  | 'analysis-sentiment-positive'
  | 'analysis-sentiment-negative'
  | 'analysis-sentiment-neutral'
  | 'analysis-voicemail'
  | 'manual'
  | string;

interface FilterOption {
  key: FilterType;
  label: string;
  icon?: any;
  category?: 'type' | 'analysis' | 'source' | 'tags';
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
  onNewCall?: () => void;
  onBack?: () => void;
  isMobile?: boolean;
}

// --- Web-only helpers (mirror HomeSidebar) ---------------------------------
const webView = (obj: any): any =>
  Platform.OS === 'web' ? obj : {};

const webText = (obj: any): any =>
  Platform.OS === 'web' ? obj : {};

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';

// Error Boundary Component
class CallsListErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CallsListView Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={HEYWAY_COLORS.status.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            The calls list encountered an unexpected error. Please refresh the page.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
            activeOpacity={0.85}
          >
            <Text style={styles.retryButtonText}>Reload</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

function CallsListView({
  activeSection,
  onCallSelect,
  selectedCallId,
  showScheduledActivityBanner = false,
  onScheduledActivityPress,
  onScheduledActivityDataChange,
  onNewCallInitiated,
  groups = [],
  onAddCallToGroup,
  onNewCall,
  onBack,
  isMobile = false,
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
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showPlusDropdown, setShowPlusDropdown] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const onPressHaptic = useCallback(
    (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
      if (Platform.OS === 'ios') Haptics.impactAsync(style);
    },
    []
  );

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
        // Don't set error for automation loading failure - it's not critical
      }
    })();
  }, []);

  const loadScheduledCalls = async () => {
    try {
      setIsLoadingScheduled(true);
      setError(null);
      const [manualScheduled, autos] = await Promise.all([
        apiService.getScheduledCalls('scheduled'),
        apiService.getAutomations(),
      ]);

      let all: any[] = [];
      if (Array.isArray(manualScheduled)) {
        all.push(...manualScheduled.map((c) => ({ ...c, source: 'manual' })));
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
      setError('Failed to load scheduled calls. Please try again.');
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

  // FILTER OPTIONS (memoized with stable base options)
  const baseFilterOptions: FilterOption[] = useMemo(() => [
    // Call Type Filters
    { key: 'all', label: 'All Calls', icon: Phone, category: 'type' },
    { key: 'inbound', label: 'Inbound', icon: PhoneIncoming, category: 'type' },
    { key: 'outbound', label: 'Outbound', icon: PhoneOutgoing, category: 'type' },
    { key: 'scheduled', label: 'Scheduled', icon: Calendar, category: 'type' },

    // Call Analysis Filters
    { key: 'analysis-good', label: 'Good Calls', icon: CheckCircle, category: 'analysis' },
    { key: 'analysis-bad', label: 'Bad Calls', icon: AlertTriangle, category: 'analysis' },
    { key: 'analysis-opportunity', label: 'Opportunities', icon: Clock, category: 'analysis' },
    { key: 'analysis-followup', label: 'Follow-up Needed', icon: Clock, category: 'tags' },
    { key: 'analysis-keywords', label: 'Keywords Found', icon: Filter, category: 'tags' },

    // Sentiment Analysis Filters
    { key: 'analysis-sentiment-positive', label: 'Positive Sentiment', icon: CheckCircle, category: 'tags' },
    { key: 'analysis-sentiment-negative', label: 'Negative Sentiment', icon: AlertTriangle, category: 'tags' },
    { key: 'analysis-sentiment-neutral', label: 'Neutral Sentiment', icon: Phone, category: 'tags' },

    // Voicemail Detection Filter
    { key: 'analysis-voicemail', label: 'Voicemails Detected', icon: Phone, category: 'tags' },

    // Source Filters
    { key: 'manual', label: 'Manual Calls', category: 'source' },
  ], []);

  const filterOptions: FilterOption[] = useMemo(() => [
    ...baseFilterOptions,
    ...automations.map((a) => ({ key: `automation-${a.id || a._id}`, label: a.name, category: 'source' as const })),
  ], [baseFilterOptions, automations]);

  // FILTERING (memoized with separated concerns)
  const filteredCallsWithoutSearch = useMemo(() => {
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
      case 'analysis-followup':
        calls = calls.filter((c) => !!getCallAnalysis(c)?.followUpNeeded);
        break;
      case 'analysis-keywords':
        calls = calls.filter((c) => {
          const analysis = getCallAnalysis(c);
          return !!analysis && Array.isArray(analysis.keywords) && analysis.keywords.length > 0;
        });
        break;
      case 'analysis-sentiment-positive':
        calls = calls.filter((c) => getCallAnalysis(c)?.sentiment === 'positive');
        break;
      case 'analysis-sentiment-negative':
        calls = calls.filter((c) => getCallAnalysis(c)?.sentiment === 'negative');
        break;
      case 'analysis-sentiment-neutral':
        calls = calls.filter((c) => getCallAnalysis(c)?.sentiment === 'neutral');
        break;
      case 'analysis-voicemail':
        calls = calls.filter((c) => !!getCallAnalysis(c)?.voicemailDetected);
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

    return calls;
  }, [selectedFilter, scheduledCalls, callHistory.callHistory, hideNoTranscript, getCallAnalysis, getLastMessage, automations]);

  const displayedCalls = useMemo(() => {
    if (!searchQuery) return filteredCallsWithoutSearch;
    const q = searchQuery.toLowerCase();
    return filteredCallsWithoutSearch.filter((c: any) => {
      const name = getDisplayNameForCall(c).toLowerCase();
      const msg = (getLastMessage(c) || '').toLowerCase();
      return name.includes(q) || msg.includes(q);
    });
  }, [filteredCallsWithoutSearch, searchQuery, getDisplayNameForCall, getLastMessage]);

  const loadMoreCalls = useCallback(() => {
    if (selectedFilter !== 'scheduled') callHistory.loadMoreCallHistory();
  }, [selectedFilter, callHistory]);

  const retryLoad = useCallback(() => {
    setError(null);
    setRetryCount(prev => prev + 1);
    if (activeSection === 'scheduled') {
      loadScheduledCalls();
    } else {
      // Trigger call history refresh
      callHistory.refreshCallHistory?.();
    }
  }, [activeSection, callHistory, loadScheduledCalls]);

  // RENDERERS
  const renderCallCard = useCallback(({ item: call }: { item: any }) => {
    const callId = call.id || call.callId;
    const isSelected = selectedCallId === callId;
    const display = getDisplayNameForCall(call);
    const day = selectedFilter === 'scheduled' ? formatScheduledTime(call.scheduledTime || call.date) : formatDayOfWeek(call.date);
    const lastMsg = truncate(getLastMessage(call) || '', 80);
    const analysis = getCallAnalysis(call);
    const initialPrompt = call.initialPrompt || call.prompt || call.notes || 'Call Summary';

    // Create combined prompt and message preview
    const truncatedPrompt = initialPrompt.length > 10 ? initialPrompt.substring(0, 10) + '...' : initialPrompt;

    return (
      <TouchableOpacity
        style={[styles.callCard, isSelected && styles.callCardSelected]}
        onPress={() => { onPressHaptic(); onCallSelect?.(call); }}
        activeOpacity={0.85}
      >
        <View style={styles.callCardContent}>
          <View style={styles.callCardMain}>
            <View style={styles.callCardHeader}>
              <Text style={[styles.callCardName, isSelected && styles.callCardNameSelected]} numberOfLines={1}>
                {display}
              </Text>
              <View style={styles.callCardMeta}>
                <Text style={[styles.callCardTime, isSelected && styles.callCardTimeSelected]}>{day}</Text>
                {analysis && <CallAnalysisTag analysis={analysis} size="small" showIcon={false} showScore={false} />}
                {groups.length > 0 && onAddCallToGroup && (
                  <TouchableOpacity
                    style={styles.groupMenuButton}
                    onPress={() => {
                      onPressHaptic();
                      setOpenGroupMenuForCallId((cur) => (cur === callId ? null : callId));
                    }}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MoreVertical size={14} color={HEYWAY_COLORS.text.secondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.callCardMessageContainer}>
              <Text style={[styles.callCardMessageBold, isSelected && styles.callCardMessageBoldSelected]} numberOfLines={1}>
                Re: {truncatedPrompt}
              </Text>
              {lastMsg && (
                <Text style={[styles.callCardMessage, isSelected && styles.callCardMessageSelected]} numberOfLines={1}>
                  {lastMsg}
                </Text>
              )}
            </View>
          </View>
        </View>

        {openGroupMenuForCallId === callId && (
          <View style={styles.groupDropdownMenu}>
            <Text style={styles.groupDropdownTitle}>Add to Group</Text>
            {groups.map((g) => (
              <TouchableOpacity key={g.id} style={styles.groupDropdownItem} onPress={() => {
                onPressHaptic();
                onAddCallToGroup?.(callId, g.id);
                setOpenGroupMenuForCallId(null);
              }}>
                <FolderPlus size={14} color={HEYWAY_COLORS.text.secondary} />
                <Text style={styles.groupDropdownItemText}>{g.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  }, [selectedCallId, selectedFilter, getDisplayNameForCall, getLastMessage, getCallAnalysis, groups, onAddCallToGroup, onCallSelect, onPressHaptic, openGroupMenuForCallId]);

  const keyExtractor = useCallback((item: any, index: number) => `${item.id || item.callId || item.scheduledTime || 'call'}-${index}`, [/* stable */]);

  // LOADING STATES
  if (callHistory.isLoading && !callHistory.refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
        <Text style={styles.loadingTitle}>Loading calls…</Text>
        <Text style={styles.loadingSubtitle}>This shouldn't take long</Text>
      </View>
    );
  }

  if (activeSection === 'scheduled' && isLoadingScheduled) {
    return <LoadingState title="Loading scheduled calls…" />;
  }

  // ERROR STATES
  if (error && !callHistory.isLoading && !isLoadingScheduled) {
    return <ErrorState error={error} onRetry={retryLoad} retryCount={retryCount} />;
  }

  // Mobile search overlay
  if (isSearchExpanded) {
    return (
      <View style={styles.mobileSearchOverlay}>
        <View style={styles.mobileSearchHeader}>
          <TouchableOpacity
            style={styles.mobileBackButton}
            onPress={() => setIsSearchExpanded(false)}
            activeOpacity={0.7}
          >
            <X size={24} color={HEYWAY_COLORS.text.primary} />
          </TouchableOpacity>
          <View style={styles.mobileSearchContainer}>
            <Search size={20} color={HEYWAY_COLORS.text.tertiary} style={styles.mobileSearchIcon} />
            <TextInput
              style={styles.mobileSearchInput}
              placeholder="Search calls..."
              placeholderTextColor={HEYWAY_COLORS.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.mobileClearButton}
                activeOpacity={0.7}
              >
                <X size={16} color={HEYWAY_COLORS.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.panelContainer, isMobile && styles.mobilePanelContainer]} accessibilityRole="none" accessibilityLabel="Calls list">
      {/* Liquid Glass layer */}
      {Platform.OS !== 'web' ? (
        <BlurView tint="light" intensity={30} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={styles.webGlassFallback} />
      )}
      {/* Inner highlight (glass rim) */}
      <View pointerEvents="none" style={styles.innerHighlight} />

      {/* Content */}
      <View style={styles.panelContent}>
        {/* Header */}
        <Header
          count={displayedCalls.length}
          onOpenMenu={() => { }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewCall={onNewCall}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onSelectFilter={(filter) => { onPressHaptic(); setSelectedFilter(filter); }}
          hideEmpty={hideNoTranscript}
          onToggleHideEmpty={() => { onPressHaptic(); setHideNoTranscript((v) => !v); }}
          isFilterDropdownOpen={isFilterDropdownOpen}
          onToggleFilterDropdown={() => { onPressHaptic(); setIsFilterDropdownOpen(!isFilterDropdownOpen); }}
          onBack={onBack}
          isMobile={isMobile}
          onSearchPress={() => setIsSearchExpanded(true)}
          showPlusDropdown={showPlusDropdown}
          onTogglePlusDropdown={() => setShowPlusDropdown(!showPlusDropdown)}
        />

        {/* Plus Dropdown Menu */}
        {showPlusDropdown && (
          <PlusDropdownMenu
            onNewCall={onNewCall}
            onClose={() => setShowPlusDropdown(false)}
          />
        )}

        {/* Overlay to close any open menus */}
        {(openGroupMenuForCallId || isFilterDropdownOpen || showPlusDropdown) && (
          <TouchableOpacity
            style={styles.menuOverlay}
            onPress={() => {
              setOpenGroupMenuForCallId(null);
              setIsFilterDropdownOpen(false);
              setShowPlusDropdown(false);
            }}
            activeOpacity={1}
          />
        )}

        {/* Filter Dropdown Menu */}
        {isFilterDropdownOpen && (
          <FilterDropdownMenu
            options={filterOptions}
            selectedKey={selectedFilter}
            onSelect={(k) => { onPressHaptic(); setSelectedFilter(k as FilterType); setIsFilterDropdownOpen(false); }}
          />
        )}

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
            style={styles.flatListContainer}
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
    </View>
  );
}

// Export with Error Boundary
export default function CallsListViewWithErrorBoundary(props: CallsListViewProps) {
  return (
    <CallsListErrorBoundary>
      <CallsListView {...props} />
    </CallsListErrorBoundary>
  );
}

/*************************
 * Subcomponents
 *************************/
const Header = ({
  count,
  onOpenMenu,
  searchQuery,
  onSearchChange,
  onNewCall,
  filterOptions,
  selectedFilter,
  onSelectFilter,
  hideEmpty,
  onToggleHideEmpty,
  isFilterDropdownOpen,
  onToggleFilterDropdown,
  onBack,
  isMobile,
  onSearchPress,
  showPlusDropdown,
  onTogglePlusDropdown,
}: {
  count: number;
  onOpenMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewCall?: () => void;
  filterOptions: FilterOption[];
  selectedFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  hideEmpty: boolean;
  onToggleHideEmpty: () => void;
  isFilterDropdownOpen: boolean;
  onToggleFilterDropdown: () => void;
  onBack?: () => void;
  isMobile?: boolean;
  onSearchPress?: () => void;
  showPlusDropdown?: boolean;
  onTogglePlusDropdown?: () => void;
}) => {
  const selectedOption = filterOptions.find((opt) => opt.key === selectedFilter) || filterOptions[0];

  if (isMobile) {
    return (
      <View style={styles.mobileHeader}>
        {/* Left - Back Button */}
        {onBack && (
          <TouchableOpacity
            style={styles.mobileBackButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={HEYWAY_COLORS.text.primary} />
          </TouchableOpacity>
        )}

        {/* Center - Title */}
        <View style={styles.mobileHeaderCenter}>
          <Text style={styles.mobileHeaderTitle}>Calls</Text>
          <Text style={styles.mobileHeaderSubtitle}>{count} total</Text>
        </View>

        {/* Right - Plus Button */}
        <TouchableOpacity
          style={styles.mobilePlusButton}
          onPress={onTogglePlusDropdown}
          activeOpacity={0.8}
        >
          <Plus size={20} color={HEYWAY_COLORS.text.inverse} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <View style={styles.compactHeaderRow}>
        {/* Left – Title */}
        <View style={styles.compactTitleContainer}>
          <Text style={styles.compactTitle}>Calls</Text>
        </View>

        {/* Center – Filter + Hide empty */}
        <View style={styles.compactControlsContainer}>
          <TouchableOpacity
            style={styles.compactFilterButton}
            onPress={onToggleFilterDropdown}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Filter calls by ${selectedOption.label}`}
          >
            <View style={styles.compactFilterButtonContent}>
              {selectedOption.icon && (
                <selectedOption.icon size={12} color={HEYWAY_COLORS.text.primary} />
              )}
              <Text style={styles.compactFilterButtonText}>{selectedOption.label}</Text>
              <ChevronDown
                size={12}
                color={HEYWAY_COLORS.text.secondary}
                style={[styles.compactChevron, isFilterDropdownOpen && styles.chevronRotated]}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.compactHideEmptyToggle, hideEmpty && styles.hideEmptyToggleActive]}
            onPress={onToggleHideEmpty}
            activeOpacity={0.85}
            accessibilityRole="switch"
            accessibilityState={{ checked: hideEmpty }}
          >
            <View style={[styles.compactToggleIndicator, hideEmpty && styles.toggleIndicatorActive]} />
            <Text style={[styles.compactHideEmptyText, hideEmpty && styles.hideEmptyTextActive]}>Hide empty</Text>
          </TouchableOpacity>
        </View>

        {/* Right – New */}
        <TouchableOpacity
          style={styles.compactPlusButton}
          onPress={onNewCall}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="New call"
        >
          <Plus size={16} color={HEYWAY_COLORS.text.inverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PlusDropdownMenu = ({
  onNewCall,
  onClose,
}: {
  onNewCall?: () => void;
  onClose: () => void;
}) => {
  return (
    <View style={styles.plusDropdownMenu}>
      <TouchableOpacity
        style={styles.plusDropdownItem}
        onPress={() => {
          onNewCall?.();
          onClose();
        }}
        activeOpacity={0.85}
      >
        <Phone size={16} color={HEYWAY_COLORS.text.primary} />
        <Text style={styles.plusDropdownItemText}>New Call</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.plusDropdownItem}
        onPress={() => {
          // TODO: Implement new automation
          onClose();
        }}
        activeOpacity={0.85}
      >
        <Zap size={16} color={HEYWAY_COLORS.text.primary} />
        <Text style={styles.plusDropdownItemText}>New Automation</Text>
      </TouchableOpacity>
    </View>
  );
};

const FilterDropdownMenu = ({
  options,
  selectedKey,
  onSelect,
}: {
  options: FilterOption[];
  selectedKey: FilterType;
  onSelect: (k: FilterType) => void;
}) => {
  const groupedOptions = {
    type: options.filter((opt) => opt.category === 'type'),
    analysis: options.filter((opt) => opt.category === 'analysis'),
    tags: options.filter((opt) => opt.category === 'tags'),
    source: options.filter((opt) => opt.category === 'source'),
  };

  return (
    <View style={styles.compactFilterDropdownContainer}>
      <View style={styles.filterDropdownMenu}>
        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
          {Object.entries(groupedOptions).map(([categoryKey, categoryOptions]) => {
            if (categoryOptions.length === 0) return null;
            const categoryLabel = {
              type: 'Call Types',
              analysis: 'Analysis Results',
              tags: 'Analysis Tags',
              source: 'Call Sources',
            }[categoryKey as keyof typeof groupedOptions];

            return (
              <View key={categoryKey} style={styles.filterCategory}>
                <Text style={styles.filterCategoryTitle}>{categoryLabel}</Text>
                {categoryOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.filterDropdownItem, selectedKey === opt.key && styles.filterDropdownItemActive]}
                    onPress={() => onSelect(opt.key)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.filterDropdownItemContent}>
                      {opt.icon && (
                        <opt.icon
                          size={14}
                          color={selectedKey === opt.key ? HEYWAY_COLORS.interactive.primary : HEYWAY_COLORS.text.secondary}
                        />
                      )}
                      <Text style={[styles.filterDropdownItemText, selectedKey === opt.key && styles.filterDropdownItemTextActive]}>
                        {opt.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const CallCard = React.memo(({
  isSelected,
  name,
  timeLabel,
  duration,
  lastMessage,
  analysis,
  initialPrompt,
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
  initialPrompt: string;
  showGroupKebab: boolean;
  isGroupMenuOpen: boolean;
  onPress: () => void;
  onToggleGroupMenu: () => void;
  groups: Group[];
  onPickGroup: (groupId: string) => void;
}) => {
  return (
    <TouchableOpacity
      style={[styles.callCard, isSelected && styles.callCardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.callCardContent}>
        <View style={styles.callCardHeaderLeft}>
          <View style={styles.callCardHeader}>
            <Text style={[styles.callCardName, isSelected && styles.callCardNameSelected]} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.callCardHeaderRight}>
              <Text style={[styles.callCardTime, isSelected && styles.callCardTimeSelected]}>{timeLabel}</Text>
              {!!analysis && (
                <View style={styles.callCardHeaderAnalysis}>
                  <CallAnalysisTag analysis={analysis} size="small" showIcon={false} showScore={false} />
                </View>
              )}
              {showGroupKebab && (
                <TouchableOpacity
                  style={styles.groupMenuButton}
                  onPress={onToggleGroupMenu}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MoreVertical size={14} color={HEYWAY_COLORS.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={[styles.callCardSubject, isSelected && styles.callCardSubjectSelected]} numberOfLines={1}>
            {initialPrompt}
          </Text>
          {!!lastMessage && (
            <Text style={[styles.callCardMessage, isSelected && styles.callCardMessageSelected]} numberOfLines={2}>
              {lastMessage}
            </Text>
          )}
        </View>
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

const LoadingState = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
    <Text style={styles.loadingTitle}>{title}</Text>
    {subtitle && <Text style={styles.loadingSubtitle}>{subtitle}</Text>}
  </View>
);

const ErrorState = ({
  error,
  onRetry,
  retryCount
}: {
  error: string;
  onRetry: () => void;
  retryCount: number;
}) => (
  <View style={styles.errorContainer}>
    <AlertTriangle size={48} color={HEYWAY_COLORS.status.error} />
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorMessage}>{error}</Text>
    <TouchableOpacity
      style={styles.retryButton}
      onPress={onRetry}
      activeOpacity={0.85}
    >
      <Text style={styles.retryButtonText}>
        {retryCount > 0 ? `Retry (${retryCount})` : 'Try Again'}
      </Text>
    </TouchableOpacity>
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
 * Styles – tuned to match HomeSidebar liquid-glass aesthetics
 *************************/
const PANEL_MIN_WIDTH = 360; // friendly width for list next to summary

const styles = StyleSheet.create({
  // Clean panel wrapper
  panelContainer: {
    minWidth: PANEL_MIN_WIDTH,
    maxWidth: 520,
    flex: 1,

    overflow: 'visible',
    ...HEYWAY_SHADOWS.xs,
    borderRightWidth: 1,
    borderRightColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  webGlassFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  innerHighlight: {
    ...StyleSheet.absoluteFillObject,
    shadowColor: HEYWAY_COLORS.background.primary,
    shadowOpacity: 0.45,
    shadowRadius: 0,
  },
  panelContent: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },

  // Header
  header: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    paddingBottom: 6,
    paddingTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },
  compactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    minHeight: 38,
    gap: HEYWAY_SPACING.sm,
  },
  compactTitleContainer: { minWidth: 60 },
  compactTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.headline,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    ...(Platform.OS === 'web' ? { userSelect: 'none' } : {}),
  },
  compactControlsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: HEYWAY_SPACING.sm,
  },
  compactFilterButton: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  compactFilterButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  compactFilterButtonText: { fontSize: 12, fontWeight: '500', color: HEYWAY_COLORS.text.primary },
  compactChevron: { marginLeft: 2 },
  compactHideEmptyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  compactToggleIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: HEYWAY_COLORS.fill.quaternary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
  },
  compactHideEmptyText: { fontSize: 11, fontWeight: '500', color: HEYWAY_COLORS.text.secondary },
  compactPlusButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },

  compactFilterDropdownContainer: {
    position: 'absolute',
    top: 40,
    left: 12,
    right: 12,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.xs,
    zIndex: 1000,
    maxHeight: 300,
  },

  // List wrapper
  listWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
    overflow: 'visible',
  },
  listContent: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0, flex: 1 },
  flatListContainer: {
    position: 'relative',
    zIndex: 1,
    overflow: 'visible',
  },

  // Dropdown menu shared
  filterDropdownMenu: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.xs,
    marginTop: HEYWAY_SPACING.sm,
    maxHeight: 300,
    zIndex: 1001,
  },
  filterCategory: { paddingVertical: HEYWAY_SPACING.sm },
  filterCategoryTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: HEYWAY_COLORS.text.tertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingBottom: HEYWAY_SPACING.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.divider,
    marginBottom: HEYWAY_SPACING.xs,
  },
  filterDropdownItem: { paddingHorizontal: HEYWAY_SPACING.md, paddingVertical: HEYWAY_SPACING.sm },
  filterDropdownItemActive: { backgroundColor: '#F0F9FF' },
  filterDropdownItemContent: { flexDirection: 'row', alignItems: 'center', gap: HEYWAY_SPACING.sm },
  filterDropdownItemText: { fontSize: 14, fontWeight: '500', color: HEYWAY_COLORS.text.secondary },
  filterDropdownItemTextActive: { color: HEYWAY_COLORS.interactive.primary, fontWeight: '600' },

  // Overlay to dismiss menus
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },

  // Call item
  callCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 0,
    marginHorizontal: 0,
    marginVertical: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    minHeight: 56,
    position: 'relative',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
    // Ensure proper stacking context for dropdowns
    zIndex: 1,
    overflow: 'visible',
  },
  callCardSelected: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    zIndex: 2,
  },
  callCardContent: {
    flex: 1,
    overflow: 'visible',
  },
  callCardMain: { flex: 1, gap: 2 },
  callCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  callCardHeaderLeft: { flex: 1 },
  callCardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  callCardHeaderAnalysis: { marginLeft: 4 },
  callCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  callCardName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.body
  },
  callCardNameSelected: {
    color: HEYWAY_COLORS.text.primary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold
  },
  callCardSubject: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.body,
    marginTop: 1
  },
  callCardSubjectSelected: {
    color: HEYWAY_COLORS.text.primary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold
  },
  callCardTime: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal
  },
  callCardTimeSelected: {
    color: HEYWAY_COLORS.text.secondary
  },
  callCardMessage: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.callout,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.callout,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  callCardMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  callCardMessageBold: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.callout,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.callout,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  callCardMessageBoldSelected: {
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  callCardMessageSelected: {
    color: HEYWAY_COLORS.text.secondary,
  },

  // Group dropdown (kebab)
  groupMenuButton: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 6,
    ...Platform.select({
      web: { cursor: 'pointer' as any },
      default: {},
    }),
  },

  groupDropdownMenu: {
    position: 'absolute',
    right: 12,
    top: '100%',
    minWidth: 180,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.xs,
    zIndex: 99999,
    paddingVertical: 6,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxHeight: 300,
    overflow: 'visible',
    // Ensure the dropdown is always visible above other elements
    pointerEvents: 'auto',
    // Ensure the dropdown is not clipped by parent containers
    transform: [{ translateZ: 0 }],
    // Add margin to create space between card and dropdown
    marginTop: 4,

  },
  groupDropdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: HEYWAY_COLORS.text.tertiary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  groupDropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupDropdownItemText: {
    fontSize: 13,
    color: HEYWAY_COLORS.text.primary,
  },

  // Loading / Empty
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'transparent',
    gap: HEYWAY_SPACING.md,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: HEYWAY_SPACING.xl,
    backgroundColor: 'transparent',
    gap: HEYWAY_SPACING.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.md,
    marginTop: HEYWAY_SPACING.sm,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.inverse,
    textAlign: 'center',
  },
  emptyState: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
  },
  emptyText: {
    fontSize: 13,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Footer (load more)
  loadMoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: HEYWAY_COLORS.border.primary,
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: HEYWAY_COLORS.interactive.primary,
  },

  // Toggles / chevron states
  hideEmptyToggleActive: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },
  toggleIndicatorActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
  },
  hideEmptyTextActive: {
    color: HEYWAY_COLORS.text.primary,
    fontWeight: '600',
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },

  // Mobile specific styles
  mobilePanelContainer: {
    minWidth: 'auto',
    maxWidth: 'auto',
    flex: 1,
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    minHeight: 44,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },
  mobileBackButton: {
    padding: 8,
  },
  mobileHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  mobileHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
  },
  mobileHeaderSubtitle: {
    fontSize: 13,
    color: HEYWAY_COLORS.text.secondary,
  },
  mobilePlusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  mobileSearchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  mobileSearchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },
  mobileSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mobileSearchIcon: { marginRight: 8 },
  mobileSearchInput: {
    flex: 1,
    fontSize: 16,
    color: HEYWAY_COLORS.text.primary,
    paddingVertical: 0,
  },
  mobileClearButton: {
    padding: 8,
  },

  // Plus dropdown menu
  plusDropdownMenu: {
    position: 'absolute',
    top: 44, // Adjust based on header height
    right: 12,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.xs,
    zIndex: 1002,
    minWidth: 180,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'visible',
  },
  plusDropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plusDropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.primary,
  },
});