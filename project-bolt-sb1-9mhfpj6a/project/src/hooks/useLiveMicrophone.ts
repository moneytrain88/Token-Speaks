import { useCallback, useEffect, useRef, useState } from 'react';
import { computeRms, rmsToLevel, smoothLevel } from '@/lib/audio/levels';

export interface AudioFrame {
  level: number;
  frequency: Uint8Array;
}

export type AudioFrameListener = (frame: AudioFrame) => void;
export type AudioSubscribe = (listener: AudioFrameListener) => () => void;
export type MicStatus = 'idle' | 'requesting' | 'live' | 'error';

const FFT_SIZE = 256;
const SILENT_FREQUENCY = new Uint8Array(FFT_SIZE / 2);

interface MicGraph {
  stream: MediaStream;
  context: AudioContext;
  analyser: AnalyserNode;
  timeData: Float32Array;
  frequency: Uint8Array;
}

function describeMicError(error: unknown): string {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return 'Microphone access was blocked. Allow it in your browser and try again.';
  }
  if (error instanceof DOMException && error.name === 'NotFoundError') {
    return 'No microphone was found on this device.';
  }
  return 'Could not start the microphone.';
}

export function useLiveMicrophone() {
  const [status, setStatus] = useState<MicStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const graphRef = useRef<MicGraph | null>(null);
  const listenersRef = useRef(new Set<AudioFrameListener>());
  const levelRef = useRef(0);

  useEffect(() => {
    let frameId = 0;
    const tick = () => {
      const graph = graphRef.current;
      let target = 0;
      let frequency = SILENT_FREQUENCY;
      if (graph) {
        graph.analyser.getFloatTimeDomainData(graph.timeData);
        graph.analyser.getByteFrequencyData(graph.frequency);
        target = rmsToLevel(computeRms(graph.timeData));
        frequency = graph.frequency;
      }
      levelRef.current = smoothLevel(levelRef.current, target);
      const frame: AudioFrame = { level: levelRef.current, frequency };
      listenersRef.current.forEach((listener) => listener(frame));
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const subscribe = useCallback<AudioSubscribe>((listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const stop = useCallback(() => {
    const graph = graphRef.current;
    graphRef.current = null;
    graph?.stream.getTracks().forEach((track) => track.stop());
    graph?.context.close();
    setStream(null);
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    setStatus('requesting');
    setErrorMessage(null);
    let mic: MediaStream | null = null;
    try {
      mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.5;
      context.createMediaStreamSource(mic).connect(analyser);
      await context.resume();
      graphRef.current = {
        stream: mic,
        context,
        analyser,
        timeData: new Float32Array(analyser.fftSize),
        frequency: new Uint8Array(analyser.frequencyBinCount),
      };
      setStream(mic);
      setStatus('live');
    } catch (error) {
      mic?.getTracks().forEach((track) => track.stop());
      setErrorMessage(describeMicError(error));
      setStatus('error');
    }
  }, []);

  const toggle = useCallback(() => {
    if (graphRef.current) {
      stop();
    } else {
      void start();
    }
  }, [start, stop]);

  useEffect(() => stop, [stop]);

  return { status, stream, errorMessage, toggle, subscribe };
}
