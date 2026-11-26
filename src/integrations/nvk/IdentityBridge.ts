import type { SeekerProfile } from '../../../types';
import { toNvkIdentityProfile, type NvkIdentityProfile } from '../../../lib/nvk/contracts';

export type NvkAuthMode = 'local-shard' | 'eip1193-wallet' | 'nvk-sso-planned';

export interface NvkIdentitySession {
  identity: NvkIdentityProfile;
  authenticatedAt: number;
  permissions: string[];
}

export class IdentityBridge {
  private static instance: IdentityBridge;
  private currentSession: NvkIdentitySession | null = null;

  private constructor() {}

  public static getInstance(): IdentityBridge {
    if (!IdentityBridge.instance) {
      IdentityBridge.instance = new IdentityBridge();
    }
    return IdentityBridge.instance;
  }

  public establishSession(profile: SeekerProfile, permissions: string[] = ['all_modules']): NvkIdentitySession {
    const identity = toNvkIdentityProfile(profile);
    this.currentSession = {
      identity,
      authenticatedAt: Date.now(),
      permissions,
    };
    return this.currentSession;
  }

  public getSession(): NvkIdentitySession | null {
    return this.currentSession;
  }

  public hasPermission(permission: string): boolean {
    if (!this.currentSession) return false;
    return this.currentSession.permissions.includes('all_modules') || this.currentSession.permissions.includes(permission);
  }

  public clearSession(): void {
    this.currentSession = null;
  }

  public async requestFederatedSSO(_provider = 'nvk-global'): Promise<NvkIdentityProfile | null> {
    // Federated SSO is prepared for future NVK Global SSO deployment
    console.warn('NVK Federated SSO is planned and not yet configured with an active provider.');
    return null;
  }
}

export const identityBridge = IdentityBridge.getInstance();
