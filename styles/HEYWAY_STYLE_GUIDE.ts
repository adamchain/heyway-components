/**
 * HEYWAY Design System - WhatsApp-Inspired Style Guide
 * 
 * Extracted from raw CSS and converted to structured design tokens
 * for consistent, maintainable styling across the application.
 */

// Base color palette extracted from raw CSS
const BASE_COLORS = {
    // Primary colors from design
    white: '#FFFFFF',
    gray: {
        50: '#F7F7F6',
        100: '#F1F1F1',
        200: '#E5E5E5',
        300: '#DCDCDC',
        400: '#CDCDCD',
        500: '#808080',
        600: '#666666',
        700: '#494950',
        800: '#272727',
        900: '#000000',
    },

    // WhatsApp-inspired accents
    whatsappGreen: '#24D366',
    whatsappGreenDark: '#1FA755',
    whatsappBlue: '#43B4FF',
    whatsappChatGreen: '#E1FFD4',
    whatsappBackground: '#F0E9DF',

    // macOS window controls
    macRed: '#FF5F57',
    macRedBorder: '#E34239',
    macYellow: '#FEBC2E',
    macYellowBorder: '#E19D1A',
    macGreen: '#28C840',
    macGreenBorder: '#1CA926',

    // Status colors
    error: '#FF3B2F',
    warning: '#D82928',
    success: '#05A884',

    // Transparency layers
    blackOverlay04: 'rgba(0, 0, 0, 0.04)',
    blackOverlay06: 'rgba(0, 0, 0, 0.06)',
    blackOverlay08: 'rgba(0, 0, 0, 0.08)',
    blackOverlay20: 'rgba(0, 0, 0, 0.2)',
    blackOverlay50: 'rgba(0, 0, 0, 0.5)',
    blackOverlay60: 'rgba(0, 0, 0, 0.6)',
    blackOverlay68: 'rgba(0, 0, 0, 0.68)',

    whiteOverlay10: 'rgba(255, 255, 255, 0.1)',
    whiteOverlay20: 'rgba(255, 255, 255, 0.2)',
};

// Semantic color system
export const HEYWAY_COLORS = {
    // Background colors
    background: {
        primary: BASE_COLORS.white,
        secondary: BASE_COLORS.gray[100],
        tertiary: BASE_COLORS.gray[50],
        content: BASE_COLORS.white,
        card: BASE_COLORS.white,
        panel: BASE_COLORS.gray[50],
        whatsappPanel: BASE_COLORS.whatsappBackground,
        whatsappChat: BASE_COLORS.whatsappChatGreen,
        intelligenceSubtle: 'rgba(36, 211, 102, 0.05)', // Very subtle green wash
        overlay: BASE_COLORS.blackOverlay20,
        overlayDark: BASE_COLORS.blackOverlay60,
    },

    // Text colors
    text: {
        primary: BASE_COLORS.gray[800],
        secondary: BASE_COLORS.gray[500],
        tertiary: BASE_COLORS.gray[600],
        inverse: BASE_COLORS.white,
        white: BASE_COLORS.white,
        whatsappTime: BASE_COLORS.whatsappGreenDark,
        muted: BASE_COLORS.blackOverlay50,
        quote: BASE_COLORS.blackOverlay68,
    },

    // Interactive elements
    interactive: {
        primary: BASE_COLORS.whatsappBlue,
        secondary: BASE_COLORS.gray[100],
        hover: BASE_COLORS.blackOverlay04,
        selected: BASE_COLORS.blackOverlay06,
        focus: BASE_COLORS.whatsappGreen,
        disabled: BASE_COLORS.gray[300],
        primaryDisabled: BASE_COLORS.gray[400],
        whatsappLight: 'rgba(36, 211, 102, 0.1)',
        whatsappGreen: BASE_COLORS.whatsappGreen,
        whatsappDark: '#0B141A', // Dark WhatsApp header
    },

    // Border colors
    border: {
        primary: BASE_COLORS.gray[300],
        secondary: BASE_COLORS.gray[300],
        tertiary: BASE_COLORS.gray[200],
        divider: BASE_COLORS.gray[200],
        input: BASE_COLORS.gray[400],
        subtle: 'rgba(0, 0, 0, 0.1)',
    },

    // Status colors
    status: {
        success: BASE_COLORS.success,
        online: '#34C759',
        pending: '#FF9500',
        warning: BASE_COLORS.warning,
        error: BASE_COLORS.error,
    },

    // Accent colors
    accent: {
        success: BASE_COLORS.whatsappGreen,
        info: BASE_COLORS.whatsappBlue,
        warning: BASE_COLORS.macYellow,
        error: BASE_COLORS.error,
    },

    // Legacy color aliases for backward compatibility
    // Note: Do not use a key named 'accent' here because 'accent' above is the structured object
    green: BASE_COLORS.whatsappGreen,
    destructive: BASE_COLORS.error,
    error: BASE_COLORS.error,
    brand: BASE_COLORS.whatsappBlue,

    // macOS window controls
    macOS: {
        red: BASE_COLORS.macRed,
        redBorder: BASE_COLORS.macRedBorder,
        yellow: BASE_COLORS.macYellow,
        yellowBorder: BASE_COLORS.macYellowBorder,
        green: BASE_COLORS.macGreen,
        greenBorder: BASE_COLORS.macGreenBorder,
    },
};

