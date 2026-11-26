import { driftDB } from '../../../db';
import type { SeekerProfile } from '../../../types';
import { seekerToKnowledgeCard, type NvkKnowledgeCard } from '../../../lib/nvk/contracts';
import { offlineQueue } from './OfflineQueue';

export interface KnowledgeSyncResult {
  syncedCount: number;
  conflictsResolved: number;
  offlineQueued: boolean;
  timestamp: number;
}

const KNOWLEDGE_SYNC_LOG_KEY = 'nvk_knowledge_sync_log_v1';

export class KnowledgeBridge {
  private static instance: KnowledgeBridge;

  private constructor() {}

  public static getInstance(): KnowledgeBridge {
    if (!KnowledgeBridge.instance) {
      KnowledgeBridge.instance = new KnowledgeBridge();
    }
    return KnowledgeBridge.instance;
  }

  public convertProfileToCard(
    profile: SeekerProfile,
    allProfiles: SeekerProfile[] = [],
    partyIds: string[] = []
  ): NvkKnowledgeCard {
    return seekerToKnowledgeCard(profile, allProfiles, partyIds);
  }

  public async exportKnowledgeCards(profiles: SeekerProfile[], partyIds: string[] = []): Promise<NvkKnowledgeCard[]> {
    return profiles.map((p) => this.convertProfileToCard(p, profiles, partyIds));
  }

  public async synchronizeCards(
    profiles: SeekerProfile[],
    partyIds: string[] = [],
    remoteEndpointUrl = 'https://knowledge.nvkglobal.org/api/v1/sync'
  ): Promise<KnowledgeSyncResult> {
    const cards = await this.exportKnowledgeCards(profiles, partyIds);
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (!isOnline) {
      for (const card of cards) {
        await offlineQueue.enqueue('knowledge_sync', card);
      }
      return {
        syncedCount: 0,
        conflictsResolved: 0,
        offlineQueued: true,
        timestamp: Date.now(),
      };
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(remoteEndpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards, clientTimestamp: Date.now() }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`Knowledge sync HTTP error: ${res.status}`);
      }

      const syncLog = ((await driftDB.loadAppState(KNOWLEDGE_SYNC_LOG_KEY)) as any[]) || [];
      syncLog.push({ timestamp: Date.now(), count: cards.length, status: 'success' });
      await driftDB.saveAppState(KNOWLEDGE_SYNC_LOG_KEY, syncLog.slice(-50));

      return {
        syncedCount: cards.length,
        conflictsResolved: 0,
        offlineQueued: false,
        timestamp: Date.now(),
      };
    } catch {
      for (const card of cards) {
        await offlineQueue.enqueue('knowledge_sync', card);
      }
      return {
        syncedCount: 0,
        conflictsResolved: 0,
        offlineQueued: true,
        timestamp: Date.now(),
      };
    }
  }

  public async getSyncHistory(): Promise<any[]> {
    try {
      return (await driftDB.loadAppState(KNOWLEDGE_SYNC_LOG_KEY)) || [];
    } catch {
      return [];
    }
  }
}

export const knowledgeBridge = KnowledgeBridge.getInstance();
