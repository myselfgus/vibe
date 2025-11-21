/**
 * Voither Prism Design System - Design Tokens
 * A comprehensive design language combining Neumorphism, Glassmorphism, and Iridescent Metallics
 */

export const prismTokens = {
  colors: {
    light: {
      background: '210 18% 92%', // #e5e9ed
      foreground: '210 25% 12%', // #1a2332
      card: '210 20% 96%', // #f2f4f7
      primary: '210 65% 28%', // #1e3a5f - Petrol Blue
      accent: '95 35% 38%', // #556b2f - Moss Green
      secondary: '210 12% 88%', // #d8dde3
      muted: '210 15% 90%', // #e0e4e8
      mutedForeground: '210 15% 45%',
      border: '210 10% 85%',
      input: '210 10% 90%',
      ring: '210 65% 28%',

      // Status colors (surgical use only)
      success: '95 45% 42%',
      info: '210 75% 48%',
      warning: '38 85% 55%',
      destructive: '0 62% 48%',

      // Iridescent palette
      iridescent1: '210 65% 28%', // Deep petrol blue
      iridescent2: '95 35% 38%', // Moss green metallic
      iridescent3: '185 45% 35%', // Teal metallic transition
    },
    dark: {
      background: '210 30% 8%', // Near-black with blue tint
      foreground: '210 15% 92%',
      card: '210 25% 12%',
      primary: '210 70% 45%', // Brighter petrol blue
      accent: '95 42% 48%', // More vibrant moss green
      secondary: '210 15% 18%',
      muted: '210 20% 15%',
      mutedForeground: '210 10% 55%',
      border: '210 15% 25%',
      input: '210 20% 15%',
      ring: '210 70% 45%',

      // Status colors (enhanced for dark mode)
      success: '95 50% 48%',
      info: '210 80% 55%',
      warning: '38 90% 60%',
      destructive: '0 70% 55%',

      // Iridescent palette (more saturated)
      iridescent1: '210 75% 48%',
      iridescent2: '95 45% 52%',
      iridescent3: '185 50% 42%',
    }
  },

  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'Cal Sans, Inter, system-ui, sans-serif',
      mono: 'Courier Prime, Fira Code, ui-monospace, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    }
  },

  spacing: {
    radius: '1.25rem', // 20px - highly rounded
    zoom: '0.9', // Fixed zoom for denser dashboard view
  },

  shadows: {
    neomorph: '1px 1px 1px 0 rgba(0,0,0,0.7), -1px -1px 1px 0 rgba(255,255,255,0.7)',
    neomorphInset: 'inset 1px 1px 1px 0 rgba(0,0,0,0.7), inset -1px -1px 1px 0 rgba(255,255,255,0.7)',
    neomorphFlat: '1px 1px 1px 0 rgba(0,0,0,0.5)',
    metallic: '0 2px 8px rgba(30, 58, 95, 0.15), 0 1px 4px rgba(85, 107, 47, 0.1)',
    metallicStrong: '0 4px 16px rgba(30, 58, 95, 0.25), 0 2px 8px rgba(85, 107, 47, 0.15)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
  }
} as const;

export type PrismTokens = typeof prismTokens;
