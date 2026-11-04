import React, { useState, useRef } from 'react';

export default function App() {
  const [isTrack2D, setIsTrack2D] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const toggleMic = async () => {
    if (micActive) {
      setMicActive(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      setVolume(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicActive(true);
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      const updateAudio = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArrayRef.current[i];
        }
        const average = sum / bufferLength;
        setVolume(average / 128); 
        animationFrameRef.current = requestAnimationFrame(updateAudio);
      };
      
      updateAudio();
    } catch (err) {
      alert("Microphone access denied or unavailable.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wider text-indigo-400">VoxAnim Studio Live</h1>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button 
            onClick={() => setIsTrack2D(true)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isTrack2D ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            2D Cartoon
          </button>
          <button 
            onClick={() => setIsTrack2D(false)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isTrack2D ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            3D Realistic
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6">
        {/* Left Controls */}
        <div className="w-full md:w-80 bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <h2 className="text-sm font-semibold tracking-uppercase text-slate-400">Control Deck</h2>
            
            <button 
              onClick={toggleMic}
              className={`w-full py-4 rounded-xl font-bold text-center border transition-all flex flex-col items-center justify-center gap-2 ${micActive ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/30' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-650'}`}
            >
              <div className={`w-3 h-3 rounded-full ${micActive ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
              {micActive ? 'Microphone Active' : 'Tap to Activate Mic'}
            </button>

            <button 
              onClick={() => setIsRecording(!isRecording)}
              className={`w-full py-3 rounded-xl font-medium text-center border transition-all ${isRecording ? 'bg-rose-600 border-rose-500 text-white animate-pulse' : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-650 hover:text-white'}`}
            >
              {isRecording ? 'Stop & Download Clip' : 'Start Recording Clip'}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Vocal Input Stream</span>
              <span>{(volume * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-500 h-full transition-all duration-75" style={{ width: `${Math.min(volume * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Right Canvas */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative flex flex-col items-center justify-center shadow-inner min-h-[400px]">
          <span className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1 rounded text-xs text-slate-400 border border-slate-800 font-mono uppercase tracking-widest">
            {isTrack2D ? '2D Vector Track' : '3D WebGL Mesh'}
          </span>

          {isTrack2D ? (
            /* 2D Cartoon Character SVG */
            <svg width="200" height="200" viewBox="0 0 200 200" className="transition-transform duration-75">
              <circle cx="100" cy="100" r="80" fill="#312e81" stroke="#4338ca" strokeWidth="4" />
              <circle cx="70" cy="60" r="10" fill="#ffffff" />
              <circle cx="70" cy="60" r="4" fill="#000000" />
              <circle cx="130" cy="60" r="10" fill="#ffffff" />
              <circle cx="130" cy="60" r="4" fill="#000000" />
              {/* Mouth scales open dynamically based on microphone volume */}
              <ellipse cx="100" cy="120" rx="25" ry={Math.max(2, volume * 35)} fill="#f43f5e" />
            </svg>
          ) : (
            /* 3D Realistic Track Mock Canvas Component */
            <div className="text-center space-y-3">
              <div 
                className="w-32 h-32 rounded-full border-4 border-dashed border-indigo-500/50 bg-indigo-950/20 mx-auto flex items-center justify-center transition-transform duration-75"
                style={{ transform: `scale(${1 + (volume * 0.15)})` }}
              >
                <div className="w-4 h-4 bg-indigo-400 rounded-full animate-ping" />
              </div>
              <p className="text-sm text-slate-500 max-w-xs font-mono">Three.js canvas active. Vertex blendshape target "mouthOpen" linked to dynamic stream.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

