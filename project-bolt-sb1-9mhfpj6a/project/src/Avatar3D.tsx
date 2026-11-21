import React, { useRef, useEffect } from 'react';
import { Traits } from './CharacterRenderer';

interface Avatar3DProps {
  vol: number;
  char: Traits;
  blink: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({ vol, char, blink, canvasRef }) => {
  const angleRef = useRef(0);
  const volRef = useRef(vol);
  const blinkRef = useRef(blink);
  const charRef = useRef(char);

  useEffect(() => { volRef.current = vol; }, [vol]);
  useEffect(() => { blinkRef.current = blink; }, [blink]);
  useEffect(() => { charRef.current = char; }, [char]);

  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      const c = canvasRef.current;
      if (c) {
        const ctx = c.getContext('2d');
        if (ctx) {
          const v = volRef.current;
          const b = blinkRef.current;
          const ch = charRef.current;

          angleRef.current += 0.035;
          const swayX = Math.sin(angleRef.current) * 6 + v * 4;
          const tiltY = Math.cos(angleRef.current * 0.8) * 4 - v * 6;

          if (ch.bg === 'greenscreen') {
            ctx.fillStyle = '#00b140';
            ctx.fillRect(0, 0, c.width, c.height);
          } else if (ch.bg === 'neon') {
            const g = ctx.createRadialGradient(200, 180, 20, 200, 200, 260);
            g.addColorStop(0, '#312e81');
            g.addColorStop(1, '#090d16');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, c.width, c.height);
          } else if (ch.bg === 'sunset') {
            const g = ctx.createLinearGradient(0, 0, 0, c.height);
            g.addColorStop(0, '#451a03');
            g.addColorStop(1, '#1c1917');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, c.width, c.height);
          } else {
            const g = ctx.createRadialGradient(200, 160, 30, 200, 200, 250);
            g.addColorStop(0, '#1e293b');
            g.addColorStop(1, '#05080f');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, c.width, c.height);
          }

          const cx = c.width / 2 + swayX;
          const cy = c.height / 2 + 10 + tiltY;

          // Back Hair Layer (Long Waves & Ponytail)
          const hairGrad = ctx.createLinearGradient(cx - 80, cy - 100, cx + 80, cy + 160);
          hairGrad.addColorStop(0, '#451a03');
          hairGrad.addColorStop(0.5, '#291002');
          hairGrad.addColorStop(1, '#090d16');

          if (ch.hair === 'longWaves') {
            ctx.fillStyle = hairGrad;
            ctx.beginPath();
            ctx.roundRect(cx - 84, cy - 65, 168, 195, 55);
            ctx.fill();
          } else if (ch.hair === 'ponytail') {
            ctx.fillStyle = hairGrad;
            ctx.beginPath();
            ctx.ellipse(cx + 58, cy - 55, 26, 65, 0.35, 0, Math.PI * 2);
            ctx.fill();
          }

          // Shoulders & Neck
          const bodyGrad = ctx.createLinearGradient(cx - 110, cy + 80, cx + 110, cy + 200);
          bodyGrad.addColorStop(0, ch.shirt);
          bodyGrad.addColorStop(1, '#020617');
          ctx.fillStyle = bodyGrad;
          ctx.beginPath();
          ctx.ellipse(cx, cy + 150, 120, 68, 0, Math.PI, 0);
          ctx.fill();

          const neckGrad = ctx.createLinearGradient(cx - 28, cy + 60, cx + 28, cy + 60);
          neckGrad.addColorStop(0, '#090d16');
          neckGrad.addColorStop(0.45, ch.skin);
          neckGrad.addColorStop(1, '#090d16');
          ctx.fillStyle = neckGrad;
          ctx.fillRect(cx - 26, cy + 60, 52, 50);

