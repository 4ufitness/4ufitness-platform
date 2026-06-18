export const luxuryColors = {
  background: '#020A07',
  backgroundDeep: '#000403',
  emerald: '#04150E',
  emeraldSoft: '#092619',
  emeraldCard: '#071D13',
  emeraldLine: '#103725',

  gold: '#C9A15A',
  goldLight: '#F6D98F',
  goldDark: '#76551F',
  goldSoft: 'rgba(246, 217, 143, 0.92)',

  text: '#FFF7E6',
  textSoft: '#D8C9AA',
  muted: '#9B8E73',

  border: 'rgba(246, 217, 143, 0.24)',
  borderStrong: 'rgba(246, 217, 143, 0.62)',

  danger: '#FF746D',
  success: '#B9E17E',
};

export const luxuryGradient = {
  screen: ['#000403', '#020A07', '#04150E', '#092619'] as const,
  card: ['rgba(10, 38, 25, 0.98)', 'rgba(3, 16, 11, 0.98)'] as const,
  cardSoft: ['rgba(13, 50, 33, 0.98)', 'rgba(5, 22, 15, 0.98)'] as const,
  gold: ['#F6D98F', '#C9A15A', '#76551F'] as const,
  goldSoft: ['rgba(246, 217, 143, 0.94)', 'rgba(201, 161, 90, 0.86)'] as const,
  tab: ['rgba(4, 21, 14, 0.98)', 'rgba(0, 4, 3, 0.99)'] as const,
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
    fontSize: 43,
    lineHeight: 49,
    fontWeight: '900' as const,
    letterSpacing: -1.7,
  },
  h1: {
    fontSize: 34,
    lineHeight: 40,
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
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900' as const,
    letterSpacing: 3.2,
  },
};

export const luxuryShadow = {
  goldGlow: {
    shadowColor: '#F6D98F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 8,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.34,
    shadowRadius: 28,
    elevation: 10,
  },
};
