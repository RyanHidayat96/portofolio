'use client';

import { useMemo } from 'react';
import type { Portfolio3dQualityTier } from '../types';

interface Portfolio3dTierAvailability {
  readonly near: boolean;
  readonly deferred: boolean;
}

export function usePortfolio3dPreload(
  criticalComplete: boolean,
  qualityTier: Portfolio3dQualityTier
): Portfolio3dTierAvailability {
  return useMemo(
    () => ({
      near: false,
      deferred: false
    }),
    [criticalComplete, qualityTier]
  );
}