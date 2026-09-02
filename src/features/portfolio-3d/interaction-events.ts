import type { Portfolio3dInteractionEvent, Portfolio3dNavigationState } from './types';

export const portfolio3dNavigationStates = [
  'overview',
  'focusing',
  'section-open',
  'returning'
] as const satisfies readonly Portfolio3dNavigationState[];

export const portfolio3dInteractionEventTypes = [
  'hotspot.focus',
  'hotspot.activate',
  'camera.transition',
  'route.sync'
] as const satisfies readonly Portfolio3dInteractionEvent['type'][];

export const portfolio3dDefaultTransition = {
  enterMs: 650,
  exitMs: 420,
  reducedMotionMs: 80,
  inputLockMs: 520
} as const;
