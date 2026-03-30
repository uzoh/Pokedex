// Modern theme colors
export const COLORS = {
  // Background
  background: "#0F0F0F",
  surface: "#1A1A1A",
  surfaceLight: "#2F2F2F",

  // Text
  text: {
    primary: "#FFFFFF",
    secondary: "#BBBBBB",
    tertiary: "#888888",
    muted: "#666666",
  },

  // Accent
  accent: "#ef5350",
  accentLight: "#F87070",

  // Borders
  border: "#2F2F2F",
  borderLight: "#1F1F1F",

  // Status
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",

  // Semantic
  hp: "#EF4444",
  attack: "#F59E0B",
  defense: "#3B82F6",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 24,
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
} as const;

export const FONT_WEIGHTS = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
} as const;
