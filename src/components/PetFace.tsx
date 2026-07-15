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
  micPitch?: number;
  isCalibrating?: boolean;
  isAsleep?: boolean;
  onWake?: () => void;
  // OLED Realistic Customizations
  oledTheme?: 'split' | 'cyan' | 'amber' | 'green' | 'white' | 'dynamic';
  character?: 'classic' | 'cyber' | 'kawaii' | 'pensive' | 'furious' | 'chaotic';
  pixelGrid?: boolean;
  glassShine?: boolean;
  showPCB?: boolean;
  brightness?: number;
  screenFlicker?: boolean;
  isNightTime?: boolean;
  isAffirmative?: boolean;
}

export function PetFace({ 
  isSpeaking, 
  isDistracted, 
  lookOffset = { x: 0, y: 0 }, 
  expression, 
  micVolume = 0, 
  micPitch = 0,
  isCalibrating = false, 
  isAsleep = false, 
  onWake,
  oledTheme = 'split',
  character = 'classic',
  pixelGrid = true,
  glassShine = true,
  showPCB = true,
  brightness = 100,
  screenFlicker = true,
  isNightTime = false,
  isAffirmative = false
}: PetFaceProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [isNudging, setIsNudging] = useState(false);
  const [pixelShift, setPixelShift] = useState({ x: 0, y: 0 });
  const [idleOffset, setIdleOffset] = useState({ x: 0, y: 0 });

  const swipeRef = useRef({ x: 0, y: 0, dist: 0 });
  const petTimeoutRef = useRef<any>(null);
  const idleIntervalRef = useRef<any>(null);
  const interactionTimeoutRef = useRef<any>(null);

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
      if (Math.random() > 0.4 && !isPoked && !isAsleep && !isFeeding && !isPetting) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 120);
      }
    }, 2500);
    return () => clearInterval(blinkInterval);
  }, [isPoked, isAsleep, isFeeding, isPetting]);

  useEffect(() => {
    if (isDistracted && !isAsleep) {
      idleIntervalRef.current = setInterval(() => {
        setIdleOffset({
          x: (Math.random() - 0.5) * 40,
          y: (Math.random() - 0.5) * 20,
        });
      }, 2000);
    } else {
      setIdleOffset({ x: 0, y: 0 });
      if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
    }
    return () => clearInterval(idleIntervalRef.current);
  }, [isDistracted, isAsleep]);

  // Gentle tactile haptic feedback on mobile devices using standard Vibration API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (isBlinking) {
        navigator.vibrate(10); // Super subtle 10ms crisp tap when the pet blinks
      }
    }
  }, [isBlinking]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (isPoked) {
        navigator.vibrate([35, 40, 35]); // Sensation of physical touch/poke collision
      } else if (isPetting) {
        navigator.vibrate([15, 60, 15]); // Gentle stroke/petting ripple feel
      } else if (isFeeding) {
        navigator.vibrate([25, 30, 25, 30, 25]); // Rhythmic chewing/swallowing rumble
      } else if (isNudging) {
        navigator.vibrate([20, 50]); // Dual nudge tap
      }
    }
  }, [isPoked, isPetting, isFeeding, isNudging]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (isAsleep) {
        navigator.vibrate([40, 120, 40]); // Slow smooth transition as pet drifts off
      } else {
        navigator.vibrate(40); // Standard quick wake up hum
      }
    }
  }, [isAsleep]);

  const prevCharacterRef = useRef(character);
  useEffect(() => {
    if (character !== prevCharacterRef.current) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([20, 15, 20]); // Light double-click feel when switching expression themes
      }
      prevCharacterRef.current = character;
    }
  }, [character]);

  useEffect(() => {
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    if (!isSpeaking && !isAsleep && !isPoked && !isPetting && !isFeeding && !isDistracted) {
      interactionTimeoutRef.current = setTimeout(() => {
        if (Math.random() > 0.4) {
          setIsNudging(true);
          setTimeout(() => setIsNudging(false), 600);
        } else {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 150);
        }
      }, 5000);
    }
    return () => clearTimeout(interactionTimeoutRef.current);
  }, [isSpeaking, lookOffset.x, lookOffset.y, isAsleep, isPoked, isPetting, isFeeding, isDistracted]);

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
  let leftBrowY = isAsleep ? 4 : isFeeding ? -15 : isPetting ? -8 : isPoked ? 0 : isDistracted ? -4 : -8 - (expression?.leftBrowRaise ?? 0) * 8;
  let leftBrowRotate = isAsleep ? 0 : isFeeding ? -15 : isPetting ? -25 : isPoked ? -20 : isDistracted ? -15 : (expression?.leftBrowRaise ?? 0) * 15;

  let rightBrowY = isAsleep ? 4 : isFeeding ? -15 : isPetting ? -8 : isPoked ? 0 : isDistracted ? -4 : -8 - (expression?.rightBrowRaise ?? 0) * 8;
  let rightBrowRotate = isAsleep ? 0 : isFeeding ? 15 : isPetting ? 25 : isPoked ? 20 : isDistracted ? 15 : -(expression?.rightBrowRaise ?? 0) * 15;

  if (character === 'pensive' && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    leftBrowY = -24;
    leftBrowRotate = -5;
    rightBrowY = -4;
    rightBrowRotate = -25;
  } else if (character === 'furious' && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    leftBrowY = -4;
    leftBrowRotate = 25;
    rightBrowY = -4;
    rightBrowRotate = -25;
  } else if (character === 'chaotic' && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    leftBrowY = -20;
    leftBrowRotate = -30;
    rightBrowY = -16;
    rightBrowRotate = 30;
  }

  // Determine eye scales and border radii based on tracking, random blinking, and micVolume
  const baseLeftOpen = expression ? expression.leftEyeOpen : 1.0;
  const baseRightOpen = expression ? expression.rightEyeOpen : 1.0;

  let leftEyeScaleY = isBlinking ? 0.08 : Math.max(0.08, baseLeftOpen);
  let rightEyeScaleY = isBlinking ? 0.08 : Math.max(0.08, baseRightOpen);
  let eyeBorderRadius = "4px";
  let browBorderRadius = "9999px";

  if (isAsleep) {
    leftEyeScaleY = 0.02;
    rightEyeScaleY = 0.02;
    eyeBorderRadius = "2px";
  } else if (isPetting) {
    // Happy squint
    leftEyeScaleY = 0.25;
    rightEyeScaleY = 0.25;
    eyeBorderRadius = "16px 16px 4px 4px";
  } else if (isPoked) {
    // Surprised wide eyes
    leftEyeScaleY = 1.1;
    rightEyeScaleY = 1.1;
    eyeBorderRadius = "50%";
  } else if (isFeeding) {
    // Content squint
    leftEyeScaleY = 0.2;
    rightEyeScaleY = 0.2;
    eyeBorderRadius = "8px";
  } else if (isDistracted) {
    // Droopy sad eyes
    leftEyeScaleY = 0.6;
    rightEyeScaleY = 0.6;
    eyeBorderRadius = "16px 16px 40% 40%";
  } else if (!isSpeaking && !isDistracted) {
    // Pitch-Reactive Expressions
    if (micPitch > 1000) {
      // High pitch: surprise, wide eyes
      leftEyeScaleY = 1.3;
      rightEyeScaleY = 1.3;
      eyeBorderRadius = "50%";
      leftBrowY = -24;
      rightBrowY = -24;
    } else if (micPitch > 50 && micPitch < 400 && micVolume > 0.1) {
      // Low pitch: squint / pensive
      leftEyeScaleY = 0.5;
      rightEyeScaleY = 0.5;
      eyeBorderRadius = "20%";
      leftBrowY = -4;
      leftBrowRotate = -10;
      rightBrowY = -4;
      rightBrowRotate = 10;
    } else {
      // Widen eyes slightly when user speaks normally (listening)
      leftEyeScaleY = Math.min(1.5, leftEyeScaleY + micVolume * 0.4);
      rightEyeScaleY = Math.min(1.5, rightEyeScaleY + micVolume * 0.4);
      if (micVolume > 0.1) eyeBorderRadius = "8px 8px 12px 12px";
    }
  }

  // Character Overrides
  let eyeWidth = 56;
  if (character === 'kawaii') {
    eyeWidth = 64;
    // kawaii eyes are super round unless sleeping/squinting
    if (!isAsleep && !isBlinking && !isPetting && !isFeeding) {
      eyeBorderRadius = "50%";
    }
  } else if (character === 'cyber') {
    eyeWidth = 40;
    eyeBorderRadius = "0px";
    browBorderRadius = "0px";
  } else if (character === 'furious' && !isAsleep && !isBlinking && !isPetting && !isFeeding) {
    leftEyeScaleY = 0.4;
    rightEyeScaleY = 0.4;
    eyeBorderRadius = "0px";
  } else if (character === 'chaotic' && !isAsleep && !isBlinking && !isPetting && !isFeeding) {
    leftEyeScaleY = 1.1;
    rightEyeScaleY = 0.7;
    eyeBorderRadius = "50%";
  } else if (character === 'pensive' && !isAsleep && !isBlinking && !isPetting && !isFeeding) {
    leftEyeScaleY = 0.9;
    rightEyeScaleY = 0.6;
    eyeBorderRadius = "40%";
  }

  // Combine speaker state and mouth tracker
  let mouthAnimate: any = isAsleep
    ? { height: "8px", width: "12px", borderRadius: "4px" }
    : isPetting
      ? { height: ["12px", "20px", "12px"], width: ["28px", "36px", "28px"], borderRadius: "4px 4px 24px 24px" } // Happy smile
      : isFeeding
        ? { height: ["12px", "28px", "12px"], width: ["20px", "16px", "20px"], borderRadius: "50%" } // Chewing
        : isPoked
          ? { height: "28px", width: "24px", borderRadius: "50%" } // O-shape surprise
          : isSpeaking
            ? {
                height: ["12px", "32px", "16px", "24px"],
                width: ["24px", "40px", "32px", "36px"],
                borderRadius: ["8px", "16px", "12px", "20px"],
              }
            : isDistracted
              ? { height: "12px", width: "20px", borderRadius: "12px 12px 4px 4px" } // Sad / disconnected frown
              : {
                  height: `${8 + (expression?.mouthOpen ?? 0) * 36 + micVolume * 16}px`,
                  width: `${24 + (expression?.mouthOpen ?? 0) * 24 + micVolume * 12}px`,
                  borderRadius: (expression?.mouthOpen ?? 0) > 0.4 || micVolume > 0.2 ? "16px" : "8px",
                };

  if (character === 'kawaii') {
    if (typeof mouthAnimate.borderRadius === 'string' && !isSpeaking && !isFeeding && !isPoked && !isAsleep) {
      mouthAnimate.borderRadius = "50% 50% 16px 16px";
    }
  } else if (character === 'cyber') {
    mouthAnimate.borderRadius = "0px";
  } else if (character === 'furious' && !isSpeaking && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    mouthAnimate.height = "4px";
    mouthAnimate.width = "40px";
    mouthAnimate.borderRadius = "50% 50% 0 0";
    mouthAnimate.rotate = 0;
  } else if (character === 'chaotic' && !isSpeaking && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    mouthAnimate.height = ["8px", "12px", "4px", "8px"];
    mouthAnimate.width = ["20px", "28px", "24px", "20px"];
    mouthAnimate.rotate = [-5, 5, -5];
    mouthAnimate.borderRadius = "2px";
  } else if (character === 'pensive' && !isSpeaking && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    mouthAnimate.height = "6px";
    mouthAnimate.width = "12px";
    mouthAnimate.rotate = -15;
    mouthAnimate.x = 8;
  }

  let mouthTransition: any = isPoked 
    ? { duration: 0.4 }
    : (isSpeaking || isFeeding || isPetting) ? {
    repeat: Infinity,
    duration: isFeeding ? 0.4 : isPetting ? 2 : 0.3,
    ease: "easeInOut",
  } : {
    type: "spring",
    stiffness: 600,
    damping: 30
  };

  if (character === 'chaotic' && !isSpeaking && !isAsleep && !isFeeding && !isPetting && !isPoked) {
    mouthTransition = { repeat: Infinity, duration: 0.15, ease: "linear" };
  }

  // Face container animations
  let faceAnimate: any = isPoked
    ? { x: [-15, 15, -10, 10, 0], y: 5 }
    : isNudging
      ? { x: [lookOffset.x, lookOffset.x + 12, lookOffset.x - 6, lookOffset.x], y: [lookOffset.y, lookOffset.y - 8, lookOffset.y + 4, lookOffset.y], rotate: [0, 8, -4, 0] }
    : isPetting
      ? { x: [-5, 5, -5, 5, 0], y: [-2, 2, -2] }
      : isCalibrating
        ? { x: [-20, 20, 10, -10, -20], y: [-5, 5, -5, 5, -5] }
        : isDistracted
          ? { x: idleOffset.x, y: idleOffset.y }
          : { x: lookOffset.x, y: lookOffset.y };

  if (character === 'chaotic' && !isAsleep) {
    faceAnimate = {
      x: [lookOffset.x - 2, lookOffset.x + 2, lookOffset.x - 1, lookOffset.x + 1, lookOffset.x],
      y: [lookOffset.y - 1, lookOffset.y + 1, lookOffset.y - 2, lookOffset.y + 2, lookOffset.y]
    };
  } else if (character === 'furious' && !isAsleep) {
    faceAnimate = {
      ...faceAnimate,
      scale: [1, 1.03, 1]
    };
  } else if (character === 'pensive' && !isAsleep) {
    faceAnimate = {
      ...faceAnimate,
      y: [lookOffset.y - 4, lookOffset.y + 4, lookOffset.y - 4],
      filter: ["blur(0.5px)", "blur(1.5px)", "blur(0.5px)"]
    };
  }

  let faceTransition: any = isPoked
    ? { duration: 0.4 }
    : isNudging
      ? { duration: 0.6, ease: "easeInOut" }
    : isPetting
      ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
      : isCalibrating
        ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        : isDistracted
          ? { type: "tween", duration: 1.5, ease: "easeInOut" }
          : { type: "spring", stiffness: 400, damping: 30 };

  if (character === 'chaotic' && !isAsleep) {
    faceTransition = { repeat: Infinity, duration: 0.15, ease: "linear" };
  } else if (character === 'furious' && !isAsleep) {
    faceTransition = { repeat: Infinity, duration: 0.3, ease: "easeInOut" };
  } else if (character === 'pensive' && !isAsleep) {
    faceTransition = { repeat: Infinity, duration: 4, ease: "easeInOut" };
  }

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
  else if (oledTheme === 'dynamic') baseColor = isNightTime ? "#6366f1" : "#33ff33"; // Default dynamic active is green (indigo in night mode)

  // For high authenticity, monochromatic themes remain purely monochromatic!
  // Split yellow/blue theme supports colorful states.
  let currentTheme = baseColor;
  if (oledTheme === 'split') {
    if (isPetting) currentTheme = "#ff66b2"; // Pink
    else if (isAsleep) currentTheme = "#4488ff"; // Indigo/Blue
    else if (isFeeding) currentTheme = "#66ff66"; // Green
    else if (isPoked) currentTheme = "#ff3333"; // Red
    else if (isSpeaking) currentTheme = "#cc66ff"; // Purple
  } else if (oledTheme === 'dynamic') {
    if (isAsleep) currentTheme = "#4488ff"; // Blue when asleep
    else if (isSpeaking) currentTheme = "#00ffcc"; // Cool cyan when processing/speaking
    else if (micVolume > 0.05) currentTheme = "#ffb000"; // Warm amber when listening
    else if (isPetting) currentTheme = "#ff66b2"; // Pink
    else if (isPoked) currentTheme = "#ff3333"; // Red
    else if (isFeeding) currentTheme = "#66ff66"; // Green
    else currentTheme = isNightTime ? "#6366f1" : "#33ff33"; // Soothing Indigo/blue in night mode, green when active during the day
  } else {
    // Monochromatic state shifts (slight intensity/brightness change or sleeping tint)
    if (isAsleep) {
      currentTheme = oledTheme === 'amber' ? "#cc6600" : oledTheme === 'green' ? "#11aa22" : oledTheme === 'cyan' ? "#0099aa" : "#94a3b8";
    }
  }

  let baseGlow = isAsleep ? 5 : 15 + (micVolume * 25);
  if (character === 'furious') baseGlow += 10;
  if (character === 'pensive') baseGlow -= 5;
  
  let glowShadow = `0 0 ${baseGlow}px ${currentTheme}`;
  if (character === 'chaotic' && !isAsleep) {
    glowShadow = `-4px 0 0 rgba(255,0,0,0.8), 4px 0 0 rgba(0,255,255,0.8), 0 0 ${baseGlow}px ${currentTheme}`;
  }

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
                  animate={{ width: eyeWidth, y: leftBrowY, rotate: leftBrowRotate, borderRadius: browBorderRadius, backgroundColor: currentTheme }}
                  transition={{ type: "spring", stiffness: 600, damping: 30 }}
                  className="absolute h-1"
                  style={{ top: -16, boxShadow: glowShadow }}
                />
                {/* Left Eye Ball */}
                <motion.div 
                  animate={{ width: eyeWidth, height: leftEyeScaleY * 56, borderRadius: eyeBorderRadius, borderColor: currentTheme }}
                  transition={{ type: "spring", stiffness: 800, damping: 35 }}
                  className="origin-center border-[4px] bg-transparent relative"
                  style={{ boxShadow: glowShadow }}
                >
                  {character === 'kawaii' && !isAsleep && !isBlinking && (
                    <motion.div 
                      className="absolute top-1 right-2 w-3 h-3 rounded-full bg-white opacity-80 mix-blend-screen"
                      style={{ boxShadow: "0 0 4px white" }}
                    />
                  )}
                  {character === 'cyber' && !isAsleep && !isBlinking && (
                    <motion.div 
                      className="absolute inset-y-2 left-1 right-1 border-y-[2px]"
                      style={{ borderColor: currentTheme, opacity: 0.5 }}
                    />
                  )}
                </motion.div>
              </div>

              {/* Right Eye Container */}
              <div className="relative flex flex-col items-center">
                {/* Right Eyebrow */}
                <motion.div
                  animate={{ width: eyeWidth, y: rightBrowY, rotate: rightBrowRotate, borderRadius: browBorderRadius, backgroundColor: currentTheme }}
                  transition={{ type: "spring", stiffness: 600, damping: 30 }}
                  className="absolute h-1"
                  style={{ top: -16, boxShadow: glowShadow }}
                />
                {/* Right Eye Ball */}
                <motion.div 
                  animate={{ width: eyeWidth, height: rightEyeScaleY * 56, borderRadius: eyeBorderRadius, borderColor: currentTheme }}
                  transition={{ type: "spring", stiffness: 800, damping: 35 }}
                  className="origin-center border-[4px] bg-transparent relative"
                  style={{ boxShadow: glowShadow }}
                >
                  {character === 'kawaii' && !isAsleep && !isBlinking && (
                    <motion.div 
                      className="absolute top-1 right-2 w-3 h-3 rounded-full bg-white opacity-80 mix-blend-screen"
                      style={{ boxShadow: "0 0 4px white" }}
                    />
                  )}
                  {character === 'cyber' && !isAsleep && !isBlinking && (
                    <motion.div 
                      className="absolute inset-y-2 left-1 right-1 border-y-[2px]"
                      style={{ borderColor: currentTheme, opacity: 0.5 }}
                    />
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Mouth */}
            <motion.div 
              animate={{ ...mouthAnimate, borderColor: currentTheme }}
              transition={mouthTransition}
              className="rounded-sm border-[4px] bg-transparent"
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
