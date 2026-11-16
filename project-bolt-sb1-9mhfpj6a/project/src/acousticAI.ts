import { Traits } from './CharacterRenderer';

export interface AcousticResult {
  summary: string;
  character: Traits;
}

const FEM_NAMES = ['Mina', 'Zara', 'Nora', 'Sienna', 'Maya', 'Cleo', 'Luna', 'Chloe', 'Savannah', 'Aria'];
const MASC_NAMES = ['Jax', 'Zorgon', 'Whiskers', 'Unit-7', 'Barnaby', 'Fang', 'Nova', 'Pixel', 'Buster', 'Tex'];
const TITLES = ['The Storyteller', 'From Mars', 'The Cool Cat', 'The Maverick', 'The Virtuoso', 'On Air'];

const WILD_COLORS: Record<Traits['species'], string[]> = {
  human: ['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#3d2314'],
  cat: ['#f97316', '#94a3b8', '#fde047', '#475569', '#fef3c7'],
  bear: ['#78350f', '#d97706', '#f8fafc', '#334155'],
  robot: ['#94a3b8', '#64748b', '#38bdf8', '#cbd5e1'],
  alien: ['#4ade80', '#a855f7', '#2dd4bf', '#f472b6'],
  monster: ['#8b5cf6', '#10b981', '#ef4444', '#6366f1'],
};

const SPECIES_LIST: Traits['species'][] = ['human', 'cat', 'robot', 'alien', 'bear', 'monster'];
const SHIRTS = ['#4f46e5', '#dc2626', '#059669', '#d97706', '#0284c7', '#7c3aed', '#db2777', '#374151'];
const FEM_HAIRS: Traits['hair'][] = ['longWaves', 'ponytail', 'buns', 'bob'];
const MASC_HAIRS: Traits['hair'][] = ['spiky', 'cowboyHat', 'beanie', 'none'];
const ACCS: Traits['acc'][] = ['glasses', 'sunglasses', 'monocle', 'none'];
const BEARDS: Traits['beard'][] = ['none', 'mustache', 'goatee', 'full'];
const BGS: Traits['bg'][] = ['dark', 'neon', 'sunset'];

function detectFundamentalPitch(buf: Float32Array, sampleRate: number): number {
  let rms = 0;
  for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / buf.length);
  if (rms < 0.025) return -1;

  const minPeriod = Math.floor(sampleRate / 320);
  const maxPeriod = Math.floor(sampleRate / 70);
  let bestOffset = -1;
  let bestCorr = 0;

  for (let offset = minPeriod; offset <= maxPeriod; offset++) {
    let corr = 0;
    for (let i = 0; i < buf.length - offset; i++) {
      corr += buf[i] * buf[i + offset];
    }
    if (corr > bestCorr) {
      bestCorr = corr;
      bestOffset = offset;
    }
  }
  return bestOffset > 0 ? sampleRate / bestOffset : -1;
}

export async function analyzeAndGenerateCharacter(durationMs = 3500): Promise<AcousticResult> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const buffer = new Float32Array(analyser.fftSize);
  const pitches: number[] = [];
  let syllablePeaks = 0;
  let wasLoud = false;

  return new Promise((resolve) => {
    const startTime = Date.now();
    const sampleLoop = () => {
      if (Date.now() - startTime >= durationMs) {
        stream.getTracks().forEach((t) => t.stop());
        ctx.close();

        // Use median pitch to ignore outlier spikes
        pitches.sort((a, b) => a - b);
        const avgPitch = pitches.length
          ? Math.round(pitches[Math.floor(pitches.length / 2)])
          : 125;

        const sps = +(syllablePeaks / (durationMs / 1000)).toFixed(1);
        const register = avgPitch < 130 ? 'Deep Bass' : avgPitch < 165 ? 'Warm Baritone' : 'High Register';
        const cadence = sps < 2.5 ? 'Melodic Drawl' : sps > 4.0 ? 'Rapid Staccato' : 'Crisp Cadence';

        const jitter = Math.floor(Math.random() * 1000);
        const isFem = avgPitch >= 165;
        const species = SPECIES_LIST[(avgPitch + jitter) % SPECIES_LIST.length];
        const palette = WILD_COLORS[species];
        const namePool = isFem ? FEM_NAMES : MASC_NAMES;
        const hairPool = isFem ? FEM_HAIRS : MASC_HAIRS;

        const character: Traits = {
          name: `${namePool[(avgPitch + jitter) % namePool.length]} ${TITLES[(syllablePeaks + jitter) % TITLES.length]}`,
          accent: `${species.toUpperCase()} • ${register}`,
          species,
          skin: palette[(avgPitch + jitter) % palette.length],
          shirt: SHIRTS[(syllablePeaks + jitter) % SHIRTS.length],
          hair: species === 'robot' || species === 'alien' ? 'none' : hairPool[(avgPitch + jitter) % hairPool.length],
          acc: species === 'robot' ? 'none' : ACCS[(syllablePeaks + jitter) % ACCS.length],
          beard: isFem || species === 'robot' || species === 'alien' ? 'none' : BEARDS[(avgPitch + jitter) % BEARDS.length],
          bg: BGS[(syllablePeaks + jitter) % BGS.length],
          lashes: isFem && species !== 'robot',
        };

        resolve({
          summary: `Built ${isFem ? 'Female' : 'Male'} ${species.toUpperCase()}: "${character.name}" (${avgPitch}Hz • ${cadence})`,
          character,
        });
        return;
      }

      analyser.getFloatTimeDomainData(buffer);
      const rms = Math.sqrt(buffer.reduce((sum, val) => sum + val * val, 0) / buffer.length);

      if (rms > 0.04 && !wasLoud) { syllablePeaks++; wasLoud = true; }
      else if (rms < 0.02) { wasLoud = false; }

      const hz = detectFundamentalPitch(buffer, ctx.sampleRate);
      if (hz >= 75 && hz <= 310) pitches.push(hz);

      requestAnimationFrame(sampleLoop);
    };
    sampleLoop();
  });
}