          // Species Ears
          if (ch.species === 'cat') {
            ctx.fillStyle = ch.skin;
            ctx.beginPath();
            ctx.moveTo(cx - 65, cy - 35); ctx.lineTo(cx - 75, cy - 115); ctx.lineTo(cx - 20, cy - 75);
            ctx.moveTo(cx + 65, cy - 35); ctx.lineTo(cx + 75, cy - 115); ctx.lineTo(cx + 20, cy - 75);
            ctx.fill();
          } else if (ch.species === 'bear') {
            ctx.fillStyle = ch.skin;
            ctx.beginPath();
            ctx.arc(cx - 58, cy - 75, 26, 0, Math.PI * 2);
            ctx.arc(cx + 58, cy - 75, 26, 0, Math.PI * 2);
            ctx.fill();
          } else if (ch.species === 'robot') {
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(cx, cy - 85); ctx.lineTo(cx, cy - 122); ctx.stroke();
            ctx.fillStyle = v > 0.15 ? '#22d3ee' : '#f43f5e';
            ctx.beginPath(); ctx.arc(cx, cy - 126, 10 + v * 6, 0, Math.PI * 2); ctx.fill();
          } else if (ch.species === 'alien') {
            ctx.strokeStyle = ch.skin; ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(cx - 30, cy - 80); ctx.lineTo(cx - 55, cy - 120);
            ctx.moveTo(cx + 30, cy - 80); ctx.lineTo(cx + 55, cy - 120);
            ctx.stroke();
          }

          // 3D Sculpted Cranium & Jaw
          const jawDrop = v * 16;
          const headGrad = ctx.createRadialGradient(cx - 22, cy - 35, 15, cx, cy, 118);
          headGrad.addColorStop(0, '#ffffff');
          headGrad.addColorStop(0.16, ch.skin);
          headGrad.addColorStop(0.84, ch.skin);
          headGrad.addColorStop(1, '#090d16');

          ctx.fillStyle = headGrad;
          ctx.beginPath();
          if (ch.species === 'robot') {
            ctx.roundRect(cx - 72, cy - 85, 144, 155 + jawDrop * 0.5, 18);
          } else {
            ctx.moveTo(cx - 68, cy - 30);
            ctx.bezierCurveTo(cx - 72, cy - 105, cx + 72, cy - 105, cx + 68, cy - 30);
            ctx.bezierCurveTo(cx + 66, cy + 35, cx + 42, cy + 78 + jawDrop, cx, cy + 84 + jawDrop);
            ctx.bezierCurveTo(cx - 42, cy + 78 + jawDrop, cx - 66, cy + 35, cx - 68, cy - 30);
          }
          ctx.fill();
          const eyeY = cy - 18;
          // 3D Eyelashes
          if (ch.lashes && !b && ch.species !== 'robot') {
            ctx.strokeStyle = '#090d16'; ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.moveTo(cx - 43, eyeY - 5); ctx.lineTo(cx - 51, eyeY - 11);
            ctx.moveTo(cx + 43, eyeY - 5); ctx.lineTo(cx + 51, eyeY - 11);
            ctx.stroke();
          }

