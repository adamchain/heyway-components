/**
 * HEYWAY Design System – macOS Tahoe (macOS 15) Design System Updates
 * Liquid-Glass pass: translucent panels, frosted borders, saturated wallpaper accents.
 * (Naming preserved; values updated only.)
 */

// ---------- Base Colors ----------
const BASE_COLORS = {
  // macOS Tahoe system colors (refined)
  white: '#FFFFFF',
  black: '#000000',

  gray: {
    50: '#F7F8FA',
    100: '#F0F2F5',
    200: '#E4E6EB',
    300: '#DADDE1',
    400: '#CCD0D5',
    500: '#BEC3C9',
    600: '#8D949E',
    700: '#606770',
    800: '#444950',
    900: '#1C1E21',
  },

  // Accents (slightly cooler/saturated for glass)
  systemBlue: '#0866FF',
  systemIndigo: '#5B6BFF',
  systemPurple: '#8A39FF',
  systemTeal: '#00C7FF',
  systemCyan: '#12B3FF',
  systemMint: '#00E6A1',
  systemGreen: '#42B72A',
  systemYellow: '#FFBA00',
  systemOrange: '#FF8A00',
  systemPink: '#F35369',
  systemRed: '#F02849',

  // Glass fill ladder (slightly stronger to read on busy wallpapers)
  fill: {
    primary: 'rgba(255,255,255,0.28)',
    secondary: 'rgba(255,255,255,0.22)',
    tertiary: 'rgba(255,255,255,0.16)',
    quaternary: 'rgba(255,255,255,0.10)',
  },

  // Separators tuned for glass (hairline + non-opaque)
  separator: {
    opaque: 'rgba(255,255,255,0.55)',
    nonOpaque: 'rgba(60,60,67,0.24)',
  },

  // Window chrome (kept neutral; content remains bright)
  chrome: {
    controlBackgroundActive: '#FFFFFF',
    controlBackgroundInactive: '#F0F2F5',
    windowBackground: '#F0F2F5',
    sidebarBackground: '#F0F2F5',
    contentBackground: '#fdf9fdff',
  },

  // HeyWay brand colors (preserved)
  brandTeal: '#00C7FF',
  brandBlue: '#0D99FF',
  brandPurple: '#8A39FF',
  brandYellow: '#FFBA00',
  brandCoral: '#FF5C7A',

  // Legacy system colors
  systemBlueDark: '#0051D0',
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF3B30',

  // Overlays (kept, slightly tuned)
  overlay02: 'rgba(0,0,0,0.02)',
  overlay04: 'rgba(0,0,0,0.04)',
  overlay06: 'rgba(0,0,0,0.06)',
  overlay08: 'rgba(0,0,0,0.08)',
  overlay15: 'rgba(0,0,0,0.15)',
  overlay40: 'rgba(0,0,0,0.40)',

  whiteOverlay05: 'rgba(255,255,255,0.05)',
  whiteOverlay15: 'rgba(255,255,255,0.15)',

  // macOS window controls
  macRed: '#FF5F57',
  macRedBorder: '#E2463F',
  macYellow: '#FEBC2E',
  macYellowBorder: '#E29C1B',
  macGreen: '#28C840',
  macGreenBorder: '#229D32',

  // Legacy compatibility
  whatsappGreen: '#30D158',
  whatsappGreenDark: '#248A3D',
  whatsappBlue: '#007AFF',
  whatsappChatGreen: '#F0F9FF',
  whatsappBackground: '#F5F5F7',
};

