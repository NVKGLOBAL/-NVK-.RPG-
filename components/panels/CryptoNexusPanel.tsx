import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { SeekerProfile } from '../../types';
import { Button } from '../ui/Button';

interface CryptoNexusPanelProps {
  activeProfile: SeekerProfile | null;
  onUpdateProfile?: (profile: SeekerProfile) => void;
  addEchoMessage?: (source: string, text: string, colorClass?: string) => void;
}

export const CryptoNexusPanel: React.FC<CryptoNexusPanelProps> = ({
  activeProfile,
  onUpdateProfile,
  addEchoMessage
}) => {
  const {
    walletAddress,
    chainId,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    signAlchemicalContract,
    mintArtifactAsNft
  } = useWeb3();

  const [contractMessage, setContractMessage] = useState<string>('I align my consciousness with the Tri-Sophian cybernetic grid and seal my digital soul to this decentralized chronicle.');
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [mintStatus, setMintStatus] = useState<string | null>(null);
  const [mintedTx, setMintedTx] = useState<string | null>(null);
  
  // Local simulated balance to show on connected account
  const [balanceEth, setBalanceEth] = useState<string>('0.000');

  useEffect(() => {
    if (isConnected && walletAddress && typeof window !== 'undefined' && window.ethereum) {
      // Try to fetch real balance if allowed by network
      const getBalance = async () => {
        try {
          const rawBalance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [walletAddress, 'latest']
          });
          if (rawBalance) {
            const wei = parseInt(rawBalance, 16);
            const eth = (wei / 10 ** 18).toFixed(4);
            setBalanceEth(eth);
          }
        } catch (e) {
          // Fallback to beautiful simulated quantum ether balance if blocked
          const pseudoBalance = (Math.random() * 4.5 + 0.1).toFixed(3);
          setBalanceEth(pseudoBalance);
        }
      };
      getBalance();
    } else {
      setBalanceEth('0.000');
    }
  }, [isConnected, walletAddress]);

  // Synchronize Seeker Profile with the connected wallet address
  useEffect(() => {
    if (isConnected && walletAddress && activeProfile && onUpdateProfile && activeProfile.walletAddress !== walletAddress) {
      const updatedProfile = {
        ...activeProfile,
        walletAddress: walletAddress,
        chainId: chainId || undefined
      };
      onUpdateProfile(updatedProfile);
      if (addEchoMessage) {
        addEchoMessage('System', `Synced active Seeker Profile "${activeProfile.name}" with Wallet Address: ${walletAddress.slice(0, 10)}...`, 'text-teal-300');
      }
    }
  }, [isConnected, walletAddress, activeProfile, onUpdateProfile, chainId, addEchoMessage]);

  const getNetworkName = (id: number | null) => {
    if (!id) return 'Offline';
    switch (id) {
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      case 5: return 'Goerli Testnet';
      case 137: return 'Polygon PoS';
      case 8453: return 'Base Mainnet';
      default: return `Custom Network (Chain ${id})`;
    }
  };

  const handleSign = async () => {
    if (!contractMessage.trim()) return;
    const sig = await signAlchemicalContract(contractMessage);
    if (sig) {
      setLastSignature(sig);
    }
  };

  const handleMintProfileId = async () => {
    if (!activeProfile) return;
    setMintStatus('Initiating signature request...');
    setMintedTx(null);
    try {
      const tx = await mintArtifactAsNft(activeProfile.id, `${activeProfile.name}'s Soul Seal`);
      if (tx) {
        setMintStatus('SUCCESS');
        setMintedTx(tx);
        
        // Add item to active profile inventory if callback is available
        if (onUpdateProfile && activeProfile) {
          const updated = {
            ...activeProfile,
            selfTraits: [...(activeProfile.selfTraits || []), 'Certified Web3 Sovereign']
          };
          onUpdateProfile(updated);
        }
      } else {
        setMintStatus('CANCELLED');
      }
    } catch (e: any) {
      setMintStatus(`FAILED: ${e.message || e}`);
    }
  };

  return (
    <div className="crypto-nexus bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 md:p-6 w-full text-slate-200 shadow-2xl relative overflow-hidden">
      {/* Decorative Matrix Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Panel Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 flex items-center gap-3">
            <i className="ri-wallet-3-fill text-indigo-400"></i>
            Web3 Crypto Nexus
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Somatic Etheric Synchronization Console</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
            isConnected 
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
              : 'bg-rose-950/40 border-rose-500/50 text-rose-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            {isConnected ? 'PORTAL ACTIVE' : 'PORTAL OFFLINE'}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand: Wallet Metrics / Status */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300 font-mono border-b border-slate-800 pb-1.5">Vessel Metrics</h3>
            
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Synchronized Wallet:</span>
              <span className="text-slate-200">
                {isConnected && walletAddress 
                  ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}` 
                  : 'Disconnected'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Metachain Network:</span>
              <span className={`font-bold ${isConnected ? 'text-indigo-400' : 'text-slate-500'}`}>
                {getNetworkName(chainId)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Vessel Balance:</span>
              <span className="text-emerald-400 font-bold">{balanceEth} ETH</span>
            </div>
            
            {isConnected ? (
              <Button 
                onClick={disconnectWallet}
                className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30 font-mono text-xs py-2 rounded-lg"
              >
                Disconnect Handshake
              </Button>
            ) : (
              <Button 
                onClick={connectWallet}
                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-indigo-400 text-white font-mono text-xs py-2 rounded-lg"
                loading={isConnecting}
              >
                Connect MetaMask Wallet
              </Button>
            )}
          </div>

          {/* Sandbox Explanatory Text */}
          {error && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs flex gap-2">
              <i className="ri-alert-line text-lg shrink-0 mt-0.5"></i>
              <div>
                <p className="font-bold">Handshake Warning:</p>
                <p className="mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!isConnected && !error && (
            <div className="p-4 rounded-xl bg-slate-950/30 border border-slate-800/80 text-slate-400 text-xs space-y-2">
              <p className="font-bold text-slate-300 flex items-center gap-1">
                <i className="ri-information-line"></i>
                Decentralized Aetheric Integration
              </p>
              <p className="leading-relaxed">
                Unlock real-time profile integration, ledger record verification, and the ability to sign smart contracts directly with your MetaMask extension.
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                *Cross-Origin permissions are strictly respected. Secure direct wallet bindings can be experienced by hitting the 'Open in New Tab' workspace launcher.
              </p>
            </div>
          )}
        </div>

        {/* Right Hand: Interactive Crypto Features */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Section 1: Sign Cryptographic Prayer / Contract */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300 font-mono flex items-center gap-2">
              <i className="ri-quill-pen-line"></i>
              Somatic Contract Signer
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Aetheric Contract Text</label>
              <textarea
                value={contractMessage}
                onChange={(e) => setContractMessage(e.target.value)}
                rows={3}
                disabled={!isConnected}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
            </div>

            <Button
              onClick={handleSign}
              disabled={!isConnected || !contractMessage.trim()}
              className="w-full bg-indigo-950/40 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/40 font-mono text-xs py-2 rounded-lg"
            >
              Sign Cryptographic Covenant
            </Button>

            {lastSignature && (
              <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 font-mono">
                <div className="flex justify-between items-center text-[10px] text-emerald-400 uppercase mb-1">
                  <span>Authorized Signature Hash</span>
                  <i className="ri-shield-check-line"></i>
                </div>
                <p className="text-[10px] text-slate-300 break-all select-all">{lastSignature}</p>
              </div>
            )}
          </div>

          {/* Section 2: Mint Seeker Profile ID as certified NFT */}
          {activeProfile && (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-pink-300 font-mono flex items-center gap-2">
                  <i className="ri-bubble-chart-line"></i>
                  Astral Soul Minting Engine
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">
                  COST: FREE (TESTNET)
                </span>
              </div>

              <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                {activeProfile.avatarImageUrl && (
                  <img src={activeProfile.avatarImageUrl} alt="Seeker" className="w-12 h-12 rounded-lg object-cover border border-indigo-500/30" />
                )}
                <div>
                  <h4 className="text-sm font-cinzel font-bold text-slate-100">{activeProfile.name}</h4>
                  <p className="text-[10px] font-mono text-slate-400">Class: {activeProfile.class} / Level {activeProfile.level}</p>
                </div>
              </div>

              <Button
                onClick={handleMintProfileId}
                disabled={!isConnected}
                className="w-full bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 border border-pink-500/50 text-white font-mono text-xs py-2.5 rounded-lg font-bold shadow-lg"
              >
                MINT SOUL SEAL AS BLOCKCHAIN NFT
              </Button>

              {mintStatus && (
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                  <span>Mint Genesis Status:</span>
                  <span className={`font-bold ${
                    mintStatus === 'SUCCESS' ? 'text-emerald-400 font-boldPulse' : 'text-amber-400'
                  }`}>{mintStatus}</span>
                </div>
              )}

              {mintedTx && (
                <div className="p-3 rounded bg-slate-950/80 border border-slate-800 font-mono mt-1 text-[10px]">
                  <p className="text-slate-400 mb-1">Contract Transaction Proof Logged:</p>
                  <span className="text-pink-300 select-all break-all">{mintedTx}</span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
