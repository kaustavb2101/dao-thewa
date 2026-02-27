/**
 * ดาวเทวา — Typography System
 * Thai + Latin font configuration
 */

export const Typography = {
  // Font families
  fonts: {
    thai:   'NotoSansThai-Regular',
    thaiBold: 'NotoSansThai-Bold',
    latin:  'System',
    mono:   'Courier',
  },

  // Font sizes
  size: {
    xs:  11,
    sm:  13,
    md:  15,
    lg:  17,
    xl:  20,
    xxl: 24,
    hero: 32,
    display: 48,
  },

  // Line heights
  lineHeight: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.8,
  },

  // Letter spacing
  tracking: {
    tight:  -0.5,
    normal:  0,
    wide:    1,
    wider:   2,
  },
} as const;