// Typography system based on SF Pro Text from raw CSS
export const HEYWAY_TYPOGRAPHY = {
    fontFamily: {
        primary: 'SF Pro Text',
        system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },

    fontSize: {
        // Title hierarchy
        title: {
            large: 17, // Title 1 - Bold
            medium: 14, // Title 2 - Semibold/Bold  
            small: 13,  // Title 2 - Semibold
        },

        // Body text hierarchy  
        body: {
            large: 13,  // Body 1 - Medium/Messages
            medium: 13, // Body 1 - Regular
            small: 12,  // Body 2 - Medium/Regular
        },

        // UI labels
        label: {
            large: 14,  // Menu labels
            medium: 13, // Input labels
            small: 12,  // Secondary labels
        },

        // Caption text
        caption: {
            large: 11,  // Body 3 - Medium (time stamps)
            medium: 10, // Body 4 - Regular (encryption notice)
            small: 9,   // Smallest text
        },
    },

    fontWeight: {
        // Use string literal weights to align with React Native's FontWeight type
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    } as const,

    lineHeight: {
        tight: 1.2,    // 120% for headings
        normal: 1.3,   // 130% for body
        relaxed: 1.5,  // 150% for reading
    },

    letterSpacing: {
        tight: -0.03,   // Tight spacing for titles

        normal: -0.02,  // Normal spacing for body
        wide: -0.01,    // Wide spacing for labels
    },
};

// Spacing system based on 8px grid
export const HEYWAY_SPACING = {
    micro: 2,  // 0.25 * base
    xs: 4,     // 0.5 * base
    sm: 8,     // 1 * base  
    md: 12,    // 1.5 * base
    lg: 16,    // 2 * base
    xl: 20,    // 2.5 * base
    xxl: 24,   // 3 * base
    xxxl: 32,  // 4 * base
    xxxxl: 40, // 5 * base
    giant: 48, // 6 * base
    huge: 64,  // 8 * base

    // Semantic spacing from raw CSS
    component: {
        padding: {
            xs: 4,
            sm: 8,
            md: 10,
            lg: 16,
            xl: 20,
        },
        gap: {
            xs: 2,
            sm: 4,
            md: 8,
            lg: 12,
            xl: 16,
        },
        margin: {
            xs: 4,
            sm: 8,
            md: 10,
            lg: 16,
            xl: 20,
        },
    },
};

// Border radius system
export const HEYWAY_RADIUS = {
    xs: 4,
    sm: 6,    // Standard component radius
    md: 8,    // Card radius
    lg: 10,   // Large card radius  
    xl: 12,   // Message bubble radius
    xxl: 16,  // Large container radius
    xxxl: 28, // Avatar radius
    full: 9999, // Fully rounded

    component: {
        button: {
            sm: 4,
            md: 6,
            lg: 8,
            xl: 12,
            full: 9999,
            pill: 20,
        },
        card: {
            sm: 6,
            md: 8,
            lg: 10,
            xl: 12,
            xxl: 16,
        },
        input: {
            sm: 4,
            md: 6,
            lg: 8,
            xl: 16, // Rounded input fields
        },
        avatar: {
            sm: 14,
            md: 18,
            lg: 24,
            xl: 28,
        },
        badge: {
            sm: 8,
            md: 9,
            lg: 13,
            xl: 16,
        },
        modal: {
            sm: 8,
            md: 12,
            lg: 16,
            xl: 20,
        },
    },
};

// Shadow system from raw CSS - complex multi-layer shadows
export const HEYWAY_SHADOWS = {
    light: {
        none: {},
        xs: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 1,
        },
        sm: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        md: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
        },
        xl: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.25,
            shadowRadius: 24,
            elevation: 12,
        },
    },

    colored: {
        accent: {
            shadowColor: BASE_COLORS.whatsappBlue,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
        },
    },

    dark: {
        sm: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 2,
        },
        md: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 8,
        },
    },

    // Windows-style shadow from raw CSS
    windows: {
        main: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.6,
            shadowRadius: 50,
            elevation: 20,
        },
    },

    // Message bubble drop shadows
    balloon: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
        elevation: 1,
    },
};

