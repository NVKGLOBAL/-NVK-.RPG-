
export class SoundEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  
  // Drone components
  private droneOscillator: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    // Lazy initialization handled in init() to respect browser autoplay policies
  }

  public init() {
    if (this.isInitialized) return;
    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.setupMasterChain();
      this.isInitialized = true;
    }
  }

  private setupMasterChain() {
    if (!this.audioContext) return;

    // Create a compressor to prevent clipping (distortion)
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -20;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    // Master Gain
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.4; 

    // Connect: MasterGain -> Compressor -> Destination
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.audioContext.destination);
  }

  public resume() {
      if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume();
      }
  }

  public playUIFeedback(type: 'click' | 'hover' | 'typing') {
      if (!this.audioContext || !this.masterGain || this.isMuted) return;
      this.resume();

      const t = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      if (type === 'click') {
          // High-tech "Blip"
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
          
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.1, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          
          osc.start(t);
          osc.stop(t + 0.1);
      } else if (type === 'hover') {
          // Very subtle tick
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, t);
          
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.02, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          
          osc.start(t);
          osc.stop(t + 0.05);
      } else if (type === 'typing') {
          // Mechanical key click
          osc.type = 'square';
          filter.frequency.setValueAtTime(800, t);
          osc.frequency.setValueAtTime(150 + Math.random() * 50, t);
          
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.05, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

          osc.start(t);
          osc.stop(t + 0.08);
      }
      
      // Cleanup
      setTimeout(() => {
          osc.disconnect();
          gain.disconnect();
          filter.disconnect();
      }, 200);
  }

  public initializeDrone() {
    if (!this.audioContext || !this.masterGain || this.droneOscillator) return;
    this.resume();

    // Create Nodes
    this.droneOscillator = this.audioContext.createOscillator();
    this.droneGain = this.audioContext.createGain();
    this.droneFilter = this.audioContext.createBiquadFilter();
    this.lfo = this.audioContext.createOscillator();

    // Drone Config
    this.droneOscillator.type = 'sawtooth'; // Richer texture
    this.droneOscillator.frequency.value = 55; // Low A
    
    // LFO for movement
    this.lfo.frequency.value = 0.1; // Slow modulation
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 200;
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.droneFilter.frequency);


    // Filter configuration 
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 200; 
    this.droneFilter.Q.value = 2;

    // Gain Configuration
    this.droneGain.gain.value = 0.0; // Start silent

    // Connections
    this.droneOscillator.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOscillator.start();
    this.lfo.start();
    
    // Smooth fade in
    this.droneGain.gain.setTargetAtTime(0.03, this.audioContext.currentTime, 2);
  }

  public stopDrone() {
      if(this.droneGain && this.audioContext) {
          this.droneGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 1);
          setTimeout(() => {
              this.droneOscillator?.stop();
              this.lfo?.stop();
              this.droneOscillator = null;
          }, 1200);
      }
  }

  public updateDrone(entropy: number) {
    if (!this.droneOscillator || !this.droneGain || !this.droneFilter || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const targetFreq = 55 + (entropy * 55); 
    const targetFilterFreq = 200 + (entropy * 600); 
    const targetGain = this.isMuted ? 0 : 0.03 + (entropy * 0.02);

    this.droneOscillator.frequency.setTargetAtTime(targetFreq, now, 0.5);
    this.droneFilter.frequency.setTargetAtTime(targetFilterFreq, now, 0.5);
    this.droneGain.gain.setTargetAtTime(targetGain, now, 0.5);
  }

  public playSFX(type: 'click' | 'success' | 'fail' | 'pulse') {
    if (!this.audioContext || !this.masterGain || this.isMuted) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    const now = this.audioContext.currentTime;

    switch (type) {
      case 'click':
        this.playUIFeedback('click');
        return;

      case 'success':
        // Harmonic pleasant chime
        osc.type = 'triangle'; 
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(2000, now + 0.5); 

        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.linearRampToValueAtTime(554.37, now + 0.1); // C#5
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        
        osc.start(now);
        osc.stop(now + 1.0);
        break;

      case 'fail':
        // Dissonant low buzz
        osc.type = 'sawtooth'; 
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.4);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case 'pulse':
        // Soft thrum
        osc.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.value = 300;

        osc.frequency.setValueAtTime(220, now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        
        osc.start(now);
        osc.stop(now + 0.6);
        break;
    }
    
    setTimeout(() => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
    }, 2000);
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(muted: boolean) {
    this.isMuted = muted;
    if (this.audioContext && this.droneGain) {
      const now = this.audioContext.currentTime;
      if (muted) {
          this.droneGain.gain.cancelScheduledValues(now);
          this.droneGain.gain.setTargetAtTime(0, now, 0.1);
      } else {
          this.droneGain.gain.setTargetAtTime(0.03, now, 0.5);
          this.resume();
      }
    }
  }
}

export const globalSoundEngine = new SoundEngine();
