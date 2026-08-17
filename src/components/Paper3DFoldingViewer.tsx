import React, { useState } from 'react';
import { 
  Rotate3d, 
  RotateCcw, 
  Eye,
  Box
} from 'lucide-react';

interface Paper3DFoldingViewerProps {
  modelType: 'cyber-mac' | 'mech-pet' | 'arcade' | 'flat-fold' | 'parametric';
  skinTheme: 'blueprint' | 'cyber' | 'retro' | 'craft' | 'clean' | 'kawaii';
  phoneWidth?: number;
  phoneHeight?: number;
  phoneThickness?: number;
}

// Reusable physical paper face component with textures and realistic lighting
const PaperPanel = ({ className = '', style = {}, children, skin, isCutout = false }: any) => {
  return (
    <div
      className={`absolute box-border overflow-hidden ${!isCutout ? skin.bg + ' ' + skin.border + ' border-[1px] ' + skin.shadow : ''} ${skin.text} ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        ...(!isCutout ? { backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` } : {}),
        ...style
      }}
    >
      {!isCutout && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/30 to-black/20 pointer-events-none" 
          style={{ mixBlendMode: 'overlay' }} 
        />
      )}
      {children}
    </div>
  );
};

export function Paper3DFoldingViewer({
  modelType,
  skinTheme,
  phoneWidth = 71.5,
  phoneHeight = 147.5,
  phoneThickness = 8.0,
}: Paper3DFoldingViewerProps) {
  const [foldProgress, setFoldProgress] = useState<number>(100); // 0% flat -> 100% folded 3D
  const [rotX, setRotX] = useState<number>(-15);
  const [rotY, setRotY] = useState<number>(35);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotY((prev) => (prev + dx * 0.5) % 360);
    setRotX((prev) => Math.max(-80, Math.min(80, prev - dy * 0.5)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Realistic Physical Material Mapping
  const getSkinStyles = () => {
    switch (skinTheme) {
      case 'craft': // Realistic Cardboard/Kraft Paper
        return {
          bg: 'bg-[#C29B68]',
          border: 'border-[#9A744A]',
          text: 'text-[#4A3219]',
          shadow: 'shadow-[inset_0_0_15px_rgba(0,0,0,0.1),_0_1px_3px_rgba(0,0,0,0.2)]',
          screenColor: 'bg-zinc-900',
        };
      case 'clean': // Premium Matte White Cardstock
        return {
          bg: 'bg-[#F4F4F5]',
          border: 'border-[#D4D4D8]',
          text: 'text-[#27272A]',
          shadow: 'shadow-[inset_0_0_10px_rgba(0,0,0,0.03),_0_1px_3px_rgba(0,0,0,0.1)]',
          screenColor: 'bg-black',
        };
      case 'retro': // 1984 Injection Molded Beige
        return {
          bg: 'bg-[#E6DDC5]',
          border: 'border-[#C8BCA4]',
          text: 'text-[#5C5346]',
          shadow: 'shadow-[inset_0_0_20px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.15)]',
          screenColor: 'bg-[#1E293B]',
        };
      case 'blueprint': // Engineering Cyanotype Matte
        return {
          bg: 'bg-[#1E3A5F]',
          border: 'border-[#3A608F]',
          text: 'text-[#A8CEFF]',
          shadow: 'shadow-[inset_0_0_20px_rgba(0,0,0,0.2),_0_1px_3px_rgba(0,0,0,0.3)]',
          screenColor: 'bg-[#0A192F]',
        };
      case 'cyber': // Matte Black with Print
        return {
          bg: 'bg-[#222]',
          border: 'border-[#444]',
          text: 'text-[#34D399]',
          shadow: 'shadow-[inset_0_0_20px_rgba(0,0,0,0.4),_0_1px_3px_rgba(0,0,0,0.5)]',
          screenColor: 'bg-black',
        };
      case 'kawaii': // Heavy Pastel Pink
        return {
          bg: 'bg-[#FBCFE8]',
          border: 'border-[#F472B6]',
          text: 'text-[#9D174D]',
          shadow: 'shadow-[inset_0_0_20px_rgba(255,255,255,0.4),_0_1px_3px_rgba(0,0,0,0.1)]',
          screenColor: 'bg-[#831843]',
        };
    }
  };

  const themeStyle = getSkinStyles();
  const foldRatio = foldProgress / 100;

  // Studio environment styling
  const isDarkStudio = skinTheme === 'cyber' || skinTheme === 'blueprint';
  const stageBg = isDarkStudio 
    ? 'from-zinc-800 to-zinc-950 text-white' 
    : 'from-zinc-100 to-zinc-300 text-zinc-900';

  // Parametric scale multipliers
  const sc = 1.8;
  const pW = phoneWidth * sc;
  const pH = phoneHeight * sc;
  const pT = phoneThickness * sc;

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden relative select-none">
      
      {/* Top 3D Control Bar */}
      <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-white/10 text-white">
            <Rotate3d className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-white">Interactive 3D Assembly</span>
            <span className="text-[10px] text-zinc-400 block">Physically accurate hierarchical cardboard folds</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => { setRotX(-15); setRotY(35); }}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs flex items-center space-x-1.5 font-bold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recenter</span>
          </button>
          <button
            onClick={() => setShowWireframe(!showWireframe)}
            className={`px-3 py-1.5 rounded text-xs flex items-center space-x-1.5 font-bold transition-all ${
              showWireframe ? 'bg-emerald-500 text-black' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>X-Ray</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Stage */}
      <div 
        className={`flex-1 w-full relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing bg-radial ${stageBg}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ perspective: 1500 }}
      >
        {/* Soft studio floor drop shadow that scales with fold */}
        <div 
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-black/20 rounded-full blur-2xl pointer-events-none transition-all duration-300"
          style={{
            transform: `translate(-50%, -50%) rotateX(75deg) translateZ(${-100 + (100 - foldProgress)}px) scale(${0.7 + foldRatio * 0.3})`,
          }}
        />

        {/* Global Orbit Transform Root */}
        <div
          className={`relative transition-transform duration-75 ${showWireframe ? 'opacity-70' : ''}`}
          style={{
            transformStyle: 'preserve-3d',
            transform: `scale(${0.65 + foldRatio * 0.35}) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${pT/2}px)`,
          }}
        >
          {/* ================= MODEL 1: PARAMETRIC SLEEVE (True Hierarchical Fold) ================= */}
          {modelType === 'parametric' && (
            <div className="relative" style={{ width: pW, height: pH, transformStyle: 'preserve-3d' }}>
              
              {/* Front Face */}
              <PaperPanel skin={themeStyle} className="absolute inset-0">
                <div className="absolute inset-4 border-2 border-dashed border-current/30 rounded flex items-center justify-center">
                  <span className="text-[10px] opacity-50 font-bold uppercase tracking-widest text-center px-4">
                    Excise Viewport
                  </span>
                </div>
              </PaperPanel>

              {/* Left Spine (Attached to Front Left) */}
              <div className="absolute top-0 bottom-0 right-full" style={{ width: pT, transformOrigin: 'right center', transformStyle: 'preserve-3d', transform: `rotateY(${-90 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0" />

                {/* Back Face (Attached to Left Spine Left) */}
                <div className="absolute top-0 bottom-0 right-full" style={{ width: pW, transformOrigin: 'right center', transformStyle: 'preserve-3d', transform: `rotateY(${-90 * foldRatio}deg)` }}>
                  <PaperPanel skin={themeStyle} className="absolute inset-0 bg-black/10">
                    <div className="p-4 w-full h-full flex flex-col justify-end text-xs opacity-50 font-mono text-center">
                      Internal Rear Backplate
                    </div>
                  </PaperPanel>

                  {/* Top Enclosure Flap (Attached to Back Face Top) */}
                  <div className="absolute bottom-full left-0 right-0" style={{ height: pT, transformOrigin: 'bottom center', transformStyle: 'preserve-3d', transform: `rotateX(${90 * foldRatio}deg)` }}>
                    <PaperPanel skin={themeStyle} className="absolute inset-0" />
                  </div>
                </div>
              </div>

              {/* Right Spine (Attached to Front Right) */}
              <div className="absolute top-0 bottom-0 left-full" style={{ width: pT, transformOrigin: 'left center', transformStyle: 'preserve-3d', transform: `rotateY(${90 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0" />

                {/* Glue Tab (Attached to Right Spine Right) */}
                <div className="absolute top-0 bottom-0 left-full" style={{ width: 20, transformOrigin: 'left center', transformStyle: 'preserve-3d', transform: `rotateY(${90 * foldRatio}deg)` }}>
                  <PaperPanel skin={themeStyle} className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 15px, 100% calc(100% - 15px), 0 100%)' }}>
                    <div className="w-full h-full border-r-2 border-dashed border-current/20 bg-black/5" />
                  </PaperPanel>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODEL 2: ARCADE CABINET ================= */}
          {modelType === 'arcade' && (() => {
            const aw = 140; // Arcade width
            const sh = 160; // Screen height
            return (
            <div className="relative" style={{ width: aw, height: sh, transformStyle: 'preserve-3d' }}>
              
              {/* Screen Base Face */}
              <PaperPanel skin={themeStyle} className="absolute inset-0 border-8 border-current">
                <div className={`w-full h-full flex flex-col items-center justify-center p-4 ${themeStyle.screenColor}`}>
                  <div className="w-16 h-12 border-2 border-current/30 rounded-full flex items-center justify-center mb-4">
                    <span className="text-[10px] font-black tracking-widest text-current">A.I.</span>
                  </div>
                  <div className="flex space-x-4">
                     <div className="w-4 h-4 rounded-full bg-current shadow-[0_0_10px_currentColor] animate-pulse" />
                     <div className="w-4 h-4 rounded-full bg-current shadow-[0_0_10px_currentColor] animate-pulse" />
                  </div>
                </div>
              </PaperPanel>

              {/* Top Marquee Folds */}
              <div className="absolute bottom-full left-0 right-0" style={{ height: 50, transformOrigin: 'bottom center', transformStyle: 'preserve-3d', transform: `rotateX(${-35 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0 bg-yellow-500/10 border-b-0">
                  <span className="text-xs font-black uppercase text-center w-full block mt-4 tracking-widest">★ ARCADE ★</span>
                </PaperPanel>
                
                {/* Marquee Roof */}
                <div className="absolute bottom-full left-0 right-0" style={{ height: 60, transformOrigin: 'bottom center', transformStyle: 'preserve-3d', transform: `rotateX(${-90 * foldRatio}deg)` }}>
                  <PaperPanel skin={themeStyle} className="absolute inset-0" />
                </div>
              </div>

              {/* Bottom Control Deck Folds */}
              <div className="absolute top-full left-0 right-0" style={{ height: 70, transformOrigin: 'top center', transformStyle: 'preserve-3d', transform: `rotateX(${75 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0 bg-black/10">
                  {/* Joystick & Buttons Artwork */}
                  <div className="absolute bottom-3 left-4 w-6 h-6 rounded-full bg-red-600 border-2 border-red-800 shadow-md" />
                  <div className="absolute bottom-3 right-4 flex space-x-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500 border border-blue-700" />
                    <div className="w-5 h-5 rounded-full bg-yellow-500 border border-yellow-700" />
                  </div>
                </PaperPanel>

                {/* Front Base Box */}
                <div className="absolute top-full left-0 right-0" style={{ height: 100, transformOrigin: 'top center', transformStyle: 'preserve-3d', transform: `rotateX(${-75 * foldRatio}deg)` }}>
                  <PaperPanel skin={themeStyle} className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-16 bg-zinc-800 border-4 border-zinc-700 rounded flex flex-col items-center pt-2">
                      <div className="w-1.5 h-6 bg-red-500/80 rounded-full mb-1" />
                      <span className="text-[6px] text-white font-mono">25¢</span>
                    </div>
                  </PaperPanel>
                </div>
              </div>

              {/* Left Wing */}
              <div className="absolute right-full" style={{ top: -50, bottom: -170, width: 90, transformOrigin: 'right center', transformStyle: 'preserve-3d', transform: `rotateY(${-90 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 30% 0, 0 25%, 0 45%, 80% 45%, 80% 100%, 100% 100%)' }} />
              </div>

              {/* Right Wing */}
              <div className="absolute left-full" style={{ top: -50, bottom: -170, width: 90, transformOrigin: 'left center', transformStyle: 'preserve-3d', transform: `rotateY(${90 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 70% 0, 100% 25%, 100% 45%, 20% 45%, 20% 100%, 0 100%)' }} />
              </div>
            </div>
            );
          })()}

          {/* ================= MODEL 3: MAC-PET VINTAGE DESKTOP ================= */}
          {modelType === 'cyber-mac' && (() => {
            const mw = 130;
            const mh = 170;
            return (
            <div className="relative" style={{ width: mw, height: mh, transformStyle: 'preserve-3d' }}>
              
              {/* Front Faceplate */}
              <PaperPanel skin={themeStyle} className="absolute inset-0">
                <div className="w-full flex justify-between px-4 py-3 border-b border-current/10">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <span className="text-[8px] font-black tracking-widest">MAC-PET 128K</span>
                </div>

                <div className={`mx-4 my-3 h-24 rounded-2xl border-4 border-current ${themeStyle.screenColor} shadow-inner`}>
                   {/* Empty cutout for phone screen */}
                </div>

                <div className="absolute bottom-4 right-4 w-16 h-2 bg-black/60 rounded-sm border border-current/20 shadow-inner" />
              </PaperPanel>

              {/* Top Panel */}
              <div className="absolute bottom-full left-0 right-0" style={{ height: 90, transformOrigin: 'bottom center', transformStyle: 'preserve-3d', transform: `rotateX(${-90 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0">
                  <div className="w-full h-full flex flex-col justify-end p-4 space-y-2 opacity-30">
                    {[1,2,3,4].map(i => <div key={i} className="w-full h-1 bg-current rounded-full" />)}
                  </div>
                </PaperPanel>
              </div>

              {/* Left Panel */}
              <div className="absolute top-0 bottom-0 right-full" style={{ width: 90, transformOrigin: 'right center', transformStyle: 'preserve-3d', transform: `rotateY(${-90 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0">
                  <div className="w-full h-full flex items-center justify-start p-4 space-x-2 opacity-30">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-full w-1.5 bg-current rounded-full" />)}
                  </div>
                </PaperPanel>
              </div>

              {/* Right Panel */}
              <div className="absolute top-0 bottom-0 left-full" style={{ width: 90, transformOrigin: 'left center', transformStyle: 'preserve-3d', transform: `rotateY(${90 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0" />
              </div>

              {/* Bottom Rear Kickstand */}
              <div className="absolute top-full left-4 right-4" style={{ height: 120, transformOrigin: 'top center', transformStyle: 'preserve-3d', transform: `rotateX(${-45 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }}>
                   <div className="w-full h-full flex items-center justify-center p-4">
                     <div className="w-16 h-8 border-2 border-dashed border-current/40 rounded-lg flex items-center justify-center text-[8px] font-bold">CABLE</div>
                   </div>
                </PaperPanel>
              </div>

            </div>
            );
          })()}

          {/* ================= MODEL 4: FLAT FOLD TRIPOD ================= */}
          {modelType === 'flat-fold' && (() => {
            return (
            <div className="relative" style={{ width: 110, height: 160, transformStyle: 'preserve-3d' }}>
              {/* Main Backplate */}
              <PaperPanel skin={themeStyle} className="absolute inset-0 border-b-0" />

              {/* Top Rear Support Brace */}
              <div className="absolute bottom-full left-[15%] right-[15%]" style={{ height: 150, transformOrigin: 'bottom center', transformStyle: 'preserve-3d', transform: `rotateX(${-55 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0" style={{ clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)' }}>
                   <span className="absolute bottom-4 w-full text-center text-[10px] font-bold opacity-50">INTERLOCK</span>
                </PaperPanel>
              </div>

              {/* Bottom Phone Shelf */}
              <div className="absolute top-full left-0 right-0" style={{ height: 35, transformOrigin: 'top center', transformStyle: 'preserve-3d', transform: `rotateX(${75 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0 bg-black/5" />
              </div>
            </div>
            );
          })()}

          {/* ================= MODEL 5: MECH-PET ================= */}
          {modelType === 'mech-pet' && (() => {
            return (
            <div className="relative" style={{ width: 120, height: 170, transformStyle: 'preserve-3d' }}>
              {/* Main Body */}
              <PaperPanel skin={themeStyle} className="absolute inset-0">
                <div className="w-full h-full flex flex-col justify-between p-4">
                  <span className="text-[8px] font-bold uppercase">UNIT-01 EXOSUIT</span>
                  <div className="h-16 border-2 border-current rounded flex items-center justify-center space-x-4 px-2">
                     <div className="w-8 h-6 bg-current transform -skew-x-12" />
                     <div className="w-8 h-6 bg-current transform skew-x-12" />
                  </div>
                  <div className="w-full h-2 bg-current/20" />
                </div>
              </PaperPanel>

              {/* Pop-Up Ears */}
              <div className="absolute bottom-full left-4" style={{ width: 35, height: 40, transformOrigin: 'bottom center', transformStyle: 'preserve-3d', transform: `rotateX(${25 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
              </div>
              <div className="absolute bottom-full right-4" style={{ width: 35, height: 40, transformOrigin: 'bottom center', transformStyle: 'preserve-3d', transform: `rotateX(${25 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
              </div>

              {/* Grip Paws */}
              <div className="absolute top-full left-2" style={{ width: 30, height: 25, transformOrigin: 'top center', transformStyle: 'preserve-3d', transform: `rotateX(${90 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0" />
              </div>
              <div className="absolute top-full right-2" style={{ width: 30, height: 25, transformOrigin: 'top center', transformStyle: 'preserve-3d', transform: `rotateX(${90 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0" />
              </div>

              {/* A-Frame Brace */}
              <div className="absolute top-1/2 left-8 right-8" style={{ height: 160, transformOrigin: 'top center', transformStyle: 'preserve-3d', transform: `rotateX(${-50 * foldRatio}deg)` }}>
                <PaperPanel skin={themeStyle} className="absolute inset-0" style={{ clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)' }} />
              </div>
            </div>
            );
          })()}

        </div>
      </div>

      {/* Bottom Slider & Steps Control */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
        <div className="flex items-center space-x-4 w-full sm:w-2/3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
          <span className="text-[10px] font-black uppercase text-zinc-400 shrink-0">Fold Sequence:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={foldProgress}
            onChange={(e) => setFoldProgress(parseInt(e.target.value))}
            className="w-full accent-white bg-zinc-800 cursor-pointer h-2 rounded-full"
          />
          <span className="text-xs font-mono text-white font-bold shrink-0 w-12 text-right">
            {foldProgress}%
          </span>
        </div>

        <div className="flex space-x-2 shrink-0">
          <button onClick={() => setFoldProgress(0)} className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold uppercase tracking-wider rounded transition-all">
            Flat Sheet
          </button>
          <button onClick={() => setFoldProgress(100)} className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black text-[11px] font-bold uppercase tracking-wider rounded transition-all shadow-md">
            Assembled
          </button>
        </div>
      </div>

    </div>
  );
}
