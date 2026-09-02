import type { Portfolio3dQualityTier } from './types';

interface NetworkInformationLike {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

interface NavigatorWithRuntimeHints extends Navigator {
  readonly connection?: NetworkInformationLike;
  readonly mozConnection?: NetworkInformationLike;
  readonly webkitConnection?: NetworkInformationLike;
  readonly deviceMemory?: number;
}

export interface Portfolio3dRuntimeCapabilities {
  readonly saveData: boolean;
  readonly effectiveType: string;
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
  readonly isCoarsePointer: boolean;
  readonly isNarrowViewport: boolean;
}

export function getPortfolio3dRuntimeCapabilities(): Portfolio3dRuntimeCapabilities {
  if (typeof navigator === 'undefined') {
    return {
      saveData: false,
      effectiveType: '',
      isCoarsePointer: false,
      isNarrowViewport: false
    };
  }

  const nav = navigator as NavigatorWithRuntimeHints;
  const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;

  return {
    saveData: Boolean(connection?.saveData),
    effectiveType: connection?.effectiveType?.toLowerCase() ?? '',
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
    isCoarsePointer: matchPortfolio3dMedia('(pointer: coarse)'),
    isNarrowViewport: matchPortfolio3dMedia('(max-width: 760px)')
  };
}

export function shouldUsePortfolio3dMediumDefault(
  capabilities = getPortfolio3dRuntimeCapabilities()
): boolean {
  return Boolean(
    capabilities.isCoarsePointer ||
      capabilities.isNarrowViewport ||
      (typeof capabilities.deviceMemory === 'number' && capabilities.deviceMemory < 6)
  );
}

export function getPortfolio3dDprLimit(
  qualityTier: Portfolio3dQualityTier,
  capabilities = getPortfolio3dRuntimeCapabilities()
): number {
  const tierLimit = qualityTier === 'low' ? 1 : qualityTier === 'medium' ? 1.25 : 1.5;

  if (
    capabilities.saveData ||
    capabilities.effectiveType === 'slow-2g' ||
    capabilities.effectiveType === '2g' ||
    capabilities.isCoarsePointer ||
    capabilities.isNarrowViewport ||
    (typeof capabilities.deviceMemory === 'number' && capabilities.deviceMemory < 6) ||
    (typeof capabilities.hardwareConcurrency === 'number' && capabilities.hardwareConcurrency <= 4)
  ) {
    return Math.min(tierLimit, 1.25);
  }

  return tierLimit;
}

export function shouldLimitPortfolio3dNearPreload(
  capabilities = getPortfolio3dRuntimeCapabilities()
): boolean {
  return Boolean(
    capabilities.saveData ||
      capabilities.effectiveType === 'slow-2g' ||
      capabilities.effectiveType === '2g' ||
      (typeof capabilities.deviceMemory === 'number' && capabilities.deviceMemory < 3) ||
      (typeof capabilities.hardwareConcurrency === 'number' && capabilities.hardwareConcurrency <= 2)
  );
}

export function shouldLimitPortfolio3dDeferredPreload(
  capabilities = getPortfolio3dRuntimeCapabilities()
): boolean {
  return Boolean(
    shouldLimitPortfolio3dNearPreload(capabilities) ||
      capabilities.isCoarsePointer ||
      capabilities.isNarrowViewport ||
      (typeof capabilities.deviceMemory === 'number' && capabilities.deviceMemory < 6) ||
      (typeof capabilities.hardwareConcurrency === 'number' && capabilities.hardwareConcurrency <= 4)
  );
}

function matchPortfolio3dMedia(query: string): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}