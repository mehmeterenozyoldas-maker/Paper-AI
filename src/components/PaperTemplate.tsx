import React, { useState, useRef } from 'react';
import { 
  Printer, 
  X, 
  Info, 
  Smartphone, 
  Gamepad2, 
  Cpu, 
  Scissors, 
  Wrench, 
  ChevronRight, 
  Check, 
  Layers, 
  Sparkles,
  Download,
  Sliders,
  Maximize2,
  Rotate3d,
  Compass,
  Palette,
  Eye,
  FileCode,
  Zap,
  Box
} from 'lucide-react';
import { Paper3DFoldingViewer } from './Paper3DFoldingViewer';

interface PaperTemplateProps {
  onClose: () => void;
}

export type ModelType = 'cyber-mac' | 'mech-pet' | 'arcade' | 'flat-fold' | 'parametric';
export type SkinTheme = 'blueprint' | 'cyber' | 'retro' | 'craft' | 'kawaii' | 'clean';

export function PaperTemplate({ onClose }: PaperTemplateProps) {
  const [selectedModel, setSelectedModel] = useState<ModelType>('parametric');
  const [skinTheme, setSkinTheme] = useState<SkinTheme>('craft');
  const [viewMode, setViewMode] = useState<'blueprint' | '3d-simulator'>('3d-simulator');
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [hoveredDescription, setHoveredDescription] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'steps' | 'parametric' | 'materials' | 'tips'>('steps');

  // Parametric Dimensions in mm
  const [phoneWidth, setPhoneWidth] = useState<number>(71.5);
  const [phoneHeight, setPhoneHeight] = useState<number>(147.5);
  const [phoneThickness, setPhoneThickness] = useState<number>(8.0);
  const [bezelPadding, setBezelPadding] = useState<number>(4.0);
  const [notchType, setNotchType] = useState<'pill' | 'notch' | 'punchhole' | 'none'>('pill');

  const svgContainerRef = useRef<HTMLDivElement>(null);

  const presets = [
    { label: 'iPhone SE / 8', w: 67.3, h: 138.4, t: 7.3, b: 8.0, n: 'none' as const },
    { label: 'iPhone 15/16 Pro', w: 71.5, h: 147.5, t: 7.8, b: 3.5, n: 'pill' as const },
    { label: 'iPhone 16 Pro Max', w: 76.7, h: 159.9, t: 8.2, b: 3.0, n: 'pill' as const },
    { label: 'Galaxy S23/S24', w: 70.6, h: 147.0, t: 7.6, b: 3.5, n: 'punchhole' as const },
    { label: 'Google Pixel 8/9', w: 70.8, h: 150.5, t: 8.9, b: 4.0, n: 'punchhole' as const },
    { label: 'iPad Mini (Small Tab)', w: 134.8, h: 195.4, t: 6.3, b: 7.0, n: 'none' as const },
  ];

  const downloadSVG = () => {
    if (!svgContainerRef.current) return;
    const svgElement = svgContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `paper-pet-${selectedModel}-${skinTheme}-blueprint.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePartHover = (partName: string, desc: string) => {
    setHoveredPart(partName);
    setHoveredDescription(desc);
  };

  const handlePartLeave = () => {
    setHoveredPart(null);
    setHoveredDescription(null);
  };

  // Comprehensive ground-up model specifications
  const modelSpecs: Record<ModelType, {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    description: string;
    targetDevices: string;
    dimensions: string;
    assemblyTime: string;
    glueRequired: string;
    features: string[];
    steps: string[];
  }> = {
    'cyber-mac': {
      title: "Mac-Pet 1984 Vintage Desktop",
      subtitle: "Retro Macintosh Computer Desk Housing",
      icon: <Box className="w-5 h-5 text-amber-400" />,
      description: "An homage to the iconic 1984 Macintosh computer. Features authentic horizontal cooling slats, 3.5\" floppy disk slot artwork, classic bevel CRT screen viewport, and a built-in 20° ergonomic rear easel kickstand.",
      targetDevices: "All smartphones (up to 6.8\" display)",
      dimensions: "155 mm H x 105 mm W x 85 mm D (Assembled)",
      assemblyTime: "5 - 8 mins",
      glueRequired: "Glue or tape on 2 side tabs",
      features: [
        "Curved vintage CRT monitor viewport for nostalgic aesthetics",
        "Classic 3.5\" floppy drive slot & rainbow power badge",
        "20° rear tilt wedge with integrated USB cable canal",
        "Reinforced twin side walls for rigid structural desktop balance"
      ],
      steps: [
        "Perimeter Cut: Cut out the entire outer solid line including the main body, side walls, and rear easel.",
        "Aperture Scoring: Carefully cut out the CRT screen window and camera notch using a craft knife.",
        "Pre-Crease Score: Use a ruler and blunt stylus to score all dashed fold lines.",
        "Fold Side Walls: Fold left and right ventilation panels backward at 90°.",
        "Easel Kickstand: Fold the rear triangular support flap back 45° and lock the bottom tab.",
        "Mount & Boot: Slide your phone through the top sleeve and awaken your retro companion!"
      ]
    },
    'mech-pet': {
      title: "Mech-Pet Gundam Exoskeleton",
      subtitle: "Robotic Companion Armor with Pop-Up Ears",
      icon: <Cpu className="w-5 h-5 text-[#00ffcc]" />,
      description: "Futuristic mecha companion chassis engineered with pop-up cat ears, geometric visor frame, printed PCB copper circuit traces, fold-forward safety grip paws, and an A-frame stabilizing kickstand.",
      targetDevices: "Universal (Portrait or Landscape docking)",
      dimensions: "165 mm H x 115 mm W x 90 mm D",
      assemblyTime: "6 - 10 mins",
      glueRequired: "Minimal (2 glue tabs)",
      features: [
        "Articulated fold-forward claws to firmly lock device onto cradle",
        "3D pop-up mecha antennas/ears with futuristic polygon styling",
        "Futuristic cyber armor PCB artwork with sci-fi telemetry decals",
        "Wide-stance A-frame rear exoskeleton support strut"
      ],
      steps: [
        "Excise Armor: Cut along the outer outline including the ear flaps and bottom claw grips.",
        "Pop-Up Ears: Fold the antenna ears slightly forward along their upper base creases.",
        "Fold Grip Paws: Bend the left and right holding paws forward 90° to create the bottom cradle lip.",
        "A-Frame Brace: Fold the rear stabilizer strut backward by 45° and glue the cross-brace.",
        "Engage Companion: Dock phone onto the paws. The companion is now armored and ready!"
      ]
    },
    'arcade': {
      title: "Retro Arcade Mini-Cabinet",
      subtitle: "Coin-Op Tabletop Arcade Housing",
      icon: <Gamepad2 className="w-5 h-5 text-pink-400" />,
      description: "A tabletop mini arcade cabinet that wraps around your smartphone. Features a lighted marquee header, angled side cabinet wings, coin insert slot, and joystick/button artwork deck.",
      targetDevices: "Smartphones 5.4\" to 6.7\" (iPhone, Galaxy, Pixel)",
      dimensions: "170 mm H x 100 mm W x 95 mm D",
      assemblyTime: "7 - 12 mins",
      glueRequired: "Glue or double-sided tape",
      features: [
        "Slanted display angle matching authentic 1980s coin-op cabinets",
        "Marquee header banner ('★ CYBER PET ARCADE ★')",
        "Joystick & button deck acts as the front safety shelf",
        "Large side wings featuring retro pixel art flourishes"
      ],
      steps: [
        "Excise Cabinet: Cut around the outer perimeter of the marquee, side panels, and control deck.",
        "Screen Cutout: Slice out the interior screen bezel with a ruler and hobby knife.",
        "Fold Side Wings: Fold the left and right arcade wings backward at 90°.",
        "Fold Control Deck: Crease the joystick shelf forward to form the 3D phone resting base.",
        "Secure Marquee: Fold the top marquee overhang forward to complete the coin-op silhouette."
      ]
    },
    'flat-fold': {
      title: "Zero-Glue Origami Desk Cradle",
      subtitle: "Smart Slit-and-Tab Interlocking Stand",
      icon: <Scissors className="w-5 h-5 text-emerald-400" />,
      description: "A single-sheet origami desk stand that requires ZERO glue or tape. Precision interlocking tabs snap into laser-aligned slots, creating an ultra-sturdy 60°/45° dual-angle phone cradle in under 2 minutes.",
      targetDevices: "Universal (Any phone or small e-reader)",
      dimensions: "140 mm H x 85 mm W x 80 mm D",
      assemblyTime: "2 - 3 mins",
      glueRequired: "NONE (100% Glue-Free Interlocking)",
      features: [
        "Zero adhesive required — 100% mechanical interlocking tabs",
        "Dual viewing angle support (60° deep focus / 45° glance mode)",
        "Fastest assembly time: cut, score, fold & snap together in 90 seconds",
        "Flat-folds into a book or notebook for effortless portability"
      ],
      steps: [
        "Single Cut: Cut along the outer perimeter and the 2 small internal slit slots (A & B).",
        "Score Creases: Score the 4 dashed fold lines thoroughly with a stylus.",
        "Fold Cradle Lip: Fold the bottom catch tray upward.",
        "Interlock Stand: Fold the rear triangular spine back and insert Tab 1 into Slot A.",
        "Ready Instantly: No drying time needed! Place your phone on the cradle immediately."
      ]
    },
    'parametric': {
      title: "Parametric Custom Millimeter Sleeve",
      subtitle: "Live Algorithmic Geometric Customizer",
      icon: <Sliders className="w-5 h-5 text-cyan-400" />,
      description: "A dynamically generated vector blueprint customized to the exact millimeter dimensions of any phone or mini-tablet. Real-time adjusts screen aperture, side spines, notch styles, and glue tabs.",
      targetDevices: "Custom User Millimeters (Phone, Tablet, E-Reader)",
      dimensions: `${phoneWidth.toFixed(1)} mm x ${phoneHeight.toFixed(1)} mm x ${phoneThickness.toFixed(1)} mm`,
      assemblyTime: "4 - 6 mins",
      glueRequired: "Single side glue tab",
      features: [
        "Real-time geometric vector recalculation based on millimeter sliders",
        "Integrated physical 50mm calibration scale bar for 1:1 print verification",
        "Selectable camera apertures: Dynamic Island, Punch Hole, Notch, Clean",
        "Vector SVG download compatible with Cricut / Silhouette cutting plotters"
      ],
      steps: [
        "Tune Sliders: Set exact width, height, thickness, and bezel padding in the Custom Dims tab.",
        "Print Calibration: Print at 100% scale and verify the 50mm ruler with a physical ruler.",
        "Excise Viewport: Cut out the display window and the chosen camera aperture cutout.",
        "Score & Fold: Score all dashed lines with a blunt stylus before folding.",
        "Glue Flap: Fasten the side adhesive tab to construct the custom form-fit sleeve."
      ]
    }
  };

  const materials = [
    { name: "Heavy Cardstock (180-250 gsm)", detail: "Standard printer paper is too flimsy. Cardstock or watercolor paper provides rigid, long-lasting desktop structures." },
    { name: "Craft Knife & Cutting Mat", detail: "A precision hobby knife (X-Acto or similar) ensures crisp corner cuts for screen viewports and camera holes." },
    { name: "Ruler & Scoring Tool", detail: "Use a blunt stylus, bone folder, or dry ballpoint pen to score dashed lines before folding for razor-sharp machine edges." },
    { name: "Adhesive Tape or Glue Stick", detail: "Double-sided tape strips or quick-dry PVA craft glue for tabs (not needed for Zero-Glue Origami model)." }
  ];

  const assemblyTips = [
    { title: "Always Score Before Folding", text: "Scoring indents the paper fibers without cutting through them. Always use a ruler to guide your scoring tool across dashed lines." },
    { title: "Camera Aperture Clearance", text: "Cut the camera viewport slightly wider than your lens to give the companion's computer vision an unobstructed field of view." },
    { title: "Cable Management Canal", text: "Feed your charging cable through the bottom dock opening before setting the phone inside to prevent strain on the paper base." },
    { title: "Printer Scale Setting: 100%", text: "When printing, ensure your printer dialog is set to '100%' or 'Actual Size' (do NOT select 'Fit to Page') to ensure 1:1 true scale." }
  ];

  // Visual styling for SVG canvas based on selected skin theme
  const getCanvasSkinClasses = () => {
    switch (skinTheme) {
      case 'cyber':
        return {
          wrapper: 'bg-[#05110d] text-emerald-300 border-emerald-500/40',
          svgStroke: 'stroke-emerald-400',
          svgFillText: 'fill-emerald-400',
          accent: '#10b981',
          gridLine: 'rgba(16,185,129,0.12)',
        };
      case 'retro':
        return {
          wrapper: 'bg-[#f4efe4] text-[#4a3f35] border-[#a39478]',
          svgStroke: 'stroke-[#78350f]',
          svgFillText: 'fill-[#78350f]',
          accent: '#b45309',
          gridLine: 'rgba(120,53,15,0.08)',
        };
      case 'craft':
        return {
          wrapper: 'bg-[#d8bc97] text-[#3e2c18] border-[#8a683f]',
          svgStroke: 'stroke-[#451a03]',
          svgFillText: 'fill-[#451a03]',
          accent: '#78350f',
          gridLine: 'rgba(69,26,3,0.1)',
        };
      case 'kawaii':
        return {
          wrapper: 'bg-[#fff0f5] text-[#9d174d] border-pink-300',
          svgStroke: 'stroke-pink-500',
          svgFillText: 'fill-pink-600',
          accent: '#ec4899',
          gridLine: 'rgba(236,72,153,0.12)',
        };
      case 'clean':
        return {
          wrapper: 'bg-white text-zinc-900 border-zinc-300',
          svgStroke: 'stroke-black',
          svgFillText: 'fill-black',
          accent: '#18181b',
          gridLine: 'rgba(0,0,0,0.06)',
        };
      case 'blueprint':
      default:
        return {
          wrapper: 'bg-[#0a192f] text-[#00ffcc] border-cyan-500/40',
          svgStroke: 'stroke-[#00ffcc]',
          svgFillText: 'fill-[#00ffcc]',
          accent: '#00ffcc',
          gridLine: 'rgba(0,255,204,0.12)',
        };
    }
  };

  const canvasStyle = getCanvasSkinClasses();

  return (
    <div className="fixed inset-0 bg-[#0a0d10] text-white z-50 overflow-hidden flex flex-col font-sans select-none print:bg-white print:text-black">
      
      {/* ================= TOP HEADER BAR ================= */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-6 py-4 border-b border-zinc-800 bg-[#101418] print:hidden gap-4 z-20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-md bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-[#00ffcc]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black tracking-widest text-white uppercase">Papercraft Companion Studio</h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/40">
                v2.0 Redesign
              </span>
            </div>
            <p className="text-zinc-400 text-xs mt-0.5">Engineered origami desk enclosures, 3D folding simulator & 1:1 true-scale blueprints</p>
          </div>
        </div>

        {/* Center Mode Switcher: 2D Blueprint vs 3D Origami Simulator */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-md text-xs">
          <button
            onClick={() => setViewMode('blueprint')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 font-bold uppercase tracking-wider rounded-sm transition-all ${
              viewMode === 'blueprint'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>2D Blueprint & Cut Plan</span>
          </button>

          <button
            onClick={() => setViewMode('3d-simulator')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 font-bold uppercase tracking-wider rounded-sm transition-all ${
              viewMode === '3d-simulator'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Rotate3d className="w-4 h-4" />
            <span>3D Origami Simulator</span>
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-2 w-full lg:w-auto justify-end">
          {/* Skin Theme Dropdown / Pills */}
          <div className="hidden xl:flex items-center space-x-1 bg-zinc-900/80 p-1 rounded-md border border-zinc-800 text-[10px]">
            <Palette className="w-3.5 h-3.5 text-zinc-400 ml-1.5 mr-0.5" />
            {[
              { id: 'craft', label: 'Cardboard' },
              { id: 'clean', label: 'Matte White' },
              { id: 'retro', label: '1984 Beige' },
              { id: 'kawaii', label: 'Pastel' },
              { id: 'blueprint', label: 'Cyanotype' },
              { id: 'cyber', label: 'Dark Foil' },
            ].map((skin) => (
              <button
                key={skin.id}
                onClick={() => setSkinTheme(skin.id as SkinTheme)}
                className={`px-2 py-1 rounded-xs font-bold transition-all ${
                  skinTheme === skin.id
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {skin.label}
              </button>
            ))}
          </div>

          <button
            onClick={downloadSVG}
            title="Download crisp vector SVG for Cricut, Silhouette, or Laser Plotters"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 transition-all font-bold uppercase tracking-widest text-xs rounded-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export SVG</span>
          </button>

          <button
            onClick={() => window.print()}
            title="Print blueprint directly at 100% 1:1 scale on A4 or US Letter"
            className="flex items-center space-x-1.5 px-4 py-2 bg-zinc-900 hover:bg-white hover:text-black text-white border border-white/30 transition-all font-bold uppercase tracking-widest text-xs rounded-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center space-x-1 px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white transition-all font-bold uppercase tracking-widest text-xs rounded-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN SPLIT VIEWPORT ================= */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#07090b] print:bg-white print:overflow-visible">
        
        {/* LEFT COLUMN: MODEL SELECTOR, METADATA & WORKSHOP MANUAL (Hidden on print) */}
        <div className="w-full lg:w-[420px] border-r border-zinc-800/90 flex flex-col bg-[#0d1014] overflow-y-auto print:hidden shrink-0 z-10">
          
          {/* 1. CHOOSE MODEL TILES */}
          <div className="p-4 border-b border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center space-x-1.5">
                <Box className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span>1. Select Origami Enclosure</span>
              </span>
              <span className="text-[9px] font-mono text-zinc-500">5 Models</span>
            </div>

            <div className="space-y-1.5">
              {(Object.keys(modelSpecs) as ModelType[]).map((mId) => {
                const isSelected = selectedModel === mId;
                const spec = modelSpecs[mId];
                return (
                  <button
                    key={mId}
                    onClick={() => {
                      setSelectedModel(mId);
                      handlePartLeave();
                    }}
                    className={`w-full p-2.5 rounded-md border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-white bg-white/10 text-white shadow-[0_2px_10px_rgba(255,255,255,0.05)]'
                        : 'border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className={`p-2 rounded-sm bg-zinc-900 shrink-0 ${isSelected ? 'text-white border border-white/30' : 'text-zinc-400'}`}>
                        {spec.icon}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-xs tracking-wide uppercase truncate text-zinc-100">{spec.title}</div>
                        <div className="text-[10px] text-zinc-400 truncate">{spec.subtitle}</div>
                      </div>
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 text-white shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CHOSEN MODEL SPECIFICATION CARD */}
          <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/60">
            <div className="flex items-center space-x-2 text-[#00ffcc]">
              {modelSpecs[selectedModel].icon}
              <h2 className="font-black text-xs uppercase tracking-wider">{modelSpecs[selectedModel].title}</h2>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">{modelSpecs[selectedModel].description}</p>
            
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/60 text-[10px] font-mono">
              <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                <span className="text-zinc-500 uppercase block text-[8px]">Assembly Time</span>
                <span className="text-zinc-200 font-bold">{modelSpecs[selectedModel].assemblyTime}</span>
              </div>
              <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                <span className="text-zinc-500 uppercase block text-[8px]">Adhesive</span>
                <span className="text-emerald-400 font-bold">{modelSpecs[selectedModel].glueRequired}</span>
              </div>
            </div>
          </div>

          {/* 3. WORKSHOP MANUAL TABS */}
          <div className="flex border-b border-zinc-800 text-[11px]">
            <button 
              onClick={() => setActiveTab('steps')}
              className={`flex-1 py-2.5 text-center font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === 'steps' ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Steps
            </button>
            <button 
              onClick={() => {
                setActiveTab('parametric');
                setSelectedModel('parametric');
              }}
              className={`flex-1 py-2.5 text-center font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === 'parametric' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Custom Dims
            </button>
            <button 
              onClick={() => setActiveTab('materials')}
              className={`flex-1 py-2.5 text-center font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === 'materials' ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Materials
            </button>
            <button 
              onClick={() => setActiveTab('tips')}
              className={`flex-1 py-2.5 text-center font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === 'tips' ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Pro Tips
            </button>
          </div>

          {/* TAB CONTENT AREA */}
          <div className="flex-1 p-4 overflow-y-auto">
            
            {/* PARAMETRIC CONTROLS TAB */}
            {activeTab === 'parametric' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-cyan-400">
                  <Sliders className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Live Millimeter Customizer</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Real-time recalculated geometric folding layout. Automatically scales front viewport, side spines, notch apertures, and glue flaps.
                </p>

                {/* Quick Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] uppercase font-bold text-zinc-400">Device Presets</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    {presets.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPhoneWidth(p.w);
                          setPhoneHeight(p.h);
                          setPhoneThickness(p.t);
                          setBezelPadding(p.b);
                          setNotchType(p.n);
                          setSelectedModel('parametric');
                        }}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-cyan-400 rounded-sm text-left transition-all text-zinc-200 truncate"
                      >
                        <div className="font-bold truncate">{p.label}</div>
                        <div className="text-[8px] text-zinc-500">{p.w} x {p.h} mm</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400 font-bold uppercase">Device Width:</span>
                      <span className="font-mono text-cyan-400 font-bold">{phoneWidth.toFixed(1)} mm</span>
                    </div>
                    <input 
                      type="range" 
                      min="55" 
                      max="160" 
                      step="0.5" 
                      value={phoneWidth} 
                      onChange={(e) => {
                        setPhoneWidth(parseFloat(e.target.value));
                        setSelectedModel('parametric');
                      }}
                      className="w-full accent-cyan-400 bg-zinc-800 cursor-pointer h-1.5 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400 font-bold uppercase">Device Height:</span>
                      <span className="font-mono text-cyan-400 font-bold">{phoneHeight.toFixed(1)} mm</span>
                    </div>
                    <input 
                      type="range" 
                      min="110" 
                      max="240" 
                      step="0.5" 
                      value={phoneHeight} 
                      onChange={(e) => {
                        setPhoneHeight(parseFloat(e.target.value));
                        setSelectedModel('parametric');
                      }}
                      className="w-full accent-cyan-400 bg-zinc-800 cursor-pointer h-1.5 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400 font-bold uppercase">Device Thickness:</span>
                      <span className="font-mono text-cyan-400 font-bold">{phoneThickness.toFixed(1)} mm</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="18" 
                      step="0.2" 
                      value={phoneThickness} 
                      onChange={(e) => {
                        setPhoneThickness(parseFloat(e.target.value));
                        setSelectedModel('parametric');
                      }}
                      className="w-full accent-cyan-400 bg-zinc-800 cursor-pointer h-1.5 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400 font-bold uppercase">Bezel Border:</span>
                      <span className="font-mono text-cyan-400 font-bold">{bezelPadding.toFixed(1)} mm</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="14" 
                      step="0.5" 
                      value={bezelPadding} 
                      onChange={(e) => {
                        setBezelPadding(parseFloat(e.target.value));
                        setSelectedModel('parametric');
                      }}
                      className="w-full accent-cyan-400 bg-zinc-800 cursor-pointer h-1.5 rounded"
                    />
                  </div>

                  {/* Notch aperture selection */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase block">Camera Cutout Style:</span>
                    <div className="grid grid-cols-4 gap-1 text-[9px]">
                      {[
                        { id: 'pill', label: 'Pill' },
                        { id: 'punchhole', label: 'Hole' },
                        { id: 'notch', label: 'Notch' },
                        { id: 'none', label: 'Clean' },
                      ].map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            setNotchType(n.id as any);
                            setSelectedModel('parametric');
                          }}
                          className={`p-1.5 rounded-xs border text-center transition-all ${
                            notchType === n.id 
                              ? 'bg-cyan-400 text-black border-cyan-400 font-bold' 
                              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* STEPS TAB */}
            {activeTab === 'steps' && (
              <div className="space-y-3">
                <div className="text-[10px] font-bold tracking-widest text-[#00ffcc] uppercase">Assembly Walkthrough</div>
                {modelSpecs[selectedModel].steps.map((step, idx) => (
                  <div key={idx} className="flex space-x-3 items-start bg-zinc-950/40 p-2.5 rounded border border-zinc-800/80">
                    <div className="w-5 h-5 rounded bg-[#00ffcc]/10 border border-[#00ffcc]/40 text-[#00ffcc] flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            )}

            {/* MATERIALS TAB */}
            {activeTab === 'materials' && (
              <div className="space-y-3">
                <div className="text-[10px] font-bold tracking-widest text-[#00ffcc] uppercase">Required Workshop Tools</div>
                {materials.map((m, idx) => (
                  <div key={idx} className="bg-zinc-950/40 p-2.5 rounded border border-zinc-800/80 space-y-1">
                    <div className="flex items-center space-x-2 text-zinc-200 font-bold text-xs">
                      <Check className="w-3.5 h-3.5 text-[#00ffcc]" />
                      <span>{m.name}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-snug pl-5">{m.detail}</p>
                  </div>
                ))}
              </div>
            )}

            {/* PRO TIPS TAB */}
            {activeTab === 'tips' && (
              <div className="space-y-3">
                <div className="text-[10px] font-bold tracking-widest text-[#00ffcc] uppercase">Master Origami Guidelines</div>
                {assemblyTips.map((tip, idx) => (
                  <div key={idx} className="bg-zinc-950/40 p-2.5 rounded border border-zinc-800/80 space-y-1">
                    <div className="font-bold text-xs text-[#00ffcc]">{tip.title}</div>
                    <p className="text-[10px] text-zinc-400 leading-snug">{tip.text}</p>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* LEGEND & CUT GUIDE */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-950/80 text-[10px] flex items-center justify-between text-zinc-400">
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-0.5 bg-current" />
              <span>Solid = Cut Path</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-0.5 border-b-2 border-dashed border-current" />
              <span>Dashed = Score & Fold</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE CANVAS VIEW (2D Vector Plan or 3D Folding Simulator) */}
        <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden relative print:p-0">
          
          {/* IF 3D SIMULATOR MODE */}
          {viewMode === '3d-simulator' ? (
            <div className="w-full h-full flex flex-col">
              <Paper3DFoldingViewer
                modelType={selectedModel}
                skinTheme={skinTheme}
                phoneWidth={phoneWidth}
                phoneHeight={phoneHeight}
              />
            </div>
          ) : (
            /* IF 2D BLUEPRINT MODE */
            <div className={`w-full h-full rounded-lg border flex flex-col relative overflow-hidden transition-all duration-300 ${canvasStyle.wrapper}`}>
              
              {/* Technical Blueprint Grid Background */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-60"
                style={{
                  backgroundImage: `linear-gradient(to right, ${canvasStyle.gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${canvasStyle.gridLine} 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }}
              />

              {/* Hover Tooltip Overlay HUD */}
              {hoveredPart && (
                <div className="absolute top-4 left-4 z-20 bg-zinc-950/90 border border-[#00ffcc] text-zinc-100 p-3 rounded shadow-lg max-w-sm pointer-events-none font-mono animate-fadeIn">
                  <div className="flex items-center space-x-2 text-[#00ffcc] font-bold text-xs uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5" />
                    <span>{hoveredPart}</span>
                  </div>
                  {hoveredDescription && (
                    <p className="text-[10px] text-zinc-300 mt-1 leading-snug">{hoveredDescription}</p>
                  )}
                </div>
              )}

              {/* Blueprint Vector Canvas Stage */}
              <div ref={svgContainerRef} className="flex-1 w-full flex items-center justify-center p-4 overflow-auto">
                
                {/* ================= MODEL 1: CYBER MAC 1984 VINTAGE DESKTOP ================= */}
                {selectedModel === 'cyber-mac' && (
                  <svg viewBox="0 0 900 900" className="w-full max-h-[92%] h-auto stroke-current fill-none transition-all duration-300 font-mono" strokeWidth="1.5">
                    <g className="print:text-black">
                      {/* Blueprint Header */}
                      <text x="450" y="45" textAnchor="middle" className="text-xl font-black fill-current stroke-none tracking-widest uppercase">MAC-PET 1984 VINTAGE ENCLOSURE</text>
                      <text x="450" y="68" textAnchor="middle" className="text-xs font-mono fill-current stroke-none tracking-wider opacity-70">
                        — Scale 1:1 True Dimensions • Retro CRT Viewport with Fold-Out 20° Easel Wedge —
                      </text>

                      {/* 50mm Calibration Scale Bar */}
                      <g className="fill-current stroke-none font-mono text-[9px]">
                        <rect x="50" y="820" width="140" height="4" fill="currentColor" />
                        <line x1="50" y1="812" x2="50" y2="832" stroke="currentColor" strokeWidth="2" />
                        <line x1="120" y1="816" x2="120" y2="828" stroke="currentColor" strokeWidth="1" />
                        <line x1="190" y1="812" x2="190" y2="832" stroke="currentColor" strokeWidth="2" />
                        <text x="50" y="805" textAnchor="start" className="font-bold">0mm</text>
                        <text x="120" y="805" textAnchor="middle">25mm</text>
                        <text x="190" y="805" textAnchor="end" className="font-bold">50mm SCALE</text>
                        <text x="50" y="846" textAnchor="start" className="text-[8px] opacity-60">Check with ruler on print (100% scale)</text>
                      </g>

                      {/* Score Lines (Dashed Folds) */}
                      <g strokeDasharray="6,6" strokeWidth="1.5" className="opacity-80">
                        {/* Side wall folds */}
                        <line x1="260" y1="120" x2="260" y2="680" />
                        <line x1="640" y1="120" x2="640" y2="680" />
                        <line x1="180" y1="120" x2="180" y2="680" />
                        <line x1="720" y1="120" x2="720" y2="680" />
                        
                        {/* Rear Easel fold */}
                        <line x1="300" y1="680" x2="600" y2="680" />
                        <line x1="300" y1="760" x2="600" y2="760" />
                      </g>

                      {/* Solid Cut Lines */}
                      {/* Left Chassis Wing */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Left Cooling Vents Wall", "Folds backward at 90° to form the rigid left side of the vintage Mac chassis.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <path d="M 260 120 L 180 160 L 180 640 L 260 680 Z" />
                        <text x="215" y="400" textAnchor="middle" transform="rotate(-90 215 400)" className="text-[9px] fill-current stroke-none font-bold opacity-60">
                          LEFT WALL (VENTILATION)
                        </text>
                        {/* Vents artwork */}
                        {[220, 260, 300, 340, 380, 420, 460].map((y) => (
                          <line key={y} x1="200" y1={y} x2="240" y2={y} stroke="currentColor" strokeWidth="1" />
                        ))}
                      </g>

                      {/* Main Front Bezel Body */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Front CRT Faceplate", "Main display housing featuring the vintage CRT curved viewport, rainbow badge, and floppy slot.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <rect x="260" y="120" width="380" height="560" rx="16" />
                        
                        {/* Top Mac Bevel & Apple Rainbow Logo */}
                        <rect x="290" y="145" width="320" height="24" rx="4" />
                        <circle cx="310" cy="157" r="5" className="fill-current" />
                        <text x="330" y="161" className="text-[10px] fill-current stroke-none font-black">MAC-PET 128k</text>
                        <text x="590" y="161" textAnchor="end" className="text-[8px] fill-current stroke-none font-mono opacity-70">1984 ED.</text>

                        {/* CRT Screen Bezel Cutout */}
                        <rect 
                          x="295" 
                          y="190" 
                          width="310" 
                          height="400" 
                          rx="24" 
                          className="stroke-[2.5] hover:stroke-red-400 hover:fill-red-500/10 transition-all"
                        />
                        <text x="450" y="380" textAnchor="middle" className="text-xs fill-current stroke-none font-black opacity-40 tracking-widest">
                          EXCISE CRT SCREEN WINDOW
                        </text>
                        
                        {/* Camera Aperture / Dynamic Island Notch */}
                        <rect x="420" y="200" width="60" height="12" rx="6" className="stroke-[2] hover:fill-red-500/20" />
                        <text x="450" y="222" textAnchor="middle" className="text-[7px] fill-current stroke-none font-bold">CAM SENSOR APERTURE</text>

                        {/* Bottom 3.5" Floppy Disk Slot Artwork */}
                        <rect x="300" y="615" width="240" height="14" rx="3" className="stroke-[2]" />
                        <rect x="555" y="618" width="8" height="8" rx="1" />
                        <text x="310" y="645" className="text-[7px] fill-current stroke-none font-mono opacity-60">AUTO-EJECT FLOPPY DRIVE</text>
                      </g>

                      {/* Right Chassis Wing */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Right Power & I/O Wall", "Folds backward at 90° to form the right side panel with peripheral port guides.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <path d="M 640 120 L 720 160 L 720 640 L 640 680 Z" />
                        <text x="685" y="400" textAnchor="middle" transform="rotate(90 685 400)" className="text-[9px] fill-current stroke-none font-bold opacity-60">
                          RIGHT WALL (POWER / I/O)
                        </text>
                        {/* Port artwork */}
                        <rect x="665" y="480" width="30" height="40" rx="4" />
                        <circle cx="680" cy="380" r="8" />
                      </g>

                      {/* Bottom Fold-Out 20° Easel Kickstand */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("20° Desktop Easel Wedge", "Folds underneath to elevate the screen at an ergonomic 20° angle with a built-in charging cable routing cutout.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <path d="M 300 680 L 300 840 L 600 840 L 600 680 Z" />
                        {/* Charging Cable Routing Hole */}
                        <rect x="420" y="700" width="60" height="24" rx="8" className="stroke-[2] hover:fill-[#00ffcc]/10" />
                        <text x="450" y="745" textAnchor="middle" className="text-[8px] fill-current stroke-none font-bold opacity-70">
                          USB-C CABLE ROUTING CANAL
                        </text>
                        <text x="450" y="800" textAnchor="middle" className="text-[9px] fill-current stroke-none font-black tracking-wider">
                          20° ERGONOMIC DESK WEDGE (FOLD BACK)
                        </text>
                      </g>

                    </g>
                  </svg>
                )}

                {/* ================= MODEL 2: MECH-PET GUNDAM VISOR ================= */}
                {selectedModel === 'mech-pet' && (
                  <svg viewBox="0 0 900 900" className="w-full max-h-[92%] h-auto stroke-current fill-none transition-all duration-300 font-mono" strokeWidth="1.5">
                    <g className="print:text-black">
                      <text x="450" y="45" textAnchor="middle" className="text-xl font-black fill-current stroke-none tracking-widest uppercase">MECH-PET GUNDAM EXOSKELETON</text>
                      <text x="450" y="68" textAnchor="middle" className="text-xs font-mono fill-current stroke-none tracking-wider opacity-70">
                        — Pop-Up Antenna Ears • Articulated Grip Paws • Heavy PCB Exoskeleton —
                      </text>

                      {/* 50mm Calibration Scale Bar */}
                      <g className="fill-current stroke-none font-mono text-[9px]">
                        <rect x="50" y="820" width="140" height="4" fill="currentColor" />
                        <line x1="50" y1="812" x2="50" y2="832" stroke="currentColor" strokeWidth="2" />
                        <line x1="120" y1="816" x2="120" y2="828" stroke="currentColor" strokeWidth="1" />
                        <line x1="190" y1="812" x2="190" y2="832" stroke="currentColor" strokeWidth="2" />
                        <text x="50" y="805" textAnchor="start" className="font-bold">0mm</text>
                        <text x="120" y="805" textAnchor="middle">25mm</text>
                        <text x="190" y="805" textAnchor="end" className="font-bold">50mm SCALE</text>
                      </g>

                      {/* Dashed Folds */}
                      <g strokeDasharray="6,6" strokeWidth="1.5" className="opacity-80">
                        {/* Ears fold */}
                        <line x1="280" y1="140" x2="380" y2="140" />
                        <line x1="520" y1="140" x2="620" y2="140" />
                        {/* Paws fold */}
                        <line x1="260" y1="640" x2="360" y2="640" />
                        <line x1="540" y1="640" x2="640" y2="640" />
                        {/* Rear Strut fold */}
                        <line x1="320" y1="700" x2="580" y2="700" />
                      </g>

                      {/* Pop-Up Ear Left */}
                      <g 
                        className="transition-colors hover:fill-current/10 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Left Mecha Antenna Ear", "Pop-up triangular ear antenna with robotic circuit decals. Folds forward 15°.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <path d="M 280 140 L 300 40 L 380 140 Z" />
                        <circle cx="320" cy="100" r="6" />
                        <line x1="300" y1="40" x2="320" y2="100" strokeWidth="1" />
                      </g>

                      {/* Pop-Up Ear Right */}
                      <g 
                        className="transition-colors hover:fill-current/10 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Right Mecha Antenna Ear", "Pop-up triangular ear antenna with robotic circuit decals. Folds forward 15°.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <path d="M 520 140 L 600 40 L 620 140 Z" />
                        <circle cx="580" cy="100" r="6" />
                        <line x1="600" y1="40" x2="580" y2="100" strokeWidth="1" />
                      </g>

                      {/* Main Mecha Body Armor */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Mecha Body Exoskeleton", "Main armored chestplate with hexagonal visor framing.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <path d="M 240 140 L 660 140 L 680 640 L 220 640 Z" />
                        
                        {/* Hexagonal Visor Cutout */}
                        <path 
                          d="M 300 200 L 600 200 L 620 540 L 280 540 Z" 
                          className="stroke-[2.5] hover:stroke-red-400 hover:fill-red-500/10 transition-all"
                        />
                        <text x="450" y="370" textAnchor="middle" className="text-xs fill-current stroke-none font-black opacity-40 tracking-widest">
                          EXCISE MECHA VISOR APERTURE
                        </text>

                        {/* Cyber Decals */}
                        <text x="260" y="170" className="text-[9px] fill-current stroke-none font-black">UNIT-01 // TACTICAL SOUL</text>
                        <text x="640" y="170" textAnchor="end" className="text-[8px] fill-current stroke-none font-mono">SPEC: GUNDAM-AI</text>
                      </g>

                      {/* Left Clamping Paw */}
                      <g 
                        className="transition-colors hover:fill-current/10 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Left Safety Paw Claw", "Folds forward 90° to catch and support the base of your smartphone.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <path d="M 260 640 L 240 720 L 360 720 L 360 640 Z" />
                        <text x="300" y="685" textAnchor="middle" className="text-[8px] fill-current stroke-none font-bold">LEFT PAW</text>
                      </g>

                      {/* Right Clamping Paw */}
                      <g 
                        className="transition-colors hover:fill-current/10 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Right Safety Paw Claw", "Folds forward 90° to catch and support the base of your smartphone.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <path d="M 540 640 L 540 720 L 660 720 L 640 640 Z" />
                        <text x="600" y="685" textAnchor="middle" className="text-[8px] fill-current stroke-none font-bold">RIGHT PAW</text>
                      </g>

                      {/* Rear Exoskeleton Kickstand */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Rear A-Frame Stabilizer", "Folds backward at 45° to provide stable tripod desktop balance.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <path d="M 320 700 L 400 860 L 500 860 L 580 700 Z" />
                        <text x="450" y="780" textAnchor="middle" className="text-[9px] fill-current stroke-none font-black">
                          A-FRAME REAR TRIPOD STRUT
                        </text>
                      </g>
                    </g>
                  </svg>
                )}

                {/* ================= MODEL 3: RETRO ARCADE MINI-CABINET ================= */}
                {selectedModel === 'arcade' && (
                  <svg viewBox="0 0 900 900" className="w-full max-h-[92%] h-auto stroke-current fill-none transition-all duration-300 font-mono" strokeWidth="1.5">
                    <g className="print:text-black">
                      <text x="450" y="45" textAnchor="middle" className="text-xl font-black fill-current stroke-none tracking-widest uppercase">RETRO ARCADE MINI-CABINET</text>
                      <text x="450" y="68" textAnchor="middle" className="text-xs font-mono fill-current stroke-none tracking-wider opacity-70">
                        — Marquee Header • Coin-Op Deck • Side Artwork Wings —
                      </text>

                      {/* 50mm Calibration Scale Bar */}
                      <g className="fill-current stroke-none font-mono text-[9px]">
                        <rect x="50" y="820" width="140" height="4" fill="currentColor" />
                        <line x1="50" y1="812" x2="50" y2="832" stroke="currentColor" strokeWidth="2" />
                        <line x1="120" y1="816" x2="120" y2="828" stroke="currentColor" strokeWidth="1" />
                        <line x1="190" y1="812" x2="190" y2="832" stroke="currentColor" strokeWidth="2" />
                        <text x="50" y="805" textAnchor="start" className="font-bold">0mm</text>
                        <text x="120" y="805" textAnchor="middle">25mm</text>
                        <text x="190" y="805" textAnchor="end" className="font-bold">50mm SCALE</text>
                      </g>

                      {/* Dashed Folds */}
                      <g strokeDasharray="6,6" strokeWidth="1.5" className="opacity-80">
                        <line x1="280" y1="120" x2="280" y2="680" />
                        <line x1="620" y1="120" x2="620" y2="680" />
                        <line x1="280" y1="200" x2="620" y2="200" />
                        <line x1="280" y1="600" x2="620" y2="600" />
                      </g>

                      {/* Top Marquee Header */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Arcade Marquee Header", "Lighted banner overhang with classic coin-op typography.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <rect x="280" y="120" width="340" height="80" rx="4" />
                        <text x="450" y="165" textAnchor="middle" className="text-sm font-black fill-current stroke-none tracking-widest uppercase">★ CYBER PET ARCADE ★</text>
                        <text x="450" y="185" textAnchor="middle" className="text-[8px] fill-current stroke-none font-mono opacity-70">INSERT COIN TO PLAY</text>
                      </g>

                      {/* Main Slanted Screen Bezel */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Arcade CRT Display Bezel", "Excise to reveal your companion's face inside the arcade cabinet.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <rect x="280" y="200" width="340" height="400" />
                        <rect 
                          x="305" 
                          y="225" 
                          width="290" 
                          height="350" 
                          rx="16" 
                          className="stroke-[2.5] hover:stroke-red-400 hover:fill-red-500/10 transition-all"
                        />
                        <text x="450" y="400" textAnchor="middle" className="text-xs fill-current stroke-none font-black opacity-40 tracking-widest">
                          EXCISE ARCADE SCREEN
                        </text>
                      </g>

                      {/* Bottom Control Deck Shelf */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Joystick & Buttons Deck", "Folds forward to hold your device and display vintage arcade controls.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <rect x="280" y="600" width="340" height="120" rx="4" />
                        {/* Joystick */}
                        <circle cx="360" cy="650" r="14" className="fill-current" />
                        <line x1="360" y1="650" x2="360" y2="675" strokeWidth="3" />
                        {/* Action Buttons */}
                        <circle cx="480" cy="645" r="10" />
                        <circle cx="520" cy="645" r="10" />
                        <circle cx="560" cy="645" r="10" />
                        <circle cx="500" cy="675" r="10" />
                        <circle cx="540" cy="675" r="10" />
                        <text x="450" y="705" textAnchor="middle" className="text-[8px] fill-current stroke-none font-bold">
                          CONTROL DECK & PHONE CRADLE
                        </text>
                      </g>

                      {/* Left Arcade Side Wing */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Left Arcade Cabinet Wing", "Angled side wing with pixel art illustrations. Folds back 90°.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <path d="M 280 120 L 160 160 L 140 680 L 280 720 Z" />
                        <text x="210" y="420" textAnchor="middle" transform="rotate(-90 210 420)" className="text-[9px] fill-current stroke-none font-bold opacity-60">
                          LEFT SIDE ARTWORK WING
                        </text>
                      </g>

                      {/* Right Arcade Side Wing */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Right Arcade Cabinet Wing", "Angled side wing with pixel art illustrations. Folds back 90°.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <path d="M 620 120 L 740 160 L 760 680 L 620 720 Z" />
                        <text x="690" y="420" textAnchor="middle" transform="rotate(90 690 420)" className="text-[9px] fill-current stroke-none font-bold opacity-60">
                          RIGHT SIDE ARTWORK WING
                        </text>
                      </g>
                    </g>
                  </svg>
                )}

                {/* ================= MODEL 4: ZERO-GLUE INTERLOCKING ORIGAMI STAND ================= */}
                {selectedModel === 'flat-fold' && (
                  <svg viewBox="0 0 900 900" className="w-full max-h-[92%] h-auto stroke-current fill-none transition-all duration-300 font-mono" strokeWidth="1.5">
                    <g className="print:text-black">
                      <text x="450" y="45" textAnchor="middle" className="text-xl font-black fill-current stroke-none tracking-widest uppercase">ZERO-GLUE INTERLOCKING ORIGAMI STAND</text>
                      <text x="450" y="68" textAnchor="middle" className="text-xs font-mono fill-current stroke-none tracking-wider opacity-70">
                        — 100% Adhesive-Free • Slit-and-Tab Interlocking • Dual 60°/45° Angle —
                      </text>

                      {/* 50mm Calibration Scale Bar */}
                      <g className="fill-current stroke-none font-mono text-[9px]">
                        <rect x="50" y="820" width="140" height="4" fill="currentColor" />
                        <line x1="50" y1="812" x2="50" y2="832" stroke="currentColor" strokeWidth="2" />
                        <line x1="120" y1="816" x2="120" y2="828" stroke="currentColor" strokeWidth="1" />
                        <line x1="190" y1="812" x2="190" y2="832" stroke="currentColor" strokeWidth="2" />
                        <text x="50" y="805" textAnchor="start" className="font-bold">0mm</text>
                        <text x="120" y="805" textAnchor="middle">25mm</text>
                        <text x="190" y="805" textAnchor="end" className="font-bold">50mm SCALE</text>
                      </g>

                      {/* Dashed Score Creases */}
                      <g strokeDasharray="6,6" strokeWidth="1.5" className="opacity-80">
                        <line x1="260" y1="280" x2="640" y2="280" />
                        <line x1="260" y1="520" x2="640" y2="520" />
                        <line x1="260" y1="620" x2="640" y2="620" />
                      </g>

                      {/* Slits (Thick Solid Red Cut Lines) */}
                      <line x1="320" y1="360" x2="400" y2="360" stroke="#ef4444" strokeWidth="3" />
                      <line x1="500" y1="360" x2="580" y2="360" stroke="#ef4444" strokeWidth="3" />
                      <text x="360" y="350" textAnchor="middle" className="text-[8px] fill-red-500 stroke-none font-bold">SLIT A (CUT)</text>
                      <text x="540" y="350" textAnchor="middle" className="text-[8px] fill-red-500 stroke-none font-bold">SLIT B (CUT)</text>

                      {/* Top Backrest Panel */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Backrest Rest Plate", "Main supportive backplate where the phone rests against.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <rect x="260" y="120" width="380" height="160" rx="12" />
                        <text x="450" y="180" textAnchor="middle" className="text-xs font-black fill-current stroke-none uppercase">UPPER PHONE BACKREST</text>
                        <text x="450" y="205" textAnchor="middle" className="text-[9px] font-mono fill-current stroke-none opacity-60">FITS ANY DEVICE OR CASE</text>
                      </g>

                      {/* Center Slotted Anchor Plate */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Interlocking Slit Panel", "Contains Slits A & B which lock the rear kickstand tabs securely without glue.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <rect x="260" y="280" width="380" height="240" />
                        <text x="450" y="440" textAnchor="middle" className="text-xs font-black fill-current stroke-none uppercase">INTERLOCKING MAIN HUB</text>
                        <text x="450" y="465" textAnchor="middle" className="text-[8px] font-mono fill-current stroke-none opacity-60">SNAP TABS 1 & 2 INTO SLITS A & B</text>
                      </g>

                      {/* Fold-Forward Catch Tray */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Front Catch Shelf", "Folds forward to prevent the device from sliding forward.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <rect x="260" y="520" width="380" height="100" />
                        <text x="450" y="575" textAnchor="middle" className="text-[10px] font-black fill-current stroke-none uppercase">FRONT CATCH SHELF (FOLD UP)</text>
                      </g>

                      {/* Rear Tri-Fold Kickstand with Interlocking Tabs */}
                      <g 
                        className="transition-colors hover:fill-current/5 cursor-pointer"
                        onMouseEnter={() => handlePartHover("Interlocking Spine Tabs", "Fold backward and insert into Slits A & B to form the rock-solid triangular base.")}
                        onMouseLeave={handlePartLeave}
                      >
                        <path d="M 260 620 L 260 780 L 330 780 L 330 840 L 390 840 L 390 780 L 510 780 L 510 840 L 570 840 L 570 780 L 640 780 L 640 620 Z" />
                        <text x="360" y="820" textAnchor="middle" className="text-[8px] fill-current stroke-none font-bold">TAB 1</text>
                        <text x="540" y="820" textAnchor="middle" className="text-[8px] fill-current stroke-none font-bold">TAB 2</text>
                        <text x="450" y="700" textAnchor="middle" className="text-[10px] font-black fill-current stroke-none">
                          REAR TRIANGULAR SPINE (NO GLUE NEEDED)
                        </text>
                      </g>
                    </g>
                  </svg>
                )}

                {/* ================= MODEL 5: PARAMETRIC MILLIMETER CUSTOMIZER ================= */}
                {selectedModel === 'parametric' && (() => {
                  const svgW = Math.min(300, Math.max(160, phoneWidth * 2.8));
                  const svgH = Math.min(520, Math.max(280, phoneHeight * 2.8));
                  const svgT = Math.min(55, Math.max(20, phoneThickness * 3.2));
                  const svgB = Math.min(24, Math.max(6, bezelPadding * 2.2));

                  const frontX = 450 - svgW / 2;
                  const frontY = 460 - svgH / 2;
                  const leftSpineX = frontX - svgT;
                  const backX = leftSpineX - svgW;
                  const rightSpineX = frontX + svgW;
                  const glueFlapX = rightSpineX + svgT;
                  const glueFlapW = 40;

                  return (
                    <svg viewBox="0 0 900 900" className="w-full max-h-[92%] h-auto stroke-current fill-none transition-all duration-300 font-mono" strokeWidth="1.5">
                      <g className="print:text-black">
                        <text x="450" y="45" textAnchor="middle" className="text-xl font-black fill-current stroke-none tracking-widest uppercase">PARAMETRIC FORM-FIT HOUSING</text>
                        <text x="450" y="68" textAnchor="middle" className="text-xs font-mono fill-current stroke-none tracking-wider opacity-70">
                          — {phoneWidth.toFixed(1)}mm W x {phoneHeight.toFixed(1)}mm H x {phoneThickness.toFixed(1)}mm T (Bezel: {bezelPadding.toFixed(1)}mm) —
                        </text>

                        {/* 50mm Calibration Scale Bar */}
                        <g className="fill-current stroke-none font-mono text-[9px]">
                          <rect x="50" y="820" width="140" height="4" fill="currentColor" />
                          <line x1="50" y1="812" x2="50" y2="832" stroke="currentColor" strokeWidth="2" />
                          <line x1="120" y1="816" x2="120" y2="828" stroke="currentColor" strokeWidth="1" />
                          <line x1="190" y1="812" x2="190" y2="832" stroke="currentColor" strokeWidth="2" />
                          <text x="50" y="805" textAnchor="start" className="font-bold">0mm</text>
                          <text x="120" y="805" textAnchor="middle">25mm</text>
                          <text x="190" y="805" textAnchor="end" className="font-bold">50mm REFERENCE</text>
                        </g>

                        {/* Dashed Folds */}
                        <g strokeDasharray="6,6" strokeWidth="1.5" className="opacity-80">
                          <line x1={leftSpineX} y1={frontY} x2={leftSpineX} y2={frontY + svgH} />
                          <line x1={frontX} y1={frontY} x2={frontX} y2={frontY + svgH} />
                          <line x1={rightSpineX} y1={frontY} x2={rightSpineX} y2={frontY + svgH} />
                          <line x1={glueFlapX} y1={frontY} x2={glueFlapX} y2={frontY + svgH} />
                          <line x1={frontX} y1={frontY} x2={rightSpineX} y2={frontY} />
                          <line x1={frontX} y1={frontY + svgH} x2={rightSpineX} y2={frontY + svgH} />
                        </g>

                        {/* Back Plate */}
                        <g 
                          className="transition-colors hover:fill-current/5 cursor-pointer"
                          onMouseEnter={() => handlePartHover("Custom Back Plate", `Rear plate matching ${phoneWidth.toFixed(1)}mm width.`)}
                          onMouseLeave={handlePartLeave}
                        >
                          <rect x={backX} y={frontY} width={svgW} height={svgH} rx="4" />
                          <path d={`M ${backX} ${frontY} L ${backX - 35} ${frontY + 20} L ${backX - 35} ${frontY + svgH - 20} L ${backX} ${frontY + svgH} Z`} />
                          <text x={backX + svgW / 2} y={frontY + svgH / 2} textAnchor="middle" className="text-xs fill-current stroke-none font-bold opacity-60">BACK PANEL</text>
                        </g>

                        {/* Left Spine */}
                        <rect x={leftSpineX} y={frontY} width={svgT} height={svgH} />
                        <text x={leftSpineX + svgT / 2} y={frontY + svgH / 2} textAnchor="middle" transform={`rotate(-90 ${leftSpineX + svgT / 2} ${frontY + svgH / 2})`} className="text-[8px] fill-current stroke-none font-bold opacity-60">
                          LEFT SPINE ({phoneThickness.toFixed(1)}mm)
                        </text>

                        {/* Front Display Plate */}
                        <g 
                          className="transition-colors hover:fill-current/5 cursor-pointer"
                          onMouseEnter={() => handlePartHover("Front Viewport Shield", `Front panel with ${bezelPadding.toFixed(1)}mm calculated bezel clearance.`)}
                          onMouseLeave={handlePartLeave}
                        >
                          <rect x={frontX} y={frontY} width={svgW} height={svgH} rx="4" />
                          
                          {/* Cutout Display Window */}
                          <rect 
                            x={frontX + svgB} 
                            y={frontY + svgB + 10} 
                            width={svgW - svgB * 2} 
                            height={svgH - svgB * 2 - 20} 
                            rx="12" 
                            className="stroke-[2.5] hover:stroke-red-400 hover:fill-red-500/10 transition-all"
                          />
                          <text x={frontX + svgW / 2} y={frontY + svgH / 2} textAnchor="middle" className="text-xs fill-current stroke-none font-black opacity-30 tracking-widest">
                            EXCISE SCREEN WINDOW
                          </text>

                          {/* Apertures */}
                          {notchType === 'pill' && (
                            <g>
                              <rect x={frontX + svgW / 2 - 30} y={frontY + svgB} width="60" height="14" rx="7" className="stroke-[2] hover:fill-red-500/20" />
                              <text x={frontX + svgW / 2} y={frontY + svgB - 4} textAnchor="middle" className="text-[7px] fill-red-500 stroke-none font-bold">DYNAMIC ISLAND</text>
                            </g>
                          )}
                          {notchType === 'punchhole' && (
                            <g>
                              <circle cx={frontX + svgW / 2} cy={frontY + svgB + 6} r="6" className="stroke-[2] hover:fill-red-500/20" />
                              <text x={frontX + svgW / 2} y={frontY + svgB - 4} textAnchor="middle" className="text-[7px] fill-red-500 stroke-none font-bold">CAM HOLE</text>
                            </g>
                          )}
                          {notchType === 'notch' && (
                            <g>
                              <path d={`M ${frontX + svgW / 2 - 25} ${frontY} L ${frontX + svgW / 2 - 20} ${frontY + 16} L ${frontX + svgW / 2 + 20} ${frontY + 16} L ${frontX + svgW / 2 + 25} ${frontY} Z`} className="stroke-[2] hover:fill-red-500/20" />
                              <text x={frontX + svgW / 2} y={frontY - 4} textAnchor="middle" className="text-[7px] fill-red-500 stroke-none font-bold">NOTCH</text>
                            </g>
                          )}
                        </g>

                        {/* Right Spine */}
                        <rect x={rightSpineX} y={frontY} width={svgT} height={svgH} />
                        <text x={rightSpineX + svgT / 2} y={frontY + svgH / 2} textAnchor="middle" transform={`rotate(90 ${rightSpineX + svgT / 2} ${frontY + svgH / 2})`} className="text-[8px] fill-current stroke-none font-bold opacity-60">
                          RIGHT SPINE ({phoneThickness.toFixed(1)}mm)
                        </text>

                        {/* Glue Flap */}
                        <g 
                          className="transition-colors hover:fill-current/10 cursor-pointer"
                          onMouseEnter={() => handlePartHover("Parametric Glue Tab", "Apply adhesive and wrap behind back plate.")}
                          onMouseLeave={handlePartLeave}
                        >
                          <path d={`M ${glueFlapX} ${frontY} L ${glueFlapX + glueFlapW} ${frontY + 20} L ${glueFlapX + glueFlapW} ${frontY + svgH - 20} L ${glueFlapX} ${frontY + svgH} Z`} />
                          <text x={glueFlapX + 18} y={frontY + svgH / 2} textAnchor="middle" transform={`rotate(90 ${glueFlapX + 18} ${frontY + svgH / 2})`} className="text-[7px] fill-current stroke-none font-bold opacity-60">
                            GLUE FLAP
                          </text>
                        </g>

                        {/* Bottom USB Port Dock */}
                        <g 
                          className="transition-colors hover:fill-current/5 cursor-pointer"
                          onMouseEnter={() => handlePartHover("Bottom Dock Plate", "Folds under to catch phone and route charging cable.")}
                          onMouseLeave={handlePartLeave}
                        >
                          <path d={`M ${frontX} ${frontY + svgH} L ${frontX} ${frontY + svgH + svgT + 20} L ${rightSpineX} ${frontY + svgH + svgT + 20} L ${rightSpineX} ${frontY + svgH} Z`} />
                          <rect x={frontX + svgW / 2 - 25} y={frontY + svgH + 10} width="50" height="14" rx="5" />
                          <text x={frontX + svgW / 2} y={frontY + svgH + svgT + 12} textAnchor="middle" className="text-[7px] fill-current stroke-none font-bold opacity-70">
                            USB-C / LIGHTNING PORT
                          </text>
                        </g>

                        {/* Top Retention Flap */}
                        <g 
                          className="transition-colors hover:fill-current/5 cursor-pointer"
                          onMouseEnter={() => handlePartHover("Top Dust Cover", "Folds over top of phone to hold it securely inside the sleeve.")}
                          onMouseLeave={handlePartLeave}
                        >
                          <path d={`M ${frontX} ${frontY} L ${frontX} ${frontY - svgT - 20} L ${rightSpineX} ${frontY - svgT - 20} L ${rightSpineX} ${frontY} Z`} />
                          <text x={frontX + svgW / 2} y={frontY - 10} textAnchor="middle" className="text-[7px] fill-current stroke-none font-bold opacity-70">
                            TOP RETENTION FLAP
                          </text>
                        </g>
                      </g>
                    </svg>
                  );
                })()}

              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
