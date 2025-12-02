import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-secondary text-text-onSecondary shadow hover:bg-secondary-dark",
        secondary:
          "border-transparent bg-tertiary text-text-onTertiary shadow hover:bg-tertiary-dark",
        destructive:
          "border-transparent bg-error text-white shadow hover:bg-error-dark",
        outline: "text-text-primary border-border",
        success:
          "border-transparent bg-success text-white shadow hover:bg-success-dark",
        warning:
          "border-transparent bg-warning text-white shadow hover:bg-warning-dark",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

