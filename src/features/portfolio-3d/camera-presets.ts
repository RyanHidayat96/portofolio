import type { Portfolio3dCameraPreset } from './types';

export const portfolio3dCameraPresets = [
  {
    id: 'overview',
    label: 'Room overview',
    position: [3.0, 2.7, 3.9],
    target: [-0.2, 0.6, -0.3],
    fov: 44,
    near: 0.08,
    far: 35,
    targetNodeName: 'walls',
    reducedMotionMs: 80,
    transitionMs: 850
  },
  {
    id: 'profile',
    label: 'Profile focus',
    position: [-0.8, 1.2, 1.8],
    target: [0.03, 0.7, 0.04],
    fov: 38,
    near: 0.08,
    far: 20,
    targetNodeName: 'chair',
    reducedMotionMs: 80,
    transitionMs: 650
  },
  {
    id: 'experience',
    label: 'Career focus',
    position: [-0.2, 1.7, 0.8],
    target: [-0.6, 2.0, -1.86],
    fov: 38,
    near: 0.08,
    far: 20,
    targetNodeName: 'poster 3',
    reducedMotionMs: 80,
    transitionMs: 650
  },
  {
    id: 'projects',
    label: 'Projects monitor',
    position: [-0.8, 1.15, 0.85],
    target: [-1.41, 0.95, -0.09],
    fov: 34,
    near: 0.05,
    far: 18,
    targetNodeName: 'computer',
    screenNodeName: 'Screen_Projects',
    reducedMotionMs: 80,
    transitionMs: 620
  },
  {
    id: 'fullstack',
    label: 'Full-stack laptop',
    position: [-0.7, 1.1, 0.1],
    target: [-1.39, 0.85, -0.75],
    fov: 32,
    near: 0.04,
    far: 15,
    targetNodeName: 'table.001',
    screenNodeName: 'Screen_Fullstack',
    reducedMotionMs: 80,
    transitionMs: 580
  },
  {
    id: 'backend',
    label: 'Backend rack',
    position: [-0.6, 0.75, 1.9],
    target: [-1.4, 0.45, 1.06],
    fov: 36,
    near: 0.06,
    far: 20,
    targetNodeName: 'gaming mashine',
    screenNodeName: 'Screen_Backend',
    reducedMotionMs: 80,
    transitionMs: 650
  },
  {
    id: 'architecture',
    label: 'Architecture screen',
    position: [0.8, 1.2, 1.0],
    target: [1.42, 0.65, 0.16],
    fov: 34,
    near: 0.06,
    far: 20,
    targetNodeName: 'papers over table',
    screenNodeName: 'Screen_Architecture',
    reducedMotionMs: 80,
    transitionMs: 650
  },
  {
    id: 'automation',
    label: 'Automation shelf',
    position: [-1.1, 1.1, 2.3],
    target: [-1.91, 0.85, 1.77],
    fov: 36,
    near: 0.06,
    far: 20,
    targetNodeName: 'electric board',
    reducedMotionMs: 80,
    transitionMs: 650
  },
  {
    id: 'performance',
    label: 'Performance hologram',
    position: [-0.9, 1.5, 0.4],
    target: [-1.73, 1.67, -0.87],
    fov: 32,
    near: 0.04,
    far: 16,
    targetNodeName: 'SPAKER',
    screenNodeName: 'Hologram_Surface',
    reducedMotionMs: 80,
    transitionMs: 600
  },
  {
    id: 'pipeline',
    label: 'Pipeline console',
    position: [-0.15, 1.28, 1.07],
    target: [-1.08, 1.28, 1.07],
    fov: 40,
    near: 0.05,
    far: 20,
    targetNodeName: 'gaming mashine',
    reducedMotionMs: 80,
    transitionMs: 850
  },
  {
    id: 'terminal',
    label: 'Terminal controls',
    position: [-0.6, 1.0, 1.3],
    target: [-1.22, 0.7, 0.78],
    fov: 30,
    near: 0.04,
    far: 15,
    targetNodeName: 'Plane.025',
    reducedMotionMs: 80,
    transitionMs: 520
  },
  {
    id: 'contact',
    label: 'Contact phone',
    position: [0.3, 0.9, 2.0],
    target: [0.92, 0.4, 1.44],
    fov: 30,
    near: 0.04,
    far: 15,
    targetNodeName: 'sofa',
    screenNodeName: 'Phone_Display',
    reducedMotionMs: 80,
    transitionMs: 520
  }
] as const satisfies readonly Portfolio3dCameraPreset[];

export const portfolio3dCameraPresetById = Object.fromEntries(
  portfolio3dCameraPresets.map((preset) => [preset.id, preset])
) as Record<(typeof portfolio3dCameraPresets)[number]['id'], (typeof portfolio3dCameraPresets)[number]>;
