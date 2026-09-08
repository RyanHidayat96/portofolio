import { describe, expect, it } from 'vitest';
import {
  getPortfolio3dDprLimit,
  type Portfolio3dRuntimeCapabilities
} from '../../src/features/portfolio-3d/runtime-capabilities';

const capableMobileRuntime = {
  saveData: false,
  effectiveType: '4g',
  deviceMemory: 8,
  hardwareConcurrency: 8,
  isCoarsePointer: true,
  isNarrowViewport: true
} as const satisfies Portfolio3dRuntimeCapabilities;

describe('portfolio runtime capabilities', () => {
  it('allows a sharper high-quality DPR on capable mobile screens', () => {
    expect(getPortfolio3dDprLimit('high', capableMobileRuntime)).toBe(2);
    expect(getPortfolio3dDprLimit('medium', capableMobileRuntime)).toBe(1.2);
    expect(getPortfolio3dDprLimit('low', capableMobileRuntime)).toBe(0.85);
  });

  it('backs off high-quality mobile DPR on balanced hardware', () => {
    expect(getPortfolio3dDprLimit('high', { ...capableMobileRuntime, deviceMemory: 4 })).toBe(1.5);
    expect(getPortfolio3dDprLimit('high', { ...capableMobileRuntime, hardwareConcurrency: 4 })).toBe(1.5);
  });

  it('keeps the conservative DPR limit for constrained mobile conditions', () => {
    expect(getPortfolio3dDprLimit('high', { ...capableMobileRuntime, saveData: true })).toBe(1.2);
    expect(getPortfolio3dDprLimit('high', { ...capableMobileRuntime, effectiveType: '2g' })).toBe(1.2);
    expect(getPortfolio3dDprLimit('high', { ...capableMobileRuntime, deviceMemory: 2 })).toBe(1.2);
    expect(getPortfolio3dDprLimit('high', { ...capableMobileRuntime, hardwareConcurrency: 2 })).toBe(1.2);
  });
});
