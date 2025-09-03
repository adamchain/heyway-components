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
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY } from '@styles/HEYWAY_STYLE_GUIDE';

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
        backgroundColor: HEYWAY_COLORS.interactive.selected,
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.accent.warning,
        borderRadius: HEYWAY_RADIUS.component.card.lg,
        padding: HEYWAY_SPACING.lg,
        marginHorizontal: HEYWAY_SPACING.lg,
        marginBottom: HEYWAY_SPACING.lg,
        ...HEYWAY_SHADOWS.light.sm,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: HEYWAY_RADIUS.component.avatar.md,
        backgroundColor: HEYWAY_COLORS.accent.warning + '30',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: HEYWAY_SPACING.md,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.large,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
        color: HEYWAY_COLORS.text.primary,
        marginBottom: HEYWAY_SPACING.xs,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    subtitle: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
        color: HEYWAY_COLORS.text.secondary,
        lineHeight: 18,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: HEYWAY_SPACING.sm,
    },
    setupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: HEYWAY_COLORS.interactive.primary + '30',
        borderWidth: 1,
        borderColor: HEYWAY_COLORS.interactive.primary + '50',
        borderRadius: HEYWAY_RADIUS.component.button.md,
        paddingHorizontal: HEYWAY_SPACING.md,
        paddingVertical: HEYWAY_SPACING.sm,
        gap: HEYWAY_SPACING.xs,
        ...HEYWAY_SHADOWS.light.xs,
    },
    setupButtonText: {
        color: HEYWAY_COLORS.interactive.primary,
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
        letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },
    dismissButton: {
        width: 32,
        height: 32,
        borderRadius: HEYWAY_RADIUS.component.button.lg,
        backgroundColor: HEYWAY_COLORS.background.tertiary,
        alignItems: 'center',
        justifyContent: 'center',
        ...HEYWAY_SHADOWS.light.xs,
    },
});