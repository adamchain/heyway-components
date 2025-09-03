import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Modal,
    ScrollView,
    SafeAreaView,
    Platform,
} from 'react-native';
import { Clock, Calendar, X, ChevronRight, Zap, Phone, Trash2, ArrowRight } from 'lucide-react-native';
import { apiService } from '../services/apiService';
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS } from '../styles/HEYWAY_STYLE_GUIDE';

interface ScheduledActivityBannerProps {
    visible: boolean;
    onPress: () => void;
    onDataChange?: () => void;
}

interface ScheduledCall {
    _id: string;
    recipients: string[];
    notes: string;
    scheduledTime: string;
    status: 'scheduled' | 'completed' | 'failed' | 'cancelled';
    callMode: 'intro+ai' | 'ai-only';
    callerId?: string;
    voiceId?: string;
    voiceName?: string;
    automationId?: string;
    referenceDate?: string;
    contactData?: {
        name?: string;
        phoneNumber?: string;
        email?: string;
        additionalData?: any;
    };
}

interface Automation {
    _id: string;
    name: string;
    description: string;
    isActive: boolean;
    contactsCount: number;
    pendingCount: number;
    triggerType: string;
    nextRun: string;
}

export default function ScheduledActivityBanner({ visible, onPress, onDataChange }: ScheduledActivityBannerProps) {
    const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
    const [activeAutomations, setActiveAutomations] = useState<Automation[]>([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(-80));
    const [isLoading, setIsLoading] = useState(false);
    const [deletingCallId, setDeletingCallId] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            loadData();
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: -80,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load scheduled calls
            const scheduledResponse = await apiService.getScheduledCalls('scheduled');
            setScheduledCalls(Array.isArray(scheduledResponse) ? scheduledResponse : []);

            // Load active automations
            const automationsResponse = await apiService.getAutomations();
            const automations = Array.isArray(automationsResponse) ? automationsResponse : [];
            const activeOnes = automations.filter((automation: Automation) =>
                automation.isActive && automation.pendingCount > 0
            );
            setActiveAutomations(activeOnes);
        } catch (error) {
            console.error('Error loading scheduled activity:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatScheduledTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const callDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            const timeStr = date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            if (callDate.getTime() === today.getTime()) {
                return `Today at ${timeStr}`;
            } else if (callDate.getTime() === today.getTime() + 86400000) {
                return `Tomorrow at ${timeStr}`;
            } else {
                return `${date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                })} at ${timeStr}`;
            }
        } catch (error) {
            return 'Unknown time';
        }
    };

    const getTotalScheduledCount = () => {
        // Only count pending calls from active automations to match CallsListView behavior
        const activePendingCount = activeAutomations.reduce((sum, auto) => sum + (auto.pendingCount || 0), 0);
        return scheduledCalls.length + activePendingCount;
    };

    const handleBannerPress = () => {
        setShowDetailModal(true);
        onPress();
    };

    const handleDeleteScheduledCall = async (callId: string) => {
        try {
            setDeletingCallId(callId);
            await apiService.deleteScheduledCall(callId);
            // Refresh data after successful deletion
            await loadData();
            // Notify parent component about data change
            onDataChange?.();
        } catch (error) {
            console.error('Failed to delete scheduled call:', error);
            // You might want to show an error alert here
        } finally {
            setDeletingCallId(null);
        }
    };

    if (!visible) return null;

    const totalCount = getTotalScheduledCount();
    const hasScheduledCalls = scheduledCalls.length > 0;
    const hasActiveAutomations = activeAutomations.length > 0;

    return (
        <>
            <Animated.View
                style={[
                    styles.container,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <View style={styles.contentWrapper}>
                    <View style={styles.iconContainer}>
                        <Clock size={14} color={'#1DAA61'} />
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>
                            {totalCount} Scheduled Call{totalCount !== 1 ? 's' : ''}
                        </Text>
                        <Text style={styles.subtitle}>
                            {hasScheduledCalls && hasActiveAutomations
                                ? `${scheduledCalls.length} manual • ${activeAutomations.reduce((sum, auto) => sum + (auto.pendingCount || 0), 0)} automated`
                                : hasScheduledCalls
                                    ? `${scheduledCalls.length} manual`
                                    : `${activeAutomations.reduce((sum, auto) => sum + (auto.pendingCount || 0), 0)} automated`
                            }
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={handleBannerPress}
                        activeOpacity={0.7}
                    >
                        <ArrowRight size={16} color={'#000000'} />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Detail Modal */}
            <Modal
                visible={showDetailModal}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <View style={styles.modalContainer}>
                    <SafeAreaView style={styles.modalSafeArea}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderLeft}>
                                <TouchableOpacity
                                    onPress={() => setShowDetailModal(false)}
                                    style={styles.modalHeaderButton}
                                >
                                    <X size={24} color={HEYWAY_COLORS.text.primary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalHeaderCenter}>
                                <Text style={styles.modalHeaderTitle}>Scheduled Calls</Text>
                            </View>

                            <View style={styles.modalHeaderRight}>
                                {/* Empty for symmetry */}
                            </View>
                        </View>

                        {/* Content */}
                        <ScrollView
                            style={styles.modalScrollView}
                            contentContainerStyle={styles.modalScrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.modalContentContainer}>
                                {/* Scheduled Calls Section */}
                                {scheduledCalls.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <Phone size={18} color={HEYWAY_COLORS.interactive.primary} />
                                            <Text style={styles.sectionTitle}>Manual Scheduled Calls</Text>
                                            <View style={styles.sectionBadge}>
                                                <Text style={styles.sectionBadgeText}>{scheduledCalls.length}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.itemsContainer}>
                                            {scheduledCalls.map((call, index) => (
                                                <View key={call._id || index} style={styles.callItem}>
                                                    <View style={styles.callItemIcon}>
                                                        <Calendar size={16} color={HEYWAY_COLORS.interactive.primary} />
                                                    </View>
                                                    <View style={styles.callItemContent}>
                                                        <View style={styles.callItemHeader}>
                                                            <Text style={styles.callItemTitle}>
                                                                {call.contactData?.name || `${call.recipients.length} recipient${call.recipients.length !== 1 ? 's' : ''}`}
                                                            </Text>
                                                            <View style={styles.callItemActions}>
                                                                <View style={styles.statusIndicator}>
                                                                    <View style={styles.statusDot} />
                                                                    <Text style={styles.statusText}>Scheduled</Text>
                                                                </View>
                                                                <TouchableOpacity
                                                                    style={styles.deleteButton}
                                                                    onPress={() => handleDeleteScheduledCall(call._id)}
                                                                    disabled={deletingCallId === call._id}
                                                                    activeOpacity={0.7}
                                                                >
                                                                    <Trash2 size={16} color={HEYWAY_COLORS.status.error} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                        <Text style={styles.callItemTime}>
                                                            {formatScheduledTime(call.scheduledTime)}
                                                        </Text>
                                                        <View style={styles.callItemDetails}>
                                                            <View style={styles.callDetailRow}>
                                                                <Text style={styles.callDetailLabel}>Recipients:</Text>
                                                                <Text style={styles.callDetailValue}>
                                                                    {call.recipients.map(phone =>
                                                                        phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
                                                                    ).join(', ')}
                                                                </Text>
                                                            </View>
                                                            <View style={styles.callDetailRow}>
                                                                <Text style={styles.callDetailLabel}>Mode:</Text>
                                                                <Text style={styles.callDetailValue}>
                                                                    {call.callMode === 'intro+ai' ? 'Intro + AI' : 'AI Only'}
                                                                </Text>
                                                            </View>
                                                            {call.voiceName && (
                                                                <View style={styles.callDetailRow}>
                                                                    <Text style={styles.callDetailLabel}>Voice:</Text>
                                                                    <Text style={styles.callDetailValue}>{call.voiceName}</Text>
                                                                </View>
                                                            )}
                                                            {call.referenceDate && (
                                                                <View style={styles.callDetailRow}>
                                                                    <Text style={styles.callDetailLabel}>Reference Date:</Text>
                                                                    <Text style={styles.callDetailValue}>
                                                                        {new Date(call.referenceDate).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            year: 'numeric'
                                                                        })}
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        {call.notes && (
                                                            <Text style={styles.callItemNotes} numberOfLines={2}>
                                                                {call.notes}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Active Automations Section */}
                                {activeAutomations.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <Zap size={18} color={HEYWAY_COLORS.status.pending} />
                                            <Text style={styles.sectionTitle}>Automated Scheduled Calls</Text>
                                            <View style={[styles.sectionBadge, styles.automationBadge]}>
                                                <Text style={styles.sectionBadgeText}>
                                                    {activeAutomations.reduce((sum, auto) => sum + (auto.pendingCount || 0), 0)}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.itemsContainer}>
                                            {activeAutomations.map((automation, index) => (
                                                <View key={automation._id || index} style={styles.automationItem}>
                                                    <View style={styles.automationItemIcon}>
                                                        <Zap size={16} color={HEYWAY_COLORS.status.pending} />
                                                    </View>
                                                    <View style={styles.automationItemContent}>
                                                        <View style={styles.automationItemHeader}>
                                                            <Text style={styles.automationItemTitle}>
                                                                {automation.name}
                                                            </Text>
                                                            <View style={styles.activeBadge}>
                                                                <View style={styles.activeDot} />
                                                                <Text style={styles.activeText}>Active</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.automationStats}>
                                                            <View style={styles.statItem}>
                                                                <Text style={styles.statNumber}>{automation.pendingCount}</Text>
                                                                <Text style={styles.statLabel}>scheduled</Text>
                                                            </View>
                                                            <View style={styles.statDivider} />
                                                            <View style={styles.statItem}>
                                                                <Text style={styles.statNumber}>{automation.contactsCount}</Text>
                                                                <Text style={styles.statLabel}>total contacts</Text>
                                                            </View>
                                                        </View>
                                                        {automation.description && (
                                                            <Text style={styles.automationItemDescription} numberOfLines={2}>
                                                                {automation.description}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Empty State */}
                                {scheduledCalls.length === 0 && activeAutomations.length === 0 && (
                                    <View style={styles.emptyState}>
                                        <View style={styles.emptyIconContainer}>
                                            <Clock size={48} color={HEYWAY_COLORS.text.tertiary} />
                                        </View>
                                        <Text style={styles.emptyTitle}>No Scheduled Calls</Text>
                                        <Text style={styles.emptyText}>
                                            Manual scheduled calls and automated calls will appear here when scheduled
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#D9FDD3',
        borderRadius: 8,
        marginHorizontal: 12,
        marginBottom: 8,
        overflow: 'hidden',
    },
    contentWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 10,
    },
    iconContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        gap: 2,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        letterSpacing: -0.1,
    },
    countBadge: {
        backgroundColor: '#555555',
        borderRadius: HEYWAY_RADIUS.component.button.pill,
        paddingHorizontal: HEYWAY_SPACING.xs,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
        height: 18,
    },
    countBadgeText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.small,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold as any,
        color: HEYWAY_COLORS.text.inverse,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#000000',
        lineHeight: 14,
        letterSpacing: -0.1,
        opacity: 0.7,
    },
    viewButton: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: 'transparent',
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: HEYWAY_COLORS.background.primary,
    },
    modalSafeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        paddingTop: Platform.OS === 'ios' ? 56 : 36,
        backgroundColor: HEYWAY_COLORS.background.primary,
        borderBottomWidth: 0.5,
        borderBottomColor: HEYWAY_COLORS.border.secondary,
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: HEYWAY_SPACING.sm,
    },
    modalHeaderCenter: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: HEYWAY_SPACING.xs,
    },
    modalHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: 44,
    },
    modalHeaderButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalHeaderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: HEYWAY_COLORS.text.primary,
        textAlign: 'center',
        letterSpacing: -0.2,
    },
    modalScrollView: {
        flex: 1,
    },
    modalScrollContent: {
        paddingBottom: 120,
    },
    modalContentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    // Section Styles
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: HEYWAY_COLORS.border.divider,
    },
    sectionTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: HEYWAY_COLORS.text.primary,
        letterSpacing: -0.1,
    },
    sectionBadge: {
        backgroundColor: HEYWAY_COLORS.interactive.primary,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 20,
        alignItems: 'center',
    },
    automationBadge: {
        backgroundColor: HEYWAY_COLORS.status.pending,
    },
    sectionBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: HEYWAY_COLORS.text.inverse,
    },
    itemsContainer: {
        gap: 8,
    },

    // Call Item Styles
    callItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: HEYWAY_COLORS.background.primary,
        borderRadius: 12,
        padding: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: HEYWAY_COLORS.border.primary,
    },
    callItemIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: `${HEYWAY_COLORS.interactive.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: `${HEYWAY_COLORS.interactive.primary}30`,
    },
    callItemContent: {
        flex: 1,
        gap: 6,
    },
    callItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    callItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    callItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: HEYWAY_COLORS.text.primary,
        letterSpacing: -0.1,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: HEYWAY_SPACING.xs,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: HEYWAY_COLORS.status.pending,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '500',
        color: HEYWAY_COLORS.status.pending,
        letterSpacing: 0.5,
    },
    deleteButton: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: 'transparent',
    },
    callItemTime: {
        fontSize: 13,
        fontWeight: '500',
        color: HEYWAY_COLORS.interactive.primary,
        letterSpacing: -0.1,
    },
    callItemNotes: {
        fontSize: 13,
        fontWeight: '400',
        color: HEYWAY_COLORS.text.secondary,
        lineHeight: 18,
        letterSpacing: -0.1,
    },
    callItemDetails: {
        gap: 4,
        marginTop: 6,
    },
    callDetailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: HEYWAY_SPACING.sm,
    },
    callDetailLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: HEYWAY_COLORS.text.tertiary,
        letterSpacing: -0.1,
        minWidth: 70,
    },
    callDetailValue: {
        flex: 1,
        fontSize: 12,
        fontWeight: '400',
        color: HEYWAY_COLORS.text.secondary,
        letterSpacing: -0.1,
        lineHeight: 16,
    },

    // Automation Item Styles
    automationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: HEYWAY_COLORS.background.primary,
        borderRadius: 12,
        padding: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: HEYWAY_COLORS.border.primary,
    },
    automationItemIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: `${HEYWAY_COLORS.status.pending}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: `${HEYWAY_COLORS.status.pending}30`,
    },
    automationItemContent: {
        flex: 1,
        gap: 6,
    },
    automationItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    automationItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: HEYWAY_COLORS.text.primary,
        letterSpacing: -0.1,
        flex: 1,
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: HEYWAY_SPACING.xs,
        backgroundColor: `${HEYWAY_COLORS.status.online}15`,
        paddingHorizontal: HEYWAY_SPACING.sm,
        paddingVertical: HEYWAY_SPACING.xs,
        borderRadius: HEYWAY_RADIUS.component.button.pill,
        borderWidth: 1,
        borderColor: `${HEYWAY_COLORS.status.online}30`,
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: HEYWAY_COLORS.status.online,
    },
    activeText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.small,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium as any,
        color: HEYWAY_COLORS.status.online,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
    },
    automationStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: HEYWAY_SPACING.md,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.small,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold as any,
        color: HEYWAY_COLORS.status.pending,
    },
    statLabel: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.small,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular as any,
        color: HEYWAY_COLORS.text.tertiary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    statDivider: {
        width: 1,
        height: 20,
        backgroundColor: HEYWAY_COLORS.border.primary,
    },
    automationItemDescription: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular as any,
        color: HEYWAY_COLORS.text.secondary,
        lineHeight: 20,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: HEYWAY_SPACING.giant,
        paddingHorizontal: HEYWAY_SPACING.xxxxl,
        gap: HEYWAY_SPACING.lg,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: HEYWAY_RADIUS.full,
        backgroundColor: HEYWAY_COLORS.background.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.border.subtle,
    },
    emptyTitle: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold as any,
        color: HEYWAY_COLORS.text.primary,
        textAlign: 'center',
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    },
    emptyText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular as any,
        color: HEYWAY_COLORS.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
        maxWidth: 280,
    },
});