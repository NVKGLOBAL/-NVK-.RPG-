import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai"; 
import type { GeminiContextType } from '../types';

const GeminiContext = createContext<GeminiContextType | undefined>(undefined);

function decodeBase64(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Base64 decoding failed:", e);
    return new Uint8Array(0);
  }
}

export const GeminiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastGeminiResponseText, setLastGeminiResponseText] = useState<string | null>(null);

  // Persistence and custom model / key states
  const [selectedModelId, setSelectedModelIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selected_ai_model');
      if (saved) return saved;
    }
    const envModel = typeof process !== 'undefined' && process.env ? (process.env.VITE_AI_MODEL || process.env.GEMINI_MODEL) : undefined;
    return envModel || 'gemini-3.5-flash';
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

  const availableModels = [
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', description: 'Default flagship model for high-speed & balanced tasks.', category: 'Google Gemini' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)', description: 'Advanced reasoning, deep logic & complex code synthesis.', category: 'Google Gemini' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', description: 'Ultra-low latency response times for real-time interactions.', category: 'Google Gemini' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', description: 'Lightweight & cost-efficient model for quick turns.', category: 'Google Gemini' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Standard multimodal flash engine for text & media.', category: 'Google Gemini' },
    { id: 'imagen-3.0-generate-002', name: 'Imagen 3 (Visual)', description: 'Dedicated high-fidelity generative visual image model.', category: 'Visual / Media' },
    { id: 'custom', name: 'Custom Model ID...', description: 'Enter any custom model identifier or fine-tuned model path.', category: 'Custom Provider' }
  ];

  // Helper to retrieve effective API Key from custom input or process env
  const getEffectiveApiKey = useCallback((): string | null => {
    if (customApiKey && customApiKey.trim().length > 0) {
      return customApiKey.trim();
    }
    const envKey = 
      (typeof process !== 'undefined' && process.env ? (
        process.env.API_KEY || 
        process.env.GEMINI_API_KEY || 
        process.env.VITE_GEMINI_API_KEY || 
        process.env.OPENAI_API_KEY
      ) : undefined) || 
      (import.meta.env ? (
        import.meta.env.VITE_GEMINI_API_KEY || 
        import.meta.env.VITE_API_KEY
      ) : undefined) || 
      (window as any).process?.env?.API_KEY ||
      (window as any).process?.env?.GEMINI_API_KEY ||
      (window as any).process?.env?.VITE_GEMINI_API_KEY ||
      (window as any).GEMINI_API_KEY;

    if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
      return envKey.trim();
    }
    return null;
  }, [customApiKey]);

  const effectiveApiKey = getEffectiveApiKey();
  const hasActiveKey = !!effectiveApiKey;

  const getAiClient = useCallback(() => {
    const apiKey = getEffectiveApiKey();
    if (!apiKey) {
      console.warn("API Key missing from environment or local storage. Oracle operating in fallback mode.");
      return null;
    }
    try {
      return new GoogleGenAI({ apiKey });
    } catch (e) {
      console.error("Error creating GoogleGenAI client:", e);
      return null;
    }
  }, [getEffectiveApiKey]);

  // Compute active model ID
  const getResolvedModelId = useCallback((requestedModel?: string): string => {
    let target = requestedModel || selectedModelId;
    if (target === 'custom') {
      target = customModelInput.trim() || 'gemini-3.5-flash';
    }
    // Remap deprecated / obsolete model names
    if (target.includes('gemini-1.5-flash') || target.includes('gemini-2.0-flash') || target === 'gemini-3-flash-preview') {
      return 'gemini-3.5-flash';
    }
    if (target.includes('gemini-1.5-pro') || target.includes('gemini-2.0-pro') || target === 'gemini-3-pro-preview') {
      return 'gemini-3.1-pro-preview';
    }
    if (target.includes('gemini-1.0-pro') || target === 'gemini-pro') {
      return 'gemini-3.5-flash';
    }
    return target;
  }, [selectedModelId, customModelInput]);

  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    const ai = getAiClient();
    if (!ai) {
      return { success: false, message: "No API key configured. Provide an API key in settings or .env file." };
    }
    const targetModel = getResolvedModelId();
    try {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: "Respond with the word 'READY'.",
      });
      if (response.text) {
        return { success: true, message: `Connected to ${targetModel} successfully.` };
      }
      return { success: false, message: `Model ${targetModel} returned empty response.` };
    } catch (e: any) {
      return { success: false, message: `Error (${targetModel}): ${e?.message || 'Connection failed'}` };
    }
  }, [getAiClient, getResolvedModelId]);

  const invokeGemini = useCallback(async (prompt: string, arg2?: string, responseMimeType?: "text/plain" | "application/json", arg4?: string): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) {
      return "Oracle Link Offline: No API key detected. Add your GEMINI_API_KEY in settings or .env file.";
    }

    setIsGenerating(true);
    setError(null);

    let systemInstruction: string | undefined = undefined;
    let rawRequestedModel: string | undefined = undefined;

    if (arg4) {
        rawRequestedModel = arg4;
        systemInstruction = arg2;
    } else if (arg2) {
        if (arg2.startsWith('gemini-') || arg2.startsWith('imagen-') || arg2.startsWith('tunedModels/')) {
            rawRequestedModel = arg2;
        } else {
            systemInstruction = arg2;
        }
    }

    const modelToUse = getResolvedModelId(rawRequestedModel);

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelToUse, 
        contents: prompt,
        config: {
            ...(systemInstruction && { systemInstruction }),
            ...(responseMimeType && { responseMimeType })
        }
      });
      
      const text = response.text || "The Oracle remains silent."; 
      setLastGeminiResponseText(text);
      setIsGenerating(false);
      return text;
    } catch (e: any) {
      console.error("Gemini API Error (text):", e);
      setError(e instanceof Error ? e : new Error('API communication failure'));
      setIsGenerating(false);
      return `[Oracle Communication Failed]: ${e?.message || 'An entropic shadow blocked the transmission.'}`;
    }
  }, [getAiClient, getResolvedModelId]);

