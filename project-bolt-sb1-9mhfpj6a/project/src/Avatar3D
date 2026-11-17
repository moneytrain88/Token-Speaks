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

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    angleRef.current += 0.04;
    const swayX = Math.sin(angleRef.current) * 6 + vol * 4;
    const tiltY = Math.cos(angleRef.current * 0.8) * 4 - vol * 6;

    // 1. Studio 3D Backdrop
    if (char.bg === 'greenscreen') {
      ctx.fillStyle = '#00b140';
      ctx.fillRect(0, 0, c.width, c.height);
    } else if (char.bg === 'neon') {
      const g = ctx.createRadialGradient(200, 180, 20, 200, 200, 260);
      g.addColorStop(0, '#312e81');
      g.addColorStop(1, '#090d16');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);
    } else if (char.bg === 'sunset') {
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

    // Back Hair in 3D
    if (char.hair === 'longWaves') {
      const hGrad = ctx.createLinearGradient(cx - 80, cy, cx + 80, cy + 160);
      hGrad.addColorStop(0, '#451a03');
      hGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = hGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 84, cy - 65, 168, 195, 55);
      ctx.fill();
    }

    // 2. 3D Shaded Shoulders & Neck
    const bodyGrad = ctx.createLinearGradient(cx - 110, cy + 80, cx + 110, cy + 200);
    bodyGrad.addColorStop(0, char.shirt);
    bodyGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 150, 120, 68, 0, Math.PI, 0);
    ctx.fill();

    const neckGrad = ctx.createLinearGradient(cx - 28, cy + 60, cx + 28, cy + 60);
    neckGrad.addColorStop(0, '#090d16');
    neckGrad.addColorStop(0.45, char.skin);
    neckGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = neckGrad;
    ctx.fillRect(cx - 26, cy + 60, 52, 50);

    // 3. 3D Species Ears
    if (char.species === 'cat') {
      ctx.fillStyle = char.skin;
      ctx.beginPath();
      ctx.moveTo(cx - 65, cy - 35); ctx.lineTo(cx - 75, cy - 115); ctx.lineTo(cx - 20, cy - 75);
      ctx.moveTo(cx + 65, cy - 35); ctx.lineTo(cx + 75, cy - 115); ctx.lineTo(cx + 20, cy - 75);
      ctx.fill();
    } else if (char.species === 'bear') {
      ctx.fillStyle = char.skin;
      ctx.beginPath();
      ctx.arc(cx - 58, cy - 75, 26, 0, Math.PI * 2);
      ctx.arc(cx + 58, cy - 75, 26, 0, Math.PI * 2);
      ctx.fill();
    } else if (char.species === 'robot') {
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(cx, cy - 85); ctx.lineTo(cx, cy - 122); ctx.stroke();
      ctx.fillStyle = vol > 0.15 ? '#22d3ee' : '#f43f5e';
      ctx.beginPath(); ctx.arc(cx, cy - 126, 10 + vol * 6, 0, Math.PI * 2); ctx.fill();
    } else if (char.species === 'alien') {
      ctx.strokeStyle = char.skin; ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 80); ctx.lineTo(cx - 55, cy - 120);
      ctx.moveTo(cx + 30, cy - 80); ctx.lineTo(cx + 55, cy - 120);
      ctx.stroke();
    }
    // 4. 3D Sculpted Cranium & Articulated Jaw
    const jawDrop = vol * 16;
    const headGrad = ctx.createRadialGradient(cx - 22, cy - 35, 15, cx, cy, 118);
    headGrad.addColorStop(0, '#ffffff');
    headGrad.addColorStop(0.16, char.skin);
    headGrad.addColorStop(0.84, char.skin);
    headGrad.addColorStop(1, '#090d16');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    if (char.species === 'robot') {
      ctx.roundRect(cx - 72, cy - 85, 144, 155 + jawDrop * 0.5, 18);
    } else {
      ctx.moveTo(cx - 68, cy - 30);
      ctx.bezierCurveTo(cx - 72, cy - 105, cx + 72, cy - 105, cx + 68, cy - 30);
      ctx.bezierCurveTo(cx + 66, cy + 35, cx + 42, cy + 78 + jawDrop, cx, cy + 84 + jawDrop);
      ctx.bezierCurveTo(cx - 42, cy + 78 + jawDrop, cx - 66, cy + 35, cx - 68, cy - 30);
    }
    ctx.fill();

    // 5. 3D Eyes & Visors
    const eyeY = cy - 18;
    if (char.species === 'robot') {
      ctx.fillStyle = '#020617'; ctx.fillRect(cx - 52, eyeY - 14, 104, 28);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(cx - 40, eyeY - 6, 26, 12); ctx.fillRect(cx + 14, eyeY - 6, 26, 12);
    } else if (blink) {
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
        ctx.fillStyle = char.species === 'monster' ? '#dc2626' : '#0284c7';
        ctx.beginPath(); ctx.arc(cx + ox + swayX * 0.2, eyeY, 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#020617';
        ctx.beginPath(); ctx.arc(cx + ox + swayX * 0.2, eyeY, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(cx + ox - 2, eyeY - 2, 1.5, 0, Math.PI * 2); ctx.fill();
      });
    }

    // 6. Sculpted 3D Nose Bridge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16); ctx.lineTo(cx - 9, cy + 14); ctx.lineTo(cx + 9, cy + 14);
    ctx.closePath(); ctx.fill();

    // 7. 3D Articulated Lips & Mouth Cavity
    const mouthOpen = Math.max(3, vol * 34);
    const mouthY = cy + 38 + jawDrop * 0.45;
    ctx.fillStyle = '#4c0519';
    ctx.beginPath(); ctx.ellipse(cx, mouthY, 24, mouthOpen, 0, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = char.lashes ? '#e11d48' : 'rgba(136, 19, 55, 0.75)';
    ctx.lineWidth = char.lashes ? 4.5 : 3;
    ctx.beginPath(); ctx.ellipse(cx, mouthY, 25, mouthOpen + 1.5, 0, 0, Math.PI * 2); ctx.stroke();

    // 8. 3D Hats & Front Hair
    if (char.hair === 'cowboyHat') {
      ctx.fillStyle = '#78350f';
      ctx.beginPath(); ctx.ellipse(cx, cy - 70, 115, 22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx - 55, cy - 125, 110, 60, 20); ctx.fill();
    } else if (char.hair === 'beanie') {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(cx, cy - 55, 68, Math.PI, 0); ctx.fill();
    }

    // 9. Studio HUD Overlay
    if (char.bg !== 'greenscreen') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(12, c.height - 38, c.width - 24, 26);
      ctx.fillStyle = '#818cf8';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`3D RIG • ${char.name} (${char.accent})`, cx, c.height - 21);
    }
  }, [vol, char, blink, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="rounded-lg border border-slate-800 max-w-full h-auto shadow-2xl"
    />
  );
};
