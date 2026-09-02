'use client';

import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getPortfolio3dAssetUrl } from '../asset-url';
import {
  shouldLimitPortfolio3dDeferredPreload,
  shouldLimitPortfolio3dNearPreload
} from '../runtime-capabilities';
import { portfolio3dAssets } from '../scene-manifest';
import type { Portfolio3dLoadingTier, Portfolio3dQualityTier } from '../types';

interface Portfolio3dTierAvailability {
  readonly near: boolean;
  readonly deferred: boolean;
}

interface Portfolio3dIdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
}

type Portfolio3dIdleCallback = (deadline: Portfolio3dIdleDeadline) => void;

interface Portfolio3dIdleOptions {
  readonly timeout?: number;
}

interface WindowWithPortfolio3dIdle extends Window {
  readonly requestIdleCallback?: (
    callback: Portfolio3dIdleCallback,
    options?: Portfolio3dIdleOptions
  ) => number;
  readonly cancelIdleCallback?: (id: number) => void;
}

const preloadedTierKeys = new Set<string>();

export function usePortfolio3dPreload(
  criticalComplete: boolean,
  qualityTier: Portfolio3dQualityTier
): Portfolio3dTierAvailability {
  const [nearAvailable, setNearAvailable] = useState(false);
  const [deferredAvailable, setDeferredAvailable] = useState(false);

  useEffect(() => {
    preloadPortfolio3dTier('critical', 'high');
  }, []);

  useEffect(() => {
    if (!criticalComplete) {
      setNearAvailable(false);
      setDeferredAvailable(false);
      return;
    }

    if (qualityTier === 'low' || shouldLimitPortfolio3dNearPreload()) {
      setNearAvailable(false);
      setDeferredAvailable(false);
      return;
    }

    setNearAvailable(true);
    preloadPortfolio3dTier('near', qualityTier);

    if (qualityTier !== 'high' || shouldLimitPortfolio3dDeferredPreload()) {
      setDeferredAvailable(false);
      return;
    }

    const idleWindow = window as WindowWithPortfolio3dIdle;
    const scheduleIdle = idleWindow.requestIdleCallback ?? fallbackRequestIdleCallback;
    const cancelIdle = idleWindow.cancelIdleCallback ?? fallbackCancelIdleCallback;
    const idleId = scheduleIdle(() => {
      preloadPortfolio3dTier('deferred', qualityTier);
      setDeferredAvailable(true);
    }, { timeout: 4500 });

    return () => cancelIdle(idleId);
  }, [criticalComplete, qualityTier]);

  return useMemo(
    () => ({ near: nearAvailable, deferred: deferredAvailable }),
    [deferredAvailable, nearAvailable]
  );
}

function preloadPortfolio3dTier(
  tier: Portfolio3dLoadingTier,
  qualityTier: Portfolio3dQualityTier
): void {
  const preloadKey = `${tier}:${qualityTier}`;
  if (preloadedTierKeys.has(preloadKey)) {
    return;
  }

  preloadedTierKeys.add(preloadKey);
  portfolio3dAssets
    .filter((asset) => asset.loadingTier === tier && asset.qualityVisibility[qualityTier])
    .forEach((asset) => useLoader.preload(GLTFLoader, getPortfolio3dAssetUrl(asset.id)));
}

function fallbackRequestIdleCallback(
  callback: Portfolio3dIdleCallback,
  options?: Portfolio3dIdleOptions
): number {
  const timeout = options?.timeout ?? 1;
  return window.setTimeout(
    () => callback({ didTimeout: false, timeRemaining: () => Math.max(0, 50 - timeout) }),
    timeout
  );
}

function fallbackCancelIdleCallback(id: number): void {
  window.clearTimeout(id);
}