import React, { useState, useRef, useEffect } from 'react';
import { analyzeAndGenerateCharacter } from './acousticAI';
import { Traits, draw2DCharacter } from './CharacterRenderer';
import { Avatar3D } from './Avatar3D';
import { parseVoiceCommand } from './voiceCommands';
import { buildCharacterImageUrl } from './aiImageGen';
import { CustomPuppet } from './CustomPuppet';

const PRESETS: Record<string, Traits> = {
  savannah: { name: 'Savannah', accent: 'Southern Belle', species: 'human', skin: '#f1c27d', shirt: '#db2777', hair: 'longWaves', acc: 'none', beard: 'none', bg: 'sunset', lashes: true },
  tex: { name: 'Tex', accent: 'Southern US', species: 'human', skin: '#f1c27d', shirt: '#b45309', hair: 'cowboyHat', acc: 'none', beard: 'mustache', bg: 'sunset', lashes: false },
  luna: { name: 'Luna', accent: 'Cyber Star', species: 'alien', skin: '#f472b6', shirt: '#7c3aed', hair: 'buns', acc: 'none', beard: 'none', bg: 'neon', lashes: true },
  cat: { name: 'DJ Whiskers', accent: 'Cool Feline', species: 'cat', skin: '#f97316', shirt: '#4f46e5', hair: 'beanie', acc: 'sunglasses', beard: 'none', bg: 'neon', lashes: false },
  robot: { name: 'Unit-7', accent: 'Synth Bot', species: 'robot', skin: '#94a3b8', shirt: '#0284c7', hair: 'none', acc: 'none', beard: 'none', bg: 'dark', lashes: false },
  zorgon: { name: 'Zorgon', accent: 'Cosmic Visitor', species: 'alien', skin: '#4ade80', shirt: '#7c3aed', hair: 'none', acc: 'none', beard: 'none', bg: 'neon', lashes: false },
};

