import { getPortfolio3dDprLimit } from './runtime-capabilities';
import type { Portfolio3dQualityTier } from './types';

export const portfolio3dRendererPerformance = {
  min: 0.55,
  debounce: 240
} as const;

export const portfolio3dDefaultCamera = {
  position: [0, 1.45, 5.35] as const,
  fov: 50,
  near: 0.08,
  far: 30
} as const;

export const portfolio3dRendererOptions = {
  antialias: false,
  alpha: true,
  depth: true,
  stencil: false,
  powerPreference: 'high-performance'
} as const;

export function getInitialPortfolio3dDpr(
  qualityTier: Portfolio3dQualityTier = 'high'
): [number, number] {
  if (typeof window === 'undefined') {
    return [1, 1.25];
  }

  const devicePixelRatio = Math.max(window.devicePixelRatio || 1, 1);
  const minDpr = qualityTier === 'low' ? 0.75 : 1;
  const maxDpr = Math.max(minDpr, Math.min(devicePixelRatio, getPortfolio3dDprLimit(qualityTier)));

  return [minDpr, maxDpr];
}
