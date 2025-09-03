// HEYWAY iOS 26 Modern Design System
// Inspired by iOS 26, Apple Intelligence, and contemporary mobile design

export const HEYWAY_COLORS = {
  // iOS 26 Dynamic System Colors
  accent: '#007AFF',              // iOS system blue
  accentHover: '#0051D0',         // Enhanced hover state
  accentPressed: '#003D99',       // Deeper pressed state
  accentTint: 'rgba(0, 122, 255, 0.12)', // Subtle accent tint

  // iOS 26 Semantic Colors
  primary: '#007AFF',             // Primary brand
  secondary: '#5856D6',           // iOS system purple
  tertiary: '#AF52DE',            // iOS system violet
  quaternary: '#FF2D92',          // iOS system pink

  // iOS 26 Dynamic Backgrounds
  background: {
    primary: '#FFFFFF',           // Pure white
    secondary: '#F8F9FA',         // Ultra-subtle gray
    tertiary: '#F2F2F7',         // iOS grouped background
    elevated: '#FFFFFF',          // Cards and overlays
    elevatedSecondary: '#FAFAFA', // Slightly elevated
    glass: 'rgba(255, 255, 255, 0.85)', // Enhanced glass
    ultraThin: 'rgba(255, 255, 255, 0.95)', // Ultra-thin material
    thick: 'rgba(255, 255, 255, 0.75)',     // Thick material
    
    // iOS 26 Contextual backgrounds
    sidebar: '#F5F5F7',           // Sidebar background
    toolbar: '#FAFAFA',           // Toolbar background  
    panel: '#F8F9FA',             // Panel background
    content: '#FFFFFF',           // Main content
    overlay: 'rgba(0, 0, 0, 0.45)', // Modal overlays
    
    // iOS 26 Dynamic gradients
    dynamicGradient: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 40%, rgba(0, 122, 255, 0.02) 100%)',
    intelligenceGradient: 'linear-gradient(145deg, rgba(0, 122, 255, 0.05) 0%, rgba(88, 86, 214, 0.03) 50%, rgba(175, 82, 222, 0.02) 100%)',
    heroGradient: 'linear-gradient(180deg, #FFFFFF 0%, rgba(248, 249, 250, 0.8) 100%)',
    
    // iOS 26 Glow effects
    primaryGlow: 'radial-gradient(circle at center, rgba(0, 122, 255, 0.06) 0%, transparent 60%)',
    accentGlow: 'radial-gradient(circle at center, rgba(0, 122, 255, 0.08) 0%, rgba(88, 86, 214, 0.04) 40%, transparent 70%)'
  },

  // iOS 26 Enhanced Text Hierarchy
  text: {
    primary: '#1D1D1F',           // Enhanced primary text
    secondary: '#6E6E73',         // Refined secondary
    tertiary: '#8E8E93',          // iOS tertiary
    quaternary: '#AEAEB2',        // iOS quaternary
    placeholder: '#C7C7CC',       // Placeholder text
    disabled: '#D1D1D6',          // Disabled state
    inverse: '#FFFFFF',           // White text
    onAccent: '#FFFFFF',          // Text on accent colors
    
    // iOS 26 Interactive text
    link: '#007AFF',              // Links
    linkHover: '#0051D0',         // Link hover
    linkActive: '#003D99',        // Link active
    
    // iOS 26 Status text colors
    success: '#32D74B',           // iOS green
    warning: '#FF9500',           // iOS orange  
    error: '#FF3B30',             // iOS red
    info: '#007AFF',              // iOS blue
    neutral: '#8E8E93'            // Neutral status
  },

  // iOS 26 Interactive Elements
  interactive: {
    primary: '#007AFF',           // Primary buttons
    primaryHover: '#0051D0',      // Primary hover
    primaryActive: '#003D99',     // Primary active
    primaryDisabled: '#B3D9FF',   // Primary disabled
    
    secondary: '#F2F2F7',         // Secondary buttons
    secondaryHover: '#E5E5EA',    // Secondary hover
    secondaryActive: '#D1D1D6',   // Secondary active
    
    tertiary: 'transparent',      // Ghost buttons
    tertiaryHover: 'rgba(0, 122, 255, 0.08)',
    tertiaryActive: 'rgba(0, 122, 255, 0.12)',
    
    // iOS 26 Special interactive states
    focus: '#007AFF',             // Focus ring
    selection: 'rgba(0, 122, 255, 0.15)', // Selection highlight
    highlight: 'rgba(0, 122, 255, 0.08)', // Hover highlight
    
    // iOS 26 Dynamic interactive gradients
    dynamicPrimary: 'linear-gradient(135deg, #007AFF 0%, #0051D0 100%)',
    dynamicSecondary: 'linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)',
    intelligenceGradient: 'linear-gradient(135deg, #007AFF 0%, #5856D6 50%, #AF52DE 100%)'
  },

  // iOS 26 Modern Border System
  border: {
    primary: '#D1D1D6',           // Strong borders
    secondary: '#E5E5EA',         // Medium borders
    tertiary: '#F2F2F7',         // Subtle borders
    quaternary: '#F8F9FA',        // Ultra-subtle borders
    
    divider: '#E5E5EA',           // Content dividers
    separator: '#F2F2F7',         // List separators
    
    focus: '#007AFF',             // Focus borders
    error: '#FF3B30',             // Error borders
    success: '#32D74B',           // Success borders
    warning: '#FF9500',           // Warning borders
    
    // iOS 26 Dynamic borders
    dynamic: 'linear-gradient(135deg, rgba(0, 122, 255, 0.2) 0%, rgba(88, 86, 214, 0.1) 100%)',
    intelligenceBorder: 'linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(88, 86, 214, 0.15) 50%, rgba(175, 82, 222, 0.15) 100%)'
  },

  // iOS 26 Status & Feedback Colors
  status: {
    success: '#32D74B',           // Success green
    successLight: '#E8F8EA',      // Success background
    successDark: '#28CD41',       // Success dark variant
    
    warning: '#FF9500',           // Warning orange
    warningLight: '#FFF4E6',      // Warning background
    warningDark: '#FF8000',       // Warning dark variant
    
    error: '#FF3B30',             // Error red
    errorLight: '#FFEBEA',        // Error background
    errorDark: '#FF2D22',         // Error dark variant
    
    info: '#007AFF',              // Info blue
    infoLight: '#E6F3FF',         // Info background
    infoDark: '#0051D0',          // Info dark variant
    
    neutral: '#8E8E93',           // Neutral gray
    neutralLight: '#F5F5F7',      // Neutral background
    neutralDark: '#6E6E73',       // Neutral dark variant
    
    // iOS 26 Activity states
    online: '#32D74B',            // Online status
    away: '#FF9500',              // Away status
    busy: '#FF3B30',              // Busy status
    offline: '#8E8E93'            // Offline status
  },

  // iOS 26 Visual Effects & Overlays
  effects: {
    // Enhanced shadows
    shadow: 'rgba(0, 0, 0, 0.06)',       // Primary shadow
    shadowLight: 'rgba(0, 0, 0, 0.03)',  // Light shadow
    shadowMedium: 'rgba(0, 0, 0, 0.08)',  // Medium shadow
    shadowStrong: 'rgba(0, 0, 0, 0.12)',  // Strong shadow
    shadowXL: 'rgba(0, 0, 0, 0.16)',      // Extra large shadow
    
    // iOS 26 Colored shadows
    accentShadow: 'rgba(0, 122, 255, 0.15)',
    successShadow: 'rgba(50, 215, 75, 0.15)',
    warningShadow: 'rgba(255, 149, 0, 0.15)',
    errorShadow: 'rgba(255, 59, 48, 0.15)',
    
    // Glow effects
    primaryGlow: 'rgba(0, 122, 255, 0.2)',
    accentGlow: 'rgba(0, 122, 255, 0.25)',
    intelligenceGlow: 'rgba(0, 122, 255, 0.18)',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',       // Modal overlay
    overlayLight: 'rgba(0, 0, 0, 0.3)',  // Light overlay
    overlayStrong: 'rgba(0, 0, 0, 0.7)',  // Strong overlay
    backdrop: 'rgba(0, 0, 0, 0.4)',      // Backdrop effect
    
    // iOS 26 Dynamic effects
    dynamicHighlight: 'rgba(0, 122, 255, 0.1)',
    contextualGlow: 'rgba(0, 122, 255, 0.12)',
    ambientGlow: 'rgba(88, 86, 214, 0.08)'
  },

  // iOS 26 Enhanced Gradients
  gradients: {
    // Primary gradients
    primary: ['#007AFF', '#0051D0'],
    primarySubtle: ['rgba(0, 122, 255, 0.1)', 'rgba(0, 81, 208, 0.05)'],
    
    // Multi-color gradients
    rainbow: ['#FF3B30', '#FF9500', '#32D74B', '#007AFF', '#5856D6', '#AF52DE'],
    rainbowSubtle: [
      'rgba(255, 59, 48, 0.08)',
      'rgba(255, 149, 0, 0.08)',
      'rgba(50, 215, 75, 0.08)',
      'rgba(0, 122, 255, 0.08)',
      'rgba(88, 86, 214, 0.08)',
      'rgba(175, 82, 222, 0.08)'
    ],
    
    // iOS 26 Dynamic gradients
    dynamicPrimary: ['#007AFF', '#5856D6'],
    dynamicSecondary: ['#5856D6', '#AF52DE'],
    dynamicTertiary: ['#AF52DE', '#FF2D92'],
    
    // Intelligence gradients
    intelligence: ['#007AFF', '#5856D6', '#AF52DE'],
    intelligenceSubtle: ['rgba(0, 122, 255, 0.06)', 'rgba(88, 86, 214, 0.04)', 'rgba(175, 82, 222, 0.02)'],
    
    // Background gradients
    backgroundHero: ['#FFFFFF', 'rgba(0, 122, 255, 0.02)'],
    backgroundSubtle: ['#FAFAFA', '#F5F5F7'],
    
    // Glass effects
    glass: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'],
    glassStrong: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)'],
    
    // Overlay gradients
    overlayTop: ['rgba(0, 0, 0, 0.1)', 'transparent'],
    overlayBottom: ['transparent', 'rgba(0, 0, 0, 0.1)']
  }
};

