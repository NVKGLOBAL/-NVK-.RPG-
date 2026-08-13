import { useState, useCallback, useEffect, useRef } from 'react';
import { useGemini } from '../context/GeminiIntegrationContext';
import { AgentName, HistoricalEventType } from '../types';
import type { DreambloomInterpretation, HistoricalDreambloomAnalysisEventData, EchoMessage } from '../types';
import { AGENT_PROFILES, DREAMBLOOM_THEMATIC_SEEDS } from '../constants';

type AddEchoMessageFn = (source: AgentName | string, text: string, colorClass?: string, isAutoEcho?: boolean, meta?: Record<string, any>) => void;

export const useDreambloomSystem = (addEchoMessage: AddEchoMessageFn) => {
  const [interpretations, setInterpretations] = useState<DreambloomInterpretation[]>([]);
  const [isAutoActive, setIsAutoActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pulseNumber, setPulseNumber] = useState(0);
  
  const { invokeGemini, generateImage, isGenerating: isGeminiBusy } = useGemini();
  const autoLoopRef = useRef<number | undefined>(undefined);

  const parseInterpretationText = (text: string, currentPulse: number): Partial<DreambloomInterpretation> => {
    const lines = text.split('\n');
    let title = `Dreambloom Pulse #${currentPulse}`;
    let symbolism = "";
    let codexFunction = "";
    let codexPlacement = "";

    lines.forEach(line => {
        const uLine = line.toUpperCase().trim();
        if (uLine.startsWith("TITLE:")) {
            title = line.substring(line.indexOf(':') + 1).trim();
        } else if (uLine.startsWith("SYMBOLISM:")) {
            symbolism = line.substring(line.indexOf(':') + 1).trim();
        } else if (uLine.startsWith("FUNCTION:")) {
            codexFunction = line.substring(line.indexOf(':') + 1).trim();
        } else if (uLine.startsWith("PLACEMENT:")) {
            codexPlacement = line.substring(line.indexOf(':') + 1).trim();
        } else {
            // Fallback accumulation logic could go here
            if (!symbolism && line.length > 5) symbolism = line.trim();
        }
    });
    
    return { title, symbolism, codexFunction, codexPlacement };
  };

  const conjurePulse = useCallback(async (customSeed?: string) => {
    if (isLoading || isGeminiBusy) return;
    
    setIsLoading(true);
    const currentPulse = pulseNumber + 1;
    setPulseNumber(currentPulse);

    // Pick a random seed if none provided
    const effectiveSeed = customSeed?.trim() || 
      DREAMBLOOM_THEMATIC_SEEDS[Math.floor(Math.random() * DREAMBLOOM_THEMATIC_SEEDS.length)];
    
    addEchoMessage(
        AgentName.DreambloomOracle, 
        `${customSeed ? 'Conjuring' : 'Auto-Genesis:'} Dreambloom Pulse #${currentPulse}. Seed: "${effectiveSeed}"`, 
        AGENT_PROFILES[AgentName.DreambloomOracle]?.colorClass
    );

    try {
      // 1. Generate Image (Using Nano Banana or Imagen based on context, here forcing standard for quality)
      const imagePrompt = `Mystical Dreambloom pulse, number ${currentPulse}, embodying the theme of "${effectiveSeed}". Abstract, fractal, luminous, sci-fi fantasy codex style.`;
      const imageUrl = await generateImage(imagePrompt); 
      
      if (!imageUrl) throw new Error("Image generation failed.");

      // 2. Generate Text Interpretation
      const textPrompt = `A new Dreambloom pulse, number ${currentPulse}, has emerged. Theme: '${effectiveSeed}'.
      Provide a mystical interpretation using these keywords:
      TITLE: [Short Title]
      SYMBOLISM: [1-2 sentences]
      FUNCTION: [1 sentence]
      PLACEMENT: [Mythic location]`;
      
      const interpretationText = await invokeGemini(textPrompt, "You are the Dreambloom Oracle.");
      if (!interpretationText) throw new Error("Text interpretation failed.");

      const parsedDetails = parseInterpretationText(interpretationText, currentPulse);

      const newInterpretation: DreambloomInterpretation = {
        id: `dreambloom-${currentPulse}-${Date.now()}`,
        pulseNumber: currentPulse,
        imageUrl,
        title: parsedDetails.title || `Pulse #${currentPulse}`,
        symbolism: parsedDetails.symbolism || "Unknown resonance.",
        codexFunction: parsedDetails.codexFunction || "Unknown.",
        codexPlacement: parsedDetails.codexPlacement || "The Void.",
        isConjured: true,
        thematicSeed: effectiveSeed,
      };

      setInterpretations(prev => [newInterpretation, ...prev].slice(0, 9));

      const eventData: HistoricalDreambloomAnalysisEventData = {
        interpretation: newInterpretation,
        analysisTimestamp: Date.now()
      };
      
      addEchoMessage(
        AgentName.DreambloomOracle,
        `Pulse #${newInterpretation.pulseNumber} ("${newInterpretation.title}") stabilized.`,
        AGENT_PROFILES[AgentName.DreambloomOracle]?.colorClass,
        false,
        { eventType: HistoricalEventType.DREAMBLOOM_PULSE_ANALYSIS, eventData }
      );

    } catch (err) {
      console.error("Dreambloom Error:", err);
      addEchoMessage(AgentName.DreambloomOracle, "Genesis failed. The weave is unstable.", 'text-rose-400');
      setPulseNumber(prev => prev - 1);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isGeminiBusy, pulseNumber, generateImage, invokeGemini, addEchoMessage]);

  const toggleAuto = useCallback(() => {
    setIsAutoActive(prev => {
        const newState = !prev;
        addEchoMessage(
            AgentName.SystemControl, 
            `Auto-Dreambloom Genesis Matrix ${newState ? 'ACTIVATED' : 'DEACTIVATED'}.`, 
            'text-emerald-300'
        );
        return newState;
    });
  }, [addEchoMessage]);

  // Auto-generation loop
  useEffect(() => {
    if (isAutoActive) {
      autoLoopRef.current = window.setInterval(() => {
        // Only trigger if not busy and not loading
        // We use a functional update or ref check to see current loading status if needed, 
        // but since `conjurePulse` has guard clauses, calling it is safe.
        // However, `conjurePulse` depends on `isLoading` state which might be stale in closure if not careful.
        // The dependency array handles updates.
        conjurePulse(); 
      }, 60000); // Check every 60 seconds.
    } else {
        clearInterval(autoLoopRef.current);
    }
    return () => clearInterval(autoLoopRef.current);
  }, [isAutoActive, conjurePulse]);

  return {
    interpretations,
    isAutoActive,
    toggleAuto,
    conjurePulse,
    isLoading
  };
};
