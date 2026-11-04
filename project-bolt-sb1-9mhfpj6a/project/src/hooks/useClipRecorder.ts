import { useCallback, useRef, useState } from 'react';

const CLIP_FRAME_RATE = 30;
const CLIP_VIDEO_BITRATE = 8_000_000;
const CLIP_AUDIO_BITRATE = 128_000;
const CLIP_BASE_NAME = 'voxanim-social-clip';
const PREFERRED_MIME_TYPES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/webm;codecs=vp9,opus',
  'video/webm',
];

function pickMimeType(): string | undefined {
  return PREFERRED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function useClipRecorder(micStream: MediaStream | null) {
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const start = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas || recorderRef.current) return;
      if (typeof MediaRecorder === 'undefined') {
        setErrorMessage('Video recording is not supported in this browser.');
        return;
      }

      try {
        const videoStream = canvas.captureStream(CLIP_FRAME_RATE);
        const tracks = [
          ...videoStream.getVideoTracks(),
          ...(micStream?.getAudioTracks() ?? []),
        ];
        const mimeType = pickMimeType();
        const recorder = new MediaRecorder(new MediaStream(tracks), {
          ...(mimeType ? { mimeType } : {}),
          videoBitsPerSecond: CLIP_VIDEO_BITRATE,
          audioBitsPerSecond: CLIP_AUDIO_BITRATE,
        });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onstop = () => {
          const type = recorder.mimeType || 'video/webm';
          const extension = type.includes('mp4') ? 'mp4' : 'webm';
          downloadBlob(new Blob(chunks, { type }), `${CLIP_BASE_NAME}.${extension}`);
          videoStream.getTracks().forEach((track) => track.stop());
          recorderRef.current = null;
          setIsRecording(false);
        };

        recorder.start(250);
        recorderRef.current = recorder;
        setErrorMessage(null);
        setIsRecording(true);
      } catch {
        setErrorMessage('Could not start recording. Please try again.');
      }
    },
    [micStream],
  );

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  return { isRecording, errorMessage, start, stop };
}
