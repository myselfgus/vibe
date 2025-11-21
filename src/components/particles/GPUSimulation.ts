import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

const positionShader = /* glsl */ `
uniform float uTime;
uniform float uDeltaTime;

float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec3(1.0, 0.0, 0.0));
  float c = hash(i + vec3(0.0, 1.0, 0.0));
  float d = hash(i + vec3(1.0, 1.0, 0.0));
  float e = hash(i + vec3(0.0, 0.0, 1.0));
  float f1 = hash(i + vec3(1.0, 0.0, 1.0));
  float g = hash(i + vec3(0.0, 1.0, 1.0));
  float h = hash(i + vec3(1.0, 1.0, 1.0));

  float x1 = mix(a, b, f.x);
  float x2 = mix(c, d, f.x);
  float x3 = mix(e, f1, f.x);
  float x4 = mix(g, h, f.x);

  float y1 = mix(x1, x2, f.y);
  float y2 = mix(x3, x4, f.y);

  return mix(y1, y2, f.z);
}

vec3 curlNoise(vec3 p) {
  float e = 0.1;
  float n1 = noise(p + vec3(e, 0.0, 0.0));
  float n2 = noise(p - vec3(e, 0.0, 0.0));
  float n3 = noise(p + vec3(0.0, e, 0.0));
  float n4 = noise(p - vec3(0.0, e, 0.0));
  float n5 = noise(p + vec3(0.0, 0.0, e));
  float n6 = noise(p - vec3(0.0, 0.0, e));

  float x = (n3 - n4) - (n5 - n6);
  float y = (n5 - n6) - (n1 - n2);
  float z = (n1 - n2) - (n3 - n4);

  return normalize(vec3(x, y, z));
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture2D(texturePosition, uv);

  vec3 velocity = curlNoise(pos.xyz * 0.3 + uTime * 0.1);
  pos.xyz += velocity * uDeltaTime * 0.3;

  float damping = 0.98;
  pos.xyz *= damping;

  gl_FragColor = pos;
}
`;

interface GPUSimulationOptions {
  size: number;
  renderer: THREE.WebGLRenderer;
}

interface GPUVariable {
  material: {
    uniforms: {
      uTime: { value: number };
      uDeltaTime: { value: number };
      [key: string]: { value: unknown };
    };
  };
  [key: string]: unknown;
}

export class GPUSimulation {
  private gpu: GPUComputationRenderer;
  private positionVariable: GPUVariable;
  public initialPositions: THREE.DataTexture;
  public positions: THREE.Texture;

  constructor({ size, renderer }: GPUSimulationOptions) {
    this.gpu = new GPUComputationRenderer(size, size, renderer);

    const positions = new Float32Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const i4 = i * 4;
      const theta = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 3;
      const height = (Math.random() - 0.5) * 2;

      positions[i4 + 0] = Math.cos(theta) * radius;
      positions[i4 + 1] = height;
      positions[i4 + 2] = Math.sin(theta) * radius;
      positions[i4 + 3] = 1.0;
    }

    this.initialPositions = new THREE.DataTexture(
      positions,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    this.initialPositions.needsUpdate = true;

    const positionTexture = this.gpu.createTexture();
    if (positionTexture.image?.data) {
      positionTexture.image.data.set(positions);
    }

    this.positionVariable = this.gpu.addVariable(
      'texturePosition',
      positionShader,
      positionTexture
    ) as unknown as GPUVariable;

    this.gpu.setVariableDependencies(this.positionVariable as any, [this.positionVariable as any]);

    this.positionVariable.material.uniforms.uTime = { value: 0 };
    this.positionVariable.material.uniforms.uDeltaTime = { value: 0 };

    const error = this.gpu.init();
    if (error !== null) {
      console.error('GPUComputationRenderer error:', error);
    }

    this.positions = this.gpu.getCurrentRenderTarget(this.positionVariable as any).texture;
  }

  update(time: number, deltaTime: number) {
    this.positionVariable.material.uniforms.uTime.value = time;
    this.positionVariable.material.uniforms.uDeltaTime.value = deltaTime;
    this.gpu.compute();
    this.positions = this.gpu.getCurrentRenderTarget(this.positionVariable as any).texture;
  }

  dispose() {
    this.initialPositions.dispose();
    this.gpu.dispose();
  }
}
