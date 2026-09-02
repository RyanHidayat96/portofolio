import * as THREE from 'three';
import { getPortfolio3dDprLimit } from './runtime-capabilities';
import type { Portfolio3dQualityTier } from './types';

THREE.ColorManagement.enabled = true;

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

export const portfolio3dRendererToneMappingExposure = 1.55;
export const portfolio3dRendererShadowType = THREE.PCFSoftShadowMap;

export function getInitialPortfolio3dDpr(
  qualityTier: Portfolio3dQualityTier = 'high'
): readonly [number, number] {
  if (typeof window === 'undefined') {
    return [1, 1.25];
  }

  const devicePixelRatio = Math.max(window.devicePixelRatio || 1, 1);
  const minDpr = qualityTier === 'low' ? 0.75 : 1;
  const maxDpr = Math.max(minDpr, Math.min(devicePixelRatio, getPortfolio3dDprLimit(qualityTier)));

  return [minDpr, maxDpr];
}

export function configurePortfolio3dRenderer(renderer: THREE.WebGLRenderer): void {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = portfolio3dRendererToneMappingExposure;
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = portfolio3dRendererShadowType;
}