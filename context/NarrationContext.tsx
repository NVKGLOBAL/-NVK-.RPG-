import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useGemini } from './GeminiIntegrationContext';
import { globalPCMPlayer } from '../lib/narration/PCMPlayer';
import { Modality } from '@google/genai';

interface NarrationContextType {
  isNarrationEnabled: boolean;
  toggleNarration: () => void;
  speak: (text: string, voiceName?: string) => Promise<void>;
}

const NarrationContext = createContext<NarrationContextType | undefined>(undefined);

export const NarrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(true);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const speak = useCallback(async (text: string, voiceName: string = 'Kore') => {
    if (!isNarrationEnabled || !text) return;

    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : (window as any).process?.env?.API_KEY;

    // Add to serial queue to prevent overlapping speech
    queueRef.current = queueRef.current.then(async () => {
      try {
        if (!apiKey) throw new Error("API Key missing");
        
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: `Read this clearly: ${text}` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          await globalPCMPlayer.play(base64Audio);
        } else {
          throw new Error("No audio data");
        }
      } catch (e) {
        console.warn("Gemini TTS failed, falling back to WebSpeech", e);
        return new Promise<void>((resolve) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => resolve();
          window.speechSynthesis.speak(utterance);
        });
      }
    });

    return queueRef.current;
  }, [isNarrationEnabled]);

  const toggleNarration = () => {
    const newState = !isNarrationEnabled;
    setIsNarrationEnabled(newState);
    if (!newState) {
      window.speechSynthesis.cancel();
      globalPCMPlayer.stopAll();
    } else {
      speak("Narration protocol initialized. I will read incoming data streams for you.");
    }
  };

  return (
    <NarrationContext.Provider value={{ isNarrationEnabled, toggleNarration, speak }}>
      {children}
    </NarrationContext.Provider>
  );
};

export const useNarration = () => {
  const context = useContext(NarrationContext);
  if (!context) throw new Error("useNarration must be used within NarrationProvider");
  return context;
};