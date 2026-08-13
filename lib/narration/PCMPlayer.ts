
export class PCMPlayer {
  private audioCtx: AudioContext;
  private nextStartTime: number = 0;
  private sampleRate: number = 24000;

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass({ sampleRate: this.sampleRate });
    this.nextStartTime = this.audioCtx.currentTime;
  }

  private decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = this.audioCtx.createBuffer(1, frameCount, this.sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }

  public async play(base64Data: string): Promise<void> {
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    const data = this.decode(base64Data);
    const buffer = await this.decodeAudioData(data);
    const source = this.audioCtx.createBufferSource();
    
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);
    
    const startTime = Math.max(this.audioCtx.currentTime, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + buffer.duration;

    return new Promise((resolve) => {
      source.onended = () => resolve();
    });
  }

  public stopAll() {
    this.nextStartTime = this.audioCtx.currentTime;
    // Context reset if needed, but usually not required for sequential queue
  }
}

export const globalPCMPlayer = new PCMPlayer();
