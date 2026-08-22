/**
 * Web Audio API Trap Beat & Lo-Fi Synthesizer
 * Generates rich, authentic procedural producer beats on the fly as AudioBuffers or live playback.
 * Used for built-in tracks and fallback audio so audio playback is 100% reliable and seamless.
 */

export class BeatSynthesizer {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Generates a seamless looping audio buffer of a dark trap producer beat (e.g. 300 Bond)
   * @param style '300bond' | 'tokyo' | 'shadow' | 'cloud9'
   * @param durationSeconds length of the audio loop (default 45s)
   */
  public generateBeatBuffer(style: '300bond' | 'tokyo' | 'shadow' | 'cloud9', durationSeconds = 60): AudioBuffer {
    const sampleRate = 44100;
    const bpm = style === 'cloud9' ? 82 : style === 'tokyo' ? 140 : 134;
    const totalSamples = Math.floor(sampleRate * durationSeconds);
    
    // Offline context for fast, high-quality offline audio synthesis
    const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
    const beatSec = 60 / bpm;
    const barSec = beatSec * 4;
    const totalBars = Math.ceil(durationSeconds / barSec);

    // Minor scale frequencies for atmospheric melodies
    const scaleRoots: Record<string, number> = {
      '300bond': 55, // A1 (55Hz 808 root) - Dark F# / A minor
      'tokyo': 65.41, // C2 - Asian Trap / Phrygian
      'shadow': 48.99, // G1 - Super Low Heavy 808
      'cloud9': 65.41, // C2 - Melodic Lo-Fi
    };

    const rootFreq = scaleRoots[style] || 55;

    // Master Reverb / Ambient bus
    const convolver = offlineCtx.createConvolver();
    convolver.buffer = this.createImpulseResponse(offlineCtx, 2.5, 2.0);
    
    const masterGain = offlineCtx.createGain();
    masterGain.gain.value = 0.85;
    masterGain.connect(offlineCtx.destination);

    const reverbBus = offlineCtx.createGain();
    reverbBus.gain.value = 0.35;
    reverbBus.connect(convolver);
    convolver.connect(masterGain);

    // Generate tracks across bars
    for (let bar = 0; bar < totalBars; bar++) {
      const barStartTime = bar * barSec;
      if (barStartTime >= durationSeconds) break;

      // 1. Synth Melody / Ambient Pad
      this.scheduleMelody(offlineCtx, style, rootFreq, barStartTime, barSec, reverbBus, masterGain);

      // 2. Kicks & 808 Bass
      this.schedule808(offlineCtx, style, rootFreq, barStartTime, beatSec, masterGain);

      // 3. Snares / Claps
      this.scheduleSnare(offlineCtx, style, barStartTime, beatSec, reverbBus, masterGain);

      // 4. Trap Hi-Hats with rolling triplets
      this.scheduleHiHats(offlineCtx, style, barStartTime, beatSec, masterGain);
    }

    return offlineCtx.startRendering() as unknown as AudioBuffer;
  }

  private createImpulseResponse(ctx: BaseAudioContext, duration: number, decay: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = length - i;
      const factor = Math.pow(n / length, decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    return impulse;
  }

  private scheduleMelody(
    ctx: BaseAudioContext,
    style: string,
    rootFreq: number,
    barStartTime: number,
    barSec: number,
    reverbBus: GainNode,
    masterBus: GainNode
  ) {
    const melodyNotes = style === '300bond'
      ? [rootFreq * 4, rootFreq * 4.7568, rootFreq * 4.4898, rootFreq * 5.3393] // A, C#, C, D#
      : style === 'tokyo'
      ? [rootFreq * 4, rootFreq * 4.237, rootFreq * 4.756, rootFreq * 5.339]
      : style === 'shadow'
      ? [rootFreq * 4, rootFreq * 3.775, rootFreq * 4.489, rootFreq * 4.237]
      : [rootFreq * 3, rootFreq * 3.775, rootFreq * 4.489, rootFreq * 5.04];

    const noteDuration = barSec / 4;

    for (let i = 0; i < 4; i++) {
      const noteTime = barStartTime + i * noteDuration;
      const freq = melodyNotes[i % melodyNotes.length];

      // Dual oscillator for rich detuned supersaw / atmospheric plucks
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = style === 'cloud9' ? 'triangle' : 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, noteTime);
      osc2.frequency.setValueAtTime(freq * 1.005, noteTime); // subtle detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, noteTime);
      filter.frequency.exponentialRampToValueAtTime(style === '300bond' ? 2400 : 1600, noteTime + 0.1);
      filter.frequency.exponentialRampToValueAtTime(600, noteTime + noteDuration);

      noteGain.gain.setValueAtTime(0.001, noteTime);
      noteGain.gain.linearRampToValueAtTime(0.18, noteTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + noteDuration * 0.95);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(masterBus);
      noteGain.connect(reverbBus);

      osc1.start(noteTime);
      osc1.stop(noteTime + noteDuration);
      osc2.start(noteTime);
      osc2.stop(noteTime + noteDuration);
    }
  }

