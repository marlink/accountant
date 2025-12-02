import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Primary color palette (from prototype)
        primary: {
          DEFAULT: "#0f172a",
          light: "#1e293b",
          foreground: "#ffffff",
        },
        // Secondary/Accent colors
        secondary: {
          DEFAULT: "#3b82f6",
          dark: "#2563eb",
          foreground: "#ffffff",
        },
        // Tertiary/Success
        tertiary: {
          DEFAULT: "#10b981",
          dark: "#059669",
          foreground: "#ffffff",
        },
        // Semantic colors
        success: {
          DEFAULT: "#10b981",
          dark: "#059669",
        },
        error: {
          DEFAULT: "#ef4444",
          dark: "#dc2626",
        },
        warning: {
          DEFAULT: "#f59e0b",
          dark: "#d97706",
        },
        // Surface colors
        surface: {
          DEFAULT: "#ffffff",
          elevated: "#f8fafc",
        },
        border: "#e2e8f0",
        // Text colors
        text: {
          primary: "#0f172a",
          secondary: "#64748b",
          onPrimary: "#ffffff",
          onSecondary: "#ffffff",
          onTertiary: "#ffffff",
        },
        // shadcn/ui default colors (for compatibility)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "'Roboto'",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "'SF Mono'",
          "Monaco",
          "'Cascadia Code'",
          "monospace",
        ],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "200ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        default: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

