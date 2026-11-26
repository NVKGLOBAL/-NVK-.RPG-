import { driftDB } from '../../../db';

export interface QueuedOperation {
  id: string;
  type: 'nexus_event' | 'knowledge_sync' | 'attestation';
  payload: any;
  timestamp: number;
  attempts: number;
}

const OFFLINE_QUEUE_KEY = 'nvk_offline_queue_v1';

export class OfflineQueue {
  private static instance: OfflineQueue;

  private constructor() {}

  public static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  public async getQueue(): Promise<QueuedOperation[]> {
    try {
      const stored = await driftDB.loadAppState(OFFLINE_QUEUE_KEY);
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  public async enqueue(type: QueuedOperation['type'], payload: any): Promise<void> {
    const queue = await this.getQueue();
    const op: QueuedOperation = {
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      payload,
      timestamp: Date.now(),
      attempts: 0,
    };
    queue.push(op);
    await driftDB.saveAppState(OFFLINE_QUEUE_KEY, queue);
  }

  public async remove(id: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter((op) => op.id !== id);
    await driftDB.saveAppState(OFFLINE_QUEUE_KEY, filtered);
  }

  public async incrementAttempt(id: string): Promise<void> {
    const queue = await this.getQueue();
    const updated = queue.map((op) => (op.id === id ? { ...op, attempts: op.attempts + 1 } : op));
    await driftDB.saveAppState(OFFLINE_QUEUE_KEY, updated);
  }

  public async flush(processor: (op: QueuedOperation) => Promise<boolean>): Promise<number> {
    const queue = await this.getQueue();
    if (queue.length === 0) return 0;

    let processedCount = 0;
    const remaining: QueuedOperation[] = [];

    for (const op of queue) {
      try {
        const success = await processor(op);
        if (success) {
          processedCount++;
        } else {
          await this.incrementAttempt(op.id);
          if (op.attempts < 5) {
            remaining.push(op);
          }
        }
      } catch {
        await this.incrementAttempt(op.id);
        if (op.attempts < 5) {
          remaining.push(op);
        }
      }
    }

    await driftDB.saveAppState(OFFLINE_QUEUE_KEY, remaining);
    return processedCount;
  }
}

export const offlineQueue = OfflineQueue.getInstance();
