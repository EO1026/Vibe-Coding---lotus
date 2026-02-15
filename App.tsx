
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import Lotus from './components/Lotus';

const App: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(0.2);
  const [density, setDensity] = useState(1.0);
  const [saturation, setSaturation] = useState(0.6);

  return (
    <div className="w-full h-screen bg-black relative select-none">
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
          <Lotus 
            isPaused={isPaused} 
            speed={speed} 
            density={density} 
            saturation={saturation}
          />
          
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

      {/* UI Overlay - Controls Only */}
      <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-6 w-64">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col gap-4">
          
          {/* Speed Control */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-white/60 font-mono uppercase tracking-wider">
              <span>Bloom Speed</span>
              <span>{speed.toFixed(2)}x</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={speed} 
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
          </div>

          {/* Density Control */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-white/60 font-mono uppercase tracking-wider">
              <span>Particle Density</span>
              <span>{density.toFixed(1)}x</span>
            </div>
            <input 
              type="range" min="0.1" max="2.5" step="0.1" 
              value={density} 
              onChange={(e) => setDensity(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Saturation Control */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-white/60 font-mono uppercase tracking-wider">
              <span>Color Saturation</span>
              <span>{(saturation * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={saturation} 
              onChange={(e) => setSaturation(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold-400"
            />
          </div>

          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="mt-2 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 rounded-xl transition-all duration-300 font-light text-xs tracking-widest"
          >
            {isPaused ? 'RESUME ANIMATION' : 'PAUSE ANIMATION'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
