export const luxuryColors = {
  background: '#03110B',
  backgroundDeep: '#010806',
  emerald: '#062015',
  emeraldSoft: '#0A2B1C',
  emeraldCard: '#071C13',

  gold: '#C9A15A',
  goldLight: '#F4D58A',
  goldDark: '#7C5A22',
  goldSoft: 'rgba(244, 213, 138, 0.92)',

  text: '#FFF7E6',
  textSoft: '#D8C9AA',
  muted: '#9B8E73',

  border: 'rgba(244, 213, 138, 0.26)',
  borderStrong: 'rgba(244, 213, 138, 0.58)',

  danger: '#FF6B6B',
  success: '#A9D96F',
};

export const luxuryGradient = {
  screen: ['#010806', '#03110B', '#062015'],
  card: ['rgba(9, 33, 22, 0.98)', 'rgba(3, 17, 11, 0.98)'],
  gold: ['#F4D58A', '#C9A15A', '#7C5A22'],
  goldSoft: ['rgba(244, 213, 138, 0.95)', 'rgba(201, 161, 90, 0.88)'],
  tab: ['rgba(3, 17, 11, 0.98)', 'rgba(1, 8, 6, 0.98)'],
};

export const luxuryRadius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
  full: 999,
};

export const luxurySpacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  pageX: 22,
};

export const luxuryTypography = {
  title: {
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '900' as const,
    letterSpacing: -1.7,
  },
  h1: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '900' as const,
    letterSpacing: -1.2,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900' as const,
    letterSpacing: -0.4,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700' as const,
  },
  kicker: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900' as const,
    letterSpacing: 3.2,
  },
};

export const luxuryShadow = {
  goldGlow: {
    shadowColor: '#F4D58A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 8,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 26,
    elevation: 10,
  },
};