export default function App() {
  const [is2D, setIs2D] = useState(true);
  const [rec, setRec] = useState(false);
  const [mic, setMic] = useState(false);
  const [vol, setVol] = useState(0);
  const [blink, setBlink] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [heard, setHeard] = useState('');
  const [char, setChar] = useState<Traits>(PRESETS.savannah);
const [customPrompt, setCustomPrompt] = useState('');
const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
const [mouthOffset, setMouthOffset] = useState(0);

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
    if (!is2D) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    draw2DCharacter(ctx, c.width, c.height, char, vol, blink);
  }, [vol, is2D, blink, char]);

  const scanAccent = async () => {
    try {
      setScanning(true);
      setHeard('Listening for 3.5s... speak in any voice!');
      const result = await analyzeAndGenerateCharacter(3500);
      setHeard(result.summary);
      setChar(result.character);
    } catch {
      setHeard('Microphone access needed.');
    } finally {
      setScanning(false);
    }
  };

   const listenForCommand = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert('Try Chrome or Edge for live voice commands!');
    const r = new SR();
    r.lang = 'en-US';
    setScanning(true);
    setHeard('Listening... say "create a pirate shark" or "put a cowboy hat on him"');
    r.onresult = (e: any) => {
      const spoken = e.results.item(0).item(0).transcript;
      const lower = spoken.toLowerCase();

      if (lower.startsWith('create ') || lower.startsWith('draw ') || lower.startsWith('generate ')) {
        const subject = spoken.replace(/^(create|draw|generate)\s+/i, '');
        setCustomPrompt(subject);
        setAiImageUrl(buildCharacterImageUrl(subject));
        setHeard(`Generating AI Character: "${subject}"`);
      } else {
        setAiImageUrl(null);
        const { updated, feedback } = parseVoiceCommand(spoken, char);
        setChar(updated);
        setHeard(feedback);
      }
      setScanning(false);
    };
    r.onerror = () => {
      setScanning(false);
      setHeard('Did not catch that command—try speaking again!');
    };
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
        setVol(arr.reduce((a, b) => a + b, 0) / arr.length / 128);
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
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase text-slate-400">1. Live Audio & Recording</h2>
            <button onClick={toggleMic} className={`w-full py-2.5 rounded-xl font-bold border ${mic ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-700 border-slate-600'}`}>
              {mic ? 'Microphone Active' : 'Tap to Activate Mic'}
            </button>
            <button onClick={rec ? stopRec : startRec} className={`w-full py-2 rounded-xl font-medium border ${rec ? 'bg-rose-600 border-rose-500 animate-pulse' : 'bg-slate-700 border-slate-600'}`}>
              {rec ? 'Stop & Download Clip' : 'Start Recording Clip'}
            </button>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-700">
            <h2 className="text-xs font-bold uppercase text-indigo-400">2. AI Creature & Persona Builder</h2>
            <button onClick={scanAccent} disabled={scanning} className="w-full py-2 px-3 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500">
              {scanning ? 'Listening...' : 'Scan Voice & Invent Character'}
            </button>
            <button onClick={listenForCommand} disabled={scanning} className="w-full py-2 px-3 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white">
              {scanning ? 'Listening...' : '🎙️ Voice Command (Edit by Voice)'}
            </button>
            {heard && <p className="text-xs text-slate-300 bg-slate-900 p-2 rounded">{heard}</p>}
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(PRESETS).map(([k, p]) => (
                <button key={k} onClick={() => setChar(p)} className={`text-xs py-1 px-2 rounded border text-left truncate ${char.name === p.name ? 'bg-indigo-900 border-indigo-500' : 'bg-slate-700 border-slate-600'}`}>
                  {p.name} ({p.species})
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-700">
            <h2 className="text-xs font-bold uppercase text-slate-400">3. Customize Character</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Character Type</label>
                <select value={char.species} onChange={(e) => setChar({ ...char, species: e.target.value as any })} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="human">Human</option>
                  <option value="cat">Cool Cat</option>
                  <option value="bear">Bear / Panda</option>
                  <option value="robot">Retro Robot</option>
                  <option value="alien">Space Alien</option>
                  <option value="monster">Fanged Monster</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Hair / Hat</label>
                <select value={char.hair} onChange={(e) => setChar({ ...char, hair: e.target.value as any })} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="spiky">Spiky Hair</option>
                  <option value="cowboyHat">Cowboy Hat</option>
                  <option value="beanie">Beanie</option>
                  <option value="bob">Classic Bob</option>
                  <option value="longWaves">Long Waves</option>
                  <option value="ponytail">High Ponytail</option>
                  <option value="buns">Twin Space Buns</option>
                  <option value="none">None</option>
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
                <label className="text-slate-400 block mb-1">Background</label>
                <select value={char.bg} onChange={(e) => setChar({ ...char, bg: e.target.value as any })} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="dark">Dark Studio</option>
                  <option value="neon">Cyber Neon</option>
                  <option value="sunset">Warm Sunset</option>
                  <option value="greenscreen">Green Screen</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Facial Hair</label>
                <select value={char.beard} onChange={(e) => setChar({ ...char, beard: e.target.value as any })} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="none">Clean Shaven</option>
                  <option value="stubble">5 O'Clock Shadow</option>
                  <option value="mustache">Mustache</option>
                  <option value="goatee">Sculpted Goatee</option>
                  <option value="full">Full Jaw Beard</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">Fur/Skin:</span>
              <div className="flex gap-1">
                {['#f1c27d', '#8d5524', '#f97316', '#4ade80', '#94a3b8', '#a855f7'].map((t) => (
                  <button key={t} onClick={() => setChar({ ...char, skin: t })} className={`w-4 h-4 rounded-full border ${char.skin === t ? 'border-white scale-110' : 'border-slate-600'}`} style={{ backgroundColor: t }} />
                ))}
              </div>
              <button onClick={() => setChar({ ...char, lashes: !char.lashes })} className={`text-xs px-2 py-1 rounded border ${char.lashes ? 'bg-pink-600 border-pink-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                {char.lashes ? 'Lashes: ON' : 'Lashes: OFF'}
              </button>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-700">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Vocal Input</span><span>{(vol * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
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
                <label className="text-slate-400 block mb-1">Background</label>
                <select value={char.bg} onChange={(e) => setChar({ ...char, bg: e.target.value as any })} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="dark">Dark Studio</option>
                  <option value="neon">Cyber Neon</option>
                  <option value="sunset">Warm Sunset</option>
                  <option value="greenscreen">Green Screen</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Facial Hair</label>
                <select value={char.beard} onChange={(e) => setChar({ ...char, beard: e.target.value as any })} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5">
                  <option value="none">Clean Shaven</option>
                  <option value="stubble">5 O'Clock Shadow</option>
                  <option value="mustache">Mustache</option>
                  <option value="goatee">Sculpted Goatee</option>
                  <option value="full">Full Jaw Beard</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">Fur/Skin:</span>
              <div className="flex gap-1">
                {['#f1c27d', '#8d5524', '#f97316', '#4ade80', '#94a3b8', '#a855f7'].map((t) => (
                  <button key={t} onClick={() => setChar({ ...char, skin: t })} className={`w-4 h-4 rounded-full border ${char.skin === t ? 'border-white scale-110' : 'border-slate-600'}`} style={{ backgroundColor: t }} />
                ))}
              </div>
              <button onClick={() => setChar({ ...char, lashes: !char.lashes })} className={`text-xs px-2 py-1 rounded border ${char.lashes ? 'bg-pink-600 border-pink-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                {char.lashes ? 'Lashes: ON' : 'Lashes: OFF'}
              </button>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-700">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Vocal Input</span><span>{(vol * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(vol * 100, 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl relative flex items-center justify-center min-h-[420px]">
          <span className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1 rounded text-xs text-slate-400 border border-slate-800 font-mono">
            {is2D ? '2D Creature Rig' : '3D WebGL Mesh'}
          </span>
          {rec && <span className="absolute top-4 right-4 bg-rose-600 px-3 py-1 rounded text-xs font-bold animate-pulse">REC</span>}
                    {aiImageUrl ? (
            <CustomPuppet imageUrl={aiImageUrl} promptText={customPrompt} vol={vol} mouthYOffset={mouthOffset} isFem={Boolean(char.lashes)} canvasRef={canvasRef} />
          ) : is2D ? (
            <canvas ref={canvasRef} width={400} height={400} className="rounded-lg border border-slate-800 max-w-full h-auto" />
          ) : (
            <Avatar3D vol={vol} char={char} blink={blink} canvasRef={canvasRef} />
          )}

        </div>
      </div>
    </div>
  );
}
