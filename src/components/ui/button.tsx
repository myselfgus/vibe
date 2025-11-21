import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium prism-transition-fast disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer rounded-[1.25rem]",
  {
    variants: {
      variant: {
        default:
          "neomorph-button bg-primary text-primary-foreground hover:shadow-[var(--shadow-neomorph-flat)]",
        destructive:
          "neomorph-button bg-destructive text-destructive-foreground hover:shadow-[var(--shadow-neomorph-flat)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-2 border-border-primary bg-transparent text-foreground hover:bg-card/50 hover:shadow-[var(--shadow-neomorph-flat)]",
        secondary:
          "neomorph-button bg-secondary text-secondary-foreground hover:shadow-[var(--shadow-neomorph-flat)]",
        ghost:
          "hover:bg-muted hover:text-foreground text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "neomorph-button bg-success text-success-foreground hover:shadow-[var(--shadow-neomorph-flat)]",
      },
      size: {
        default: "h-10 px-6 py-2.5 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 px-8 has-[>svg]:px-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
