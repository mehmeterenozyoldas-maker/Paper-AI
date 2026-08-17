import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Coffee, 
  Droplet, 
  Activity, 
  Sparkles, 
  Flame, 
  RotateCcw,
  CheckCircle2,
  X
} from 'lucide-react';

interface DeskHabitsProps {
  onClose: () => void;
  onCompanionReact?: (action: 'feed' | 'water' | 'stretch' | 'coffee') => void;
  focusScore: number;
}

interface PetStats {
  happiness: number; // 0-100
  energy: number;    // 0-100
  hydrationCount: number;
  streakDays: number;
  lastStretchTime: number;
}

const STORAGE_KEY = 'antonio_pet_stats_v1';

export function DeskHabits({ onClose, onCompanionReact, focusScore }: DeskHabitsProps) {
  const [stats, setStats] = useState<PetStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      happiness: 85,
      energy: 90,
      hydrationCount: 2,
      streakDays: 3,
      lastStretchTime: Date.now() - 3600000,
    };
  });

  const [activeStretch, setActiveStretch] = useState<number | null>(null);
  const [stretchTimer, setStretchTimer] = useState<number>(30);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {}
  }, [stats]);

  // Stretch countdown
  useEffect(() => {
    if (activeStretch === null) return;
    if (stretchTimer <= 0) {
      setActiveStretch(null);
      setStretchTimer(30);
      setStats(prev => ({
        ...prev,
        energy: Math.min(100, prev.energy + 15),
        happiness: Math.min(100, prev.happiness + 10),
        lastStretchTime: Date.now(),
      }));
      showToast("🧘 Great stretch! Ergonomic energy restored.");
      if (onCompanionReact) onCompanionReact('stretch');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 80]);
      }
      return;
    }
    const timer = setInterval(() => setStretchTimer(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [activeStretch, stretchTimer]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleHydrate = () => {
    setStats(prev => ({
      ...prev,
      hydrationCount: prev.hydrationCount + 1,
      happiness: Math.min(100, prev.happiness + 8),
      energy: Math.min(100, prev.energy + 5),
    }));
    showToast("💧 Hydrated! Stay refreshed & sharp.");
    if (onCompanionReact) onCompanionReact('water');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 30, 20]);
    }
  };

  const handleGiveCoffee = () => {
    setStats(prev => ({
      ...prev,
      energy: Math.min(100, prev.energy + 20),
      happiness: Math.min(100, prev.happiness + 5),
    }));
    showToast("☕ Companion energized with cyber-caffeine!");
    if (onCompanionReact) onCompanionReact('coffee');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 50]);
    }
  };

  const handleGiveSnack = () => {
    setStats(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
    }));
    showToast("🍪 Companion happily munched on a pixel treat!");
    if (onCompanionReact) onCompanionReact('feed');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([25, 25, 25]);
    }
  };

  const stretches = [
    { title: "20-20-20 Eye Rest", desc: "Look at an object 20 feet away for 20 seconds to relieve optic strain." },
    { title: "Neck & Chin Tucks", desc: "Draw your head straight back, aligning ears over shoulders to reset posture." },
    { title: "Shoulder Blade Pinches", desc: "Roll shoulders backward and squeeze blades together for 5 deep breaths." },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0e1217] border border-[#00ffcc]/30 rounded-lg max-w-lg w-full p-6 text-zinc-100 font-mono shadow-[0_0_40px_rgba(0,255,204,0.15)] relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-[#00ffcc]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest text-[#00ffcc] uppercase">Desk Companion Care</h2>
              <p className="text-[10px] text-zinc-400">Ergonomic habits, vitals & wellness tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mb-4 py-2 px-3 bg-[#00ffcc]/10 border border-[#00ffcc] text-[#00ffcc] text-xs rounded-md flex items-center space-x-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Companion Vitals Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-md">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5">
              <span className="flex items-center space-x-1">
                <Heart className="w-3.5 h-3.5 text-pink-400" />
                <span>Happiness</span>
              </span>
              <span className="font-bold text-pink-400">{Math.round(stats.happiness)}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-pink-500 h-full transition-all duration-500" style={{ width: `${stats.happiness}%` }} />
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-md">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5">
              <span className="flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Energy</span>
              </span>
              <span className="font-bold text-amber-400">{Math.round(stats.energy)}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${stats.energy}%` }} />
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-md">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5">
              <span className="flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span>Focus</span>
              </span>
              <span className="font-bold text-[#00ffcc]">{Math.round(focusScore)}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#00ffcc] h-full transition-all duration-500" style={{ width: `${focusScore}%` }} />
            </div>
          </div>
        </div>

        {/* Quick Actions / Care Dispenser */}
        <div className="space-y-2 mb-5">
          <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Companion Care Actions</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={handleHydrate}
              className="p-2.5 rounded-md border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 flex flex-col items-center justify-center space-y-1 transition-all"
            >
              <Droplet className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-bold">Log Water ({stats.hydrationCount})</span>
            </button>

            <button
              onClick={handleGiveCoffee}
              className="p-2.5 rounded-md border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 flex flex-col items-center justify-center space-y-1 transition-all"
            >
              <Coffee className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold">Boost Caffeine</span>
            </button>

            <button
              onClick={handleGiveSnack}
              className="p-2.5 rounded-md border border-pink-500/30 bg-pink-950/20 hover:bg-pink-950/40 text-pink-300 flex flex-col items-center justify-center space-y-1 transition-all"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-[10px] font-bold">Feed Treat</span>
            </button>
          </div>
        </div>

        {/* Ergonomic Desk Stretch Routine */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-400">
            <span>30s Ergonomic Micro-Break</span>
            {activeStretch !== null && (
              <span className="text-amber-400 animate-pulse font-bold">{stretchTimer}s REMAINING</span>
            )}
          </div>

          <div className="space-y-1.5">
            {stretches.map((s, idx) => (
              <div 
                key={idx}
                className={`p-2.5 rounded-md border text-xs transition-all flex items-center justify-between ${
                  activeStretch === idx
                    ? 'border-amber-500 bg-amber-950/30 text-white'
                    : 'border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-0.5 max-w-[280px]">
                  <div className="font-bold text-[11px] text-zinc-200">{s.title}</div>
                  <div className="text-[9px] text-zinc-400 leading-tight">{s.desc}</div>
                </div>

                <button
                  onClick={() => {
                    if (activeStretch === idx) {
                      setActiveStretch(null);
                      setStretchTimer(30);
                    } else {
                      setActiveStretch(idx);
                      setStretchTimer(30);
                    }
                  }}
                  className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-sm border transition-all ${
                    activeStretch === idx
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'bg-zinc-900 border-zinc-700 text-[#00ffcc] hover:border-[#00ffcc]'
                  }`}
                >
                  {activeStretch === idx ? 'Cancel' : 'Start'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[9px] text-zinc-500">
          <span>Desk Health Streak: {stats.streakDays} Days</span>
          <button
            onClick={() => {
              setStats({
                happiness: 100,
                energy: 100,
                hydrationCount: 0,
                streakDays: 1,
                lastStretchTime: Date.now(),
              });
              showToast("Vitals reset to 100%.");
            }}
            className="flex items-center space-x-1 hover:text-zinc-300"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Stats</span>
          </button>
        </div>

      </div>
    </div>
  );
}
