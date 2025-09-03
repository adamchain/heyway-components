import { Easing } from 'react-native';

// Heyway Design System - Apple Intelligence & ChatGPT Hybrid with iOS 18 Glassmorphism
const COLORS = {
    primary: '#0A0A0F',          // Deep space black
    primaryLight: '#1A1A2E',     // Midnight blue
    green: '#32D74B',            // iOS green
    secondary: '#1C1C1E',        // iOS dark secondary
    tertiary: '#2C2C2E',         // iOS dark tertiary
    destructive: '#FF453A',      // iOS red
    accent: '#007AFF',           // iOS blue accent

    // Named Gradients for Production Use
    gradient: {
        accent: ['#007AFF', '#5856D6', '#AF52DE'] as [string, string, string],   // iOS blue to purple gradient

        accent2: ['#FF6B6B', '#FFD93D'] as [string, string],
        background: ['#0a0a0f', '#12121a', '#1a1a2e', '#12121a', '#0a0a0f'] as [string, string, string, string, string], // Sophisticated background
        glass: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.08)'] as [string, string], // Glass effect
        bubble: ['rgba(0,122,255,0.3)', 'rgba(88,86,214,0.2)', 'rgba(175,82,222,0.1)'] as [string, string, string], // Bubble gradient

        // Light Mode Gradients - Apple Intelligence Inspired
        lightBackground: ['#FFFFFF', '#FFF8FA', '#FFF1F7', '#FFE8F0'] as [string, string, string, string], // Clean white to soft rose
        lightGlass: ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.02)'] as [string, string], // Subtle dark glass for light mode
        lightAccent: ['#FF3B30', '#FF2D92', '#AF52DE'] as [string, string, string], // Vibrant light mode accent
        lightBubble: ['rgba(255,59,48,0.15)', 'rgba(255,45,146,0.12)', 'rgba(175,82,222,0.08)'] as [string, string, string], // Light mode bubbles

        // Apple Intelligence Inspired Gradients
        pinkOrange: ['#FF6B9D', '#FF1744', '#E91E63'] as [string, string, string],
        aiCard: ['#FF5A3C', '#FF3964', '#EA2C90', '#C134B8'] as [string, string, string, string], // HeyWay promo cards
        appleBorder: [
            '#FF6B9D',  // Vibrant pink
            '#FF8E53',  // Orange
            '#FFD93D',  // Yellow
            '#6BCF7F',  // Green
            '#4D96FF',  // Blue
            '#9B59B6',  // Purple
            '#FF6B9D'   // Back to pink for seamless loop
        ] as [string, string, string, string, string, string, string],
        appleBorderIntense: [
            '#FF1744',  // Hot pink
            '#FF5722',  // Deep orange
            '#FFC107',  // Amber
            '#4CAF50',  // Green
            '#2196F3',  // Blue
            '#9C27B0',  // Purple
            '#FF1744'   // Back to hot pink
        ] as [string, string, string, string, string, string, string],
        appleBorderSubtle: [
            'rgba(255, 107, 157, 0.3)',
            'rgba(255, 142, 83, 0.3)',
            'rgba(255, 217, 61, 0.3)',
            'rgba(107, 207, 127, 0.3)',
            'rgba(77, 150, 255, 0.3)',
            'rgba(155, 89, 182, 0.3)',
            'rgba(255, 107, 157, 0.3)'
        ] as [string, string, string, string, string, string, string]
    },

    // Enhanced Liquid Glass Background System
    background: {
        primary: 'rgba(10,10,15,0.98)',        // Much darker primary
        secondary: 'rgba(255,255,255,0.06)',   // Reduced glass secondary
        tertiary: 'rgba(255,255,255,0.07)',    // Reduced glass tertiary
        quaternary: 'rgba(255,255,255,0.09)',  // Reduced glass quaternary
        glass: 'rgba(255,255,255,0.05)',       // Much more subtle glass overlay
        glassStrong: 'rgba(255,255,255,0.07)', // Reduced stronger glass
        glassFocus: 'rgba(255,255,255,0.09)',  // Reduced focus state glass
        blur: 'rgba(0,0,0,0.3)',               // Blur backdrop

        // Light Mode Backgrounds
        light: {
            primary: '#FFFFFF',                       // Pure white background
            secondary: 'rgba(0,0,0,0.02)',          // Very subtle gray overlay
            tertiary: 'rgba(0,0,0,0.04)',           // Light card background
            quaternary: 'rgba(0,0,0,0.06)',         // Elevated card background
            glass: 'rgba(255,255,255,0.8)',         // Light glass overlay
            glassStrong: 'rgba(255,255,255,0.9)',   // Strong light glass
            glassFocus: 'rgba(255,255,255,0.95)',   // Focus state light glass
            blur: 'rgba(255,255,255,0.85)',         // Light blur backdrop
        }
    },

    // iOS Text System - Enhanced for both themes
    text: {
        primary: '#FFFFFF',          // Pure white
        secondary: 'rgba(235,235,245,0.6)',  // Refined secondary text
        tertiary: 'rgba(235,235,245,0.3)',   // More subtle tertiary text  
        disabled: 'rgba(235,235,245,0.2)',   // iOS disabled text
        onDark: '#1a1a2e',          // Dark text for light backgrounds
        inactive: 'rgba(255,255,255,0.6)', // Inactive tab text

        // Light Mode Text
        light: {
            primary: '#1C1C1E',                  // Strong dark text
            secondary: 'rgba(60,60,67,0.78)',   // iOS light secondary
            tertiary: 'rgba(60,60,67,0.55)',    // iOS light tertiary
            disabled: 'rgba(60,60,67,0.3)',     // iOS light disabled
            onLight: '#FFFFFF',                  // White text for dark elements
            inactive: 'rgba(60,60,67,0.6)',     // Inactive light text
        }
    },

    // Semantic Colors
    success: '#32D74B',          // iOS green
    warning: '#FF9F0A',          // iOS orange
    error: '#FF453A',            // iOS red
    info: '#64D2FF',             // iOS light blue

    // Glass Border & Divider System - Refined for both themes
    border: {
        primary: 'rgba(255,255,255,0.08)',      // Much more subtle glass border
        secondary: 'rgba(255,255,255,0.08)',    // Consistent subtle border
        accent: 'rgba(0,122,255,0.5)',          // Accent glass border
        focus: 'rgba(0,122,255,0.8)',           // Focus glass border
        error: 'rgba(255,69,58,0.5)',           // Error glass border

        // Light Mode Borders
        light: {
            primary: 'rgba(0,0,0,0.06)',        // Clean light border
            secondary: '#DADADA',               // Solid light gray border
            accent: 'rgba(0,122,255,0.6)',      // Light accent border
            focus: 'rgba(0,122,255,0.8)',       // Light focus border
            error: 'rgba(255,59,48,0.6)',       // Light error border
            card: 'rgba(0,0,0,0.08)',           // Card container border
            input: 'rgba(0,0,0,0.1)',           // Input field border
        }
    },

    // Enhanced Glass Effects & Overlays - Darkened
    overlay: {
        light: 'rgba(255, 255, 255, 0.03)',
        medium: 'rgba(255, 255, 255, 0.06)',
        strong: 'rgba(255, 255, 255, 0.09)',
        dark: 'rgba(0, 0, 0, 0.3)',
        blur: 'rgba(0, 0, 0, 0.5)',
        modalBackdrop: 'rgba(0, 0, 0, 0.7)',
        sidebarDark: 'rgba(0,0,0,0.7)',
        sidebarBlue: 'rgba(10,10,15,0.98)',
        modal: ['rgba(10,10,15,0.98)', 'rgba(26,26,46,0.96)'], // New modal gradient
    },

    // Bubble Effects
    bubble: {
        primary: 'rgba(0,122,255,0.2)',
        secondary: 'rgba(88,86,214,0.15)',
        tertiary: 'rgba(175,82,222,0.1)',
        accent: 'rgba(255,255,255,0.05)',
    },

    // State & Interactive Colors
    state: {
        active: 'rgba(0, 255, 132, 0.2)',      // Active toggle state
        inactive: 'rgba(142, 142, 147, 0.2)',  // Inactive toggle state
        hover: 'rgba(255,255,255,0.12)',       // Hover state for glass elements
        pressed: 'rgba(255,255,255,0.08)',     // Pressed state
        focus: 'rgba(255,255,255,0.15)',       // Focus state
    },

    // Special Colors
    special: {
        callMessageGradient: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'], // Call message container gradient
        sendButtonBorder: 'rgba(255,255,255,0.2)', // Send button border
        transparent: 'transparent',             // Transparent background
    }
};

