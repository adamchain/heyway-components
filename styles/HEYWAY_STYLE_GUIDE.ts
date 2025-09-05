/**
 * HEYWAY Design System – Modern Minimalist UI
 * Apple + Facebook inspired design system for premium feel
 * Focus: Clean, sharp, minimal, high contrast
 */

// ---------- Modern Base Colors ----------
const BASE_COLORS = {
  // Pure foundations
  white: '#FFFFFF',
  black: '#1C1C1E',

  // Refined gray scale - more contrast for sharpness
  gray: {
    50: '#FAFAFA',    // Pure backgrounds
    100: '#F5F5F5',   // Card backgrounds
    200: '#EEEEEE',   // Subtle borders
    300: '#E0E0E0',   // Borders
    400: '#BDBDBD',   // Disabled text
    500: '#9E9E9E',   // Secondary text
    600: '#757575',   // Icons
    700: '#424242',   // Primary text
    800: '#212121',   // Headers
    900: '#000000',   // High emphasis
  },

  // System colors - iOS inspired
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemOrange: '#FF9500',
  systemRed: '#FF3B30',
  systemPurple: '#AF52DE',
  systemPink: '#FF2D92',
  systemTeal: '#5AC8FA',
  systemIndigo: '#5856D6',
  systemYellow: '#FFCC00',

  // HeyWay brand (refined)
  brand: '#007AFF',
  brandDark: '#0051D0',
  accent: '#34C759',

  // Overlays
  overlay: 'rgba(0,0,0,0.4)',
  lightOverlay: 'rgba(0,0,0,0.1)',
  cardOverlay: 'rgba(255,255,255,0.95)',
};

// ---------- Modern Semantic Colors ----------
export const HEYWAY_COLORS = {
  // Clean backgrounds
  background: {
    primary: BASE_COLORS.white,           // Main content areas
    secondary: BASE_COLORS.gray[50],      // Secondary surfaces
    tertiary: BASE_COLORS.gray[100],      // Subtle backgrounds
    
    // Overlays
    overlay: BASE_COLORS.overlay,
    card: BASE_COLORS.cardOverlay,
    
    // States
    hover: BASE_COLORS.gray[100],
    active: BASE_COLORS.gray[200],
    selected: 'rgba(0,122,255,0.12)',
    
    // Legacy support
    panel: BASE_COLORS.white,
    content: BASE_COLORS.white,
    sidebar: BASE_COLORS.gray[50],
  },

  // High contrast text
  text: {
    primary: BASE_COLORS.gray[900],       // High contrast
    secondary: BASE_COLORS.gray[600],     // Medium contrast
    tertiary: BASE_COLORS.gray[500],      // Low contrast
    placeholder: BASE_COLORS.gray[400],   // Form placeholders
    disabled: BASE_COLORS.gray[300],      // Disabled states
    inverse: BASE_COLORS.white,
  },

  // Clean interactive states
  interactive: {
    primary: BASE_COLORS.systemBlue,
    hover: BASE_COLORS.gray[100],
    active: BASE_COLORS.gray[200],
    disabled: BASE_COLORS.gray[300],
    focus: 'rgba(0,122,255,0.2)',
  },

  // Minimal borders
  border: {
    primary: BASE_COLORS.gray[200],       // Main borders
    secondary: BASE_COLORS.gray[100],     // Subtle separators
    focus: BASE_COLORS.systemBlue,        // Focus rings
  },

  // Clear status colors
  status: {
    success: BASE_COLORS.systemGreen,
    warning: BASE_COLORS.systemOrange,
    error: BASE_COLORS.systemRed,
    info: BASE_COLORS.systemBlue,
  },
};

// ---------- Clean Typography ----------
export const HEYWAY_TYPOGRAPHY = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
    mono: 'ui-monospace, "SF Mono", Consolas, monospace',
  },

  fontSize: {
    // iOS-inspired hierarchy
    largeTitle: 32,
    title1: 24,
    title2: 20,
    title3: 18,
    headline: 16,
    body: 16,
    callout: 15,
    subheadline: 14,
    footnote: 12,
    caption: 11,
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: { 
    tight: 1.2, 
    normal: 1.4, 
    relaxed: 1.6 
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// ---------- Precise Spacing ----------
export const HEYWAY_SPACING = {
  // 8-point grid system
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
  giant: 48,
};

// ---------- Sharp Radius ----------
export const HEYWAY_RADIUS = {
  // Minimal, sharp radii
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

// ---------- Subtle Shadows ----------
export const HEYWAY_SHADOWS = {
  // Minimal shadow system
  none: {},
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
};

// ---------- Clean Layout ----------
export const HEYWAY_LAYOUT = {
  window: {
    minWidth: 360,
    defaultWidth: 1024,
    maxWidth: 1440,
    headerHeight: 60,
    tabHeight: 48,
  },
  
  sidebar: {
    width: 280,
    minWidth: 240,
    maxWidth: 320,
  },
  
  content: {
    maxWidth: 800,
    padding: HEYWAY_SPACING.xxl,
  },
  
  touchTarget: {
    minimum: 44,
    comfortable: 48,
  },
};

// ---------- Accessibility ----------
export const HEYWAY_ACCESSIBILITY = {
  touchTarget: {
    minimum: 44,
    comfortable: 48,
  },
  contrast: {
    aa: 4.5,
    aaa: 7.0,
  },
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
};

    minWidth: 360,
    maxWidth: 1440,
    headerHeight: HEYWAY_LAYOUT.window.headerHeight,
  },
  
  sidebar: {
    width: 280,
    itemHeight: 48,
  },
  
  list: {
    itemHeight: 56,
    sectionHeaderHeight: 32,
  },
};

// ---------- Component Styles ----------
export const HEYWAY_COMPONENTS = {
  button: {
    primary: {
      backgroundColor: HEYWAY_COLORS.interactive.primary,
      borderRadius: HEYWAY_RADIUS.md,
      paddingVertical: HEYWAY_SPACING.md,
      paddingHorizontal: HEYWAY_SPACING.lg,
      minHeight: HEYWAY_LAYOUT.touchTarget.minimum,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    
    secondary: {
      backgroundColor: HEYWAY_COLORS.background.secondary,
      borderRadius: HEYWAY_RADIUS.md,
      paddingVertical: HEYWAY_SPACING.md,
      paddingHorizontal: HEYWAY_SPACING.lg,
      borderWidth: 1,
      borderColor: HEYWAY_COLORS.border.primary,
      minHeight: HEYWAY_LAYOUT.touchTarget.minimum,
    },
  },
  
  card: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.lg,
    padding: HEYWAY_SPACING.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  input: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    color: HEYWAY_COLORS.text.primary,
  },
};

// ---------- Breakpoints ----------
export const HEYWAY_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

// ---------- Export All ----------
export default {
  HEYWAY_COLORS,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_SPACING,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
  HEYWAY_LAYOUT,
  HEYWAY_ACCESSIBILITY,
  HEYWAY_COMPONENTS,
  HEYWAY_BREAKPOINTS,
};
