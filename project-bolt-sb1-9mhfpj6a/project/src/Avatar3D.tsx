import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Traits } from './CharacterRenderer';

interface Avatar3DProps {
  vol: number;
  char: Traits;
  blink: boolean;
  customPrompt?: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({ vol, char, blink, customPrompt, canvasRef }) => {
  const localCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const volRef = useRef(vol);
  const blinkRef = useRef(blink);
  const charRef = useRef(char);
  const promptRef = useRef(customPrompt || '');
  const rotRef = useRef({ x: 0.08, y: -0.25 });
  const draggingRef = useRef(false);

  useEffect(() => { volRef.current = vol; }, [vol]);
  useEffect(() => { blinkRef.current = blink; }, [blink]);
  useEffect(() => { charRef.current = char; }, [char]);
  useEffect(() => { promptRef.current = customPrompt || ''; }, [customPrompt]);

  useEffect(() => {
    const canvas = localCanvasRef.current;
    if (!canvas) return;
    if (canvasRef) (canvasRef as any).current = canvas;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.1, 4.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(400, 400);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Dramatic 3D Three-Point Studio Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(3, 3.5, 4);
    const rimLight = new THREE.DirectionalLight(0x6366f1, 1.2);
    rimLight.position.set(-3.5, 1.5, -2.5);
    scene.add(ambient, keyLight, rimLight);

    // 3D Wireframe Studio Floor Grid (Gives instant 3D spatial depth!)
    const grid = new THREE.GridHelper(6, 12, 0x4f46e5, 0x1e293b);
    grid.position.y = -1.75;
    scene.add(grid);

    const headGroup = new THREE.Group();
    scene.add(headGroup);

    // 1. Cranium Mesh
    const skinMat = new THREE.MeshStandardMaterial({ color: char.skin, roughness: 0.4, metalness: 0.08 });
    const craniumGeo = new THREE.SphereGeometry(0.95, 36, 36);
    craniumGeo.scale(0.92, 1.12, 0.96);
    const cranium = new THREE.Mesh(craniumGeo, skinMat);
    cranium.position.y = 0.2;
    headGroup.add(cranium);

    // 2. Articulated 3D Jaw Group
    const jawGroup = new THREE.Group();
    jawGroup.position.set(0, -0.15, 0.08);
    headGroup.add(jawGroup);

    const jawGeo = new THREE.SphereGeometry(0.76, 32, 24);
    jawGeo.scale(0.88, 0.92, 0.92);
    const jawMesh = new THREE.Mesh(jawGeo, skinMat);
    jawMesh.position.set(0, -0.35, 0.02);
    jawGroup.add(jawMesh);

    // 3D Beard / Goatee Mesh
    const beardMat = new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.85 });
    const beardGeo = new THREE.SphereGeometry(0.79, 28, 20, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55);
    beardGeo.scale(0.9, 0.95, 0.96);
    const beardMesh = new THREE.Mesh(beardGeo, beardMat);
    beardMesh.position.set(0, -0.34, 0.04);
    jawGroup.add(beardMesh);

    // Lower & Upper 3D Lips
    const lipMat = new THREE.MeshStandardMaterial({ color: char.lashes ? 0xe11d48 : 0x9f4a4a, roughness: 0.25 });
    const lowerLip = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.042, 12, 24, Math.PI), lipMat);
    lowerLip.rotation.x = Math.PI;
    lowerLip.position.set(0, -0.12, 0.72);
    jawGroup.add(lowerLip);

    const upperLip = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.04, 12, 24, Math.PI), lipMat);
    upperLip.position.set(0, -0.16, 0.82);
    headGroup.add(upperLip);

    // 3D Sculpted Nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.38, 18), skinMat);
    nose.position.set(0, 0.14, 0.96);
    nose.rotation.x = 0.28;
    headGroup.add(nose);
    // 3. 3D Eyes & Pupils
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.12 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.08 });

    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), eyeWhiteMat);
    leftEye.position.set(-0.32, 0.34, 0.78);
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), pupilMat);
    leftPupil.position.set(-0.32, 0.34, 0.92);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), eyeWhiteMat);
    rightEye.position.set(0.32, 0.34, 0.78);
    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), pupilMat);
    rightPupil.position.set(0.32, 0.34, 0.92);

    headGroup.add(leftEye, leftPupil, rightEye, rightPupil);

    // 4. 3D Ears / Animal Ears
    const leftEar = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), skinMat);
    leftEar.position.set(-0.92, 0.2, 0);
    const rightEar = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), skinMat);
    rightEar.position.set(0.92, 0.2, 0);
    headGroup.add(leftEar, rightEar);

    // 5. 3D Cowboy Hat / Crown Mesh
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
    const hatGroup = new THREE.Group();
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.06, 32), hatMat);
    const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.78, 0.65, 32), hatMat);
    hatCrown.position.y = 0.32;
    hatGroup.add(hatBrim, hatCrown);
    hatGroup.position.set(0, 0.95, 0);
    headGroup.add(hatGroup);

    // 6. 3D Shoulders & Neck
    const shirtMat = new THREE.MeshStandardMaterial({ color: char.shirt, roughness: 0.65 });
    const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 1.38, 0.9, 28), shirtMat);
    shoulders.position.set(0, -1.35, -0.1);
    scene.add(shoulders);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.65, 20), skinMat);
    neck.position.set(0, -0.78, -0.05);
    scene.add(neck);
