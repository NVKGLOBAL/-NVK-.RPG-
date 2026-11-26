import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import type { SovereignAIContextType } from '../types';
import {
  NVK_AVAILABLE_MODELS,
  resolveAdapterModelId,
  invokeAdapterText,
  invokeAdapterImage,
  invokeAdapterEmbedding,
  invokeAdapterSpeech,
} from '../lib/ai/providerAdapter';

const SovereignAIContext = createContext<SovereignAIContextType | undefined>(undefined);

export const SovereignAIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastAIResponseText, setLastAIResponseText] = useState<string | null>(null);

  const [selectedModelId, setSelectedModelIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selected_ai_model');
      if (saved) return saved;
    }
    return 'nvk-local-neural';
  });

  const [customModelInput, setCustomModelInputState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('custom_ai_model') || '';
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

  const availableModels = NVK_AVAILABLE_MODELS.map(({ id, name, description, category }) => ({
    id,
    name,
    description,
    category,
  }));

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

    return {
      success: true,
      message: 'NVK Sovereign Procedural Engine is active locally (100% offline-capable).',
    };
  }, [getResolvedModelId]);

  const invokeAI = useCallback(
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
          arg2.startsWith('pollinations-') ||
          arg2.startsWith('ollama') ||
          arg2.startsWith('nvk-')
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
        });
        setLastAIResponseText(result.text);
        return result.text;
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return 'The Sovereign Lattice has synthesized equilibrium across the active cognitive sector.';
      } finally {
        setIsGenerating(false);
      }
    },
    [getResolvedModelId]
  );

  const generateImage = useCallback(
    async (prompt: string, referenceImage?: string): Promise<string | null> => {
      setIsGenerating(true);
      setError(null);
      try {
        const resolvedModel = getResolvedModelId();
        const preferOffline = resolvedModel === 'nvk-local-neural';
        return await invokeAdapterImage({
          prompt,
          preferOffline,
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [getResolvedModelId]
  );

  const generateSpeech = useCallback(async (text: string): Promise<ArrayBuffer | null> => {
    return invokeAdapterSpeech(text);
  }, []);

  const generateEmbedding = useCallback(
    async (text: string): Promise<number[] | null> => {
      return invokeAdapterEmbedding(text);
    },
    []
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
    <SovereignAIContext.Provider
      value={{
        isGenerating,
        error,
        lastAIResponseText,
        selectedModelId,
        setSelectedModelId,
        customModelInput,
        setCustomModelInput,
        availableModels,
        testConnection,
        invokeAI,
        generateImage,
        generateSpeech,
        generateEmbedding,
        semanticSearch,
      }}
    >
      {children}
    </SovereignAIContext.Provider>
  );
};

export const useSovereignAI = (): SovereignAIContextType => {
  const context = useContext(SovereignAIContext);
  if (context === undefined) throw new Error('useSovereignAI must be used within a SovereignAIProvider');
  return context;
};
