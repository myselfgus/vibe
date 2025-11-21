import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DofPointsMaterial } from './DofPointsMaterial';
import { GPUSimulation } from './GPUSimulation';

function Particles() {
  const { gl } = useThree();
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<DofPointsMaterial | null>(null);
  const simulationRef = useRef<GPUSimulation | null>(null);
  const clockRef = useRef(new THREE.Clock());

  const SIZE = 128;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(SIZE * SIZE * 2);

    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        const index = (i * SIZE + j) * 2;
        positions[index] = i / SIZE;
        positions[index + 1] = j / SIZE;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 2));
    return geo;
  }, []);

  useEffect(() => {
    if (!gl) return;

    const simulation = new GPUSimulation({ size: SIZE, renderer: gl });
    simulationRef.current = simulation;

    const material = new DofPointsMaterial();
    material.uniforms.positions.value = simulation.positions;
    material.uniforms.initialPositions.value = simulation.initialPositions;
    material.uniforms.uRevealProgress.value = 0;
    material.uniforms.uRevealFactor.value = 10;

    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (materialRef.current) {
        materialRef.current.uniforms.uIsDarkMode.value = isDark ? 1.0 : 0.0;
      }
    };

    updateTheme();
    materialRef.current = material;

    if (meshRef.current) {
      meshRef.current.material = material;
    }

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    let revealProgress = 0;
    const revealInterval = setInterval(() => {
      if (revealProgress < 1) {
        revealProgress += 0.02;
        if (materialRef.current) {
          materialRef.current.uniforms.uRevealProgress.value = Math.min(revealProgress, 1);
        }
      } else {
        clearInterval(revealInterval);
      }
    }, 16);

    return () => {
      clearInterval(revealInterval);
      observer.disconnect();
      simulation.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, [gl, geometry]);

  useFrame(() => {
    if (!simulationRef.current || !materialRef.current) return;

    const deltaTime = clockRef.current.getDelta();
    const elapsedTime = clockRef.current.getElapsedTime();

    simulationRef.current.update(elapsedTime, deltaTime);

    materialRef.current.uniforms.positions.value = simulationRef.current.positions;
    materialRef.current.uniforms.uTime.value = elapsedTime;
  });

  return <points ref={meshRef} geometry={geometry} />;
}

export function ParticlesBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
