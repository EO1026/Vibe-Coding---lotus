
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PetalLayer } from './PetalLayer';

interface LotusProps {
  isPaused: boolean;
  speed: number;
  density: number;
  saturation: number;
}

const Lotus: React.FC<LotusProps> = ({ isPaused, speed, density, saturation }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Adjusted base particle count by the density multiplier
  const PARTICLE_COUNT = 160000 * density;
  
  // Dynamic color palette based on saturation
  const COLORS = useMemo(() => {
    const baseEdge = new THREE.Color('#4db8ff');
    const baseMid = new THREE.Color('#7a5fff');
    const baseCore = new THREE.Color('#ffd68a');

    const adjustSaturation = (col: THREE.Color, factor: number) => {
      const hsl = { h: 0, s: 0, l: 0 };
      col.getHSL(hsl);
      // We interpolate the saturation specifically
      const newCol = col.clone();
      return newCol.setHSL(hsl.h, hsl.s * factor, hsl.l);
    };

    return {
      edge: adjustSaturation(baseEdge, saturation),
      mid: adjustSaturation(baseMid, saturation),
      core: adjustSaturation(baseCore, saturation),
    };
  }, [saturation]);

  useFrame((state) => {
    if (isPaused) return;
    
    // Slow float influenced by speed
    const time = state.clock.getElapsedTime() * 0.05 * (speed > 0 ? 1 : 0);

    if (groupRef.current) {
        groupRef.current.position.y = Math.sin(time * 2) * 0.2 - 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner Petals */}
      <PetalLayer 
        count={5} 
        layerRadius={0.4} 
        petalScale={[0.8, 1.4, 0.4]} 
        particlesPerPetal={Math.floor(PARTICLE_COUNT / 25)}
        isPaused={isPaused}
        speed={speed}
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
        speed={speed}
        layerIndex={1}
        colors={COLORS}
      />
      
      {/* Outer Petals */}
      <PetalLayer 
        count={10} 
        layerRadius={1.2} 
        petalScale={[2.2, 3.5, 0.8]} 
        particlesPerPetal={Math.floor(PARTICLE_COUNT / 15)}
        isPaused={isPaused}
        speed={speed}
        layerIndex={2}
        colors={COLORS}
      />

      {/* Pistil / Center Glow */}
      <CenterCore particles={Math.floor(6000 * density)} colors={COLORS} isPaused={isPaused} />
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
            const r = Math.pow(Math.random(), 0.5) * 0.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.cos(phi) * 0.4 + 0.1;
            pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

            const dim = 0.6 + Math.random() * 0.4;
            col[i * 3] = coreCol.r * dim;
            col[i * 3 + 1] = coreCol.g * dim;
            col[i * 3 + 2] = coreCol.b * dim;
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
                size={0.012} 
                vertexColors 
                transparent 
                opacity={0.35} 
                blending={THREE.AdditiveBlending}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </points>
    );
}

export default Lotus;
