// @/components/TwilioCallManager.tsx - React Native Component that uses the hook

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useTwilioCallManager } from './useTwilioCallManager'; // Adjust path as needed
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';

interface TwilioCallManagerProps {
    visible: boolean;
    onClose: () => void;
    recipients: string[];
    callMode?: 'intro+ai' | 'ai-only';
    introRecordingUrl?: string;
    notes?: string;
}

interface TranscriptEntry {
    id: string;
    timestamp: string;
    speaker: 'user' | 'ai' | 'system';
    content: string;
    callId?: string;
    sessionId?: string;
}

interface CallHistoryEntry {
    callId: string;
    sessionId: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    status: string;
    recipients: string[];
    transcriptCount: number;
}

const TwilioCallManager: React.FC<TwilioCallManagerProps> = ({
    visible,
    onClose,
    recipients,
    callMode = 'ai-only',
    introRecordingUrl,
    notes
}) => {
    const [transcriptHistory, setTranscriptHistory] = useState<TranscriptEntry[]>([]);
    const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<'current' | 'history'>('current');
    const [refreshing, setRefreshing] = useState(false);

    const {
        isInitiating,
        activeCall,
        callStatus,
        initiateCall,
        endCall,
    } = useTwilioCallManager({
        onCallStatusChange: (status, callData) => {
            console.log('📱 Call status changed:', status, callData);

            // Auto-close modal when call ends
            if (status === 'ended' || status === 'error') {
                setTimeout(() => {
                    onClose();
                }, 2000);
            }

            // Refresh history when call ends to include the latest call
            if (status === 'ended') {
                fetchTranscriptHistory();
            }
        },
        onError: (error) => {
            console.error('📱 Call error:', error);
            Alert.alert('Call Error', error);
        }
    });

    // Fetch transcript history from your API
    const fetchTranscriptHistory = async () => {
        try {
            setIsLoadingHistory(true);
            setHistoryError(null);

            // Replace with your actual API endpoint
            const response = await fetch('/api/call-transcripts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authentication headers as needed
                    // 'Authorization': `Bearer ${yourAuthToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch transcript history: ${response.status}`);
            }

            const data = await response.json();

            // Assuming your API returns { transcripts: TranscriptEntry[], calls: CallHistoryEntry[] }
            setTranscriptHistory(data.transcripts || []);
            setCallHistory(data.calls || []);

        } catch (error) {
            console.error('Failed to fetch transcript history:', error);
            setHistoryError(error instanceof Error ? error.message : 'Failed to load history');
        } finally {
            setIsLoadingHistory(false);
            setRefreshing(false);
        }
    };

    // Handle initiating call when component becomes visible
    useEffect(() => {
        if (visible && recipients.length > 0 && !activeCall && !isInitiating) {
            handleInitiateCall();
        }
    }, [visible, recipients]);

    // Fetch transcript history when modal becomes visible
    useEffect(() => {
        if (visible) {
            fetchTranscriptHistory();
        }
    }, [visible]);

    const handleInitiateCall = async () => {
        try {
            await initiateCall({
                recipients,
                callMode,
                introRecordingUrl,
                notes
            });
        } catch (error) {
            console.error('Failed to initiate call:', error);
            Alert.alert('Call Failed', 'Failed to initiate call. Please try again.');
        }
    };

    const handleEndCall = async () => {
        try {
            await endCall();
        } catch (error) {
            console.error('Failed to end call:', error);
            Alert.alert('End Call Failed', 'Failed to end call. Please try again.');
        }
    };

    const handleClose = () => {
        if (activeCall) {
            handleEndCall();
        }
        onClose();
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchTranscriptHistory();
    };

    const getStatusColor = () => {
        switch (callStatus) {
            case 'connected': return '#34C759';
            case 'error': return '#FF3B30';
            case 'initiating': return '#FF9500';
            default: return '#8E8E93';
        }
    };

    const getStatusText = () => {
        switch (callStatus) {
            case 'initiating': return 'Initiating call...';
            case 'connected': return 'Call in progress';
            case 'ending': return 'Ending call...';
            case 'ended': return 'Call ended';
            case 'error': return 'Call failed';
            default: return 'Ready';
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    const renderCurrentCallContent = () => (
        <>
            {/* Call Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Call Status</Text>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
                    <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>

                {activeCall && (
                    <View style={styles.callDetails}>
                        <Text style={styles.callDetailText}>Call ID: {activeCall.callId}</Text>
                        <Text style={styles.callDetailText}>Session ID: {activeCall.sessionId}</Text>
                        {activeCall.mock && (
                            <Text style={[styles.callDetailText, styles.mockText]}>Mock Mode</Text>
                        )}
                    </View>
                )}
            </View>

            {/* Recipients */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recipients ({recipients.length})</Text>
                <View style={styles.recipientsList}>
                    {recipients.map((recipient, index) => (
                        <View key={index} style={styles.recipientItem}>
                            <Text style={styles.recipientText}>{recipient}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Call Configuration */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Configuration</Text>
                <View style={styles.configItem}>
                    <Text style={styles.configLabel}>Mode:</Text>
                    <Text style={styles.configValue}>{callMode}</Text>
                </View>
                {introRecordingUrl && (
                    <View style={styles.configItem}>
                        <Text style={styles.configLabel}>Intro Recording:</Text>
                        <Text style={styles.configValue}>✓ Provided</Text>
                    </View>
                )}
                {notes && (
                    <View style={styles.configItem}>
                        <Text style={styles.configLabel}>Notes:</Text>
                        <Text style={styles.configValue}>{notes}</Text>
                    </View>
                )}
            </View>

            {/* Loading Indicator */}
            {isInitiating && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Setting up your call...</Text>
                </View>
            )}
        </>
    );

    const renderHistoryContent = () => (
        <>
            {isLoadingHistory && !refreshing && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading transcript history...</Text>
                </View>
            )}

            {historyError && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{historyError}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchTranscriptHistory}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!isLoadingHistory && !historyError && callHistory.length === 0 && (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>No call history available</Text>
                </View>
            )}

            {/* Call History */}
            {callHistory.map((call) => (
                <View key={call.callId} style={styles.section}>
                    <View style={styles.callHistoryHeader}>
                        <Text style={styles.sectionTitle}>Call {call.callId.substring(0, 8)}...</Text>
                        <Text style={styles.callHistoryTime}>{formatTimestamp(call.startTime)}</Text>
                    </View>

                    <View style={styles.configItem}>
                        <Text style={styles.configLabel}>Status:</Text>
                        <Text style={[styles.configValue, { color: call.status === 'completed' ? '#34C759' : '#FF3B30' }]}>
                            {call.status}
                        </Text>
                    </View>

                    {call.duration && (
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Duration:</Text>
                            <Text style={styles.configValue}>{formatDuration(call.duration)}</Text>
                        </View>
                    )}

                    <View style={styles.configItem}>
                        <Text style={styles.configLabel}>Recipients:</Text>
                        <Text style={styles.configValue}>{call.recipients.join(', ')}</Text>
                    </View>

                    <View style={styles.configItem}>
                        <Text style={styles.configLabel}>Transcript Entries:</Text>
                        <Text style={styles.configValue}>{call.transcriptCount}</Text>
                    </View>

                    {/* Show transcript entries for this call */}
                    {transcriptHistory
                        .filter(entry => entry.callId === call.callId)
                        .slice(0, 3) // Show only first 3 entries as preview
                        .map((entry, index) => (
                            <View key={entry.id} style={styles.transcriptEntry}>
                                <View style={styles.transcriptHeader}>
                                    <Text style={styles.transcriptSpeaker}>{entry.speaker.toUpperCase()}</Text>
                                    <Text style={styles.transcriptTime}>{formatTimestamp(entry.timestamp)}</Text>
                                </View>
                                <Text style={styles.transcriptContent}>{entry.content}</Text>
                            </View>
                        ))}

                    {transcriptHistory.filter(entry => entry.callId === call.callId).length > 3 && (
                        <Text style={styles.moreEntriesText}>
                            +{transcriptHistory.filter(entry => entry.callId === call.callId).length - 3} more entries
                        </Text>
                    )}
                </View>
            ))}
        </>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Call Manager</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'current' && styles.activeTab]}
                        onPress={() => setSelectedTab('current')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'current' && styles.activeTabText]}>
                            Current Call
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
                        onPress={() => setSelectedTab('history')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'history' && styles.activeTabText]}>
                            History ({callHistory.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#007AFF']}
                            tintColor="#007AFF"
                        />
                    }
                >
                    {selectedTab === 'current' ? renderCurrentCallContent() : renderHistoryContent()}
                </ScrollView>

                {/* Action Buttons - Only show for current call tab */}
                {selectedTab === 'current' && (
                    <View style={styles.actionButtons}>
                        {!activeCall && !isInitiating && (
                            <TouchableOpacity
                                style={styles.startButton}
                                onPress={handleInitiateCall}
                            >
                                <Text style={styles.startButtonText}>Start Call</Text>
                            </TouchableOpacity>
                        )}

                        {activeCall && (
                            <TouchableOpacity
                                style={styles.endButton}
                                onPress={handleEndCall}
                            >
                                <Text style={styles.endButtonText}>End Call</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.closeActionButton}
                            onPress={handleClose}
                        >
                            <Text style={styles.closeActionButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: HEYWAY_COLORS.background.secondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: HEYWAY_SPACING.xl,
        paddingTop: 60,
        paddingBottom: HEYWAY_SPACING.xl,
        backgroundColor: HEYWAY_COLORS.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: HEYWAY_COLORS.border.primary,
    },
    title: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
        color: HEYWAY_COLORS.text.primary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: HEYWAY_RADIUS.component.button.lg,
        backgroundColor: HEYWAY_COLORS.background.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.border.primary,
        ...HEYWAY_SHADOWS.light.xs,
    },
    closeButtonText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
        color: HEYWAY_COLORS.text.secondary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: HEYWAY_COLORS.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: HEYWAY_COLORS.border.primary,
    },
    tab: {
        flex: 1,
        paddingVertical: HEYWAY_SPACING.lg,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: HEYWAY_COLORS.interactive.primary,
    },
    tabText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
        color: HEYWAY_COLORS.text.secondary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    activeTabText: {
        color: HEYWAY_COLORS.interactive.primary,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    },
    content: {
        flex: 1,
        paddingHorizontal: HEYWAY_SPACING.xl,
        paddingTop: HEYWAY_SPACING.xl,
    },
    section: {
        marginBottom: HEYWAY_SPACING.xxl,
        backgroundColor: HEYWAY_COLORS.background.primary,
        borderRadius: HEYWAY_RADIUS.component.card.lg,
        padding: HEYWAY_SPACING.lg,
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.border.primary,
        ...HEYWAY_SHADOWS.light.xs,
    },
    sectionTitle: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
        color: HEYWAY_COLORS.text.primary,
        marginBottom: HEYWAY_SPACING.md,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: HEYWAY_SPACING.sm,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: HEYWAY_RADIUS.xs,
        marginRight: HEYWAY_SPACING.sm,
    },
    statusText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
        color: HEYWAY_COLORS.text.primary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    callDetails: {
        marginTop: HEYWAY_SPACING.sm,
        paddingTop: HEYWAY_SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: HEYWAY_COLORS.border.primary,
    },
    callDetailText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
        color: HEYWAY_COLORS.text.tertiary,
        marginBottom: HEYWAY_SPACING.xs,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    mockText: {
        color: HEYWAY_COLORS.accent.warning,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    },
    recipientsList: {
        gap: HEYWAY_SPACING.sm,
    },
    recipientItem: {
        backgroundColor: HEYWAY_COLORS.background.secondary,
        borderRadius: HEYWAY_RADIUS.component.card.sm,
        padding: HEYWAY_SPACING.md,
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.border.primary,
    },
    recipientText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
        color: HEYWAY_COLORS.text.primary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    configItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: HEYWAY_SPACING.sm,
    },
    configLabel: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
        color: HEYWAY_COLORS.text.secondary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    configValue: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
        color: HEYWAY_COLORS.text.primary,
        flex: 1,
        textAlign: 'right',
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: HEYWAY_SPACING.xl,
    },
    loadingText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
        color: HEYWAY_COLORS.text.secondary,
        marginTop: HEYWAY_SPACING.sm,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    errorContainer: {
        alignItems: 'center',
        paddingVertical: HEYWAY_SPACING.xl,
        backgroundColor: HEYWAY_COLORS.background.primary,
        borderRadius: HEYWAY_RADIUS.component.card.lg,
        marginBottom: HEYWAY_SPACING.lg,
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.status.error,
    },
    errorText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
        color: HEYWAY_COLORS.status.error,
        textAlign: 'center',
        marginBottom: HEYWAY_SPACING.md,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    retryButton: {
        backgroundColor: HEYWAY_COLORS.interactive.primary,
        borderRadius: HEYWAY_RADIUS.component.button.md,
        paddingHorizontal: HEYWAY_SPACING.lg,
        paddingVertical: HEYWAY_SPACING.sm,
        ...HEYWAY_SHADOWS.light.sm,
    },
    retryButtonText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
        color: HEYWAY_COLORS.text.inverse,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: HEYWAY_SPACING.xxxxl,
        backgroundColor: HEYWAY_COLORS.background.primary,
        borderRadius: HEYWAY_RADIUS.component.card.lg,
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.border.primary,
    },
    emptyStateText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
        color: HEYWAY_COLORS.text.secondary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    callHistoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: HEYWAY_SPACING.md,
    },
    callHistoryTime: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
        color: HEYWAY_COLORS.text.tertiary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    transcriptEntry: {
        backgroundColor: HEYWAY_COLORS.background.secondary,
        borderRadius: HEYWAY_RADIUS.component.card.sm,
        padding: HEYWAY_SPACING.md,
        marginTop: HEYWAY_SPACING.sm,
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.border.primary,
    },
    transcriptHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: HEYWAY_SPACING.xs,
    },
    transcriptSpeaker: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
        color: HEYWAY_COLORS.interactive.primary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    transcriptTime: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
        color: HEYWAY_COLORS.text.tertiary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    transcriptContent: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
        color: HEYWAY_COLORS.text.primary,
        lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    moreEntriesText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
        color: HEYWAY_COLORS.interactive.primary,
        textAlign: 'center',
        marginTop: HEYWAY_SPACING.sm,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    actionButtons: {
        paddingHorizontal: HEYWAY_SPACING.xl,
        paddingBottom: HEYWAY_SPACING.xxxxl,
        gap: HEYWAY_SPACING.md,
    },
    startButton: {
        backgroundColor: HEYWAY_COLORS.status.success,
        borderRadius: HEYWAY_RADIUS.component.button.lg,
        paddingVertical: HEYWAY_SPACING.lg,
        alignItems: 'center',
        minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
        ...HEYWAY_SHADOWS.light.sm,
    },
    startButtonText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
        color: HEYWAY_COLORS.text.inverse,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    endButton: {
        backgroundColor: HEYWAY_COLORS.status.error,
        borderRadius: HEYWAY_RADIUS.component.button.lg,
        paddingVertical: HEYWAY_SPACING.lg,
        alignItems: 'center',
        minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
        ...HEYWAY_SHADOWS.light.sm,
    },
    endButtonText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
        color: HEYWAY_COLORS.text.inverse,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    closeActionButton: {
        backgroundColor: HEYWAY_COLORS.text.secondary,
        borderRadius: HEYWAY_RADIUS.component.button.lg,
        paddingVertical: HEYWAY_SPACING.lg,
        alignItems: 'center',
        minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
        ...HEYWAY_SHADOWS.light.sm,
    },
    closeActionButtonText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
        color: HEYWAY_COLORS.text.inverse,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
});

export default TwilioCallManager;