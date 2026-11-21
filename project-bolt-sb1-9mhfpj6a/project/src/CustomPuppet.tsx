import React, { useEffect, useRef, useState } from 'react';

interface CustomPuppetProps {
  imageUrl: string;
  vol: number;
  mouthYOffset: number;
  isFem: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const CustomPuppet: React.FC<CustomPuppetProps> = ({
  imageUrl,
  vol,
  mouthYOffset,
  isFem,
  canvasRef,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const volRef = useRef(vol);
  const offsetRef = useRef(mouthYOffset);
  const femRef = useRef(isFem);

  useEffect(() => { volRef.current = vol; }, [vol]);
  useEffect(() => { offsetRef.current = mouthYOffset; }, [mouthYOffset]);
  useEffect(() => { femRef.current = isFem; }, [isFem]);

  useEffect(() => {
    setLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Allows Video Recorder to export the canvas!
    img.src = imageUrl;
    img.onload = () => {
      imgRef.current = img;
      setLoading(false);
    };
  }, [imageUrl]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (c && ctx) {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, c.width, c.height);

        if (imgRef.current && !loading) {
          ctx.drawImage(imgRef.current, 0, 0, c.width, c.height);

          // Draw Live Synchronized Mouth over the AI Character
          const v = volRef.current;
          const cx = c.width / 2;
          const mouthY = c.height / 2 + 45 + offsetRef.current;
          const openAmt = Math.min(v * 42, 32);
          const mouthW = (femRef.current ? 24 : 28) - openAmt * 0.18;

          // Dark backing patch so the animated mouth blends cleanly
          ctx.fillStyle = 'rgba(15, 10, 15, 0.72)';
          ctx.beginPath();
          ctx.ellipse(cx, mouthY + openAmt * 0.2, mouthW + 4, 8 + openAmt * 0.65, 0, 0, Math.PI * 2);
          ctx.fill();

          if (openAmt > 2) {
            ctx.fillStyle = '#2a040e';
            ctx.beginPath();
            ctx.ellipse(cx, mouthY + openAmt * 0.25, mouthW - 2, openAmt * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();

            // Upper Teeth
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.ellipse(cx, mouthY - openAmt * 0.05, mouthW * 0.6, Math.min(openAmt * 0.25, 5), 0, 0, Math.PI);
            ctx.fill();
          }

          // Upper & Lower Lips
          ctx.fillStyle = femRef.current ? '#e11d48' : '#9f4a4a';
          ctx.beginPath();
          ctx.ellipse(cx, mouthY - 2 - openAmt * 0.2, mouthW, 3.5, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = femRef.current ? '#fb7185' : '#b86565';
          ctx.beginPath();
          ctx.ellipse(cx, mouthY + 3 + openAmt * 0.55, mouthW * 0.88, 4.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#818cf8';
          ctx.font = '14px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('Painting Custom AI Character...', c.width / 2, c.height / 2);
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [loading, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="rounded-lg border border-slate-800 max-w-full h-auto shadow-2xl"
    />
  );
};
