import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { globalSoundEngine } from '../lib/SoundEngine';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3ContextType {
  walletAddress: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signAlchemicalContract: (message: string) => Promise<string | null>;
  mintArtifactAsNft: (artifactId: string, artifactName: string) => Promise<string | null>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: React.ReactNode;
  addEchoMessage?: (source: string, text: string, colorClass?: string) => void;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children, addEchoMessage }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log message helper
  const logSystem = useCallback((msg: string, isError = false) => {
    if (addEchoMessage) {
      addEchoMessage('Web3Nexus', msg, isError ? 'text-rose-400 font-mono' : 'text-indigo-300 font-mono');
    } else {
      console.log(`[Web3Nexus] ${msg}`);
    }
  }, [addEchoMessage]);

  // Handle chain changed
  const handleChainChanged = useCallback((hexChainId: string) => {
    const decimalChain = parseInt(hexChainId, 16);
    setChainId(decimalChain);
    logSystem(`Metachain shift detected: Network calibrated to Chain ${decimalChain}`);
    globalSoundEngine.playSFX('pulse');
  }, [logSystem]);

  // Handle accounts changed
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // Wallet disconnected via MetaMask UI
      setWalletAddress(null);
      setChainId(null);
      setIsConnected(false);
      logSystem('Somatic core severed: Browser wallet disconnected.');
      globalSoundEngine.playSFX('click');
    } else {
      setWalletAddress(accounts[0]);
      setIsConnected(true);
      logSystem(`Vessel synchronized: Connected to address ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      globalSoundEngine.playSFX('success');
    }
  }, [logSystem]);

  // Synchronize state once on load
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            
            const rawChainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(parseInt(rawChainId, 16));
            
            logSystem('Automated calibration: Reconnected previous MetaMask portal.');
          }
        } catch (err: any) {
          console.warn('Silent connect failed (expected in sandboxed frames):', err.message);
        }
      }
    };

    checkConnection();

    // Set up listeners
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      }
    };
  }, [handleAccountsChanged, handleChainChanged, logSystem]);

  // Core Connection Procedure
  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setError(null);
    logSystem('Initializing MetaMask secure handshake...');

    if (typeof window === 'undefined') {
      setIsConnecting(false);
      return;
    }

    if (!window.ethereum) {
      const sandboxMsg = 'MetaMask client not found in window stream. If you are inside the sandboxed preview, please click "Open in New Tab" to authorize direct browser extension bindings.';
      setError(sandboxMsg);
      logSystem(sandboxMsg, true);
      setIsConnecting(false);
      globalSoundEngine.playSFX('fail');
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);

        const rawChainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(rawChainId, 16));

        logSystem(`Handshake succeeded! Calibrated to vessel ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        globalSoundEngine.playSFX('success');
      } else {
        throw new Error('No accounts selected/available');
      }
    } catch (err: any) {
      // Handle the cross-origin security block (or sandboxing) gracefully
      let errMsg = err.message || 'Connection refused or timed out.';
      if (err.name === 'SecurityError' || errMsg.toLowerCase().includes('sandbox') || errMsg.toLowerCase().includes('origin')) {
        errMsg = 'Failed to connect in Sandboxed frame! Opening in a separate, secure navigation tab is required for browser extensions like MetaMask.';
      } else if (err.code === 4001) {
        errMsg = 'Calibration rejected by the Seeker (Metamask prompt cancelled).';
      }

      setError(errMsg);
      logSystem(`Handshake Failed: ${errMsg}`, true);
      globalSoundEngine.playSFX('fail');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setChainId(null);
    setIsConnected(false);
    setError(null);
    logSystem('Aetheric portal dismantled. Wallet synchronization severed.');
    globalSoundEngine.playSFX('click');
  };

  // Sign alchemical contracts (messages)
  const signAlchemicalContract = async (message: string): Promise<string | null> => {
    if (!isConnected || !walletAddress || !window.ethereum) {
      logSystem('Cannot sign contract: Core wallet synchronization offline.', true);
      return null;
    }

    try {
      logSystem(`Transmitting alchemical signature intent for parsing: "${message.substring(0, 45)}..."`);
      globalSoundEngine.playSFX('pulse');
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      logSystem('Signature verified and bound in blockchain ink!');
      globalSoundEngine.playSFX('success');
      return signature;
    } catch (err: any) {
      const cancelMsg = err.code === 4001 ? 'Signature request denied by Seeker.' : (err.message || 'Signature execution failed.');
      logSystem(`Signature aborted: ${cancelMsg}`, true);
      globalSoundEngine.playSFX('fail');
      return null;
    }
  };

  // Mint an artifact as a simulated or real local NFT trace
  const mintArtifactAsNft = async (artifactId: string, artifactName: string): Promise<string | null> => {
    if (!isConnected || !walletAddress || !window.ethereum) {
      logSystem('Artifact preservation denied: Portal offline.', true);
      return null;
    }

    try {
      logSystem(`Initiating alchemical minting sequence for Artifact: "${artifactName}" (${artifactId})...`);
      
      const payload = JSON.stringify({
        origin: 'Tri-Sophian Codex',
        artifactId,
        artifactName,
        minter: walletAddress,
        astralTimestamp: Date.now()
      });

      const signature = await signAlchemicalContract(`MINT_ARTIFACT_CODEX_NFT_HASH:\n${payload}`);
      if (signature) {
        logSystem(`NFT fully minted! Tx Hash: 0xtxf_${signature.substring(2, 22)}_minted`);
        return `0xtxf_${signature.substring(2, 22)}_minted`;
      }
      return null;
    } catch (err: any) {
      logSystem(`Minting sequence aborted: ${err.message || err}`, true);
      return null;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        walletAddress,
        chainId,
        isConnected,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        signAlchemicalContract,
        mintArtifactAsNft,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
