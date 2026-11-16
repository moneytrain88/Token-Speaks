import React, { useState, useRef, useEffect } from 'react';

interface CharacterTraits {
  name: string;
  accentTag: string;
  skinColor: string;
  shirtColor: string;
  hairStyle: 'none' | 'spiky' | 'bob' | 'cowboyHat' | 'beanie';
  accessory: 'none' | 'glasses' | 'sunglasses' | 'monocle';
}

const PERSONA_PRESETS: Record<string, CharacterTraits> = {
  southern: {
    name: 'Tex / Savannah',
    accentTag: 'Southern US Drawl',
    skinColor: '#f1c27d',
    shirtColor: '#b45309',
    hairStyle: 'cowboyHat',
    accessory: 'none',
  },
  british: {
    name: 'Arthur / Pippa',
    accentTag: 'British / RP',
    skinColor: '#ffdbac',
    shirtColor: '#1e3a8a',
    hairStyle: 'bob',
    accessory: 'monocle',
  },
  ny: {
    name: 'Vinny / Frankie',
    accentTag: 'East Coast / NY',
    skinColor: '#e0ac69',
    shirtColor: '#374151',
    hairStyle: 'beanie',
    accessory: 'sunglasses',
  },
  default: {
    name: 'Base Studio Avatar',
    accentTag: 'Neutral / Standard',
    skinColor: '#f1c27d',
    shirtColor: '#4f46e5',
    hairStyle: 'spiky',
    accessory: 'glasses',
  },
};

