import { useState, useCallback, useEffect, useRef } from 'react';
import type { PersistenceTarget, CodexStateSnapshot, GameSaveData, GameSaveSummary, SeekerProfile } from '../types';
import { driftDB } from '../db';
import { validateGameSave, validateSeekerShard } from '../lib/nvk/contracts';

const APP_STATE_KEY = 'codex_full_state_v1';
const AUTO_SAVE_SLOT = 'autosave';
const AUTO_SAVE_INTERVAL = 60000;
const HYDRATION_TIMEOUT = 3000;

export type ImportedRealityPayload =
  | { kind: 'save'; save: GameSaveData }
  | { kind: 'shard'; profile: SeekerProfile };

export const buildSnapshotForTargets = (
  targets: PersistenceTarget[],
  currentStateValues: CodexStateSnapshot
): CodexStateSnapshot => {
  const stateToSave: CodexStateSnapshot = {};
  if (!currentStateValues) return stateToSave;

  targets.forEach((target) => {
    switch (target) {
      case 'EchoLog':
        stateToSave.echoLog = currentStateValues.echoLog;
        break;
      case 'AgentGridState':
        stateToSave.agentGridState = currentStateValues.agentGridState;
        break;
      case 'GlyphTree':
        stateToSave.glyphTree = currentStateValues.glyphTree;
        break;
      case 'RitualState':
        stateToSave.ritualState = currentStateValues.ritualState;
        break;
      case 'SystemEntropy':
        stateToSave.systemEntropy = currentStateValues.systemEntropy;
        break;
      case 'AutoEchoState':
        stateToSave.autoEchoState = currentStateValues.autoEchoState;
        break;
      case 'EventHistory':
        stateToSave.eventHistory = currentStateValues.eventHistory;
        break;
      case 'ReweavingHistory':
        stateToSave.reweavingHistory = currentStateValues.reweavingHistory;
        break;
      case 'Artifacts':
        stateToSave.artifacts = currentStateValues.artifacts;
        break;
      case 'ActiveProfile':
        stateToSave.activeProfile = currentStateValues.activeProfile;
        break;
      case 'AllProfiles':
        stateToSave.allProfiles = currentStateValues.allProfiles;
        break;
      case 'PartyIds':
        stateToSave.partyIds = currentStateValues.partyIds;
        break;
      case 'RPGState':
        stateToSave.rpgState = currentStateValues.rpgState;
        break;
    }
  });

  return stateToSave;
};

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

  const saveGame = useCallback(
    async (slotId: string = 'manual_save') => {
      if (
        !stateRef.current.activeProfile &&
        (!stateRef.current.allProfiles || stateRef.current.allProfiles.length === 0) &&
        slotId === AUTO_SAVE_SLOT
      ) {
        return;
      }

      setSaveStatus('saving');
      try {
        const stateToSave = buildSnapshotForTargets(targets, stateRef.current);

        const saveData: GameSaveData = {
          slotId,
          timestamp: Date.now(),
          previewData: {
            seekerName: stateRef.current.activeProfile?.name || 'Unknown Seeker',
            level: stateRef.current.activeProfile?.level || 1,
            location: stateRef.current.rpgState?.currentLocation || 'The Void',
            playtime: new Date().toLocaleTimeString(),
          },
          fullState: stateToSave,
        };

        await driftDB.saveGameSlot(saveData);

        setLastSavedTime(Date.now());
        setSaveStatus('saved');

        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        console.error('[CodexPersistence] Failed to save game:', e);
        setSaveStatus('error');
      }
    },
    [targets]
  );

  const loadGame = useCallback(async (slotId: string): Promise<CodexStateSnapshot | null> => {
    setIsHydrating(true);

    let timedOut = false;
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => {
        timedOut = true;
        console.warn('[CodexPersistence] Hydration timeout reached. Releasing UI lock.');
        setIsHydrating(false);
        resolve(null);
      }, HYDRATION_TIMEOUT)
    );

    const loadPromise = (async () => {
      try {
        const savedData = await driftDB.loadGameSlot(slotId);
        if (savedData && savedData.fullState) {
          if (!timedOut) setIsHydrating(false);
          return savedData.fullState;
        }

        if (slotId === AUTO_SAVE_SLOT) {
          const legacyState = await driftDB.loadAppState(APP_STATE_KEY);
          if (legacyState) {
            if (!timedOut) setIsHydrating(false);
            return legacyState as CodexStateSnapshot;
          }
        }

        if (!timedOut) setIsHydrating(false);
        return null;
      } catch (e) {
        console.error('[CodexPersistence] Load failed:', e);
        if (!timedOut) setIsHydrating(false);
        return null;
      }
    })();

    return Promise.race([loadPromise, timeoutPromise]);
  }, []);

  const deleteSave = useCallback(async (slotId: string) => {
    try {
      await driftDB.gameSaves.delete(slotId);
    } catch (e) {
      console.error('[CodexPersistence] Failed to delete slot:', e);
    }
  }, []);

  const getSaveSlots = useCallback(async (): Promise<GameSaveSummary[]> => {
    try {
      const allSaves = await driftDB.getAllGameSaves();
      return allSaves
        .map((s) => ({
          slotId: s.slotId,
          timestamp: s.timestamp,
          previewData: s.previewData,
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (e) {
      console.error('Failed to fetch save slots', e);
      return [];
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (stateRef.current.activeProfile || (stateRef.current.allProfiles?.length || 0) > 0) {
        saveGame(AUTO_SAVE_SLOT);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [saveGame]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (stateRef.current.activeProfile || (stateRef.current.allProfiles?.length || 0) > 0) {
        saveGame(AUTO_SAVE_SLOT);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveGame]);

  const hydrateState = useCallback(async (): Promise<CodexStateSnapshot | null> => {
    return loadGame(AUTO_SAVE_SLOT);
  }, [loadGame]);

  const exportSave = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    try {
      await saveGame(AUTO_SAVE_SLOT);
      const saveData = await driftDB.loadGameSlot(AUTO_SAVE_SLOT);
      if (!saveData) {
        return { ok: false, message: 'No auto-save data found to export.' };
      }

      const dataStr = JSON.stringify(saveData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `TriSophian_Backup_${new Date().toISOString().slice(0, 10)}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      return { ok: true, message: 'Chronicle backup exported cleanly.' };
    } catch (e: any) {
      console.error('Export failed:', e);
      return { ok: false, message: e?.message || 'Failed to export chronicle.' };
    }
  }, [saveGame]);

  const importRealityFile = useCallback(async (file: File): Promise<ImportedRealityPayload> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read selected file.'));
      reader.onload = async (event) => {
        try {
          const text = event.target?.result;
          if (typeof text !== 'string') {
            throw new Error('Selected file was empty or unreadable.');
          }
          const raw = JSON.parse(text);

          const saveCheck = validateGameSave(raw);
          if (saveCheck.valid) {
            const importedSave: GameSaveData = {
              ...saveCheck.save,
              slotId: 'imported_save',
            };
            await driftDB.saveGameSlot(importedSave);
            resolve({ kind: 'save', save: importedSave });
            return;
          }

          const shardCheck = validateSeekerShard(raw);
          if (shardCheck.valid) {
            resolve({ kind: 'shard', profile: shardCheck.profile });
            return;
          }

          const saveErr = 'error' in saveCheck ? saveCheck.error : '';
          const shardErr = 'error' in shardCheck ? shardCheck.error : '';
          throw new Error(saveErr || shardErr || 'Unrecognized JSON file structure.');
        } catch (e) {
          reject(e instanceof Error ? e : new Error('Failed to parse imported JSON file.'));
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const importSave = useCallback(
    async (file: File): Promise<boolean> => {
      const result = await importRealityFile(file);
      return result.kind === 'save' || result.kind === 'shard';
    },
    [importRealityFile]
  );

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
    importSave,
    importRealityFile,
  };
};
