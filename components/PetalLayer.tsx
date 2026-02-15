
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PetalLayerProps {
  count: number;
  layerRadius: number;
  petalScale: [number, number, number];
  particlesPerPetal: number;
  isPaused: boolean;
  speed: number;
  layerIndex: number;
  colors: { edge: THREE.Color, mid: THREE.Color, core: THREE.Color };
}

export const PetalLayer: React.FC<PetalLayerProps> = ({ 
    count, 
    layerRadius, 
    petalScale, 
    particlesPerPetal, 
    isPaused, 
    speed,
    layerIndex,
    colors
}) => {
  const petalsRef = useRef<THREE.Group>(null);

  return (
    <group ref={petalsRef}>
      {Array.from({ length: count }).map((_, i) => (
        <Petal 
            key={i}
            index={i}
            total={count}
            layerRadius={layerRadius}
            scale={petalScale}
            particles={particlesPerPetal}
            isPaused={isPaused}
            speed={speed}
            layerIndex={layerIndex}
            colors={colors}
        />
      ))}
    </group>
  );
};

const Petal: React.FC<{ 
    index: number, 
    total: number, 
    layerRadius: number, 
    scale: [number, number, number], 
    particles: number, 
    isPaused: boolean,
    speed: number,
    layerIndex: number,
    colors: any
}> = ({ index, total, layerRadius, scale, particles, isPaused, speed, layerIndex, colors }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const angle = (index / total) * Math.PI * 2;
    
    const { positions, colorData } = useMemo(() => {
        const pos = new Float32Array(particles * 3);
        const col = new Float32Array(particles * 3);

        for (let i = 0; i < particles; i++) {
            const u = Math.random();
            const v = (Math.random() - 0.5) * 2;
            
            const widthAtU = Math.sin(u * Math.PI) * (1 - u * 0.4);
            const x = v * widthAtU * scale[0];
            const y = u * scale[1];
            const z = (Math.pow(v, 2) * 0.3 + Math.pow(u, 2) * 1.2) * scale[2];

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            const mixFactor = u;
            let finalColor = new THREE.Color();
            if (mixFactor < 0.3) {
                finalColor.lerpColors(colors.core, colors.mid, mixFactor / 0.3);
            } else {
                finalColor.lerpColors(colors.mid, colors.edge, (mixFactor - 0.3) / 0.7);
            }

            const sparkle = 0.85 + Math.random() * 0.3;
            col[i * 3] = finalColor.r * sparkle;
            col[i * 3 + 1] = finalColor.g * sparkle;
            col[i * 3 + 2] = finalColor.b * sparkle;
        }
        return { positions: pos, colorData: col };
    }, [particles, scale, colors]);

    useFrame((state) => {
        if (!pointsRef.current || isPaused) return;

        // Apply speed multiplier to the time delta
        const time = state.clock.getElapsedTime() * speed;
        
        // layerOffset controls the sequence: inner petals move first
        const layerOffset = layerIndex * 0.5;
        const bloomCycle = (Math.sin(time - layerOffset) + 1) / 2;

        // More natural tilt angles:
        // closedTilt: almost vertical, slightly tilted in for inner layer
        const closedTilt = -0.1 + (layerIndex * 0.15);
        
        // expandedTilt: significantly reduced for a realistic "bowl" shape
        // Outer layer no longer goes completely flat
        const expandedTilt = 0.45 + (layerIndex * 0.22);
        
        pointsRef.current.rotation.x = THREE.MathUtils.lerp(closedTilt, expandedTilt, bloomCycle);
        
        // Petals slightly lift/grow as they open
        const yOffset = bloomCycle * 0.2;
        pointsRef.current.position.y = yOffset;

        // Subtle scale variation (stretching)
        const scaleMod = 1 + bloomCycle * 0.05;
        pointsRef.current.scale.set(scaleMod, scaleMod, scaleMod);

        if (pointsRef.current.material instanceof THREE.PointsMaterial) {
           pointsRef.current.material.opacity = 0.45 + Math.sin(state.clock.getElapsedTime() * 0.8) * 0.15;
        }
    });

    return (
        <group 
            rotation={[0, angle, 0]} 
            position={[Math.sin(angle) * layerRadius, -0.7, Math.cos(angle) * layerRadius]}
        >
            <points ref={pointsRef}>
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
                    depthWrite={false}
                />
            </points>
        </group>
    );
};
