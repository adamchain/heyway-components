import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Alert,
} from 'react-native';
import { Phone, X, AlertTriangle } from 'lucide-react-native';
import { apiService } from '@/services/apiService';
import CallerIdAdd from './CallerIdAdd';

interface CallerIdPromptBannerProps {
    visible: boolean;
    onDismiss: () => void;
}

export default function CallerIdPromptBanner({ visible, onDismiss }: CallerIdPromptBannerProps) {
    const [showCallerIdAdd, setShowCallerIdAdd] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(-80));

    useEffect(() => {
        if (visible) {
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

    const handleSetupCallerID = () => {
        setShowCallerIdAdd(true);
    };

    const handleCallerIdSuccess = () => {
        setShowCallerIdAdd(false);
        onDismiss();
        Alert.alert('Success', 'Caller ID verified successfully! You can now make calls.');
    };

    if (!visible) return null;

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
                <View style={styles.iconContainer}>
                    <AlertTriangle size={20} color="#FF9500" />
                </View>
                
                <View style={styles.content}>
                    <Text style={styles.title}>Caller ID Required</Text>
                    <Text style={styles.subtitle}>
                        Set up a verified caller ID to start making calls
                    </Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.setupButton}
                        onPress={handleSetupCallerID}
                        activeOpacity={0.8}
                    >
                        <Phone size={16} color="#007AFF" />
                        <Text style={styles.setupButtonText}>Setup</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.dismissButton}
                        onPress={onDismiss}
                        activeOpacity={0.8}
                    >
                        <X size={16} color="#8E8E93" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <CallerIdAdd
                visible={showCallerIdAdd}
                onClose={() => setShowCallerIdAdd(false)}
                onSuccess={handleCallerIdSuccess}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,149,0,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,149,0,0.3)',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#FF9500',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,149,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        color: '#AEAEB2',
        lineHeight: 18,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    setupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,122,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(0,122,255,0.3)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 6,
    },
    setupButtonText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    dismissButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(142,142,147,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});