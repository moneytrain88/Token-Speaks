import * as THREE from 'three';

export interface LowPolyFaceRig {
  group: THREE.Group;
  setMouthOpen: (level: number) => void;
  setTint: (skin: string, hair: string, shirt: string) => void;
  update: (elapsedSeconds: number) => void;
  dispose: () => void;
}

const MOUTH_SEGMENTS = 40;
const MOUTH_CENTER_Y = -0.38;
const MOUTH_Z = 0.87;
const LIP_SCALE = 1.14;
const BLINK_INTERVAL = 4;
const BLINK_DURATION = 0.14;

function createMouthGeometry(scale: number): THREE.CircleGeometry {
  const closed = new THREE.CircleGeometry(1, MOUTH_SEGMENTS);
  const open = closed.clone();
  scalePositions(closed, 0.5 * scale, 0.03 * scale);
  scalePositions(open, 0.62 * scale, 0.34 * scale);
  const openPositions = open.getAttribute('position') as THREE.BufferAttribute;
  openPositions.name = 'mouthOpen';
  closed.morphAttributes.position = [openPositions];
  return closed;
}

function scalePositions(geometry: THREE.BufferGeometry, sx: number, sy: number) {
  const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < attribute.count; i++) {
    attribute.setXY(i, attribute.getX(i) * sx, attribute.getY(i) * sy);
  }
  attribute.needsUpdate = true;
}

export function createLowPolyFace(): LowPolyFaceRig {
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const track = <T extends THREE.BufferGeometry | THREE.Material>(item: T): T => {
    if (item instanceof THREE.BufferGeometry) geometries.push(item);
    else materials.push(item);
    return item;
  };

  const skinMaterial = track(new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.7 }));
  const hairMaterial = track(new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }));
  const shirtMaterial = track(new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.8 }));
  const eyeWhiteMaterial = track(new THREE.MeshStandardMaterial({ color: '#f8fafc', flatShading: true }));
  const pupilMaterial = track(new THREE.MeshStandardMaterial({ color: '#0f172a', flatShading: true }));
  const mouthMaterial = track(new THREE.MeshStandardMaterial({ color: '#3b0d14', side: THREE.DoubleSide }));
  const lipMaterial = track(new THREE.MeshStandardMaterial({ color: '#c2415a', side: THREE.DoubleSide }));

  const group = new THREE.Group();

  const head = new THREE.Mesh(track(new THREE.SphereGeometry(1, 14, 10)), skinMaterial);
  head.scale.set(0.9, 1.05, 0.92);
  group.add(head);

  const hair = new THREE.Mesh(
    track(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.38)),
    hairMaterial,
  );
  hair.scale.set(0.97, 1.04, 0.97);
  hair.position.y = 0.12;
  group.add(hair);

  const earGeometry = track(new THREE.SphereGeometry(0.2, 12, 8));
  [-0.9, 0.9].forEach((x) => {
    const ear = new THREE.Mesh(earGeometry, skinMaterial);
    ear.scale.set(0.45, 0.6, 0.5);
    ear.position.set(x, -0.02, 0);
    group.add(ear);
  });

  const eyeGroup = new THREE.Group();
  const eyeGeometry = track(new THREE.SphereGeometry(0.17, 12, 8));
  const pupilGeometry = track(new THREE.SphereGeometry(0.08, 10, 8));
  [-0.34, 0.34].forEach((x) => {
    const eye = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
    eye.scale.set(1, 1, 0.5);
    eye.position.set(x, 0.16, 0.86);
    const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    pupil.position.set(x, 0.15, 0.94);
    eyeGroup.add(eye, pupil);
  });
  group.add(eyeGroup);

  const nose = new THREE.Mesh(track(new THREE.ConeGeometry(0.09, 0.22, 5)), skinMaterial);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, -0.1, 0.93);
  group.add(nose);

  const lip = new THREE.Mesh(createMouthGeometry(LIP_SCALE), lipMaterial);
  lip.position.set(0, MOUTH_CENTER_Y, MOUTH_Z);
  geometries.push(lip.geometry);
  const mouth = new THREE.Mesh(createMouthGeometry(1), mouthMaterial);
  mouth.position.set(0, MOUTH_CENTER_Y, MOUTH_Z + 0.006);
  geometries.push(mouth.geometry);
  group.add(lip, mouth);

  const shirt = new THREE.Mesh(track(new THREE.CylinderGeometry(0.95, 1.15, 0.9, 12)), shirtMaterial);
  shirt.position.y = -2.1;
  const neck = new THREE.Mesh(track(new THREE.CylinderGeometry(0.42, 0.5, 0.7, 8)), skinMaterial);
  neck.position.y = -1.45;
  group.add(neck, shirt);

  return {
    group,
    setMouthOpen(level) {
      if (mouth.morphTargetInfluences && lip.morphTargetInfluences) {
        mouth.morphTargetInfluences[0] = level;
        lip.morphTargetInfluences[0] = level;
      }
    },
    setTint(skin, hair, shirtColor) {
      skinMaterial.color.set(skin);
      hairMaterial.color.set(hair);
      shirtMaterial.color.set(shirtColor);
    },
    update(elapsedSeconds) {
      group.rotation.y = Math.sin(elapsedSeconds * 0.5) * 0.12;
      group.rotation.z = Math.sin(elapsedSeconds * 0.8) * 0.02;
      group.position.y = Math.sin(elapsedSeconds * 1.6) * 0.02;
      const blinkPhase = elapsedSeconds % BLINK_INTERVAL;
      eyeGroup.scale.y = blinkPhase < BLINK_DURATION ? 0.12 : 1;
    },
    dispose() {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}
