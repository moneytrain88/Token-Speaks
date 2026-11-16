import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  const [isTrack2D, setIsTrack2D] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);

  // Audio & Canvas Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Recorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Draw the character onto the canvas continuously
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background for clean social media export
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (isTrack2D) {
      // Draw 2D Head
      ctx.beginPath();
      ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
      ctx.fillStyle = '#312e81';
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#4338ca';
      ctx.stroke();

      // Draw Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX - 35, centerY - 25, 12, 0, Math.PI * 2);
      ctx.arc(centerX + 35, centerY - 25, 12, 0, Math.PI * 2);
      ctx.fill();

      // Draw Pupils
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(centerX - 35, centerY - 25, 5, 0, Math.PI * 2);
      ctx.arc(centerX + 35, centerY - 25, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw Reactive Mouth
      const mouthHeight = Math.max(4, volume * 45);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 30, 30, mouthHeight, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw 3D Placeholder Ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, 70 + volume * 20, 0, Math.PI * 2);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('3D WebGL Mesh Ready', centerX, centerY + 120);
    }
  }, [volume, isTrack2D]);

  const toggleMic = async () => {
    if (micActive) {
      if (isRecording) stopRecording();
      setMicActive(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      setVolume(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
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
      alert('Microphone access denied or unavailable.');
      console.error(err);
    }
  };

  const startRecording = () => {
    if (!micActive || !streamRef.current || !canvasRef.current) {
      alert('Please activate your microphone first so the video includes your voice!');
      return;
    }

    recordedChunksRef.current = [];

    // 1. Capture the visual canvas at 30fps
    const canvasStream = canvasRef.current.captureStream(30);

    // 2. Combine canvas video track with live microphone audio track
    const combinedTracks = [
      ...canvasStream.getVideoTracks(),
      ...streamRef.current.getAudioTracks(),
    ];
    const combinedStream = new MediaStream(combinedTracks);

    // 3. Initialize MediaRecorder
    const options = MediaRecorder.isTypeSupported('video/mp4')
      ? { mimeType: 'video/mp4' }
      : { mimeType: 'video/webm' };

    const mediaRecorder = new MediaRecorder(combinedStream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const extension = options.mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunksRef.current, { type: options.mimeType });
      const url = URL.createObjectURL(blob);

      // Trigger automatic download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `voxanim-clip-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wider text-indigo-400">VoxAnim Studio Live</h1>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setIsTrack2D(true)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              isTrack2D ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            2D Cartoon
          </button>
          <button
            onClick={() => setIsTrack2D(false)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              !isTrack2D ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Realistic
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6">
        {/* Left Controls */}
        <div className="w-full md:w-80 bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-400">Control Deck</h2>

            <button
              onClick={toggleMic}
              className={`w-full py-4 rounded-xl font-bold text-center border transition-all flex flex-col items-center justify-center gap-2 ${
                micActive
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${micActive ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
              {micActive ? 'Microphone Active' : 'Tap to Activate Mic'}
            </button>

            <button
              onClick={handleRecordToggle}
              className={`w-full py-3 rounded-xl font-medium text-center border transition-all ${
                isRecording
                  ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
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
              <div
                className="bg-indigo-500 h-full transition-all duration-75"
                style={{ width: `${Math.min(volume * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Canvas Stage */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative flex flex-col items-center justify-center shadow-inner min-h-[400px]">
          <span className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1 rounded text-xs text-slate-400 border border-slate-800 font-mono uppercase tracking-widest z-10">
            {isTrack2D ? '2D Video Stage' : '3D WebGL Mesh'}