export const HEYWAY_TYPOGRAPHY = {
  // iOS 26 Enhanced Font Scale
  fontSize: {
    // Display text - for hero sections
    display: {
      large: 56,                  // Hero display
      medium: 48,                 // Large display
      small: 40                   // Medium display
    },

    // Headlines - enhanced hierarchy
    headline: {
      xl: 36,                     // Extra large headlines
      large: 32,                  // Large headlines
      medium: 28,                 // Medium headlines
      small: 24                   // Small headlines
    },

    // Titles - refined scale
    title: {
      xl: 24,                     // Extra large titles
      large: 22,                  // Large titles
      medium: 20,                 // Medium titles
      small: 18                   // Small titles
    },

    // Body text - optimized for readability
    body: {
      xl: 18,                     // Extra large body
      large: 17,                  // Large body (iOS standard)
      medium: 16,                 // Medium body
      small: 15,                  // Small body
      xs: 14                      // Extra small body
    },

    // Labels - system UI
    label: {
      large: 16,                  // Large labels
      medium: 15,                 // Medium labels
      small: 14,                  // Small labels
      xs: 13                      // Extra small labels
    },

    // Captions - fine print
    caption: {
      large: 13,                  // Large captions
      medium: 12,                 // Medium captions
      small: 11,                  // Small captions
      xs: 10                      // Extra small captions
    },

    // iOS 26 Micro typography
    micro: {
      large: 10,                  // Large micro text
      medium: 9,                  // Medium micro text
      small: 8                    // Small micro text
    }
  },

  // iOS 26 Enhanced Font Weights
  fontWeight: {
    ultraLight: '100',            // Ultra light
    thin: '200',                  // Thin
    light: '300',                 // Light
    regular: '400',               // Regular (default)
    medium: '500',                // Medium (preferred for UI)
    semibold: '600',              // Semibold (headings)
    bold: '700',                  // Bold
    heavy: '800',                 // Heavy
    black: '900'                  // Black (display)
  },

  // iOS 26 Line Heights - optimized for readability
  lineHeight: {
    tighter: 1.0,                 // Tightest for large display
    tight: 1.1,                   // Tight for headlines
    snug: 1.25,                   // Snug for titles
    normal: 1.4,                  // Normal for body text
    relaxed: 1.5,                 // Relaxed for reading
    loose: 1.6,                   // Loose for large blocks
    extraLoose: 1.8               // Extra loose for accessibility
  },

  // iOS 26 Letter Spacing - refined tracking
  letterSpacing: {
    tightest: -0.08,              // Tightest for large text
    tighter: -0.05,               // Tighter for display
    tight: -0.025,                // Tight for headlines
    normal: 0,                    // Normal (default)
    wide: 0.015,                  // Wide for body text
    wider: 0.025,                 // Wider for labels
    widest: 0.05,                 // Widest for small caps
    extraWide: 0.1                // Extra wide for emphasis
  }
};

