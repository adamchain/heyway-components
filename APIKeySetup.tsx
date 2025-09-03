import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { apiService } from '@/services/apiService';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';

interface APIKeySetupProps {
    onKeysUpdated?: () => void;
}

export default function APIKeySetup({ onKeysUpdated }: APIKeySetupProps) {
    const [openaiKey, setOpenaiKey] = useState('');
    const [elevenlabsKey, setElevenlabsKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [keyStatus, setKeyStatus] = useState({
        hasOpenAI: false,
        hasElevenLabs: false
    });

    useEffect(() => {
        loadKeyStatus();
    }, []);

    const loadKeyStatus = async () => {
        try {
            const status = await apiService.get<{
                hasOpenAI: boolean;
                hasElevenLabs: boolean;
            }>('/ai/api-keys/status');
            setKeyStatus(status);
        } catch (error) {
            console.error('Failed to load API key status:', error);
            // Set default values on error
            setKeyStatus({
                hasOpenAI: false,
                hasElevenLabs: false
            });
        }
    };

    const saveKeys = async () => {
        if (!openaiKey && !elevenlabsKey) {
            Alert.alert('Error', 'Please enter at least one API key');
            return;
        }

        try {
            setLoading(true);

            await apiService.post('/ai/api-keys', {
                openaiApiKey: openaiKey || undefined,
                elevenlabsApiKey: elevenlabsKey || undefined
            });

            Alert.alert('Success', 'API keys saved successfully!');
            await loadKeyStatus();
            onKeysUpdated?.();

            // Clear the input fields
            setOpenaiKey('');
            setElevenlabsKey('');
        } catch (error) {
            console.error('Failed to save API keys:', error);
            Alert.alert('Error', 'Failed to save API keys');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>API Configuration</Text>
            <Text style={styles.subtitle}>
                Configure your API keys for AI services
            </Text>

            <View style={styles.keySection}>
                <Text style={styles.keyLabel}>
                    OpenAI API Key {keyStatus.hasOpenAI && '✅'}
                </Text>
                <TextInput
                    style={styles.keyInput}
                    value={openaiKey}
                    onChangeText={setOpenaiKey}
                    placeholder="sk-..."
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            <View style={styles.keySection}>
                <Text style={styles.keyLabel}>
                    ElevenLabs API Key {keyStatus.hasElevenLabs && '✅'}
                </Text>
                <TextInput
                    style={styles.keyInput}
                    value={elevenlabsKey}
                    onChangeText={setElevenlabsKey}
                    placeholder="your-elevenlabs-key"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={saveKeys}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.saveButtonText}>Save API Keys</Text>
                )}
            </TouchableOpacity>

            <Text style={styles.helpText}>
                🔐 Your API keys are stored securely and encrypted
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: HEYWAY_COLORS.background.primary,
        borderRadius: HEYWAY_RADIUS.component.card.lg,
        padding: HEYWAY_SPACING.xl,
        marginVertical: HEYWAY_SPACING.lg,
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.border.primary,
        ...HEYWAY_SHADOWS.light.md,
    },
    title: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
        color: HEYWAY_COLORS.text.primary,
        marginBottom: HEYWAY_SPACING.sm,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    },
    subtitle: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
        color: HEYWAY_COLORS.text.secondary,
        marginBottom: HEYWAY_SPACING.xl,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    keySection: {
        marginBottom: HEYWAY_SPACING.lg,
    },
    keyLabel: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
        color: HEYWAY_COLORS.text.primary,
        marginBottom: HEYWAY_SPACING.sm,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    keyInput: {
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.border.primary,
        borderRadius: HEYWAY_RADIUS.component.input.md,
        padding: HEYWAY_SPACING.md,
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
        color: HEYWAY_COLORS.text.primary,
        backgroundColor: HEYWAY_COLORS.background.secondary,
        ...HEYWAY_SHADOWS.light.xs,
    },
    saveButton: {
        backgroundColor: HEYWAY_COLORS.interactive.primary,
        borderRadius: HEYWAY_RADIUS.component.button.md,
        paddingVertical: HEYWAY_SPACING.md,
        alignItems: 'center',
        marginTop: HEYWAY_SPACING.sm,
        minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
        ...HEYWAY_SHADOWS.light.sm,
    },
    saveButtonText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
        color: HEYWAY_COLORS.text.inverse,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    helpText: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
        color: HEYWAY_COLORS.text.tertiary,
        textAlign: 'center',
        marginTop: HEYWAY_SPACING.md,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
});