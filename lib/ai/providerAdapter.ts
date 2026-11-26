import {
  executeProceduralReasoning,
  generateProceduralAudioBuffer,
  generateLocalVectorEmbedding,
  getDeterministicSeed,
} from "./SovereignProceduralAI";

export interface AIModelOption {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: "pollinations" | "local-procedural" | "ollama" | "custom";
}

export const NVK_AVAILABLE_MODELS: AIModelOption[] = [
  {
    id: "nvk-local-neural",
    name: "NVK Sovereign Procedural Engine",
    description: "100% client-side deterministic reasoning oracle. Zero network latency, offline-first.",
    category: "Autonomous Local",
    provider: "local-procedural",
  },
  {
    id: "pollinations-openai",
    name: "Pollinations AI (Open)",
    description: "Zero-key open cloud inference for multi-turn dialog and synthesis.",
    category: "Open / Free (No Key Required)",
    provider: "pollinations",
  },
  {
    id: "pollinations-deepseek",
    name: "DeepSeek Reasoning (Open)",
    description: "Open reasoning endpoint via Pollinations without API keys.",
    category: "Open / Free (No Key Required)",
    provider: "pollinations",
  },
  {
    id: "pollinations-mistral",
    name: "Mistral Open",
    description: "Fast open-weights model via Pollinations.",
    category: "Open / Free (No Key Required)",
    provider: "pollinations",
  },
  {
    id: "pollinations-qwen",
    name: "Qwen 2.5 Open",
    description: "Open parameter foundation model for coding and RPG lore.",
    category: "Open / Free (No Key Required)",
    provider: "pollinations",
  },
  {
    id: "ollama-local",
    name: "Ollama Local Node (localhost:11434)",
    description: "Connect directly to a local Ollama server (`ollama serve`).",
    category: "Local Infrastructure",
    provider: "ollama",
  },
  {
    id: "custom",
    name: "Custom Model / Ollama Tag...",
    description: "Specify a custom Ollama model tag (e.g. llama3.2, qwen2.5) or compatible ID.",
    category: "Custom",
    provider: "custom",
  },
];

// Historical model ids from before the Gemini purge. Any saved selection that
// still names a removed provider resolves to the local procedural engine so
// the game keeps working with zero network calls.
const REMOVED_PROVIDER_ALIASES: Record<string, string> = {
  "gemini-3-pro-preview": "nvk-local-neural",
  "gemini-3.1-pro-preview": "nvk-local-neural",
  "gemini-3-flash-preview": "nvk-local-neural",
  "gemini-3.5-flash": "nvk-local-neural",
  "gemini-2.5-flash": "nvk-local-neural",
  "gemini-2.5-pro": "nvk-local-neural",
  "gemini-flash-latest": "nvk-local-neural",
  "gemini-3.1-flash-lite": "nvk-local-neural",
  "gemini-2.5-flash-image": "nvk-local-neural",
  "imagen-4.0-generate-001": "nvk-local-neural",
  "imagen-3.0-generate-002": "nvk-local-neural",
};

export function normalizeModelId(requestedModel: string): string {
  const trimmed = requestedModel.trim();
  if (trimmed.startsWith("gemini-") || trimmed.startsWith("imagen-")) {
    return "nvk-local-neural";
  }
  return REMOVED_PROVIDER_ALIASES[trimmed] || trimmed;
}

export function resolveAdapterModelId(
  selectedModelId: string,
  customModelInput: string,
  requestedModel?: string
): string {
  let target = requestedModel || selectedModelId || "nvk-local-neural";
  if (target === "custom") {
    target = customModelInput.trim() || "nvk-local-neural";
  }
  return normalizeModelId(target);
}

/**
 * Generates an inline geometric SVG portrait/emblem data URI so avatars and scenes
 * never depend on external unsplash links or fail inside offline sandboxes.
 */
export function generateProceduralSvgArtwork(prompt: string): string {
  const seed = getDeterministicSeed(prompt || "NVK-SEEKER");
  const hue1 = seed % 360;
  const hue2 = (hue1 + 72) % 360;
  const hue3 = (hue1 + 190) % 360;
  const sides = 5 + (seed % 4);

  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const r = 115 + ((seed >> (i % 8)) & 31);
    const x = (256 + Math.cos(angle) * r).toFixed(1);
    const y = (256 + Math.sin(angle) * r).toFixed(1);
    points.push(`${x},${y}`);
  }

  const innerPoints: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides + Math.PI / sides;
    const r = 56 + ((seed >> ((i + 3) % 8)) & 23);
    const x = (256 + Math.cos(angle) * r).toFixed(1);
    const y = (256 + Math.sin(angle) * r).toFixed(1);
    innerPoints.push(`${x},${y}`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="hsl(${hue1}, 65%, 18%)"/>
      <stop offset="60%" stop-color="hsl(${hue2}, 55%, 10%)"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue1}, 90%, 65%)"/>
      <stop offset="100%" stop-color="hsl(${hue3}, 90%, 65%)"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="196" fill="none" stroke="url(#ring)" stroke-width="2" stroke-opacity="0.45" stroke-dasharray="8 6"/>
  <circle cx="256" cy="256" r="158" fill="none" stroke="hsl(${hue2}, 80%, 70%)" stroke-width="1.5" stroke-opacity="0.35"/>
  <polygon points="${points.join(" ")}" fill="hsl(${hue1}, 70%, 35%)" fill-opacity="0.22" stroke="url(#ring)" stroke-width="3"/>
  <polygon points="${innerPoints.join(" ")}" fill="hsl(${hue3}, 80%, 55%)" fill-opacity="0.28" stroke="hsl(${hue3}, 90%, 75%)" stroke-width="2"/>
  <circle cx="256" cy="256" r="34" fill="hsl(${hue1}, 90%, 70%)" fill-opacity="0.85"/>
  <circle cx="256" cy="256" r="14" fill="#f8fafc"/>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export interface AdapterTextParams {
  prompt: string;
  systemInstruction?: string;
  responseMimeType?: "text/plain" | "application/json";
  modelId: string;
  ollamaBaseUrl?: string;
}