          if (ch.species === 'robot') {
            ctx.fillStyle = '#020617'; ctx.fillRect(cx - 52, eyeY - 14, 104, 28);
            ctx.fillStyle = '#22d3ee';
            ctx.fillRect(cx - 40, eyeY - 6, 26, 12); ctx.fillRect(cx + 14, eyeY - 6, 26, 12);
          } else if (b) {
            ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(cx - 42, eyeY); ctx.lineTo(cx - 18, eyeY);
            ctx.moveTo(cx + 18, eyeY); ctx.lineTo(cx + 42, eyeY);
            ctx.stroke();
          } else {
            [-30, 30].forEach((ox) => {
              ctx.fillStyle = 'rgba(0,0,0,0.28)';
              ctx.beginPath(); ctx.ellipse(cx + ox, eyeY, 17, 11, 0, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#f8fafc';
              ctx.beginPath(); ctx.ellipse(cx + ox, eyeY, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = ch.species === 'monster' ? '#dc2626' : '#0284c7';
              ctx.beginPath(); ctx.arc(cx + ox + swayX * 0.2, eyeY, 5.5, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#020617';
              ctx.beginPath(); ctx.arc(cx + ox + swayX * 0.2, eyeY, 2.5, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.beginPath(); ctx.arc(cx + ox - 2, eyeY - 2, 1.5, 0, Math.PI * 2); ctx.fill();
            });
          }

          // Sculpted 3D Nose
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.beginPath();
          ctx.moveTo(cx, cy - 16); ctx.lineTo(cx - 9, cy + 14); ctx.lineTo(cx + 9, cy + 14);
          ctx.closePath(); ctx.fill();

          // 3D Sculpted Facial Hair (Tracks Jaw Drop)
          if (ch.beard && ch.beard !== 'none') {
            const beardGrad = ctx.createLinearGradient(cx - 60, cy + 15, cx + 60, cy + 85 + jawDrop);
            beardGrad.addColorStop(0, '#0f172a');
            beardGrad.addColorStop(0.5, '#292524');
            beardGrad.addColorStop(1, '#090d16');

            if (ch.beard === 'stubble') {
              ctx.fillStyle = 'rgba(20, 20, 25, 0.24)';
              ctx.beginPath(); ctx.arc(cx, cy + 22 + jawDrop * 0.4, 62, 0.08 * Math.PI, 0.92 * Math.PI); ctx.fill();
            } else if (ch.beard === 'full') {
              ctx.fillStyle = beardGrad;
              ctx.beginPath();
              ctx.moveTo(cx - 65, cy + 10);
              ctx.bezierCurveTo(cx - 66, cy + 68 + jawDrop, cx - 34, cy + 82 + jawDrop, cx, cy + 85 + jawDrop);
              ctx.bezierCurveTo(cx + 34, cy + 82 + jawDrop, cx + 66, cy + 68 + jawDrop, cx + 65, cy + 10);
              ctx.quadraticCurveTo(cx + 36, cy + 30, cx + 25, cy + 24);
              ctx.quadraticCurveTo(cx, cy + 15, cx - 25, cy + 24);
              ctx.quadraticCurveTo(cx - 36, cy + 30, cx - 65, cy + 10);
              ctx.fill();
            } else if (ch.beard === 'goatee') {
              ctx.fillStyle = beardGrad;
              ctx.beginPath(); ctx.ellipse(cx, cy + 54 + jawDrop * 0.85, 22, 16, 0, 0, Math.PI * 2); ctx.fill();
              ctx.beginPath(); ctx.ellipse(cx - 14, cy + 24, 15, 5, -0.18, 0, Math.PI * 2); ctx.ellipse(cx + 14, cy + 24, 15, 5, 0.18, 0, Math.PI * 2); ctx.fill();
            } else if (ch.beard === 'mustache') {
              ctx.fillStyle = beardGrad;
              ctx.beginPath();
              ctx.moveTo(cx, cy + 21);
              ctx.bezierCurveTo(cx - 12, cy + 16, cx - 28, cy + 20, cx - 34, cy + 28);
              ctx.bezierCurveTo(cx - 24, cy + 30, cx - 10, cy + 27, cx, cy + 25);
              ctx.bezierCurveTo(cx + 10, cy + 27, cx + 24, cy + 30, cx + 34, cy + 28);
              ctx.bezierCurveTo(cx + 28, cy + 20, cx + 12, cy + 16, cx, cy + 21);
              ctx.fill();
            }
          }

          // Gender-Aware 3D Lips, Teeth & Tongue
          const isFemLook = Boolean(ch.lashes);
          const openAmt = Math.min(v * 44, 34);
          const mouthW = (isFemLook ? 27 : 31) - openAmt * 0.2;
          const mouthY = cy + 36 + jawDrop * 0.4;
          const upperPeakY = mouthY - (isFemLook ? 2.5 : 1.5) - openAmt * 0.35;
          const lowerLipY = mouthY + (isFemLook ? 2.5 : 1.8) + openAmt * 0.75;

          if (openAmt > 1.2) {
            ctx.fillStyle = '#1f0209';
            ctx.beginPath();
            ctx.moveTo(cx - mouthW + 2, mouthY);
            ctx.quadraticCurveTo(cx, upperPeakY + 1, cx + mouthW - 2, mouthY);
            ctx.quadraticCurveTo(cx, lowerLipY - 1, cx - mouthW + 2, mouthY);
            ctx.fill();

            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.ellipse(cx, mouthY + 1, mouthW * 0.55, Math.min(openAmt * 0.25, 5.5), 0, 0, Math.PI);
            ctx.fill();
          }

          if (isFemLook) {
            ctx.fillStyle = '#be123c';
            ctx.beginPath();
            ctx.moveTo(cx - mouthW, mouthY);
            ctx.bezierCurveTo(cx - mouthW * 0.45, upperPeakY - 3.5, cx - 7, upperPeakY - 4, cx - 3.5, upperPeakY - 2);
            ctx.lineTo(cx, upperPeakY - 0.8);
            ctx.lineTo(cx + 3.5, upperPeakY - 2);
            ctx.bezierCurveTo(cx + 7, upperPeakY - 4, cx + mouthW * 0.45, upperPeakY - 3.5, cx + mouthW, mouthY);
            ctx.quadraticCurveTo(cx, mouthY - openAmt * 0.32, cx - mouthW, mouthY);
            ctx.fill();

            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.moveTo(cx - mouthW, mouthY);
            ctx.quadraticCurveTo(cx, mouthY + openAmt * 0.68, cx + mouthW, mouthY);
            ctx.bezierCurveTo(cx + mouthW * 0.65, lowerLipY + 6, cx - mouthW * 0.65, lowerLipY + 6, cx - mouthW, mouthY);
            ctx.fill();
          } else {
            ctx.fillStyle = 'rgba(85, 40, 35, 0.42)';
            ctx.beginPath();
            ctx.moveTo(cx - mouthW, mouthY);
            ctx.quadraticCurveTo(cx, upperPeakY - 2.2, cx + mouthW, mouthY);
            ctx.quadraticCurveTo(cx, mouthY - openAmt * 0.32, cx - mouthW, mouthY);
            ctx.fill();

            ctx.fillStyle = 'rgba(110, 55, 48, 0.32)';
            ctx.beginPath();
            ctx.moveTo(cx - mouthW * 0.85, mouthY);
            ctx.quadraticCurveTo(cx, mouthY + openAmt * 0.68, cx + mouthW * 0.85, mouthY);
            ctx.quadraticCurveTo(cx, lowerLipY + 4.5, cx - mouthW * 0.85, mouthY);
            ctx.fill();
          }

          // 3D Front Hair & Hats
          ctx.fillStyle = '#291002';
          if (ch.hair === 'spiky') {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(cx - 65, cy - 45); ctx.lineTo(cx - 50, cy - 110); ctx.lineTo(cx - 20, cy - 85);
            ctx.lineTo(cx, cy - 120); ctx.lineTo(cx + 25, cy - 85); ctx.lineTo(cx + 55, cy - 110);
            ctx.lineTo(cx + 65, cy - 45); ctx.fill();
          } else if (ch.hair === 'cowboyHat') {
            ctx.fillStyle = '#78350f';
            ctx.beginPath(); ctx.ellipse(cx, cy - 70, 115, 22, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.roundRect(cx - 55, cy - 125, 110, 60, 20); ctx.fill();
          } else if (ch.hair === 'beanie') {
            ctx.fillStyle = '#dc2626';
            ctx.beginPath(); ctx.arc(cx, cy - 55, 68, Math.PI, 0); ctx.fill();
          } else if (ch.hair === 'bob' || ch.hair === 'longWaves') {
            ctx.beginPath(); ctx.arc(cx, cy - 42, 72, Math.PI, 0);
            ctx.fillRect(cx - 72, cy - 42, 18, 75); ctx.fillRect(cx + 54, cy - 42, 18, 75); ctx.fill();
          } else if (ch.hair === 'ponytail') {
            ctx.beginPath(); ctx.arc(cx, cy - 45, 70, Math.PI, 0); ctx.fill();
          } else if (ch.hair === 'buns') {
            ctx.beginPath(); ctx.arc(cx - 56, cy - 82, 26, 0, Math.PI * 2); ctx.arc(cx + 56, cy - 82, 26, 0, Math.PI * 2); ctx.arc(cx, cy - 45, 70, Math.PI, 0); ctx.fill();
          }

          // 3D Eyewear
          if (ch.acc === 'glasses') {
            ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 4;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
            ctx.fillRect(cx - 50, eyeY - 16, 40, 32); ctx.strokeRect(cx - 50, eyeY - 16, 40, 32);
            ctx.fillRect(cx + 10, eyeY - 16, 40, 32); ctx.strokeRect(cx + 10, eyeY - 16, 40, 32);
            ctx.beginPath(); ctx.moveTo(cx - 10, eyeY); ctx.lineTo(cx + 10, eyeY); ctx.stroke();
          } else if (ch.acc === 'sunglasses') {
            ctx.fillStyle = '#020617';
            ctx.fillRect(cx - 52, eyeY - 16, 44, 30); ctx.fillRect(cx + 8, eyeY - 16, 44, 30);
            ctx.fillRect(cx - 10, eyeY - 6, 20, 6);
          } else if (ch.acc === 'monocle') {
            ctx.strokeStyle = '#eab308'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(cx + 30, eyeY, 18, 0, Math.PI * 2); ctx.stroke();
          }

          if (ch.bg !== 'greenscreen') {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
            ctx.fillRect(12, c.height - 38, c.width - 24, 26);
            ctx.fillStyle = '#818cf8';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`3D RIG • ${ch.name} (${ch.accent})`, cx, c.height - 21);
          }
        }
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
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
