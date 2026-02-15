
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import Lotus from './components/Lotus';

const App: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas
        shadows
        gl={{ antialias: false, stencil: false, depth: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000005']} />
        <PerspectiveCamera makeDefault position={[0, 4, 12]} fov={45} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#44aaff" />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#aa44ff" />

        <Suspense fallback={null}>
          <Lotus isPaused={isPaused} />
          
          <Stars 
            radius={100} 
            depth={50} 
            count={5000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={1} 
          />

          <EffectComposer disableNormalPass>
            <Bloom 
              luminanceThreshold={0.1} 
              mipmapBlur 
              intensity={1.5} 
              radius={0.4} 
            />
            <Noise opacity={0.05} />
          </EffectComposer>
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minDistance={5} 
          maxDistance={25} 
          autoRotate 
          autoRotateSpeed={0.3}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-white text-3xl font-light tracking-widest opacity-80 uppercase">
          Ethereal Particle Lotus
        </h1>
        <p className="text-blue-300 text-sm mt-2 font-mono tracking-tighter opacity-60">
          Simulating 150,000+ Quantum Points
        </p>
      </div>

      <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-4">
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="bg-white/5 hover:bg-white/10 border border-white/20 text-white px-6 py-2 rounded-full backdrop-blur-md transition-all duration-300 font-light text-sm tracking-widest pointer-events-auto"
        >
          {isPaused ? 'RESUME BLOOM' : 'PAUSE BLOOM'}
        </button>
        <div className="bg-black/40 border border-white/10 px-4 py-2 rounded-lg text-[10px] text-white/40 font-mono">
           SPEED: 0.1x (Slow-Mo) <br/>
           DENSITY: 2.0x (High Density) <br/>
           SATURATION: 40% (Natural)
        </div>
      </div>
    </div>
  );
};

export default App;
