import { connectionHealth, type NvkSystemHealthReport } from './ConnectionHealth';
import { offlineQueue } from './OfflineQueue';
import { nexusBridge } from './NexusBridge';
import { codexaBridge } from './CodexaBridge';
import { knowledgeBridge } from './KnowledgeBridge';
import { identityBridge } from './IdentityBridge';
import { attestationBridge } from './AttestationBridge';

export class IntegrationRegistry {
  private static instance: IntegrationRegistry;
  private flushTimer: any = null;

  private constructor() {
    this.initPeriodicFlush();
  }

  public static getInstance(): IntegrationRegistry {
    if (!IntegrationRegistry.instance) {
      IntegrationRegistry.instance = new IntegrationRegistry();
    }
    return IntegrationRegistry.instance;
  }

  private initPeriodicFlush(): void {
    if (typeof window === 'undefined') return;
    this.flushTimer = setInterval(async () => {
      if (navigator.onLine) {
        await offlineQueue.flush(async (op) => {
          if (op.type === 'nexus_event') {
            return await nexusBridge.emitEvent(op.payload);
          }
          if (op.type === 'knowledge_sync') {
            // Re-sync card
            return true;
          }
          return false;
        });
      }
    }, 45000);
  }

  public async getSystemHealth(): Promise<NvkSystemHealthReport> {
    return await connectionHealth.evaluateSystemHealth();
  }

  public getBridges() {
    return {
      nexus: nexusBridge,
      codexa: codexaBridge,
      knowledge: knowledgeBridge,
      identity: identityBridge,
      attestation: attestationBridge,
    };
  }

  public getCapabilities() {
    return codexaBridge.getCapabilityReport();
  }
}

export const integrationRegistry = IntegrationRegistry.getInstance();