export const HEYWAY_SPACING = {
  // iOS 26 Enhanced Spacing Scale (4px base)
  base: 4,

  // Micro spacing - for fine adjustments
  micro: 1,                       // 1px - hairline
  xs: 2,                          // 2px - micro spacing

  // iOS 26 Standard spacing scale
  sm: 4,                          // 4px - small
  md: 8,                          // 8px - medium
  lg: 12,                         // 12px - large
  xl: 16,                         // 16px - extra large
  xxl: 20,                        // 20px - 2x large
  xxxl: 24,                       // 24px - 3x large
  xxxxl: 32,                      // 32px - 4x large

  // iOS 26 Large spacing
  huge: 40,                       // 40px - huge
  massive: 48,                    // 48px - massive
  giant: 64,                      // 64px - giant
  colossal: 80,                   // 80px - colossal

  // iOS 26 Component spacing system
  component: {
    // Padding scale
    padding: {
      xs: 4,                      // Extra small padding
      sm: 8,                      // Small padding
      md: 12,                     // Medium padding
      lg: 16,                     // Large padding
      xl: 20,                     // Extra large padding
      xxl: 24                     // 2x large padding
    },
    
    // Margin scale
    margin: {
      xs: 4,                      // Extra small margin
      sm: 8,                      // Small margin
      md: 12,                     // Medium margin
      lg: 16,                     // Large margin
      xl: 20,                     // Extra large margin
      xxl: 24                     // 2x large margin
    },
    
    // Gap scale - for flexbox/grid layouts
    gap: {
      xs: 4,                      // Extra small gap
      sm: 6,                      // Small gap
      md: 8,                      // Medium gap
      lg: 12,                     // Large gap
      xl: 16,                     // Extra large gap
      xxl: 20                     // 2x large gap
    }
  },

  // iOS 26 Layout spacing
  layout: {
    // Page sections
    section: {
      xs: 16,                     // Small section spacing
      sm: 24,                     // Medium section spacing
      md: 32,                     // Large section spacing
      lg: 48,                     // Extra large section spacing
      xl: 64                      // Huge section spacing
    },
    
    // Container spacing
    container: {
      xs: 16,                     // Small container
      sm: 20,                     // Medium container
      md: 24,                     // Large container
      lg: 32                      // Extra large container
    },
    
    // Content areas
    content: 16,                  // Content padding
    sidebar: 12,                  // Sidebar spacing
    header: 16,                   // Header spacing
    footer: 16,                   // Footer spacing
    
    // Panel system
    panel: {
      gap: 8,                     // Gap between panels
      padding: 16,                // Panel internal padding
      margin: 8,                  // Panel external margin
      section: 12                 // Panel section spacing
    }
  },

  // iOS 26 Safe areas
  safeArea: {
    top: 44,                      // iOS status bar + safe area
    bottom: 34,                   // iOS home indicator area
    horizontal: 20                // Horizontal safe margins
  }
};

export const HEYWAY_RADIUS = {
  // iOS 26 Modern Border Radius Scale
  none: 0,                        // No radius
  xs: 2,                          // 2px - micro radius
  sm: 4,                          // 4px - small radius
  md: 8,                          // 8px - medium radius
  lg: 12,                         // 12px - large radius
  xl: 16,                         // 16px - extra large radius
  xxl: 20,                        // 20px - 2x large radius
  xxxl: 24,                       // 24px - 3x large radius
  xxxxl: 32,                      // 32px - 4x large radius
  full: 9999,                     // Fully rounded

  // iOS 26 Component-specific radius
  component: {
    // Button radius scale
    button: {
      sm: 6,                      // Small button
      md: 8,                      // Medium button (iOS standard)
      lg: 12,                     // Large button
      xl: 16,                     // Extra large button
      pill: 9999,                 // Pill button
      rounded: 20                 // Rounded button
    },
    
    // Input radius scale
    input: {
      sm: 6,                      // Small input
      md: 8,                      // Medium input (iOS standard)
      lg: 10,                     // Large input
      xl: 12                      // Extra large input
    },
    
    // Card radius scale
    card: {
      xs: 8,                      // Extra small card
      sm: 10,                     // Small card
      md: 12,                     // Medium card (iOS standard)
      lg: 16,                     // Large card
      xl: 20,                     // Extra large card
      xxl: 24                     // 2x large card
    },
    
    // Modal radius scale
    modal: {
      sm: 12,                     // Small modal
      md: 16,                     // Medium modal
      lg: 20,                     // Large modal (iOS standard)
      xl: 24,                     // Extra large modal
      sheet: 16                   // iOS sheet style
    },
    
    // Image radius scale
    image: {
      sm: 4,                      // Small image
      md: 8,                      // Medium image
      lg: 12,                     // Large image
      xl: 16,                     // Extra large image
      avatar: 9999                // Avatar (circular)
    }
  }
};

export const HEYWAY_SHADOWS = {
  // iOS 26 Enhanced Shadow System
  light: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0
    },
    xs: {
      shadowColor: 'rgba(0, 0, 0, 0.03)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 1,
      elevation: 1
    },
    sm: {
      shadowColor: 'rgba(0, 0, 0, 0.05)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2
    },
    md: {
      shadowColor: 'rgba(0, 0, 0, 0.06)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 3
    },
    lg: {
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 4
    },
    xl: {
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 6
    },
    xxl: {
      shadowColor: 'rgba(0, 0, 0, 0.12)',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 1,
      shadowRadius: 32,
      elevation: 8
    }
  },

  // iOS 26 Colored Shadows
  colored: {
    accent: {
      shadowColor: '#007AFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4
    },
    success: {
      shadowColor: '#32D74B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4
    },
    warning: {
      shadowColor: '#FF9500',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4
    },
    error: {
      shadowColor: '#FF3B30',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4
    },
    intelligence: {
      shadowColor: '#007AFF',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 6
    }
  },

  // iOS 26 Dynamic Shadows
  dynamic: {
    floating: {
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 8
    },
    elevated: {
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 6
    },
    pressed: {
      shadowColor: 'rgba(0, 0, 0, 0.04)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2
    }
  }
};

export const HEYWAY_ANIMATION = {
  // iOS 26 Animation Timing - refined durations
  timing: {
    instant: 0,                   // Instant
    micro: 100,                   // Micro animations
    fast: 150,                    // Fast transitions
    normal: 250,                  // Normal animations (iOS standard)
    slow: 350,                    // Slow animations
    slower: 500,                  // Slower animations
    slowest: 750                  // Slowest animations
  },

  // iOS 26 Enhanced Easing Curves
  easing: {
    // iOS signature curves
    ios: 'cubic-bezier(0.25, 0.1, 0.25, 1)',           // iOS standard
    iosSpring: 'cubic-bezier(0.175, 0.885, 0.32, 1.1)', // iOS spring
    intelligence: 'cubic-bezier(0.16, 1, 0.3, 1)',      // Apple Intelligence
    
    // Modern easing curves
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',            // Material smooth
    snappy: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',    // Snappy transition
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',   // Bounce effect
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Elastic effect
    
    // Specialized curves
    enterScreen: 'cubic-bezier(0, 0, 0.2, 1)',          // Enter from off-screen
    exitScreen: 'cubic-bezier(0.4, 0, 1, 1)',           // Exit to off-screen
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',           // Emphasized motion
    decelerated: 'cubic-bezier(0, 0, 0.2, 1)',          // Decelerated motion
    accelerated: 'cubic-bezier(0.4, 0, 1, 1)'           // Accelerated motion
  },

  // iOS 26 Spring Configurations
  spring: {
    gentle: { tension: 280, friction: 30 },             // Gentle spring
    bouncy: { tension: 400, friction: 20 },             // Bouncy spring
    wobbly: { tension: 180, friction: 12 },             // Wobbly spring
    stiff: { tension: 500, friction: 40 },              // Stiff spring
    slow: { tension: 200, friction: 40 },               // Slow spring
    ios: { tension: 320, friction: 28 },                // iOS standard spring
    intelligence: { tension: 350, friction: 25 }        // Apple Intelligence spring
  }
};

