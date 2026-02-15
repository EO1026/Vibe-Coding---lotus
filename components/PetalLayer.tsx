
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PetalLayerProps {
  count: number;
  layerRadius: number;
  petalScale: [number, number, number];
  particlesPerPetal: number;
  isPaused: boolean;
  layerIndex: number;
  colors: { edge: THREE.Color, mid: THREE.Color, core: THREE.Color };
}

export const PetalLayer: React.FC<PetalLayerProps> = ({ 
    count, 
    layerRadius, 
    petalScale, 
    particlesPerPetal, 
    isPaused, 
    layerIndex,
    colors
}) => {
  const petalsRef = useRef<THREE.Group>(null);

  // Generate a single petal mesh geometry points to be shared or instanced conceptually
  // To keep it simple but high density, we'll create individual Points for each petal
  // allowing individual rotation animation.
  
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
    layerIndex: number,
    colors: any
}> = ({ index, total, layerRadius, scale, particles, isPaused, layerIndex, colors }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const angle = (index / total) * Math.PI * 2;
    
    const { positions, colorData, sizes } = useMemo(() => {
        const pos = new Float32Array(particles * 3);
        const col = new Float32Array(particles * 3);
        const sz = new Float32Array(particles);

        for (let i = 0; i < particles; i++) {
            // Use parametric equation for a petal shape
            // u is length [0, 1], v is width [-1, 1]
            const u = Math.random();
            const v = (Math.random() - 0.5) * 2;
            
            // Shape logic to match the image: broad at middle, pointy at tip
            const widthAtU = Math.sin(u * Math.PI) * (1 - u * 0.5);
            const x = v * widthAtU * scale[0];
            const y = u * scale[1];
            // Curvature
            const z = (Math.pow(v, 2) * 0.5 + Math.pow(u, 2) * 1.5) * scale[2];

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            // Gradient coloring based on the image
            // Core (bottom) -> Mid -> Edge (top/sides)
            const distFromCenter = Math.sqrt(x*x + z*z) / scale[0];
            const mixFactor = u; // Base to tip
            
            let finalColor = new THREE.Color();
            if (mixFactor < 0.3) {
                finalColor.lerpColors(colors.core, colors.mid, mixFactor / 0.3);
            } else {
                finalColor.lerpColors(colors.mid, colors.edge, (mixFactor - 0.3) / 0.7);
            }

            // Add some "sparkle" variation
            const sparkle = 0.8 + Math.random() * 0.4;
            col[i * 3] = finalColor.r * sparkle;
            col[i * 3 + 1] = finalColor.g * sparkle;
            col[i * 3 + 2] = finalColor.b * sparkle;

            sz[i] = Math.random() * 0.02 + 0.005;
        }
        return { positions: pos, colorData: col, sizes: sz };
    }, [particles, scale, colors]);

    useFrame((state) => {
        if (!pointsRef.current || isPaused) return;

        // 10x slower animation
        const time = state.clock.getElapsedTime() * 0.05;
        // Offset each layer slightly for natural feel
        const layerOffset = layerIndex * 0.5;
        const bloomCycle = (Math.sin(time + layerOffset) + 1) / 2;

        // Rotate petal to form flower shape
        // Closed state: Rotation.x is closer to center (vertical)
        // Open state: Rotation.x is tilted outwards
        const baseTilt = 0.2 + (layerIndex * 0.4); // Outer layers tilt more
        const bloomTilt = 1.2;
        
        pointsRef.current.rotation.x = THREE.MathUtils.lerp(baseTilt, bloomTilt, bloomCycle);
        
        // Dynamic sparkle effect - pulse the opacity slightly
        if (pointsRef.current.material instanceof THREE.PointsMaterial) {
           pointsRef.current.material.opacity = 0.4 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
        }
    });

    return (
        <group 
            rotation={[0, angle, 0]} 
            position={[Math.sin(angle) * layerRadius, 0, Math.cos(angle) * layerRadius]}
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
                    size={0.012} 
                    vertexColors 
                    transparent 
                    opacity={0.5} 
                    blending={THREE.AdditiveBlending}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </points>
        </group>
    );
};
