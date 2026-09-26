import { defineConfig } from 'lucente/config'

export default defineConfig({
  space: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  font: {
    xs: { fontSize: 12, lineHeight: 16 },
    sm: { fontSize: 14, lineHeight: 20 },
    md: { fontSize: 16, lineHeight: 24 },
    lg: { fontSize: 18, lineHeight: 28 },
    xl: { fontSize: 20, lineHeight: 28 },
    '2xl': { fontSize: 24, lineHeight: 32 },
  },
  radius: {
    none: 0,
    sm: 6,
    md: 10,
    lg: 16,
    full: 9999,
  },
  breakpoint: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
  },
  extend: {
    screen: {
      flex: 1,
      backgroundColor: '#0c1222',
    },
    card: {
      backgroundColor: '#182238',
    },
    text: {
      color: '#f5f7fb',
    },
    muted: {
      color: '#93a0b8',
    },
  },
})