export const HEYWAY_LAYOUT = {
  // iOS 26 Container System
  container: {
    xs: 320,                      // Extra small (iPhone SE)
    sm: 375,                      // Small (iPhone standard)
    md: 414,                      // Medium (iPhone Plus)
    lg: 768,                      // Large (iPad)
    xl: 1024,                     // Extra large (iPad Pro)
    xxl: 1366,                    // Desktop
    fluid: '100%'                 // Fluid width
  },

  // iOS 26 Component Dimensions
  component: {
    // Header system
    header: {
      height: {
        compact: 44,              // Compact header (iOS standard)
        regular: 52,              // Regular header
        large: 60,                // Large header
        xl: 68                    // Extra large header
      }
    },
    
    // Navigation system
    nav: {
      height: {
        tab: 49,                  // Tab bar height (iOS standard)
        toolbar: 44,              // Toolbar height
        navbar: 44                // Navigation bar height
      }
    },
    
    // Sidebar system
    sidebar: {
      width: {
        compact: 240,             // Compact sidebar
        regular: 280,             // Regular sidebar
        wide: 320                 // Wide sidebar
      }
    },
    
    // Button system
    button: {
      height: {
        xs: 28,                   // Extra small
        sm: 32,                   // Small
        md: 40,                   // Medium (iOS standard)
        lg: 44,                   // Large (iOS touch target)
        xl: 48,                   // Extra large
        xxl: 56                   // 2x large
      },
      minWidth: {
        sm: 64,                   // Small button min width
        md: 88,                   // Medium button min width
        lg: 120                   // Large button min width
      }
    },
    
    // Input system
    input: {
      height: {
        sm: 32,                   // Small input
        md: 40,                   // Medium input (iOS standard)
        lg: 44,                   // Large input
        xl: 48                    // Extra large input
      }
    },
    
    // Card system
    card: {
      minHeight: {
        sm: 80,                   // Small card
        md: 120,                  // Medium card
        lg: 160,                  // Large card
        xl: 200                   // Extra large card
      }
    }
  },

  // iOS 26 Breakpoints
  breakpoints: {
    xs: 0,                        // Extra small devices
    sm: 576,                      // Small devices (landscape phones)
    md: 768,                      // Medium devices (tablets)
    lg: 992,                      // Large devices (desktops)
    xl: 1200,                     // Extra large devices
    xxl: 1400                     // Extra extra large devices
  }
};

// iOS 26 Enhanced Button Styles
export const HEYWAY_BUTTON_STYLES = {
  // iOS 26 Primary Button
  primary: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
    borderWidth: 0,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingHorizontal: HEYWAY_SPACING.component.padding.lg,
    paddingVertical: HEYWAY_SPACING.component.padding.md,
    minHeight: HEYWAY_LAYOUT.component.button.height.md,
    ...HEYWAY_SHADOWS.colored.accent,
    // Enhanced iOS 26 properties
    transform: 'scale(1)',
    transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)'
  },

  // iOS 26 Secondary Button
  secondary: {
    backgroundColor: HEYWAY_COLORS.interactive.secondary,
    borderColor: HEYWAY_COLORS.border.secondary,
    borderWidth: 1,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingHorizontal: HEYWAY_SPACING.component.padding.lg,
    paddingVertical: HEYWAY_SPACING.component.padding.md,
    minHeight: HEYWAY_LAYOUT.component.button.height.md,
    ...HEYWAY_SHADOWS.light.sm,
    transform: 'scale(1)',
    transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)'
  },

  // iOS 26 Tertiary Button
  tertiary: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingHorizontal: HEYWAY_SPACING.component.padding.md,
    paddingVertical: HEYWAY_SPACING.component.padding.sm,
    minHeight: HEYWAY_LAYOUT.component.button.height.sm,
    transform: 'scale(1)',
    transition: 'all 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)'
  },

  // iOS 26 Intelligence Button (special gradient)
  intelligence: {
    background: HEYWAY_COLORS.interactive.intelligenceGradient,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: HEYWAY_RADIUS.component.button.xl,
    paddingHorizontal: HEYWAY_SPACING.component.padding.xl,
    paddingVertical: HEYWAY_SPACING.component.padding.md,
    minHeight: HEYWAY_LAYOUT.component.button.height.lg,
    ...HEYWAY_SHADOWS.colored.intelligence,
    transform: 'scale(1)',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
  },

  // iOS 26 Floating Action Button
  fab: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.full,
    width: 56,
    height: 56,
    padding: 0,
    ...HEYWAY_SHADOWS.dynamic.floating,
    transform: 'scale(1)',
    transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)'
  },

  // iOS 26 Pill Button
  pill: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.pill,
    paddingHorizontal: HEYWAY_SPACING.component.padding.xl,
    paddingVertical: HEYWAY_SPACING.component.padding.md,
    minHeight: HEYWAY_LAYOUT.component.button.height.md,
    ...HEYWAY_SHADOWS.light.md,
    transform: 'scale(1)',
    transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)'
  }
};

// iOS 26 Enhanced Input Styles
export const HEYWAY_INPUT_STYLES = {
  // iOS 26 Default Input
  default: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderColor: HEYWAY_COLORS.border.secondary,
    borderWidth: 1,
    borderRadius: HEYWAY_RADIUS.component.input.md,
    paddingHorizontal: HEYWAY_SPACING.component.padding.md,
    paddingVertical: HEYWAY_SPACING.component.padding.md,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    minHeight: HEYWAY_LAYOUT.component.input.height.md,
    ...HEYWAY_SHADOWS.light.xs,
    transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)'
  },

  // iOS 26 Focused Input
  focused: {
    borderColor: HEYWAY_COLORS.border.focus,
    borderWidth: 2,
    backgroundColor: HEYWAY_COLORS.background.primary,
    ...HEYWAY_SHADOWS.colored.accent,
    transform: 'scale(1.01)'
  },

  // iOS 26 Large Input
  large: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    paddingHorizontal: HEYWAY_SPACING.component.padding.lg,
    paddingVertical: HEYWAY_SPACING.component.padding.lg,
    minHeight: HEYWAY_LAYOUT.component.input.height.lg,
    borderRadius: HEYWAY_RADIUS.component.input.lg
  },

  // iOS 26 Search Input
  search: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: HEYWAY_RADIUS.component.input.xl,
    paddingHorizontal: HEYWAY_SPACING.component.padding.lg,
    paddingVertical: HEYWAY_SPACING.component.padding.md,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
    minHeight: HEYWAY_LAYOUT.component.input.height.md,
    ...HEYWAY_SHADOWS.light.sm
  },

  // iOS 26 Intelligence Input (special styling)
  intelligence: {
    background: HEYWAY_COLORS.background.dynamicGradient,
    borderColor: HEYWAY_COLORS.border.dynamic,
    borderWidth: 1,
    borderRadius: HEYWAY_RADIUS.component.input.xl,
    paddingHorizontal: HEYWAY_SPACING.component.padding.xl,
    paddingVertical: HEYWAY_SPACING.component.padding.lg,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    minHeight: HEYWAY_LAYOUT.component.input.height.lg,
    ...HEYWAY_SHADOWS.colored.intelligence
  }
};

