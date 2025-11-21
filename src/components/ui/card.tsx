import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, variant = "default", ...props }: React.ComponentProps<"div"> & { variant?: "default" | "glass" | "metallic" | "aurora" | "aurora-glass" }) {
  const variantClasses = {
    default: "neomorph-card",
    glass: "prism-card-glass",
    metallic: "neomorph-card metallic-sheen",
    aurora: "aurora-card",
    "aurora-glass": "glass-panel aurora-glow-hover",
  };

  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col text-foreground prism-transition",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, variant, ...props }: React.ComponentProps<"div"> & { variant?: "minimal"}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex items-start gap-1.5 py-4 px-4",
        className,
        variant !== "minimal" ? "py-4" : "py-1",
      )}
      {...props}
    />
  )
}

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6  py-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