// Named Gradients Export
export const GRADIENTS = {
    pinkOrange: COLORS.gradient.pinkOrange,
    aiCard: COLORS.gradient.aiCard,
    appleBorder: COLORS.gradient.appleBorder,
    appleBorderIntense: COLORS.gradient.appleBorderIntense,
    appleBorderSubtle: COLORS.gradient.appleBorderSubtle,
    accent: COLORS.gradient.accent,
    background: COLORS.gradient.background,
    glass: COLORS.gradient.glass,
    bubble: COLORS.gradient.bubble,
    // Light Mode Gradients
    lightBackground: COLORS.gradient.lightBackground,
    lightGlass: COLORS.gradient.lightGlass,
    lightAccent: COLORS.gradient.lightAccent,
    lightBubble: COLORS.gradient.lightBubble,
};

// iOS 18 Glassmorphism & Apple Intelligence Enhanced Gradients
export const ENHANCED_GRADIENTS = {
    // Apple Intelligence signature gradients
    aiPrimary: [
        'rgba(255, 107, 157, 0.95)',
        'rgba(255, 23, 68, 0.90)',
        'rgba(233, 30, 99, 0.85)',
        'rgba(156, 39, 176, 0.25)'
    ],

    // Unified Header Gradient (from list.tsx and NewCallModal.tsx)
    headerTitle: ['#0894FF', '#C959DD', '#FF2E54', '#FF9004'],
    headerTitleLocations: [0, 0.34, 0.68, 1],

    // iOS 18 Glassmorphism effects
    glassUltra: [
        'rgba(255, 255, 255, 0.25)',
        'rgba(255, 255, 255, 0.15)',
        'rgba(255, 255, 255, 0.08)'
    ],

    // ChatGPT-inspired glass sheets
    chatGlassSheet: [
        'rgba(255, 255, 255, 0.85)',
        'rgba(255, 255, 255, 0.70)',
        'rgba(255, 255, 255, 0.85)'
    ],

    // Gradient accent lighting
    accentPink: [
        'rgba(255, 107, 157, 0.8)',
        'rgba(255, 23, 68, 0.6)',
        'rgba(233, 30, 99, 0.4)'
    ],

    accentOrange: [
        'rgba(255, 149, 0, 0.8)',
        'rgba(255, 114, 0, 0.6)',
        'rgba(255, 69, 0, 0.4)'
    ],

    accentBlue: [
        'rgba(0, 122, 255, 0.8)',
        'rgba(52, 120, 246, 0.6)',
        'rgba(64, 156, 255, 0.4)'
    ],

    // Premium modal backgrounds with glassmorphism
    modalPremium: [
        'rgba(255, 255, 255, 0.90)',
        'rgba(248, 250, 252, 0.85)',
        'rgba(255, 255, 255, 0.90)'
    ],

    // Light Mode Enhanced Gradients
    lightAiPrimary: [
        '#FFFFFF',
        '#FFF8FA',
        '#FFF1F7',
        '#FFE8F0'
    ],

    lightGlassUltra: [
        'rgba(255, 255, 255, 0.95)',
        'rgba(255, 255, 255, 0.85)',
        'rgba(255, 255, 255, 0.75)'
    ]
};

// Apple macOS Design System Typography - SF Pro Display
export const TYPOGRAPHY = {
    // Apple Standard Font Weights
    weights: {
        ultralight: '100',
        thin: '200',
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        heavy: '800',
        black: '900',
    },

    // Apple macOS Typography Scale
    sizes: {
        // System text sizes aligned with Apple HIG
        caption2: 11,     // Small auxiliary text
        caption1: 12,     // Captions, labels
        footnote: 13,     // Secondary information
        subheadline: 15,  // Secondary headlines
        callout: 16,      // Emphasized text
        body: 17,         // Primary body text
        headline: 17,     // Section headlines (bold weight)
        title3: 20,       // Third-level titles
        title2: 22,       // Second-level titles
        title1: 28,       // Top-level titles
        largeTitle: 34,   // Large prominent titles
        display: 40,      // Special display text
        hero: 48,         // Hero sections
    },

    // Apple-standard Line Heights
    lineHeights: {
        tight: 1.08333,   // For large text
        normal: 1.29412,  // Standard reading
        relaxed: 1.41176, // Comfortable reading
    },

    // Apple Letter Spacing Standards
    letterSpacing: {
        tight: -0.32,     // For large titles
        normal: 0,        // Standard text
        wide: 0.1,        // Slightly spaced
        wider: 0.25,      // More emphasis
    }
};

