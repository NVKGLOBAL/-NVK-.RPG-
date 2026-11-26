import type { NvkNexusEvent } from '../../../lib/nvk/contracts';
import { executeWithRetry } from './RetryPolicy';
import { offlineQueue } from './OfflineQueue';

export interface NexusBridgeConfig {
  nexusEndpointUrl?: string;
  enablePostMessage?: boolean;
  targetOrigin?: string;
}

export class NexusBridge {
  private config: NexusBridgeConfig;
  private isOnline = true;

  constructor(config: NexusBridgeConfig = {}) {
    this.config = {
      nexusEndpointUrl: config.nexusEndpointUrl || 'https://nexus.nvkglobal.org/api/v1/events',
      enablePostMessage: config.enablePostMessage ?? true,
      targetOrigin: config.targetOrigin || '*',
    };

    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushOfflineEvents();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  public async emitEvent(event: NvkNexusEvent): Promise<boolean> {
    if (this.config.enablePostMessage && typeof window !== 'undefined' && window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({ type: 'NVK_NEXUS_EVENT', event }, this.config.targetOrigin || '*');
      } catch (e) {
        console.warn('NexusBridge: postMessage emission failed', e);
      }
    }

    if (!this.isOnline || !this.config.nexusEndpointUrl) {
      await offlineQueue.enqueue('nexus_event', event);
      return false;
    }

    try {
      await executeWithRetry(async () => {
        const res = await fetch(this.config.nexusEndpointUrl!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) {
          throw new Error(`Nexus HTTP error: ${res.status}`);
        }
      });
      return true;
    } catch {
      await offlineQueue.enqueue('nexus_event', event);
      return false;
    }
  }

  private async flushOfflineEvents(): Promise<void> {
    await offlineQueue.flush(async (op) => {
      if (op.type !== 'nexus_event') return true;
      try {
        const res = await fetch(this.config.nexusEndpointUrl!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(op.payload),
          signal: AbortSignal.timeout(5000),
        });
        return res.ok;
      } catch {
        return false;
      }
    });
  }
}

export const nexusBridge = new NexusBridge();
