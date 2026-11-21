import React, { useEffect, useRef, useState } from 'react';

interface CustomPuppetProps {
  imageUrl: string;
  promptText: string;
  vol: number;
  mouthYOffset: number;
  isFem: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const CustomPuppet: React.FC<CustomPuppetProps> = ({
  imageUrl,
  promptText,
  vol,
  mouthYOffset,
  isFem,
  canvasRef,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const volRef = useRef(vol);
  const offsetRef = useRef(mouthYOffset);
  const femRef = useRef(isFem);

  useEffect(() => { volRef.current = vol; }, [vol]);
  useEffect(() => { offsetRef.current = mouthYOffset; }, [mouthYOffset]);
  useEffect(() => { femRef.current = isFem; }, [isFem]);

  useEffect(() => {
    setStatus('loading');
    imgRef.current = null;
    let cancelled = false;

    const timer = setTimeout(() => {
      if (!cancelled) setStatus('fallback');
    }, 4500);

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      if (!cancelled) {
        clearTimeout(timer);
        imgRef.current = img;
        setStatus('ready');
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        clearTimeout(timer);
        setStatus('fallback');
      }
    };

    return () => {
      cancelled = true;
      clearTimeout(timer);
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

        if (status === 'ready' && imgRef.current) {
          ctx.drawImage(imgRef.current, 0, 0, c.width, c.height);
        } else if (status === 'fallback') {
          // Instant Procedural Character Card when external AI image is slow/blocked
          const hash = promptText.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          const hue = hash % 360;
          const grad = ctx.createRadialGradient(200, 170, 20, 200, 200, 220);
          grad.addColorStop(0, `hsl(${hue}, 65%, 28%)`);
          grad.addColorStop(1, '#090d16');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, c.width, c.height);

          // Procedural Head & Ears based on prompt hash
          ctx.fillStyle = `hsl(${(hue + 35) % 360}, 60%, 58%)`;
          ctx.beginPath();
          ctx.arc(135, 115, 28, 0, Math.PI * 2);
          ctx.arc(265, 115, 28, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.roundRect(125, 110, 150, 175, 65);
          ctx.fill();

          // Eyes
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(168, 180, 15, 0, Math.PI * 2); ctx.arc(232, 180, 15, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.beginPath(); ctx.arc(168, 180, 7, 0, Math.PI * 2); ctx.arc(232, 180, 7, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(promptText.toUpperCase().slice(0, 32), 200, 375);
        } else {
          ctx.fillStyle = '#818cf8';
          ctx.font = '14px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('Generating Custom Character...', c.width / 2, c.height / 2);
        }

        if (status !== 'loading') {
          const v = volRef.current;
          const cx = c.width / 2;
          const mouthY = c.height / 2 + 45 + offsetRef.current;
          const openAmt = Math.min(v * 42, 32);
          const mouthW = (femRef.current ? 24 : 28) - openAmt * 0.18;

          ctx.fillStyle = 'rgba(15, 10, 15, 0.72)';
          ctx.beginPath();
          ctx.ellipse(cx, mouthY + openAmt * 0.2, mouthW + 4, 8 + openAmt * 0.65, 0, 0, Math.PI * 2);
          ctx.fill();

          if (openAmt > 2) {
            ctx.fillStyle = '#2a040e';
            ctx.beginPath();
            ctx.ellipse(cx, mouthY + openAmt * 0.25, mouthW - 2, openAmt * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.ellipse(cx, mouthY - openAmt * 0.05, mouthW * 0.6, Math.min(openAmt * 0.25, 5), 0, 0, Math.PI);
            ctx.fill();
          }

          ctx.fillStyle = femRef.current ? '#e11d48' : '#9f4a4a';
          ctx.beginPath(); ctx.ellipse(cx, mouthY - 2 - openAmt * 0.2, mouthW, 3.5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = femRef.current ? '#fb7185' : '#b86565';
          ctx.beginPath(); ctx.ellipse(cx, mouthY + 3 + openAmt * 0.55, mouthW * 0.88, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [status, promptText, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="rounded-lg border border-slate-800 max-w-full h-auto shadow-2xl"
    />
  );
};
