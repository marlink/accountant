/**
 * Design Tokens
 * 
 * Centralized design tokens matching the prototype CSS variables.
 * These tokens ensure consistency across the entire application.
 */

// Color Palette - 3-Color Theme System
export const colors = {
  // Primary colors
  p1: "#0f172a", // Dark slate/navy
  p1Light: "#1e293b",
  
  // Secondary colors
  p2: "#3b82f6", // Blue
  p2Dark: "#2563eb",
  
  // Tertiary colors
  p3: "#10b981", // Green/teal
  p3Dark: "#059669",
  
  // Semantic colors
  success: "#10b981",
  successDark: "#059669",
  error: "#ef4444",
  errorDark: "#dc2626",
  warning: "#f59e0b",
  warningDark: "#d97706",
  
  // Surface colors
  surface: "#ffffff",
  surfaceElevated: "#f8fafc",
  border: "#e2e8f0",
  
  // Text colors
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textOnPrimary: "#ffffff",
  textOnSecondary: "#ffffff",
  textOnTertiary: "#ffffff",
} as const

// Spacing Scale
export const spacing = {
  xs: "0.25rem",   // 4px
  sm: "0.5rem",    // 8px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  "2xl": "3rem",   // 48px
} as const

// Typography
export const typography = {
  fontSans: [
    "-apple-system",
    "BlinkMacSystemFont",
    "'Segoe UI'",
    "'Roboto'",
    "'Helvetica Neue'",
    "Arial",
    "sans-serif",
  ].join(", "),
  fontMono: [
    "'SF Mono'",
    "Monaco",
    "'Cascadia Code'",
    "monospace",
  ].join(", "),
} as const

// Shadows
export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
} as const

// Border Radius
export const borderRadius = {
  sm: "0.375rem",  // 6px
  md: "0.5rem",    // 8px
  lg: "0.75rem",   // 12px
  xl: "1rem",      // 16px
} as const

// Transitions
export const transitions = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
} as const

// Focus Styles
export const focus = {
  ring: "0 0 0 3px rgba(59, 130, 246, 0.3)",
  ringOffset: "2px",
} as const

// Touch Target Minimum (for accessibility)
export const touchTarget = {
  minHeight: "44px", // Minimum touch target size
} as const