// ---------- Semantic Colors ----------
export const HEYWAY_COLORS = {
  // Backgrounds (glassified)
  background: {
    primary: BASE_COLORS.chrome.contentBackground, // solid white for text-heavy areas
    secondary: BASE_COLORS.chrome.sidebarBackground, // neutral solid
    tertiary: BASE_COLORS.gray[100],

    window: BASE_COLORS.chrome.windowBackground,
    sidebar: BASE_COLORS.chrome.sidebarBackground,

    // Translucent surfaces for liquid-glass panels/cards
    panel: BASE_COLORS.fill.secondary,     // rgba(255,255,255,0.22)
    card: BASE_COLORS.fill.primary,       // rgba(255,255,255,0.28)
    content: BASE_COLORS.white,

    // overlays
    overlay: 'rgba(0,0,0,0.35)',
    overlayDark: BASE_COLORS.overlay15,

    // States
    hover: 'rgba(255,255,255,0.12)',
    selected: 'rgba(0,122,255,0.10)',
    pressed: 'rgba(255,255,255,0.18)',

    // Legacy + Mail specifics
    sidebarHover: '#e8e8e8',
    sidebarActive: '#dcdcdc',
    whatsappPanel: BASE_COLORS.whatsappBackground,
    whatsappChat: BASE_COLORS.whatsappChatGreen,
    intelligenceSubtle: 'rgba(0,122,255,0.04)',

    macosBg: '#f5f5f7',
    macosSidebar: '#f0f0f2',
    macosHover: '#e8e8e8',
    macosActive: '#dcdcdc',
    macosBorder: '#e0e0e0',
  },

  // Text
  text: {
    primary: BASE_COLORS.gray[800],
    secondary: BASE_COLORS.gray[600],
    tertiary: BASE_COLORS.gray[500],
    quaternary: BASE_COLORS.gray[400],
    placeholder: BASE_COLORS.gray[400],
    disabled: BASE_COLORS.gray[300],
    inverse: BASE_COLORS.white,
    white: BASE_COLORS.white,

    link: BASE_COLORS.systemBlue,
    linkPressed: BASE_COLORS.systemBlueDark,

    whatsappTime: BASE_COLORS.whatsappGreenDark,
    muted: BASE_COLORS.overlay40,
    quote: BASE_COLORS.overlay15,

    macosPrimary: '#1d1d1f',
    macosSecondary: '#86868b',
  },

  // Interactive
  interactive: {
    primary: BASE_COLORS.systemBlue,
    secondary: BASE_COLORS.systemIndigo,
    tertiary: BASE_COLORS.systemTeal,

    hover: 'rgba(0,122,255,0.12)',
    pressed: 'rgba(0,122,255,0.22)',
    disabled: BASE_COLORS.gray[300],

    controlTint: BASE_COLORS.systemBlue,
    controlBackground: BASE_COLORS.chrome.controlBackgroundActive,

    primaryDisabled: BASE_COLORS.gray[400],
    whatsappLight: 'rgba(48,209,88,0.08)',
    whatsappGreen: BASE_COLORS.whatsappGreen,
    whatsappDark: '#1C1C1E',

    macosBlue: '#0071e3',
  },

  // Borders & Separators (frosted)
  border: {
    primary: 'rgba(255,255,255,0.45)', // outer frost edge
    secondary: 'rgba(255,255,255,0.30)',
    tertiary: 'rgba(255,255,255,0.18)',
    hairline: BASE_COLORS.separator.nonOpaque,

    divider: 'rgba(0,0,0,0.06)',
    input: BASE_COLORS.gray[300],
    subtle: 'rgba(255,255,255,0.12)',
  },

  // Status
  status: {
    success: BASE_COLORS.systemGreen,
    warning: BASE_COLORS.systemYellow,
    error: BASE_COLORS.systemRed,
    info: BASE_COLORS.systemBlue,

    online: '#30D158',
    pending: '#FF9F0A',
  },

  // Fill (kept synced to BASE_COLORS.fill ladder)
  fill: {
    primary: BASE_COLORS.fill.primary,
    secondary: BASE_COLORS.fill.secondary,
    tertiary: BASE_COLORS.fill.tertiary,
    quaternary: BASE_COLORS.fill.quaternary,
  },

  // Accents
  accent: {
    success: BASE_COLORS.systemGreen,
    info: BASE_COLORS.systemBlue,
    warning: BASE_COLORS.systemOrange,
    error: BASE_COLORS.systemRed,
  },

  // Legacy aliases
  green: BASE_COLORS.whatsappGreen,
  destructive: BASE_COLORS.error,
  error: BASE_COLORS.error,
  brand: BASE_COLORS.brandTeal,

  // HeyWay brand palette
  brandPalette: {
    teal: BASE_COLORS.brandTeal,
    blue: BASE_COLORS.brandBlue,
    purple: BASE_COLORS.brandPurple,
    yellow: BASE_COLORS.brandYellow,
    coral: BASE_COLORS.brandCoral,
  },

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

// ---------- Typography ----------
export const HEYWAY_TYPOGRAPHY = {
  fontFamily: {
    display: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    text: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    rounded: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',

    primary: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    system: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  },

  fontSize: {
    largeTitle: 34,
    title1: 28,
    title2: 22,
    title3: 20,
    headline: 17,
    body: 17,
    callout: 16,
    subheadline: 15,
    footnote: 13,
    caption1: 12,
    caption2: 11,

    title: { large: 17, medium: 15, small: 13 },
    label: { large: 13, medium: 11, small: 10 },
    caption: { large: 10, medium: 9, small: 8 },
  },

  fontWeight: {
    ultraLight: '100',
    thin: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
    black: '900',
  },

  lineHeight: { tight: 1.1, normal: 1.22, relaxed: 1.4 },

  letterSpacing: {
    tight: -0.3,
    normal: -0.15,
    wide: 0,
  },
};

// ---------- Spacing ----------
export const HEYWAY_SPACING = {
  micro: 2, xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40,
  xxxxl: 40, giant: 48, huge: 64,

  component: {
    padding: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24 },
    margin: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24 },
    gap: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
  },

  layout: {
    windowPadding: 20,
    sidebarPadding: 16,
    contentPadding: 24,
    sectionGap: 32,
  },
};

