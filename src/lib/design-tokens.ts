/**
 * Centralized Design System Tokens
 *
 * 1. Color Typography (Tone & Tint hierarchy: High, Medium, Low variants of white)
 * 2. 3-Tier Spacing Architecture (Outer, Inner, and In-between gaps/padding)
 * 3. Single Typeface System: Figtree (Weights 300 through 900)
 * 4. Accessibility standards & Web APIs
 */

export const COLOR_TOPOGRAPHY = {
  /**
   * Three primary variants of white for layered text hierarchy:
   * - High emphasis: primary headings, key metrics, active text
   * - Medium emphasis: secondary labels, timestamps, metadata
   * - Low emphasis: subtle captions, tertiary hints, disabled notes
   */
  tone: {
    high: "rgba(255, 255, 255, 0.85)", // text-white/80-90 equivalent
    medium: "rgba(255, 255, 255, 0.60)", // text-white/60 equivalent
    low: "rgba(255, 255, 255, 0.30)", // text-white/30 equivalent
  },
  classes: {
    high: "text-white/85 dark:text-white/85",
    medium: "text-white/60 dark:text-white/60",
    low: "text-white/30 dark:text-white/30",
  },
} as const;

export const SPACING_SYSTEM = {
  /**
   * Tier 1: Outer Spacing (Screen margins, outer container bounding insets)
   * N(x - y) coordinates for desktop container margins
   */
  outer: {
    x: "var(--space-outer-x, 0.75rem)", // 12px
    y: "var(--space-outer-y, 0.625rem)", // 10px
    xLg: "var(--space-outer-x-lg, 1rem)", // 16px
    yLg: "var(--space-outer-y-lg, 0.75rem)", // 12px
    classes: "mx-2 sm:mx-3 mt-2 sm:mt-2.5",
  },

  /**
   * Tier 2: Inner Spacing (Card, window, panel, chip interior paddings)
   * N(x - y) coordinates for panel interiors
   */
  inner: {
    x: "var(--space-inner-x, 1rem)", // 16px
    y: "var(--space-inner-y, 0.875rem)", // 14px
    compactX: "var(--space-inner-compact-x, 0.625rem)", // 10px
    compactY: "var(--space-inner-compact-y, 0.375rem)", // 6px
    panelPadding: "p-3.5 sm:p-4",
    cardPadding: "p-2.5 sm:p-3",
    chipPadding: "px-2.5 py-1",
  },

  /**
   * Tier 3: In-between Spacing (Component gaps, list flows, inter-element distance)
   */
  gap: {
    xs: "var(--space-gap-xs, 0.25rem)", // 4px (icon + label)
    sm: "var(--space-gap-sm, 0.5rem)", // 8px (adjacent buttons)
    md: "var(--space-gap-md, 0.75rem)", // 12px (form rows, card flows)
    lg: "var(--space-gap-lg, 1rem)", // 16px (major sections)
    classes: {
      tight: "gap-1 sm:gap-1.5",
      regular: "gap-2 sm:gap-2.5",
      relaxed: "gap-3 sm:gap-4",
    },
  },
} as const;

export const TYPOGRAPHY = {
  fontFamily: "var(--font-figtree), system-ui, -apple-system, sans-serif",
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
} as const;
