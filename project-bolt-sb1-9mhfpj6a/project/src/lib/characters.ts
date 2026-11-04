import type { FacePalette } from '@/lib/face2d/face';

export interface CharacterOption {
  id: string;
  name: string;
  description: string;
}

export interface CartoonPreset extends CharacterOption {
  palette: FacePalette;
}

export interface ModelPlaceholder extends CharacterOption {
  skin: string;
  hair: string;
  shirt: string;
}

export const CARTOON_PRESETS: CartoonPreset[] = [
  {
    id: 'sunny-pop',
    name: 'Sunny Pop',
    description: 'Bright and bubbly',
    palette: {
      backdrop: '#1e3a5f',
      glow: '#3b82f6',
      shirt: '#2563eb',
      skin: '#ffd6a5',
      hair: '#3b2a20',
      eyeWhite: '#ffffff',
      ink: '#1c1917',
      mouthInterior: '#7f1d1d',
      cheek: '#fb7185',
    },
  },
  {
    id: 'mint-buddy',
    name: 'Mint Buddy',
    description: 'Fresh and friendly',
    palette: {
      backdrop: '#13362f',
      glow: '#10b981',
      shirt: '#059669',
      skin: '#e8c39e',
      hair: '#1f2937',
      eyeWhite: '#ffffff',
      ink: '#1c1917',
      mouthInterior: '#7f1d1d',
      cheek: '#f472b6',
    },
  },
  {
    id: 'coral-cheer',
    name: 'Coral Cheer',
    description: 'Warm and energetic',
    palette: {
      backdrop: '#3b1f1f',
      glow: '#f97316',
      shirt: '#0ea5e9',
      skin: '#ffc8b4',
      hair: '#c2410c',
      eyeWhite: '#ffffff',
      ink: '#1c1917',
      mouthInterior: '#7f1d1d',
      cheek: '#fb7185',
    },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Calm and dark-toned',
    palette: {
      backdrop: '#0b1220',
      glow: '#38bdf8',
      shirt: '#475569',
      skin: '#c68642',
      hair: '#111827',
      eyeWhite: '#f8fafc',
      ink: '#020617',
      mouthInterior: '#450a0a',
      cheek: '#b45309',
    },
  },
];

export const MODEL_PLACEHOLDERS: ModelPlaceholder[] = [
  {
    id: 'mentor-a',
    name: 'Placeholder A: Mentor',
    description: 'Low-poly head, warm skin tone',
    skin: '#e0ac7e',
    hair: '#2b2b2b',
    shirt: '#334155',
  },
  {
    id: 'rookie-b',
    name: 'Placeholder B: Rookie',
    description: 'Low-poly head, light skin tone',
    skin: '#f1c7a5',
    hair: '#8a4b2a',
    shirt: '#0f766e',
  },
  {
    id: 'nova-c',
    name: 'Placeholder C: Nova',
    description: 'Low-poly head, deep skin tone',
    skin: '#8d5a3b',
    hair: '#111111',
    shirt: '#1d4ed8',
  },
];
