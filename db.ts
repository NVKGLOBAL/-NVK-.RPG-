
import Dexie, { type Table } from 'dexie';
import type { IDriftInterpretationDB, IGlyphHistory, IRitualFrame, DriftCommentary, GameSaveData, VectorMemoryEntry } from './types';

// Define the database
export class CodexDriftDB extends Dexie {
  interpretations!: Table<IDriftInterpretationDB, number>;
  glyphs!: Table<IGlyphHistory, string>;
  rituals!: Table<IRitualFrame, string>;
  driftCommentaries!: Table<DriftCommentary, number>;
  kvStore!: Table<{ key: string, value: any }, string>; // Generic Key-Value Store for App State
  gameSaves!: Table<GameSaveData, string>; // New table for robust slot saving
  vectorMemory!: Table<VectorMemoryEntry, string>;

  constructor() {
    super('CodexDriftDatabase');
    
    // Version 1
    (this as Dexie).version(1).stores({
      interpretations: '++id, glyphId, glyphSymbol, timestamp, entropy, driftScore, ritualContext, version', 
      glyphs: '&id, symbol, lastInterpreted, driftVolatility', 
      rituals: '&id, timestamp, entropyLevel',
    });

    // Version 2: Added driftCommentaries table
    (this as Dexie).version(2).stores({
      interpretations: '++id, glyphId, glyphSymbol, timestamp, entropy, driftScore, ritualContext, version', 
      glyphs: '&id, symbol, lastInterpreted, driftVolatility',
      rituals: '&id, timestamp, entropyLevel',
      driftCommentaries: '++id, linkedDriftId, agent, timestamp',
    });

    // Version 3: Added kvStore for robust app state persistence (RPG saves, Profiles, etc.)
    (this as Dexie).version(3).stores({
      interpretations: '++id, glyphId, glyphSymbol, timestamp, entropy, driftScore, ritualContext, version', 
      glyphs: '&id, symbol, lastInterpreted, driftVolatility',
      rituals: '&id, timestamp, entropyLevel',
      driftCommentaries: '++id, linkedDriftId, agent, timestamp',
      kvStore: 'key', // Simple Key-Value store: key is primary key
    });

    // Version 4: Added gameSaves table for slots
    (this as Dexie).version(4).stores({
      interpretations: '++id, glyphId, glyphSymbol, timestamp, entropy, driftScore, ritualContext, version', 
      glyphs: '&id, symbol, lastInterpreted, driftVolatility',
      rituals: '&id, timestamp, entropyLevel',
      driftCommentaries: '++id, linkedDriftId, agent, timestamp',
      kvStore: 'key',
      gameSaves: 'slotId, timestamp', // slotId as primary key
    });

    // Version 5: Added vectorMemory table
    (this as Dexie).version(5).stores({
      interpretations: '++id, glyphId, glyphSymbol, timestamp, entropy, driftScore, ritualContext, version', 
      glyphs: '&id, symbol, lastInterpreted, driftVolatility',
      rituals: '&id, timestamp, entropyLevel',
      driftCommentaries: '++id, linkedDriftId, agent, timestamp',
      kvStore: 'key',
      gameSaves: 'slotId, timestamp',
      vectorMemory: 'id, timestamp',
    });

    (this as Dexie).open().catch(err => {
        console.error(`Failed to open Dexie database: ${err}`);
    });
  }
  
  async logDrift(interpretation: IDriftInterpretationDB): Promise<number | undefined> {
    if (!interpretation.glyphId || !interpretation.glyphSymbol) {
        console.error("logDrift: glyphId and glyphSymbol are required.", interpretation);
        return undefined;
    }
    try {
      return await (this as Dexie).transaction('rw', this.interpretations, this.glyphs, async () => {
        const interpretationId = await this.interpretations.add(interpretation);
        
        let glyph = await this.glyphs.get(interpretation.glyphId);
        if (!glyph) {
          glyph = {
            id: interpretation.glyphId,
            symbol: interpretation.glyphSymbol,
            entropyHistory: [interpretation.entropy],
            lastInterpreted: new Date(),
            driftVolatility: 0
          };
          await this.glyphs.add(glyph);
        } else {
          const newHistory = [...glyph.entropyHistory, interpretation.entropy].slice(-50); 
          const driftScores = await this.interpretations
            .where('glyphId').equals(interpretation.glyphId)
            .limit(50)
            .toArray()
            .then(items => items.map(i => i.driftScore));
            
          await this.glyphs.update(glyph.id, {
            entropyHistory: newHistory,
            lastInterpreted: new Date(),
            driftVolatility: this.calculateStdDev(driftScores)
          });
        }
        return interpretationId;
      });
    } catch (error) {
        console.error("Error in logDrift transaction:", error, "Interpretation:", interpretation);
        return undefined;
    }
  }
  
  private calculateStdDev(values: number[]): number {
    if (values.length < 2) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(
      values.map(v => Math.pow(v - avg, 2)).reduce((a, b) => a + b, 0) / values.length
    );
  }

  async getGlyphHistory(glyphNodeId: string): Promise<IDriftInterpretationDB[]> {
    return this.interpretations
      .where('glyphId')
      .equals(glyphNodeId)
      .sortBy('timestamp');
  }

  async addDriftCommentary(commentary: Omit<DriftCommentary, 'id'>): Promise<number> {
    return this.driftCommentaries.add(commentary as DriftCommentary);
  }

  async getCommentariesForDrift(driftId: number): Promise<DriftCommentary[]> {
    return this.driftCommentaries.where('linkedDriftId').equals(driftId).sortBy('timestamp');
  }

  // --- App State Persistence Methods ---
  
  async saveAppState(key: string, state: any): Promise<void> {
      await this.kvStore.put({ key, value: state });
  }

  async loadAppState(key: string): Promise<any | null> {
      const entry = await this.kvStore.get(key);
      return entry ? entry.value : null;
  }
  
  async clearAppState(key: string): Promise<void> {
      await this.kvStore.delete(key);
  }

  // --- Game Save Slot Methods ---

  async saveGameSlot(data: GameSaveData): Promise<void> {
      await this.gameSaves.put(data);
  }

  async loadGameSlot(slotId: string): Promise<GameSaveData | undefined> {
      return await this.gameSaves.get(slotId);
  }

  async getAllGameSaves(): Promise<GameSaveData[]> {
      return await this.gameSaves.toArray();
  }
}

export const driftDB = new CodexDriftDB();