// iOS 26 Enhanced Card Styles
export const HEYWAY_CARD_STYLES = {
  // iOS 26 Default Card
  default: {
    backgroundColor: HEYWAY_COLORS.background.elevated,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    padding: HEYWAY_SPACING.component.padding.lg,
    borderWidth: 0,
    ...HEYWAY_SHADOWS.light.sm,
    transform: 'scale(1)',
    transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)'
  },

  // iOS 26 Elevated Card
  elevated: {
    backgroundColor: HEYWAY_COLORS.background.elevated,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.component.padding.xl,
    borderWidth: 0,
    ...HEYWAY_SHADOWS.light.md,
    transform: 'scale(1)',
    transition: 'all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)'
  },

  // iOS 26 Glass Card
  glass: {
    backgroundColor: HEYWAY_COLORS.background.glass,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.component.padding.xl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.tertiary,
    backdropFilter: 'blur(20px)',
    ...HEYWAY_SHADOWS.light.lg,
    transform: 'scale(1)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },

  // iOS 26 Interactive Card
  interactive: {
    backgroundColor: HEYWAY_COLORS.background.elevated,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.component.padding.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.tertiary,
    ...HEYWAY_SHADOWS.light.sm,
    cursor: 'pointer',
    transform: 'scale(1)',
    transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
    '&:hover': {
      transform: 'scale(1.02)',
      ...HEYWAY_SHADOWS.light.md
    }
  },

  // iOS 26 Intelligence Card (special styling)
  intelligence: {
    background: HEYWAY_COLORS.background.intelligenceGradient,
    borderRadius: HEYWAY_RADIUS.component.card.xl,
    padding: HEYWAY_SPACING.component.padding.xxl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.dynamic,
    ...HEYWAY_SHADOWS.colored.intelligence,
    transform: 'scale(1)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },

  // iOS 26 Hero Card
  hero: {
    background: HEYWAY_COLORS.gradients.backgroundHero.join(', '),
    borderRadius: HEYWAY_RADIUS.component.card.xxl,
    padding: HEYWAY_SPACING.component.padding.xxl,
    borderWidth: 0,
    ...HEYWAY_SHADOWS.light.xl,
    transform: 'scale(1)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  }
};

// iOS 26 Enhanced Panel Styles
export const HEYWAY_PANEL_STYLES = {
  // iOS 26 Main Panel
  main: {
    backgroundColor: HEYWAY_COLORS.background.content,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.tertiary,
    ...HEYWAY_SHADOWS.light.sm,
    overflow: 'hidden'
  },

  // iOS 26 Sidebar Panel
  sidebar: {
    backgroundColor: HEYWAY_COLORS.background.sidebar,
    borderRadius: 0,
    borderRightWidth: 1,
    borderRightColor: HEYWAY_COLORS.border.secondary
  },

  // iOS 26 Header Panel
  header: {
    backgroundColor: HEYWAY_COLORS.background.glass,
    backdropFilter: 'blur(20px)',
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.tertiary,
    ...HEYWAY_SHADOWS.light.sm
  },

  // iOS 26 Intelligence Panel (special styling)
  intelligence: {
    background: HEYWAY_COLORS.background.intelligenceGradient,
    borderRadius: HEYWAY_RADIUS.component.card.xl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.dynamic,
    padding: HEYWAY_SPACING.component.padding.xl,
    ...HEYWAY_SHADOWS.colored.intelligence
  },

  // iOS 26 Floating Panel
  floating: {
    backgroundColor: HEYWAY_COLORS.background.glass,
    borderRadius: HEYWAY_RADIUS.component.card.xl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.tertiary,
    backdropFilter: 'blur(40px)',
    ...HEYWAY_SHADOWS.dynamic.floating
  }
};

// iOS 26 Enhanced Text Styles
export const HEYWAY_TEXT_STYLES = {
  // iOS 26 Display Text
  displayLarge: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.display.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.light,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.tight,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tighter,
    color: HEYWAY_COLORS.text.primary
  },

  displayMedium: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.display.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.light,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.tight,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    color: HEYWAY_COLORS.text.primary
  },

  // iOS 26 Headlines
  headlineXL: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.headline.xl,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.tight,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    color: HEYWAY_COLORS.text.primary
  },

  headlineLarge: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.headline.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.snug,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    color: HEYWAY_COLORS.text.primary
  },

  headlineMedium: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.headline.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.snug,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.primary
  },

  // iOS 26 Titles
  titleXL: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.xl,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.snug,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.primary
  },

  titleLarge: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.primary
  },

  titleMedium: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.primary
  },

  // iOS 26 Body Text
  bodyXL: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.xl,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.primary
  },

  bodyLarge: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.primary
  },

  bodyMedium: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.primary
  },

  bodySmall: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.secondary
  },

  // iOS 26 Label Text
  labelLarge: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
    color: HEYWAY_COLORS.text.secondary
  },

  labelMedium: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
    color: HEYWAY_COLORS.text.secondary
  },

  // iOS 26 Caption Text
  captionLarge: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.tertiary
  },

  captionMedium: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.tertiary
  }
};

// iOS 26 Enhanced Accessibility
export const HEYWAY_ACCESSIBILITY = {
  // iOS 26 Touch Targets
  touchTarget: {
    minimum: 44,                  // iOS minimum touch target
    comfortable: 48,              // Comfortable touch target
    large: 56,                    // Large touch target
    xl: 64                        // Extra large touch target
  },

  // iOS 26 Focus System
  focus: {
    width: 2,                     // Focus ring width
    color: HEYWAY_COLORS.interactive.focus,
    offset: 2,                    // Focus ring offset
    radius: HEYWAY_RADIUS.component.button.md,
    shadow: HEYWAY_SHADOWS.colored.accent
  },

  // iOS 26 Contrast (WCAG AAA)
  contrast: {
    normal: 7.0,                  // AAA contrast for normal text
    large: 4.5,                   // AAA contrast for large text
    ui: 3.0,                      // Minimum UI contrast
    enhanced: 10.0                // Enhanced contrast
  },

  // iOS 26 Motion Preferences
  motion: {
    reduced: {
      transition: 'none',
      animation: 'none'
    },
    respectMotion: true
  }
};

