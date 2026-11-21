import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Traits } from './CharacterRenderer';

interface Avatar3DProps {
  vol: number;
  char: Traits;
  blink: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({ vol, char, blink, canvasRef }) => {
  const volRef = useRef(vol);
  const blinkRef = useRef(blink);
  const charRef = useRef(char);
  const rotRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);

  useEffect(() => { volRef.current = vol; }, [vol]);
  useEffect(() => { blinkRef.current = blink; }, [blink]);
  useEffect(() => { charRef.current = char; }, [char]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.1, 4.4);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(400, 400);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3D Studio Three-Point Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(2.5, 3, 4);
    const rimLight = new THREE.DirectionalLight(0x818cf8, 0.9);
    rimLight.position.set(-3, 1, -2);
    scene.add(ambient, keyLight, rimLight);

    // Master Head Group
    const headGroup = new THREE.Group();
    scene.add(headGroup);

    // 1. Cranium Mesh
    const skinMat = new THREE.MeshStandardMaterial({ color: char.skin, roughness: 0.45, metalness: 0.05 });
    const craniumGeo = new THREE.SphereGeometry(0.95, 32, 32);
    craniumGeo.scale(0.92, 1.12, 0.96);
    const cranium = new THREE.Mesh(craniumGeo, skinMat);
    cranium.position.y = 0.2;
    headGroup.add(cranium);

    // 2. Articulated 3D Jaw Group (Moves down with voice volume)
    const jawGroup = new THREE.Group();
    jawGroup.position.set(0, -0.15, 0.08);
    headGroup.add(jawGroup);

    const jawGeo = new THREE.SphereGeometry(0.76, 32, 24);
    jawGeo.scale(0.88, 0.92, 0.92);
    const jawMesh = new THREE.Mesh(jawGeo, skinMat);
    jawMesh.position.set(0, -0.35, 0.02);
    jawGroup.add(jawMesh);

    // Lower Lip Mesh
    const lipMat = new THREE.MeshStandardMaterial({ color: char.lashes ? 0xe11d48 : 0x9f4a4a, roughness: 0.3 });
    const lowerLip = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.045, 12, 24, Math.PI), lipMat);
    lowerLip.rotation.x = Math.PI;
    lowerLip.position.set(0, -0.12, 0.72);
    jawGroup.add(lowerLip);

    // Upper Lip & Nose
    const upperLip = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.042, 12, 24, Math.PI), lipMat);
    upperLip.position.set(0, -0.16, 0.82);
    headGroup.add(upperLip);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 16), skinMat);
    nose.position.set(0, 0.14, 0.94);
    nose.rotation.x = 0.25;
    headGroup.add(nose);
    // 3. 3D Eyes & Pupils
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });

    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), eyeWhiteMat);
    leftEye.position.set(-0.32, 0.34, 0.78);
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), pupilMat);
    leftPupil.position.set(-0.32, 0.34, 0.91);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), eyeWhiteMat);
    rightEye.position.set(0.32, 0.34, 0.78);
    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), pupilMat);
    rightPupil.position.set(0.32, 0.34, 0.91);

    headGroup.add(leftEye, leftPupil, rightEye, rightPupil);

    // 4. 3D Shoulders & Neck
    const shirtMat = new THREE.MeshStandardMaterial({ color: char.shirt, roughness: 0.7 });
    const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 1.35, 0.9, 24), shirtMat);
    shoulders.position.set(0, -1.35, -0.1);
    scene.add(shoulders);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.65, 20), skinMat);
    neck.position.set(0, -0.78, -0.05);
    scene.add(neck);

    // 5. Optional 3D Cowboy Hat / Beanie / Ears
    const hatGroup = new THREE.Group();
    headGroup.add(hatGroup);

    let animId: number;
    let clock = 0;

    const animate = () => {
      clock += 0.03;
      const v = volRef.current;
      const b = blinkRef.current;
      const ch = charRef.current;

      // Sync colors dynamically
      skinMat.color.set(ch.skin);
      shirtMat.color.set(ch.shirt);
      lipMat.color.set(ch.lashes ? 0xe11d48 : 0x9f4a4a);

      // Update background color
      if (ch.bg === 'greenscreen') scene.background = new THREE.Color(0x00b140);
      else if (ch.bg === 'neon') scene.background = new THREE.Color(0x1e1b4b);
      else if (ch.bg === 'sunset') scene.background = new THREE.Color(0x451a03);
      else scene.background = new THREE.Color(0x090d16);

      // Animate 3D Jaw Drop & Head Sway
      jawGroup.position.y = -0.15 - v * 0.28;
      jawGroup.rotation.x = v * 0.35;

      headGroup.rotation.y = rotRef.current.y + Math.sin(clock) * 0.08;
      headGroup.rotation.x = rotRef.current.x + Math.cos(clock * 0.8) * 0.04 - v * 0.08;

      // Blink scaling
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
        ref={canvasRef}
        width={400}
        height={400}
        onMouseDown={() => (draggingRef.current = true)}
        onMouseUp={() => (draggingRef.current = false)}
        onMouseLeave={() => (draggingRef.current = false)}
        onMouseMove={(e) => {
          if (!draggingRef.current) return;
          rotRef.current.y += e.movementX * 0.01;
          rotRef.current.x += e.movementY * 0.01;
        }}
        className="rounded-lg border border-slate-800 max-w-full h-auto shadow-2xl cursor-grab active:cursor-grabbing"
      />
      <span className="text-[11px] text-slate-400 mt-2 font-mono">
        Drag on 3D head to rotate in real time
      </span>
    </div>
  );
};
