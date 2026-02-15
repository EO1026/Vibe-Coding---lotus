
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PetalLayer } from './PetalLayer';

interface LotusProps {
  isPaused: boolean;
}

const Lotus: React.FC<LotusProps> = ({ isPaused }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // High particle count settings as requested (2x normal density)
  // We'll distribute these across different petal layers
  const PARTICLE_COUNT = 160000;
  
  // Color palette derived from the image
  // Reduced saturation as requested
  const COLORS = {
    edge: new THREE.Color('#4db8ff'), // Desaturated cyan-blue
    mid: new THREE.Color('#7a5fff'),  // Desaturated purple
    core: new THREE.Color('#ffd68a'), // Desaturated gold
  };

  useFrame((state) => {
    if (isPaused) return;
    
    // Animation Speed: 10 times slower as requested.
    // Standard frequency is ~0.5. 10x slower is 0.05.
    const time = state.clock.getElapsedTime() * 0.05;
    const bloomFactor = (Math.sin(time) + 1) / 2; // Oscillates 0 to 1

    if (groupRef.current) {
        // Subtle vertical float
        groupRef.current.position.y = Math.sin(time * 2) * 0.2 - 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner Petals (The small core petals) */}
      <PetalLayer 
        count={5} 
        layerRadius={0.4} 
        petalScale={[0.8, 1.4, 0.4]} 
        particlesPerPetal={Math.floor(PARTICLE_COUNT / 25)}
        isPaused={isPaused}
        layerIndex={0}
        colors={COLORS}
      />
      
      {/* Middle Petals */}
      <PetalLayer 
        count={8} 
        layerRadius={0.8} 
        petalScale={[1.5, 2.5, 0.6]} 
        particlesPerPetal={Math.floor(PARTICLE_COUNT / 20)}
        isPaused={isPaused}
        layerIndex={1}
        colors={COLORS}
      />
      
      {/* Outer Petals (Large broad petals) */}
      <PetalLayer 
        count={10} 
        layerRadius={1.2} 
        petalScale={[2.2, 3.5, 0.8]} 
        particlesPerPetal={Math.floor(PARTICLE_COUNT / 15)}
        isPaused={isPaused}
        layerIndex={2}
        colors={COLORS}
      />

      {/* Pistil / Center Glow */}
      <CenterCore particles={20000} colors={COLORS} isPaused={isPaused} />
    </group>
  );
};

const CenterCore: React.FC<{ particles: number, colors: any, isPaused: boolean }> = ({ particles, colors, isPaused }) => {
    const meshRef = useRef<THREE.Points>(null);
    const { positions, colorData } = useMemo(() => {
        const pos = new Float32Array(particles * 3);
        const col = new Float32Array(particles * 3);
        const coreCol = colors.core;

        for (let i = 0; i < particles; i++) {
            const r = Math.pow(Math.random(), 0.5) * 0.6;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.cos(phi) * 0.5 + 0.2; // Slightly raised
            pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

            col[i * 3] = coreCol.r;
            col[i * 3 + 1] = coreCol.g;
            col[i * 3 + 2] = coreCol.b;
        }
        return { positions: pos, colorData: col };
    }, [particles, colors]);

    useFrame((state) => {
        if (!meshRef.current || isPaused) return;
        meshRef.current.rotation.y += 0.002;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute 
                    attach="attributes-position" 
                    count={positions.length / 3} 
                    array={positions} 
                    itemSize={3} 
                />
                <bufferAttribute 
                    attach="attributes-color" 
                    count={colorData.length / 3} 
                    array={colorData} 
                    itemSize={3} 
                />
            </bufferGeometry>
            <pointsMaterial 
                size={0.015} 
                vertexColors 
                transparent 
                opacity={0.6} 
                blending={THREE.AdditiveBlending}
                sizeAttenuation={true}
            />
        </points>
    );
}

export default Lotus;
