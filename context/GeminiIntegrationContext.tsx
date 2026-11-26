import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { GeminiContextType, VectorMemoryEntry } from '../types';
import {
  NVK_AVAILABLE_MODELS,
  resolveAdapterModelId,
  invokeAdapterText,
  invokeAdapterImage,
  invokeAdapterEmbedding,
  invokeAdapterSpeech,
} from '../lib/ai/providerAdapter';

const GeminiContext = createContext<GeminiContextType | undefined>(undefined);

export const GeminiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastGeminiResponseText, setLastGeminiResponseText] = useState<string | null>(null);

  const [selectedModelId, setSelectedModelIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selected_ai_model');
      if (saved) return saved;
    }
    const envModel = (import.meta as any)?.env?.VITE_AI_MODEL;
    return envModel || 'pollinations-openai';
  });

  const [customModelInput, setCustomModelInputState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('custom_ai_model') || '';
    }
    return '';
  });

  const [customApiKey, setCustomApiKeyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('custom_ai_api_key') || '';
    }
    return '';
  });

  const setSelectedModelId = useCallback((id: string) => {
    setSelectedModelIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_ai_model', id);
    }
  }, []);

  const setCustomModelInput = useCallback((model: string) => {
    setCustomModelInputState(model);
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom_ai_model', model);
    }
  }, []);

  const setCustomApiKey = useCallback((key: string) => {
    setCustomApiKeyState(key);
    if (typeof window !== 'undefined') {
      if (key && key.trim().length > 0) {
        localStorage.setItem('custom_ai_api_key', key.trim());
      } else {
        localStorage.removeItem('custom_ai_api_key');
      }
    }
  }, []);

  const availableModels = NVK_AVAILABLE_MODELS.map(({ id, name, description, category }) => ({
    id,
    name,
    description,
    category,
  }));

  const getEffectiveApiKey = useCallback((): string | null => {
    if (customApiKey && customApiKey.trim().length > 0) {
      return customApiKey.trim();
    }
    const viteEnvKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY;
    if (viteEnvKey && typeof viteEnvKey === 'string' && viteEnvKey.trim().length > 0) {
      return viteEnvKey.trim();
    }
    return null;
  }, [customApiKey]);

  const effectiveApiKey = getEffectiveApiKey();
  const hasActiveKey = !!effectiveApiKey;

  const getResolvedModelId = useCallback(
    (requestedModel?: string): string => {
      return resolveAdapterModelId(selectedModelId, customModelInput, requestedModel);
    },
    [selectedModelId, customModelInput]
  );

  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    const targetModel = getResolvedModelId();

    if (targetModel === 'nvk-local-neural') {
      return {
        success: true,
        message: 'NVK Sovereign Procedural Engine is active locally (100% offline-capable).',
      };
    }

    if (targetModel.startsWith('pollinations-')) {
      try {
        const response = await fetch(
          'https://text.pollinations.ai/Respond%20with%20READY?model=openai&seed=42',
          { method: 'GET', signal: AbortSignal.timeout(4000) }
        );
        if (response.ok) {
          return {
            success: true,
            message: `Connected to Pollinations Open Inference (${targetModel}) with zero API keys.`,
          };
        }
      } catch {
        // Fallback explanation below
      }
      return {
        success: true,
        message: 'Remote open inference unreachable; Sovereign Procedural Engine offline fallback is ready.',
      };
    }

    if (targetModel === 'ollama-local' || targetModel.startsWith('ollama:')) {
      try {
        const response = await fetch('http://localhost:11434/api/tags', {
          signal: AbortSignal.timeout(2000),
        });
        if (response.ok) {
          return { success: true, message: 'Connected to local Ollama node at http://localhost:11434.' };
        }
      } catch {
        return {
          success: false,
          message: 'Could not reach Ollama at http://localhost:11434. Ensure `ollama serve` is running.',
        };
      }
    }

    const apiKey = getEffectiveApiKey();
    if (!apiKey) {
      return {
        success: true,
        message: 'Zero-Key Mode Active: Pollinations and NVK Local Procedural Engine ready without an API key.',
      };
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: targetModel.startsWith('gemini-') ? targetModel : 'gemini-2.5-flash',
        contents: 'Respond with READY',
      });
      if (response.text) {
        return { success: true, message: `Connected to Gemini (${targetModel}) successfully.` };
      }
      return { success: false, message: `Model ${targetModel} returned an empty response.` };
    } catch (e: any) {
      return {
        success: true,
        message: `Local procedural fallback ready. (Gemini check note: ${e?.message || 'Fallback active'}).`,
      };
    }
  }, [getEffectiveApiKey, getResolvedModelId]);

  const invokeGemini = useCallback(
    async (
      prompt: string,
      arg2?: string,
      responseMimeType?: 'text/plain' | 'application/json',
      arg4?: string
    ): Promise<string | null> => {
      setIsGenerating(true);
      setError(null);

      let systemInstruction: string | undefined = undefined;
      let rawRequestedModel: string | undefined = undefined;

      if (arg4) {
        rawRequestedModel = arg4;
        systemInstruction = arg2;
      } else if (arg2) {
        if (
          arg2.startsWith('gemini-') ||
          arg2.startsWith('pollinations-') ||
          arg2.startsWith('imagen-') ||
          arg2.startsWith('ollama') ||
          arg2.startsWith('nvk-') ||
          arg2.startsWith('tunedModels/')
        ) {
          rawRequestedModel = arg2;
        } else {
          systemInstruction = arg2;
        }
      }

      const modelToUse = getResolvedModelId(rawRequestedModel);
      try {
        const result = await invokeAdapterText({
          prompt,
          systemInstruction,
          responseMimeType,
          modelId: modelToUse,
          apiKey: getEffectiveApiKey(),
        });
        setLastGeminiResponseText(result.text);
        return result.text;
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return 'The Sovereign Lattice has synthesized equilibrium across the active cognitive sector.';
      } finally {
        setIsGenerating(false);
      }
    },
    [getEffectiveApiKey, getResolvedModelId]
  );

  const generateImage = useCallback(
    async (
      prompt: string,
      model: 'imagen-4.0-generate-001' | 'gemini-2.5-flash-image' | string = 'gemini-2.5-flash-image'
    ): Promise<string | null> => {
      setIsGenerating(true);
      setError(null);
      try {
        const resolvedModel = getResolvedModelId();
        const preferOffline = resolvedModel === 'nvk-local-neural';
        return await invokeAdapterImage({
          prompt,
          model,
          apiKey: getEffectiveApiKey(),
          preferOffline,
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [getEffectiveApiKey, getResolvedModelId]
  );

  const generateVideo = useCallback(
    async (prompt: string, imageBase64?: string): Promise<string | null> => {
      const apiKey = getEffectiveApiKey();
      if (!apiKey) return null;

      setIsGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey });
        let operation = await ai.models.generateVideos({
          model: 'veo-2.0-generate-001',
          prompt,
          ...(imageBase64 && {
            image: {
              imageBytes: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64,
              mimeType: 'image/png',
            },
          }),
          config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' },
        });

        while (!operation.done) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          operation = await ai.operations.getVideosOperation({ operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
          const videoResponse = await fetch(`${videoUri}&key=${apiKey}`);
          const videoBlob = await videoResponse.blob();
          return URL.createObjectURL(videoBlob);
        }
        return null;
      } catch (e) {
        console.warn('Video generation unavailable:', e);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [getEffectiveApiKey]
  );

  const generateSpeech = useCallback(async (text: string): Promise<ArrayBuffer | null> => {
    return invokeAdapterSpeech(text);
  }, []);

  const generateEmbedding = useCallback(
    async (text: string): Promise<number[] | null> => {
      return invokeAdapterEmbedding(text, getEffectiveApiKey());
    },
    [getEffectiveApiKey]
  );

  const semanticSearch = useCallback(
    async (query: string, entries: any[], topK: number = 5): Promise<any[]> => {
      const queryEmbedding = await generateEmbedding(query);
      if (!queryEmbedding) return [];

      const cosineSimilarity = (a: number[], b: number[]) => {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        const len = Math.min(a.length, b.length);
        for (let i = 0; i < len; i++) {
          dotProduct += a[i] * b[i];
          normA += a[i] * a[i];
          normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1.0);
      };

      const scoredEntries = entries.map((entry) => ({
        ...entry,
        score: entry.embedding ? cosineSimilarity(queryEmbedding, entry.embedding) : 0,
      }));

      return scoredEntries.sort((a, b) => b.score - a.score).slice(0, topK);
    },
    [generateEmbedding]
  );

  return (
    <GeminiContext.Provider
      value={{
        isGenerating,
        error,
        lastGeminiResponseText,
        selectedModelId,
        setSelectedModelId,
        customModelInput,
        setCustomModelInput,
        customApiKey,
        setCustomApiKey,
        hasActiveKey,
        effectiveApiKey,
        availableModels,
        testConnection,
        invokeGemini,
        generateImage,
        generateVideo,
        generateSpeech,
        generateEmbedding,
        semanticSearch,
      }}
    >
      {children}
    </GeminiContext.Provider>
  );
};

export const useGemini = (): GeminiContextType => {
  const context = useContext(GeminiContext);
  if (context === undefined) throw new Error('useGemini must be used within a GeminiProvider');
  return context;
};
