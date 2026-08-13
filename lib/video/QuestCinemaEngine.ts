
export interface QuestFrame {
  image: HTMLImageElement;
  text: string;
  durationMs: number;
  audioBuffer?: AudioBuffer | null;
}

export class QuestCinemaEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private width: number = 1280;
  private height: number = 720;
  private fps: number = 30;
  private audioCtx: AudioContext;
  private destNode: MediaStreamAudioDestinationNode;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d', { alpha: false })!; 
    
    // Initialize Audio Context for mixing
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    this.destNode = this.audioCtx.createMediaStreamDestination();
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Critical for canvas recording
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = this.ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
  }
  
  public dispose() {
      if (this.audioCtx && this.audioCtx.state !== 'closed') {
          this.audioCtx.close().catch(e => console.warn("Failed to close audio context:", e));
      }
      this.canvas.remove();
  }

  public async compileVideo(
    slides: { imageUrl: string; text: string }[],
    onProgress: (progress: number) => void,
    audioGenerator?: (text: string) => Promise<ArrayBuffer | null>
  ): Promise<Blob> {
    this.recordedChunks = [];
    if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
    }
    
    // 1. Preload Assets
    const frames: QuestFrame[] = [];
    const defaultDuration = 8000; // Increased base duration for slower pacing

    for (let i = 0; i < slides.length; i++) {
      try {
        const img = await this.loadImage(slides[i].imageUrl);
        let audioBuffer: AudioBuffer | null = null;
        let durationMs = defaultDuration;

        if (audioGenerator) {
            try {
                // Removed truncation of text for TTS to ensure full narration
                const ttsText = slides[i].text;
                const audioData = await audioGenerator(ttsText);
                if (audioData) {
                    audioBuffer = await this.audioCtx.decodeAudioData(audioData);
                    // Increased padding (4s) to ensure audio finishes completely before slide transition
                    durationMs = Math.max(defaultDuration, (audioBuffer.duration * 1000) + 4000); 
                }
            } catch (audioErr) {
                console.warn("Failed to generate/decode audio for slide", i, audioErr);
            }
        }

        frames.push({
          image: img,
          text: slides[i].text,
          durationMs: durationMs,
          audioBuffer: audioBuffer
        });
      } catch (e) {
        console.warn("Failed to load image for video frame", i);
      }
      onProgress(0.1 + (i / slides.length) * 0.2);
    }

    if (frames.length === 0) {
        this.dispose();
        throw new Error("No valid frames to compile.");
    }

    // 2. Setup Recorder with Robust MIME Selection
    const canvasStream = this.canvas.captureStream(this.fps);
    const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...this.destNode.stream.getAudioTracks()
    ];
    const combinedStream = new MediaStream(combinedTracks);

    const possibleTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    
    let selectedMimeType = '';
    for (const type of possibleTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
            selectedMimeType = type;
            break;
        }
    }
    
    if (!selectedMimeType) {
        selectedMimeType = 'video/webm';
    }
        
    this.mediaRecorder = new MediaRecorder(combinedStream, { 
        mimeType: selectedMimeType, 
        videoBitsPerSecond: 8000000 // Higher bitrate for cleaner Ken Burns effects
    });
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.recordedChunks.push(event.data);
    };

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
          this.dispose();
          return reject("Recorder not initialized");
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: selectedMimeType });
        this.dispose();
        resolve(blob);
      };
      
      this.mediaRecorder.onerror = (e) => {
          this.dispose();
          reject(e);
      };

      this.mediaRecorder.start();

      // 3. Render Loop
      let currentFrameIdx = 0;
      let slideStartTime = performance.now();
      let audioSourceNode: AudioBufferSourceNode | null = null;
      let slideAudioStarted = false;
      const totalDurationMs = frames.reduce((acc, f) => acc + f.durationMs, 0);
      let renderLoopId = 0;

      const render = (now: number) => {
          if (currentFrameIdx >= frames.length) {
              this.mediaRecorder?.stop();
              cancelAnimationFrame(renderLoopId);
              return; 
          }

          const frame = frames[currentFrameIdx];
          const slideDelta = now - slideStartTime;
          
          if (!slideAudioStarted && frame.audioBuffer) {
              audioSourceNode = this.audioCtx.createBufferSource();
              audioSourceNode.buffer = frame.audioBuffer;
              audioSourceNode.connect(this.destNode);
              audioSourceNode.start();
              slideAudioStarted = true;
          }

          // 1. Black Background
          this.ctx.fillStyle = '#000000';
          this.ctx.fillRect(0, 0, this.width, this.height);

          // 2. Image with slower Ken Burns Effect
          if (frame.image) {
              const progress = Math.min(1, slideDelta / frame.durationMs);
              const zoom = 1 + progress * 0.12; // Slightly reduced zoom for smoother feel
              const panX = currentFrameIdx % 2 === 0 ? -progress * 40 : 40 - progress * 40; 

              this.ctx.save();
              this.ctx.beginPath();
              this.ctx.rect(0, 0, this.width, this.height);
              this.ctx.clip();
              
              this.ctx.translate(this.width/2, this.height/2);
              this.ctx.scale(zoom, zoom);
              this.ctx.translate(-this.width/2 + panX, -this.height/2);
              
              const scale = Math.max(this.width / frame.image.width, this.height / frame.image.height);
              const x = (this.width / 2) - (frame.image.width / 2) * scale;
              const y = (this.height / 2) - (frame.image.height / 2) * scale;
              this.ctx.drawImage(frame.image, x, y, frame.image.width * scale, frame.image.height * scale);
              
              this.ctx.restore();
          }

          // 3. UI Overlay
          this.ctx.fillStyle = 'rgba(0,0,0,0.8)'; 
          this.ctx.fillRect(0, this.height - 220, this.width, 220); 
          
          // 4. Text
          this.ctx.font = '36px "Cinzel", serif';
          this.ctx.fillStyle = '#fbbf24'; 
          this.ctx.textAlign = 'center';
          this.ctx.shadowColor = 'black';
          this.ctx.shadowBlur = 6;

          const lines = this.wrapText(frame.text, this.width - 240);
          const textFadeIn = Math.min(1, slideDelta / 1000); 
          this.ctx.globalAlpha = textFadeIn;

          lines.forEach((line, i) => {
              if(i < 5) this.ctx.fillText(line, this.width / 2, this.height - 140 + (i * 45));
          });
          this.ctx.globalAlpha = 1;
          
          // 5. Progress Bar for Slide
          this.ctx.fillStyle = '#fbbf24';
          this.ctx.fillRect(0, this.height - 10, this.width * (Math.min(1, slideDelta / frame.durationMs)), 10);

          if (slideDelta >= frame.durationMs) {
              if (audioSourceNode) {
                  try { audioSourceNode.stop(); } catch(e) {}
                  audioSourceNode.disconnect();
                  audioSourceNode = null;
              }
              
              currentFrameIdx++;
              slideStartTime = now;
              slideAudioStarted = false;
              
              const totalElapsed = frames.slice(0, currentFrameIdx).reduce((acc, f) => acc + f.durationMs, 0);
              onProgress(0.3 + (totalElapsed / totalDurationMs) * 0.6);
          }

          renderLoopId = requestAnimationFrame(render);
      };
      
      renderLoopId = requestAnimationFrame(render);
    });
  }
}
