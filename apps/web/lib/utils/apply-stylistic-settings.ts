import { StylisticSettings, RoundnessLevel } from "@/lib/hooks/use-stylistic-settings"

const ROUNDNESS_MAP: Record<RoundnessLevel, string> = {
  big: "1rem",    // 16px
  normal: "0.5rem", // 8px
  small: "0.25rem", // 4px
}

/**
 * Apply stylistic settings to CSS variables on the document root
 */
export function applyStylisticSettings(settings: StylisticSettings) {
  if (typeof document === "undefined") return

  const root = document.documentElement

  // Apply roundness
  root.style.setProperty("--stylistic-radius", ROUNDNESS_MAP[settings.roundness])

  // Apply stroke thickness
  root.style.setProperty("--stylistic-stroke", settings.strokeThickness)

  // Apply accent colors
  root.style.setProperty("--stylistic-accent-1", settings.accentColor1)
  root.style.setProperty("--stylistic-accent-2", settings.accentColor2)
  root.style.setProperty("--stylistic-accent-3", settings.accentColor3)

  // Apply brand name to document title if set
  if (settings.brandName) {
    const titleElement = document.querySelector("title")
    if (titleElement) {
      titleElement.textContent = settings.brandName
    }
  }
}

/**
 * Load and apply settings from localStorage
 */
export function loadAndApplyStylisticSettings() {
  if (typeof window === "undefined" || typeof document === "undefined") return

  try {
    const stored = localStorage.getItem("stylistic-settings")
    if (stored) {
      const settings = JSON.parse(stored)
      applyStylisticSettings(settings)
    }
  } catch (error) {
    console.error("Failed to load and apply stylistic settings:", error)
  }
}

