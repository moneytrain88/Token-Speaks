export interface GeneratedCharacter {
  name: string;
  accent: string;
  skin: string;
  shirt: string;
  hair: 'none' | 'spiky' | 'bob' | 'cowboyHat' | 'beanie';
  acc: 'none' | 'glasses' | 'sunglasses' | 'monocle';
  beard: 'none' | 'goatee' | 'full' | 'mustache';
  bg: 'dark' | 'neon' | 'sunset' | 'greenscreen';
}

export interface AcousticResult {
  summary: string;
  character: GeneratedCharacter;
}

const FIRST_NAMES = ['Jax', 'Mina', 'Leo', 'Zara', 'Theo', 'Nora', 'Kai', 'Sienna', 'Finn', 'Maya', 'Dante', 'Cleo'];
const TITLES = ['The Storyteller', 'The Maverick', 'The Analyst', 'The Host', 'The Vagabond', 'The Virtuoso'];
const SKINS = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#3d2314'];
const SHIRTS = ['#4f46e5', '#dc2626', '#059669', '#d97706', '#0284c7', '#7c3aed', '#db2777', '#374151'];
const HAIRS: GeneratedCharacter['hair'][] = ['spiky', 'cowboyHat', 'beanie', 'bob', 'none'];
const ACCS: GeneratedCharacter['acc'][] = ['glasses', 'sunglasses', 'monocle', 'none'];
const BEARDS: GeneratedCharacter['beard'][] = ['none', 'mustache', 'goatee', 'full'];
const BGS: GeneratedCharacter['bg'][] = ['dark', 'neon', 'sunset'];

export async function analyzeAndGenerateCharacter(durationMs = 3500): Promise<AcousticResult> {
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
  const energies: number[] = [];
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
          : Math.floor(110 + Math.random() * 110);

        const avgEnergy = energies.length
          ? Math.round((energies.reduce((a, b) => a + b, 0) / energies.length) * 1000)
          : 45;

        const syllablesPerSec = +(syllablePeaks / (durationMs / 1000)).toFixed(1);

        // Acoustic classification
        let register = avgPitch < 135 ? 'Deep Bass' : avgPitch < 175 ? 'Warm Mid-Tone' : 'Bright High-Register';
        let cadence = syllablesPerSec < 2.5 ? 'Melodic Drawl' : syllablesPerSec > 4.0 ? 'Rapid Staccato' : 'Crisp Cadence';

        // Use exact acoustic fingerprint + variance to pick from 15,000+ combinations
        const seed1 = avgPitch + syllablePeaks * 7;
        const seed2 = avgEnergy + pitches.length * 3;
        const jitter = Math.floor(Math.random() * 100);

        const hair =
          syllablesPerSec < 2.3 && avgPitch < 150
            ? 'cowboyHat'
            : HAIRS[(seed1 + jitter) % HAIRS.length];

        const acc =
          avgPitch > 175 && syllablesPerSec >= 2.5
            ? 'monocle'
            : ACCS[(seed2 + jitter) % ACCS.length];

        const beard =
          avgPitch < 145
            ? BEARDS[1 + ((seed1 + jitter) % 3)] // Deeper voices favor facial hair
            : BEARDS[(seed2 + jitter) % BEARDS.length];

        const character: GeneratedCharacter = {
          name: `${FIRST_NAMES[(seed1 + jitter) % FIRST_NAMES.length]} ${TITLES[(seed2 + jitter) % TITLES.length]}`,
          accent: `${register} • ${cadence}`,
          skin: SKINS[(seed1 + seed2 + jitter) % SKINS.length],
          shirt: SHIRTS[(seed1 * 2 + jitter) % SHIRTS.length],
          hair,
          acc,
          beard,
          bg: BGS[(seed2 + jitter) % BGS.length],
        };

        resolve({
          summary: `Built "${character.name}" (${avgPitch}Hz • ${syllablesPerSec} syl/s • ${cadence})`,
          character,
        });
        return;
      }

      analyser.getFloatTimeDomainData(buffer);
      analyser.getByteFrequencyData(freqData);

      const rms = Math.sqrt(buffer.reduce((sum, val) => sum + val * val, 0) / buffer.length);
      if (rms > 0.025) energies.push(rms);

      if (rms > 0.04 && !wasLoud) {
        syllablePeaks++;
        wasLoud = true;
      } else if (rms < 0.02) {
        wasLoud = false;
      }

      if (rms > 0.03) {
        let maxVal = -1;
        let maxIdx = 0;
        for (let i = 4; i < 65; i++) {
          if (freqData[i] > maxVal) {
            maxVal = freqData[i];
            maxIdx = i;
          }
        }
        const hz = (maxIdx * ctx.sampleRate) / analyser.fftSize;
        if (hz >= 75 && hz <= 340) pitches.push(hz);
      }

      requestAnimationFrame(sampleLoop);
    };

    sampleLoop();
  });
}
