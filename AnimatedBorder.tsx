import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from './designSystem';

interface AnimatedBorderProps {
    width: number;
    height: number;
    borderRadius: number;
    borderWidth?: number;
    children: React.ReactNode;
    intensity?: 'subtle' | 'normal' | 'intense';
    speed?: number;
    colors?: string[];
}

const AnimatedBorderComponent: React.FC<AnimatedBorderProps> = ({
    width,
    height,
    borderRadius,
    borderWidth = 3,
    children,
    intensity = 'normal',
    speed = 5000,
    colors
}) => {
    // Remove all animation logic

    const getGradientColors = () => {
        // Use custom colors if provided, otherwise fall back to intensity-based colors
        if (colors && colors.length >= 4) {
            return colors;
        }
        
        switch (intensity) {
            case 'subtle':
                return COLORS.gradient.appleBorderSubtle;
            case 'intense':
                return COLORS.gradient.appleBorderIntense;
            default:
                return COLORS.gradient.appleBorder;
        }
    };

    const gradientColors = getGradientColors();

    return (
        <View style={[styles.container, { width, height }]}>
            {/* Static gradient border - no animation */}
            <View
                style={[
                    styles.borderContainer,
                    {
                        width: width + borderWidth * 2,
                        height: height + borderWidth * 2,
                        borderRadius: borderRadius + borderWidth,
                    },
                ]}
            >
                <LinearGradient
                    colors={[gradientColors[0], gradientColors[1], gradientColors[2], gradientColors[3]] as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.staticGradient, { borderRadius: borderRadius + borderWidth }]}
                />
            </View>
            
            <View
                style={[
                    styles.content,
                    {
                        width,
                        height,
                        borderRadius,
                    },
                ]}
            >
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    borderContainer: {
        position: 'absolute',
    },
    staticGradient: {
        flex: 1,
        shadowColor: '#FF6B9D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    content: {
        overflow: 'hidden',
        zIndex: 1,
    },
});

export const AnimatedBorder = memo(AnimatedBorderComponent);