// Layout constants from raw CSS
export const HEYWAY_LAYOUT = {
    // Main container dimensions
    window: {
        width: 1000,
        minWidth: 789,
        maxWidth: 1000,
        height: 680,
        minHeight: 480,
    },

    // Sidebar dimensions
    sidebar: {
        width: 68,
        padding: {
            top: 44,
            horizontal: 10,
            bottom: 10,
        },
    },

    // Chat list panel
    chatList: {
        width: 314,
        minWidth: 241,
        maxWidth: 314,
        padding: {
            top: 92,
            horizontal: 11,
            bottom: 20,
        },
    },

    // Main chat area
    chatArea: {
        minWidth: 480,
        padding: {
            top: 52,
        },
    },

    // Component dimensions
    component: {
        button: {
            height: {
                sm: 32,
                md: 44,
                lg: 48,
            },
        },
    },

    avatar: {
        sm: 36,
        md: 45,
        lg: 48,
    },

    menuButton: {
        width: 48,
        height: 48,
    },

    chatItem: {
        height: 68.5,
    },

    searchInput: {
        height: 32,
    },

    inputBar: {
        height: 52,
    },
};

// Accessibility and interaction patterns
export const HEYWAY_ACCESSIBILITY = {
    touchTarget: {
        minimum: 44,
        comfortable: 48,
        large: 56,
    },

    contrast: {
        aa: 4.5,
        aaa: 7,
    },

    animation: {
        fast: 150,
        normal: 250,
        slow: 400,
    },
};

// macOS window patterns
export const HEYWAY_MACOS_PATTERNS = {
    windowControls: {
        size: 12,
        gap: 8,
        position: {
            left: 8,
            top: 8,
        },
    },

    titleBar: {
        height: 52,
        backgroundColor: HEYWAY_COLORS.background.primary,
        borderBottomWidth: 0.5,
        borderBottomColor: HEYWAY_COLORS.border.secondary,
    },
};

// Chat-specific patterns extracted from raw CSS
export const HEYWAY_CHAT_PATTERNS = {
    bubble: {
        minWidth: 84,
        maxWidth: 360,
        borderRadius: 12,
        padding: {
            vertical: 6,
            horizontal: 10,
        },
        tail: {
            width: 14.5,
            height: 20,
            offset: -6.5,
        },
    },

    avatar: {
        border: {
            width: 0.4,
            color: BASE_COLORS.blackOverlay20,
        },
        update: {
            borderWidth: 2,
            borderColor: BASE_COLORS.success,
        },
    },

    badge: {
        minWidth: 17,
        height: 17,
        borderRadius: 9,
        padding: {
            vertical: 1,
            horizontal: 4,
        },
    },

    timestamp: {
        fontSize: 11,
        fontWeight: '500',
        color: BASE_COLORS.blackOverlay50,
    },

    checkmark: {
        size: 17,
        color: BASE_COLORS.whatsappBlue,
    },
};

// Component-specific style utilities
export const HEYWAY_COMPONENTS = {
    // Chat list item states
    chatItem: {
        default: {
            backgroundColor: 'transparent',
            borderRadius: 6,
        },
        hover: {
            backgroundColor: HEYWAY_COLORS.interactive.hover,
        },
        selected: {
            backgroundColor: HEYWAY_COLORS.interactive.selected,
        },
    },

    // Menu button states
    menuButton: {
        default: {
            backgroundColor: 'transparent',
            borderRadius: 6,
        },
        active: {
            backgroundColor: HEYWAY_COLORS.interactive.selected,
        },
        badge: {
            backgroundColor: HEYWAY_COLORS.accent.success,
            color: HEYWAY_COLORS.text.inverse,
        },
    },

    // Input field styles
    input: {
        default: {
            backgroundColor: HEYWAY_COLORS.background.primary,
            borderColor: HEYWAY_COLORS.border.input,
            borderWidth: 0.5,
            borderRadius: 16,
            padding: {
                vertical: 8,
                horizontal: 12,
            },
        },
        focus: {
            borderColor: HEYWAY_COLORS.interactive.focus,
        },
    },

    // Search field
    search: {
        backgroundColor: HEYWAY_COLORS.background.primary,
        borderColor: HEYWAY_COLORS.border.secondary,
        borderWidth: 1,
        borderRadius: 6,
        height: 32,
        padding: {
            vertical: 8,
            horizontal: 7,
        },
    },
};

// Animation and transition values
export const HEYWAY_ANIMATIONS = {
    timing: {
        fast: 150,
        normal: 250,
        slow: 400,
    },

    easing: {
        default: 'ease-out',
        bounce: 'spring',
        smooth: 'ease-in-out',
    },

    // Hover and interaction animations
    interactions: {
        hover: {
            duration: 150,
            scale: 0.98,
        },
        tap: {
            duration: 100,
            scale: 0.95,
        },
        focus: {
            duration: 200,
        },
    },
};

// Layout grid and breakpoints
export const HEYWAY_BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
    wide: 1440,
};

// Default export with all style guide components
export default {
    HEYWAY_COLORS,
    HEYWAY_TYPOGRAPHY,
    HEYWAY_SPACING,
    HEYWAY_RADIUS,
    HEYWAY_SHADOWS,
    HEYWAY_LAYOUT,
    HEYWAY_ACCESSIBILITY,
    HEYWAY_MACOS_PATTERNS,
    HEYWAY_CHAT_PATTERNS,
    HEYWAY_COMPONENTS,
    HEYWAY_ANIMATIONS,
    HEYWAY_BREAKPOINTS,

};