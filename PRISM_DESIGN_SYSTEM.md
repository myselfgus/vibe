# Voither Prism Design System - Implementation Guide

## Overview
Voither Prism is a comprehensive design language combining:
- **Neumorphism** - Soft, raised UI elements with subtle shadows
- **Glassmorphism** - Frosted glass effects with backdrop blur
- **Iridescent Metallics** - Petrol Blue & Moss Green color transitions

## Philosophy
**"Surgical Precision in Color, Ethereal in Form"**

- 90% Monochromatic Foundation (graphite/slate with blue undertones)
- 10% Surgical Color Highlights (Petrol Blue & Moss Green for critical actions)
- Iridescent reflections emerge on hover and interactive states
- Soft, organic shapes with highly rounded corners (1.25rem)

## Core Color Palette

### Light Mode
- `--background`: 210 18% 92% - Blue-gray app background
- `--foreground`: 210 25% 12% - Deep blue-black text
- `--primary`: 210 65% 28% - Petrol Blue (surgical use)
- `--accent`: 95 35% 38% - Moss Green (surgical use)
- `--card`: 210 20% 96% - Card backgrounds

### Dark Mode
- `--background`: 210 30% 8% - Near-black with blue tint
- `--foreground`: 210 15% 92% - Light text
- `--primary`: 210 70% 45% - Brighter Petrol Blue
- `--accent`: 95 42% 48% - More vibrant Moss Green

### Status Colors (Use Sparingly!)
- `--success`: Moss green variant
- `--info`: Petrol blue variant
- `--warning`: Amber
- `--destructive`: Red

### Iridescent Palette
- `--iridescent-1`: Deep petrol blue
- `--iridescent-2`: Moss green metallic
- `--iridescent-3`: Teal metallic transition

## CSS Utility Classes

### Neumorphism
```css
.neomorph-card        /* Raised card with soft shadows */
.neomorph-button      /* Button with press effect */
.neomorph-input       /* Inset input field */
```

### Glassmorphism
```css
.glass                /* Standard frosted glass (blur: 14px) */
.glass-strong         /* Heavy frosted glass (blur: 18px) */
.glass-light          /* Light frosted glass (blur: 10px) */
.glass-border         /* Glass-style border */
```

### Iridescent Effects
```css
.iridescent-border    /* Gradient border (blue→green→teal) */
.iridescent-text      /* Gradient text fill */
.iridescent-glow      /* Subtle ambient glow */
.iridescent-glow-hover /* Enhanced glow on hover */
.metallic-sheen       /* Sliding metallic reflection */
```

### Prism Combinations
```css
.prism-card           /* Neumorphic card + metallic sheen */
.prism-card-glass     /* Glass card with metallic shadows */
.prism-button-primary /* Primary button with iridescent glow */
.prism-button-secondary /* Secondary neumorphic button */
.prism-badge-success  /* Success badge with subtle shadow */
.prism-input          /* Neumorphic input field */
```

### Animations
```css
.prism-transition     /* Standard transition (300ms) */
.prism-transition-fast /* Fast transition (150ms) */
```

## Component Usage

### Button Component
```tsx
import { Button } from '@/components/ui/button';

// Primary action (Petrol Blue + Iridescent Glow)
<Button variant="default">Primary Action</Button>

// Secondary action (Neumorphic, neutral color)
<Button variant="secondary">Secondary</Button>

// Outline with iridescent border
<Button variant="outline">Outline</Button>

// Success state (Moss Green)
<Button variant="success">Confirm</Button>

// Destructive action
<Button variant="destructive">Delete</Button>
```

### Card Component
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Default neumorphic card with metallic sheen
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Neutral description text</CardDescription>
  </CardHeader>
  <CardContent>
    Card content here...
  </CardContent>
</Card>

// Glass variant
<Card variant="glass">...</Card>

// Metallic variant with enhanced iridescent glow
<Card variant="metallic">...</Card>
```

### Input Component
```tsx
import { Input } from '@/components/ui/input';

// Neumorphic input with inset shadow
<Input
  type="text"
  placeholder="Enter text..."
  className="w-full"
/>
```

### Badge Component
```tsx
import { Badge } from '@/components/ui/badge';

