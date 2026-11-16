import React, { useState, useRef, useEffect } from 'react';

interface Traits {
  name: string;
  accent: string;
  skin: string;
  shirt: string;
  hair: 'none' | 'spiky' | 'bob' | 'cowboyHat' | 'beanie';
  acc: 'none' | 'glasses' | 'sunglasses' | 'monocle';
}

const PRESETS: Record<string, Traits> = {
  southern: { name: 'Tex / Savannah', accent: 'Southern US', skin: '#f1c27d', shirt: '#b45309', hair: 'cowboyHat', acc: 'none' },
  british: { name: 'Arthur / Pippa', accent: 'British / RP', skin: '#ffdbac', shirt: '#1e3a8a', hair: 'bob', acc: 'monocle' },
  ny: { name: 'Vinny / Frankie', accent: 'East Coast / NY', skin: '#e0ac69', shirt: '#374151', hair: 'beanie', acc: 'sunglasses' },
  default: { name: 'Base Studio Avatar', accent: 'Neutral / Standard', skin: '#f1c27d', shirt: '#4f46e5', hair: 'spiky', acc: 'glasses' },
};

export default function App() {
  const [is2D, setIs2D] = useState(true);
  const [rec, setRec] = useState(false);
  const [mic, setMic] = useState(false);
  const [vol, setVol] = useState(0);
  const [blink, setBlink] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [heard, setHeard] = useState('');
  const [char, setChar] = useState<Traits>(PRESETS.default);

  const audioCtx = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, c.width, c.height);
    const cx = c.width / 2;
    const cy = c.height / 2 + 10;

    if (is2D) {
      ctx.fillStyle = char.shirt;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 145, 110, 65, 0, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = char.skin;
      ctx.fillRect(cx - 22, cy + 65, 44, 40);
      ctx.beginPath();
      ctx.roundRect(cx - 65, cy - 85, 130, 160, 55);
      ctx.fill();

      const eyeY = cy - 15;
      if (blink) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - 42, eyeY); ctx.lineTo(cx - 18, eyeY);
        ctx.moveTo(cx + 18, eyeY); ctx.lineTo(cx + 42, eyeY);
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

      const lift = Math.min(vol * 14, 12);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 45, eyeY - 22 - lift); ctx.lineTo(cx - 15, eyeY - 25 - lift);
      ctx.moveTo(cx + 15, eyeY - 25 - lift); ctx.lineTo(cx + 45, eyeY - 22 - lift);
      ctx.stroke();

      const mH = Math.max(4, vol * 42);
      ctx.fillStyle = '#9f1239';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 35, 26, mH, 0, 0, Math.PI * 2);
      ctx.fill();

      if (char.hair === 'spiky') {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(cx - 65, cy - 45); ctx.lineTo(cx - 50, cy - 110); ctx.lineTo(cx - 20, cy - 85);
        ctx.lineTo(cx, cy - 120); ctx.lineTo(cx + 25, cy - 85); ctx.lineTo(cx + 55, cy - 110);
        ctx.lineTo(cx + 65, cy - 45); ctx.fill();
      } else if (char.hair === 'cowboyHat') {
        ctx.fillStyle = '#78350f';
        ctx.beginPath(); ctx.ellipse(cx, cy - 70, 115, 22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.roundRect(cx - 55, cy - 125, 110, 60, 20); ctx.fill();
      } else if (char.hair === 'beanie') {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath(); ctx.arc(cx, cy - 55, 68, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#991b1b'; ctx.fillRect(cx - 70, cy - 65, 140, 18);
      } else if (char.hair === 'bob') {
        ctx.fillStyle = '#451a03';
        ctx.beginPath(); ctx.arc(cx, cy - 40, 75, Math.PI, 0);
        ctx.fillRect(cx - 75, cy - 40, 20, 85); ctx.fillRect(cx + 55, cy - 40, 20, 85); ctx.fill();
      }

      if (char.acc === 'glasses') {
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 4;
        ctx.strokeRect(cx - 50, eyeY - 16, 40, 32); ctx.strokeRect(cx + 10, eyeY - 16, 40, 32);
        ctx.beginPath(); ctx.moveTo(cx - 10, eyeY); ctx.lineTo(cx + 10, eyeY); ctx.stroke();
      } else if (char.acc === 'sunglasses') {
        ctx.fillStyle = '#020617';
        ctx.fillRect(cx - 52, eyeY - 16, 44, 30); ctx.fillRect(cx + 8, eyeY - 16, 44, 30);
        ctx.fillRect(cx - 10, eyeY - 6, 20, 6);
      } else if (char.acc === 'monocle') {
        ctx.strokeStyle = '#eab308'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx + 30, eyeY, 18, 0, Math.PI * 2); ctx.stroke();
      }

      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(12, c.height - 38, c.width - 24, 26);
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${char.name} • ${char.accent}`, cx, c.height - 21);
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, 70 + vol * 20, 0, Math.PI * 2);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('3D WebGL Mesh Ready', cx, cy + 120);
    }
  }, [vol, is2D, blink, char]);

  const scanAccent = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert('Try Chrome or Edge for live speech recognition!');
    const r = new SR();
    r.lang = 'en-US';
    setScanning(true);
    setHeard('Listening... speak a phrase!');
    r.onresult = (e: any) => {
      const txt = e.results.item(0).item(0).transcript.toLowerCase();
      setHeard(`Heard: "${txt}"`);
      if (txt.includes("y'all") || txt.includes('howdy') || txt.includes('reckon')) setChar(PRESETS.southern);
      else if (txt.includes('mate') || txt.includes('brilliant') || txt.includes('innit')) setChar(PRESETS.british);
      else if (txt.includes('yo') || txt.includes('bro') || txt.includes('coffee')) setChar(PRESETS.ny);
      else {
        const h: Traits['hair'][] = ['spiky', 'bob', 'cowboyHat', 'beanie'];
        const a: Traits['acc'][] = ['glasses', 'sunglasses', 'monocle', 'none'];
        setChar({ name: 'Custom AI Persona', accent: 'Custom Cadence', skin: '#e0ac69', shirt: '#0d9488', hair: h[txt.length % 4], acc: a[txt.split(' ').length % 4] });
      }
      setScanning(false);
    };
    r.onerror = () => { setScanning(false); setHeard('Could not catch that—try again!'); };
    r.start();
  };

  const toggleMic = async () => {
    if (mic) {
      if (rec) stopRec();
      setMic(false);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (audioCtx.current) audioCtx.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      setVol(0);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMic(true);
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      src.connect(an);
      audioCtx.current = ctx;
      analyser.current = an;
      const arr = new Uint8Array(an.frequencyBinCount);
      const loop = () => {
        if (!analyser.current) return;
        analyser.current.getByteFrequencyData(arr);
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        setVol(avg / 128);
        animRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch { alert('Microphone access denied.'); }
  };

  const startRec = () => {
    if (!mic || !streamRef.current || !canvasRef.current) return alert('Activate microphone first!');
    chunksRef.current = [];
    const cStream = canvasRef.current.captureStream(30);
    const stream = new MediaStream([...cStream.getVideoTracks(), ...streamRef.current.getAudioTracks()]);
    const opts = MediaRecorder.isTypeSupported('video/mp4') ? { mimeType: 'video/mp4' } : { mimeType: 'video/webm' };
    const mr = new MediaRecorder(stream, opts);
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const ext = opts.mimeType.includes('mp4') ? 'mp4' : 'webm';
      const url = URL.createObjectURL(new Blob(chunksRef.current, { type: opts.mimeType }));
      const a = document.createElement('a');
      a.href = url; a.download = `voxanim-${Date.now()}.${ext}`; a.click();
    };
    mr.start();
    recorderRef.current = mr;
    setRec(true);
  };

  const stopRec = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    setRec(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-400">VoxAnim Studio Live</h1>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
