import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';
import {
  Zap,
  ArrowRight,
  MoreVertical,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  Plus,
  Target,
  Play,
  Pause,
  Edit3,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { apiService } from '../services/apiService';
import {
  HEYWAY_COLORS,
  HEYWAY_SPACING,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
} from '../styles/HEYWAY_STYLE_GUIDE';

interface Automation {
  id: string;
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

type FilterType =
  | 'all'
  | 'active'
  | 'inactive'
  | 'recent'
  | 'scheduled'
  | 'completed'
  | 'pending'
  | string;

interface FilterOption {
  key: FilterType;
  label: string;
  icon?: any;
  category?: 'status' | 'timing' | 'performance';
}

interface AutomationsListViewProps {
  activeSection: string;
  onAutomationSelect?: (automation: Automation) => void;
  selectedAutomationId?: string;
  onCreateAutomation?: () => void;
  onEditAutomation?: (automation: Automation) => void;
  onAutomationToggle?: (automationId: string, isActive: boolean) => void;
  onAutomationDelete?: (automationId: string) => void;
  isFullWidth?: boolean; // New prop to control width behavior
}

// --- Web-only helpers (mirror HomeSidebar) ---------------------------------
const webView = (obj: any): any =>
  Platform.OS === 'web' ? obj : {};

const webText = (obj: any): any =>
  Platform.OS === 'web' ? obj : {};

// Error Boundary Component
class AutomationsListErrorBoundary extends React.Component<
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
    console.error('AutomationsListView Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={HEYWAY_COLORS.status.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            The automations list encountered an unexpected error. Please refresh the page.
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

function AutomationsListView({
  activeSection,
  onAutomationSelect,
  selectedAutomationId,
  onCreateAutomation,
  onEditAutomation,
  onAutomationToggle,
  onAutomationDelete,
  isFullWidth = false,
}: AutomationsListViewProps) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const onPressHaptic = useCallback(
    (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
      if (Platform.OS === 'ios') Haptics.impactAsync(style);
    },
    []
  );

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedAutomations = await apiService.getAutomations();
      setAutomations(Array.isArray(loadedAutomations) ? loadedAutomations : []);
    } catch (error) {
      console.error('Failed to load automations:', error);
      setAutomations([]);
      setError('Failed to load automations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helpers
  const toLocalDate = (iso?: string) => {
    if (!iso) return null;
    const hasTime = /T\d{2}:\d{2}/.test(iso);
    return new Date(hasTime ? iso : `${iso}T12:00:00`);
  };

  const formatTrigger = (automation: Automation) => {
    if (automation.triggerType === 'date_offset') {
      return `${automation.offsetDays} days ${automation.offsetDirection} at ${automation.offsetTime}`;
    } else if (automation.triggerType === 'on_date') {
      const d = toLocalDate(automation.onDate || '');
      const dateStr = d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown date';
      return `On ${dateStr} at ${automation.onTime || 'Unknown time'}`;
    }
    return 'Fixed date trigger';
  };

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

  const getAutomationInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColors = (name: string, isActive: boolean) => {
    const colors = {
      active: [
        { bg: HEYWAY_COLORS.background.secondary, border: HEYWAY_COLORS.status.success, text: HEYWAY_COLORS.status.success },
        { bg: HEYWAY_COLORS.background.secondary, border: HEYWAY_COLORS.accent.info, text: HEYWAY_COLORS.accent.info },
        { bg: HEYWAY_COLORS.background.secondary, border: HEYWAY_COLORS.accent.warning, text: HEYWAY_COLORS.accent.warning },
      ],
      inactive: [
        { bg: HEYWAY_COLORS.background.secondary, border: HEYWAY_COLORS.border.secondary, text: HEYWAY_COLORS.text.tertiary },
        { bg: HEYWAY_COLORS.background.tertiary, border: HEYWAY_COLORS.border.primary, text: HEYWAY_COLORS.text.secondary },
        { bg: HEYWAY_COLORS.background.panel, border: HEYWAY_COLORS.border.primary, text: HEYWAY_COLORS.text.secondary },
      ],
    };

    const colorSet = isActive ? colors.active : colors.inactive;
    const charCode = name ? name.charCodeAt(0) : 0;
    const colorIndex = charCode % colorSet.length;

    return colorSet[colorIndex];
  };

  const toggleAutomation = async (automationId: string, isActive: boolean) => {
    try {
      onPressHaptic();
      const automation = automations.find(a => a.id === automationId);
      if (!automation) return;

      // Optimistic update for immediate UI feedback
      setAutomations(prev => prev.map(a =>
        a.id === automationId
          ? { ...a, isActive: !a.isActive }
          : a
      ));

      await apiService.toggleAutomation(automationId, !isActive);

      // Refresh the list to ensure consistency with server state
      await loadAutomations();
    } catch (error) {
      console.error('Failed to toggle automation:', error);

      // Revert optimistic update on error
      setAutomations(prev => prev.map(a =>
        a.id === automationId
          ? { ...a, isActive: !a.isActive } // Revert to original state
          : a
      ));

      Alert.alert('Error', 'Failed to update automation status');
    }
  };

  const deleteAutomation = async (automationId: string) => {
    Alert.alert(
      'Delete Automation',
      'Are you sure you want to delete this automation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAutomation(automationId);
              setAutomations(prev => prev.filter(a => a.id !== automationId));
              Alert.alert('Success', 'Automation deleted successfully');
            } catch (error) {
              console.error('Failed to delete automation:', error);
              Alert.alert('Error', 'Failed to delete automation');
            }
          }
        }
      ]
    );
  };

  // FILTER OPTIONS (memoized with stable base options)
  const baseFilterOptions: FilterOption[] = useMemo(() => [
    // Status Filters
    { key: 'all', label: 'All Automations', icon: Zap, category: 'status' },
    { key: 'active', label: 'Active', icon: CheckCircle, category: 'status' },
    { key: 'inactive', label: 'Inactive', icon: AlertTriangle, category: 'status' },

    // Timing Filters
    { key: 'recent', label: 'Recently Created', icon: Clock, category: 'timing' },
    { key: 'scheduled', label: 'Scheduled', icon: Clock, category: 'timing' },

    // Performance Filters
    { key: 'completed', label: 'High Completion', icon: CheckCircle, category: 'performance' },
    { key: 'pending', label: 'Pending Calls', icon: Clock, category: 'performance' },
  ], []);

  const filterOptions: FilterOption[] = useMemo(() => [
    ...baseFilterOptions,
  ], [baseFilterOptions]);

  // FILTERING (memoized with separated concerns)
  const filteredAutomationsWithoutSearch = useMemo(() => {
    let filtered = automations;

    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter((a) => a.isActive);
        break;
      case 'inactive':
        filtered = filtered.filter((a) => !a.isActive);
        break;
      case 'recent':
        filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'scheduled':
        filtered = filtered.filter((a) => a.pendingCount > 0);
        break;
      case 'completed':
        filtered = filtered.filter((a) => a.completedCount > 0);
        break;
      case 'pending':
        filtered = filtered.filter((a) => a.pendingCount > 0);
        break;
      default:
        break;
    }

    return filtered;
  }, [selectedFilter, automations]);

  const displayedAutomations = useMemo(() => {
    if (!searchQuery) return filteredAutomationsWithoutSearch;
    const q = searchQuery.toLowerCase();
    return filteredAutomationsWithoutSearch.filter((a: Automation) => {
      const name = a.name.toLowerCase();
      const description = (a.description || '').toLowerCase();
      const instructions = (a.aiInstructions || '').toLowerCase();
      return name.includes(q) || description.includes(q) || instructions.includes(q);
    });
  }, [filteredAutomationsWithoutSearch, searchQuery]);

  const retryLoad = useCallback(() => {
    setError(null);
    setRetryCount(prev => prev + 1);
    loadAutomations();
  }, [loadAutomations]);

  // RENDERERS
  const renderAutomationCard = useCallback(({ item: automation }: { item: Automation }) => {
    const isSelected = selectedAutomationId === automation.id;
    const avatarColors = getAvatarColors(automation.name, automation.isActive);
    const day = formatDayOfWeek(automation.createdAt);
    const trigger = formatTrigger(automation);
    const statusText = `${automation.contactsCount} contacts • ${automation.completedCount} completed • ${automation.pendingCount} pending`;

    return (
      <TouchableOpacity
        style={[styles.automationCard, isSelected && styles.automationCardSelected]}
        onPress={() => { onPressHaptic(); onAutomationSelect?.(automation); }}
        activeOpacity={0.85}
      >
        <View style={styles.automationCardContent}>
          <View style={styles.automationCardMain}>
            <View style={styles.automationCardHeader}>
              <Text style={[styles.automationCardName, isSelected && styles.automationCardNameSelected]} numberOfLines={1}>
                {automation.name}
              </Text>
              <View style={styles.automationCardMeta}>
                <Text style={[styles.automationCardTime, isSelected && styles.automationCardTimeSelected]}>{day}</Text>
                <View style={[styles.statusIndicator, { backgroundColor: automation.isActive ? HEYWAY_COLORS.status.success : HEYWAY_COLORS.accent.warning }]} />
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleAutomation(automation.id, automation.isActive);
                  }}
                  activeOpacity={0.7}
                >
                  {automation.isActive ? (
                    <Pause size={14} color={isSelected ? HEYWAY_COLORS.text.primary : HEYWAY_COLORS.text.tertiary} />
                  ) : (
                    <Play size={14} color={isSelected ? HEYWAY_COLORS.text.primary : HEYWAY_COLORS.text.tertiary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.automationCardMessageContainer}>
              <Text style={[styles.automationCardMessageBold, isSelected && styles.automationCardMessageBoldSelected]} numberOfLines={1}>
                {trigger}
              </Text>
              {statusText && (
                <Text style={[styles.automationCardMessage, isSelected && styles.automationCardMessageSelected]} numberOfLines={1}>
                  {statusText}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [selectedAutomationId, getAvatarColors, formatDayOfWeek, formatTrigger, onAutomationSelect, onPressHaptic, toggleAutomation]);

  const keyExtractor = useCallback((item: Automation, index: number) => `${item.id}-${index}`, [/* stable */]);

  // LOADING STATES
  if (isLoading && !automations.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
        <Text style={styles.loadingTitle}>Loading automations…</Text>
        <Text style={styles.loadingSubtitle}>This shouldn't take long</Text>
      </View>
    );
  }

  // ERROR STATES
  if (error && !isLoading) {
    return <ErrorState error={error} onRetry={retryLoad} retryCount={retryCount} />;
  }

  // Create dynamic styles based on isFullWidth prop
  const dynamicStyles = StyleSheet.create({
    panelContainer: {
      minWidth: isFullWidth ? '100%' : PANEL_MIN_WIDTH,
      maxWidth: isFullWidth ? '100%' : 520,
      flex: 1,

      overflow: 'visible',
      ...HEYWAY_SHADOWS.sm,
      borderRightWidth: isFullWidth ? 0 : StyleSheet.hairlineWidth,
      borderRightColor: HEYWAY_COLORS.border.primary,
      backgroundColor: HEYWAY_COLORS.background.primary,
    },
  });

  return (
    <View style={dynamicStyles.panelContainer} accessibilityRole="none" accessibilityLabel="Automations list">
      {/* Liquid Glass layer */}
      {/* Content */}
      <View style={styles.panelContent}>
        {/* Header */}
        <Header
          count={displayedAutomations.length}
          onOpenMenu={() => { }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewAutomation={onCreateAutomation}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onSelectFilter={(filter) => { onPressHaptic(); setSelectedFilter(filter); }}
          isFilterDropdownOpen={isFilterDropdownOpen}
          onToggleFilterDropdown={() => { onPressHaptic(); setIsFilterDropdownOpen(!isFilterDropdownOpen); }}
        />

        {/* Overlay to close any open menus */}
        {isFilterDropdownOpen && (
          <TouchableOpacity
            style={styles.menuOverlay}
            onPress={() => { setIsFilterDropdownOpen(false); }}
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

        {/* List */}
        <View style={styles.listWrapper}>
          <FlatList
            data={displayedAutomations}
            renderItem={renderAutomationCard}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            style={styles.flatListContainer}
            ListEmptyComponent={
              <EmptyState
                icon={Zap}
                title={getEmptyTitle(activeSection)}
                subtitle={getEmptySubtitle(activeSection)}
              />
            }
          />
        </View>
      </View>
    </View>
  );
}

// Export with Error Boundary
export default function AutomationsListViewWithErrorBoundary(props: AutomationsListViewProps) {
  return (
    <AutomationsListErrorBoundary>
      <AutomationsListView {...props} />
    </AutomationsListErrorBoundary>
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
  onNewAutomation,
  filterOptions,
  selectedFilter,
  onSelectFilter,
  isFilterDropdownOpen,
  onToggleFilterDropdown,
}: {
  count: number;
  onOpenMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewAutomation?: () => void;
  filterOptions: FilterOption[];
  selectedFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  isFilterDropdownOpen: boolean;
  onToggleFilterDropdown: () => void;
}) => {
  const selectedOption = filterOptions.find((opt) => opt.key === selectedFilter) || filterOptions[0];

  return (
    <View style={styles.header}>
      <View style={styles.compactHeaderRow}>
        {/* Left – Title */}
        <View style={styles.compactTitleContainer}>
          <Text style={styles.compactTitle}>Automations</Text>
        </View>

        {/* Center – Filter */}
        <View style={styles.compactControlsContainer}>
          <TouchableOpacity
            style={styles.compactFilterButton}
            onPress={onToggleFilterDropdown}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Filter automations by ${selectedOption.label}`}
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
        </View>

        {/* Right – New */}
        <TouchableOpacity
          style={styles.compactPlusButton}
          onPress={onNewAutomation}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="New automation"
        >
          <Plus size={16} color={HEYWAY_COLORS.text.inverse} />
        </TouchableOpacity>
      </View>
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
    status: options.filter((opt) => opt.category === 'status'),
    timing: options.filter((opt) => opt.category === 'timing'),
    performance: options.filter((opt) => opt.category === 'performance'),
  };

  return (
    <View style={styles.compactFilterDropdownContainer}>
      <View style={styles.filterDropdownMenu}>
        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
          {Object.entries(groupedOptions).map(([categoryKey, categoryOptions]) => {
            if (categoryOptions.length === 0) return null;
            const categoryLabel = {
              status: 'Status',
              timing: 'Timing',
              performance: 'Performance',
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

/*************************
 * Helpers
 *************************/
const getEmptyTitle = (section: string) => {
  switch (section) {
    case 'active':
      return 'No active automations';
    case 'inactive':
      return 'No inactive automations';
    case 'recent':
      return 'No recent automations';
    case 'scheduled':
      return 'No scheduled automations';
    case 'completed':
      return 'No completed automations';
    case 'pending':
      return 'No pending automations';
    default:
      return 'No automations yet';
  }
};

const getEmptySubtitle = (section: string) => {
  switch (section) {
    case 'active':
      return 'No automations are currently active';
    case 'inactive':
      return 'No automations are currently inactive';
    case 'recent':
      return 'No automations have been created recently';
    case 'scheduled':
      return 'No automations have scheduled calls';
    case 'completed':
      return 'No automations have completed calls';
    case 'pending':
      return 'No automations have pending calls';
    default:
      return 'Create your first automation to get started';
  }
};

/*************************
 * Styles – tuned to match HomeSidebar liquid-glass aesthetics
 *************************/
const PANEL_MIN_WIDTH = 360; // friendly width for list next to summary

const styles = StyleSheet.create({
  panelContent: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },

  // Header
  header: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    paddingBottom: HEYWAY_SPACING.xs,
    paddingTop: HEYWAY_SPACING.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },
  compactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.md,
    minHeight: 40,
    gap: HEYWAY_SPACING.md,
  },
  compactTitleContainer: { 
    minWidth: HEYWAY_SPACING.xxxxl 
  },
  compactTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title1,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    ...webText({ userSelect: 'none' as any }),
  },
  compactControlsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: HEYWAY_SPACING.md,
  },
  compactFilterButton: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.xs,
    ...webView({ cursor: 'pointer' as any }),
  },
  compactFilterButtonContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: HEYWAY_SPACING.xs 
  },
  compactFilterButtonText: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline, 
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium, 
    color: HEYWAY_COLORS.text.primary 
  },
  compactChevron: { 
    marginLeft: HEYWAY_SPACING.xs 
  },
  compactPlusButton: {
    width: HEYWAY_SPACING.xxxl,
    height: HEYWAY_SPACING.xxxl,
    borderRadius: HEYWAY_SPACING.lg,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.sm,
    ...webView({ cursor: 'pointer' as any }),
  },

  compactFilterDropdownContainer: {
    position: 'absolute',
    top: 44,
    left: HEYWAY_SPACING.md,
    right: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.md,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.md,
    marginTop: HEYWAY_SPACING.md,
    maxHeight: 300,
    zIndex: 1001,
  },
  filterCategory: { 
    paddingVertical: HEYWAY_SPACING.md 
  },
  filterCategoryTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
    textTransform: 'uppercase',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingBottom: HEYWAY_SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    marginBottom: HEYWAY_SPACING.sm,
  },
  filterDropdownItem: { 
    paddingHorizontal: HEYWAY_SPACING.lg, 
    paddingVertical: HEYWAY_SPACING.md 
  },
  filterDropdownItemActive: { 
    backgroundColor: HEYWAY_COLORS.background.selected 
  },
  filterDropdownItemContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: HEYWAY_SPACING.md 
  },
  filterDropdownItemText: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body, 
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium, 
    color: HEYWAY_COLORS.text.secondary 
  },
  filterDropdownItemTextActive: { 
    color: HEYWAY_COLORS.interactive.primary, 
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold 
  },

  // Overlay to dismiss menus
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },

  // Automation item
  automationCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 0,
    marginHorizontal: 0,
    marginVertical: 0,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    minHeight: 60,
    position: 'relative',
    ...webView({ cursor: 'pointer' as any }),
    // Ensure proper stacking context for dropdowns
    zIndex: 1,
    overflow: 'visible',
  },
  automationCardSelected: {
    backgroundColor: HEYWAY_COLORS.background.selected,
    borderLeftWidth: HEYWAY_SPACING.xs,
    borderLeftColor: HEYWAY_COLORS.interactive.primary,
    zIndex: 2,
  },
  automationCardContent: {
    flex: 1,
    overflow: 'visible',
  },
  automationCardMain: { 
    flex: 1, 
    gap: HEYWAY_SPACING.xs 
  },
  automationCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  automationCardMeta: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: HEYWAY_SPACING.xs 
  },
  automationCardName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.body
  },
  automationCardNameSelected: {
    color: HEYWAY_COLORS.text.primary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  automationCardTime: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  automationCardTimeSelected: {
    color: HEYWAY_COLORS.text.secondary,
  },
  automationCardMessage: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  automationCardMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  automationCardMessageBold: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  automationCardMessageBoldSelected: {
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  automationCardMessageSelected: {
    color: HEYWAY_COLORS.text.secondary,
  },

  // Status indicator and quick action button
  statusIndicator: {
    width: HEYWAY_SPACING.xs,
    height: HEYWAY_SPACING.xs,
    borderRadius: HEYWAY_RADIUS.xs,
  },
  quickActionButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: HEYWAY_RADIUS.xs,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.xs,
  },

  // Loading / Empty
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: HEYWAY_SPACING.lg,
    backgroundColor: 'transparent',
    gap: HEYWAY_SPACING.lg,
  },
  loadingTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title2,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  loadingSubtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: HEYWAY_SPACING.xxl,
    backgroundColor: 'transparent',
    gap: HEYWAY_SPACING.lg,
  },
  errorTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title2,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  errorMessage: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  retryButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.lg,
    marginTop: HEYWAY_SPACING.md,
    ...HEYWAY_SHADOWS.sm,
    ...webView({ cursor: 'pointer' as any }),
  },
  retryButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  emptyState: {
    paddingVertical: HEYWAY_SPACING.giant,
    paddingHorizontal: HEYWAY_SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: HEYWAY_SPACING.md,
  },
  emptyTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title2,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  emptyText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  // Toggles / chevron states
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
});