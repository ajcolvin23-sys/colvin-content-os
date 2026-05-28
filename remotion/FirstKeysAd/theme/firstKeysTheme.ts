export const firstKeysTheme = {
  colors: {
    navy:     '#102033',
    navyDark: '#0A1520',
    gold:     '#F2B84B',
    goldDim:  '#C8902A',
    cream:    '#FFF7E8',
    green:    '#2E7D5B',
    greenLight: '#5DC98C',
    white:    '#FFFFFF',
    black:    '#101010',
    redSoft:  '#B84A4A',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body:    'Inter, system-ui, sans-serif',
  },
  // Safe zone: keeps text clear of TikTok/Reels/Shorts UI chrome
  safe: {
    top:    120,  // profile picture + top nav
    bottom: 220,  // like / comment / share buttons
    left:   32,
    right:  32,
  },
} as const;

export type FirstKeysTheme = typeof firstKeysTheme;
