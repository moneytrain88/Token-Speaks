export function drawProceduralCharacter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  prompt: string,
  vol: number
) {
  const p = prompt.toLowerCase();
  const cx = w / 2;
  const cy = h / 2 + 10;

  // 1. Detect Color from Prompt (or hash a vibrant default)
  const hash = p.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  let mainColor = `hsl(${hash % 360}, 62%, 52%)`;
  if (p.includes('red') || p.includes('crimson')) mainColor = '#dc2626';
  else if (p.includes('blue') || p.includes('ocean')) mainColor = '#2563eb';
  else if (p.includes('green') || p.includes('lime') || p.includes('emerald')) mainColor = '#16a34a';
  else if (p.includes('gold') || p.includes('yellow')) mainColor = '#eab308';
  else if (p.includes('purple') || p.includes('violet')) mainColor = '#9333ea';
  else if (p.includes('pink') || p.includes('flamingo')) mainColor = '#ec4899';
  else if (p.includes('orange') || p.includes('fox') || p.includes('tiger')) mainColor = '#ea580c';
  else if (p.includes('black') || p.includes('shadow') || p.includes('ninja')) mainColor = '#334155';
  else if (p.includes('white') || p.includes('snow') || p.includes('skeleton')) mainColor = '#e2e8f0';

  // 2. Studio Background
  const bgGrad = ctx.createRadialGradient(cx, cy - 20, 20, cx, cy, 240);
  bgGrad.addColorStop(0, '#1e1b4b');
  bgGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Shoulders
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 150, 115, 65, 0, Math.PI, 0);
  ctx.fill();

  // 3. Animal / Creature Back Layer (Mane, Fins, Horns, Tall Ears)
  if (p.includes('lion')) {
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 108, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.includes('shark')) {
    // Dorsal Fin on Top
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - 82);
    ctx.quadraticCurveTo(cx + 12, cy - 145, cx + 28, cy - 80);
    ctx.fill();
  } else if (p.includes('dragon') || p.includes('dino') || p.includes('demon')) {
    // Curved Horns
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.moveTo(cx - 52, cy - 68); ctx.quadraticCurveTo(cx - 85, cy - 125, cx - 35, cy - 120); ctx.lineTo(cx - 32, cy - 75);
    ctx.moveTo(cx + 52, cy - 68); ctx.quadraticCurveTo(cx + 85, cy - 125, cx + 35, cy - 120); ctx.lineTo(cx + 32, cy - 75);
    ctx.fill();
  } else if (p.includes('bunny') || p.includes('rabbit')) {
    // Tall Rabbit Ears
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.ellipse(cx - 36, cy - 125, 16, 52, -0.15, 0, Math.PI * 2);
    ctx.ellipse(cx + 36, cy - 125, 16, 52, 0.15, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.includes('wolf') || p.includes('fox') || p.includes('dog') || p.includes('cat')) {
    // Pointed Canine/Feline Ears
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.moveTo(cx - 65, cy - 35); ctx.lineTo(cx - 72, cy - 115); ctx.lineTo(cx - 22, cy - 75);
    ctx.moveTo(cx + 65, cy - 35); ctx.lineTo(cx + 72, cy - 115); ctx.lineTo(cx + 22, cy - 75);
    ctx.fill();
  }

  // 4. Main Head Shape
  ctx.fillStyle = mainColor;
  ctx.beginPath();
  if (p.includes('shark')) {
    // Torpedo Shark Head
    ctx.moveTo(cx, cy - 95);
    ctx.quadraticCurveTo(cx + 85, cy - 40, cx + 68, cy + 72);
    ctx.lineTo(cx - 68, cy + 72);
    ctx.quadraticCurveTo(cx - 85, cy - 40, cx, cy - 95);
  } else if (p.includes('frog')) {
    // Wide Frog Head
    ctx.ellipse(cx, cy + 5, 84, 66, 0, 0, Math.PI * 2);
  } else if (p.includes('robot')) {
    ctx.roundRect(cx - 72, cy - 82, 144, 152, 16);
  } else if (p.includes('skeleton') || p.includes('skull')) {
    ctx.arc(cx, cy - 18, 70, 0, Math.PI * 2);
    ctx.fillRect(cx - 42, cy + 25, 84, 52);
  } else {
    ctx.roundRect(cx - 68, cy - 82, 136, 158, 56);
  }
  ctx.fill();
  // 5. Eyes & Frog Eye Bumps
  let eyeY = cy - 18;
  if (p.includes('frog')) {
    eyeY = cy - 55;
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.arc(cx - 38, eyeY, 24, 0, Math.PI * 2);
    ctx.arc(cx + 38, eyeY, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Eyes
  ctx.fillStyle = p.includes('skeleton') ? '#090d16' : '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - 32, eyeY, 14, 0, Math.PI * 2);
  ctx.arc(cx + 32, eyeY, 14, 0, Math.PI * 2);
  ctx.fill();

  if (!p.includes('skeleton')) {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx - 32, eyeY, 6.5, 0, Math.PI * 2);
    ctx.arc(cx + 32, eyeY, 6.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Beaks, Snouts & Muzzles
  if (p.includes('bird') || p.includes('eagle') || p.includes('owl') || p.includes('flamingo') || p.includes('duck')) {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 2);
    ctx.lineTo(cx + 18, cy + 2);
    ctx.lineTo(cx, cy + 26);
    ctx.closePath();
    ctx.fill();
  } else if (p.includes('pig')) {
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, 22, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#831843';
    ctx.beginPath();
    ctx.arc(cx - 7, cy + 12, 3.5, 0, Math.PI * 2);
    ctx.arc(cx + 7, cy + 12, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Costumes & Accessories (Pirate, Crown, Wizard, Cowboy, DJ)
  if (p.includes('pirate')) {
    // Pirate Eye-Patch
    ctx.fillStyle = '#090d16';
    ctx.beginPath(); ctx.arc(cx - 32, eyeY, 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#090d16'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx - 65, eyeY - 22); ctx.lineTo(cx + 65, eyeY + 12); ctx.stroke();
    // Pirate Hat
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.ellipse(cx, cy - 76, 95, 24, 0, Math.PI, 0); ctx.fill();
  } else if (p.includes('crown') || p.includes('king') || p.includes('queen')) {
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(cx - 42, cy - 75); ctx.lineTo(cx - 48, cy - 115); ctx.lineTo(cx - 18, cy - 92);
    ctx.lineTo(cx, cy - 122); ctx.lineTo(cx + 18, cy - 92); ctx.lineTo(cx + 48, cy - 115);
    ctx.lineTo(cx + 42, cy - 75);
    ctx.fill();
  } else if (p.includes('wizard') || p.includes('witch')) {
    ctx.fillStyle = '#4c1d95';
    ctx.beginPath(); ctx.ellipse(cx, cy - 72, 95, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 48, cy - 72); ctx.lineTo(cx + 10, cy - 148); ctx.lineTo(cx + 48, cy - 72); ctx.fill();
  } else if (p.includes('cowboy')) {
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.ellipse(cx, cy - 72, 110, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(cx - 50, cy - 122, 100, 55, 18); ctx.fill();
  } else if (p.includes('dj') || p.includes('headphones')) {
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx, cy - 15, 82, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(cx - 88, cy - 35, 18, 44);
    ctx.fillRect(cx + 70, cy - 35, 18, 44);
  }

  if (p.includes('sunglasses') || p.includes('shades') || p.includes('cool')) {
    ctx.fillStyle = '#020617';
    ctx.fillRect(cx - 54, eyeY - 14, 46, 26);
    ctx.fillRect(cx + 8, eyeY - 14, 46, 26);
    ctx.fillRect(cx - 10, eyeY - 5, 20, 5);
  }

  // Label Banner
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(12, h - 38, w - 24, 26);
  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(prompt.toUpperCase().slice(0, 34), cx, h - 21);
}
