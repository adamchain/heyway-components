import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send, MessageSquare, Bug, Lightbulb, Star } from 'lucide-react-native';
import { apiService } from '@/services/apiService';

interface FeedbackModalProps {
    visible: boolean;
    onClose: () => void;
}

const FEEDBACK_TYPES = [
    { id: 'general', label: 'General Feedback', icon: MessageSquare, color: '#007AFF' },
    { id: 'bug', label: 'Bug Report', icon: Bug, color: '#FF3B30' },
    { id: 'feature_request', label: 'Feature Request', icon: Lightbulb, color: '#FF9500' },
    { id: 'compliment', label: 'Compliment', icon: Star, color: '#34C759' },
];

export default function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
    const [selectedType, setSelectedType] = useState<string>('general');
    const [subject, setSubject] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const resetForm = () => {
        setSelectedType('general');
        setSubject('');
        setMessage('');
        setEmail('');
        setIsSubmitting(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert('Error', 'Please enter your feedback message.');
            return;
        }

        setIsSubmitting(true);

        try {
            const feedbackData = {
                type: selectedType,
                subject: subject.trim() || undefined,
                message: message.trim(),
                email: email.trim() || undefined,
                priority: 'medium',
                metadata: {
                    platform: Platform.OS,
                    version: '1.0.0', // You can get this from app config
                    timestamp: new Date().toISOString(),
                }
            };

            await apiService.post('/feedback', feedbackData);

            Alert.alert(
                'Thank You!',
                'Your feedback has been submitted successfully. We appreciate your input!',
                [
                    {
                        text: 'OK',
                        onPress: handleClose,
                    },
                ]
            );
        } catch (error) {
            console.error('Error submitting feedback:', error);
            Alert.alert(
                'Error',
                'Failed to submit feedback. Please try again later.',
                [
                    {
                        text: 'OK',
                        style: 'default',
                    },
                ]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTypeSelector = () => (
        <View style={styles.typeContainer}>
            <Text style={styles.sectionTitle}>Feedback Type</Text>
            <View style={styles.typeGrid}>
                {FEEDBACK_TYPES.map((type) => {
                    const IconComponent = type.icon;
                    const isSelected = selectedType === type.id;

                    return (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.typeCard,
                                isSelected && { ...styles.typeCardSelected, borderColor: type.color }
                            ]}
                            onPress={() => setSelectedType(type.id)}
                        >
                            <IconComponent
                                size={24}
                                color={isSelected ? type.color : '#8E8E93'}
                            />
                            <Text style={[
                                styles.typeLabel,
                                isSelected && { color: type.color }
                            ]}>
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Send Feedback</Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={styles.closeButton}
                            disabled={isSubmitting}
                        >
                            <X size={24} color="#8E8E93" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Type Selector */}
                        {renderTypeSelector()}

                        {/* Subject */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Subject (Optional)</Text>
                            <TextInput
                                style={styles.textInput}
                                value={subject}
                                onChangeText={setSubject}
                                placeholder="Brief summary of your feedback"
                                placeholderTextColor="#8E8E93"
                                editable={!isSubmitting}
                                maxLength={100}
                            />
                        </View>

                        {/* Message */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Message *</Text>
                            <TextInput
                                style={[styles.textInput, styles.messageInput]}
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Tell us what's on your mind..."
                                placeholderTextColor="#8E8E93"
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                editable={!isSubmitting}
                                maxLength={1000}
                            />
                            <Text style={styles.characterCount}>
                                {message.length}/1000
                            </Text>
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email (Optional)</Text>
                            <TextInput
                                style={styles.textInput}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="your@email.com"
                                placeholderTextColor="#8E8E93"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isSubmitting}
                            />
                            <Text style={styles.helpText}>
                                We'll only use this to follow up on your feedback if needed.
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!message.trim() || isSubmitting) && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={!message.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Send size={18} color="#FFFFFF" />
                                    <Text style={styles.submitButtonText}>Send Feedback</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: 20,
        fontFamily: 'System',
        fontWeight: '700',
        color: '#000000',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'System',
        fontWeight: '600',
        color: '#000000',
        marginBottom: 12,
    },
    typeContainer: {
        marginBottom: 24,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    typeCard: {
        flex: 0,
        minWidth: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E5EA',
    },
    typeCardSelected: {
        backgroundColor: '#F8F9FA',
        borderWidth: 2,
    },
    typeLabel: {
        fontSize: 14,
        fontFamily: 'System',
        fontWeight: '500',
        color: '#8E8E93',
        marginTop: 8,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontFamily: 'System',
        fontWeight: '600',
        color: '#000000',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'System',
        color: '#000000',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    messageInput: {
        minHeight: 120,
        paddingTop: 12,
    },
    characterCount: {
        fontSize: 12,
        fontFamily: 'System',
        color: '#8E8E93',
        textAlign: 'right',
        marginTop: 4,
    },
    helpText: {
        fontSize: 12,
        fontFamily: 'System',
        color: '#8E8E93',
        marginTop: 4,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#34C759',
        borderRadius: 12,
        paddingVertical: 16,
        gap: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#C7C7CC',
    },
    submitButtonText: {
        fontSize: 16,
        fontFamily: 'System',
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
