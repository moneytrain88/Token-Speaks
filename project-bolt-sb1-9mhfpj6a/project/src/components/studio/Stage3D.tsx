import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createLowPolyFace, type LowPolyFaceRig } from '@/lib/three/lowPolyFace';
import type { AudioSubscribe } from '@/hooks/useLiveMicrophone';
import type { ModelPlaceholder } from '@/lib/characters';

interface Stage3DProps {
  model: ModelPlaceholder;
  subscribe: AudioSubscribe;
  canvasHolder: { current: HTMLCanvasElement | null };
}

const STAGE_BACKGROUND = '#0c1820';

function addLights(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight('#ffffff', 0.6);
  const key = new THREE.DirectionalLight('#ffffff', 1.2);
  key.position.set(3, 4, 5);
  const fill = new THREE.HemisphereLight('#bfe3ff', '#1e293b', 0.5);
  scene.add(ambient, key, fill);
}

export function Stage3D({ model, subscribe, canvasHolder }: Stage3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<LowPolyFaceRig | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    canvasHolder.current = canvas;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(STAGE_BACKGROUND);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.1, 6.2);
    camera.lookAt(0, -0.3, 0);
    addLights(scene);

    const rig = createLowPolyFace();
    scene.add(rig.group);
    rigRef.current = rig;

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const startedAt = performance.now();
    const unsubscribe = subscribe(({ level }) => {
      rig.setMouthOpen(level);
      rig.update((performance.now() - startedAt) / 1000);
      renderer.render(scene, camera);
    });

    return () => {
      unsubscribe();
      observer.disconnect();
      rig.dispose();
      rigRef.current = null;
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      canvasHolder.current = null;
    };
  }, [subscribe, canvasHolder]);

  useEffect(() => {
    rigRef.current?.setTint(model.skin, model.hair, model.shirt);
  }, [model]);

  return <div ref={containerRef} className="h-full w-full" />;
}