// ---------- Radius ----------
export const HEYWAY_RADIUS = {
  none: 0, xs: 4, sm: 6, md: 8, lg: 10, xl: 12, xxl: 16, xxxl: 20, full: 9999,
  component: {
    button: 10, input: 10, card: 12, modal: 14, window: 10, sidebar: 8,
    avatar: { sm: 10, md: 14, lg: 18, xl: 22 },
    badge: { sm: 8, md: 9, lg: 10, xl: 12 },
  },
};

// ---------- Shadows ----------
export const HEYWAY_SHADOWS = {
  level1: { shadowColor: '#000', shadowOffset: { width: 0, height: 0.5 }, shadowOpacity: 0.04, shadowRadius: 1.5, elevation: 1 },
  level2: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  level3: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.09, shadowRadius: 6, elevation: 3 },
  level4: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  level5: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 20, elevation: 5 },

  window: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 10 },
  menu: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 20, elevation: 8 },

  light: {
    none: {},
    xs: { shadowColor: '#000', shadowOffset: { width: 0, height: 0.5 }, shadowOpacity: 0.02, shadowRadius: 1, elevation: 1 },
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 2 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
    xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 6 },
  },
  colored: {
    accent: { shadowColor: '#0866FF', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
  },
  dark: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 0.5 }, shadowOpacity: 0.14, shadowRadius: 1, elevation: 1 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.20, shadowRadius: 4, elevation: 3 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.24, shadowRadius: 8, elevation: 5 },
  },
};

// ---------- Layout ----------
export const HEYWAY_LAYOUT = {
  window: {
    minWidth: 800, minHeight: 600, defaultWidth: 1200, defaultHeight: 800,
    titleBarHeight: 28, toolbarHeight: 48,
    width: 980, maxWidth: 980, height: 660,
  },

  sidebar: {
    width: 240, minWidth: 200, maxWidth: 320, padding: 16,
    itemHeight: 28, sectionSpacing: 20,
    backgroundColor: '#f0f0f2',
  },

  content: { padding: 24, maxWidth: 800, columnGap: 32 },

  list: {
    itemHeight: 44, compactItemHeight: 32, sectionHeaderHeight: 28,
    padding: { horizontal: 16, vertical: 8 },
  },

  control: {
    button: { small: 28, medium: 32, large: 40 },
    input: { small: 28, medium: 32, large: 40 },
    searchField: 28, segmentedControl: 28,
  },

  chatList: { width: 260, minWidth: 200, maxWidth: 300, padding: { top: 88, horizontal: 8, bottom: 16 } },
  chatArea: { minWidth: 580, padding: { top: 48 } },
  component: { button: { height: { sm: 28, md: 36, lg: 44 } } },
  avatar: { sm: 32, md: 40, lg: 44 },
  menuButton: { width: 44, height: 44 },
  chatItem: { height: 64 },
  searchInput: { height: 28 },
  inputBar: { height: 48 },
};

