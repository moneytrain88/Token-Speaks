export interface AcousticProfile {
  detectedStyle: string;
  pitchHz: number;
  paceLabel: string;
  suggestedPresetKey: 'southern' | 'british' | 'ny' | 'default';
  confidence: number;
}

export async function analyzeAcousticVoice(durationMs = 3500): Promise<AcousticProfile> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const buffer = new Float32Array(analyser.fftSize);
  const freqData = new Uint8Array(analyser.frequencyBinCount);

  const pitches: number[] = [];
  let syllablePeaks = 0;
  let wasLoud = false;

  return new Promise((resolve) => {
    const startTime = Date.now();

    const sampleLoop = () => {
      if (Date.now() - startTime >= durationMs) {
        stream.getTracks().forEach((t) => t.stop());
        ctx.close();

        const avgPitch = pitches.length
          ? Math.round(pitches.reduce((a, b) => a + b, 0) / pitches.length)
          : 145;

        const syllablesPerSec = syllablePeaks / (durationMs / 1000);

        let detectedStyle = 'Balanced Studio Cadence';
        let paceLabel = 'Moderate Pacing';
        let suggestedPresetKey: AcousticProfile['suggestedPresetKey'] = 'default';

        if (syllablesPerSec < 2.4) {
          paceLabel = 'Melodic / Drawn-Out Vowels';
          detectedStyle = avgPitch < 150 ? 'Deep Southern / Western Drawl' : 'Warm Melodic Drawl';
          suggestedPresetKey = 'southern';
        } else if (syllablesPerSec > 4.2) {
          paceLabel = 'Rapid / Clipped Staccato';
          detectedStyle = 'Fast East Coast / Metro Cadence';
          suggestedPresetKey = 'ny';
        } else if (avgPitch > 165) {
          paceLabel = 'Crisp / Articulated';
          detectedStyle = 'Crisp Transatlantic / British Tone';
          suggestedPresetKey = 'british';
        }

        resolve({
          detectedStyle,
          pitchHz: avgPitch,
          paceLabel,
          suggestedPresetKey,
          confidence: Math.min(96, 78 + pitches.length % 18),
        });
        return;
      }

      analyser.getFloatTimeDomainData(buffer);
      analyser.getByteFrequencyData(freqData);

      // Measure syllable volume peaks for pacing
      const rms = Math.sqrt(buffer.reduce((sum, val) => sum + val * val, 0) / buffer.length);
      if (rms > 0.04 && !wasLoud) {
        syllablePeaks++;
        wasLoud = true;
      } else if (rms < 0.02) {
        wasLoud = false;
      }

      // Estimate dominant vocal pitch (Hz) when speaking
      if (rms > 0.03) {
        let maxVal = -1;
        let maxIdx = 0;
        for (let i = 4; i < 60; i++) {
          if (freqData[i] > maxVal) {
            maxVal = freqData[i];
            maxIdx = i;
          }
        }
        const hz = (maxIdx * ctx.sampleRate) / analyser.fftSize;
        if (hz >= 75 && hz <= 320) pitches.push(hz);
      }

      requestAnimationFrame(sampleLoop);
    };

    sampleLoop();
  });
}