// iOS 26 Enhanced Themes
export const HEYWAY_THEMES = {
  light: {
    colors: HEYWAY_COLORS,
    shadows: HEYWAY_SHADOWS.light
  },

  // iOS 26 Dark Theme
  dark: {
    colors: {
      ...HEYWAY_COLORS,
      background: {
        primary: '#000000',
        secondary: '#1C1C1E',
        tertiary: '#2C2C2E',
        elevated: '#1C1C1E',
        elevatedSecondary: '#2C2C2E',
        glass: 'rgba(28, 28, 30, 0.85)',
        ultraThin: 'rgba(28, 28, 30, 0.95)',
        thick: 'rgba(28, 28, 30, 0.75)',
        sidebar: '#000000',
        toolbar: '#1C1C1E',
        panel: '#1C1C1E',
        content: '#000000',
        overlay: 'rgba(0, 0, 0, 0.8)',
        dynamicGradient: 'linear-gradient(135deg, #000000 0%, #1C1C1E 40%, rgba(0, 122, 255, 0.05) 100%)',
        intelligenceGradient: 'linear-gradient(145deg, rgba(0, 122, 255, 0.1) 0%, rgba(88, 86, 214, 0.08) 50%, rgba(175, 82, 222, 0.06) 100%)',
        heroGradient: 'linear-gradient(180deg, #000000 0%, rgba(28, 28, 30, 0.8) 100%)',
        primaryGlow: 'radial-gradient(circle at center, rgba(0, 122, 255, 0.12) 0%, transparent 60%)',
        accentGlow: 'radial-gradient(circle at center, rgba(0, 122, 255, 0.15) 0%, rgba(88, 86, 214, 0.08) 40%, transparent 70%)'
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#AEAEB2',
        tertiary: '#636366',
        quaternary: '#48484A',
        placeholder: '#48484A',
        disabled: '#3A3A3C',
        inverse: '#000000',
        onAccent: '#FFFFFF',
        link: '#0A84FF',
        linkHover: '#409CFF',
        linkActive: '#0056CC',
        success: '#32D74B',
        warning: '#FF9500',
        error: '#FF453A',
        info: '#64D2FF',
        neutral: '#8E8E93'
      },
      border: {
        primary: '#38383A',
        secondary: '#48484A',
        tertiary: '#3A3A3C',
        quaternary: '#2C2C2E',
        divider: '#38383A',
        separator: '#2C2C2E',
        focus: '#0A84FF',
        error: '#FF453A',
        success: '#32D74B',
        warning: '#FF9500',
        dynamic: 'linear-gradient(135deg, rgba(0, 122, 255, 0.3) 0%, rgba(88, 86, 214, 0.2) 100%)',
        intelligenceBorder: 'linear-gradient(135deg, rgba(0, 122, 255, 0.25) 0%, rgba(88, 86, 214, 0.25) 50%, rgba(175, 82, 222, 0.25) 100%)'
      }
    },
    shadows: {
      ...HEYWAY_SHADOWS,
      light: {
        ...HEYWAY_SHADOWS.light,
        sm: {
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 4,
          elevation: 2
        },
        md: {
          shadowColor: 'rgba(0, 0, 0, 0.4)',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 3
        },
        lg: {
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 16,
          elevation: 4
        }
      }
    }
  }
};

// iOS 26 Modern Patterns
export const HEYWAY_MACOS_PATTERNS = {
  // iOS 26 Navigation Bar
  navigationBar: {
    backgroundColor: HEYWAY_COLORS.background.glass,
    backdropFilter: 'blur(40px)',
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.tertiary,
    height: HEYWAY_LAYOUT.component.nav.height.navbar,
    paddingHorizontal: HEYWAY_SPACING.component.padding.lg,
    ...HEYWAY_SHADOWS.light.sm
  },

  // iOS 26 Tab Bar
  tabBar: {
    backgroundColor: HEYWAY_COLORS.background.glass,
    backdropFilter: 'blur(40px)',
    borderTopWidth: 0.5,
    borderTopColor: HEYWAY_COLORS.border.tertiary,
    height: HEYWAY_LAYOUT.component.nav.height.tab,
    paddingBottom: HEYWAY_SPACING.safeArea.bottom,
    ...HEYWAY_SHADOWS.light.lg
  },

  // iOS 26 List Item
  listItem: {
    backgroundColor: HEYWAY_COLORS.background.elevated,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.separator,
    paddingHorizontal: HEYWAY_SPACING.component.padding.lg,
    paddingVertical: HEYWAY_SPACING.component.padding.md,
    minHeight: 44,
    transition: 'all 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)'
  },

  // iOS 26 Section Header
  sectionHeader: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    paddingHorizontal: HEYWAY_SPACING.component.padding.lg,
    paddingVertical: HEYWAY_SPACING.component.padding.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.separator
  },

  // iOS 26 Alert
  alert: {
    backgroundColor: HEYWAY_COLORS.background.glass,
    borderRadius: HEYWAY_RADIUS.component.modal.md,
    backdropFilter: 'blur(40px)',
    padding: HEYWAY_SPACING.component.padding.xl,
    ...HEYWAY_SHADOWS.light.xl,
    maxWidth: 320
  },

  // iOS 26 Action Sheet
  actionSheet: {
    backgroundColor: HEYWAY_COLORS.background.glass,
    borderTopLeftRadius: HEYWAY_RADIUS.component.modal.lg,
    borderTopRightRadius: HEYWAY_RADIUS.component.modal.lg,
    backdropFilter: 'blur(40px)',
    paddingBottom: HEYWAY_SPACING.safeArea.bottom,
    ...HEYWAY_SHADOWS.light.xxl
  },

  // iOS 26 Intelligence Widget
  intelligenceWidget: {
    background: HEYWAY_COLORS.background.intelligenceGradient,
    borderRadius: HEYWAY_RADIUS.component.card.xl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.dynamic,
    padding: HEYWAY_SPACING.component.padding.xl,
    ...HEYWAY_SHADOWS.colored.intelligence
  }
};

// iOS 26 Enhanced Utility Functions
export const createIOS26Shadow = (
  intensity: 'light' | 'medium' | 'strong' = 'medium'
) => {
  const shadows = {
    light: HEYWAY_SHADOWS.light.sm,
    medium: HEYWAY_SHADOWS.light.md,
    strong: HEYWAY_SHADOWS.light.lg
  };
  return shadows[intensity];
};

export const createIOS26Gradient = (
  colors: string[],
  direction: number = 135
) => ({
  background: `linear-gradient(${direction}deg, ${colors.join(', ')})`,
  borderRadius: HEYWAY_RADIUS.component.card.lg,
  ...HEYWAY_SHADOWS.colored.intelligence
});

export const createIOS26Glass = (
  opacity: number = 0.85,
  blur: number = 20
) => ({
  backgroundColor: `rgba(255, 255, 255, ${opacity})`,
  borderColor: HEYWAY_COLORS.border.tertiary,
  borderWidth: 1,
  backdropFilter: `blur(${blur}px)`,
  ...HEYWAY_SHADOWS.light.md
});

