import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, Plus, Check, Clock, X, Trash2, PhoneCall, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react-native';
import { apiService } from '@/services/apiService';
import CallerIdAdd from './CallerIdAdd';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';

interface CallerIdManagementProps {
    visible: boolean;
    onClose: () => void;
    onCallerIdChange?: (callerId: string) => void;
    initialShowAddModal?: boolean;
}

interface CallerIdStatus {
    phoneNumber: string;
    friendlyName: string;
    verified: boolean;
    dateCreated: Date;
}

export default function CallerIdManagement({
    visible,
    onClose,
    onCallerIdChange,
    initialShowAddModal = false,
}: CallerIdManagementProps) {
    const [callerIds, setCallerIds] = useState<CallerIdStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCallerId, setSelectedCallerId] = useState<string>('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        if (visible) {
            loadCallerIds();
            loadCallerIdPreference();
            if (initialShowAddModal) {
                setShowAddModal(true);
            }
        }
    }, [visible, initialShowAddModal]);

    const loadCallerIds = async () => {
        try {
            setLoading(true);

            // Check if token exists
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                console.error('No auth token found when loading caller IDs');
                setCallerIds([]);
                setLoading(false);
                return;
            }

            const ids = await apiService.getCallerIds();
            setCallerIds(ids);
        } catch (error) {
            console.error('Failed to load caller IDs:', error);
            Alert.alert('Error', `Failed to load caller IDs: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const loadCallerIdPreference = async () => {
        try {
            // Check if token exists
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                console.error('No auth token found when loading caller ID preference');
                setSelectedCallerId('');
                return;
            }

            const preference = await apiService.getCallerIdPreference();
            // Only set caller ID if it's not empty - don't allow empty system default
            if (preference.callerId && preference.callerId.trim() !== '') {
                setSelectedCallerId(preference.callerId);
            } else {
                setSelectedCallerId('');
            }
        } catch (error) {
            console.error('Failed to load caller ID preference:', error);
        }
    };

    const handleSelectCallerId = async (callerId: string) => {
        try {
            if (!callerId || callerId.trim() === '') {
                Alert.alert('Error', 'Invalid caller ID');
                return;
            }

            await apiService.saveCallerIdPreference(callerId);
            setSelectedCallerId(callerId);
            
            if (onCallerIdChange) {
                onCallerIdChange(callerId);
            }

            Alert.alert('Success', 'Caller ID preference updated');
        } catch (error) {
            console.error('Failed to set caller ID preference:', error);
            Alert.alert('Error', `Failed to update caller ID preference: ${error}`);
        }
    };

    const handleRemoveCallerId = async (callerId: string) => {
        Alert.alert(
            'Remove Caller ID',
            `Are you sure you want to remove ${callerId}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiService.delete(`/twilio/caller-ids/${encodeURIComponent(callerId)}`);
                            setCallerIds(prev => prev.filter(id => id.phoneNumber !== callerId));

                            if (selectedCallerId === callerId) {
                                setSelectedCallerId('');
                                if (onCallerIdChange) onCallerIdChange('');
                            }

                            Alert.alert('Success', 'Caller ID removed');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove caller ID');
                        }
                    }
                }
            ]
        );
    };

    const syncCallerIds = async () => {
        try {
            setSyncing(true);
            const result = await apiService.syncCallerIds();
            
            if (result.success) {
                Alert.alert('Success', result.message || 'Caller IDs synced successfully');
                // Reload caller IDs to show updated status
                await loadCallerIds();
            } else {
                Alert.alert('Error', result.error || 'Failed to sync caller IDs');
            }
        } catch (error) {
            console.error('Failed to sync caller IDs:', error);
            Alert.alert('Error', 'Failed to sync caller IDs. Please try again.');
        } finally {
            setSyncing(false);
        }
    };

    const formatPhoneNumber = (number: string) => {
        const cleaned = number.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
        return match ? `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}` : number;
    };

    const getStatusIcon = (verified: boolean) => {
        return verified ? (
            <CheckCircle size={20} color="#34C759" />
        ) : (
            <Clock size={20} color="#FF9500" />
        );
    };

    const getStatusText = (verified: boolean) => {
        return verified ? 'Verified' : 'Pending Verification';
    };

    const getStatusColor = (verified: boolean) => {
        return verified ? '#34C759' : '#FF9500';
    };

    const renderCallerIdItem = ({ item }: { item: CallerIdStatus }) => (
        <TouchableOpacity
            style={styles.callerIdItem}
            onPress={() => handleSelectCallerId(item.phoneNumber)}
        >
            <View style={styles.callerIdInfo}>
                <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
                <View style={styles.statusContainer}>
                    {getStatusIcon(item.verified)}
                    <Text style={[styles.statusText, { color: getStatusColor(item.verified) }]}>
                        {getStatusText(item.verified)}
                    </Text>
                </View>
            </View>

            <View style={styles.selectionContainer}>
                <View style={[
                    styles.radioButton,
                    selectedCallerId === item.phoneNumber && styles.radioButtonSelected
                ]}>
                    {selectedCallerId === item.phoneNumber && (
                        <View style={styles.radioButtonInner} />
                    )}
                </View>
            </View>

            {selectedCallerId !== item.phoneNumber && (
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveCallerId(item.phoneNumber)}
                >
                    <Trash2 size={20} color="#FF3B30" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Caller ID Setup</Text>
                    <TouchableOpacity onPress={onClose}>
                        <X size={24} color="#8E8E93" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <Text style={styles.description}>
                        Add and verify phone numbers that will appear as your caller ID when making calls.
                        Verification is required to prevent spam.
                    </Text>


                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.addButton, { flex: 1, marginRight: 8 }]}
                            onPress={() => setShowAddModal(true)}
                            disabled={loading}
                        >
                            <Plus size={20} color="#007AFF" />
                            <Text style={styles.addButtonText}>Add Phone Number</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={loadCallerIds}
                            disabled={loading}
                        >
                            <Text style={styles.refreshButtonText}>Refresh</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.refreshButton, { marginLeft: 8 }]}
                            onPress={syncCallerIds}
                            disabled={syncing}
                        >
                            {syncing ? (
                                <ActivityIndicator size="small" color="#007AFF" />
                            ) : (
                                <Text style={styles.refreshButtonText}>Sync</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Loading caller IDs...</Text>
                        </View>
                    ) : callerIds.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Phone size={48} color="#8E8E93" />
                            <Text style={styles.emptyTitle}>No Caller IDs</Text>
                            <Text style={styles.emptyText}>
                                Add a phone number to get started with AI calling
                            </Text>
                        </View>
                    ) : (
                        callerIds.map((item, index) => (
                            <View key={index} style={styles.callerIdItem}>
                                <TouchableOpacity
                                    style={styles.callerIdSelector}
                                    onPress={() => handleSelectCallerId(item.phoneNumber)}
                                >
                                    <View style={styles.radioButton}>
                                        {selectedCallerId === item.phoneNumber && (
                                            <View style={styles.radioButtonSelected} />
                                        )}
                                    </View>

                                    <View style={styles.callerIdInfo}>
                                        <Text style={styles.phoneNumber}>{formatPhoneNumber(item.phoneNumber)}</Text>
                                        <View style={styles.statusContainer}>
                                            {getStatusIcon(item.verified)}
                                            <Text style={[
                                                styles.statusText,
                                                { color: item.verified ? '#34C759' : '#FF9500' }
                                            ]}>
                                                {item.verified ? 'Confirmed' : 'Pending Verification'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {selectedCallerId !== item.phoneNumber && (
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => handleRemoveCallerId(item.phoneNumber)}
                                    >
                                        <Trash2 size={20} color="#FF3B30" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>

                {/* Add Caller ID Modal */}
                <CallerIdAdd
                    visible={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        loadCallerIds(); // Refresh the list
                        Alert.alert('Success', 'Caller ID verified successfully!');
                    }}
                />
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: HEYWAY_COLORS.background.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: HEYWAY_SPACING.xl,
        paddingVertical: HEYWAY_SPACING.lg,
        backgroundColor: HEYWAY_COLORS.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: HEYWAY_COLORS.border.primary,
    },
    title: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
        color: HEYWAY_COLORS.text.primary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    },
    content: {
        flex: 1,
        paddingHorizontal: HEYWAY_SPACING.xl,
        paddingTop: HEYWAY_SPACING.xl,
    },
    description: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
        color: HEYWAY_COLORS.text.secondary,
        lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        marginBottom: HEYWAY_SPACING.xxl,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    buttonRow: {
        flexDirection: 'row',
        marginBottom: HEYWAY_SPACING.xl,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: HEYWAY_COLORS.background.secondary,
        borderRadius: HEYWAY_RADIUS.component.button.lg,
        paddingVertical: HEYWAY_SPACING.lg,
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.border.primary,
        ...HEYWAY_SHADOWS.light.xs,
    },
    refreshButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: HEYWAY_COLORS.interactive.primary,
        borderRadius: HEYWAY_RADIUS.component.button.lg,
        paddingVertical: HEYWAY_SPACING.lg,
        paddingHorizontal: HEYWAY_SPACING.xl,
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.interactive.primary,
        ...HEYWAY_SHADOWS.light.sm,
    },
    addButtonText: {
        marginLeft: HEYWAY_SPACING.sm,
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
        color: HEYWAY_COLORS.text.primary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    refreshButtonText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
        color: HEYWAY_COLORS.text.inverse,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    callerIdItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: HEYWAY_COLORS.background.secondary,
        borderRadius: HEYWAY_RADIUS.component.card.lg,
        padding: HEYWAY_SPACING.lg,
        marginBottom: HEYWAY_SPACING.md,
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.border.primary,
        ...HEYWAY_SHADOWS.light.xs,
    },
    callerIdSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    callerIdInfo: {
        flex: 1,
    },
    phoneNumber: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
        color: HEYWAY_COLORS.text.primary,
        marginBottom: HEYWAY_SPACING.xs,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        marginLeft: HEYWAY_SPACING.xs,
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
        color: HEYWAY_COLORS.status.success,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    selectionContainer: {
        marginRight: HEYWAY_SPACING.md,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: HEYWAY_RADIUS.component.button.lg,
        borderWidth: 2,
        borderColor: HEYWAY_COLORS.border.primary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: HEYWAY_COLORS.background.primary,
    },
    radioButtonSelected: {
        borderColor: HEYWAY_COLORS.interactive.primary,
        backgroundColor: HEYWAY_COLORS.interactive.primary,
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: HEYWAY_RADIUS.xs,
        backgroundColor: HEYWAY_COLORS.text.inverse,
    },
    removeButton: {
        padding: HEYWAY_SPACING.sm,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: HEYWAY_SPACING.xxxxl,
    },
    loadingText: {
        marginTop: HEYWAY_SPACING.lg,
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
        color: HEYWAY_COLORS.text.primary,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    emptyContainer: {
        backgroundColor: HEYWAY_COLORS.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: HEYWAY_SPACING.xxxxl + HEYWAY_SPACING.xl,
    },
    emptyTitle: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
        color: HEYWAY_COLORS.text.primary,
        marginTop: HEYWAY_SPACING.lg,
        marginBottom: HEYWAY_SPACING.sm,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    },
    emptyText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
        color: HEYWAY_COLORS.text.secondary,
        textAlign: 'center',
        lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
});