export interface AdapterTextResult {
  text: string;
  providerUsed: string;
  modelUsed: string;
  fallbackUsed: boolean;
}

export async function invokeAdapterText(params: AdapterTextParams): Promise<AdapterTextResult> {
  const {
    prompt,
    systemInstruction,
    responseMimeType,
    modelId,
    ollamaBaseUrl = "http://localhost:11434",
  } = params;

  const normalizedModel = normalizeModelId(modelId);

  // 1. NVK Sovereign Procedural Engine (default, offline)
  if (normalizedModel === "nvk-local-neural") {
    return {
      text: executeProceduralReasoning(prompt, systemInstruction, responseMimeType),
      providerUsed: "local-procedural",
      modelUsed: "nvk-local-neural",
      fallbackUsed: false,
    };
  }

  // 2. Local Ollama Node execution
  const isOllamaExplicit =
    normalizedModel === "ollama-local" ||
    normalizedModel.startsWith("ollama:") ||
    (!normalizedModel.startsWith("pollinations-") && normalizedModel !== "nvk-local-neural");

  if (isOllamaExplicit) {
    const ollamaModel =
      normalizedModel === "ollama-local"
        ? "llama3.2"
        : normalizedModel.replace(/^ollama:/, "");
    try {
      const messages: Array<{ role: string; content: string }> = [];
      if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
      messages.push({ role: "user", content: prompt });

      const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          messages,
          stream: false,
          ...(responseMimeType === "application/json" ? { format: "json" } : {}),
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.message?.content;
        if (typeof content === "string" && content.trim().length > 0) {
          return {
            text: content.trim(),
            providerUsed: "ollama",
            modelUsed: ollamaModel,
            fallbackUsed: false,
          };
        }
      }
    } catch (ollamaErr) {
      console.warn("[NVK AI Adapter] Ollama node unavailable, falling back:", ollamaErr);
    }
  }

  // 3. Pollinations Open Inference (zero-key cloud)
  if (normalizedModel.startsWith("pollinations-") || !normalizedModel.startsWith("ollama:")) {
    try {
      let pollinationsModel = "openai";
      if (normalizedModel.includes("deepseek")) pollinationsModel = "deepseek";
      else if (normalizedModel.includes("mistral")) pollinationsModel = "mistral";
      else if (normalizedModel.includes("qwen")) pollinationsModel = "qwen";

      const isJson =
        responseMimeType === "application/json" ||
        prompt.toLowerCase().includes("return json") ||
        prompt.toLowerCase().includes("valid json");

      const messages: Array<{ role: string; content: string }> = [];
      if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
      messages.push({ role: "user", content: prompt });

      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          model: pollinationsModel,
          seed: getDeterministicSeed(prompt),
          jsonMode: isJson,
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (response.ok) {
        const textResult = await response.text();
        if (textResult && textResult.trim().length > 0) {
          return {
            text: textResult,
            providerUsed: "pollinations",
            modelUsed: pollinationsModel,
            fallbackUsed: !normalizedModel.startsWith("pollinations-"),
          };
        }
      }
    } catch (openErr) {
      console.warn("[NVK AI Adapter] Pollinations open fetch unavailable, using offline engine:", openErr);
    }
  }

  // 4. Deterministic Offline Procedural Engine
  return {
    text: executeProceduralReasoning(prompt, systemInstruction, responseMimeType),
    providerUsed: "local-procedural",
    modelUsed: "nvk-local-neural",
    fallbackUsed: true,
  };
}

export async function invokeAdapterImage(params: {
  prompt: string;
  preferOffline?: boolean;
}): Promise<string> {
  const { prompt, preferOffline } = params;
  const cleanPrompt = prompt.replace(/[^\w\s,.-]/gi, " ").trim() || "abstract mystic sigil";
  const seed = getDeterministicSeed(prompt);

  if (!preferOffline && typeof navigator !== "undefined" && navigator.onLine !== false) {
    const enhancedPrompt = `${cleanPrompt}, detailed fantasy sci-fi concept art, atmospheric lighting`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&seed=${seed}&nologo=true&model=flux`;
  }

  return generateProceduralSvgArtwork(prompt);
}

export async function invokeAdapterEmbedding(text: string): Promise<number[]> {
  return generateLocalVectorEmbedding(text);
}

export async function invokeAdapterSpeech(text: string): Promise<ArrayBuffer | null> {
  if (!text || !text.trim()) return null;

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(text.substring(0, 500));
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
      );
      if (preferredVoice) utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance);
    } catch (speechErr) {
      console.warn("WebSpeech synthesis note:", speechErr);
    }
  }

  try {
    return generateProceduralAudioBuffer(text);
  } catch (e) {
    console.warn("Procedural audio synthesis error:", e);
    return null;
  }
}