export const createIOS26IntelligenceEffect = (
  intensity: 'subtle' | 'medium' | 'strong' = 'medium'
) => {
  const effects = {
    subtle: {
      background: HEYWAY_COLORS.background.intelligenceGradient,
      borderColor: HEYWAY_COLORS.border.dynamic,
      ...HEYWAY_SHADOWS.colored.intelligence
    },
    medium: {
      background: HEYWAY_COLORS.gradients.intelligence.join(', '),
      borderColor: HEYWAY_COLORS.border.intelligenceBorder,
      ...HEYWAY_SHADOWS.colored.intelligence
    },
    strong: {
      background: HEYWAY_COLORS.gradients.rainbow.join(', '),
      borderColor: HEYWAY_COLORS.border.dynamic,
      ...HEYWAY_SHADOWS.dynamic.floating
    }
  };
  return effects[intensity];
};

// iOS 26 Enhanced Motion Utilities
export const createIOS26Animation = (
  type: 'enter' | 'exit' | 'emphasis' | 'decelerate' = 'enter'
) => {
  const animations = {
    enter: {
      transition: `all ${HEYWAY_ANIMATION.timing.normal}ms ${HEYWAY_ANIMATION.easing.enterScreen}`,
      transform: 'translateY(0) scale(1)',
      opacity: 1
    },
    exit: {
      transition: `all ${HEYWAY_ANIMATION.timing.fast}ms ${HEYWAY_ANIMATION.easing.exitScreen}`,
      transform: 'translateY(20px) scale(0.95)',
      opacity: 0
    },
    emphasis: {
      transition: `all ${HEYWAY_ANIMATION.timing.slow}ms ${HEYWAY_ANIMATION.easing.emphasized}`,
      transform: 'scale(1.05)',
      ...HEYWAY_SHADOWS.light.lg
    },
    decelerate: {
      transition: `all ${HEYWAY_ANIMATION.timing.slower}ms ${HEYWAY_ANIMATION.easing.decelerated}`,
      transform: 'scale(1)',
      ...HEYWAY_SHADOWS.light.sm
    }
  };
  return animations[type];
};

// iOS 26 Enhanced Layout Utilities
export const createIOS26Container = (
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fluid' = 'md'
) => ({
  maxWidth: HEYWAY_LAYOUT.container[size],
  marginHorizontal: 'auto',
  paddingHorizontal: HEYWAY_SPACING.layout.container.md
});

export const createIOS26Grid = (
  columns: number = 1,
  gap: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md'
) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
  gap: HEYWAY_SPACING.component.gap[gap]
});

export const createIOS26Flexbox = (
  direction: 'row' | 'column' = 'row',
  align: 'start' | 'center' | 'end' | 'stretch' = 'start',
  justify: 'start' | 'center' | 'end' | 'space-between' | 'space-around' = 'start',
  gap: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md'
) => ({
  display: 'flex',
  flexDirection: direction,
  alignItems: align,
  justifyContent: justify,
  gap: HEYWAY_SPACING.component.gap[gap]
});

// iOS 26 Enhanced Component Utilities
export const createIOS26Button = (
  variant: 'primary' | 'secondary' | 'tertiary' | 'intelligence' | 'fab' | 'pill' = 'primary',
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md'
) => {
  const baseStyle = HEYWAY_BUTTON_STYLES[variant];
  const sizeStyles = {
    xs: { minHeight: HEYWAY_LAYOUT.component.button.height.xs, paddingHorizontal: HEYWAY_SPACING.component.padding.sm },
    sm: { minHeight: HEYWAY_LAYOUT.component.button.height.sm, paddingHorizontal: HEYWAY_SPACING.component.padding.md },
    md: { minHeight: HEYWAY_LAYOUT.component.button.height.md, paddingHorizontal: HEYWAY_SPACING.component.padding.lg },
    lg: { minHeight: HEYWAY_LAYOUT.component.button.height.lg, paddingHorizontal: HEYWAY_SPACING.component.padding.xl },
    xl: { minHeight: HEYWAY_LAYOUT.component.button.height.xl, paddingHorizontal: HEYWAY_SPACING.component.padding.xxl }
  };
  
  return {
    ...baseStyle,
    ...sizeStyles[size]
  };
};

export const createIOS26Input = (
  variant: 'default' | 'focused' | 'large' | 'search' | 'intelligence' = 'default',
  size: 'sm' | 'md' | 'lg' | 'xl' = 'md'
) => {
  const baseStyle = HEYWAY_INPUT_STYLES[variant];
  const sizeStyles = {
    sm: { minHeight: HEYWAY_LAYOUT.component.input.height.sm, fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small },
    md: { minHeight: HEYWAY_LAYOUT.component.input.height.md, fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium },
    lg: { minHeight: HEYWAY_LAYOUT.component.input.height.lg, fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large },
    xl: { minHeight: HEYWAY_LAYOUT.component.input.height.xl, fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.xl }
  };
  
  return {
    ...baseStyle,
    ...sizeStyles[size]
  };
};

export const createIOS26Card = (
  variant: 'default' | 'elevated' | 'glass' | 'interactive' | 'intelligence' | 'hero' = 'default',
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' = 'md'
) => {
  const baseStyle = HEYWAY_CARD_STYLES[variant];
  const sizeStyles = {
    xs: { padding: HEYWAY_SPACING.component.padding.sm, borderRadius: HEYWAY_RADIUS.component.card.xs },
    sm: { padding: HEYWAY_SPACING.component.padding.md, borderRadius: HEYWAY_RADIUS.component.card.sm },
    md: { padding: HEYWAY_SPACING.component.padding.lg, borderRadius: HEYWAY_RADIUS.component.card.md },
    lg: { padding: HEYWAY_SPACING.component.padding.xl, borderRadius: HEYWAY_RADIUS.component.card.lg },
    xl: { padding: HEYWAY_SPACING.component.padding.xxl, borderRadius: HEYWAY_RADIUS.component.card.xl },
    xxl: { padding: HEYWAY_SPACING.component.padding.xxl, borderRadius: HEYWAY_RADIUS.component.card.xxl }
  };
  
  return {
    ...baseStyle,
    ...sizeStyles[size]
  };
};

// iOS 26 Enhanced Text Utilities
export const createIOS26Text = (
  variant: keyof typeof HEYWAY_TEXT_STYLES = 'bodyMedium',
  color: keyof typeof HEYWAY_COLORS.text = 'primary'
) => ({
  ...HEYWAY_TEXT_STYLES[variant],
  color: HEYWAY_COLORS.text[color]
});

export const createIOS26Heading = (
  level: 'xl' | 'large' | 'medium' | 'small' = 'medium',
  color: keyof typeof HEYWAY_COLORS.text = 'primary'
) => {
  const variants = {
    xl: 'headlineXL',
    large: 'headlineLarge',
    medium: 'headlineMedium',
    small: 'headlineSmall'
  };
  
  return createIOS26Text(variants[level] as keyof typeof HEYWAY_TEXT_STYLES, color);
};

// iOS 26 Enhanced Theme Utilities
export const createIOS26Theme = (
  baseTheme: 'light' | 'dark' = 'light',
  customColors?: Partial<typeof HEYWAY_COLORS>
) => {
  const baseThemeData = HEYWAY_THEMES[baseTheme];
  
  if (customColors) {
    return {
      ...baseThemeData,
      colors: {
        ...baseThemeData.colors,
        ...customColors
      }
    };
  }
  
  return baseThemeData;
};

