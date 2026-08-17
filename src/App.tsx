import React, { useEffect, useRef, useState } from 'react';
import { PetFace } from './components/PetFace';
import { PaperTemplate } from './components/PaperTemplate';
import { DeskHabits } from './components/DeskHabits';
import { pcmToBase64, base64ToPcm } from './lib/audio';

declare const FaceMesh: any;

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

export type AiPersonaType = 'coach' | 'cozy' | 'butler' | 'cyber' | 'tamagotchi';
export type AiLanguageType = 'sv' | 'en' | 'ja' | 'es' | 'de' | 'fr';
export type AiVoiceType = 'Puck' | 'Aoede' | 'Charon' | 'Fenrir' | 'Kore';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDistracted, setIsDistracted] = useState(false);
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [appState, setAppState] = useState<'idle' | 'calibrating' | 'running'>('idle');
  const [showTemplate, setShowTemplate] = useState(false);
  const [showDeskHabits, setShowDeskHabits] = useState(false);
  const [trackerMode, setTrackerMode] = useState<'mediapipe' | 'fallback'>('mediapipe');
  const [showMonitor, setShowMonitor] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [micVolume, setMicVolume] = useState(0);
  const [micPitch, setMicPitch] = useState(0);
  const [isAsleep, setIsAsleep] = useState(false);
  const lastActiveRef = useRef<number>(Date.now());
  const isAsleepRef = useRef(false);
  const isSpeakingRef = useRef(false);

  // Intelligent Companion Persona & Language Matrix
  const [aiPersona, setAiPersona] = useState<AiPersonaType>('coach');
  const [aiLanguage, setAiLanguage] = useState<AiLanguageType>('sv');
  const [aiVoice, setAiVoice] = useState<AiVoiceType>('Puck');

  // Audio-Reactive Lip Sync FFT states
  const [speechAmplitude, setSpeechAmplitude] = useState<number>(0);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);

  // Smart Focus & Posture Sentinel
  const [postureSentinelEnabled, setPostureSentinelEnabled] = useState<boolean>(true);
  const [postureAlert, setPostureAlert] = useState<string | null>(null);
  const baselineNoseYRef = useRef<number | null>(null);
  const slouchStartTimeRef = useRef<number | null>(null);
  const distractedStartTimeRef = useRef<number | null>(null);
  const [focusSprintActive, setFocusSprintActive] = useState<boolean>(false);
  const [focusSprintSeconds, setFocusSprintSeconds] = useState<number>(25 * 60);
  const [focusScore, setFocusScore] = useState<number>(100);

  // OLED Screen Config States
  const [oledTheme, setOledTheme] = useState<'split' | 'cyan' | 'amber' | 'green' | 'white' | 'dynamic'>('split');
  const [character, setCharacter] = useState<'classic' | 'cyber' | 'kawaii' | 'pensive' | 'furious' | 'chaotic'>('classic');
  const [pixelGrid, setPixelGrid] = useState(true);
  const [glassShine, setGlassShine] = useState(true);
  const [showPCB, setShowPCB] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [screenFlicker, setScreenFlicker] = useState(true);
  const [autoAmbient, setAutoAmbient] = useState(true);
  const [ambientLight, setAmbientLight] = useState<number | null>(null);
  const [isNightTime, setIsNightTime] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const wakeWordEnabledRef = useRef(true);
  const [isAffirmative, setIsAffirmative] = useState(false);
  const lastNodTimeRef = useRef<number>(0);
  const nodHistoryRef = useRef<{ y: number; t: number }[]>([]);

  const [expression, setExpression] = useState({
    leftEyeOpen: 1.0,
    rightEyeOpen: 1.0,
    leftBrowRaise: 0.0,
    rightBrowRaise: 0.0,
    mouthOpen: 0.0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastFaceUpdateRef = useRef<number>(0);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);

  const [uiLookOffset, setUiLookOffset] = useState<{x: number, y: number} | null>(null);
  const uiLookTimerRef = useRef<any>(null);

  // Focus sprint timer countdown
  useEffect(() => {
    if (!focusSprintActive) return;
    const interval = setInterval(() => {
      setFocusSprintSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setFocusSprintActive(false);
          addLog("🎉 Focus Sprint Completed! Great job maintaining discipline.", "success");
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
          }
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [focusSprintActive]);

  // Send reconfiguration to WebSocket
  const updateCompanionConfig = (newPersona?: AiPersonaType, newLang?: AiLanguageType, newVoice?: AiVoiceType) => {
    const p = newPersona || aiPersona;
    const l = newLang || aiLanguage;
    const v = newVoice || aiVoice;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'config',
        persona: p,
        language: l,
        voice: v,
      }));
      addLog(`Soul matrix updated: [Role: ${p.toUpperCase()}] [Lang: ${l.toUpperCase()}] [Voice: ${v}]`, 'success');
    }
  };

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setUiLookOffset({ x: 0, y: 30 }); 
        if (uiLookTimerRef.current) clearTimeout(uiLookTimerRef.current);
      }
    };

    const handleBlur = () => {
      if (uiLookTimerRef.current) clearTimeout(uiLookTimerRef.current);
      uiLookTimerRef.current = setTimeout(() => {
        setUiLookOffset(null);
      }, 1000);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('button');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;
        
        const offsetX = ((buttonCenterX - centerX) / centerX) * 40;
        const offsetY = ((buttonCenterY - centerY) / centerY) * 20;

        setUiLookOffset({ x: offsetX, y: offsetY });
        if (uiLookTimerRef.current) clearTimeout(uiLookTimerRef.current);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        if (uiLookTimerRef.current) clearTimeout(uiLookTimerRef.current);
        uiLookTimerRef.current = setTimeout(() => {
          setUiLookOffset(null);
        }, 500);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  // Ambient light & Night-time auto brightness controller
  useEffect(() => {
    if (appState !== 'running') return;

    let logCounter = 0;
    const interval = setInterval(() => {
      // 1. Check local clock for night time
      const hour = new Date().getHours();
      const timeIsNight = hour >= 20 || hour < 6;
      setIsNightTime(timeIsNight);

      // 2. Measure average light level from camera frame
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 16;
        tempCanvas.height = 16;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(video, 0, 0, 16, 16);
          try {
            const imgData = tempCtx.getImageData(0, 0, 16, 16);
            const data = imgData.data;
            let totalLuminance = 0;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              // Relative luminance formula (Photometric formula)
              totalLuminance += (0.2126 * r + 0.7152 * g + 0.0722 * b);
            }
            const avgLuminance = Math.round(totalLuminance / (data.length / 4));
            setAmbientLight(avgLuminance);

            if (autoAmbient) {
              let targetBrightness = 100;
              let modeName = "Normal";
              if (avgLuminance < 45) {
                targetBrightness = 40; // Eye-safe dimming for dark environment
                modeName = "Low Light (Eye-Safe Dark Mode)";
              } else if (avgLuminance < 90) {
                targetBrightness = 70; // Soft dimming
                modeName = "Dimly Lit";
              } else if (avgLuminance > 175) {
                targetBrightness = 130; // Boost brightness for readable grid
                modeName = "Bright Light (High Contrast)";
              } else {
                targetBrightness = 100;
                modeName = "Standard Room Light";
              }

              setBrightness(targetBrightness);

              // Periodic logging so user knows it's working
              logCounter++;
              if (logCounter >= 10) {
                addLog(`Light Sensor: ${avgLuminance} lx (${modeName}). Adjusting Screen Glow to ${targetBrightness}%`, "info");
                logCounter = 0;
              }
            }
          } catch (err) {
            // Silence cross-origin canvas reading errors if security rules block it
          }
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [appState, autoAmbient]);

  // Sync wake word ref with state
  useEffect(() => {
    wakeWordEnabledRef.current = wakeWordEnabled;
  }, [wakeWordEnabled]);

  // Web Speech API for 'Hey Antonio' keyword spotting
  useEffect(() => {
    if (appState !== 'running') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog("Local Speech Recognition API not supported in this browser. Falling back to default audio/volume activation.", "warn");
      return;
    }

    let recognition: any = null;
    let isStoppedManually = false;

    const startRecognition = () => {
      if (isStoppedManually) return;
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          addLog("Keyword Spotter active: waiting for wake-phrase 'Hey Antonio'...", "success");
        };

        recognition.onresult = (event: any) => {
          if (!wakeWordEnabledRef.current) return;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            if (transcript.includes('antonio')) {
              // Only wake up if the pet is actually asleep
              if (isAsleepRef.current) {
                lastActiveRef.current = Date.now();
                setIsAsleep(false);
                isAsleepRef.current = false;
                addLog(`Wake word recognized: "${transcript.trim()}"! Antonio is awake.`, "success");
                
                // Play gentle mobile vibrate on wake
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate([40, 30, 40]);
                }
              } else {
                // If already awake, reset inactivity timeout so it stays awake
                lastActiveRef.current = Date.now();
              }
            }
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
            console.warn("Speech Recognition Error:", event.error);
          }
        };

        recognition.onend = () => {
          if (!isStoppedManually && appState === 'running') {
            // Keep listening
            setTimeout(() => {
              if (!isStoppedManually) {
                try {
                  recognition.start();
                } catch (e) {}
              }
            }, 300);
          }
        };

        recognition.start();
      } catch (err) {
        console.error("Speech Recognition setup error:", err);
      }
    };

    startRecognition();

    return () => {
      isStoppedManually = true;
      if (recognition) {
        try {
          recognition.abort();
        } catch (e) {}
      }
    };
  }, [appState]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message, type }, ...prev.slice(0, 49)]);
  };

  // Function to start the app (requires user gesture for AudioContext)
  const startApp = async () => {
    try {
      setAppState('calibrating');
      setError(null);
      addLog("Awakening the Paper Pet...", "info");
      addLog("Entering calibration phase (3s). Please place device in stand...", "warn");

      // 2. Setup Audio Contexts & Output Analyser
      addLog("Initializing audio systems (16kHz input / 24kHz output duplex)...", "info");
      const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputAudioCtx;
      outputAudioCtxRef.current = outputAudioCtx;

      // Create Analyser for real-time AI speech lip-sync visemes
      const outputAnalyser = outputAudioCtx.createAnalyser();
      outputAnalyser.fftSize = 128;
      outputAnalyser.smoothingTimeConstant = 0.35;
      outputAnalyser.connect(outputAudioCtx.destination);
      outputAnalyserRef.current = outputAnalyser;

      // Real-time animation loop for AI speech output
      const speechFreqArray = new Uint8Array(outputAnalyser.frequencyBinCount);
      const checkSpeechFFT = () => {
        if (outputAnalyserRef.current && isSpeakingRef.current) {
          outputAnalyserRef.current.getByteFrequencyData(speechFreqArray);
          let sum = 0;
          for (let i = 0; i < speechFreqArray.length; i++) {
            sum += speechFreqArray[i];
          }
          const avg = sum / speechFreqArray.length;
          const amp = Math.min(1, avg / 48);
          setSpeechAmplitude(amp);
        } else {
          setSpeechAmplitude(0);
        }
        requestAnimationFrame(checkSpeechFFT);
      };
      checkSpeechFFT();

      // 3. Get Media Stream (Audio + Video)
      addLog("Requesting front-facing camera & microphone access...", "info");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { facingMode: "user" } 
      });
      addLog("Media stream acquired successfully.", "success");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
           videoRef.current?.play();
           addLog("Camera playback active.", "success");
           
           // Initialize FaceMesh or Fallback
           initTracker();
        };
      }

      // Mic Volume tracking
      const analyzer = inputAudioCtx.createAnalyser();
      analyzer.fftSize = 256;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkVolume = () => {
         if (inputAudioCtxRef.current && inputAudioCtxRef.current.state === 'running') {
            analyzer.getByteFrequencyData(dataArray);
            let sum = 0;
            let maxVal = -1;
            let maxIndex = -1;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
              if (dataArray[i] > maxVal) {
                maxVal = dataArray[i];
                maxIndex = i;
              }
            }
            const avg = sum / bufferLength;
            // Normalize volume roughly between 0.0 and 1.0
            const vol = Math.min(1, avg / 48); 
            setMicVolume(vol);

            if (vol > 0.05) {
               const nyquist = inputAudioCtxRef.current.sampleRate / 2;
               const pitchFreq = (maxIndex / bufferLength) * nyquist;
               setMicPitch(pitchFreq);
            } else {
               setMicPitch(0);
            }

            if (vol > 0.15 || isSpeakingRef.current) {
              const wasAsleep = isAsleepRef.current;
              if (wasAsleep && wakeWordEnabledRef.current && !isSpeakingRef.current) {
                // If wake-word trigger is enabled, general noise shouldn't wake it up
              } else {
                lastActiveRef.current = Date.now();
                if (isAsleepRef.current) {
                  setIsAsleep(false);
                  isAsleepRef.current = false;
                }
              }
            }

            // Check for inactivity (15 seconds)
            if (Date.now() - lastActiveRef.current > 15000 && !isAsleepRef.current && !isSpeakingRef.current) {
              setIsAsleep(true);
              isAsleepRef.current = true;
            }
         }
         requestAnimationFrame(checkVolume);
      };
      checkVolume();

      // Setup audio processing
      const source = inputAudioCtx.createMediaStreamSource(stream);
      source.connect(analyzer); // Connect source to analyzer

      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      let videoInterval: any;

      // Delay connecting WebSocket for 3 seconds (Calibration Phase)
      setTimeout(() => {
          setAppState('running');

          // 1. Connect WebSocket
          addLog("Connecting to Gemini Live API via custom gateway...", "info");
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${protocol}//${window.location.host}/live`;
          const ws = new WebSocket(wsUrl);
          wsRef.current = ws;

          processor.onaudioprocess = (e) => {
            if (ws.readyState === WebSocket.OPEN) {
              const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
              ws.send(JSON.stringify({ audio: base64 }));
            }
          };

          // 5. Setup WebSocket Handlers
          ws.onopen = () => {
            setIsConnected(true);
            addLog("Connected to Gemini Live Agent soul.", "success");
            // Send initial persona & language configuration
            ws.send(JSON.stringify({
              type: 'init',
              persona: aiPersona,
              language: aiLanguage,
              voice: aiVoice,
            }));
          };

          ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.connected) {
               addLog(`Companion Soul Matrix synced [Role: ${msg.persona?.toUpperCase() || aiPersona.toUpperCase()}]`, "success");
            }
            if (msg.audio) {
              setIsSpeaking(true);
              isSpeakingRef.current = true;
              lastActiveRef.current = Date.now();
              if (isAsleepRef.current) {
                setIsAsleep(false);
                isAsleepRef.current = false;
              }
              playAudioChunk(outputAudioCtx, msg.audio);
            }
            if (msg.interrupted) {
              nextStartTimeRef.current = 0; // Reset queue
              setIsSpeaking(false);
              isSpeakingRef.current = false;
              addLog("User interrupted. Clearing speaking buffer.", "warn");
            }
          };

          ws.onclose = () => {
            setIsConnected(false);
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            addLog("WebSocket disconnected. Retrying in background...", "error");
          };

          // 6. Setup Video Framing (1 FPS for Gemini Vision)
          videoInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
              const video = videoRef.current;
              const canvas = canvasRef.current;
              if (video.videoWidth > 0 && video.videoHeight > 0) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // lower quality to save bandwidth
                  const base64Data = dataUrl.split(',')[1];
                  ws.send(JSON.stringify({ video: base64Data }));
                }
              }
            }
          }, 1000);

      }, 3000);

      return () => {
        clearInterval(videoInterval);
        processor.disconnect();
        source.disconnect();
        if (wsRef.current) wsRef.current.close();
      };

    } catch (err: any) {
      addLog(`Start failed: ${err.message}`, "error");
      setError(err.message || "Failed to start camera/mic or connect to server.");
      setAppState('idle');
    }
  };

  const initTracker = () => {
    let hasLoadedMediaPipe = false;
    try {
      if (typeof FaceMesh !== 'undefined') {
        addLog("Initializing MediaPipe FaceMesh engine...", "info");
        const faceMeshInstance = new FaceMesh({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });

        faceMeshInstance.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMeshInstance.onResults((results: any) => {
          const now = performance.now();
          if (now - lastFaceUpdateRef.current < 80) return; // limit to ~12fps
          lastFaceUpdateRef.current = now;

          if (results && results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
              const face = results.multiFaceLandmarks[0];
              const nose = face[4]; // nose tip
              
              // Calibrate baseline nose posture if not yet established
              if (baselineNoseYRef.current === null) {
                baselineNoseYRef.current = nose.y;
                addLog(`Posture Sentinel calibrated baseline height [Y: ${nose.y.toFixed(3)}]`, "info");
              }

              // Invert X because front camera is mirrored
              const offsetX = (nose.x - 0.5) * 60; 
              const offsetY = (nose.y - 0.5) * 30;
              setLookOffset({ x: -offsetX, y: offsetY }); 
              setIsDistracted(false);

              // Smart Posture Sentinel logic
              if (postureSentinelEnabled && baselineNoseYRef.current !== null) {
                const slouchThreshold = baselineNoseYRef.current + 0.075;
                if (nose.y > slouchThreshold) {
                  if (!slouchStartTimeRef.current) slouchStartTimeRef.current = Date.now();
                  if (Date.now() - slouchStartTimeRef.current > 3000) {
                    setPostureAlert("POSTURE: SLOUCH DETECTED - SIT TALL");
                    setFocusScore((s) => Math.max(40, s - 0.1));
                  }
                } else {
                  slouchStartTimeRef.current = null;
                  if (postureAlert?.includes("SLOUCH")) {
                    setPostureAlert(null);
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate(20);
                    }
                  }
                }

                // Check prolonged distraction / looking away (>22px sideways)
                if (Math.abs(offsetX) > 22) {
                  if (!distractedStartTimeRef.current) distractedStartTimeRef.current = Date.now();
                  if (Date.now() - distractedStartTimeRef.current > 5000) {
                    setPostureAlert("FOCUS CHECK: EYES ON DESK");
                    setFocusScore((s) => Math.max(30, s - 0.2));
                  }
                } else {
                  distractedStartTimeRef.current = null;
                  if (postureAlert?.includes("FOCUS CHECK")) {
                    setPostureAlert(null);
                  }
                }
              }

              // Head Nod Gesture Listener (rapid change in y-axis)
              const nowMs = performance.now();
              nodHistoryRef.current.push({ y: nose.y, t: nowMs });
              
              // Only keep last 600ms of history
              nodHistoryRef.current = nodHistoryRef.current.filter(item => nowMs - item.t < 600);
              
              if (nodHistoryRef.current.length >= 4 && nowMs - lastNodTimeRef.current > 2500 && !isAsleepRef.current) {
                const ys = nodHistoryRef.current.map(item => item.y);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);
                const rangeY = maxY - minY;
                
                // standard FaceMesh coordinates: y-axis is normalized between 0.0 and 1.0. 
                // A rapid rangeY > 0.035 indicates strong vertical movement.
                if (rangeY > 0.035) {
                  // Verify distinct direction change (both going down and going up)
                  let directions = [];
                  for (let i = 1; i < nodHistoryRef.current.length; i++) {
                    directions.push(nodHistoryRef.current[i].y - nodHistoryRef.current[i - 1].y);
                  }
                  const hasDown = directions.some(d => d > 0.003);
                  const hasUp = directions.some(d => d < -0.003);
                  
                  if (hasDown && hasUp) {
                    lastNodTimeRef.current = nowMs;
                    setIsAffirmative(true);
                    addLog("Head Nod gesture detected! Triggering affirmative smile.", "success");
                    
                    // Trigger gentle mobile vibrate on nod detection
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate([20, 30, 20]);
                    }
                    
                    // Reset to normal after 1.5s
                    setTimeout(() => {
                      setIsAffirmative(false);
                    }, 1500);
                  }
                }
              }

              // Eye openness / Blink tracking
              const leftDist = Math.sqrt(Math.pow(face[159].x - face[145].x, 2) + Math.pow(face[159].y - face[145].y, 2));
              const leftWidth = Math.sqrt(Math.pow(face[33].x - face[133].x, 2) + Math.pow(face[33].y - face[133].y, 2));
              const leftRatio = leftWidth > 0 ? (leftDist / leftWidth) : 0.25;

              const rightDist = Math.sqrt(Math.pow(face[386].x - face[374].x, 2) + Math.pow(face[386].y - face[374].y, 2));
              const rightWidth = Math.sqrt(Math.pow(face[263].x - face[362].x, 2) + Math.pow(face[263].y - face[362].y, 2));
              const rightRatio = rightWidth > 0 ? (rightDist / rightWidth) : 0.25;

              // Normalize: ratio < 0.14 is closed (0.0), ratio > 0.3 is fully open (1.0)
              const normLeft = Math.max(0, Math.min(1, (leftRatio - 0.14) / 0.16));
              const normRight = Math.max(0, Math.min(1, (rightRatio - 0.14) / 0.16));

              // Brows Raise tracking (centered above the eye pupils vertically)
              const leftBrowDist = face[159].y - face[105].y;
              const leftBrowRatio = leftWidth > 0 ? (leftBrowDist / leftWidth) : 0.85;

              const rightBrowDist = face[386].y - face[334].y;
              const rightBrowRatio = rightWidth > 0 ? (rightBrowDist / rightWidth) : 0.85;

              // Normalize: ~0.5 (frown) -> -1.0, 0.85 (neutral) -> 0.0, 1.2+ (fully raised) -> 1.0
              const normLeftBrow = Math.max(-1, Math.min(1, (leftBrowRatio - 0.85) / 0.35));
              const normRightBrow = Math.max(-1, Math.min(1, (rightBrowRatio - 0.85) / 0.35));

              // Mouth open tracking
              const mouthWidth = Math.sqrt(Math.pow(face[61].x - face[291].x, 2) + Math.pow(face[61].y - face[291].y, 2));
              const mouthDist = Math.sqrt(Math.pow(face[13].x - face[14].x, 2) + Math.pow(face[13].y - face[14].y, 2));
              const mouthRatio = mouthWidth > 0 ? (mouthDist / mouthWidth) : 0.0;

              // Normalize: < 0.08 is closed (0.0), > 0.45 is wide open (1.0)
              const normMouth = Math.max(0, Math.min(1, (mouthRatio - 0.08) / 0.37));

              setExpression({
                leftEyeOpen: normLeft,
                rightEyeOpen: normRight,
                leftBrowRaise: normLeftBrow,
                rightBrowRaise: normRightBrow,
                mouthOpen: normMouth,
              });
          } else {
              setLookOffset({ x: 0, y: 0 });
              setIsDistracted(true);
              setExpression({
                leftEyeOpen: 1.0,
                rightEyeOpen: 1.0,
                leftBrowRaise: 0.0,
                rightBrowRaise: 0.0,
                mouthOpen: 0.0,
              });
          }
        });

        let isRunning = true;
        const processFrame = async () => {
          if (!isRunning) return;
          if (trackerMode === 'mediapipe' && videoRef.current && videoRef.current.readyState >= 2) {
            try {
              await faceMeshInstance.send({ image: videoRef.current });
            } catch (err) {
              // Ignore frame-send warnings during transitions
            }
          }
          requestAnimationFrame(processFrame);
        };
        
        processFrame();
        hasLoadedMediaPipe = true;
        addLog("MediaPipe FaceMesh engine active and tracking.", "success");
      }
    } catch (e) {
      console.warn("Failed to load MediaPipe FaceMesh, falling back to pixel tracker", e);
    }

    if (!hasLoadedMediaPipe) {
      setTrackerMode('fallback');
      addLog("MediaPipe unavailable in this environment. Launching Retro Motion Tracker fallback.", "warn");
      startFallbackTracker();
    }
  };

  const startFallbackTracker = () => {
    let isRunning = true;
    const runFallback = () => {
      if (!isRunning || trackerMode !== 'fallback') return;

      if (videoRef.current && fallbackCanvasRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const canvas = fallbackCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = 40;
          const h = 30;
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(video, 0, 0, w, h);
          const frame = ctx.getImageData(0, 0, w, h);
          const data = frame.data;

          if (prevFrameDataRef.current) {
            const prev = prevFrameDataRef.current;
            let totalDiff = 0;
            let motionXSum = 0;
            let motionYSum = 0;
            let motionPixelsCount = 0;

            for (let i = 0; i < data.length; i += 4) {
              const rDiff = Math.abs(data[i] - prev[i]);
              const gDiff = Math.abs(data[i+1] - prev[i+1]);
              const bDiff = Math.abs(data[i+2] - prev[i+2]);
              const diff = (rDiff + gDiff + bDiff) / 3;

              if (diff > 25) { // Significant motion threshold
                const pixelIndex = i / 4;
                const px = pixelIndex % w;
                const py = Math.floor(pixelIndex / w);
                motionXSum += px;
                motionYSum += py;
                motionPixelsCount++;
                totalDiff += diff;
              }
            }

            const averageDiff = totalDiff / (w * h);
            if (motionPixelsCount > 10) {
              // Calculate centroid of motion
              const avgX = motionXSum / motionPixelsCount;
              const avgY = motionYSum / motionPixelsCount;

              // Convert to offset
              const targetX = ((avgX / w) - 0.5) * 60;
              const targetY = ((avgY / h) - 0.5) * 30;

              setLookOffset({ x: -targetX, y: targetY });
              setIsDistracted(false);
            } else if (averageDiff < 1) {
              // Sleep if absolutely no movement for a while
              setIsDistracted(true);
            }
          }
          prevFrameDataRef.current = data;
        }
      }
      setTimeout(runFallback, 100); // 10 fps is perfect for motion tracking
    };
    runFallback();
  };

  const playAudioChunk = (audioCtx: AudioContext, base64: string) => {
    try {
      const audioData = base64ToPcm(base64);
      const buffer = audioCtx.createBuffer(1, audioData.length, audioCtx.sampleRate);
      buffer.getChannelData(0).set(audioData);
      
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      
      // Connect to outputAnalyser for live lip-sync FFT analysis
      if (outputAnalyserRef.current) {
        source.connect(outputAnalyserRef.current);
      } else {
        source.connect(audioCtx.destination);
      }
      
      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
          nextStartTimeRef.current = currentTime + 0.05; 
      }
      
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;

      source.onended = () => {
        if (audioCtx.currentTime >= nextStartTimeRef.current - 0.1) {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
        }
      };
    } catch (e) {
      console.error("Audio playback error", e);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-screen h-screen bg-black text-[#00ffcc] font-mono overflow-hidden relative flex flex-col md:flex-row">
      {showTemplate && <PaperTemplate onClose={() => setShowTemplate(false)} />}
      
      {/* Hidden elements for capturing */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={fallbackCanvasRef} className="hidden" />

      {appState === 'idle' ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 px-4">
           <div className="w-16 h-16 rounded-xl border-2 border-[#00ffcc] flex items-center justify-center shadow-[0_0_25px_#00ffcc] bg-[#00ffcc]/10">
              <span className="text-3xl animate-pulse">🤖</span>
           </div>
           <h1 className="text-4xl tracking-wider uppercase font-bold text-center glow-text text-shadow">Antonio's Paper Pet</h1>
           <p className="text-center max-w-md opacity-80 text-sm leading-relaxed">
              An intelligent multimodal desk companion. Powered by Gemini Live, real-time spatial computer vision, and procedural 8-bit lip sync.
           </p>

           {/* Pre-launch Persona & Language Picker */}
           <div className="w-full max-w-md bg-zinc-950 border border-[#00ffcc]/30 p-4 rounded-sm space-y-3">
             <div className="flex items-center justify-between text-xs uppercase font-bold text-[#00ffcc]/90">
               <span>Companion Role Matrix</span>
               <span className="text-[10px] text-gray-400">Step 1 Activated</span>
             </div>
             
             <div className="grid grid-cols-3 gap-1.5 text-[10px]">
               {[
                 { id: 'coach', label: '🎓 Coach', desc: 'Focus & Sprints' },
                 { id: 'cozy', label: '☕ Cozy', desc: 'Warm & Calming' },
                 { id: 'butler', label: '🎩 Butler', desc: 'Witty & Sharp' },
                 { id: 'cyber', label: '⚡ Cyber', desc: 'Matrix Core' },
                 { id: 'tamagotchi', label: '🐾 Pet', desc: 'Cheer & Play' },
               ].map((p) => (
                 <button
                   key={p.id}
                   onClick={() => setAiPersona(p.id as any)}
                   className={`p-2 rounded-sm border text-left transition-all ${
                     aiPersona === p.id 
                       ? 'bg-[#00ffcc] text-black border-[#00ffcc] font-bold shadow-[0_0_10px_rgba(0,255,204,0.4)]' 
                       : 'bg-black/60 border-zinc-800 text-gray-400 hover:border-[#00ffcc]/50 hover:text-white'
                   }`}
                 >
                   <div className="font-bold">{p.label}</div>
                   <div className={`text-[8px] ${aiPersona === p.id ? 'text-black/80' : 'text-gray-500'}`}>{p.desc}</div>
                 </button>
               ))}
             </div>

             <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[10px]">
               <span className="text-gray-400 uppercase">Spoken Tongue:</span>
               <div className="flex space-x-1">
                 {[
                   { id: 'sv', label: '🇸🇪 SV' },
                   { id: 'en', label: '🇬🇧 EN' },
                   { id: 'ja', label: '🇯🇵 JA' },
                   { id: 'es', label: '🇪🇸 ES' },
                   { id: 'de', label: '🇩🇪 DE' },
                   { id: 'fr', label: '🇫🇷 FR' },
                 ].map((lang) => (
                   <button
                     key={lang.id}
                     onClick={() => setAiLanguage(lang.id as any)}
                     className={`px-2 py-1 rounded-xs border text-[9px] font-bold transition-all ${
                       aiLanguage === lang.id
                         ? 'bg-[#00ffcc] text-black border-[#00ffcc]'
                         : 'bg-zinc-900 border-zinc-700 text-gray-400 hover:text-[#00ffcc]'
                     }`}
                   >
                     {lang.label}
                   </button>
                 ))}
               </div>
             </div>
           </div>

           <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-8 w-full max-w-md">
             <button 
               onClick={startApp}
               className="flex-1 px-6 py-4 bg-[#00ffcc] text-black uppercase font-bold tracking-widest hover:bg-opacity-90 transition-all rounded-sm shadow-[0_0_20px_#00ffcc]"
             >
               Awaken Pet
             </button>
             <button 
               onClick={() => setShowTemplate(true)}
               className="flex-1 px-6 py-4 border-2 border-[#00ffcc] text-[#00ffcc] uppercase font-bold tracking-widest hover:bg-[#00ffcc] hover:text-black hover:shadow-[0_0_20px_#00ffcc] transition-all rounded-sm"
             >
               Paper Model
             </button>
             <button 
               onClick={() => setShowDeskHabits(true)}
               className="px-4 py-4 border-2 border-amber-400/80 text-amber-300 uppercase font-bold tracking-widest hover:bg-amber-400 hover:text-black hover:shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all rounded-sm"
               title="Desk wellness & companion care suite"
             >
               Care
             </button>
           </div>
           {error && <p className="text-red-500 text-sm mt-4 text-center max-w-md">{error}</p>}
        </div>
      ) : (
        <>
          {/* Main Pet Screen */}
          <div className="flex-1 relative flex flex-col h-full bg-black">
             {/* Connection Status Indicator */}
             <div className="absolute top-6 left-6 flex items-center space-x-3 opacity-80 z-10">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#00ffcc] shadow-[0_0_10px_#00ffcc]' : appState === 'calibrating' ? 'bg-yellow-500 shadow-[0_0_10px_yellow]' : 'bg-red-500 shadow-[0_0_10px_red]'}`} />
                <span className="text-xs tracking-widest uppercase font-bold">{isConnected ? `Soul: ${aiPersona.toUpperCase()}` : appState === 'calibrating' ? 'Calibrating Posture...' : 'Connecting Soul...'}</span>
             </div>

             {/* Dynamic Mode Switcher & Sprint indicator */}
             <div className="absolute top-6 right-6 flex items-center space-x-2 z-10">
                {focusSprintActive && (
                  <div className="px-3 py-1 text-[10px] uppercase bg-amber-500/20 border border-amber-500 text-amber-300 rounded-sm font-bold animate-pulse flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>SPRINT: {formatTime(focusSprintSeconds)}</span>
                  </div>
                )}
                <button 
                  onClick={() => {
                    const nextMode = trackerMode === 'mediapipe' ? 'fallback' : 'mediapipe';
                    setTrackerMode(nextMode);
                    addLog(`Manually switched to ${nextMode === 'mediapipe' ? 'MediaPipe AI' : 'Retro Motion'} tracker.`, 'info');
                    if (nextMode === 'fallback') startFallbackTracker();
                  }}
                  className="px-3 py-1 text-[10px] uppercase border border-[#00ffcc]/30 hover:border-[#00ffcc] hover:bg-[#00ffcc]/10 transition-all rounded-sm text-[#00ffcc]"
                >
                  Sensor: {trackerMode === 'mediapipe' ? 'MediaPipe' : 'Motion'}
                </button>
             </div>

             {/* The Pet Face */}
             <div className="flex-1 flex items-center justify-center relative">
                {appState === 'calibrating' && (
                  <div className="absolute top-1/3 text-[#00ffcc] font-bold tracking-widest uppercase animate-pulse opacity-75 z-10 text-center">
                    <div>Calibration Phase...</div>
                    <div className="text-[10px] text-gray-400 mt-1">Sit upright to calibrate posture sentinel</div>
                  </div>
                )}
                <PetFace 
                  isSpeaking={isSpeaking} 
                  isDistracted={uiLookOffset ? false : isDistracted} 
                  lookOffset={uiLookOffset || lookOffset} 
                  expression={expression} 
                  micVolume={micVolume}
                  micPitch={micPitch}
                  speechAmplitude={speechAmplitude}
                  postureAlert={postureAlert}
                  aiPersona={aiPersona}
                  isCalibrating={appState === 'calibrating'}
                  isAsleep={isAsleep}
                  onWake={() => {
                    lastActiveRef.current = Date.now();
                    if (isAsleepRef.current) {
                      setIsAsleep(false);
                      isAsleepRef.current = false;
                    }
                  }}
                  oledTheme={oledTheme}
                  character={character}
                  pixelGrid={pixelGrid}
                  glassShine={glassShine}
                  showPCB={showPCB}
                  brightness={brightness}
                  screenFlicker={screenFlicker}
                  isNightTime={isNightTime}
                  isAffirmative={isAffirmative}
                />
             </div>
             
             {/* Dynamic Status bar */}
             <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-75 text-xs uppercase tracking-widest">
                <span>[X: {lookOffset.x.toFixed(0)} | Y: {lookOffset.y.toFixed(0)}] {postureAlert ? `| ⚠️ ${postureAlert}` : ''}</span>
                <span>{isSpeaking ? `● Speaking [${Math.round(speechAmplitude * 100)}% FFT]` : isDistracted ? '💤 Resting (No face)' : '⚡ Active watching'}</span>
             </div>
          </div>

          {/* Right-side Control and Debug Deck */}
          <div className={`w-full md:w-88 border-t md:border-t-0 md:border-l border-[#00ffcc]/20 p-5 flex flex-col h-1/3 md:h-full justify-between overflow-y-auto transition-all duration-700 ${isNightTime || (ambientLight !== null && ambientLight < 45) ? 'bg-black text-slate-400' : 'bg-zinc-950'}`}>
             <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold tracking-widest uppercase text-[#00ffcc] flex items-center space-x-2">
                    <span>Soul & Vision Deck</span>
                  </h3>
                  <button 
                    onClick={() => setShowMonitor(!showMonitor)}
                    className="text-[10px] uppercase underline text-gray-400 hover:text-[#00ffcc]"
                  >
                    {showMonitor ? 'Hide Feed' : 'Show Feed'}
                  </button>
                </div>

                {/* Camera Monitor */}
                {showMonitor && (
                   <div className="relative aspect-video w-full bg-black border border-[#00ffcc]/20 rounded-sm overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#00ffcc]/5 pointer-events-none z-10 scanline-effect" />
                      <video 
                        ref={(el) => {
                          if (el && videoRef.current && el.srcObject !== videoRef.current.srcObject) {
                            el.srcObject = videoRef.current.srcObject;
                            el.play().catch(() => {});
                          }
                        }}
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover opacity-50 grayscale contrast-150 scale-x-[-1]" 
                      />
                      <div className="absolute bottom-2 left-2 text-[10px] font-mono tracking-wider text-[#00ffcc] bg-black/80 px-2 py-0.5 rounded-sm">
                         VISION LINK (1 FPS TX)
                      </div>
                      
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00ffcc]/60 shadow-[0_0_8px_#00ffcc] animate-bounce" />
                   </div>
                )}

                {/* Companion Soul & Persona Switcher */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#00ffcc]/80">AI Persona Matrix</h4>
                    <span className="text-[8px] text-amber-400 uppercase font-mono">Real-time Live API</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'coach', label: '🎓 Coach' },
                      { id: 'cozy', label: '☕ Cozy' },
                      { id: 'butler', label: '🎩 Butler' },
                      { id: 'cyber', label: '⚡ Cyber' },
                      { id: 'tamagotchi', label: '🐾 Pet' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setAiPersona(p.id as any);
                          updateCompanionConfig(p.id as any, aiLanguage, aiVoice);
                        }}
                        className={`px-1.5 py-1 text-[8px] uppercase tracking-wider rounded-sm border transition-all text-center
                          ${aiPersona === p.id 
                            ? 'bg-[#00ffcc] text-black border-[#00ffcc] font-bold shadow-[0_0_8px_rgba(0,255,204,0.3)]' 
                            : 'bg-transparent border-[#00ffcc]/20 text-gray-400 hover:border-[#00ffcc]/50 hover:text-[#00ffcc]'
                          }
                        `}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Language Selector */}
                  <div className="pt-1.5 flex items-center justify-between text-[8px]">
                    <span className="text-gray-400 uppercase">Companion Language:</span>
                    <div className="flex space-x-1">
                      {[
                        { id: 'sv', label: '🇸🇪' },
                        { id: 'en', label: '🇬🇧' },
                        { id: 'ja', label: '🇯🇵' },
                        { id: 'es', label: '🇪🇸' },
                        { id: 'de', label: '🇩🇪' },
                        { id: 'fr', label: '🇫🇷' },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => {
                            setAiLanguage(lang.id as any);
                            updateCompanionConfig(aiPersona, lang.id as any, aiVoice);
                          }}
                          className={`px-1.5 py-0.5 rounded-xs border text-[8px] transition-all ${
                            aiLanguage === lang.id
                              ? 'bg-[#00ffcc] text-black border-[#00ffcc] font-bold'
                              : 'bg-zinc-900 border-zinc-700 text-gray-400 hover:text-white'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Voice Synthesis Selector */}
                  <div className="pt-1 flex items-center justify-between text-[8px]">
                    <span className="text-gray-400 uppercase">Voice Timbre:</span>
                    <div className="flex space-x-1">
                      {[
                        { id: 'Puck', label: 'Puck' },
                        { id: 'Aoede', label: 'Aoede' },
                        { id: 'Charon', label: 'Charon' },
                        { id: 'Fenrir', label: 'Fenrir' },
                        { id: 'Kore', label: 'Kore' },
                      ].map((v) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setAiVoice(v.id as any);
                            updateCompanionConfig(aiPersona, aiLanguage, v.id as any);
                          }}
                          className={`px-1.5 py-0.5 rounded-xs border text-[7px] font-bold uppercase transition-all ${
                            aiVoice === v.id
                              ? 'bg-[#00ffcc] text-black border-[#00ffcc]'
                              : 'bg-zinc-900 border-zinc-700 text-gray-400 hover:text-white'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Smart Focus & Posture Sentinel */}
                <div className="space-y-2 pt-2 border-t border-[#00ffcc]/10">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#00ffcc]/80">Focus & Posture Sentinel</h4>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-xs uppercase ${postureAlert ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400'}`}>
                      {postureAlert ? 'Alert Active' : 'Sentinel OK'}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setFocusSprintActive(!focusSprintActive);
                        if (!focusSprintActive) {
                          setFocusSprintSeconds(25 * 60);
                          addLog("Started 25-minute Deep Focus Sprint!", "success");
                        } else {
                          addLog("Focus Sprint cancelled.", "warn");
                        }
                      }}
                      className={`flex-1 py-1.5 px-2 text-[9px] font-bold uppercase rounded-sm border transition-all text-center ${
                        focusSprintActive 
                          ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                          : 'bg-zinc-900 border-[#00ffcc]/30 text-[#00ffcc] hover:bg-[#00ffcc]/10'
                      }`}
                    >
                      {focusSprintActive ? `Sprint: ${formatTime(focusSprintSeconds)} (Stop)` : '⏱️ Start 25m Focus Sprint'}
                    </button>

                    <button
                      onClick={() => {
                        baselineNoseYRef.current = null;
                        addLog("Recalibrating Posture Baseline height...", "info");
                        if (typeof navigator !== 'undefined' && navigator.vibrate) {
                          navigator.vibrate([15, 30]);
                        }
                      }}
                      className="px-2.5 py-1.5 text-[8px] uppercase border border-zinc-700 bg-zinc-900 hover:border-[#00ffcc] text-gray-300 rounded-sm"
                    >
                      Calibrate
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[8px] text-gray-300 pt-1">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={postureSentinelEnabled} 
                        onChange={(e) => setPostureSentinelEnabled(e.target.checked)}
                        className="rounded-sm bg-zinc-900 border-zinc-700 text-[#00ffcc] accent-[#00ffcc]"
                      />
                      <span>Posture Sentinel</span>
                    </label>

                    <div className="flex items-center justify-between bg-zinc-900/60 px-2 py-0.5 rounded-sm border border-zinc-800">
                      <span className="text-gray-500 uppercase">Focus Score</span>
                      <span className="font-bold text-[#00ffcc]">{Math.round(focusScore)}%</span>
                    </div>
                  </div>
                </div>

                {/* Telemetry data */}
                <div className="grid grid-cols-2 gap-3 text-[9px] border-t border-b border-[#00ffcc]/10 py-3">
                   <div>
                     <span className="block opacity-50">LIP-SYNC FFT:</span>
                     <span className="font-bold text-white">{isSpeaking ? `${(speechAmplitude * 100).toFixed(0)}% (Active)` : 'IDLE'}</span>
                   </div>
                   <div>
                     <span className="block opacity-50">EYE TRACK:</span>
                     <span className="font-bold text-white">{(lookOffset.x !== 0 || lookOffset.y !== 0) ? 'ACTIVE' : 'IDLE'}</span>
                   </div>
                   <div>
                     <span className="block opacity-50">ENGINE:</span>
                     <span className="font-bold text-white uppercase">{trackerMode}</span>
                   </div>
                   <div>
                     <span className="block opacity-50">SLEEP MODE:</span>
                     <span className="font-bold text-white">{isDistracted ? 'ON' : 'OFF'}</span>
                   </div>
                </div>

                {/* OLED Hardware Customizer */}
                <div className="space-y-3 pt-1">
                  <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#00ffcc]/80">OLED Screen Config</h4>
                  
                  {/* Character Preset Selector */}
                  <div className="space-y-1">
                    <span className="text-[8px] text-gray-400 uppercase tracking-wider block">Personality Style</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'classic', label: 'Classic' },
                        { id: 'cyber', label: 'Cyber' },
                        { id: 'kawaii', label: 'Kawaii' },
                        { id: 'pensive', label: 'Pensive' },
                        { id: 'furious', label: 'Furious' },
                        { id: 'chaotic', label: 'Chaotic' },
                      ].map((char) => (
                        <button
                          key={char.id}
                          onClick={() => setCharacter(char.id as any)}
                          className={`px-1.5 py-1 text-[8px] uppercase tracking-wider rounded-sm border transition-all text-center
                            ${character === char.id 
                              ? 'bg-[#00ffcc] text-black border-[#00ffcc] font-bold shadow-[0_0_8px_rgba(0,255,204,0.3)]' 
                              : 'bg-transparent border-[#00ffcc]/20 text-gray-400 hover:border-[#00ffcc]/50 hover:text-[#00ffcc]'
                            }
                          `}
                        >
                          {char.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Preset Selector */}
                  <div className="space-y-1">
                    <span className="text-[8px] text-gray-400 uppercase tracking-wider block">Color Spectrum</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'dynamic', label: 'Dynamic' },
                        { id: 'split', label: 'Split Y/B' },
                        { id: 'cyan', label: 'Cyan' },
                        { id: 'amber', label: 'Amber' },
                        { id: 'green', label: 'Green' },
                        { id: 'white', label: 'White' },
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setOledTheme(theme.id as any)}
                          className={`px-1.5 py-1 text-[8px] uppercase tracking-wider rounded-sm border transition-all text-center
                            ${oledTheme === theme.id 
                              ? 'bg-[#00ffcc] text-black border-[#00ffcc] font-bold shadow-[0_0_8px_rgba(0,255,204,0.3)]' 
                              : 'bg-transparent border-[#00ffcc]/20 text-gray-400 hover:border-[#00ffcc]/50 hover:text-[#00ffcc]'
                            }
                          `}
                        >
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brightness Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-gray-400 uppercase tracking-wider">
                      <span>Glow Brightness</span>
                      <span className="font-bold text-[#00ffcc]">{brightness}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="35" 
                      max="150" 
                      value={brightness} 
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-[#00ffcc] bg-zinc-800 h-1 rounded-sm appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Hardware Toggles */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] text-gray-300">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showPCB} 
                        onChange={(e) => setShowPCB(e.target.checked)}
                        className="rounded-sm bg-zinc-900 border-zinc-700 text-[#00ffcc] accent-[#00ffcc]"
                      />
                      <span>PCB Base</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={pixelGrid} 
                        onChange={(e) => setPixelGrid(e.target.checked)}
                        className="rounded-sm bg-zinc-900 border-zinc-700 text-[#00ffcc] accent-[#00ffcc]"
                      />
                      <span>Dot Matrix</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={glassShine} 
                        onChange={(e) => setGlassShine(e.target.checked)}
                        className="rounded-sm bg-zinc-900 border-zinc-700 text-[#00ffcc] accent-[#00ffcc]"
                      />
                      <span>Glass Glare</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={screenFlicker} 
                        onChange={(e) => setScreenFlicker(e.target.checked)}
                        className="rounded-sm bg-zinc-900 border-zinc-700 text-[#00ffcc] accent-[#00ffcc]"
                      />
                      <span>Flicker FX</span>
                    </label>
                  </div>
                </div>
             </div>

             {/* Real-time Logger Console */}
             <div className="flex-1 flex flex-col mt-5 min-h-[110px]">
                <span className="text-[10px] tracking-widest uppercase opacity-50 mb-1.5">Live Console Logs</span>
                <div className="flex-1 bg-black border border-[#00ffcc]/10 p-2.5 rounded-sm font-mono text-[9px] overflow-y-auto space-y-1.5 h-28 scrollbar-thin">
                   {logs.length === 0 ? (
                      <span className="text-gray-600 italic">Waiting for events...</span>
                   ) : (
                      logs.map((log, i) => (
                        <div key={i} className="leading-relaxed">
                          <span className="text-gray-500 mr-1.5">[{log.time}]</span>
                          <span className={
                            log.type === 'success' ? 'text-green-400' :
                            log.type === 'warn' ? 'text-yellow-400' :
                            log.type === 'error' ? 'text-red-400' : 'text-[#00ffcc]'
                          }>
                            {log.message}
                          </span>
                        </div>
                      ))
                   )}
                </div>
             </div>

             <div className="mt-4 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setShowDeskHabits(true)}
                  className="w-full py-2 bg-transparent hover:bg-amber-400/10 border border-amber-400/60 text-amber-300 uppercase text-[11px] font-bold tracking-widest rounded-sm transition-all text-center"
                >
                  Care & Habits
                </button>
                <button 
                  onClick={() => setShowTemplate(true)}
                  className="w-full py-2 bg-transparent hover:bg-[#00ffcc]/10 border border-[#00ffcc] text-[#00ffcc] uppercase text-[11px] font-bold tracking-widest rounded-sm transition-all text-center"
                >
                  Open Blueprint
                </button>
             </div>
          </div>
        </>
      )}

      {/* Desk Wellness & Companion Habits Drawer */}
      {showDeskHabits && (
        <DeskHabits 
          onClose={() => setShowDeskHabits(false)} 
          focusScore={focusScore}
          onCompanionReact={(action) => {
            addLog(`Desk action triggered: ${action}`, 'info');
          }}
        />
      )}
    </div>
  );
}


