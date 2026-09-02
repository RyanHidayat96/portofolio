import type { Portfolio3dCameraPreset } from './types';

export const portfolio3dCameraPresets = [
  {
    id: 'overview',
    label: 'Room overview',
    position: [0, 1.55, 4.75],
    target: [0, 1.15, 0],
    fov: 42,
    near: 0.08,
    far: 24,
    targetNodeName: 'Room_Shell_Root',
    reducedMotionMs: 80,
    transitionMs: 850
  },
  {
    id: 'profile',
    label: 'Profile focus',
    position: [-1.9, 1.45, 2.2],
    target: [-1.15, 1.2, 0.15],
    fov: 38,
    near: 0.08,
    far: 18,
    targetNodeName: 'Hotspot_Profile',
    reducedMotionMs: 80,
    transitionMs: 650
  },
  {
    id: 'experience',
    label: 'Career focus',
    position: [-1.55, 1.35, 2.35],
    target: [-0.7, 1.05, 0],
    fov: 38,
    near: 0.08,
    far: 18,
    targetNodeName: 'Anchor_Chair',
    reducedMotionMs: 80,
    transitionMs: 650
  },
  {
    id: 'projects',
    label: 'Projects monitor',
    position: [0, 1.38, 2.05],
    target: [0, 1.25, -0.35],
    fov: 34,
    near: 0.05,
    far: 16,
    targetNodeName: 'Anchor_MainMonitor',
    screenNodeName: 'Screen_Projects',
    reducedMotionMs: 80,
    transitionMs: 620
  },
  {
    id: 'fullstack',
    label: 'Full-stack laptop',
    position: [-0.65, 1.1, 1.35],
    target: [-0.15, 0.85, 0.05],
    fov: 32,
    near: 0.04,
    far: 12,
    targetNodeName: 'Hotspot_Fullstack',
    screenNodeName: 'Screen_Fullstack',
    reducedMotionMs: 80,
    transitionMs: 580
  },
  {
    id: 'backend',
    label: 'Backend rack',
    position: [2.0, 1.45, 1.7],
    target: [1.35, 1.15, -0.35],
    fov: 36,
    near: 0.06,
    far: 18,
    targetNodeName: 'Anchor_ServerRack',
    screenNodeName: 'Screen_Backend',
    reducedMotionMs: 80,
    transitionMs: 650
  },
  {
    id: 'architecture',
    label: 'Architecture screen',
    position: [-1.85, 1.55, 1.65],
    target: [-1.35, 1.35, -0.55],
    fov: 34,
    near: 0.06,
    far: 18,
    targetNodeName: 'Anchor_ArchitectureScreen',
    screenNodeName: 'Screen_Architecture',
    reducedMotionMs: 80,
    transitionMs: 650
  },
  {
    id: 'automation',
    label: 'Automation shelf',
    position: [-2.15, 1.45, 1.35],
    target: [-1.95, 1.05, -0.5],
    fov: 36,
    near: 0.06,
    far: 18,
    targetNodeName: 'Hotspot_EngineeringLab',
    reducedMotionMs: 80,
    transitionMs: 650
  },
  {
    id: 'performance',
    label: 'Performance hologram',
    position: [1.25, 1.25, 1.55],
    target: [0.7, 0.9, -0.05],
    fov: 32,
    near: 0.04,
    far: 14,
    targetNodeName: 'Anchor_HologramProjector',
    screenNodeName: 'Hologram_Surface',
    reducedMotionMs: 80,
    transitionMs: 600
  },
  {
    id: 'pipeline',
    label: 'Pipeline console',
    position: [1.65, 1.15, 1.65],
    target: [1.05, 0.85, -0.15],
    fov: 34,
    near: 0.05,
    far: 16,
    targetNodeName: 'Anchor_PipelineConsole',
    reducedMotionMs: 80,
    transitionMs: 620
  },
  {
    id: 'terminal',
    label: 'Terminal controls',
    position: [0.2, 1.05, 1.35],
    target: [0, 0.78, 0.05],
    fov: 30,
    near: 0.04,
    far: 12,
    targetNodeName: 'Hotspot_Terminal',
    reducedMotionMs: 80,
    transitionMs: 520
  },
  {
    id: 'contact',
    label: 'Contact phone',
    position: [0.75, 1.05, 1.25],
    target: [0.35, 0.82, 0.05],
    fov: 30,
    near: 0.04,
    far: 12,
    targetNodeName: 'Anchor_Phone',
    screenNodeName: 'Phone_Display',
    reducedMotionMs: 80,
    transitionMs: 520
  }
] as const satisfies readonly Portfolio3dCameraPreset[];

export const portfolio3dCameraPresetById = Object.fromEntries(
  portfolio3dCameraPresets.map((preset) => [preset.id, preset])
) as Record<(typeof portfolio3dCameraPresets)[number]['id'], (typeof portfolio3dCameraPresets)[number]>;
