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
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
        color: '#000000',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E5E5EA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: '#8E8E93',
        fontFamily: 'Inter-Medium',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: '#8E8E93',
    },
    activeTabText: {
        color: '#007AFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        color: '#000000',
        marginBottom: 12,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    statusText: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: '#000000',
    },
    callDetails: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    callDetailText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#8E8E93',
        marginBottom: 2,
    },
    mockText: {
        color: '#FF9500',
        fontFamily: 'Inter-Medium',
    },
    recipientsList: {
        gap: 8,
    },
    recipientItem: {
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        padding: 12,
    },
    recipientText: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#000000',
    },
    configItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    configLabel: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: '#8E8E93',
    },
    configValue: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#000000',
        flex: 1,
        textAlign: 'right',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: '#8E8E93',
        marginTop: 8,
    },
    errorContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    retryButtonText: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: '#FFFFFF',
    },
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    emptyStateText: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: '#8E8E93',
    },
    callHistoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    callHistoryTime: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#8E8E93',
    },
    transcriptEntry: {
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    transcriptHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    transcriptSpeaker: {
        fontSize: 12,
        fontFamily: 'Inter-Bold',
        color: '#007AFF',
    },
    transcriptTime: {
        fontSize: 10,
        fontFamily: 'Inter-Regular',
        color: '#8E8E93',
    },
    transcriptContent: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#000000',
        lineHeight: 20,
    },
    moreEntriesText: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: '#007AFF',
        textAlign: 'center',
        marginTop: 8,
    },
    actionButtons: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 12,
    },
    startButton: {
        backgroundColor: '#34C759',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    startButtonText: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: '#FFFFFF',
    },
    endButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    endButtonText: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: '#FFFFFF',
    },
    closeActionButton: {
        backgroundColor: '#8E8E93',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    closeActionButtonText: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: '#FFFFFF',
    },
});

export default TwilioCallManager;