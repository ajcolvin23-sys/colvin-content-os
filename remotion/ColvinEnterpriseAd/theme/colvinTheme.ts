/**
 * colvinTheme.ts
 * Dark premium tech aesthetic for Colvin Enterprises ads.
 */

export const colvinTheme = {
  colors: {
    navy:       '#08111F',   // deepest bg
    navyMid:    '#0D1E35',   // card bg
    navyLight:  '#12283D',   // highlight bg
    electric:   '#36B8FF',   // primary accent (electric blue)
    cyan:       '#7DE3FF',   // secondary accent
    green:      '#36D399',   // success / automation lit
    greenDim:   '#1E8A5E',
    amber:      '#F2B84B',   // warning / revenue leak
    red:        '#F05A5A',   // danger / pain
    white:      '#FFFFFF',
    offWhite:   '#D8E8F4',
    gray:       '#4A6A85',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body:    'Inter, system-ui, sans-serif',
    mono:    '"JetBrains Mono", "Fira Code", monospace',
  },
  safe: { top: 120, bottom: 220, left: 36, right: 36 },
} as const;
