import React, { useState, useRef, useEffect } from 'react';

interface Traits {
  name: string;
  accent: string;
  skin: string;
  shirt: string;
  hair: 'none' | 'spiky' | 'bob' | 'cowboyHat' | 'beanie';
  acc: 'none' | 'glasses' | 'sunglasses' | 'monocle';
  beard: 'none' | 'goatee' | 'full' | 'mustache';
  bg: 'dark' | 'neon' | 'sunset' | 'greenscreen';
}

const PRESETS: Record<string, Traits> = {
  southern: { name: 'Tex / Savannah', accent: 'Southern US', skin: '#f1c27d', shirt: '#b45309', hair: 'cowboyHat', acc: 'none', beard: 'mustache', bg: 'sunset' },
  british: { name: 'Arthur / Pippa', accent: 'British / RP', skin: '#ffdbac', shirt: '#1e3a8a', hair: 'bob', acc: 'monocle', beard: 'none', bg: 'dark' },
  ny: { name: 'Vinny / Frankie', accent: 'East Coast / NY', skin: '#e0ac69', shirt: '#374151', hair: 'beanie', acc: 'sunglasses', beard: 'goatee', bg: 'neon' },
  default: { name: 'Base Studio Avatar', accent: 'Neutral / Standard', skin: '#f1c27d', shirt: '#4f46e5', hair: 'spiky', acc: 'glasses', beard: 'none', bg: 'dark' },
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

    // 1. Studio Background Themes
    if (char.bg === 'greenscreen') {
      ctx.fillStyle = '#00b140';
      ctx.fillRect(0, 0, c.width, c.height);
    } else if (char.bg === 'neon') {
      const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#4c1d95');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, c.width, c.height);
    } else if (char.bg === 'sunset') {
      const grad = ctx.createLinearGradient(0, 0, 0, c.height);
      grad.addColorStop(0, '#451a03');
      grad.addColorStop(1, '#9a3412');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, c.width, c.height);
    } else {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, c.width, c.height);
    }

    const cx = c.width / 2;
    const cy = c.height / 2 + 10;

    if (is2D) {
      // 2. Shoulders & Shirt
      ctx.fillStyle = char.shirt;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 145, 115, 65, 0, Math.PI, 0);
      ctx.fill();

      // 3. Neck + Shadow
      ctx.fillStyle = char.skin;
      ctx.fillRect(cx - 22, cy + 65, 44, 42);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(cx - 22, cy + 65, 44, 14);

      // 4. Ears
      ctx.fillStyle = char.skin;
      ctx.beginPath();
      ctx.arc(cx - 66, cy - 5, 14, 0, Math.PI * 2);
      ctx.arc(cx + 66, cy - 5, 14, 0, Math.PI * 2);
      ctx.fill();

      // 5. Base Head
      ctx.fillStyle = char.skin;
      ctx.beginPath();
      ctx.roundRect(cx - 65, cy - 85, 130, 160, 55);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.22)';
      ctx.stroke();

      // 6. Nose
      ctx.strokeStyle = 'rgba(0,0,0,0.28)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx - 5, cy + 10);
      ctx.lineTo(cx + 4, cy + 12);
      ctx.stroke();

      // 7. Eyes
      const eyeY = cy - 18;
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
        // Eye shine
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 32, eyeY - 2, 2, 0, Math.PI * 2);
        ctx.arc(cx + 28, eyeY - 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 8. Eyebrows
      const lift = Math.min(vol * 14, 12);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 45, eyeY - 22 - lift); ctx.lineTo(cx - 15, eyeY - 25 - lift);
      ctx.moveTo(cx + 15, eyeY - 25 - lift); ctx.lineTo(cx + 45, eyeY - 22 - lift);
      ctx.stroke();

      // 9. Facial Hair (Behind/Around Mouth)
      ctx.fillStyle = '#1e293b';
      if (char.beard === 'full') {
        ctx.beginPath();
        ctx.arc(cx, cy + 22, 63, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.fill();
      } else if (char.beard === 'goatee') {
        ctx.beginPath();
        ctx.ellipse(cx, cy + 54, 22, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 10. Reactive Mouth + Teeth/Tongue
      const mH = Math.max(4, vol * 40);
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 38, 25, mH, 0, 0, Math.PI * 2);
      ctx.fill();
      if (mH > 14) {
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 38 + mH * 0.35, 13, mH * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mustache (Above Mouth)
      if (char.beard === 'mustache') {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(cx - 14, cy + 23, 16, 6, -0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + 14, cy + 23, 16, 6, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 11. Hair & Hats
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

      // 12. Accessories
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

      if (char.bg !== 'greenscreen') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(12, c.height - 38, c.width - 24, 26);
        ctx.fillStyle = '#a5b4fc';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${char.name} • ${char.accent}`, cx, c.height - 21);
      }
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
        const b: Traits['beard'][] = ['none', 'goatee', 'full', 'mustache'];
        setChar({ name: 'Custom AI Persona', accent: 'Custom Cadence', skin: '#e0ac69', shirt: '#0d9488', hair: h[txt.length % 4], acc: a[txt.split(' ').length % 4], beard: b[txt.length % 4], bg: 'neon' });
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
          <button onClick={() => setIs2D(true)} className={`px-4 py-1.5 rounded text-sm ${is2D ? 'bg-indigo-600' : 'text-slate-400'}`}>2D Cartoon</button>
          <button onClick={() => setIs2D(false)} className={`px-4 py-1.5 rounded text-sm ${!is2D ? 'bg-indigo-600' : 'text-slate-400'}`}>3D Realistic</button>
        </div>
      </header>
      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6">
        <div className="w-full md:w-96 bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between space-y-4 overflow-y-auto">
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase text-slate-400">1. Live Audio & Recording</h2>
            <button onClick={toggleMic} className={`w-full py-2.5 rounded-xl font-bold border ${mic ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-700 border-slate-600'}`}>
              {mic ? 'Microphone Active' : 'Tap to Activate Mic'}
            </button>
            <button onClick={rec ? stopRec : startRec} className={`w-full py-2 rounded-xl font-medium border ${rec ? 'bg-rose-600 border-rose-500 animate-pulse' : 'bg-slate-700 border-slate-600'}`}>
              {rec ? 'Stop & Download Clip' : 'Start Recording Clip'}
            </button>
          </div>
          <div className="space-y-2.5 pt-3 border-t border-slate-700">
            <h2 className="text-xs font-bold uppercase text-indigo-400">2. AI Accent Persona Builder</h2>
            <button onClick={scanAccent} disabled={scanning} className="w-full py-2 px-3 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500">
              {scanning ? 'Listening...' : 'Scan Voice & Build Character'}
            </button>
            {heard && <p className="text-xs text-slate-300 bg-slate-900 p-2 rounded">{heard}</p>}
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(PRESETS).map(([k, p]) => (
                <button key={k} onClick={() => setChar(p)} className={`text-xs py-1 px-2 rounded border text-left truncate ${char.name === p.name ? 'bg-indigo-900 border-indigo-500' : 'bg-slate-700 border-slate-600'}`}>
                  {p.accent}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2.5 pt-3 border-t border-slate-700">
            <h2 className="text-xs font-bold uppercase text-slate-400">3. Studio Artwork & Details</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Hair / Hat</label>
                <select value={char.hair} onChange={(e) => setChar({ ...char, hair: e.target.value as any })} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="spiky">Spiky Hair</option>
                  <option value="cowboyHat">Cowboy Hat</option>
                  <option value="beanie">Beanie</option>
                  <option value="bob">Classic Bob</option>
                  <option value="none">Clean</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Eyewear</label>
                <select value={char.acc} onChange={(e) => setChar({ ...char, acc: e.target.value as any })} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="glasses">Glasses</option>
                  <option value="sunglasses">Shades</option>
                  <option value="monocle">Monocle</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Facial Hair</label>
                <select value={char.beard} onChange={(e) => setChar({ ...char, beard: e.target.value as any })} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="none">Clean Shaven</option>
                  <option value="mustache">Mustache</option>
                  <option value="goatee">Goatee</option>
                  <option value="full">Full Beard</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Background</label>
                <select value={char.bg} onChange={(e) => setChar({ ...char, bg: e.target.value as any })} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="dark">Dark Studio</option>
                  <option value="neon">Cyber Neon</option>
                  <option value="sunset">Warm Sunset</option>
                  <option value="greenscreen">Green Screen</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">Skin:</span>
              <div className="flex gap-1.5">
                {['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#3d2314'].map((t) => (
                  <button key={t} onClick={() => setChar({ ...char, skin: t })} className={`w-4 h-4 rounded-full border ${char.skin === t ? 'border-white scale-110' : 'border-slate-600'}`} style={{ backgroundColor: t }} />
                ))}
              </div>
              <span className="text-xs text-slate-400">Shirt:</span>
              <div className="flex gap-1.5">
                {['#4f46e5', '#dc2626', '#059669', '#d97706', '#374151'].map((s) => (
                  <button key={s} onClick={() => setChar({ ...char, shirt: s })} className={`w-4 h-4 rounded-full border ${char.shirt === s ? 'border-white scale-110' : 'border-slate-600'}`} style={{ backgroundColor: s }} />
                ))}
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-700">
