import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, CheckCircle, ArrowRight, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CallerIdAdd from './CallerIdAdd';
import { apiService } from '../services/apiService';

interface NewUserOnboardingProps {
    visible: boolean;
    onComplete: () => void;
    onSkip?: () => void;
}

export default function NewUserOnboarding({ visible, onComplete, onSkip }: NewUserOnboardingProps) {
    const [showCallerIdAdd, setShowCallerIdAdd] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 100,
                    friction: 8,
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
        onComplete();
    };

    const handleSkip = () => {
        if (onSkip) {
            onSkip();
        } else {
            onComplete();
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="none"
            presentationStyle="fullScreen"
            statusBarTranslucent
        >
            <LinearGradient
                colors={['#000000', '#1a1a1a', '#000000']}
                style={styles.container}
            >
                <SafeAreaView style={styles.safeArea}>
                    {/* Skip button */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                            <Text style={styles.skipText}>Skip for now</Text>
                        </TouchableOpacity>
                    </View>

                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* Hero Section */}
                        <View style={styles.heroSection}>
                            <View style={styles.iconContainer}>
                                <LinearGradient
                                    colors={['#007AFF', '#0051D0']}
                                    style={styles.iconGradient}
                                >
                                    <Phone size={48} color="#FFFFFF" />
                                </LinearGradient>
                            </View>

                            <Text style={styles.welcomeTitle}>Welcome to Heyway!</Text>
                            <Text style={styles.welcomeSubtitle}>
                                Let's get you set up with AI-powered calling
                            </Text>
                        </View>

                        {/* Main Content */}
                        <View style={styles.mainContent}>
                            <View style={styles.featureCard}>
                                <View style={styles.featureHeader}>
                                    <View style={styles.featureIcon}>
                                        <Phone size={24} color="#007AFF" />
                                    </View>
                                    <View style={styles.featureTextContainer}>
                                        <Text style={styles.featureTitle}>Set Up Your Caller ID</Text>
                                        <Text style={styles.featureSubtitle}>Required for making calls</Text>
                                    </View>
                                    <View style={styles.requiredBadge}>
                                        <Text style={styles.requiredText}>Required</Text>
                                    </View>
                                </View>

                                <Text style={styles.featureDescription}>
                                    Verify your phone number to use as caller ID. This ensures recipients see your number when you call, building trust and improving answer rates.
                                </Text>

                                <View style={styles.benefitsList}>
                                    <View style={styles.benefitItem}>
                                        <CheckCircle size={16} color="#34C759" />
                                        <Text style={styles.benefitText}>Recipients see your verified number</Text>
                                    </View>
                                    <View style={styles.benefitItem}>
                                        <CheckCircle size={16} color="#34C759" />
                                        <Text style={styles.benefitText}>Prevents calls from being marked as spam</Text>
                                    </View>
                                    <View style={styles.benefitItem}>
                                        <CheckCircle size={16} color="#34C759" />
                                        <Text style={styles.benefitText}>Builds trust with your contacts</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={handleSetupCallerID}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#007AFF', '#0051D0']}
                                        style={styles.buttonGradient}
                                    >
                                        <Text style={styles.primaryButtonText}>Set Up Caller ID</Text>
                                        <ArrowRight size={20} color="#FFFFFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                This process takes 2-3 minutes and involves SMS and phone verification
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Caller ID Add Modal */}
                    <CallerIdAdd
                        visible={showCallerIdAdd}
                        onClose={() => setShowCallerIdAdd(false)}
                        onSuccess={handleCallerIdSuccess}
                    />
                </SafeAreaView>
            </LinearGradient>
        </Modal>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    skipButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    skipText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    heroSection: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 60,
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconGradient: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    welcomeSubtitle: {
        fontSize: 18,
        color: '#AEAEB2',
        textAlign: 'center',
        lineHeight: 24,
    },
    mainContent: {
        flex: 1,
    },
    featureCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    featureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,122,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    featureSubtitle: {
        fontSize: 14,
        color: '#AEAEB2',
    },
    requiredBadge: {
        backgroundColor: '#FF3B30',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    requiredText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    featureDescription: {
        fontSize: 16,
        color: '#AEAEB2',
        lineHeight: 22,
        marginBottom: 20,
    },
    benefitsList: {
        marginBottom: 24,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    benefitText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginLeft: 12,
        flex: 1,
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        paddingTop: 40,
        paddingBottom: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 20,
    },
});