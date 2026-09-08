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


const lowQualityDprLimit = 0.85;
const mediumQualityDprLimit = 1.2;
const desktopHighQualityDprLimit = 1.5;
const mobileHighQualityDprLimit = 2;
const mobileBalancedHighQualityDprLimit = 1.5;
const constrainedRuntimeDprLimit = 1.2;

export function getPortfolio3dDprLimit(
  qualityTier: Portfolio3dQualityTier,
  capabilities = getPortfolio3dRuntimeCapabilities()
): number {
  const isMobileViewport = capabilities.isCoarsePointer || capabilities.isNarrowViewport;
  const tierLimit = qualityTier === 'low'
    ? lowQualityDprLimit
    : qualityTier === 'medium'
      ? mediumQualityDprLimit
      : isMobileViewport
        ? mobileHighQualityDprLimit
        : desktopHighQualityDprLimit;
  const isConstrainedNetwork = capabilities.saveData ||
    capabilities.effectiveType === 'slow-2g' ||
    capabilities.effectiveType === '2g';
  const isVeryConstrainedHardware =
    (typeof capabilities.deviceMemory === 'number' && capabilities.deviceMemory < 4) ||
    (typeof capabilities.hardwareConcurrency === 'number' && capabilities.hardwareConcurrency <= 2);
  const isBalancedHardware =
    (typeof capabilities.deviceMemory === 'number' && capabilities.deviceMemory < 6) ||
    (typeof capabilities.hardwareConcurrency === 'number' && capabilities.hardwareConcurrency <= 4);

  if (isConstrainedNetwork || isVeryConstrainedHardware) {
    return Math.min(tierLimit, constrainedRuntimeDprLimit);
  }

  if (
    isMobileViewport ||
    isBalancedHardware
  ) {
    return Math.min(
      tierLimit,
      qualityTier === 'high' && isMobileViewport && !isBalancedHardware
        ? mobileHighQualityDprLimit
        : qualityTier === 'high'
          ? mobileBalancedHighQualityDprLimit
          : mediumQualityDprLimit
    );
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
