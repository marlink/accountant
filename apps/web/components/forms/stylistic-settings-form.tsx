"use client"

import { useState, useEffect } from "react"
import { useStylisticSettings } from "@/lib/hooks/use-stylistic-settings"
import { applyStylisticSettings } from "@/lib/utils/apply-stylistic-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"

export function StylisticSettingsForm() {
  const { settings, isLoaded, saveSettings, updateSetting } = useStylisticSettings()
  const [localSettings, setLocalSettings] = useState(settings)
  const [logoMode, setLogoMode] = useState<"upload" | "url">("upload")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  // Update local settings when loaded settings change
  useEffect(() => {
    if (isLoaded) {
      setLocalSettings(settings)
    }
  }, [settings, isLoaded])

  // Apply settings whenever they change
  useEffect(() => {
    if (isLoaded) {
      applyStylisticSettings(localSettings)
    }
  }, [localSettings, isLoaded])

  const handleSave = () => {
    setSaveStatus("saving")
    saveSettings(localSettings)
    setSaveStatus("saved")
    setTimeout(() => setSaveStatus("idle"), 2000)
  }

  const handleRoundnessChange = (value: string) => {
    const newSettings = { ...localSettings, roundness: value as "big" | "normal" | "small" }
    setLocalSettings(newSettings)
  }

  const handleStrokeChange = (value: string) => {
    const newSettings = { ...localSettings, strokeThickness: value as "1px" | "2px" | "3px" }
    setLocalSettings(newSettings)
  }

  const handleColorChange = (index: 1 | 2 | 3, value: string) => {
    const key = `accentColor${index}` as keyof typeof localSettings
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
  }

  const handleLogoUpload = (file: File | null, dataUrl?: string) => {
    const newSettings = { ...localSettings }
    if (dataUrl) {
      newSettings.logoDataUrl = dataUrl
      newSettings.logoUrl = undefined
    } else {
      newSettings.logoDataUrl = undefined
    }
    setLocalSettings(newSettings)
  }

  const handleLogoUrlChange = (url: string) => {
    const newSettings = { ...localSettings, logoUrl: url || undefined, logoDataUrl: undefined }
    setLocalSettings(newSettings)
  }

  const handleBrandNameChange = (name: string) => {
    const newSettings = { ...localSettings, brandName: name || undefined }
    setLocalSettings(newSettings)
  }

  if (!isLoaded) {
    return <div className="text-sm text-text-secondary">Loading settings...</div>
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSave()
      }}
      className="space-y-6"
    >
      {/* Roundness */}
      <div className="space-y-2">
        <Label htmlFor="roundness">Roundness / Corners</Label>
        <Select value={localSettings.roundness} onValueChange={handleRoundnessChange}>
          <SelectTrigger id="roundness">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="big">Big</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="small">Small</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stroke Thickness */}
      <div className="space-y-2">
        <Label htmlFor="stroke">Stroke Thickness</Label>
        <Select value={localSettings.strokeThickness} onValueChange={handleStrokeChange}>
          <SelectTrigger id="stroke">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1px">1px</SelectItem>
            <SelectItem value="2px">2px</SelectItem>
            <SelectItem value="3px">3px</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Accent Colors */}
      <div className="space-y-4">
        <Label>Accent Colors</Label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="accent-1" className="text-xs">
              Accent Color 1
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="accent-1"
                type="color"
                value={localSettings.accentColor1}
                onChange={(e) => handleColorChange(1, e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                value={localSettings.accentColor1}
                onChange={(e) => handleColorChange(1, e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accent-2" className="text-xs">
              Accent Color 2
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="accent-2"
                type="color"
                value={localSettings.accentColor2}
                onChange={(e) => handleColorChange(2, e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                value={localSettings.accentColor2}
                onChange={(e) => handleColorChange(2, e.target.value)}
                placeholder="#10b981"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accent-3" className="text-xs">
              Accent Color 3
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="accent-3"
                type="color"
                value={localSettings.accentColor3}
                onChange={(e) => handleColorChange(3, e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                value={localSettings.accentColor3}
                onChange={(e) => handleColorChange(3, e.target.value)}
                placeholder="#f59e0b"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="space-y-2">
        <Label>Logo</Label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={logoMode === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setLogoMode("upload")
                // Clear URL when switching to upload mode
                if (localSettings.logoUrl) {
                  setLocalSettings({ ...localSettings, logoUrl: undefined })
                }
              }}
            >
              Upload
            </Button>
            <Button
              type="button"
              variant={logoMode === "url" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setLogoMode("url")
                // Clear data URL when switching to URL mode
                if (localSettings.logoDataUrl) {
                  setLocalSettings({ ...localSettings, logoDataUrl: undefined })
                }
              }}
            >
              URL
            </Button>
          </div>
          {logoMode === "upload" ? (
            <FileUpload
              value={localSettings.logoDataUrl || localSettings.logoUrl}
              onChange={handleLogoUpload}
            />
          ) : (
            <Input
              type="url"
              placeholder="https://example.com/logo.png"
              value={localSettings.logoUrl || ""}
              onChange={(e) => handleLogoUrlChange(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Brand Name */}
      <div className="space-y-2">
        <Label htmlFor="brand-name">Brand Name</Label>
        <Input
          id="brand-name"
          type="text"
          placeholder="Accountant App"
          value={localSettings.brandName || ""}
          onChange={(e) => handleBrandNameChange(e.target.value)}
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saveStatus === "saving"}>
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Settings"}
        </Button>
        {saveStatus === "saved" && (
          <span className="text-sm text-success">Settings saved successfully</span>
        )}
      </div>
    </form>
  )
}

