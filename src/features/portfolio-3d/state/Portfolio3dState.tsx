'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getPortfolio3dRouteTarget } from '../route-map';
import type {
  Portfolio3dCeilingLightAim,
  Portfolio3dHotspotDefinition,
  Portfolio3dHotspotId,
  Portfolio3dInputSource,
  Portfolio3dInteractionEvent,
  Portfolio3dLightingMode,
  Portfolio3dNavigationState,
  Portfolio3dQualityTier,
  Portfolio3dSectionId
} from '../types';

interface Portfolio3dState {
  readonly activeSectionId: Portfolio3dSectionId;
  readonly navigationState: Portfolio3dNavigationState;
  readonly qualityTier: Portfolio3dQualityTier;
  readonly lightingMode: Portfolio3dLightingMode;
  readonly roomLightingLevel: number;
  readonly hoveredHotspotId?: Portfolio3dHotspotId;
  readonly focusedHotspotId?: Portfolio3dHotspotId;
  readonly ceilingLightingLevel: number;
  readonly ceilingLightAim: Portfolio3dCeilingLightAim;
  readonly deskTaskLightingLevel: number;
  readonly isInstructionHintDismissed: boolean;
  readonly lastEvent?: Portfolio3dInteractionEvent;
}

interface Portfolio3dContextValue {
  readonly state: Portfolio3dState;
  readonly setActiveSection: (sectionId: Portfolio3dSectionId) => void;
  readonly setNavigationState: (navigationState: Portfolio3dNavigationState) => void;
  readonly setQualityTier: (qualityTier: Portfolio3dQualityTier) => void;
  readonly setHoveredHotspot: (hotspotId: Portfolio3dHotspotId | undefined, source?: Portfolio3dInputSource) => void;
  readonly setFocusedHotspot: (hotspotId: Portfolio3dHotspotId | undefined, source?: Portfolio3dInputSource) => void;
  readonly setInstructionHintDismissed: (isDismissed: boolean) => void;
  readonly activateHotspot: (definition: Portfolio3dHotspotDefinition, source: Portfolio3dInputSource) => void;
  readonly emit: (event: Portfolio3dInteractionEvent) => void;
}

const Portfolio3dContext = createContext<Portfolio3dContextValue | null>(null);
const transitionStates = new Set<Portfolio3dNavigationState>(['focusing', 'returning']);