// Apple macOS Text Styles - Based on HIG
export const TEXT = {
    // Large Title - For main app titles
    largeTitle: {
        fontSize: TYPOGRAPHY.sizes.largeTitle,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.text.primary,
        lineHeight: TYPOGRAPHY.sizes.largeTitle * TYPOGRAPHY.lineHeights.tight,
        letterSpacing: TYPOGRAPHY.letterSpacing.tight,
    },
    
    // Title 1 - Section headers
    title1: {
        fontSize: TYPOGRAPHY.sizes.title1,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.text.primary,
        lineHeight: TYPOGRAPHY.sizes.title1 * TYPOGRAPHY.lineHeights.tight,
        letterSpacing: TYPOGRAPHY.letterSpacing.normal,
    },
    
    // Title 2 - Sub-section headers
    title2: {
        fontSize: TYPOGRAPHY.sizes.title2,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.text.primary,
        lineHeight: TYPOGRAPHY.sizes.title2 * TYPOGRAPHY.lineHeights.tight,
    },
    
    // Title 3 - Minor headers
    title3: {
        fontSize: TYPOGRAPHY.sizes.title3,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.text.primary,
        lineHeight: TYPOGRAPHY.sizes.title3 * TYPOGRAPHY.lineHeights.normal,
    },
    
    // Headline - Bold section headers
    headline: {
        fontSize: TYPOGRAPHY.sizes.headline,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.text.primary,
        lineHeight: TYPOGRAPHY.sizes.headline * TYPOGRAPHY.lineHeights.normal,
    },
    
    // Body - Main content text
    body: {
        fontSize: TYPOGRAPHY.sizes.body,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.text.primary,
        lineHeight: TYPOGRAPHY.sizes.body * TYPOGRAPHY.lineHeights.normal,
    },
    
    // Callout - Emphasized content
    callout: {
        fontSize: TYPOGRAPHY.sizes.callout,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.text.primary,
        lineHeight: TYPOGRAPHY.sizes.callout * TYPOGRAPHY.lineHeights.normal,
    },
    
    // Subheadline - Secondary information
    subheadline: {
        fontSize: TYPOGRAPHY.sizes.subheadline,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.text.secondary,
        lineHeight: TYPOGRAPHY.sizes.subheadline * TYPOGRAPHY.lineHeights.normal,
    },
    
    // Footnote - Minor details
    footnote: {
        fontSize: TYPOGRAPHY.sizes.footnote,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.text.tertiary,
        lineHeight: TYPOGRAPHY.sizes.footnote * TYPOGRAPHY.lineHeights.normal,
    },
    
    // Caption 1 - Labels and captions
    caption1: {
        fontSize: TYPOGRAPHY.sizes.caption1,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.text.tertiary,
        lineHeight: TYPOGRAPHY.sizes.caption1 * TYPOGRAPHY.lineHeights.normal,
    },
    
    // Caption 2 - Small auxiliary text
    caption2: {
        fontSize: TYPOGRAPHY.sizes.caption2,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.text.tertiary,
        lineHeight: TYPOGRAPHY.sizes.caption2 * TYPOGRAPHY.lineHeights.normal,
    },
};

// Enhanced Typography Scale - Apple Intelligence & ChatGPT Inspired
export const TEXT_ENHANCED = {
    ...TEXT,
    displayLarge: {
        fontSize: 32,
        fontWeight: '300', // Light weight for elegance
        letterSpacing: -0.8,
        lineHeight: 38,
        color: COLORS.text.primary,
    },
    titleEmphasized: {
        fontSize: 20,
        fontWeight: '700', // Bolder for emphasis
        letterSpacing: 0.1,
        color: COLORS.text.primary,
    },
    // ChatGPT-inspired sharp typography
    chatTitle: {
        fontSize: 18,
        fontWeight: '700', // Bold for strong hierarchy
        letterSpacing: 0.2,
        color: COLORS.text.primary,
    },
    cardLabel: {
        fontSize: 16,
        fontWeight: '600', // Semibold for cards
        letterSpacing: 0.15,
        color: COLORS.text.primary,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600', // Semibold for buttons
        letterSpacing: 0.3,
        color: COLORS.text.primary,
    },
    // Light mode variations
    light: {
        displayLarge: {
            fontSize: 32,
            fontWeight: '300',
            letterSpacing: -0.8,
            lineHeight: 38,
            color: COLORS.text.light.primary,
        },
        chatTitle: {
            fontSize: 18,
            fontWeight: '700',
            letterSpacing: 0.2,
            color: COLORS.text.light.primary,
        },
        cardLabel: {
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: 0.15,
            color: COLORS.text.light.primary,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: 0.3,
            color: COLORS.text.light.onLight,
        }
    }
};

// Apple macOS Spacing System - 8pt grid
const SPACING = {
    xxs: 2,    // Micro spacing
    xs: 4,     // Small spacing
    sm: 8,     // Standard small
    md: 12,    // Medium spacing (1.5x base)
    lg: 16,    // Large spacing (2x base)
    xl: 20,    // Extra large (2.5x base)
    xxl: 24,   // Double extra large (3x base)
    xxxl: 32,  // Triple extra large (4x base)
    xxxxl: 40, // Quad extra large (5x base)
    huge: 48,  // Huge spacing (6x base)
    massive: 64, // Massive spacing (8x base)
};

// Refined spacing scale for Apple Intelligence polish
export const SPACING_REFINED = {
    ...SPACING,
    micro: 2,
    nano: 6,
    huge: 48,
    massive: 64
};

// Apple macOS Border Radius System
const RADIUS = {
    none: 0,     // No radius
    xs: 4,       // Small elements
    sm: 6,       // Buttons, inputs
    md: 8,       // Cards, containers
    lg: 10,      // Large cards (Apple standard)
    xl: 12,      // Prominent containers
    xxl: 16,     // Modal sheets
    xxxl: 20,    // Large modals
    xxxxl: 24,   // Hero elements
    full: 9999,  // Pills, fully rounded
};

const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 6,
    },
    glass: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4,
    },
    glassEnhanced: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
        elevation: 5,
    },
    button: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4,
    },
    buttonHover: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 6,
    },
    sendButton: {
        shadowColor: 'rgba(0,255,136,0.3)',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 5,
    },
    sendButtonHover: {
        shadowColor: 'rgba(0,255,136,0.4)',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.6,
        shadowRadius: 32,
        elevation: 8,
    },
    accent: {
        shadowColor: COLORS.gradient.accent[0],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 4,
    },
    primary: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    bubble: {
        shadowColor: 'rgba(0,122,255,0.4)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 8,
    }
};

// Enhanced animation curves for Apple Intelligence feel
export const ANIMATION_CURVES = {
    appleSpring: {
        tension: 120,
        friction: 14,
        useNativeDriver: true
    },
    appleEaseInOut: Easing.bezier(0.25, 0.1, 0.25, 1),
    appleEaseOut: Easing.bezier(0.16, 1, 0.3, 1)
};

