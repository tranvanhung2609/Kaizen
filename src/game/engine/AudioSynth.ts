// ─── Audio Synthesizer ────────────────────────────────────────────────────────
// Tổng hợp âm thanh SFX bằng Web Audio API thuần, không cần file âm thanh.
// Khởi tạo lazy (lần tương tác đầu tiên) để tuân thủ chính sách autoplay của browser.
export class AudioSynth {
  private ctx: AudioContext | null = null;

  private init(): void {
    if (typeof window === 'undefined') return;
    // Không tạo lại nếu context đang chạy bình thường
    if (this.ctx && this.ctx.state !== 'closed') return;
    // Nếu context bị closed (ví dụ: Phaser destroy), set null để tạo mới nếu cần
    if (this.ctx && this.ctx.state === 'closed') {
      this.ctx = null;
    }
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) this.ctx = new AudioCtx();
  }

  /** Giải phóng AudioContext — gọi khi game bị destroy */
  destroy(): void {
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {/* ignore */});
    }
    this.ctx = null;
  }

  /** Kiểm tra context có thể phát âm không */
  private canPlay(): boolean {
    return !!this.ctx && this.ctx.state !== 'closed';
  }


  /** Âm thanh thu thập bình kinh nghiệm — ping cao tần ngắn */
  playFlask(): void {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  /** Âm thanh nhận sát thương — sawtooth trượt xuống */
  playDamage(): void {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  /** Âm thanh nhảy — triangle sweep lên */
  playJump(): void {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  /** Âm thanh bắn đạn — square pulse kép */
  playShoot(): void {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc.frequency.setValueAtTime(500, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  /** Âm thanh nhặt power-up — arpeggio C5→E5→G5→C6 */
  playPowerup(): void {
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.1, this.ctx!.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.08 + 0.2);
      osc.start(this.ctx!.currentTime + i * 0.08);
      osc.stop(this.ctx!.currentTime + i * 0.08 + 0.2);
    });
  }

  /** Âm thanh chiến thắng — melody C4→E4→G4→C5→G4→C5 */
  playVictory(): void {
    this.init();
    if (!this.ctx) return;
    const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 523.25];
    const rhythm = [0.15, 0.15, 0.15, 0.25, 0.15, 0.5];
    let time = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + rhythm[i]);
      osc.start(time);
      osc.stop(time + rhythm[i]);
      time += rhythm[i] * 1.1;
    });
  }
}
