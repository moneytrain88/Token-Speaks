export interface Traits {
  name: string;
  accent: string;
  species: 'human' | 'cat' | 'robot' | 'alien' | 'bear' | 'monster';
  skin: string;
  shirt: string;
  hair: 'none' | 'spiky' | 'bob' | 'cowboyHat' | 'beanie' | 'longWaves' | 'ponytail' | 'buns';
  acc: 'none' | 'glasses' | 'sunglasses' | 'monocle';
  beard: 'none' | 'stubble' | 'goatee' | 'full' | 'mustache';
  bg: 'dark' | 'neon' | 'sunset' | 'greenscreen';
  lashes?: boolean;
}

export function draw2DCharacter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  char: Traits,
  vol: number,
  blink: boolean
) {
  if (char.bg === 'greenscreen') {
    ctx.fillStyle = '#00b140';
    ctx.fillRect(0, 0, w, h);
  } else if (char.bg === 'neon') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#4c1d95');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (char.bg === 'sunset') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#451a03');
    grad.addColorStop(1, '#9a3412');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);
  }

  const cx = w / 2;
  const cy = h / 2 + 10;

  if (char.hair === 'longWaves') {
    ctx.fillStyle = '#3b1d0e';
    ctx.beginPath();
    ctx.roundRect(cx - 82, cy - 65, 164, 195, 55);
    ctx.fill();
  } else if (char.hair === 'ponytail') {
    ctx.fillStyle = '#3b1d0e';
    ctx.beginPath();
    ctx.ellipse(cx + 58, cy - 55, 26, 65, 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = char.shirt;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 145, 115, 65, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = char.skin;
  ctx.fillRect(cx - 22, cy + 65, 44, 42);

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
  } else if (char.species === 'human') {
    ctx.fillStyle = char.skin;
    ctx.beginPath();
    ctx.arc(cx - 66, cy - 5, 14, 0, Math.PI * 2);
    ctx.arc(cx + 66, cy - 5, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = char.skin;
  ctx.beginPath();
  if (char.species === 'robot') ctx.roundRect(cx - 72, cy - 85, 144, 155, 16);
  else if (char.species === 'alien') ctx.ellipse(cx, cy - 12, 74, 86, 0, 0, Math.PI * 2);
  else if (char.species === 'monster') ctx.roundRect(cx - 68, cy - 85, 136, 150, 35);
  else ctx.roundRect(cx - 65, cy - 85, 130, 160, 55);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.stroke();
  if (char.species === 'cat' || char.species === 'bear') {
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.ellipse(cx, cy + 28, 38, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.moveTo(cx - 10, cy + 8); ctx.lineTo(cx + 10, cy + 8); ctx.lineTo(cx, cy + 20); ctx.fill();
  }

  const eyeY = cy - 18;
  if (char.lashes && !blink) {
    ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 42, eyeY - 6); ctx.lineTo(cx - 50, eyeY - 12);
    ctx.moveTo(cx + 42, eyeY - 6); ctx.lineTo(cx + 50, eyeY - 12);
    ctx.stroke();
  }

  if (blink) {
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 42, eyeY); ctx.lineTo(cx - 18, eyeY);
    ctx.moveTo(cx + 18, eyeY); ctx.lineTo(cx + 42, eyeY);
    ctx.stroke();
  } else if (char.species === 'robot') {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(cx - 52, eyeY - 14, 104, 28);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(cx - 40, eyeY - 7, 26, 14); ctx.fillRect(cx + 14, eyeY - 7, 26, 14);
  } else if (char.species === 'alien') {
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.ellipse(cx - 32, eyeY, 16, 24, -0.25, 0, Math.PI * 2);
    ctx.ellipse(cx + 32, eyeY, 16, 24, 0.25, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx - 30, eyeY, 13, 0, Math.PI * 2); ctx.arc(cx + 30, eyeY, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = char.species === 'monster' ? '#dc2626' : '#0f172a';
    ctx.beginPath(); ctx.arc(cx - 30, eyeY, 6, 0, Math.PI * 2); ctx.arc(cx + 30, eyeY, 6, 0, Math.PI * 2); ctx.fill();
  }

  const lift = Math.min(vol * 14, 12);
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = char.lashes ? 3.5 : 5;
  ctx.beginPath();
  ctx.moveTo(cx - 45, eyeY - 22 - lift); ctx.lineTo(cx - 15, eyeY - 25 - lift);
  ctx.moveTo(cx + 15, eyeY - 25 - lift); ctx.lineTo(cx + 45, eyeY - 22 - lift);
  ctx.stroke();

  const mH = Math.max(2, vol * 38);
  const jawFlex = Math.min(mH * 0.45, 14);
  ctx.fillStyle = '#1e293b';

  if (char.beard === 'stubble') {
    ctx.fillStyle = 'rgba(30, 41, 59, 0.22)';
    ctx.beginPath(); ctx.arc(cx, cy + 20 + jawFlex * 0.4, 62, 0.08 * Math.PI, 0.92 * Math.PI); ctx.fill();
  } else if (char.beard === 'full') {
    ctx.beginPath();
    ctx.moveTo(cx - 64, cy + 12);
    ctx.bezierCurveTo(cx - 66, cy + 68 + jawFlex, cx - 32, cy + 82 + jawFlex, cx, cy + 84 + jawFlex);
    ctx.bezierCurveTo(cx + 32, cy + 82 + jawFlex, cx + 66, cy + 68 + jawFlex, cx + 64, cy + 12);
    ctx.quadraticCurveTo(cx + 38, cy + 32, cx + 26, cy + 26);
    ctx.quadraticCurveTo(cx, cy + 16, cx - 26, cy + 26);
    ctx.quadraticCurveTo(cx - 38, cy + 32, cx - 64, cy + 12);
    ctx.fill();
  } else if (char.beard === 'goatee') {
    ctx.beginPath(); ctx.ellipse(cx, cy + 54 + jawFlex * 0.8, 22, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx - 14, cy + 24, 15, 5, -0.18, 0, Math.PI * 2); ctx.ellipse(cx + 14, cy + 24, 15, 5, 0.18, 0, Math.PI * 2); ctx.fill();
  } else if (char.beard === 'mustache') {
    ctx.beginPath();
    ctx.moveTo(cx, cy + 21);
    ctx.bezierCurveTo(cx - 12, cy + 16, cx - 28, cy + 20, cx - 34, cy + 28);
    ctx.bezierCurveTo(cx - 24, cy + 30, cx - 10, cy + 27, cx, cy + 25);
    ctx.bezierCurveTo(cx + 10, cy + 27, cx + 24, cy + 30, cx + 34, cy + 28);
    ctx.bezierCurveTo(cx + 28, cy + 20, cx + 12, cy + 16, cx, cy + 21);
    ctx.fill();
  }

  if (char.species === 'robot') {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(cx - 32, cy + 26, 64, 24);
    ctx.fillStyle = '#38bdf8';
    for (let i = 0; i < 5; i++) {
      const barH = Math.max(4, vol * 22 * (i % 2 === 0 ? 1 : 0.7));
      ctx.fillRect(cx - 26 + i * 11, cy + 38 - barH / 2, 7, barH);
    }
  } else {
    const isFem2D = Boolean(char.lashes);
    const openAmt = Math.min(mH, 32);
    const mouthW = (isFem2D ? 25 : 29) - openAmt * 0.18;
    const mouthY = cy + 36;
    const upperPeakY = mouthY - (isFem2D ? 2.5 : 1.5) - openAmt * 0.32;
    const lowerLipY = mouthY + (isFem2D ? 2.5 : 1.8) + openAmt * 0.72;

    if (openAmt > 2.5) {
      ctx.fillStyle = '#4c0519';
      ctx.beginPath();
      ctx.moveTo(cx - mouthW + 2, mouthY);
      ctx.quadraticCurveTo(cx, upperPeakY + 1, cx + mouthW - 2, mouthY);
      ctx.quadraticCurveTo(cx, lowerLipY - 1, cx - mouthW + 2, mouthY);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, mouthY + 1, mouthW * 0.55, Math.min(openAmt * 0.25, 5), 0, 0, Math.PI);
      ctx.fill();
    }

    ctx.fillStyle = isFem2D ? '#e11d48' : 'rgba(100, 45, 40, 0.45)';
    ctx.beginPath();
    ctx.moveTo(cx - mouthW, mouthY);
    ctx.quadraticCurveTo(cx, upperPeakY - 2.5, cx + mouthW, mouthY);
    ctx.quadraticCurveTo(cx, mouthY - openAmt * 0.3, cx - mouthW, mouthY);
    ctx.fill();

    ctx.fillStyle = isFem2D ? '#fb7185' : 'rgba(130, 60, 52, 0.35)';
    ctx.beginPath();
    ctx.moveTo(cx - mouthW * 0.85, mouthY);
    ctx.quadraticCurveTo(cx, mouthY + openAmt * 0.65, cx + mouthW * 0.85, mouthY);
    ctx.quadraticCurveTo(cx, lowerLipY + 4.5, cx - mouthW * 0.85, mouthY);
    ctx.fill();
  }

  ctx.fillStyle = '#3b1d0e';
  if (char.hair === 'spiky') {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(cx - 65, cy - 45); ctx.lineTo(cx - 50, cy - 110); ctx.lineTo(cx - 20, cy - 85);
    ctx.lineTo(cx, cy - 120); ctx.lineTo(cx + 25, cy - 85); ctx.lineTo(cx + 55, cy - 110); ctx.lineTo(cx + 65, cy - 45); ctx.fill();
  } else if (char.hair === 'cowboyHat') {
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.ellipse(cx, cy - 70, 115, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(cx - 55, cy - 125, 110, 60, 20); ctx.fill();
  } else if (char.hair === 'beanie') {
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(cx, cy - 55, 68, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#991b1b'; ctx.fillRect(cx - 70, cy - 65, 140, 18);
  } else if (char.hair === 'bob' || char.hair === 'longWaves') {
    ctx.beginPath(); ctx.arc(cx, cy - 42, 72, Math.PI, 0);
    ctx.fillRect(cx - 72, cy - 42, 18, 75); ctx.fillRect(cx + 54, cy - 42, 18, 75); ctx.fill();
  } else if (char.hair === 'ponytail') {
    ctx.beginPath(); ctx.arc(cx, cy - 45, 70, Math.PI, 0); ctx.fill();
  } else if (char.hair === 'buns') {
    ctx.beginPath(); ctx.arc(cx - 56, cy - 82, 26, 0, Math.PI * 2); ctx.arc(cx + 56, cy - 82, 26, 0, Math.PI * 2); ctx.arc(cx, cy - 45, 70, Math.PI, 0); ctx.fill();
  }

  if (char.acc === 'glasses') {
    ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 4;
    ctx.strokeRect(cx - 50, eyeY - 16, 40, 32); ctx.strokeRect(cx + 10, eyeY - 16, 40, 32);
    ctx.beginPath(); ctx.moveTo(cx - 10, eyeY); ctx.lineTo(cx + 10, eyeY); ctx.stroke();
  } else if (char.acc === 'sunglasses') {
    ctx.fillStyle = '#020617';
    ctx.fillRect(cx - 52, eyeY - 16, 44, 30); ctx.fillRect(cx + 8, eyeY - 16, 44, 30); ctx.fillRect(cx - 10, eyeY - 6, 20, 6);
  } else if (char.acc === 'monocle') {
    ctx.strokeStyle = '#eab308'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx + 30, eyeY, 18, 0, Math.PI * 2); ctx.stroke();
  }

  if (char.bg !== 'greenscreen') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(12, h - 38, w - 24, 26);
    ctx.fillStyle = '#a5b4fc';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${char.name} • ${char.accent}`, cx, h - 21);
  }
}
