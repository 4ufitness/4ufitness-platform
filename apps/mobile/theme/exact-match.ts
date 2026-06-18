export const exactColors = {
  background: '#03100A',
  backgroundDeep: '#000503',
  emerald: '#03110B',
  emerald2: '#061B12',
  emeraldCard: '#071E14',
  emeraldLine: '#173F2C',
  goldLight: '#F7D994',
  gold: '#C99B53',
  goldDark: '#6F501E',
  champagne: '#FFE9B6',
  text: '#FFF6E8',
  textSoft: '#E5D7BC',
  muted: '#9D9179',
  border: 'rgba(247, 217, 148, 0.34)',
  borderSoft: 'rgba(247, 217, 148, 0.19)',
  borderStrong: 'rgba(247, 217, 148, 0.70)',
  success: '#B7D972',
};

export const exactGradient = {
  screen: ['#000302', '#03100A', '#062016', '#010604'] as const,
  card: ['rgba(9, 39, 25, 0.93)', 'rgba(3, 15, 10, 0.97)'] as const,
  cardSelected: ['rgba(31, 70, 44, 0.97)', 'rgba(7, 23, 15, 0.98)'] as const,
  gold: ['#F8DFA1', '#C99B53', '#6F501E'] as const,
  goldMuted: ['rgba(248,223,161,0.70)', 'rgba(111,80,30,0.90)'] as const,
  tab: ['rgba(3, 16, 11, 0.96)', 'rgba(0, 5, 4, 0.99)'] as const,
};

export const exactRadius = {
  sm: 8,
  md: 13,
  lg: 17,
  xl: 22,
  xxl: 30,
  full: 999,
};

export const exactSpacing = {
  pageX: 20,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const exactType = {
  screenTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900' as const,
    letterSpacing: 1.55,
  },
  hero: {
    fontSize: 49,
    lineHeight: 57,
    fontWeight: '500' as const,
    letterSpacing: -1.65,
  },
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900' as const,
    letterSpacing: -0.8,
  },
  h2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '600' as const,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700' as const,
  },
};

export const exactShadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.36,
    shadowRadius: 24,
    elevation: 7,
  },
  gold: {
    shadowColor: '#F8DFA1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 7,
  },
};
