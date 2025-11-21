import * as THREE from 'three';

const periodicNoiseGLSL = /* glsl */ `
float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float periodicNoise(vec3 p, float period) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(mod(i, period));
  float b = hash(mod(i + vec3(1.0, 0.0, 0.0), period));
  float c = hash(mod(i + vec3(0.0, 1.0, 0.0), period));
  float d = hash(mod(i + vec3(1.0, 1.0, 0.0), period));
  float e = hash(mod(i + vec3(0.0, 0.0, 1.0), period));
  float f1 = hash(mod(i + vec3(1.0, 0.0, 1.0), period));
  float g = hash(mod(i + vec3(0.0, 1.0, 1.0), period));
  float h = hash(mod(i + vec3(1.0, 1.0, 1.0), period));

  float x1 = mix(a, b, f.x);
  float x2 = mix(c, d, f.x);
  float x3 = mix(e, f1, f.x);
  float x4 = mix(g, h, f.x);

  float y1 = mix(x1, x2, f.y);
  float y2 = mix(x3, x4, f.y);

  return mix(y1, y2, f.z);
}
`;

export class DofPointsMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: /* glsl */ `
      uniform sampler2D positions;
      uniform sampler2D initialPositions;
      uniform float uTime;
      uniform float uFocus;
      uniform float uFov;
      uniform float uBlur;
      uniform float uPointSize;
      varying float vDistance;
      varying float vPosY;
      varying vec3 vWorldPosition;
      varying vec3 vInitialPosition;
      void main() {
        vec3 pos = texture2D(positions, position.xy).xyz;
        vec3 initialPos = texture2D(initialPositions, position.xy).xyz;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        vDistance = abs(uFocus - -mvPosition.z);
        vPosY = pos.y;
        vWorldPosition = pos;
        vInitialPosition = initialPos;
        gl_PointSize = max(vDistance * uBlur * uPointSize, 3.0);
      }`,

      fragmentShader: /* glsl */ `
      uniform float uOpacity;
      uniform float uRevealFactor;
      uniform float uRevealProgress;
      uniform float uTime;
      uniform float uIsDarkMode;
      varying float vDistance;
      varying float vPosY;
      varying vec3 vWorldPosition;
      varying vec3 vInitialPosition;
      uniform float uTransition;

      ${periodicNoiseGLSL}

      float sparkleNoise(vec3 seed, float time) {
        float hash = sin(seed.x * 127.1 + seed.y * 311.7 + seed.z * 74.7) * 43758.5453;
        hash = fract(hash);
        float slowTime = time * 1.0;

        float sparkle = 0.0;
        sparkle += sin(slowTime + hash * 6.28318) * 0.5;
        sparkle += sin(slowTime * 1.7 + hash * 12.56636) * 0.3;
        sparkle += sin(slowTime * 0.8 + hash * 18.84954) * 0.2;

        float hash2 = sin(seed.x * 113.5 + seed.y * 271.9 + seed.z * 97.3) * 37849.3241;
        hash2 = fract(hash2);
        float sparkleMask = sin(hash2 * 6.28318) * 0.7 + sin(hash2 * 12.56636) * 0.3;

        if (sparkleMask < 0.3) {
          sparkle *= 0.05;
        }

        float normalizedSparkle = (sparkle + 1.0) * 0.5;
        float smoothCurve = pow(normalizedSparkle, 4.0);
        float blendFactor = normalizedSparkle * normalizedSparkle;
        float finalBrightness = mix(normalizedSparkle, smoothCurve, blendFactor);

        return finalBrightness * 0.6;
      }

      float sdCircle(vec2 p, float r) {
        return length(p) - r;
      }

      void main() {
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float sdf = sdCircle(cxy, 0.5);
        if (sdf > 0.0) discard;

        // Keep particles always visible in orbital range
        float distanceFromCenter = length(vWorldPosition.xz);
        float noiseValue = periodicNoise(vInitialPosition * 4.0, 0.0);

        // Smooth fade at edges of orbital range (radius 2-5)
        float innerRadius = 1.5;
        float outerRadius = 5.5;
        float radialFade = smoothstep(innerRadius, innerRadius + 0.5, distanceFromCenter) *
                           (1.0 - smoothstep(outerRadius - 0.5, outerRadius, distanceFromCenter));

        float revealMask = mix(0.3, 1.0, radialFade);

        float sparkleBrightness = sparkleNoise(vInitialPosition, uTime);

        // Keep particles visible continuously with smooth reveal
        float revealFactor = max(uRevealProgress, 0.5);
        float alpha = (1.04 - clamp(vDistance, 0.0, 1.0)) *
                      clamp(smoothstep(-0.5, 0.25, vPosY), 0.0, 1.0) *
                      uOpacity * revealMask * revealFactor *
                      sparkleBrightness;

        float transitionBoost = mix(1.0, 1.8, uTransition);

        vec3 particleColor;
        if (uIsDarkMode > 0.5) {
          particleColor = vec3(sparkleBrightness) * transitionBoost;
        } else {
          particleColor = vec3(sparkleBrightness * 0.3) * transitionBoost;
        }

        gl_FragColor = vec4(particleColor, alpha);
      }`,

      uniforms: {
        positions: { value: null },
        initialPositions: { value: null },
        uTime: { value: 0 },
        uFocus: { value: 5.1 },
        uFov: { value: 50 },
        uBlur: { value: 30 },
        uTransition: { value: 0.0 },
        uPointSize: { value: 2.0 },
        uOpacity: { value: 1.0 },
        uRevealFactor: { value: 0.0 },
        uRevealProgress: { value: 0.0 },
        uIsDarkMode: { value: 1.0 }
      },
      transparent: true,
      depthWrite: false,
    });
  }
}
