export const FACE_WIDTH = 1280;
export const FACE_HEIGHT = 720;

export interface FacePalette {
  backdrop: string;
  glow: string;
  shirt: string;
  skin: string;
  hair: string;
  eyeWhite: string;
  ink: string;
  mouthInterior: string;
  cheek: string;
}

export type FacePaletteRole = keyof FacePalette;

export interface FaceLayer {
  id: string;
  d: string;
  fill?: FacePaletteRole;
  stroke?: FacePaletteRole;
  strokeWidth?: number;
  opacity?: number;
}

export interface ResolvedLayerPaint {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

const MOUTH_CENTER_X = 640;
const MOUTH_CENTER_Y = 500;
const MOUTH_REST_HALF_WIDTH = 56;
const MOUTH_OPEN_EXTRA_WIDTH = 40;
const MOUTH_MAX_HALF_HEIGHT = 80;
const MOUTH_SMILE_LIFT = 8;
const MOUTH_SMILE_DEPTH = 16;

function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
}

const HAIR_PATH =
  'M 372 360 C 344 170 470 92 640 92 C 810 92 936 170 908 360 C 880 262 830 210 760 196 C 690 240 590 240 520 196 C 450 210 400 262 372 360 Z';

export const STATIC_FACE_LAYERS: FaceLayer[] = [
  { id: 'backdrop', d: `M 0 0 H ${FACE_WIDTH} V ${FACE_HEIGHT} H 0 Z`, fill: 'backdrop' },
  { id: 'glow', d: ellipsePath(640, 330, 460, 400), fill: 'glow', opacity: 0.35 },
  { id: 'neck', d: 'M 592 540 L 688 540 L 700 680 L 580 680 Z', fill: 'skin' },
  { id: 'shirt', d: ellipsePath(640, 780, 340, 170), fill: 'shirt', stroke: 'ink', strokeWidth: 6 },
  { id: 'earLeft', d: ellipsePath(380, 370, 36, 52), fill: 'skin', stroke: 'ink', strokeWidth: 6 },
  { id: 'earRight', d: ellipsePath(900, 370, 36, 52), fill: 'skin', stroke: 'ink', strokeWidth: 6 },
  { id: 'head', d: ellipsePath(640, 350, 260, 290), fill: 'skin', stroke: 'ink', strokeWidth: 8 },
  { id: 'hair', d: HAIR_PATH, fill: 'hair', stroke: 'ink', strokeWidth: 8 },
  { id: 'eyeLeft', d: ellipsePath(528, 362, 36, 44), fill: 'eyeWhite', stroke: 'ink', strokeWidth: 6 },
  { id: 'pupilLeft', d: ellipsePath(536, 370, 16, 20), fill: 'ink' },
  { id: 'glintLeft', d: ellipsePath(543, 356, 5, 6), fill: 'eyeWhite' },
  { id: 'eyeRight', d: ellipsePath(752, 362, 36, 44), fill: 'eyeWhite', stroke: 'ink', strokeWidth: 6 },
  { id: 'pupilRight', d: ellipsePath(760, 370, 16, 20), fill: 'ink' },
  { id: 'glintRight', d: ellipsePath(767, 356, 5, 6), fill: 'eyeWhite' },
  { id: 'browLeft', d: 'M 480 300 Q 528 270 580 296', stroke: 'hair', strokeWidth: 14 },
  { id: 'browRight', d: 'M 700 296 Q 752 270 800 300', stroke: 'hair', strokeWidth: 14 },
  { id: 'cheekLeft', d: ellipsePath(474, 430, 44, 26), fill: 'cheek', opacity: 0.75 },
  { id: 'cheekRight', d: ellipsePath(806, 430, 44, 26), fill: 'cheek', opacity: 0.75 },
  { id: 'nose', d: 'M 628 414 Q 640 446 652 414', stroke: 'ink', strokeWidth: 7 },
];

export function buildMouthLayer(level: number): FaceLayer {
  const openness = Math.min(1, Math.max(0, level));
  const halfWidth = MOUTH_REST_HALF_WIDTH + openness * MOUTH_OPEN_EXTRA_WIDTH;
  const halfHeight = openness * MOUTH_MAX_HALF_HEIGHT;
  const relax = 1 - openness;
  const cornerY = MOUTH_CENTER_Y - MOUTH_SMILE_LIFT * relax;
  const midY = cornerY + MOUTH_SMILE_DEPTH * relax;
  const left = MOUTH_CENTER_X - halfWidth;
  const right = MOUTH_CENTER_X + halfWidth;
  const upperControl = midY - 2 * halfHeight;
  const lowerControl = midY + 2 * halfHeight;

  return {
    id: 'mouth',
    d: `M ${left} ${cornerY} Q ${MOUTH_CENTER_X} ${upperControl} ${right} ${cornerY} Q ${MOUTH_CENTER_X} ${lowerControl} ${left} ${cornerY} Z`,
    fill: 'mouthInterior',
    stroke: 'ink',
    strokeWidth: 9,
  };
}

export function resolveLayerPaint(layer: FaceLayer, palette: FacePalette): ResolvedLayerPaint {
  return {
    fill: layer.fill ? palette[layer.fill] : undefined,
    stroke: layer.stroke ? palette[layer.stroke] : undefined,
    strokeWidth: layer.strokeWidth,
    opacity: layer.opacity,
  };
}
