
import { useState, useCallback, useEffect, useRef } from 'react';
import type { PersistenceTarget, CodexStateSnapshot, GameSaveData, GameSaveSummary } from '../types';
import { driftDB } from '../db';

const APP_STATE_KEY = 'codex_full_state_v1';
const AUTO_SAVE_SLOT = 'autosave';
const AUTO_SAVE_INTERVAL = 60000; // 60 seconds
const HYDRATION_TIMEOUT = 3000; // 3 seconds fallback

export const useCodexPersistence = (
  targets: PersistenceTarget[],
  currentStateValues: CodexStateSnapshot
) => {
  const [isHydrating, setIsHydrating] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  
  const stateRef = useRef(currentStateValues);

  useEffect(() => {
      stateRef.current = currentStateValues;
  }, [currentStateValues]);


  const saveGame = useCallback(async (slotId: string = 'manual_save') => {
    // CRITICAL FIX: Do not save if there is no active profile (e.g. after reset)
    if (!stateRef.current.activeProfile && slotId === AUTO_SAVE_SLOT) {
      return;
    }

    setSaveStatus('saving');
    try {
      const stateToSave: CodexStateSnapshot = {};
      
      if(stateRef.current) {
         targets.forEach(target => {
            switch(target) {
                case 'EchoLog': stateToSave.echoLog = stateRef.current.echoLog; break;
                case 'AgentGridState': stateToSave.agentGridState = stateRef.current.agentGridState; break;
                case 'GlyphTree': stateToSave.glyphTree = stateRef.current.glyphTree; break;
                case 'RitualState': stateToSave.ritualState = stateRef.current.ritualState; break;
                case 'SystemEntropy': stateToSave.systemEntropy = stateRef.current.systemEntropy; break;
                case 'AutoEchoState': stateToSave.autoEchoState = stateRef.current.autoEchoState; break;
                case 'EventHistory': stateToSave.eventHistory = stateRef.current.eventHistory; break;
                case 'ReweavingHistory': stateToSave.reweavingHistory = stateRef.current.reweavingHistory; break;
                case 'Artifacts': stateToSave.artifacts = stateRef.current.artifacts; break;
                case 'ActiveProfile': stateToSave.activeProfile = stateRef.current.activeProfile; break;
                case 'RPGState': stateToSave.rpgState = stateRef.current.rpgState; break;
            }
         });
      }

      const saveData: GameSaveData = {
          slotId,
          timestamp: Date.now(),
          previewData: {
              seekerName: stateRef.current.activeProfile?.name || 'Unknown Seeker',
              level: stateRef.current.activeProfile?.level || 1,
              location: stateRef.current.rpgState?.currentLocation || 'The Void',
              playtime: new Date().toLocaleTimeString(), 
          },
          fullState: stateToSave
      };

      await driftDB.saveGameSlot(saveData);
      
      setLastSavedTime(Date.now());
      setSaveStatus('saved');
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error("[CodexPersistence] Failed to save game:", e);
      setSaveStatus('error');
    }
  }, [targets]);


  const loadGame = useCallback(async (slotId: string): Promise<CodexStateSnapshot | null> => {
    setIsHydrating(true);
    
    // Safety timeout to prevent infinite loading screen if DB hangs
    const timeoutPromise = new Promise<null>((resolve) => 
      setTimeout(() => {
        if (isHydrating) {
          console.warn("[CodexPersistence] Hydration timeout reached. Releasing UI lock.");
          setIsHydrating(false);
          resolve(null);
        }
      }, HYDRATION_TIMEOUT)
    );

    const loadPromise = (async () => {
      try {
          const savedData = await driftDB.loadGameSlot(slotId);
          
          if (savedData && savedData.fullState) {
              setIsHydrating(false);
              return savedData.fullState;
          }

          if (slotId === AUTO_SAVE_SLOT) {
               const legacyState = await driftDB.loadAppState(APP_STATE_KEY);
               if (legacyState) {
                   setIsHydrating(false);
                   return legacyState as CodexStateSnapshot;
               }
          }
          
          setIsHydrating(false);
          return null;

      } catch (e) {
          console.error("[CodexPersistence] Load failed:", e);
          setIsHydrating(false);
          return null;
      }
    })();

    return Promise.race([loadPromise, timeoutPromise]);
  }, [isHydrating]);

  const deleteSave = useCallback(async (slotId: string) => {
    try {
      await driftDB.gameSaves.delete(slotId);
      console.log(`[CodexPersistence] Slot ${slotId} purged from memory.`);
    } catch (e) {
      console.error("[CodexPersistence] Failed to delete slot:", e);
    }
  }, []);

  const getSaveSlots = useCallback(async (): Promise<GameSaveSummary[]> => {
      try {
          const allSaves = await driftDB.getAllGameSaves();
          return allSaves.map(s => ({
              slotId: s.slotId,
              timestamp: s.timestamp,
              previewData: s.previewData
          })).sort((a,b) => b.timestamp - a.timestamp); 
      } catch (e) {
          console.error("Failed to fetch save slots", e);
          return [];
      }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
        if (stateRef.current.activeProfile) { 
            saveGame(AUTO_SAVE_SLOT);
        }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [saveGame]);

  useEffect(() => {
      const handleBeforeUnload = () => {
          if (stateRef.current.activeProfile) {
             saveGame(AUTO_SAVE_SLOT); 
          }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveGame]);

  const hydrateState = useCallback(async (): Promise<CodexStateSnapshot | null> => {
      return loadGame(AUTO_SAVE_SLOT);
  }, [loadGame]);

  const exportSave = useCallback(async () => {
    try {
        const saveData = await driftDB.loadGameSlot(AUTO_SAVE_SLOT);
        if (!saveData) {
            alert("No auto-save data found to export.");
            return;
        }

        const dataStr = JSON.stringify(saveData);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `TriSophian_Backup_${new Date().toISOString().slice(0,10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    } catch (e) {
        console.error("Export failed:", e);
    }
  }, []);

  const importSave = useCallback(async (file: File) => {
    return new Promise<boolean>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                if (event.target?.result && typeof event.target.result === 'string') {
                    const parsedData = JSON.parse(event.target.result) as GameSaveData;
                    if (!parsedData.fullState || !parsedData.slotId) throw new Error("Invalid save file format.");
                    parsedData.slotId = 'imported_save'; 
                    await driftDB.saveGameSlot(parsedData);
                    resolve(true);
                }
            } catch (e) {
                console.error("Import failed:", e);
                reject(e);
            }
        };
        reader.readAsText(file);
    });
  }, []);


  return { 
    saveGame,
    loadGame,
    deleteSave,
    getSaveSlots,
    hydrateState, 
    isHydrating,
    saveStatus,
    lastSavedTime,
    exportSave,
    importSave
  };
};