// Helper to get deterministic hash from a string
function getDeterministicSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % 10000;
}

// Fallback image generator using context-appropriate search query on Unsplash
function getFallbackImageUrl(prompt: string): string {
  const lowercasePrompt = prompt.toLowerCase();
  const isPortrait = lowercasePrompt.includes('portrait') || lowercasePrompt.includes('character') || lowercasePrompt.includes('seeker') || lowercasePrompt.includes('avatar');
  
  // Extract key terms for the query
  const terms: string[] = ['rpg'];
  
  if (isPortrait) {
    terms.push('portrait', 'character');
    if (lowercasePrompt.includes('cyber') || lowercasePrompt.includes('tech') || lowercasePrompt.includes('matrix')) {
      terms.push('cyberpunk', 'neon');
    } else {
      terms.push('fantasy', 'ethereal');
    }
    
    if (lowercasePrompt.includes('female') || lowercasePrompt.includes('woman')) {
      terms.push('woman');
    } else if (lowercasePrompt.includes('male') || lowercasePrompt.includes('man')) {
      terms.push('man');
    }
    
    // Race/class additions
    if (lowercasePrompt.includes('chronomancer')) terms.push('mage', 'magic');
    if (lowercasePrompt.includes('juggernaut')) terms.push('warrior', 'armor');
    if (lowercasePrompt.includes('weaver')) terms.push('occult', 'sorcerer');
    if (lowercasePrompt.includes('void')) terms.push('cosmic', 'dark');
  } else {
    // Environmental landscape
    terms.push('environment', 'landscape', 'concept-art');
    if (lowercasePrompt.includes('cyber') || lowercasePrompt.includes('tech') || lowercasePrompt.includes('neon')) {
      terms.push('cyberpunk', 'city');
    } else {
      terms.push('fantasy', 'mystical');
    }
    
    if (lowercasePrompt.includes('temple')) terms.push('temple', 'ancient');
    if (lowercasePrompt.includes('ruins')) terms.push('ruins', 'abandoned');
    if (lowercasePrompt.includes('space') || lowercasePrompt.includes('cosmic') || lowercasePrompt.includes('star')) {
      terms.push('space', 'nebula');
    }
  }
  
  const seed = getDeterministicSeed(prompt);
  const query = terms.join(',');
  return `https://images.unsplash.com/featured/512x512?sig=${seed}&${encodeURIComponent(query)}`;
}

  const generateImage = useCallback(async (prompt: string, model: 'imagen-4.0-generate-001' | 'gemini-2.5-flash-image' = 'gemini-2.5-flash-image', referenceImage?: string): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) {
      console.warn("GoogleGenAI client not initialized. Using premium Unsplash fallback.");
      return getFallbackImageUrl(prompt);
    }

    setIsGenerating(true);
    setError(null);

    // Dynamic model routing to maximize permission coverage
    // Try standard Imagen 3 model first if gemini-2.5-flash-image fails or is selected
    const targetModel = (model === 'gemini-2.5-flash-image' || !model) ? 'imagen-3.0-generate-002' : model;

    try {
      console.log(`[Gemini SDK] Attempting visual synthesis. Model: ${targetModel}. Prompt: "${prompt.substring(0, 60)}..."`);
      
      // Determine if we should call generateImages (standard) or generateContent (multimodal image generation)
      const isGenerateContentModel = targetModel.includes('gemini-') && targetModel.includes('-image');
      
      if (isGenerateContentModel) {
         const parts: any[] = [{ text: prompt }];
         if (referenceImage) {
            const base64Data = referenceImage.includes(',') ? referenceImage.split(',')[1] : referenceImage;
            parts.unshift({
                inlineData: { data: base64Data, mimeType: 'image/png' }
            });
         }

         const response = await ai.models.generateContent({
            model: targetModel,
            contents: { parts },
         });
         
         const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
         if (imagePart?.inlineData) {
            const imageUrl = `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
            setIsGenerating(false);
            return imageUrl;
         }
         throw new Error(`Model ${targetModel} did not return inlineData.`);
      } else {
          // Standard Imagen generation
          const response = await ai.models.generateImages({
            model: targetModel,
            prompt: prompt,
            config: { 
              numberOfImages: 1, 
              outputMimeType: 'image/png',
              aspectRatio: '1:1'
            },
          });

          if (response.generatedImages?.[0]?.image?.imageBytes) {
            const imageUrl = `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
            setIsGenerating(false);
            return imageUrl;
          }
          throw new Error(`Model ${targetModel} returned empty generatedImages.`);
      }
    } catch (primaryError: any) {
      console.warn(`[Gemini SDK] Primary visual synthesis failed with error:`, primaryError?.message || primaryError);
      
      // Secondary attempt: if we tried generateImages, try fallback to generateContent using a stable image-capable model, or vice-versa
      try {
        const fallbackModel = targetModel === 'imagen-3.0-generate-002' ? 'gemini-3.1-flash-lite-image' : 'imagen-3.0-generate-002';
        console.log(`[Gemini SDK] Triggering secondary visual synthesis fallback. Model: ${fallbackModel}...`);
        
        if (fallbackModel.includes('gemini-')) {
          const parts: any[] = [{ text: prompt }];
          const response = await ai.models.generateContent({
             model: fallbackModel,
             contents: { parts },
          });
          const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
          if (imagePart?.inlineData) {
             const imageUrl = `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
             setIsGenerating(false);
             return imageUrl;
          }
        } else {
          const response = await ai.models.generateImages({
            model: fallbackModel,
            prompt: prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' },
          });
          if (response.generatedImages?.[0]?.image?.imageBytes) {
            const imageUrl = `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
            setIsGenerating(false);
            return imageUrl;
          }
        }
        throw new Error("Secondary synthesis attempt exhausted.");
      } catch (secondaryError: any) {
        console.warn(`[Gemini SDK] Secondary synthesis failed:`, secondaryError?.message || secondaryError);
        console.info(`[Gemini SDK] Invoking premium dynamic Unsplash fallback stream to maintain zero-crash experience.`);
        
        // Final fallback: dynamic high-quality Unsplash image seeded with context tags
        setIsGenerating(false);
        return getFallbackImageUrl(prompt);
      }
    }
  }, [getAiClient]);

  const generateVideo = useCallback(async (prompt: string, imageBase64?: string): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) return null;

    setIsGenerating(true);
    try {
        const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : (window as any).process?.env?.API_KEY;
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt, 
            ...(imageBase64 && {
                image: {
                    imageBytes: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64,
                    mimeType: 'image/png', 
                }
            }),
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
            const fetchUrl = `${videoUri}&key=${apiKey}`;
            const videoResponse = await fetch(fetchUrl);
            const videoBlob = await videoResponse.blob();
            setIsGenerating(false);
            return URL.createObjectURL(videoBlob);
        }
        throw new Error("Video URI missing.");
    } catch (e: any) {
        console.error("Gemini API Error (video):", e);
        setIsGenerating(false);
        return null;
    }
  }, [getAiClient]);

  const generateSpeech = useCallback(async (text: string, voiceName: string = 'Kore'): Promise<ArrayBuffer | null> => {
    const ai = getAiClient();
    if (!ai || !text?.trim()) return null;

    try {
      const safeText = text.substring(0, 1000);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly and mystically: ${safeText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio ? decodeBase64(base64Audio).buffer : null;
    } catch (e: any) {
      console.error("Gemini Speech Error:", e);
      return null;
    }
  }, [getAiClient]);

  const generateEmbedding = useCallback(async (text: string): Promise<number[] | null> => {
    const ai = getAiClient();
    if (!ai) return null;
    try {
      const result = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: [text],
      });
      return result.embeddings?.[0]?.values || null;
    } catch (e) {
      console.error("Embedding generation error:", e);
      return null;
    }
  }, [getAiClient]);

  const semanticSearch = useCallback(async (query: string, entries: any[], topK: number = 5): Promise<any[]> => {
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) return [];

    const cosineSimilarity = (a: number[], b: number[]) => {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    const scoredEntries = entries.map(entry => ({
      ...entry,
      score: cosineSimilarity(queryEmbedding, entry.embedding)
    }));

    return scoredEntries.sort((a, b) => b.score - a.score).slice(0, topK);
  }, [generateEmbedding]);

  return (
    <GeminiContext.Provider value={{ 
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
      semanticSearch 
    }}>
      {children}
    </GeminiContext.Provider>
  );
};

export const useGemini = (): GeminiContextType => {
  const context = useContext(GeminiContext);
  if (context === undefined) throw new Error('useGemini must be used within a GeminiProvider');
  return context;
};