// Apple macOS Color System - Aligned with HIG
export const COLORS_ENHANCED = {
    ...COLORS,
    
    // macOS System Colors
    systemColors: {
        // Label Colors
        labelPrimary: '#000000',           // Primary labels
        labelSecondary: 'rgba(60, 60, 67, 0.6)',  // Secondary labels
        labelTertiary: 'rgba(60, 60, 67, 0.3)',   // Tertiary labels
        labelQuaternary: 'rgba(60, 60, 67, 0.18)', // Quaternary labels
        
        // Fill Colors
        fillPrimary: 'rgba(120, 120, 128, 0.2)',   // Primary fill
        fillSecondary: 'rgba(120, 120, 128, 0.16)', // Secondary fill
        fillTertiary: 'rgba(120, 120, 128, 0.12)',  // Tertiary fill
        fillQuaternary: 'rgba(120, 120, 128, 0.08)', // Quaternary fill
        
        // Background Colors
        backgroundPrimary: '#FFFFFF',        // Primary background
        backgroundSecondary: '#F2F2F7',     // Secondary background
        backgroundTertiary: '#FFFFFF',       // Tertiary background
        
        // Grouped Background Colors
        groupedBackgroundPrimary: '#F2F2F7',   // Primary grouped background
        groupedBackgroundSecondary: '#FFFFFF', // Secondary grouped background
        groupedBackgroundTertiary: '#F2F2F7',  // Tertiary grouped background
        
        // Separator Colors
        separator: 'rgba(60, 60, 67, 0.29)',        // Standard separator
        opaqueSeparator: '#C6C6C8',                  // Opaque separator
        
        // Link Color
        link: '#007AFF',                     // Links
        
        // Control Colors
        controlAccent: '#007AFF',            // Control accent
        controlBackground: 'rgba(120, 120, 128, 0.16)', // Control background
    },

    // Glass effect system
    glass: {
        subtle: 'rgba(255,255,255,0.5)',     // Very subtle glass
        medium: 'rgba(255,255,255,0.7)',     // Medium glass
        strong: 'rgba(255,255,255,0.85)',    // Strong glass
        ultra: 'rgba(255,255,255,0.95)'      // Ultra glass
    },

    // macOS App Colors
    macosApp: {
        // Window backgrounds
        windowBackground: '#ECECEC',         // Main window background
        contentBackground: '#FFFFFF',        // Content area background
        sidebarBackground: '#F7F7F7',       // Sidebar background
        
        // Interactive elements
        buttonBackground: '#FFFFFF',         // Button background
        buttonBorder: '#D1D1D6',            // Button border
        selectedButton: '#007AFF',           // Selected button
        
        // Text on backgrounds
        windowText: '#000000',               // Text on window background
        contentText: '#000000',              // Text on content background
        secondaryText: 'rgba(0, 0, 0, 0.6)', // Secondary text
        
        // Status indicators
        successGreen: '#32D74B',             // Success state
        warningOrange: '#FF9500',            // Warning state
        errorRed: '#FF3B30',                 // Error state
        infoBlue: '#007AFF',                 // Information state
    },

    // Legacy Unified App Colors (for backward compatibility)
    unified: {
        // Primary colors
        background: '#FFFFFF',
        primary: '#007AFF', // Apple Intelligence blue
        accent: '#007AFF',

        // Interactive states
        selected: '#007AFF',
        selectedBackground: 'rgba(0, 122, 255, 0.1)',

        // Surfaces
        card: 'rgba(255, 255, 255, 0.9)',
        cardBorder: '#ECECEC',

        // Input elements
        searchBackground: '#F4F4F6',
        searchBorder: '#E5E5EA',
        inputBackground: '#F5F5F5',

        // Text
        primaryText: '#111111',
        secondaryText: '#666666',
        tertiaryText: '#999999',

        // Prompt buttons
        promptBackground: '#F0F0F0',
        promptSelected: '#007AFF',

        // Shadows
        shadowColor: '#000000',
        shadowLight: 'rgba(0, 0, 0, 0.05)',
        shadowMedium: 'rgba(0, 0, 0, 0.1)',

        // Apple Intelligence blue glow
        blueGlow: 'rgba(0, 122, 255, 0.2)',
    }
};

// iOS 18 Glassmorphism Effect Utilities
export const createGlassEffect = (opacity = 0.1, blur = 20, isLightMode = false) => {
    if (isLightMode) {
        return {
            backgroundColor: `rgba(255,255,255,${opacity + 0.7})`,
            backdropFilter: `blur(${blur}px)`,
            borderWidth: 1,
            borderColor: COLORS.border.light.card,
            ...SHADOWS.glass,
        };
    }
    return {
        backgroundColor: `rgba(255,255,255,${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        borderWidth: 1,
        borderColor: `rgba(255,255,255,${opacity * 1.5})`,
    };
};

// iOS 18 Style Glassmorphism with White Glow Borders
const createAppleGlassEffect = (intensity: 'light' | 'medium' | 'strong' = 'medium', glowColor = 'white') => {
    const intensityMap = {
        light: { opacity: 0.75, blur: 25, glow: 0.3 },
        medium: { opacity: 0.85, blur: 30, glow: 0.5 },
        strong: { opacity: 0.95, blur: 35, glow: 0.7 }
    };

    const config = intensityMap[intensity] || intensityMap.medium;

    return {
        backgroundColor: `rgba(255, 255, 255, ${config.opacity})`,
        backdropFilter: `blur(${config.blur}px)`,
        borderWidth: 1.5,
        borderColor: `rgba(255, 255, 255, ${config.glow})`,
        shadowColor: glowColor === 'white' ? '#FFFFFF' : glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: config.glow * 0.6,
        shadowRadius: 8,
        elevation: 8,
    };
};

// ChatGPT-style Glass Sheet
const createChatGlassSheet = (blur = 40) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    backdropFilter: `blur(${blur}px)`,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 12,
});

// Vibrant Glow Effect for Buttons and Icons
const createVibriantGlow = (color = '#FF6B9D', intensity = 0.6) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: 12,
    elevation: 8,
});


export const createBubbleEffect = (size = 100, color = COLORS.bubble.primary) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    position: 'absolute' as const,
    ...SHADOWS.bubble,
});

// Apple Intelligence Border Effect
export const createAppleBorderEffect = (width = 220, height = 18, colors = GRADIENTS.appleBorderIntense, blur = 32, angle = 45) => ({
    width,
    height,
    borderRadius: height / 2,
    overflow: 'hidden',
    position: 'absolute' as const,
    backgroundColor: 'transparent',
    shadowColor: colors[0],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: blur,
    elevation: 8,
    transform: [{ rotate: `${angle}deg` }],
});

// Enhanced Glass Effect Utility - Light & Dark Mode
export const createEnhancedGlassEffect = (opacity = 0.14, blur = 32, borderGradient = GRADIENTS.appleBorderIntense, isLightMode = false) => {
    if (isLightMode) {
        return {
            backgroundColor: `rgba(255,255,255,${opacity + 0.7})`,
            backdropFilter: `blur(${blur}px)`,
            borderWidth: 1,
            borderColor: COLORS.border.light.primary,
            ...SHADOWS.glassEnhanced,
        };
    }
    return {
        backgroundColor: `rgba(255,255,255,${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        borderWidth: 2,
        borderColor: borderGradient[0],
        shadowColor: borderGradient[1],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 32,
        elevation: 8,
    };
};

// Futuristic Streaks for Background
const STREAKS = [
    {
        style: [createAppleBorderEffect(220, 18, GRADIENTS.appleBorderIntense, 32, 30), { top: '12%', left: '8%' }],
        colors: GRADIENTS.appleBorderIntense,
    },
    {
        style: [createAppleBorderEffect(180, 14, GRADIENTS.appleBorder, 24, -20), { top: '38%', right: '10%' }],
        colors: GRADIENTS.appleBorder,
    },
    {
        style: [createAppleBorderEffect(260, 20, GRADIENTS.appleBorderIntense, 40, 60), { bottom: '18%', left: '16%' }],
        colors: GRADIENTS.appleBorderIntense,
    },
    {
        style: [createAppleBorderEffect(140, 10, GRADIENTS.appleBorderSubtle, 18, -45), { bottom: '32%', right: '18%' }],
        colors: GRADIENTS.appleBorderSubtle,
    },
];

// ADDITIONAL UTILITY FUNCTIONS
export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'completed':
            return COLORS.success;
        case 'failed':
            return COLORS.error;
        case 'partial':
            return COLORS.warning;
        case 'scheduled':
            return COLORS.info;
        default:
            return COLORS.text.tertiary;
    }
};