export default function App() {
  const [isTrack2D, setIsTrack2D] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  const [isScanningAccent, setIsScanningAccent] = useState<boolean>(false);
  const [detectedTranscript, setDetectedTranscript] = useState<string>('');
  const [character, setCharacter] = useState<CharacterTraits>(PERSONA_PRESETS.default);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3500);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 10;

    if (isTrack2D) {
      // 1. Shoulders
      ctx.fillStyle = character.shirtColor;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 145, 110, 65, 0, Math.PI, 0);
      ctx.fill();

      // 2. Neck
      ctx.fillStyle = character.skinColor;
      ctx.fillRect(cx - 22, cy + 65, 44, 40);

      // 3. Base Head
      ctx.fillStyle = character.skinColor;
      ctx.beginPath();
      ctx.roundRect(cx - 65, cy - 85, 130, 160, 55);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.stroke();

      // 4. Eyes
      const eyeY = cy - 15;
      if (isBlinking) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - 42, eyeY);
        ctx.lineTo(cx - 18, eyeY);
        ctx.moveTo(cx + 18, eyeY);
        ctx.lineTo(cx + 42, eyeY);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 30, eyeY, 13, 0, Math.PI * 2);
        ctx.arc(cx + 30, eyeY, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - 30, eyeY, 6, 0, Math.PI * 2);
        ctx.arc(cx + 30, eyeY, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Eyebrows
      const browLift = Math.min(volume * 14, 12);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 45, eyeY - 22 - browLift);
      ctx.lineTo(cx - 15, eyeY - 25 - browLift);
      ctx.moveTo(cx + 15, eyeY - 25 - browLift);
      ctx.lineTo(cx + 45, eyeY - 22 - browLift);
      ctx.stroke();

      // 6. Mouth
      const mouthHeight = Math.max(4, volume * 42);
      ctx.fillStyle = '#9f1239';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 35, 26, mouthHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      if (mouthHeight > 16) {
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 35 + mouthHeight * 0.35, 14, mouthHeight * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. Hair & Hats
      if (character.hairStyle === 'spiky') {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(cx - 65, cy - 45);
        ctx.lineTo(cx - 50, cy - 110);
        ctx.lineTo(cx - 20, cy - 85);
        ctx.lineTo(cx, cy - 120);
        ctx.lineTo(cx + 25, cy - 85);
        ctx.lineTo(cx + 55, cy - 110);
        ctx.lineTo(cx + 65, cy - 45);
        ctx.fill();
      } else if (character.hairStyle === 'cowboyHat') {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 70, 115, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(cx - 55, cy - 125, 110, 60, 20);
        ctx.fill();
      } else if (character.hairStyle === 'beanie') {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(cx, cy - 55, 68, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(cx - 70, cy - 65, 140, 18);
      } else if (character.hairStyle === 'bob') {
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(cx, cy - 40, 75, Math.PI, 0);
        ctx.fillRect(cx - 75, cy - 40, 20, 85);
        ctx.fillRect(cx + 55, cy - 40, 20, 85);
        ctx.fill();
      }

      // 8. Accessories
      if (character.accessory === 'glasses') {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.strokeRect(cx - 50, eyeY - 16, 40, 32);
        ctx.strokeRect(cx + 10, eyeY - 16, 40, 32);
        ctx.beginPath();
        ctx.moveTo(cx - 10, eyeY);
        ctx.lineTo(cx + 10, eyeY);
        ctx.stroke();
      } else if (character.accessory === 'sunglasses') {
        ctx.fillStyle = '#020617';
        ctx.fillRect(cx - 52, eyeY - 16, 44, 30);
        ctx.fillRect(cx + 8, eyeY - 16, 44, 30);
        ctx.fillRect(cx - 10, eyeY - 6, 20, 6);
      } else if (character.accessory === 'monocle') {
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx + 30, eyeY, 18, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Persona Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(12, canvas.height - 38, canvas.width - 24, 26);
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${character.name} • ${character.accentTag}`, cx, canvas.height - 21);
    } else {
      // 3D Placeholder
      ctx.beginPath();
      ctx.arc(cx, cy, 70 + volume * 20, 0, Math.PI * 2);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('3D WebGL Mesh Ready', cx, cy + 120);
    }
  }, [volume, isTrack2D, isBlinking, character]);

  const scanVoiceForAccent = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Your browser does not support live speech recognition. Try Chrome or Edge!');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsScanningAccent(true);
    setDetectedTranscript('Listening... say a phrase in your accent!');

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript.toLowerCase();
      setDetectedTranscript(`Heard: "${speechResult}"`);

      if (
        speechResult.includes("y'all") ||
        speechResult.includes('howdy') ||
        speechResult.includes('reckon') ||
        speechResult.includes('fixin') ||
        speechResult.includes('darlin')
      ) {
        setCharacter(PERSONA_PRESETS.southern);
      } else if (
        speechResult.includes('mate') ||
        speechResult.includes('bloody') ||
        speechResult.includes('cheerio') ||
        speechResult.includes('brilliant') ||
        speechResult.includes('innit')
      ) {
        setCharacter(PERSONA_PRESETS.british);
      } else if (
        speechResult.includes('fuhgeddaboudit') ||
        speechResult.includes('yo') ||
        speechResult.includes('bro') ||
        speechResult.includes('coffee') ||
        speechResult.includes('city')
      ) {
        setCharacter(PERSONA_PRESETS.ny);
      } else {
        const styles: CharacterTraits['hairStyle'][] = ['spiky', 'bob', 'cowboyHat', 'beanie'];
        const accessories: CharacterTraits['accessory'][] = ['glasses', 'sunglasses', 'monocle', 'none'];
        const randomStyle = styles[speechResult.length % styles.length];
        const randomAcc = accessories[speechResult.split(' ').length % accessories.length];

        setCharacter({
          name: 'Custom AI Persona',
          accentTag: 'Detected Custom Cadence',
          skinColor: '#e0ac69',
          shirtColor: '#0d9488',
          hairStyle: randomStyle,
          accessory: randomAcc,
        });
      }
      setIsScanningAccent(false);
    };

    recognition.onerror = () => {
      setIsScanningAccent(false);
      setDetectedTranscript('Could not catch that—try speaking a bit louder!');
    };