// ---------- Accessibility ----------
export const HEYWAY_ACCESSIBILITY = {
  touchTarget: { minimum: 44, comfortable: 48, large: 56 },
  contrast: { aa: 4.5, aaa: 7 },
  animation: { fast: 120, normal: 200, slow: 350 },
};

// ---------- macOS Patterns ----------
export const HEYWAY_MACOS_PATTERNS = {
  windowControls: { size: 12, gap: 8, position: { left: 8, top: 8 } },
  titleBar: {
    height: 48,
    backgroundColor: HEYWAY_COLORS.background.panel, // subtle glass titlebar
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.subtle,
  },
};

// ---------- Chat Patterns ----------
export const HEYWAY_CHAT_PATTERNS = {
  bubble: {
    minWidth: 80, maxWidth: 340, borderRadius: 14,
    padding: { vertical: 8, horizontal: 12 },
    tail: { width: 12, height: 16, offset: -6 },
  },
  avatar: {
    border: { width: 0.5, color: BASE_COLORS.gray[200] },
    update: { borderWidth: 1.5, borderColor: BASE_COLORS.success },
  },
  badge: { minWidth: 16, height: 16, borderRadius: 8, padding: { vertical: 0, horizontal: 3 } },
  timestamp: { fontSize: 10, fontWeight: '500', color: BASE_COLORS.gray[500] },
  checkmark: { size: 16, color: BASE_COLORS.systemBlue },
};

