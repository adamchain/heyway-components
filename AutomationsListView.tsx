import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Clock, Users, Play, Pause, Edit3, Trash2, Target, Plus, Settings, MessageCircle, Eye, CheckCircle2, AlertCircle, Phone, Calendar, Zap, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { apiService } from '@/services/apiService';
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_COMPONENTS, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';

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

interface AutomationsListViewProps {
  activeSection: string;
  onAutomationSelect?: (automation: Automation) => void;
  onCreateAutomation?: () => void;
  onEditAutomation?: (automation: Automation) => void;
  selectedAutomationId?: string;
}

export default function AutomationsListView({
  activeSection,
  onAutomationSelect,
  onCreateAutomation,
  onEditAutomation,
  selectedAutomationId
}: AutomationsListViewProps) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [allCalls, setAllCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAutomations();
    loadAllCalls();
  }, []);

  const loadAllCalls = async () => {
    try {
      const calls = await apiService.getAllCalls();
      setAllCalls(calls);
    } catch (error) {
      console.error('Failed to load all calls:', error);
      setAllCalls([]);
    }
  };

  const handleHapticFeedback = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const loadAutomations = async () => {
    try {
      setIsLoading(true);
      const loadedAutomations = await apiService.getAutomations();
      setAutomations(Array.isArray(loadedAutomations) ? loadedAutomations : []);
    } catch (error) {
      console.error('Failed to load automations:', error);
      setAutomations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helpers
  const toLocalDate = (iso?: string) => {
    if (!iso) return null;
    // Avoid UTC off-by-one by anchoring midday when we only have a date (YYYY-MM-DD)
    const hasTime = /T\d{2}:\d{2}/.test(iso);
    return new Date(hasTime ? iso : `${iso}T12:00:00`);
  };

  const toggleAutomation = async (automationId: string) => {
    try {
      handleHapticFeedback();
      const automation = automations.find(a => a.id === automationId);
      if (!automation) return;

      // Optimistic update for immediate UI feedback
      setAutomations(prev => prev.map(a =>
        a.id === automationId
          ? { ...a, isActive: !a.isActive }
          : a
      ));

      await apiService.toggleAutomation(automationId, !automation.isActive);

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

  const getFilteredAutomations = () => {
    switch (activeSection) {
      case 'active':
        return automations.filter(a => a.isActive);
      case 'inactive':
        return automations.filter(a => !a.isActive);
      default:
        return automations;
    }
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

  const getStatusColor = (isActive: boolean) => {
    return isActive ? HEYWAY_COLORS.status.success : HEYWAY_COLORS.status.error;
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
  const renderAutomationCard = ({ item: automation }: { item: Automation }) => {
    const isSelected = selectedAutomationId === automation.id;

    return (
      <TouchableOpacity
        style={[
          styles.automationCard,
          isSelected && styles.automationCardSelected
        ]}
        onPress={() => {
          handleHapticFeedback();
          onAutomationSelect?.(automation);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.automationCardContent}>
          <View style={styles.automationCardHeader}>
            <View style={styles.automationCardHeaderLeft}>
              <Text style={[styles.automationCardName, isSelected && styles.automationCardNameSelected]} numberOfLines={1}>
                {automation.name}
              </Text>
            </View>
            <View style={styles.automationCardHeaderRight}>
              <Text style={[styles.automationCardTime, isSelected && styles.automationCardTimeSelected]}>
                {formatTrigger(automation)}
              </Text>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: automation.isActive ? HEYWAY_COLORS.status.success : HEYWAY_COLORS.accent.warning }
              ]} />
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleAutomation(automation.id);
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

          <Text style={[styles.automationCardMessage, isSelected && styles.automationCardMessageSelected]} numberOfLines={2}>
            {automation.contactsCount} contacts • {automation.completedCount} completed • {automation.pendingCount} pending
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getTitle = () => {
    switch (activeSection) {
      case 'active':
        return 'Active Automations';
      case 'inactive':
        return 'Inactive Automations';
      case 'calls':
        return 'All Calls';
      default:
        return 'All Automations';
    }
  };

  const renderCallCard = ({ item: call }: { item: any }) => {
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

    return (
      <TouchableOpacity
        style={styles.callCard}
        onPress={() => {
          handleHapticFeedback();
        }}
        activeOpacity={0.8}
      >
        <View style={styles.callCardContent}>
          <View style={styles.callCardHeader}>
            <View style={styles.callCardHeaderLeft}>
              <Text style={styles.callCardName} numberOfLines={1}>
                {call.participants?.[0]?.name || call.recipients?.[0]?.name || 'Unknown'}
              </Text>
            </View>
            <View style={styles.callCardHeaderRight}>
              <Text style={styles.callCardTime}>
                {formatDayOfWeek(call.date || call.scheduledTime || call.createdAt)}
              </Text>
              {call.duration && (
                <Text style={styles.callCardDuration}>• {call.duration}</Text>
              )}
            </View>
          </View>

          <Text style={styles.callCardMessage} numberOfLines={2}>
            {call.automationName ? `via ${call.automationName}` : call.status || 'Completed'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
        <Text style={styles.loadingText}>Loading automations...</Text>
      </View>
    );
  }

  const filteredAutomations = getFilteredAutomations();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{getTitle()}</Text>
          </View>
          <TouchableOpacity style={styles.toolbarButton} onPress={onCreateAutomation}>
            <Plus size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.listWrapper}>
        {activeSection === 'calls' ? (
          /* All Calls List */
          <FlatList
            data={allCalls}
            renderItem={renderCallCard}
            keyExtractor={(item) => item.id || item.callId || item.scheduledTime || item.createdAt}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Phone size={48} color={HEYWAY_COLORS.text.tertiary} />
                <Text style={styles.emptyTitle}>No Calls</Text>
                <Text style={styles.emptyText}>
                  Your calls and scheduled calls will appear here
                </Text>
              </View>
            }
          />
        ) : (
          /* Automations List */
          <FlatList
            data={filteredAutomations}
            renderItem={renderAutomationCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Target size={48} color={HEYWAY_COLORS.text.tertiary} />
                <Text style={styles.emptyTitle}>
                  {activeSection === 'active' ? 'No Active Automations' :
                    activeSection === 'inactive' ? 'No Inactive Automations' :
                      'No Automations'}
                </Text>
                <Text style={styles.emptyText}>
                  {activeSection === 'active' ? 'No automations are currently active' :
                    activeSection === 'inactive' ? 'No automations are currently inactive' :
                      'Create your first automation to get started'}
                </Text>
                {activeSection === 'all' && (
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={onCreateAutomation}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.createButtonText}>Create Automation</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: HEYWAY_COLORS.background.content,
  },
  loadingText: {
    fontSize: 16,
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: '500',
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
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  subtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
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

  listWrapper: { flex: 1 },
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 6,
    paddingBottom: HEYWAY_SPACING.xxl
  },

  automationCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    marginHorizontal: HEYWAY_SPACING.sm,
    marginVertical: HEYWAY_SPACING.xs,
    padding: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  automationCardSelected: {
    backgroundColor: HEYWAY_COLORS.interactive.selected,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  automationCardContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 6
  },
  automationCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8
  },
  automationCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1
  },
  automationCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  automationCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  automationCardNameSelected: {
    color: HEYWAY_COLORS.text.primary,
    fontWeight: '700',
  },
  automationCardTime: {
    fontSize: 11,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.tertiary,
  },
  automationCardTimeSelected: {
    color: HEYWAY_COLORS.text.secondary,
  },
  automationCardMessage: {
    fontSize: 12,
    fontWeight: '400',
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  automationCardMessageSelected: {
    color: HEYWAY_COLORS.text.primary,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 4,
  },
  quickActionButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: HEYWAY_RADIUS.sm,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.secondary,
  },

  callCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    marginHorizontal: 8,
    marginVertical: 2,
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.divider,
  },
  callCardContent: { flex: 1, flexDirection: 'column', gap: 6 },
  callCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  callCardHeaderLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  callCardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  callCardName: { fontSize: 14, fontWeight: '600', color: HEYWAY_COLORS.text.primary, letterSpacing: -0.1, lineHeight: 20 },
  callCardTime: { fontSize: 11, fontWeight: '500', color: HEYWAY_COLORS.text.tertiary },
  callCardDuration: { fontSize: 11, fontWeight: '500', color: HEYWAY_COLORS.text.tertiary },
  callCardMessage: { fontSize: 12, fontWeight: '400', color: HEYWAY_COLORS.text.secondary, lineHeight: 18, letterSpacing: -0.1 },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.5,
  },
  emptyText: {
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 32,
    fontSize: 16,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: HEYWAY_COLORS.interactive.primary,
  },
});