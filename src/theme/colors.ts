/**
 * ดาวเทวา — Color System
 * Deep indigo night-sky palette with Thai gold accents
 */

export const Colors = {
  // Background layers
  bg: {
    deep:    '#0A0B1E', // deepest background
    dark:    '#111230', // card backgrounds
    surface: '#1A1B3A', // elevated surfaces
    subtle:  '#242550', // subtle highlights
  },

  // Thai Gold — primary accent
  gold: {
    bright:  '#F5C842',
    warm:    '#E8A020',
    deep:    '#C47D10',
    faint:   'rgba(245,200,66,0.15)',
  },

  // Celestial blues
  celestial: {
    sky:     '#4FC3F7',
    deep:    '#0288D1',
    faint:   'rgba(79,195,247,0.15)',
  },

  // Planet colors (matches NAVA_GRAHA)
  planet: {
    sun:     '#E8880A',
    moon:    '#C8C8E0',
    mars:    '#EF5350',
    mercury: '#4FC3F7',
    jupiter: '#F5C842',
    venus:   '#80CBC4',
    saturn:  '#B0BEC5',
    rahu:    '#7E57C2',
    ketu:    '#AB47BC',
  },

  // Semantic
  success:  '#4CAF50',
  warning:  '#FF9800',
  danger:   '#F44336',
  info:     '#2196F3',

  // Text
  text: {
    primary:   '#FFFFFF',
    secondary: 'rgba(255,255,255,0.7)',
    muted:     'rgba(255,255,255,0.4)',
    thai:      '#F5C842', // Thai text in gold
  },

  // Gradients (use as array for LinearGradient colors prop)
  gradient: {
    nightSky:  ['#0A0B1E', '#1A1B3A', '#242550'],
    gold:      ['#F5C842', '#E8A020'],
    aurora:    ['#1A1B3A', '#2D1B69', '#1A1B3A'],
  },
} as const;
