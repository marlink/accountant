"use client"

import { useEffect } from "react"
import { loadAndApplyStylisticSettings } from "@/lib/utils/apply-stylistic-settings"

/**
 * Client component that loads and applies stylistic settings on mount
 * This needs to be a client component because it uses localStorage and DOM APIs
 */
export function StylisticSettingsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadAndApplyStylisticSettings()
  }, [])

  return <>{children}</>
}