// 7. 3D Custom Prompt Props (Shark Fin, Lion Mane, Crown, Wizard Hat, Pirate Patch, Horns)
const finMesh = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.75, 16), skinMat);
finMesh.position.set(0, 1.25, -0.05);
finMesh.rotation.x = -0.25;

const maneMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 });
const maneMesh = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.28, 16, 32), maneMat);
maneMesh.position.set(0, 0.18, -0.15);

const crownMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.25 });
const crownMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.48, 0.35, 8), crownMat);
crownMesh.position.set(0, 1.18, 0);

const wizardMat = new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.6 });
const wizardMesh = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.2, 24), wizardMat);
wizardMesh.position.set(0, 1.45, 0);

const patchMesh = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), new THREE.MeshStandardMaterial({ color: 0x090d16 }));
patchMesh.position.set(-0.32, 0.34, 0.84);

const hornMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 });
const leftHorn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.65, 16), hornMat);
leftHorn.position.set(-0.55, 1.1, 0); leftHorn.rotation.z = 0.45;
const rightHorn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.65, 16), hornMat);
rightHorn.position.set(0.55, 1.1, 0); rightHorn.rotation.z = -0.45;

headGroup.add(finMesh, maneMesh, crownMesh, wizardMesh, patchMesh, leftHorn, rightHorn);

    let animId: number;
    let clock = 0;

    const animate = () => {
      clock += 0.03;
      const v = volRef.current;
      const b = blinkRef.current;
      const ch = charRef.current;

      skinMat.color.set(ch.skin);
      const p = promptRef.current.toLowerCase();
if (p) {
  if (p.includes('red')) skinMat.color.set(0xdc2626);
  else if (p.includes('blue') || p.includes('shark')) skinMat.color.set(0x2563eb);
  else if (p.includes('green') || p.includes('frog')) skinMat.color.set(0x16a34a);
  else if (p.includes('gold') || p.includes('lion')) skinMat.color.set(0xeab308);
  else if (p.includes('purple')) skinMat.color.set(0x9333ea);
  else if (p.includes('pink')) skinMat.color.set(0xec4899);
  else if (p.includes('orange') || p.includes('fox')) skinMat.color.set(0xea580c);
}
finMesh.visible = p.includes('shark');
maneMesh.visible = p.includes('lion');
crownMesh.visible = p.includes('crown') || p.includes('king') || p.includes('queen');
wizardMesh.visible = p.includes('wizard') || p.includes('witch');
patchMesh.visible = p.includes('pirate');
leftHorn.visible = rightHorn.visible = p.includes('dragon') || p.includes('dino') || p.includes('demon') || p.includes('bunny');

      shirtMat.color.set(ch.shirt);
      lipMat.color.set(ch.lashes ? 0xe11d48 : 0x9f4a4a);

      // Show/Hide 3D Hat & Beard dynamically
      hatGroup.visible = ch.hair === 'cowboyHat' || ch.hair === 'beanie';
      hatMat.color.set(ch.hair === 'beanie' ? 0xdc2626 : 0x78350f);
      beardMesh.visible = ch.beard !== 'none' && ch.beard !== undefined;

      // Adjust Ear Position for Cat/Bear vs Human
      if (ch.species === 'cat' || ch.species === 'bear') {
        leftEar.position.set(-0.65, 1.05, 0);
        rightEar.position.set(0.65, 1.05, 0);
      } else {
        leftEar.position.set(-0.92, 0.2, 0);
        rightEar.position.set(0.92, 0.2, 0);
      }

      if (ch.bg === 'greenscreen') scene.background = new THREE.Color(0x00b140);
      else if (ch.bg === 'neon') scene.background = new THREE.Color(0x1e1b4b);
      else if (ch.bg === 'sunset') scene.background = new THREE.Color(0x451a03);
      else scene.background = new THREE.Color(0x090d16);

      // Animate 3D Jaw & Head Angle
      jawGroup.position.y = -0.15 - v * 0.28;
      jawGroup.rotation.x = v * 0.38;

      headGroup.rotation.y = rotRef.current.y + Math.sin(clock) * 0.12;
      headGroup.rotation.x = rotRef.current.x + Math.cos(clock * 0.8) * 0.05 - v * 0.08;

      const eyeScaleY = b ? 0.08 : 1;
      leftEye.scale.y = eyeScaleY;
      rightEye.scale.y = eyeScaleY;
      leftPupil.visible = !b;
      rightPupil.visible = !b;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [canvasRef]);

  return (
    <div className="relative flex flex-col items-center">
      <canvas
        ref={localCanvasRef}
        width={400}
        height={400}
        onMouseDown={() => (draggingRef.current = true)}
        onMouseUp={() => (draggingRef.current = false)}
        onMouseLeave={() => (draggingRef.current = false)}
        onMouseMove={(e) => {
          if (!draggingRef.current) return;
          rotRef.current.y += e.movementX * 0.012;
          rotRef.current.x += e.movementY * 0.012;
        }}
        className="rounded-lg border border-slate-800 max-w-full h-auto shadow-2xl cursor-grab active:cursor-grabbing"
      />
      <span className="text-[11px] text-indigo-300 mt-2 font-mono">
        3D WebGL Active • Drag head to rotate 360°
      </span>
    </div>
  );
};
