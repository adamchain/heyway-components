export const OFF_WHITE = '#fdfdfc';

export const LOGO = {
  green:  '#4de176',
  blue:   '#2ca4ff',
  purple: '#7c4dff',
  red:    '#ff3d6e',
  orange: '#ff8a2c',
} as const;

export type LogoColor = keyof typeof LOGO;

/** Soft "Apple Intelligence" wash using your logo colors */
export const aiGradient = (alpha = 0.32) => `
  linear-gradient(
    135deg,
    ${OFF_WHITE} 0%,
    rgba(77, 225, 118, ${alpha}) 30%,
    rgba(44, 164, 255, ${alpha}) 50%,
    rgba(124, 77, 255, ${alpha}) 70%,
    rgba(255, 61, 110, ${alpha}) 85%,
    rgba(255, 138, 44, ${alpha}) 100%
  )
`;

/** Very subtle halo for edges */
export const aiInset = (alpha = 0.08) =>
  `inset 0 1px 0 rgba(255,255,255,0.6), inset 0 0 0 1px rgba(0,0,0,${alpha})`;

/** Rainbow gradient border for input fields */
export const rainbowBorderGradient = () => `
  linear-gradient(
    135deg,
    ${LOGO.green} 0%,
    ${LOGO.blue} 25%,
    ${LOGO.purple} 50%,
    ${LOGO.red} 75%,
    ${LOGO.orange} 100%
  )
`;

/** Subtle rainbow background for input fields */
export const rainbowBackgroundGradient = (alpha = 0.05) => `
  linear-gradient(
    135deg,
    ${OFF_WHITE} 0%,
    rgba(77, 225, 118, ${alpha}) 20%,
    rgba(44, 164, 255, ${alpha}) 40%,
    rgba(124, 77, 255, ${alpha}) 60%,
    rgba(255, 61, 110, ${alpha}) 80%,
    rgba(255, 138, 44, ${alpha}) 100%
  )
`; 