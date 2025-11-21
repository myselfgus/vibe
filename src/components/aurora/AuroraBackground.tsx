import { memo } from 'react';

export const AuroraBackground = memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />

      {/* Aurora gradient layers */}
      <div className="aurora-layer-1" />
      <div className="aurora-layer-2" />
      <div className="aurora-layer-3" />

      {/* Radial gradient overlays for depth */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-aurora-float-slow" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl animate-aurora-float-medium" />

      {/* Subtle noise texture for depth */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] mix-blend-overlay bg-noise" />

      {/* Top vignette for focus */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/30" />
    </div>
  );
});

AuroraBackground.displayName = 'AuroraBackground';