// ---------- Component Tokens ----------
export const HEYWAY_COMPONENTS = {
  // Sidebar (kept solid, Mail-like)
  sidebar: {
    background: HEYWAY_COLORS.background.sidebar,
    border: HEYWAY_COLORS.border.hairline,
    borderRadius: 0,

    item: {
      height: HEYWAY_LAYOUT.sidebar.itemHeight,
      padding: { horizontal: 16, vertical: 4 },
      borderRadius: 0,

      default: { background: 'transparent' },
      hover: { background: HEYWAY_COLORS.background.hover },
      active: { background: HEYWAY_COLORS.background.selected },

      text: {
        fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
        fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
        color: HEYWAY_COLORS.text.primary,
      },

      icon: { size: 16, color: HEYWAY_COLORS.text.secondary },
    },

    section: {
      header: {
        height: 28,
        padding: { horizontal: 16, vertical: 4 },
        text: {
          fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption1,
          fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
          color: HEYWAY_COLORS.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      },
    },
  },

  // List items
  listItem: {
    height: HEYWAY_LAYOUT.list.itemHeight,
    padding: HEYWAY_LAYOUT.list.padding,
    borderBottom: `0.5px solid ${HEYWAY_COLORS.border.hairline}`,

    default: { background: 'transparent' },
    hover: { background: HEYWAY_COLORS.background.hover },
    selected: { background: HEYWAY_COLORS.background.selected },

    title: {
      fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
      fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
      color: HEYWAY_COLORS.text.primary,
      letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },

    subtitle: {
      fontSize: HEYWAY_TYPOGRAPHY.fontSize.footnote,
      color: HEYWAY_COLORS.text.secondary,
      letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    },

    metadata: {
      fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption1,
      color: HEYWAY_COLORS.text.tertiary,
    },
  },

  // Buttons
  button: {
    primary: {
      background: HEYWAY_COLORS.interactive.primary,
      color: HEYWAY_COLORS.text.inverse,
      borderRadius: HEYWAY_RADIUS.component.button,
      padding: { horizontal: 16, vertical: 6 },
      fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
      fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
      shadow: HEYWAY_SHADOWS.level2,
    },

    secondary: {
      background: HEYWAY_COLORS.fill.quaternary,
      color: HEYWAY_COLORS.text.primary,
      borderRadius: HEYWAY_RADIUS.component.button,
      padding: { horizontal: 16, vertical: 6 },
      fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
      fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
      border: `0.5px solid ${HEYWAY_COLORS.border.secondary}`,
    },

    toolbar: {
      background: 'transparent',
      color: HEYWAY_COLORS.text.secondary,
      borderRadius: HEYWAY_RADIUS.sm,
      padding: { horizontal: 8, vertical: 6 },
      fontSize: HEYWAY_TYPOGRAPHY.fontSize.footnote,
      fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    },
  },

  // Input fields (glass border ring on focus)
  input: {
    background: HEYWAY_COLORS.background.card,
    border: `1px solid ${HEYWAY_COLORS.border.secondary}`,
    borderRadius: HEYWAY_RADIUS.component.input,
    padding: { horizontal: 12, vertical: 8 },
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    color: HEYWAY_COLORS.text.primary,
    placeholderColor: HEYWAY_COLORS.text.placeholder,

    focus: {
      borderColor: HEYWAY_COLORS.interactive.primary,
      shadow: `0 0 0 3px ${HEYWAY_COLORS.interactive.primary}20`,
    },
  },

  searchField: {
    background: HEYWAY_COLORS.fill.quaternary,
    border: 'none',
    borderRadius: HEYWAY_RADIUS.component.input,
    height: HEYWAY_LAYOUT.control.searchField,
    padding: { horizontal: 12, vertical: 6 },
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    color: HEYWAY_COLORS.text.primary,
    placeholderColor: HEYWAY_COLORS.text.tertiary,
  },

  // Legacy compatibility
  chatItem: {
    default: { backgroundColor: 'transparent', borderRadius: 6 },
    hover: { backgroundColor: BASE_COLORS.overlay02 },
    selected: { backgroundColor: 'rgba(0,122,255,0.06)' },
  },

  sidebarItem: {
    default: { backgroundColor: 'transparent', borderRadius: 0, padding: { vertical: 8, horizontal: 16 } },
    hover: { backgroundColor: '#e8e8e8' },
    active: { backgroundColor: '#dcdcdc' },
    icon: { width: 20, color: '#86868b', marginRight: 8 },
    text: { fontSize: 14, color: '#1d1d1f' },
    badge: {
      backgroundColor: '#0071e3', color: '#ffffff',
      borderRadius: 20, minWidth: 20, height: 20, fontSize: 12, padding: { horizontal: 6, vertical: 2 }
    }
  },

  analysisTag: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    borderColor: 'rgba(0, 113, 227, 0.2)',
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    text: { fontSize: 10, fontWeight: '500', color: '#0071e3' }
  },

  sidebarComposeButton: {
    width: '100%',
    backgroundColor: '#0071e3', color: '#ffffff',
    borderRadius: 6, padding: { vertical: 6, horizontal: 12 },
    fontSize: 14, fontWeight: '500', marginBottom: 16
  },

  menuButton: {
    default: { backgroundColor: 'transparent', borderRadius: 6 },
    active: { backgroundColor: BASE_COLORS.overlay04 },
    badge: { backgroundColor: BASE_COLORS.systemBlue, color: '#FFFFFF' },
  },

  search: {
    backgroundColor: BASE_COLORS.gray[100],
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 8,
    height: 28,
    padding: { vertical: 6, horizontal: 8 },
  },
};

// ---------- Animations ----------
export const HEYWAY_ANIMATIONS = {
  timing: { micro: 100, fast: 150, normal: 250, slow: 350, slowest: 500 },
  easing: {
    standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    emphasized: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    default: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  interaction: {
    hover: { duration: 150, scale: 0.98 },
    press: { duration: 100, scale: 0.95 },
    focus: { duration: 200 },
  },
  interactions: {
    hover: { duration: 120, scale: 0.98 },
    tap: { duration: 80, scale: 0.96 },
    focus: { duration: 150 },
  },
};

// ---------- Breakpoints ----------
export const HEYWAY_BREAKPOINTS = { mobile: 768, tablet: 1024, desktop: 1200, wide: 1440 };

// ---------- Default Export ----------
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
