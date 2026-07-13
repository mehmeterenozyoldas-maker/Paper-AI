import React, { useState } from 'react';

interface PaperTemplateProps {
  onClose: () => void;
}

export function PaperTemplate({ onClose }: PaperTemplateProps) {
  const [complexity, setComplexity] = useState<'simple' | 'advanced'>('simple');

  return (
    <div className="absolute inset-0 bg-white text-black z-50 overflow-auto flex flex-col font-sans">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Robot Enclosure Blueprint</h2>
          <p className="text-gray-500 text-sm">Print this on A4 or Letter paper. Ensure scale is set to 100%.</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setComplexity('simple')}
              className={`px-4 py-1.5 text-sm font-bold uppercase tracking-wider rounded-md transition-colors ${complexity === 'simple' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
            >
              Simple
            </button>
            <button 
              onClick={() => setComplexity('advanced')}
              className={`px-4 py-1.5 text-sm font-bold uppercase tracking-wider rounded-md transition-colors ${complexity === 'advanced' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
            >
              Advanced
            </button>
          </div>
          <button 
            onClick={() => window.print()} 
            className="px-6 py-2 border-2 border-black font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
          >
            Print
          </button>
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 print:p-0">
         {/* SVG Blueprint */}
         <svg viewBox="0 0 800 800" className="w-full h-auto max-w-4xl stroke-current text-black fill-none">
            {/* Title / Legend */}
            <text x="400" y="50" textAnchor="middle" className="text-2xl font-bold fill-current stroke-none">Antonio's Paper Pet — Smartphone Sleeve</text>
            <text x="400" y="80" textAnchor="middle" className="text-sm font-mono fill-gray-600 stroke-none">— Solid lines: Cut | Dotted lines: Fold —</text>
            
            {/* Fold Lines (Dashed) */}
            <g stroke="black" strokeWidth="2" strokeDasharray="6,6" fill="none">
              {/* Vertical folds */}
              <line x1="300" y1="200" x2="300" y2="600" />
              <line x1="350" y1="200" x2="350" y2="600" />
              <line x1="550" y1="200" x2="550" y2="600" />
              <line x1="600" y1="200" x2="600" y2="600" />
              
              {/* Horizontal folds (top flaps) */}
              <line x1="100" y1="200" x2="300" y2="200" />
              <line x1="300" y1="200" x2="350" y2="200" />
              <line x1="350" y1="200" x2="550" y2="200" />
              <line x1="550" y1="200" x2="600" y2="200" />
              
              {/* Top tuck flap fold */}
              <line x1="355" y1="150" x2="545" y2="150" />
            </g>

            {/* Cut Lines (Solid) */}
            <g stroke="black" strokeWidth="2" fill="none">
              {/* Bottom edge (open for sliding the phone in) */}
              <line x1="100" y1="600" x2="600" y2="600" />
              
              {/* Left edge of Back */}
              <line x1="100" y1="600" x2="100" y2="200" />
              
              {/* Back Dust Flap */}
              <path d="M 100 200 L 100 150 L 295 150 L 295 200" />
              
              {/* Left Dust Flap */}
              <path d="M 305 200 L 305 150 L 345 150 L 345 200" />
              
              {/* Front Top Cover & Tuck Flap */}
              <path d="M 355 200 L 355 150 L 370 120 L 530 120 L 545 150 L 545 200" />
              
              {/* Right Dust Flap */}
              <path d="M 555 200 L 555 150 L 595 150 L 595 200" />
              
              {/* Right Glue Flap */}
              <path d="M 600 200 L 630 220 L 630 580 L 600 600" />
              
              {/* Screen Cutout */}
              <rect x="375" y="260" width="150" height="260" rx="8" />
              
              {/* iPhone SE Front Camera Cutout (Top Bezel) */}
              <circle cx="450" cy="230" r="12" />
              
              {/* iPhone SE Home Button Area Guide (Bottom Bezel) */}
              <circle cx="450" cy="555" r="16" strokeDasharray="3,3" />
            </g>

            {/* Labels */}
            <g className="fill-gray-400 stroke-none font-bold text-sm tracking-widest text-center">
              <text x="200" y="400" textAnchor="middle">BACK</text>
              <text x="450" y="450" textAnchor="middle">FRONT</text>
              
              {/* Rotated Labels */}
              <g transform="translate(325, 400) rotate(-90)">
                <text x="0" y="0" textAnchor="middle">LEFT</text>
              </g>
              <g transform="translate(575, 400) rotate(-90)">
                <text x="0" y="0" textAnchor="middle">RIGHT</text>
              </g>
              <g transform="translate(615, 400) rotate(-90)">
                <text x="0" y="0" textAnchor="middle" className="text-xs">GLUE HERE</text>
              </g>
            </g>

            {/* Instruction Callouts */}
            <g className="fill-black stroke-none text-[9px] font-mono">
              <text x="450" y="390" textAnchor="middle">MAIN OLED VIEWPORT</text>
              <text x="450" y="210" textAnchor="middle" className="font-bold fill-red-600">CUT OUT FRONT CAMERA (MUST BE CLEAR)</text>
              <text x="450" y="580" textAnchor="middle">HOME BUTTON ALIGNMENT</text>
              <text x="450" y="138" textAnchor="middle">TUCK FLAP</text>
              <text x="450" y="630" textAnchor="middle">SLIDE PHONE IN HERE (TOP FIRST)</text>
            </g>

            {/* Advanced Pieces */}
            {complexity === 'advanced' && (
              <g>
                {/* Decorative Ears */}
                <g stroke="black" strokeWidth="2" fill="none">
                  {/* Left Ear */}
                  <path d="M 680 200 L 720 120 L 760 200 Z" />
                  <line x1="680" y1="200" x2="760" y2="200" strokeDasharray="4,4" />
                  <text x="720" y="180" textAnchor="middle" className="fill-black stroke-none text-[8px] font-mono">L EAR</text>
                  <text x="720" y="210" textAnchor="middle" className="fill-gray-400 stroke-none text-[8px] font-mono">GLUE TO TOP L</text>
                  
                  {/* Right Ear */}
                  <path d="M 680 260 L 720 180 L 760 260 Z" transform="translate(0, 40)" />
                  <line x1="680" y1="300" x2="760" y2="300" strokeDasharray="4,4" />
                  <text x="720" y="280" textAnchor="middle" className="fill-black stroke-none text-[8px] font-mono">R EAR</text>
                  <text x="720" y="310" textAnchor="middle" className="fill-gray-400 stroke-none text-[8px] font-mono">GLUE TO TOP R</text>
                </g>

                {/* Back Stand Prop */}
                <g stroke="black" strokeWidth="2" fill="none">
                  <path d="M 680 350 L 760 350 L 760 550 L 680 550 Z" />
                  <line x1="680" y1="400" x2="760" y2="400" strokeDasharray="4,4" />
                  <line x1="680" y1="520" x2="760" y2="520" strokeDasharray="4,4" />
                  
                  <text x="720" y="380" textAnchor="middle" className="fill-gray-400 stroke-none text-[8px] font-mono">GLUE TO BACK</text>
                  <text x="720" y="460" textAnchor="middle" className="fill-black stroke-none text-[10px] font-bold tracking-widest" transform="rotate(-90 720 460)">STAND</text>
                  <text x="720" y="540" textAnchor="middle" className="fill-gray-400 stroke-none text-[8px] font-mono">BASE FOLD</text>
                </g>

                {/* Title for Advanced Pieces */}
                <text x="720" y="80" textAnchor="middle" className="fill-black stroke-none text-xs font-bold uppercase tracking-wider">Adv. Pieces</text>
              </g>
            )}
         </svg>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .absolute.inset-0, .absolute.inset-0 * {
            visibility: visible;
          }
          .absolute.inset-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 0;
          }
        }
      `}} />
    </div>
  );
}
