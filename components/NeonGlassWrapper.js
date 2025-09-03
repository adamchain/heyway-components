// NeonGlassWrapper.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const NeonGlassWrapper = ({ children, style }) => {
    return (
        <View style={styles.outerWrapper}>
            <LinearGradient
                colors={[
                    '#00f0ff', '#00ff73', '#f6ff00', '#ff9900', '#ff004d', '#ff00f7', '#00f0ff'
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.borderGlow}
            />
            <BlurView intensity={30} tint="light" style={styles.glassInner}>
                <View style={[styles.glassContent, style]}>
                    {children}
                </View>
            </BlurView>
        </View>
    );
};

const BORDER_RADIUS = 55;

const styles = StyleSheet.create({
    outerWrapper: {
        flex: 1,
        padding: 2.5,
        borderRadius: HEYWAY_RADIUS.xxxl,
        overflow: 'hidden',
    },
    borderGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: HEYWAY_RADIUS.xxxl,
        zIndex: 0,
        opacity: 0.9,
    },
    glassInner: {
        flex: 1,
        borderRadius: HEYWAY_RADIUS.xxxl - 2,
        overflow: 'hidden',
        zIndex: 1,
    },
    glassContent: {
        flex: 1,
        backgroundColor: HEYWAY_COLORS.background.overlay + '06',
        padding: HEYWAY_SPACING.lg,
    },
});

export default NeonGlassWrapper;
