/** Mombongo design tokens — aligned with mombongo-web/src/index.css */

export const colors = {
  green: {
    50: "#EEF6F0",
    100: "#D4EADC",
    200: "#A8D4B8",
    500: "#3D8B5A",
    600: "#2D7349",
    700: "#1E6B3F",
    800: "#163D24",
    900: "#0F2818",
  },
  amber: {
    50: "#FEF9EE",
    100: "#FDF0D4",
    400: "#F4A11B",
    500: "#D4920E",
    700: "#8A6A00",
    900: "#5C4600",
  },
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  blue: {
    100: "#DBEAFE",
    700: "#1D4ED8",
  },
  purple: {
    100: "#F3E8FF",
    700: "#7E22CE",
  },
  white: "#FFFFFF",
  black: "#000000",
  appBackground: "#F5F3EF",
  tickerBackground: "#111827",
  danger: "#EF4444",
  success: "#22C55E",
} as const;

export const shadows = {
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

export const radii = {
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;