// Neutral badge (most common)
<Badge variant="default">Neutral</Badge>

// Color only for critical states
<Badge variant="success">Confirmed ✓</Badge>
<Badge variant="primary">Active</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="warning">Warning</Badge>

// Outline with iridescent border
<Badge variant="outline">Featured</Badge>
```

## Color Usage Guidelines

### ✅ USE Color When:
- Primary CTAs (Login, Submit, Confirm buttons)
- Critical Status (Success badges, error alerts)
- Active Interactive Elements (Selected tabs, checked boxes)
- Important Badges (Notification counters)
- Data Visualizations (Charts, graphs)

### ❌ AVOID Color In:
- Body Text (Always monochromatic)
- Large Backgrounds (Keep neutral)
- Decorative Borders (Use subtle gray)
- Secondary Icons (Grayscale only)
- Passive Navigation (Reserve color for active state)

## Examples

### Monochromatic Card (Default - 90% of UI)
```tsx
<Card className="p-6">
  <h3 className="text-lg font-semibold text-foreground">Card Title</h3>
  <p className="text-muted-foreground">
    Neutral content with no color distractions...
  </p>
  <Badge variant="default">Inactive</Badge>
</Card>
```

### Metallic Glass Panel
```tsx
<div className="glass shadow-metallic p-6 rounded-[1.25rem] glass-border">
  <div className="metallic-sheen p-4 rounded-xl">
    <h3 className="iridescent-text text-2xl font-display">
      Featured Content
    </h3>
  </div>
</div>
```

### Primary Action with Iridescent Glow
```tsx
<Button
  variant="default"
  size="lg"
  className="iridescent-glow-hover">
  Critical Action
</Button>
```

### Status Badge (Surgical Color Use)
```tsx
<div className="flex gap-2">
  {/* Most badges are neutral */}
  <Badge variant="default">Draft</Badge>
  <Badge variant="default">Pending</Badge>

  {/* Color only for critical states */}
  <Badge variant="success">Confirmed ✓</Badge>
  <Badge variant="destructive">Failed</Badge>
</div>
```

## Contrast Correction

The system includes automatic WCAG AA/AAA contrast correction:

```tsx
// Automatically initialized in App.tsx
import { initContrastCorrection } from '@/lib/design-system/contrast-correction';

useEffect(() => {
  initContrastCorrection();
}, []);
```

This ensures:
- Text meets WCAG AA standards (4.5:1 for normal text)
- Automatic adjustment on theme changes
- Dynamic contrast verification

## Design Tokens

Access design tokens programmatically:

```tsx
import { prismTokens } from '@/lib/design-system/prism-tokens';

// Colors
prismTokens.colors.light.primary
prismTokens.colors.dark.accent

// Typography
prismTokens.typography.fontFamily.sans
prismTokens.typography.fontSize.xl

// Shadows
prismTokens.shadows.metallic
prismTokens.shadows.glass
```

## Best Practices

1. **Start Monochromatic** - Build entire interface in grayscale first
2. **Add Color Surgically** - Only for CTAs and critical status
3. **Leverage Depth** - Use neumorphic shadows to establish hierarchy
4. **Glass for Overlays** - Use glassmorphism for modals and floating panels
5. **Iridescent for Highlights** - Reveal metallic reflections on hover
6. **Test Both Modes** - Ensure design works in light and dark themes
7. **Maintain Softness** - Use rounded corners consistently (1.25rem)
8. **Smooth Transitions** - Apply prism-transition classes for polish

## Migration from Old Design System

Replace old utility classes:
- `bg-bg-4` → Use Card component or `bg-card`
- `text-text-primary` → `text-foreground`
- `text-text-secondary` → `text-muted-foreground`
- Custom shadows → Use `shadow-[var(--shadow-neomorph)]` or `shadow-metallic`
- Standard borders → Consider `.iridescent-border` for highlights

## Resources

- Design Tokens: `/src/lib/design-system/prism-tokens.ts`
- Contrast Utilities: `/src/lib/design-system/contrast-correction.ts`
- CSS Utilities: `/src/index.css`
- Component Examples: `/src/components/ui/`
