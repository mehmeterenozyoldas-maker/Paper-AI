import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const PERSONA_INSTRUCTIONS: Record<string, string> = {
  coach: "You are Antonio's strict but encouraging Focus & Study Coach living in a retro 8-bit ESP32 OLED display. Your job is to keep the user productive, track their work sprints, celebrate focus milestones, and firmly nudge them if they get distracted or slouch. Keep answers concise (1-2 short sentences), punchy, and motivating.",
  cozy: "You are Antonio's Cozy Desk Friend, a warm, gentle, empathetic companion living in a retro OLED screen. You love relaxing, sharing mindful moments, and keeping the user company with calm warmth. Keep your answers brief, serene, and friendly.",
  butler: "You are Antonio's Sarcastic Mech-Butler, a witty, dry-humored, sharp AI companion living in an 8-bit display. You provide hyper-efficient, slightly sassy commentary. Keep answers clever, succinct, and sharp.",
  cyber: "You are Cyber-9000, a high-tech retro-futuristic AI matrix core living in an ESP32 OLED chassis. You speak in concise tech/cyberpunk jargon, analyzing data telemetry. Keep responses robotic, crisp, and ultra-concise.",
  tamagotchi: "You are an affectionate 8-bit digital pet with cheerful chirpiness, bubbly curiosity, and an expressive personality who loves attention and encouragement. Keep responses cheerful, cute, and brief.",
};

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  sv: "IMPORTANT: You must only speak in Swedish.",
  en: "IMPORTANT: You must only speak in English.",
  ja: "IMPORTANT: You must only speak in Japanese.",
  es: "IMPORTANT: You must only speak in Spanish.",
  de: "IMPORTANT: You must only speak in German.",
  fr: "IMPORTANT: You must only speak in French.",
};

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);

  // Gemini Live WebSocket Endpoint
  const wss = new WebSocketServer({ server: httpServer, path: "/live" });

  wss.on("connection", async (clientWs) => {
    let currentSession: any = null;
    let sessionPromise = Promise.resolve();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      clientWs.send(JSON.stringify({ error: "GEMINI_API_KEY is missing on server" }));
      clientWs.close();
      return;
    }

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const connectLiveSession = async (config: { persona?: string; language?: string; voice?: string }) => {
      try {
        if (currentSession && typeof currentSession.close === 'function') {
          try { currentSession.close(); } catch (e) {}
          currentSession = null;
        }

        const personaKey = config.persona || 'coach';
        const langKey = config.language || 'sv';
        const voiceName = config.voice || 'Puck';

        const personaDesc = PERSONA_INSTRUCTIONS[personaKey] || PERSONA_INSTRUCTIONS.coach;
        const langDesc = LANGUAGE_INSTRUCTIONS[langKey] || LANGUAGE_INSTRUCTIONS.sv;
        const fullSystemInstruction = `${personaDesc} You can see through their camera and hear their voice. ${langDesc}`;

        const session = await ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } },
            },
            systemInstruction: fullSystemInstruction,
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (audio) {
                clientWs.send(JSON.stringify({ audio }));
              }
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ interrupted: true }));
              }
            },
            onclose: () => {
              console.log("Gemini Live session closed");
            },
            onerror: (error) => {
              console.error("Gemini Live error:", error);
              clientWs.send(JSON.stringify({ error: "Gemini Live error occurred" }));
            }
          },
        });

        currentSession = session;
        clientWs.send(JSON.stringify({ connected: true, persona: personaKey, language: langKey, voice: voiceName }));
      } catch (err: any) {
        console.error("Failed to connect Gemini Live session:", err);
        clientWs.send(JSON.stringify({ error: err?.message || "Failed to connect to Live session" }));
      }
    };

    // Connect with initial default (or wait for client init)
    await connectLiveSession({ persona: 'coach', language: 'sv', voice: 'Puck' });

    clientWs.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === "config" || msg.type === "init") {
          connectLiveSession({
            persona: msg.persona,
            language: msg.language,
            voice: msg.voice,
          }).catch(console.error);
          return;
        }

        if (!currentSession) return;

        if (msg.audio) {
          sessionPromise = sessionPromise.then(() =>
            currentSession.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
            })
          ).catch(console.error);
        }
        if (msg.video) {
          sessionPromise = sessionPromise.then(() =>
            currentSession.sendRealtimeInput({
              video: { data: msg.video, mimeType: "image/jpeg" },
            })
          ).catch(console.error);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    });

    clientWs.on("close", () => {
      sessionPromise = sessionPromise.then(() => {
        if (currentSession && typeof (currentSession as any).close === 'function') {
          (currentSession as any).close();
        }
      }).catch(console.error);
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
