import type { NvkChainAttestationReceipt } from '../../../lib/nvk/contracts';

export class AttestationBridge {
  private static attestationInstance: AttestationBridge;

  private constructor() {}

  public static getInstance(): AttestationBridge {
    if (!AttestationBridge.attestationInstance) {
      AttestationBridge.attestationInstance = new AttestationBridge();
    }
    return AttestationBridge.attestationInstance;
  }

  public async signOffChainAttestation(
    statement: string,
    subjectId: string
  ): Promise<NvkChainAttestationReceipt | null> {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('EVM Wallet provider not found. Connect MetaMask or an EIP-1193 wallet first.');
    }

    const ethereum = (window as any).ethereum;
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const signerAddress = accounts[0];
      if (!signerAddress) {
        throw new Error('No active wallet account available for signing.');
      }

      const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);

      const message = `NVK Attestation:\nSubject: ${subjectId}\nStatement: ${statement}\nTimestamp: ${Date.now()}`;
      const hexMessage = '0x' + Array.from(new TextEncoder().encode(message))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [hexMessage, signerAddress],
      });

      return {
        mode: 'offchain-personal-sign',
        signerAddress,
        chainId,
        subjectId,
        statement,
        signature,
        timestamp: Date.now(),
      };
    } catch (err) {
      console.warn('AttestationBridge: personal_sign rejected or failed:', err);
      return null;
    }
  }
}

export const attestationBridge = AttestationBridge.getInstance();
