export const COLORS = {
  purple: '#7C5CFC',
  purpleLight: '#9B7EFD',
  purpleSoft: '#EDE8FF',
  purplePale: '#F3F0FF',
  bgGradStart: '#E8E0FF',
  bgGradEnd: '#F0E8FF',
  white: '#FFFFFF',
  textDark: '#1A1040',
  textMid: '#6B6490',
  textLight: '#A09BC0',
  success: '#1D9E75',
  error: '#F43F5E',
  warning: '#EF9F27',
  
  // Neutral/Overlay
  cardBorder: 'rgba(255, 255, 255, 0.85)',
  cardBg: 'rgba(255, 255, 255, 0.92)',
  inputBorder: 'rgba(124, 92, 252, 0.15)',
  shadow: 'rgba(124, 92, 252, 0.10)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 12,
  md: 20,
  pill: 99,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.12,
  },
};
