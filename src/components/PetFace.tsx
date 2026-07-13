import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';

interface PetFaceProps {
  isSpeaking: boolean;
  isDistracted: boolean;
  lookOffset?: { x: number; y: number };
  expression?: {
    leftEyeOpen: number;   // 0 (closed) to 1 (fully open)
    rightEyeOpen: number;  // 0 to 1
    leftBrowRaise: number; // -1 (frown) to 1 (raised)
    rightBrowRaise: number;// -1 to 1
    mouthOpen: number;     // 0 to 1
  };
  micVolume?: number;
  isCalibrating?: boolean;
  isAsleep?: boolean;
  onWake?: () => void;
  // OLED Realistic Customizations
  oledTheme?: 'split' | 'cyan' | 'amber' | 'green' | 'white';
  pixelGrid?: boolean;
  glassShine?: boolean;
  showPCB?: boolean;
  brightness?: number;
  screenFlicker?: boolean;
}

export function PetFace({ 
  isSpeaking, 
  isDistracted, 
  lookOffset = { x: 0, y: 0 }, 
  expression, 
  micVolume = 0, 
  isCalibrating = false, 
  isAsleep = false, 
  onWake,
  oledTheme = 'split',
  pixelGrid = true,
  glassShine = true,
  showPCB = true,
  brightness = 100,
  screenFlicker = true
}: PetFaceProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [pixelShift, setPixelShift] = useState({ x: 0, y: 0 });

  const swipeRef = useRef({ x: 0, y: 0, dist: 0 });
  const petTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // OLED Burn-in protection: slightly shift the face every 10 seconds
    const shiftInterval = setInterval(() => {
      setPixelShift({
        x: Math.floor(Math.random() * 6) - 3, // -3px to +3px
        y: Math.floor(Math.random() * 6) - 3,
      });
    }, 10000);
    return () => clearInterval(shiftInterval);
  }, []);

  useEffect(() => {
    // Random blinking overlay to feel alive
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.4 && !isDistracted && !isPoked && !isAsleep && !isFeeding && !isPetting) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 120);
      }
    }, 2500);
    return () => clearInterval(blinkInterval);
  }, [isDistracted, isPoked, isAsleep, isFeeding, isPetting]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (onWake) onWake();
    swipeRef.current = { x: e.clientX, y: e.clientY, dist: 0 };
    if (isPoked || isFeeding || isPetting) return;
    setIsPoked(true);
    setTimeout(() => setIsPoked(false), 600);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons > 0) {
      const dx = e.clientX - swipeRef.current.x;
      const dy = e.clientY - swipeRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        swipeRef.current.dist += dist;
        swipeRef.current.x = e.clientX;
        swipeRef.current.y = e.clientY;

        if (swipeRef.current.dist > 150) {
           setIsPetting(true);
           if (onWake) onWake();
           clearTimeout(petTimeoutRef.current);
           petTimeoutRef.current = setTimeout(() => {
             setIsPetting(false);
             swipeRef.current.dist = 0;
           }, 1500);
        }
      }
    }
  };

  const handleFeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWake) onWake();
    if (isFeeding) return;
    setIsFeeding(true);
    setTimeout(() => setIsFeeding(false), 3000);
  };

  // Interpolate eyebrow transformations
  const leftBrowY = isAsleep ? 4 : isFeeding ? -15 : isPetting ? -8 : isPoked ? 0 : -8 - (expression?.leftBrowRaise ?? 0) * 8;
  const leftBrowRotate = isAsleep ? 0 : isFeeding ? -15 : isPetting ? -25 : isPoked ? -20 : (expression?.leftBrowRaise ?? 0) * 15;

  const rightBrowY = isAsleep ? 4 : isFeeding ? -15 : isPetting ? -8 : isPoked ? 0 : -8 - (expression?.rightBrowRaise ?? 0) * 8;
  const rightBrowRotate = isAsleep ? 0 : isFeeding ? 15 : isPetting ? 25 : isPoked ? 20 : -(expression?.rightBrowRaise ?? 0) * 15;

  // Determine eye scales based on tracking, random blinking, and micVolume
  const baseLeftOpen = expression ? expression.leftEyeOpen : 1.0;
  const baseRightOpen = expression ? expression.rightEyeOpen : 1.0;

  let leftEyeScaleY = isBlinking || isDistracted ? 0.08 : Math.max(0.08, baseLeftOpen);
  let rightEyeScaleY = isBlinking || isDistracted ? 0.08 : Math.max(0.08, baseRightOpen);

  if (isAsleep) {
    leftEyeScaleY = 0.02;
    rightEyeScaleY = 0.02;
  } else if (isPetting) {
    // Happy squint
    leftEyeScaleY = 0.2;
    rightEyeScaleY = 0.2;
  } else if (isPoked) {
    leftEyeScaleY = 0.1;
    rightEyeScaleY = 0.1;
  } else if (isFeeding) {
    leftEyeScaleY = 0.2;
    rightEyeScaleY = 0.2;
  } else if (!isSpeaking && !isDistracted) {
    // Widen eyes slightly when user speaks (listening)
    leftEyeScaleY = Math.min(1.5, leftEyeScaleY + micVolume * 0.4);
    rightEyeScaleY = Math.min(1.5, rightEyeScaleY + micVolume * 0.4);
  }

  // Combine speaker state and mouth tracker
  const mouthAnimate = isAsleep
    ? { height: "2px", width: "8px", borderRadius: "2px" }
    : isPetting
      ? { height: ["4px", "6px", "4px"], width: ["24px", "32px", "24px"], borderRadius: "8px" }
      : isFeeding
        ? { height: ["10px", "20px", "10px"], width: ["16px", "12px", "16px"], borderRadius: "50%" }
        : isPoked
          ? { height: "4px", width: "12px", borderRadius: "4px" }
          : isSpeaking
            ? {
                height: ["4px", "24px", "8px", "16px"],
                width: ["16px", "32px", "24px"],
                borderRadius: "4px",
              }
            : {
                height: `${4 + (expression?.mouthOpen ?? 0) * 28 + micVolume * 10}px`,
                width: `${16 + (expression?.mouthOpen ?? 0) * 20 + micVolume * 10}px`,
                borderRadius: (expression?.mouthOpen ?? 0) > 0.35 || micVolume > 0.2 ? "50%" : "4px",
              };

  // Face container animations
  const faceAnimate = isPoked
    ? { x: [-15, 15, -10, 10, 0], y: 5 }
    : isPetting
      ? { x: [-5, 5, -5, 5, 0], y: [-2, 2, -2] }
      : isCalibrating
        ? { x: [-20, 20, 10, -10, -20], y: [-5, 5, -5, 5, -5] }
        : { x: lookOffset.x, y: lookOffset.y };

  const faceTransition = isPoked
    ? { duration: 0.4 }
    : isPetting
      ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
      : isCalibrating
        ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        : { type: "spring", stiffness: 100, damping: 20 };

  const breathingAnimate = isAsleep
    ? { x: pixelShift.x, y: [pixelShift.y, 8 + pixelShift.y, pixelShift.y], scale: [1, 1.02, 1] }
    : isFeeding
      ? { x: pixelShift.x, y: [-2 + pixelShift.y, 2 + pixelShift.y, -2 + pixelShift.y], scale: [1, 1.05, 1] }
      : { x: pixelShift.x, y: [pixelShift.y, 2 + pixelShift.y, pixelShift.y] };

  const breathingTransition = isAsleep
    ? { repeat: Infinity, duration: 4, ease: "easeInOut" }
    : isFeeding
      ? { repeat: Infinity, duration: 0.3, ease: "easeInOut" }
      : { repeat: Infinity, duration: 2, ease: "easeInOut" };

  // Determine color theme palette
  let baseColor = "#00ffcc"; // Cyan (default / split bottom)
  if (oledTheme === 'cyan') baseColor = "#00ffcc";
  else if (oledTheme === 'amber') baseColor = "#ffb000";
  else if (oledTheme === 'green') baseColor = "#33ff33";
  else if (oledTheme === 'white') baseColor = "#f8fafc";
  else if (oledTheme === 'split') baseColor = "#00ffcc"; // Split uses cyan for face, yellow for header

  // For high authenticity, monochromatic themes remain purely monochromatic!
  // Split yellow/blue theme supports colorful states.
  let currentTheme = baseColor;
  if (oledTheme === 'split') {
    if (isPetting) currentTheme = "#ff66b2"; // Pink
    else if (isAsleep) currentTheme = "#4488ff"; // Indigo/Blue
    else if (isFeeding) currentTheme = "#66ff66"; // Green
    else if (isPoked) currentTheme = "#ff3333"; // Red
    else if (isSpeaking) currentTheme = "#cc66ff"; // Purple
  } else {
    // Monochromatic state shifts (slight intensity/brightness change or sleeping tint)
    if (isAsleep) {
      currentTheme = oledTheme === 'amber' ? "#cc6600" : oledTheme === 'green' ? "#11aa22" : oledTheme === 'cyan' ? "#0099aa" : "#94a3b8";
    }
  }

  const baseGlow = isAsleep ? 5 : 15 + (micVolume * 25);
  const glowShadow = `0 0 ${baseGlow}px ${currentTheme}`;

  // Helper render to avoid code duplication
  const renderOledScreen = () => {
    return (
      <div 
        className={`relative bg-[#010908] w-full h-full overflow-hidden flex flex-col justify-between border border-neutral-900 rounded-sm select-none ${screenFlicker ? 'animate-oled-flicker' : ''}`}
        style={{ 
          filter: `brightness(${brightness}%)`,
          boxShadow: "inset 0 4px 20px rgba(0,0,0,0.95)"
        }}
      >
        {/* Custom Dot-Matrix subpixel grid overlay */}
        {pixelGrid && (
          <div 
            className="absolute inset-0 pointer-events-none z-30 opacity-[0.35] mix-blend-multiply" 
            style={{
              backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.8) 10%, transparent 10%, transparent 90%, rgba(0,0,0,0.8) 90%), linear-gradient(0deg, rgba(0,0,0,0.8) 10%, transparent 10%, transparent 90%, rgba(0,0,0,0.8) 90%)',
              backgroundSize: '2.5px 2.5px'
            }} 
          />
        )}

        {/* Glossy glass reflection glare */}
        {glassShine && (
          <>
            {/* Corner curved glare */}
            <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_65%)]" />
            {/* Diagonal sheen glare */}
            <div className="absolute inset-0 pointer-events-none z-40 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.07]" />
          </>
        )}

        {/* OLED Top split-screen section (If split theme selected) */}
        {oledTheme === 'split' ? (
          <div 
            className="w-full flex items-center justify-between border-b border-amber-500/15 bg-amber-500/5 px-4 py-1.5 text-[8px] font-mono tracking-wider select-none shrink-0" 
            style={{ color: '#ffcc00', textShadow: '0 0 5px #ffcc00' }}
          >
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffcc00] animate-pulse shadow-[0_0_4px_#ffcc00]" />
              <span className="font-bold">I2C: 0x3C</span>
            </div>
            <div className="flex items-center space-x-3 text-[7px] opacity-90">
              <span>FPS: {(56.8 + Math.sin(Date.now() / 1000) * 1.5).toFixed(1)}</span>
              <span>VOL: {(micVolume * 100).toFixed(0)}%</span>
              <span className="font-bold border border-yellow-500/30 px-1 rounded-sm uppercase tracking-tighter scale-95 origin-right">{isSpeaking ? 'TALK' : 'IDLE'}</span>
            </div>
          </div>
        ) : (
          /* Simple status bar at the top for monochromatic themes */
          <div 
            className="w-full flex items-center justify-between px-4 py-1.5 text-[7px] font-mono select-none shrink-0" 
            style={{ color: currentTheme, textShadow: glowShadow, opacity: 0.6 }}
          >
            <span className="font-semibold uppercase">MONO_OLED_0.96</span>
            <span className="text-[6px] tracking-widest">{isAsleep ? 'SLEEP_OK' : 'ACTIVE_OK'}</span>
          </div>
        )}

        {/* Active Display Surface */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black/40">
          <motion.div animate={breathingAnimate} transition={breathingTransition} className="flex flex-col items-center relative scale-[0.82]">
            {isAsleep && (
              <motion.div 
                className="absolute -top-12 -right-10 font-bold tracking-widest text-xl opacity-0"
                animate={{ y: [-10, -35], x: [0, 15], opacity: [0, 0.7, 0], scale: [0.8, 1.2], color: currentTheme }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }}
                style={{ textShadow: glowShadow }}
              >
                Zzz
              </motion.div>
            )}
            {/* Eyes Container */}
            <motion.div 
              animate={faceAnimate}
              transition={faceTransition}
              className="flex items-center space-x-12 mb-10"
            >
              {/* Left Eye Container */}
              <div className="relative flex flex-col items-center">
                {/* Left Eyebrow */}
                <motion.div
                  animate={{ y: leftBrowY, rotate: leftBrowRotate, backgroundColor: currentTheme }}
                  transition={{ type: "spring", stiffness: 150, damping: 15 }}
                  className="absolute w-14 h-1.5 rounded-full"
                  style={{ top: -16, boxShadow: glowShadow }}
                />
                {/* Left Eye Ball */}
                <motion.div 
                  animate={{ scaleY: leftEyeScaleY, backgroundColor: currentTheme }}
                  transition={{ type: "spring", stiffness: 220, damping: 15 }}
                  className="w-14 h-14 rounded-sm origin-center"
                  style={{ boxShadow: glowShadow }}
                />
              </div>

              {/* Right Eye Container */}
              <div className="relative flex flex-col items-center">
                {/* Right Eyebrow */}
                <motion.div
                  animate={{ y: rightBrowY, rotate: rightBrowRotate, backgroundColor: currentTheme }}
                  transition={{ type: "spring", stiffness: 150, damping: 15 }}
                  className="absolute w-14 h-1.5 rounded-full"
                  style={{ top: -16, boxShadow: glowShadow }}
                />
                {/* Right Eye Ball */}
                <motion.div 
                  animate={{ scaleY: rightEyeScaleY, backgroundColor: currentTheme }}
                  transition={{ type: "spring", stiffness: 220, damping: 15 }}
                  className="w-14 h-14 rounded-sm origin-center"
                  style={{ boxShadow: glowShadow }}
                />
              </div>
            </motion.div>

            {/* Mouth */}
            <motion.div 
              animate={{ ...mouthAnimate, backgroundColor: currentTheme }}
              transition={(isSpeaking || isFeeding) ? {
                repeat: Infinity,
                duration: isFeeding ? 0.4 : 0.3,
                ease: "easeInOut",
              } : {
                type: "spring",
                stiffness: 180,
                damping: 14
              }}
              className="rounded-sm"
              style={{ boxShadow: glowShadow }}
            />
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div 
       className="flex flex-col items-center justify-center w-full h-full bg-[#030303] cursor-pointer select-none touch-none p-4 md:p-8"
       onPointerDown={handlePointerDown}
       onPointerMove={handlePointerMove}
       onDoubleClick={handleFeed}
    >
      <style>{`
        @keyframes oledFlicker {
          0% { opacity: 0.985; }
          25% { opacity: 1; }
          50% { opacity: 0.98; }
          75% { opacity: 0.995; }
          100% { opacity: 1; }
        }
        .animate-oled-flicker {
          animation: oledFlicker 0.12s infinite;
        }
      `}</style>

      {showPCB ? (
        /* Real physical SSD1306 PCB Module Wrapper */
        <div className="relative p-6 pb-8 rounded-xl bg-gradient-to-b from-[#111625] via-[#0b101d] to-[#0a0d18] border-2 border-[#1e293b] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.05)] max-w-xl w-full aspect-[1.4/1] flex flex-col items-center justify-between border-t-[#334155] border-l-[#334155] select-none transition-all">
          
          {/* PCB Texture / Traces overlay */}
          <div className="absolute inset-0 overflow-hidden rounded-xl opacity-30 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="pcb-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                {/* Grid of vias and thin traces */}
                <path d="M 15 0 L 15 15 L 30 30 L 30 60 M 45 0 L 45 15 L 60 30 L 60 60" fill="none" stroke="#2c3e50" strokeWidth="1" opacity="0.6"/>
                <circle cx="15" cy="15" r="1.5" fill="#2c3e50" />
                <circle cx="45" cy="15" r="1.5" fill="#2c3e50" />
                <path d="M 0 45 L 15 45 L 30 30 L 60 30" fill="none" stroke="#2c3e50" strokeWidth="1" opacity="0.6" />
                <circle cx="15" cy="45" r="2" fill="none" stroke="#2c3e50" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#pcb-pattern)" />
              {/* Main thick power and ground traces routing to pins */}
              <path d="M 230 40 L 230 80 L 120 120 M 270 40 L 270 90 L 400 120 M 310 40 L 310 70 L 360 100" fill="none" stroke="#3b4d61" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 120 120 L 120 180 L 80 220" fill="none" stroke="#3b4d61" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 400 120 L 400 200 L 450 250" fill="none" stroke="#3b4d61" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Physical Surface Mount Components */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Main Processor Chip (ESP32 style) */}
            <div className="absolute bottom-16 left-12 w-14 h-14 bg-zinc-950 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-zinc-800 flex items-center justify-center">
               <div className="w-8 h-8 rounded-full border border-zinc-800/50" />
               <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-zinc-800/80" /> {/* Pin 1 dot */}
               <span className="absolute bottom-2 right-2 text-[4px] text-zinc-600 font-mono font-bold rotate-90">ESP32-WROOM</span>
               {/* Chip pins */}
               <div className="absolute -left-1 top-1 bottom-1 w-1 flex flex-col justify-between py-1">
                 {Array.from({length: 8}).map((_, i) => <div key={`l-${i}`} className="h-[2px] w-full bg-zinc-400" />)}
               </div>
               <div className="absolute -right-1 top-1 bottom-1 w-1 flex flex-col justify-between py-1">
                 {Array.from({length: 8}).map((_, i) => <div key={`r-${i}`} className="h-[2px] w-full bg-zinc-400" />)}
               </div>
               <div className="absolute -top-1 left-1 right-1 h-1 flex justify-between px-1">
                 {Array.from({length: 8}).map((_, i) => <div key={`t-${i}`} className="w-[2px] h-full bg-zinc-400" />)}
               </div>
               <div className="absolute -bottom-1 left-1 right-1 h-1 flex justify-between px-1">
                 {Array.from({length: 8}).map((_, i) => <div key={`b-${i}`} className="w-[2px] h-full bg-zinc-400" />)}
               </div>
            </div>

            {/* Wifi Antenna Zig-zag Trace */}
            <div className="absolute bottom-32 left-10 w-8 h-12">
               <svg width="100%" height="100%" viewBox="0 0 20 40" xmlns="http://www.w3.org/2000/svg">
                 <path d="M 2 38 L 2 2 L 18 2 L 18 10 L 6 10 L 6 18 L 18 18 L 18 26 L 6 26 L 6 34 L 18 34 L 18 40" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinejoin="miter" opacity="0.6"/>
               </svg>
            </div>

            {/* SMD Capacitors and Resistors near power */}
            <div className="absolute top-16 left-1/2 -translate-x-12 flex space-x-2">
               <div className="w-1.5 h-3 bg-zinc-200 rounded-[1px] shadow-sm relative"><div className="absolute inset-y-0 left-0 right-0 m-auto h-[70%] bg-amber-700" /></div>
               <div className="w-1.5 h-3 bg-zinc-200 rounded-[1px] shadow-sm relative"><div className="absolute inset-y-0 left-0 right-0 m-auto h-[70%] bg-amber-700" /></div>
               <div className="w-1.5 h-3 bg-zinc-200 rounded-[1px] shadow-sm relative"><div className="absolute inset-y-0 left-0 right-0 m-auto h-[70%] bg-zinc-900"><span className="text-[2px] text-zinc-400 absolute inset-0 flex items-center justify-center rotate-90">103</span></div></div>
            </div>

            {/* Tactile Reset Button */}
            <div className="absolute bottom-12 right-12 w-6 h-6 bg-zinc-300 rounded-[2px] shadow-[0_2px_5px_rgba(0,0,0,0.6)] border-b-2 border-zinc-400 flex items-center justify-center">
               <div className="w-4 h-4 bg-zinc-900 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] border border-black/50" />
               <div className="absolute -left-1 top-1 w-1 h-1 bg-zinc-400" />
               <div className="absolute -left-1 bottom-1 w-1 h-1 bg-zinc-400" />
               <div className="absolute -right-1 top-1 w-1 h-1 bg-zinc-400" />
               <div className="absolute -right-1 bottom-1 w-1 h-1 bg-zinc-400" />
               <span className="absolute -bottom-4 text-[5px] text-zinc-500 font-bold tracking-widest uppercase">EN / RST</span>
            </div>
          </div>

          {/* Circular brass mounting screw holes at the corners */}
          <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 via-amber-700 to-yellow-600 shadow-inner flex items-center justify-center border border-yellow-400/30">
            <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
            {/* Solder mask clearing ring */}
            <div className="absolute inset-[-2px] rounded-full border border-amber-500/20 pointer-events-none" />
          </div>
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 via-amber-700 to-yellow-600 shadow-inner flex items-center justify-center border border-yellow-400/30">
            <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
            <div className="absolute inset-[-2px] rounded-full border border-amber-500/20 pointer-events-none" />
          </div>
          <div className="absolute bottom-3 left-3 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 via-amber-700 to-yellow-600 shadow-inner flex items-center justify-center border border-yellow-400/30">
            <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
            <div className="absolute inset-[-2px] rounded-full border border-amber-500/20 pointer-events-none" />
          </div>
          <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 via-amber-700 to-yellow-600 shadow-inner flex items-center justify-center border border-yellow-400/30">
            <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
            <div className="absolute inset-[-2px] rounded-full border border-amber-500/20 pointer-events-none" />
          </div>

          {/* Golden Pin markings & header socket header at the top */}
          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 flex space-x-6 bg-zinc-950 px-6 py-2.5 rounded-b-lg border-x border-b border-zinc-800 shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-10">
            {['GND', 'VCC', 'SCL', 'SDA'].map((pin) => (
              <div key={pin} className="flex flex-col items-center relative">
                {/* Solder pad */}
                <div className="absolute -bottom-1 w-3 h-1.5 bg-amber-600/30 rounded-[100%] blur-[1px]" />
                {/* Silver metallic header pin */}
                <div className="w-2 h-3.5 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.8)] border border-zinc-500/50" />
                <span className="text-[7px] font-bold text-amber-500 mt-2 tracking-widest leading-none" style={{textShadow: "0 1px 2px rgba(0,0,0,0.8)"}}>{pin}</span>
              </div>
            ))}
          </div>

          {/* Tactile hardware status LEDs (glowing power & blinking active) */}
          <div className="absolute top-12 left-10 flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-[2px] opacity-60" />
              <div className="relative w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444,inset_0_1px_2px_rgba(255,255,255,0.4)] border border-red-700" />
            </div>
            <span className="text-[7px] font-bold text-zinc-400 tracking-widest font-mono">PWR</span>
          </div>
          <div className="absolute top-12 right-10 flex items-center space-x-2">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-[2px] transition-opacity duration-75 ${micVolume > 0.05 || isSpeaking ? 'bg-green-400 opacity-60' : 'opacity-0'}`} />
              <div className={`relative w-2.5 h-2.5 rounded-full transition-all duration-75 border ${micVolume > 0.05 || isSpeaking ? 'bg-green-400 shadow-[0_0_8px_#4ade80,inset_0_1px_2px_rgba(255,255,255,0.4)] border-green-600' : 'bg-green-950 border-green-900'}`} />
            </div>
            <span className="text-[7px] font-bold text-zinc-400 tracking-widest font-mono">ACT</span>
          </div>

          {/* Substrate printed circuit marks */}
          <div className="absolute bottom-4 right-10 flex flex-col items-end">
            <span className="text-[7px] font-mono text-zinc-500 uppercase select-none font-bold tracking-widest">
              REV_1.4_ESP32
            </span>
            <div className="flex space-x-1 mt-1">
              <div className="w-1 h-1 bg-zinc-600 rounded-full" />
              <div className="w-1 h-1 bg-zinc-600 rounded-full" />
              <div className="w-1 h-1 bg-zinc-600 rounded-full" />
            </div>
          </div>

          {/* OLED Screen Bezel/Well inside PCB */}
          <div className="w-[88%] aspect-[128/64] mt-10 bg-[#050505] border-[3px] border-[#111] rounded-sm p-1 relative overflow-hidden shadow-[inset_0_5px_15px_rgba(0,0,0,1),0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between z-10">
            {/* Screen bezel inner edge highlight */}
            <div className="absolute inset-0 pointer-events-none rounded-sm border border-zinc-800/30 z-50" />
            {renderOledScreen()}
          </div>

          {/* Silkscreen text on PCB board bottom */}
          <div className="absolute bottom-4 left-10 text-[9px] tracking-[0.2em] font-mono text-zinc-400 select-none uppercase font-bold">
            0.96" I2C OLED
          </div>
        </div>
      ) : (
        /* Full Frame / Bezel-less direct glass panel display mode */
        <div className="w-full h-full max-w-4xl max-h-[500px] aspect-[128/64] border-2 border-zinc-800 rounded-lg relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
          {renderOledScreen()}
        </div>
      )}
    </div>
  );
}