  private schedule808(
    ctx: BaseAudioContext,
    style: string,
    rootFreq: number,
    barStartTime: number,
    beatSec: number,
    masterBus: GainNode
  ) {
    // 808 Hit Pattern: beat 1, beat 2.5, beat 3.75
    const hitOffsets = [0, beatSec * 1.5, beatSec * 2.75];
    const pitchPitches = [rootFreq, rootFreq * 1.122, rootFreq * 0.89];

    hitOffsets.forEach((offset, idx) => {
      const hitTime = barStartTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const distortion = ctx.createWaveShaper();

      // Soft clipping curve for warm 808 harmonics
      distortion.curve = this.makeDistortionCurve(style === 'shadow' ? 25 : 12);

      const noteFreq = pitchPitches[idx % pitchPitches.length];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq * 2.2, hitTime);
      osc.frequency.exponentialRampToValueAtTime(noteFreq, hitTime + 0.06);

      // 808 Envelope
      const duration = beatSec * 1.2;
      gain.gain.setValueAtTime(0.45, hitTime);
      gain.gain.exponentialRampToValueAtTime(0.001, hitTime + duration);

      osc.connect(distortion);
      distortion.connect(gain);
      gain.connect(masterBus);

      osc.start(hitTime);
      osc.stop(hitTime + duration);
    });
  }

  private scheduleSnare(
    ctx: BaseAudioContext,
    style: string,
    barStartTime: number,
    beatSec: number,
    reverbBus: GainNode,
    masterBus: GainNode
  ) {
    // Snares on beat 3 in trap (beatSec * 2) or beats 2 & 4
    const snareTimes = [barStartTime + beatSec * 2];

    snareTimes.forEach((hitTime) => {
      // Noise burst for crisp snare/clap snap
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, hitTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, hitTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.18);

      // Tonal body of the snare
      const toneOsc = ctx.createOscillator();
      const toneGain = ctx.createGain();
      toneOsc.frequency.setValueAtTime(220, hitTime);
      toneOsc.frequency.exponentialRampToValueAtTime(140, hitTime + 0.08);

      toneGain.gain.setValueAtTime(0.25, hitTime);
      toneGain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.1);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterBus);
      noiseGain.connect(reverbBus);

      toneOsc.connect(toneGain);
      toneGain.connect(masterBus);

      noise.start(hitTime);
      noise.stop(hitTime + 0.2);
      toneOsc.start(hitTime);
      toneOsc.stop(hitTime + 0.1);
    });
  }

  private scheduleHiHats(
    ctx: BaseAudioContext,
    style: string,
    barStartTime: number,
    beatSec: number,
    masterBus: GainNode
  ) {
    const eighthNote = beatSec / 2;
    const totalSteps = 8;

    for (let step = 0; step < totalSteps; step++) {
      const isRoll = step === 6 || step === 7;
      const subSteps = isRoll ? 3 : 1; // Triplet roll on last beat

      for (let sub = 0; sub < subSteps; sub++) {
        const hitTime = barStartTime + step * eighthNote + (sub * (eighthNote / subSteps));
        
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, hitTime);

        const gain = ctx.createGain();
        const vol = isRoll ? 0.12 : step % 2 === 0 ? 0.18 : 0.1;
        gain.gain.setValueAtTime(vol, hitTime);
        gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.04);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterBus);

        noise.start(hitTime);
        noise.stop(hitTime + 0.05);
      }
    }
  }

  private makeDistortionCurve(amount = 20): Float32Array {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  /**
   * Convert an AudioBuffer into an audio/wav Blob URL for standard HTMLAudioElement usage
   */
  public static async bufferToWaveBlobUrl(buffer: AudioBuffer): Promise<string> {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new ArrayBuffer(length);
    const view = new DataView(out);
    const channels: Float32Array[] = [];
    let sample = 0;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit precision

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < buffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][pos]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(44 + offset, sample, true);
        offset += 2;
      }
      pos++;
    }

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }

    const blob = new Blob([out], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }
}

export const beatSynth = new BeatSynthesizer();
