/**
 * Utilities para correção automática de contraste
 * Garante que textos e elementos visuais atendam aos padrões WCAG AA/AAA
 */

/**
 * Converte cor HSL para RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

/**
 * Converte RGB para luminância relativa
 * Baseado em WCAG 2.0
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calcula a razão de contraste entre duas cores
 * @returns Razão de contraste (1-21)
 */
export function getContrastRatio(
  color1: [number, number, number],
  color2: [number, number, number]
): number {
  const lum1 = getLuminance(...color1);
  const lum2 = getLuminance(...color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Verifica se o contraste atende aos padrões WCAG
 */
export function meetsWCAG(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  fontSize: 'normal' | 'large' = 'normal'
): boolean {
  if (level === 'AAA') {
    return fontSize === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  return fontSize === 'large' ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Ajusta a luminosidade de uma cor HSL para atingir contraste adequado
 */
export function adjustForContrast(
  hslColor: string,
  bgColor: [number, number, number],
  targetRatio: number = 4.5,
  maxIterations: number = 50
): string {
  const match = hslColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) return hslColor;

  let [, h, s, l] = match.map(Number);

  let currentRgb = hslToRgb(h, s, l);
  let currentRatio = getContrastRatio(currentRgb, bgColor);

  if (currentRatio >= targetRatio) {
    return hslColor;
  }

  const bgLum = getLuminance(...bgColor);
  const shouldLighten = bgLum < 0.5;

  let step = shouldLighten ? 5 : -5;
  let iterations = 0;

  while (iterations < maxIterations && currentRatio < targetRatio) {
    l += step;

    if (l <= 0 || l >= 100) {
      l = Math.max(0, Math.min(100, l));
      break;
    }

    currentRgb = hslToRgb(h, s, l);
    currentRatio = getContrastRatio(currentRgb, bgColor);
    iterations++;
  }

  return `${h} ${s}% ${l}%`;
}

/**
 * Retorna cor de texto adequada baseada no fundo
 */
export function getTextColorForBackground(bgHsl: string): string {
  const match = bgHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) return '220 10% 15%';

  const [, h, s, l] = match.map(Number);
  const rgb = hslToRgb(h, s, l);
  const lum = getLuminance(...rgb);

  if (lum < 0.5) {
    return '220 15% 92%';
  }

  return '220 10% 15%';
}

/**
 * Verifica e ajusta contraste automaticamente em CSS variables
 */
export function autoFixContrast(element?: HTMLElement): void {
  const root = element || document.documentElement;
  const styles = getComputedStyle(root);

  const bgHsl = styles.getPropertyValue('--background').trim();
  const fgHsl = styles.getPropertyValue('--foreground').trim();

  const bgMatch = bgHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  const fgMatch = fgHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);

  if (!bgMatch || !fgMatch) return;

  const bgRgb = hslToRgb(...bgMatch.slice(1).map(Number) as [number, number, number]);
  const fgRgb = hslToRgb(...fgMatch.slice(1).map(Number) as [number, number, number]);

  const ratio = getContrastRatio(bgRgb, fgRgb);

  if (!meetsWCAG(ratio, 'AA')) {
    const adjustedFg = adjustForContrast(fgHsl, bgRgb, 4.5);
    root.style.setProperty('--foreground', adjustedFg);
  }
}

/**
 * Hook para aplicar correção automática de contraste
 * Use em um useEffect no componente raiz
 */
export function initContrastCorrection(): void {
  autoFixContrast();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class'
      ) {
        requestAnimationFrame(() => {
          autoFixContrast();
        });
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
}
