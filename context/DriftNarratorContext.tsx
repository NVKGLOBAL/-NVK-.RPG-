
import React, { createContext, useContext, ReactNode } from 'react';
import { SovereignDriftNarratorService } from '../lib/ai/SovereignDriftNarratorService';

// Default local instance (used only if App.tsx does not provide a real one).
// Returns null so the service falls back to its rich local readings pool —
// readings are always generated offline, never from a cloud AI.
const defaultInvokeAI = async (prompt: string, systemInstruction?: string) => {
  return null;
};

const defaultDriftNarratorService = new SovereignDriftNarratorService(defaultInvokeAI);

export const DriftNarratorContext = createContext<SovereignDriftNarratorService>(defaultDriftNarratorService);

export const useDriftNarrator = (): SovereignDriftNarratorService => {
  const context = useContext(DriftNarratorContext);
  if (!context) {
    throw new Error('useDriftNarrator must be used within a DriftNarratorProvider');
  }
  return context;
};