export const getUrgencyColor = (urgency: 'low' | 'medium' | 'high'): string => {
    switch (urgency) {
        case 'low':
            return COLORS.info;
        case 'medium':
            return COLORS.warning;
        case 'high':
            return COLORS.error;
        default:
            return COLORS.text.tertiary;
    }
};

export const createCustomShadow = (color: string, opacity: number = 0.3) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4,
});

// iOS 18 Glassmorphism Button Styles
const GLASSMORPHISM_STYLES = {
    // Primary glass button with vibrant glow
    primaryGlassButton: {
        ...createAppleGlassEffect('medium'),
        ...createVibriantGlow('#FF6B9D', 0.4),
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },

    // Secondary glass button
    secondaryGlassButton: {
        ...createAppleGlassEffect('light'),
        ...createVibriantGlow('#007AFF', 0.3),
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },

    // Glass card container
    glassCard: {
        ...createAppleGlassEffect('medium'),
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
    },

    // Glass sheet modal
    glassSheet: {
        ...createChatGlassSheet(),
        borderTopLeftRadius: RADIUS.xxl,
        borderTopRightRadius: RADIUS.xxl,
    },

    // Transparent title bar
    transparentTitleBar: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(25px)',
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },

    // Glass search bar
    glassSearchBar: {
        ...createAppleGlassEffect('light'),
        borderRadius: RADIUS.xxl,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
    }
};

// SF Pro Display Text Styles with Apple Intelligence Polish
const SF_TEXT_STYLES = {
    // Hero titles
    hero: {
        fontSize: TYPOGRAPHY.sizes.hero,
        fontWeight: TYPOGRAPHY.weights.bold,
        letterSpacing: TYPOGRAPHY.letterSpacing.tight,
        color: COLORS.text.light.primary,
        lineHeight: TYPOGRAPHY.sizes.hero * TYPOGRAPHY.lineHeights.tight,
    },

    // Unified App Text Styles (from list.tsx and NewCallModal.tsx)
    unified: {
        // Header gradient text
        headerTitle: {
            fontSize: 34,
            fontWeight: '600',
            letterSpacing: -0.5,
            textAlign: 'center' as const,
            backgroundColor: 'transparent',
            color: 'black',
        },

        // Modal header gradient text
        modalHeaderTitle: {
            fontSize: 32,
            fontWeight: '700',
            letterSpacing: -0.5,
            textAlign: 'center' as const,
            backgroundColor: 'transparent',
            color: 'black',
        },

        // Call item text
        callItemTitle: {
            fontSize: 17,
            fontWeight: '600',
            color: '#111111',
        },

        // Call description
        callItemDescription: {
            fontSize: 15,
            fontWeight: '400',
            color: '#444444',
            lineHeight: 21,
        },

        // Search placeholder
        searchPlaceholder: {
            fontSize: 16,
            color: '#999999',
        },

        // Button text
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#FFFFFF',
        },

        // Prompt button text
        promptText: {
            fontSize: 14,
            fontWeight: '500',
            color: '#333333',
        },

        // Selected prompt text
        promptTextSelected: {
            fontSize: 14,
            fontWeight: '500',
            color: '#FFFFFF',
        },
    },

    // Display text
    display: {
        fontSize: TYPOGRAPHY.sizes.display,
        fontWeight: TYPOGRAPHY.weights.semibold,
        letterSpacing: TYPOGRAPHY.letterSpacing.normal,
        color: COLORS.text.light.primary,
        lineHeight: TYPOGRAPHY.sizes.display * TYPOGRAPHY.lineHeights.tight,
    },

    // ChatGPT-style titles
    chatTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        letterSpacing: TYPOGRAPHY.letterSpacing.wide,
        color: COLORS.text.light.primary,
    },

    // Card labels
    cardLabel: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.semibold,
        letterSpacing: TYPOGRAPHY.letterSpacing.wide,
        color: COLORS.text.light.primary,
    },

    // Glass button text
    glassButtonText: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.semibold,
        letterSpacing: TYPOGRAPHY.letterSpacing.wider,
        color: COLORS.text.light.primary,
    },

    // Clean white text for title bars
    titleBarText: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        letterSpacing: TYPOGRAPHY.letterSpacing.normal,
        color: '#FFFFFF',
    }
};

