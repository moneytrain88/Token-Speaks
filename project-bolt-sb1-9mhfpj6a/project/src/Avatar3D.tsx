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

          if (ch.hair === 'longWaves') {
            const hGrad = ctx.createLinearGradient(cx - 80, cy, cx + 80, cy + 160);
            hGrad.addColorStop(0, '#451a03');
            hGrad.addColorStop(1, '#090d16');
            ctx.fillStyle = hGrad;
            ctx.beginPath();
            ctx.roundRect(cx - 84, cy - 65, 168, 195, 55);
            ctx.fill();
          }

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

          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.beginPath();
          ctx.moveTo(cx, cy - 16); ctx.lineTo(cx - 9, cy + 14); ctx.lineTo(cx + 9, cy + 14);
          ctx.closePath(); ctx.fill();

                   // 7. Slim, Refined 3D Lips, Teeth & Tongue
          const openAmt = Math.min(v * 44, 34);
          const mouthW = 28 - openAmt * 0.2;
          const mouthY = cy + 36 + jawDrop * 0.4;
          const upperPeakY = mouthY - 2.5 - openAmt * 0.35;
          const lowerLipY = mouthY + 2.5 + openAmt * 0.75;

          // Inner Oral Cavity (Drawn first, wider contrast so speech reads clearly)
          if (openAmt > 1.2) {
            ctx.fillStyle = '#1f0209';
            ctx.beginPath();
            ctx.moveTo(cx - mouthW + 2, mouthY);
            ctx.quadraticCurveTo(cx, upperPeakY + 1, cx + mouthW - 2, mouthY);
            ctx.quadraticCurveTo(cx, lowerLipY - 1, cx - mouthW + 2, mouthY);
            ctx.fill();

            // Upper Teeth Row
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.moveTo(cx - mouthW * 0.7, mouthY - openAmt * 0.08);
            ctx.quadraticCurveTo(cx, upperPeakY + 2, cx + mouthW * 0.7, mouthY - openAmt * 0.08);
            ctx.lineTo(cx + mouthW * 0.62, mouthY + Math.min(openAmt * 0.28, 6.5));
            ctx.quadraticCurveTo(cx, mouthY + Math.min(openAmt * 0.32, 7.5), cx - mouthW * 0.62, mouthY + Math.min(openAmt * 0.28, 6.5));
            ctx.closePath();
            ctx.fill();

            // Tongue Cushion
            if (openAmt > 6) {
              ctx.fillStyle = '#be123c';
              ctx.beginPath();
              ctx.ellipse(cx, lowerLipY - 3.5, mouthW * 0.5, openAmt * 0.3, 0, Math.PI, 0);
              ctx.fill();
            }
          }

          // Slim Upper Lip with Subtle Cupid's Bow
          const lipBase = ch.lashes ? '#be123c' : '#9e5858';
          const lipHighlight = ch.lashes ? '#f43f5e' : '#bf7a7a';

          ctx.fillStyle = lipBase;
          ctx.beginPath();
          ctx.moveTo(cx - mouthW, mouthY);
          ctx.bezierCurveTo(cx - mouthW * 0.45, upperPeakY - 3.5, cx - 7, upperPeakY - 4, cx - 3.5, upperPeakY - 2);
          ctx.lineTo(cx, upperPeakY - 0.8);
          ctx.lineTo(cx + 3.5, upperPeakY - 2);
          ctx.bezierCurveTo(cx + 7, upperPeakY - 4, cx + mouthW * 0.45, upperPeakY - 3.5, cx + mouthW, mouthY);
          ctx.quadraticCurveTo(cx, mouthY - openAmt * 0.32, cx - mouthW, mouthY);
          ctx.fill();

          // Slim Lower Lip Cushion
          const lowerGrad = ctx.createLinearGradient(cx, mouthY, cx, lowerLipY + 6);
          lowerGrad.addColorStop(0, lipBase);
          lowerGrad.addColorStop(0.55, lipHighlight);
          lowerGrad.addColorStop(1, '#5e2626');

          ctx.fillStyle = lowerGrad;
          ctx.beginPath();
          ctx.moveTo(cx - mouthW, mouthY);
          ctx.quadraticCurveTo(cx, mouthY + openAmt * 0.68, cx + mouthW, mouthY);
          ctx.bezierCurveTo(cx + mouthW * 0.65, lowerLipY + 6, cx - mouthW * 0.65, lowerLipY + 6, cx - mouthW, mouthY);
          ctx.fill();

          // Subtle Specular Highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.beginPath();
          ctx.ellipse(cx, lowerLipY + 1, mouthW * 0.38, 1.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Soft Chin Crease
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, lowerLipY + 9, 12, 0.2 * Math.PI, 0.8 * Math.PI);
          ctx.stroke();



          if (ch.hair === 'cowboyHat') {
            ctx.fillStyle = '#78350f';
            ctx.beginPath(); ctx.ellipse(cx, cy - 70, 115, 22, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.roundRect(cx - 55, cy - 125, 110, 60, 20); ctx.fill();
          } else if (ch.hair === 'beanie') {
            ctx.fillStyle = '#dc2626';
            ctx.beginPath(); ctx.arc(cx, cy - 55, 68, Math.PI, 0); ctx.fill();
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