export function Portfolio3dProvider({
  children,
  initialSectionId = 'overview'
}: Readonly<{
  children: React.ReactNode;
  initialSectionId?: Portfolio3dSectionId;
}>): React.ReactElement {
  const [state, setState] = useState<Portfolio3dState>({
    activeSectionId: initialSectionId,
    navigationState: initialSectionId === 'overview' ? 'overview' : 'focusing',
    qualityTier: 'high',
    lightingMode: 'studio',
    roomLightingLevel: 1,
    ceilingLightingLevel: 1,
    ceilingLightAim: 'desk',
    deskTaskLightingLevel: 1,
    isInstructionHintDismissed: false
  });

  const emit = useCallback((event: Portfolio3dInteractionEvent): void => {
    setState((current) => ({ ...current, lastEvent: event }));
  }, []);

  const setNavigationState = useCallback((navigationState: Portfolio3dNavigationState): void => {
    setState((current) => ({ ...current, navigationState }));
  }, []);

  const setQualityTier = useCallback((qualityTier: Portfolio3dQualityTier): void => {
    setState((current) => ({ ...current, qualityTier }));
  }, []);


  const setHoveredHotspot = useCallback(
    (hotspotId: Portfolio3dHotspotId | undefined, source: Portfolio3dInputSource = 'pointer'): void => {
      setState((current) => {
        if (current.hoveredHotspotId === hotspotId) {
          return current;
        }

        return {
          ...current,
          hoveredHotspotId: hotspotId,
          lastEvent: hotspotId
            ? {
                type: 'hotspot.focus',
                hotspotId,
                source
              }
            : current.lastEvent
        };
      });
    },
    []
  );

  const setFocusedHotspot = useCallback(
    (hotspotId: Portfolio3dHotspotId | undefined, source: Portfolio3dInputSource = 'keyboard'): void => {
      setState((current) => {
        if (current.focusedHotspotId === hotspotId) {
          return current;
        }

        return {
          ...current,
          focusedHotspotId: hotspotId,
          lastEvent: hotspotId
            ? {
                type: 'hotspot.focus',
                hotspotId,
                source
              }
            : current.lastEvent
        };
      });
    },
    []
  );

  const setInstructionHintDismissed = useCallback((isDismissed: boolean): void => {
    setState((current) => ({ ...current, isInstructionHintDismissed: isDismissed }));
  }, []);

  const setActiveSection = useCallback((sectionId: Portfolio3dSectionId): void => {
    const routeTarget = getPortfolio3dRouteTarget(sectionId);

    setState((current) => {
      if (
        transitionStates.has(current.navigationState) &&
        sectionId !== 'overview' &&
        sectionId !== current.activeSectionId
      ) {
        return current;
      }

      if (sectionId === current.activeSectionId && current.navigationState === 'section-open') {
        return current;
      }

      return {
        ...current,
        activeSectionId: sectionId,
        navigationState: getNextNavigationState(current, sectionId),
        hoveredHotspotId: undefined,
        focusedHotspotId: undefined,
        lastEvent: routeTarget
          ? {
              type: 'route.sync',
              sectionId,
              path: routeTarget.path
            }
          : current.lastEvent
      };
    });
  }, []);

  const activateHotspot = useCallback(
    (definition: Portfolio3dHotspotDefinition, source: Portfolio3dInputSource): void => {
      setState((current) => activateHotspotInState(current, definition, source));
    },
    []
  );

  const value = useMemo(
    () => ({
      state,
      setActiveSection,
      setNavigationState,
      setQualityTier,
      setHoveredHotspot,
      setFocusedHotspot,
      setInstructionHintDismissed,
      activateHotspot,
      emit
    }),
    [
      activateHotspot,
      emit,
      setActiveSection,
      setFocusedHotspot,
      setHoveredHotspot,
      setInstructionHintDismissed,
      setNavigationState,
      setQualityTier,
      state
    ]
  );

  return <Portfolio3dContext.Provider value={value}>{children}</Portfolio3dContext.Provider>;
}

export function usePortfolio3dState(): Portfolio3dContextValue {
  const value = useContext(Portfolio3dContext);

  if (!value) {
    throw new Error('usePortfolio3dState must be used inside Portfolio3dProvider.');
  }

  return value;
}

function activateHotspotInState(
  current: Portfolio3dState,
  definition: Portfolio3dHotspotDefinition,
  source: Portfolio3dInputSource
): Portfolio3dState {
  if (definition.interactionKind === 'open-section' && definition.sectionId) {
    if (
      transitionStates.has(current.navigationState) &&
      definition.sectionId !== current.activeSectionId
    ) {
      return current;
    }

    return {
      ...current,
      activeSectionId: definition.sectionId,
      navigationState: getNextNavigationState(current, definition.sectionId),
      hoveredHotspotId: definition.id,
      focusedHotspotId: definition.id,
      lastEvent: {
        type: 'hotspot.activate',
        hotspotId: definition.id,
        source
      }
    };
  }


  return {
    ...current,
    focusedHotspotId: definition.id,
    lastEvent: {
      type: 'hotspot.activate',
      hotspotId: definition.id,
      source
    }
  };
}

function getNextNavigationState(
  current: Portfolio3dState,
  nextSectionId: Portfolio3dSectionId
): Portfolio3dNavigationState {
  if (nextSectionId === 'overview') {
    return current.activeSectionId === 'overview' ? 'overview' : 'returning';
  }

  return 'focusing';
}