// Unified Component Styles (from list.tsx and NewCallModal.tsx)
const UNIFIED_STYLES = {
    // Search bar (ChatGPT style)
    searchBar: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        backgroundColor: COLORS_ENHANCED.unified.searchBackground,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: COLORS_ENHANCED.unified.searchBorder,
        paddingHorizontal: 20,
        paddingVertical: 12,
        height: 52,
    },

    // Card items (list items)
    cardItem: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 10,
        paddingVertical: 18,
        marginHorizontal: 12,
        marginVertical: 2,
        borderRadius: 12,
        backgroundColor: COLORS_ENHANCED.unified.card,
        borderWidth: 1,
        borderColor: COLORS_ENHANCED.unified.cardBorder,
        shadowColor: COLORS_ENHANCED.unified.shadowColor,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },

    // Prompt buttons
    promptButton: {
        backgroundColor: COLORS_ENHANCED.unified.promptBackground,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },

    // Selected prompt button
    promptButtonSelected: {
        backgroundColor: COLORS_ENHANCED.unified.promptSelected,
        shadowColor: COLORS_ENHANCED.unified.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    // Action card (bottom cards)
    actionCard: {
        flex: 1,
        borderRadius: 18,
        overflow: 'hidden' as const,
        shadowColor: COLORS_ENHANCED.unified.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 6,
    },

    // Action card gradient
    actionCardGradient: {
        flex: 1,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: 18,
        paddingHorizontal: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: COLORS_ENHANCED.unified.selectedBackground,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        shadowColor: COLORS_ENHANCED.unified.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    // Header gradient mask helper
    createHeaderGradientMask: (width: number = 150, height: number = 50) => ({
        width,
        height,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    }),

    // Apple Intelligence blue glow
    createBlueGlow: (intensity: number = 0.2) => ({
        shadowColor: COLORS_ENHANCED.unified.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: intensity,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS_ENHANCED.unified.selectedBackground,
    }),
};

// Apple macOS Design System - Complete Design Tokens
const DESIGN_TOKENS = {
  // macOS Color Palette - Light Mode Primary
  colors: {
    // System Background Colors
    background: {
      primary: '#FFFFFF',        // Primary background (white)
      secondary: '#F2F2F7',      // Secondary background (light gray)
      tertiary: '#FFFFFF',       // Tertiary background (white)
      windowBackground: '#ECECEC', // Window chrome background
      sidebarBackground: '#F7F7F7', // Sidebar background
      groupedPrimary: '#F2F2F7', // Grouped content primary
      groupedSecondary: '#FFFFFF', // Grouped content secondary
    },
    
    // System Text Colors
    text: {
      primary: '#000000',        // Primary labels (black)
      secondary: 'rgba(60, 60, 67, 0.6)', // Secondary labels
      tertiary: 'rgba(60, 60, 67, 0.3)',  // Tertiary labels
      quaternary: 'rgba(60, 60, 67, 0.18)', // Quaternary labels
      link: '#007AFF',           // Link color
    },
    
    // System Fill Colors
    fill: {
      primary: 'rgba(120, 120, 128, 0.2)',   // Primary fill
      secondary: 'rgba(120, 120, 128, 0.16)', // Secondary fill
      tertiary: 'rgba(120, 120, 128, 0.12)',  // Tertiary fill
      quaternary: 'rgba(120, 120, 128, 0.08)', // Quaternary fill
    },
    
    // Interactive Colors
    interactive: {
      accent: '#007AFF',         // System blue
      accentHover: '#0051D0',    // Hover state
      destructive: '#FF3B30',    // System red
      success: '#32D74B',        // System green
      warning: '#FF9500',        // System orange
      purple: '#AF52DE',         // System purple
      pink: '#FF2D92',           // System pink
      teal: '#5AC8FA',           // System teal
    },
    
    // Separator Colors
    separator: {
      primary: 'rgba(60, 60, 67, 0.29)', // Standard separator
      opaque: '#C6C6C8',         // Opaque separator
    },
    
    // Control Colors
    control: {
      accent: '#007AFF',         // Control accent
      background: 'rgba(120, 120, 128, 0.16)', // Control background
      border: '#D1D1D6',         // Control borders
    },
  },

  // Apple 8pt Grid Spacing System
  spacing: {
    xxs: 2,    // 0.25x
    xs: 4,     // 0.5x
    sm: 8,     // 1x (base unit)
    md: 12,    // 1.5x
    lg: 16,    // 2x
    xl: 20,    // 2.5x
    xxl: 24,   // 3x
    xxxl: 32,  // 4x
    xxxxl: 40, // 5x
    huge: 48,  // 6x
    massive: 64, // 8x
  },

  // Apple Typography System
  typography: {
    // System Font Sizes (Apple HIG)
    fontSize: {
      caption2: 11,    // Caption 2
      caption1: 12,    // Caption 1
      footnote: 13,    // Footnote
      subheadline: 15, // Subheadline
      callout: 16,     // Callout
      body: 17,        // Body
      headline: 17,    // Headline (bold)
      title3: 20,      // Title 3
      title2: 22,      // Title 2
      title1: 28,      // Title 1
      largeTitle: 34,  // Large Title
      display: 40,     // Display
      hero: 48,        // Hero
    },
    
    // System Font Weights
    fontWeight: {
      ultralight: '100',
      thin: '200',
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      heavy: '800',
      black: '900',
    },
    
    // System Line Heights
    lineHeight: {
      tight: 1.08333,   // Large text
      normal: 1.29412,  // Standard
      relaxed: 1.41176, // Comfortable
    },
    
    // Letter Spacing
    letterSpacing: {
      tight: -0.32,     // Large titles
      normal: 0,        // Standard
      wide: 0.1,        // Slight spacing
      wider: 0.25,      // More emphasis
    },
  },

  // Border Radius System
  radius: {
    none: 0,
    xs: 4,       // Small elements
    sm: 6,       // Buttons
    md: 8,       // Cards
    lg: 10,      // Apple standard large
    xl: 12,      // Prominent containers
    xxl: 16,     // Sheets
    xxxl: 20,    // Large modals
    xxxxl: 24,   // Hero elements
    full: 9999,  // Pills
  },

  // Apple Shadow System
  shadows: {
    none: {
      shadowOpacity: 0,
    },
    xs: {
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 1,
      elevation: 1,
    },
    sm: {
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 6,
    },
    xl: {
      shadowColor: 'rgba(0, 0, 0, 0.25)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 12,
    },
  },

  // Layout System
  layout: {
    // Standard macOS dimensions
    headerHeight: 52,      // Standard header
    toolbarHeight: 44,     // Toolbar height
    sidebarWidth: 280,     // Standard sidebar
    sidebarMinWidth: 200,  // Minimum sidebar
    
    // Button dimensions
    buttonHeight: {
      sm: 28,   // Small buttons
      md: 32,   // Standard buttons  
      lg: 40,   // Large buttons
    },
    
    // Icon sizes
    iconSize: {
      xs: 14,   // Small icons
      sm: 16,   // Standard small
      md: 20,   // Standard medium
      lg: 24,   // Large icons
      xl: 32,   // Extra large
      xxl: 48,  // Hero icons
    },
    
    // Content widths
    contentWidth: {
      sm: 320,    // Small content
      md: 480,    // Medium content
      lg: 640,    // Large content
      xl: 960,    // Extra large
      full: '100%', // Full width
    },
  },
};

// Enhanced utility functions for consistent styling
const createTokenGlassEffect = (opacity = 0.05) => ({
  backgroundColor: `rgba(255,255,255,${opacity})`,
  borderWidth: 1,
  borderColor: DESIGN_TOKENS.colors.border.primary,
  ...DESIGN_TOKENS.shadows.glass,
});

const createButtonStyle = (variant: 'primary' | 'secondary' | 'glass' = 'primary', size: 'sm' | 'md' | 'lg' = 'md') => {
  const baseStyle = {
    borderRadius: DESIGN_TOKENS.radius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: DESIGN_TOKENS.spacing.sm,
    height: DESIGN_TOKENS.layout.buttonHeight[size],
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
  };

  const variants = {
    primary: {
      backgroundColor: DESIGN_TOKENS.colors.interactive.accent,
    },
    secondary: {
      backgroundColor: DESIGN_TOKENS.colors.button.primary,
    },
    glass: createTokenGlassEffect(),
  };

  return { ...baseStyle, ...variants[variant] };
};

// EXPORT DESIGN TOKENS FOR USE IN COMPONENTS
export { COLORS, SPACING, RADIUS, SHADOWS, STREAKS };

// Export enhanced design tokens
export { DESIGN_TOKENS, createTokenGlassEffect, createButtonStyle };

// Export new glassmorphism utilities
export {
    createAppleGlassEffect,
    createChatGlassSheet,
    createVibriantGlow,
    GLASSMORPHISM_STYLES,
    SF_TEXT_STYLES,
    UNIFIED_STYLES
};

// Web-Specific Business Design System
export const WEB_BUSINESS_DESIGN = {
  // Professional Business Color Palette
  colors: {
    // Primary Business Colors
    primary: {
      blue: '#2563EB',           // Professional blue
      indigo: '#4F46E5',         // Trustworthy indigo
      slate: '#475569',          // Professional slate
      gray: '#64748B',           // Business gray
    },
    
    // Accent Colors
    accent: {
      success: '#059669',        // Professional green
      warning: '#D97706',        // Professional orange
      error: '#DC2626',          // Professional red
      info: '#0891B2',           // Professional cyan
    },
    
    // Background System
    background: {
      primary: '#FFFFFF',        // Pure white
      secondary: '#F8FAFC',      // Light gray
      tertiary: '#F1F5F9',      // Medium gray
      card: '#FFFFFF',           // Card background
      sidebar: '#1E293B',        // Dark sidebar
      header: '#FFFFFF',         // Header background
    },
    
    // Text System
    text: {
      primary: '#0F172A',        // Dark primary text
      secondary: '#475569',      // Secondary text
      tertiary: '#64748B',       // Tertiary text
      muted: '#94A3B8',          // Muted text
      inverse: '#FFFFFF',        // White text for dark backgrounds
      link: '#2563EB',           // Link color
    },
    
    // Border System
    border: {
      primary: '#E2E8F0',        // Primary border
      secondary: '#CBD5E1',      // Secondary border
      accent: '#2563EB',         // Accent border
      subtle: '#F1F5F9',         // Subtle border
    },
    
    // Interactive States
    interactive: {
      hover: '#F1F5F9',          // Hover state
      active: '#E2E8F0',         // Active state
      focus: '#DBEAFE',          // Focus state
      disabled: '#F1F5F9',       // Disabled state
    },
  },

  // Web-Optimized Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
    xxxxl: 96,
  },

  // Web Typography Scale
  typography: {
    // Font Sizes
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
      xxxxl: 36,
      display: 48,
      hero: 60,
    },
    
    // Font Weights
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
    
    // Letter Spacing
    letterSpacing: {
      tight: -0.025,
      normal: 0,
      wide: 0.025,
      wider: 0.05,
    },
  },

  // Web Layout Dimensions
  layout: {
    // Container widths
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      xxl: '1536px',
    },
    
    // Header and navigation
    header: {
      height: '64px',
      sidebarWidth: '280px',
      sidebarCollapsed: '80px',
    },
    
    // Content areas
    content: {
      maxWidth: '1200px',
      padding: '24px',
      sidebarGap: '32px',
    },
    
    // Card dimensions
    card: {
      padding: '24px',
      borderRadius: '12px',
      gap: '16px',
    },
  },

  // Web-Specific Shadows
  shadows: {
    none: {
      boxShadow: 'none',
    },
    sm: {
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    md: {
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
    lg: {
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
    xl: {
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
    '2xl': {
      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    },
  },

  // Web Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Web Business Component Styles
export const WEB_BUSINESS_COMPONENTS = {
  // Header Component
  header: {
    container: {
      height: WEB_BUSINESS_DESIGN.layout.header.height,
      backgroundColor: WEB_BUSINESS_DESIGN.colors.background.header,
      borderBottom: `1px solid ${WEB_BUSINESS_DESIGN.colors.border.primary}`,
      paddingHorizontal: WEB_BUSINESS_DESIGN.spacing.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky' as const,
      top: 0,
      zIndex: 1000,
      ...WEB_BUSINESS_DESIGN.shadows.sm,
    },
    logo: {
      fontSize: WEB_BUSINESS_DESIGN.typography.fontSize.xxl,
      fontWeight: WEB_BUSINESS_DESIGN.typography.fontWeight.bold,
      color: WEB_BUSINESS_DESIGN.colors.text.primary,
    },
    navigation: {
      display: 'flex',
      alignItems: 'center',
      gap: WEB_BUSINESS_DESIGN.spacing.lg,
    },
    navItem: {
      padding: `${WEB_BUSINESS_DESIGN.spacing.sm} ${WEB_BUSINESS_DESIGN.spacing.md}`,
      borderRadius: '8px',
      color: WEB_BUSINESS_DESIGN.colors.text.secondary,
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: WEB_BUSINESS_DESIGN.colors.interactive.hover,
        color: WEB_BUSINESS_DESIGN.colors.text.primary,
      },
    },
  },

  // Sidebar Component
  sidebar: {
    container: {
      width: WEB_BUSINESS_DESIGN.layout.header.sidebarWidth,
      backgroundColor: WEB_BUSINESS_DESIGN.colors.background.sidebar,
      height: '100vh',
      position: 'fixed' as const,
      left: 0,
      top: 0,
      padding: WEB_BUSINESS_DESIGN.spacing.lg,
      overflowY: 'auto' as const,
      borderRight: `1px solid ${WEB_BUSINESS_DESIGN.colors.border.primary}`,
      zIndex: 900,
    },
    item: {
      padding: `${WEB_BUSINESS_DESIGN.spacing.md} ${WEB_BUSINESS_DESIGN.spacing.lg}`,
      borderRadius: '8px',
      color: WEB_BUSINESS_DESIGN.colors.text.inverse,
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: WEB_BUSINESS_DESIGN.spacing.md,
      transition: 'all 0.2s ease',
      marginBottom: WEB_BUSINESS_DESIGN.spacing.sm,
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
    activeItem: {
      backgroundColor: WEB_BUSINESS_DESIGN.colors.primary.blue,
      color: WEB_BUSINESS_DESIGN.colors.text.inverse,
    },
  },

  // Card Component
  card: {
    container: {
      backgroundColor: WEB_BUSINESS_DESIGN.colors.background.card,
      borderRadius: WEB_BUSINESS_DESIGN.layout.card.borderRadius,
      padding: WEB_BUSINESS_DESIGN.layout.card.padding,
      border: `1px solid ${WEB_BUSINESS_DESIGN.colors.border.primary}`,
      ...WEB_BUSINESS_DESIGN.shadows.md,
      transition: 'all 0.2s ease',
      '&:hover': {
        ...WEB_BUSINESS_DESIGN.shadows.lg,
        transform: 'translateY(-2px)',
      },
    },
    header: {
      borderBottom: `1px solid ${WEB_BUSINESS_DESIGN.colors.border.subtle}`,
      paddingBottom: WEB_BUSINESS_DESIGN.spacing.md,
      marginBottom: WEB_BUSINESS_DESIGN.spacing.md,
    },
    title: {
      fontSize: WEB_BUSINESS_DESIGN.typography.fontSize.lg,
      fontWeight: WEB_BUSINESS_DESIGN.typography.fontWeight.semibold,
      color: WEB_BUSINESS_DESIGN.colors.text.primary,
      marginBottom: WEB_BUSINESS_DESIGN.spacing.xs,
    },
    subtitle: {
      fontSize: WEB_BUSINESS_DESIGN.typography.fontSize.sm,
      color: WEB_BUSINESS_DESIGN.colors.text.secondary,
    },
  },

  // Button Component
  button: {
    base: {
      padding: `${WEB_BUSINESS_DESIGN.spacing.md} ${WEB_BUSINESS_DESIGN.spacing.lg}`,
      borderRadius: '8px',
      border: 'none',
      fontSize: WEB_BUSINESS_DESIGN.typography.fontSize.md,
      fontWeight: WEB_BUSINESS_DESIGN.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: WEB_BUSINESS_DESIGN.spacing.sm,
      textDecoration: 'none',
    },
    primary: {
      backgroundColor: WEB_BUSINESS_DESIGN.colors.primary.blue,
      color: WEB_BUSINESS_DESIGN.colors.text.inverse,
      '&:hover': {
        backgroundColor: '#1D4ED8',
        transform: 'translateY(-1px)',
        ...WEB_BUSINESS_DESIGN.shadows.md,
      },
    },
    secondary: {
      backgroundColor: WEB_BUSINESS_DESIGN.colors.background.secondary,
      color: WEB_BUSINESS_DESIGN.colors.text.primary,
      border: `1px solid ${WEB_BUSINESS_DESIGN.colors.border.primary}`,
      '&:hover': {
        backgroundColor: WEB_BUSINESS_DESIGN.colors.background.tertiary,
        borderColor: WEB_BUSINESS_DESIGN.colors.border.secondary,
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: WEB_BUSINESS_DESIGN.colors.primary.blue,
      border: `1px solid ${WEB_BUSINESS_DESIGN.colors.primary.blue}`,
      '&:hover': {
        backgroundColor: WEB_BUSINESS_DESIGN.colors.primary.blue,
        color: WEB_BUSINESS_DESIGN.colors.text.inverse,
      },
    },
  },

  // Form Components
  form: {
    input: {
      padding: `${WEB_BUSINESS_DESIGN.spacing.md} ${WEB_BUSINESS_DESIGN.spacing.lg}`,
      borderRadius: '8px',
      border: `1px solid ${WEB_BUSINESS_DESIGN.colors.border.primary}`,
      fontSize: WEB_BUSINESS_DESIGN.typography.fontSize.md,
      backgroundColor: WEB_BUSINESS_DESIGN.colors.background.primary,
      color: WEB_BUSINESS_DESIGN.colors.text.primary,
      transition: 'all 0.2s ease',
      '&:focus': {
        outline: 'none',
        borderColor: WEB_BUSINESS_DESIGN.colors.primary.blue,
        boxShadow: `0 0 0 3px ${WEB_BUSINESS_DESIGN.colors.interactive.focus}`,
      },
      '&:hover': {
        borderColor: WEB_BUSINESS_DESIGN.colors.border.secondary,
      },
    },
    label: {
      fontSize: WEB_BUSINESS_DESIGN.typography.fontSize.sm,
      fontWeight: WEB_BUSINESS_DESIGN.typography.fontWeight.medium,
      color: WEB_BUSINESS_DESIGN.colors.text.primary,
      marginBottom: WEB_BUSINESS_DESIGN.spacing.xs,
      display: 'block',
    },
    error: {
      fontSize: WEB_BUSINESS_DESIGN.typography.fontSize.sm,
      color: WEB_BUSINESS_DESIGN.colors.accent.error,
      marginTop: WEB_BUSINESS_DESIGN.spacing.xs,
    },
  },

  // Table Component
  table: {
    container: {
      width: '100%',
      backgroundColor: WEB_BUSINESS_DESIGN.colors.background.card,
      borderRadius: WEB_BUSINESS_DESIGN.layout.card.borderRadius,
      overflow: 'hidden',
      border: `1px solid ${WEB_BUSINESS_DESIGN.colors.border.primary}`,
      ...WEB_BUSINESS_DESIGN.shadows.sm,
    },
    header: {
      backgroundColor: WEB_BUSINESS_DESIGN.colors.background.secondary,
      borderBottom: `1px solid ${WEB_BUSINESS_DESIGN.colors.border.primary}`,
    },
    headerCell: {
      padding: `${WEB_BUSINESS_DESIGN.spacing.md} ${WEB_BUSINESS_DESIGN.spacing.lg}`,
      fontSize: WEB_BUSINESS_DESIGN.typography.fontSize.sm,
      fontWeight: WEB_BUSINESS_DESIGN.typography.fontWeight.semibold,
      color: WEB_BUSINESS_DESIGN.colors.text.primary,
      textAlign: 'left' as const,
      borderBottom: `1px solid ${WEB_BUSINESS_DESIGN.colors.border.primary}`,
    },
    cell: {
      padding: `${WEB_BUSINESS_DESIGN.spacing.md} ${WEB_BUSINESS_DESIGN.spacing.lg}`,
      fontSize: WEB_BUSINESS_DESIGN.typography.fontSize.md,
      color: WEB_BUSINESS_DESIGN.colors.text.primary,
      borderBottom: `1px solid ${WEB_BUSINESS_DESIGN.colors.border.subtle}`,
    },
    row: {
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: WEB_BUSINESS_DESIGN.colors.interactive.hover,
      },
    },
  },

  // Grid Layout
  grid: {
    container: {
      display: 'grid',
      gap: WEB_BUSINESS_DESIGN.spacing.lg,
    },
    cols1: { gridTemplateColumns: 'repeat(1, 1fr)' },
    cols2: { gridTemplateColumns: 'repeat(2, 1fr)' },
    cols3: { gridTemplateColumns: 'repeat(3, 1fr)' },
    cols4: { gridTemplateColumns: 'repeat(4, 1fr)' },
    cols6: { gridTemplateColumns: 'repeat(6, 1fr)' },
    cols12: { gridTemplateColumns: 'repeat(12, 1fr)' },
  },

  // Responsive Utilities
  responsive: {
    hidden: {
      sm: { display: 'none' },
      md: { display: 'none' },
      lg: { display: 'none' },
      xl: { display: 'none' },
    },
    visible: {
      sm: { display: 'block' },
      md: { display: 'block' },
      lg: { display: 'block' },
      xl: { display: 'block' },
    },
  },
};