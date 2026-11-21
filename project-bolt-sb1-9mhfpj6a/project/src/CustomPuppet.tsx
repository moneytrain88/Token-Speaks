import React, { useEffect, useRef } from 'react';
import { drawProceduralCharacter } from './smartArtEngine';

interface CustomPuppetProps {
  imageUrl: string;
  promptText: string;
  vol: number;
  mouthYOffset: number;
  isFem: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const CustomPuppet: React.FC<CustomPuppetProps> = ({
  promptText,
  vol,
  mouthYOffset,
  isFem,
  canvasRef,
}) => {
  const volRef = useRef(vol);
  const offsetRef = useRef(mouthYOffset);
  const femRef = useRef(isFem);
  const promptRef = useRef(promptText);

  useEffect(() => { volRef.current = vol; }, [vol]);
  useEffect(() => { offsetRef.current = mouthYOffset; }, [mouthYOffset]);
  useEffect(() => { femRef.current = isFem; }, [isFem]);
  useEffect(() => { promptRef.current = promptText; }, [promptText]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (c && ctx) {
        const v = volRef.current;
        drawProceduralCharacter(ctx, c.width, c.height, promptRef.current || 'Custom Creature', v);

        const cx = c.width / 2;
        const mouthY = c.height / 2 + 45 + offsetRef.current;
        const openAmt = Math.min(v * 42, 32);
        const mouthW = (femRef.current ? 24 : 28) - openAmt * 0.18;

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
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="rounded-lg border border-slate-800 max-w-full h-auto shadow-2xl"
    />
  );
};
