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
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        color: '#000000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#8E8E93',
        marginBottom: 20,
    },
    keySection: {
        marginBottom: 16,
    },
    keyLabel: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: '#000000',
        marginBottom: 8,
    },
    keyInput: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        backgroundColor: '#F8F9FA',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: '#FFFFFF',
    },
    helpText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: 12,
    },
});