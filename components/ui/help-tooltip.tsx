"use client"

import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export interface HelpTooltipProps {
  /**
   * The content to show in the tooltip
   */
  content: React.ReactNode
  
  /**
   * Optional title for the tooltip
   */
  title?: string
  
  /**
   * Icon to display (default: HelpCircle)
   */
  icon?: "help" | "info"
  
  /**
   * Side of the trigger to show tooltip
   */
  side?: "top" | "right" | "bottom" | "left"
  
  /**
   * Additional className for the trigger icon
   */
  className?: string
  
  /**
   * Delay before showing tooltip (ms)
   */
  delayDuration?: number
  
  /**
   * Whether to show the tooltip
   */
  disabled?: boolean
}

/**
 * Help tooltip component with contextual information
 * Supports rich content including formatted text and links
 */
export function HelpTooltip({
  content,
  title,
  icon = "help",
  side = "top",
  className,
  delayDuration = 300,
  disabled = false,
}: HelpTooltipProps) {
  const IconComponent = icon === "info" ? Info : HelpCircle

  if (disabled) {
    return null
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              className
            )}
            aria-label="Pomoc"
          >
            <IconComponent className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {title && (
            <div className="font-semibold mb-1">{title}</div>
          )}
          <div className="text-sm">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Help tooltip for form fields
 */
export interface FieldHelpTooltipProps extends Omit<HelpTooltipProps, "content"> {
  /**
   * Help text for the field
   */
  helpText: string
  
  /**
   * Optional example or additional details
   */
  example?: string
}

export function FieldHelpTooltip({
  helpText,
  example,
  ...props
}: FieldHelpTooltipProps) {
  return (
    <HelpTooltip
      {...props}
      content={
        <div>
          <p>{helpText}</p>
          {example && (
            <p className="mt-1 text-xs text-muted-foreground">
              Przykład: {example}
            </p>
          )}
        </div>
      }
    />
  )
}

/**
 * Help tooltip with rich content support (links, formatting)
 */
export interface RichHelpTooltipProps extends Omit<HelpTooltipProps, "content"> {
  /**
   * Rich content with support for links and formatting
   */
  children: React.ReactNode
}

export function RichHelpTooltip({
  children,
  ...props
}: RichHelpTooltipProps) {
  return (
    <HelpTooltip
      {...props}
      content={
        <div className="space-y-1 [&_a]:underline [&_a]:text-primary [&_a:hover]:text-primary/80">
          {children}
        </div>
      }
    />
  )
}