// iOS 26 Enhanced Responsive Utilities
export const createIOS26Responsive = (
  breakpoint: keyof typeof HEYWAY_LAYOUT.breakpoints = 'md'
) => {
  const breakpoints = HEYWAY_LAYOUT.breakpoints;
  const currentBreakpoint = breakpoints[breakpoint];
  
  return {
    minWidth: currentBreakpoint,
    maxWidth: breakpoint === 'xxl' ? 'none' : breakpoints[breakpoint === 'xs' ? 'sm' : breakpoint === 'sm' ? 'md' : breakpoint === 'md' ? 'lg' : breakpoint === 'lg' ? 'xl' : 'xxl']
  };
};

// iOS 26 Enhanced Accessibility Utilities
export const createIOS26AccessibleButton = (
  variant: keyof typeof HEYWAY_BUTTON_STYLES = 'primary',
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md'
) => {
  const buttonStyle = createIOS26Button(variant, size);
  const minHeight = Math.max(buttonStyle.minHeight || 0, HEYWAY_ACCESSIBILITY.touchTarget.minimum);
  
  return {
    ...buttonStyle,
    minHeight,
    minWidth: Math.max(buttonStyle.minWidth || 0, HEYWAY_ACCESSIBILITY.touchTarget.minimum),
    cursor: 'pointer',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent'
  };
};

// iOS 26 Enhanced Animation Utilities
export const createIOS26SpringAnimation = (
  springType: keyof typeof HEYWAY_ANIMATION.spring = 'ios'
) => {
  const spring = HEYWAY_ANIMATION.spring[springType];
  
  return {
    transition: `all ${HEYWAY_ANIMATION.timing.normal}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
    transform: 'scale(1)',
    ...spring
  };
};

// iOS 26 Enhanced Shadow Utilities
export const createIOS26LayeredShadow = (
  layers: number = 3,
  baseIntensity: 'light' | 'medium' | 'strong' = 'medium'
) => {
  const baseShadow = HEYWAY_SHADOWS.light[baseIntensity === 'light' ? 'sm' : baseIntensity === 'medium' ? 'md' : 'lg'];
  const layeredShadows = [];
  
  for (let i = 0; i < layers; i++) {
    const multiplier = i + 1;
    layeredShadows.push({
      ...baseShadow,
      shadowOffset: {
        width: baseShadow.shadowOffset.width * multiplier,
        height: baseShadow.shadowOffset.height * multiplier
      },
      shadowRadius: baseShadow.shadowRadius * multiplier,
      elevation: baseShadow.elevation * multiplier
    });
  }
  
  return layeredShadows;
};

// iOS 26 Enhanced Color Utilities
export const createIOS26ColorVariants = (
  baseColor: string,
  variants: ('lighter' | 'light' | 'base' | 'dark' | 'darker')[] = ['base']
) => {
  const colorMap: Record<string, string> = {
    base: baseColor
  };
  
  // Simple color manipulation for variants
  if (variants.includes('lighter')) {
    colorMap.lighter = baseColor.replace(')', ', 0.1)').replace('rgb', 'rgba');
  }
  if (variants.includes('light')) {
    colorMap.light = baseColor.replace(')', ', 0.3)').replace('rgb', 'rgba');
  }
  if (variants.includes('dark')) {
    colorMap.dark = baseColor.replace(')', ', 0.7)').replace('rgb', 'rgba');
  }
  if (variants.includes('darker')) {
    colorMap.darker = baseColor.replace(')', ', 0.9)').replace('rgb', 'rgba');
  }
  
  return colorMap;
};

// iOS 26 Enhanced Border Utilities
export const createIOS26Border = (
  width: number = 1,
  style: 'solid' | 'dashed' | 'dotted' = 'solid',
  color: keyof typeof HEYWAY_COLORS.border = 'primary',
  radius: keyof typeof HEYWAY_RADIUS = 'md'
) => ({
  borderWidth: width,
  borderStyle: style,
  borderColor: HEYWAY_COLORS.border[color],
  borderRadius: HEYWAY_RADIUS[radius]
});

// iOS 26 Enhanced Spacing Utilities
export const createIOS26Spacing = (
  direction: 'all' | 'horizontal' | 'vertical' | 'top' | 'right' | 'bottom' | 'left' = 'all',
  size: keyof typeof HEYWAY_SPACING = 'md'
) => {
  const spacingValue = HEYWAY_SPACING[size];
  
  switch (direction) {
    case 'all':
      return { padding: spacingValue };
    case 'horizontal':
      return { paddingHorizontal: spacingValue };
    case 'vertical':
      return { paddingVertical: spacingValue };
    case 'top':
      return { paddingTop: spacingValue };
    case 'right':
      return { paddingRight: spacingValue };
    case 'bottom':
      return { paddingBottom: spacingValue };
    case 'left':
      return { paddingLeft: spacingValue };
    default:
      return { padding: spacingValue };
  }
};

// iOS 26 Enhanced Typography Utilities
export const createIOS26TextStyle = (
  size: keyof typeof HEYWAY_TYPOGRAPHY.fontSize.body = 'medium',
  weight: keyof typeof HEYWAY_TYPOGRAPHY.fontWeight = 'regular',
  color: keyof typeof HEYWAY_COLORS.text = 'primary'
) => ({
  fontSize: HEYWAY_TYPOGRAPHY.fontSize.body[size],
  fontWeight: HEYWAY_TYPOGRAPHY.fontWeight[weight],
  lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
  letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  color: HEYWAY_COLORS.text[color]
});

// Export default theme
export const HEYWAY_DEFAULT_THEME = HEYWAY_THEMES.light;

// Main export - iOS 26 Enhanced Design System
export default {
  // Core Design Tokens
  HEYWAY_COLORS,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_SPACING,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
  HEYWAY_ANIMATION,
  HEYWAY_LAYOUT,
  
  // Component Styles
  HEYWAY_BUTTON_STYLES,
  HEYWAY_INPUT_STYLES,
  HEYWAY_CARD_STYLES,
  HEYWAY_PANEL_STYLES,
  HEYWAY_TEXT_STYLES,
  
  // Design Patterns
  HEYWAY_MACOS_PATTERNS,
  
  // Accessibility & Themes
  HEYWAY_ACCESSIBILITY,
  HEYWAY_THEMES,
  HEYWAY_DEFAULT_THEME,
  
  // Utility Functions
  createIOS26Shadow,
  createIOS26Gradient,
  createIOS26Glass,
  createIOS26IntelligenceEffect,
  createIOS26Animation,
  createIOS26Container,
  createIOS26Grid,
  createIOS26Flexbox,
  createIOS26Button,
  createIOS26Input,
  createIOS26Card,
  createIOS26Text,
  createIOS26Heading,
  createIOS26Theme,
  createIOS26Responsive,
  createIOS26AccessibleButton,
  createIOS26SpringAnimation,
  createIOS26LayeredShadow,
  createIOS26ColorVariants,
  createIOS26Border,
  createIOS26Spacing,
  createIOS26TextStyle
};