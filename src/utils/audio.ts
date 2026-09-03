// Web Audio API Synthesizer for instant, reliable notification sounds

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Chime for new incoming order (pleasant 3-tone cash register / restaurant bell)
  public playNewOrderChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      this.playTone(ctx, 659.25, now, 0.25, 0.2);
      // Note 2: G#5 (830.61 Hz)
      this.playTone(ctx, 830.61, now + 0.18, 0.25, 0.25);
      // Note 3: B5 (987.77 Hz)
      this.playTone(ctx, 987.77, now + 0.36, 0.45, 0.3);
      // Note 4: High E6 (1318.51 Hz) - crystal shimmer
      this.playTone(ctx, 1318.51, now + 0.54, 0.6, 0.35);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Alert for Rappi / Courier arrived at counter
  public playRappiAlert() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      this.playTone(ctx, 587.33, now, 0.15, 0.2); // D5
      this.playTone(ctx, 880.00, now + 0.12, 0.3, 0.25); // A5
    } catch {
      // Audio fallback
    }
  }

  // Alert for status change / action completed
  public playSuccessSound() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      this.playTone(ctx, 523.25, now, 0.12, 0.15); // C5
      this.playTone(ctx, 659.25, now + 0.1, 0.25, 0.2); // E5
    } catch {
      // Audio fallback
    }
  }

  private playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, maxVolume: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(maxVolume, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const soundManager = new SoundManager();
