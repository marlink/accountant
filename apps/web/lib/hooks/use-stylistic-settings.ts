"use client"

import { useState, useEffect, useCallback } from "react"

export type RoundnessLevel = "big" | "normal" | "small"
export type StrokeThickness = "1px" | "2px" | "3px"

export interface StylisticSettings {
  roundness: RoundnessLevel
  strokeThickness: StrokeThickness
  accentColor1: string
  accentColor2: string
  accentColor3: string
  logoUrl?: string
  logoDataUrl?: string // For file uploads converted to data URL
  brandName?: string
}

const STORAGE_KEY = "stylistic-settings"

const DEFAULT_SETTINGS: StylisticSettings = {
  roundness: "normal",
  strokeThickness: "2px",
  accentColor1: "#3b82f6",
  accentColor2: "#10b981",
  accentColor3: "#f59e0b",
  brandName: "",
}

/**
 * Custom hook to manage stylistic settings in localStorage
 */
export function useStylisticSettings() {
  const [settings, setSettings] = useState<StylisticSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch (error) {
      console.error("Failed to load stylistic settings:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<StylisticSettings>) => {
    if (typeof window === "undefined") return

    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    try {
      // Don't store logoDataUrl in localStorage if it's too large
      const toStore = { ...updated }
      if (toStore.logoDataUrl && toStore.logoDataUrl.length > 100000) {
        // If data URL is too large, just keep the URL if available
        delete toStore.logoDataUrl
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    } catch (error) {
      console.error("Failed to save stylistic settings:", error)
    }
  }, [settings])

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof StylisticSettings>(
    key: K,
    value: StylisticSettings[K]
  ) => {
    saveSettings({ [key]: value })
  }, [saveSettings])

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  return {
    settings,
    isLoaded,
    saveSettings,
    updateSetting,
    resetSettings,
  }
}

