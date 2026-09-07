'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import { useReducedMotion } from '@/features/interaction/hooks/useReducedMotion';
import {
  getArcadeCameraPosition,
  resolveArcadeScreen,
  resolveArcadeMarquee,
  resolveArchitectureArtworkScreen,
  resolveApiScreen,
  resolveAutomationScreen,
  resolveContactBookScreen,
  resolveExperienceArtworkScreen,
  resolvePerformanceScreen,
  resolveProfileArtworkScreen,
  resolveTerminalScreen,
  type ArcadeScreenCoverage,
  type ArcadeScreenPlacement,
  type EmbeddedScreenId
} from '../arcade-screen';
import {
  constrainPortfolio3dCameraPosition,
  createLookAtQuaternion,
  easePortfolio3dCameraTransition,
  getPortfolio3dCameraPresetForSection
} from '../camera-navigation';
import {
  criticalPortfolio3dAssetIds,
  portfolio3dAssetById
} from '../scene-manifest';
import { portfolio3dSectionContracts } from '../section-contracts';
import { usePortfolio3dState } from '../state/Portfolio3dState';
import type {
  Portfolio3dAssetId,
  Portfolio3dCameraPreset,
  Portfolio3dLoadingProgress,
  Portfolio3dQualityTier,
  SceneAssetDefinition
} from '../types';
import { DynamicScreenLayer } from './DynamicScreenLayer';
import { ArcadeMarqueeDisplay } from './ArcadeMarqueeDisplay';
import { ArcadeScreenSurface, maximumMobileScreenZoom } from './ArcadeScreenSurface';
import { EmbeddedScreenLayer } from './EmbeddedScreenLayer';
import { HotspotInteractionLayer } from './HotspotInteractionLayer';
import { SceneAsset, type AssetRuntimeNodeMap } from './SceneAsset';
import { SceneAssetBoundary } from './SceneAssetBoundary';

const roomShellAsset = portfolio3dAssetById['room-shell'];
const criticalAssets = criticalPortfolio3dAssetIds.map((assetId) => portfolio3dAssetById[assetId]);
// Modular GLB assets are paused while the full-room haker_room.glb preview is evaluated.
const anchoredSceneAssets: readonly SceneAssetDefinition[] = [];
const initiallyEnabledAnchoredAssetIds = [] as const satisfies readonly Portfolio3dAssetId[];
const progressiveAssetOrder = [] as const satisfies readonly Portfolio3dAssetId[];
const isSingleRoomPreview = anchoredSceneAssets.length === 0;

const profileScreenCoverage = {
  horizontalCoverage: 0.87,
  verticalCoverage: 0.9
} as const satisfies ArcadeScreenCoverage;
const experienceScreenCoverage = {
  horizontalCoverage: 0.938,
  verticalCoverage: 0.9
} as const satisfies ArcadeScreenCoverage;
const architectureScreenCoverage = {
  horizontalCoverage: 0.94,
  verticalCoverage: 0.9
} as const satisfies ArcadeScreenCoverage;
const pipelineScreenCoverage = {
  horizontalCoverage: 0.855,
  verticalCoverage: 0.699
} as const satisfies ArcadeScreenCoverage;
const automationScreenCoverage = {
  horizontalCoverage: 0.855,
  verticalCoverage: 0.699
} as const satisfies ArcadeScreenCoverage;
const performanceScreenCoverage = {
  horizontalCoverage: 0.93,
  verticalCoverage: 0.95
} as const satisfies ArcadeScreenCoverage;
const backendScreenCoverage = {
  horizontalCoverage: 0.898,
  verticalCoverage: 0.85
} as const satisfies ArcadeScreenCoverage;
const terminalScreenCoverage = {
  horizontalCoverage: 0.9,
  verticalCoverage: 0.6
} as const satisfies ArcadeScreenCoverage;
const contactScreenCoverage = {
  horizontalCoverage: 0.906,
  verticalCoverage: 0.9
} as const satisfies ArcadeScreenCoverage;

const embeddedScreenCoverageById = {
  profile: profileScreenCoverage,
  experience: experienceScreenCoverage,
  architecture: architectureScreenCoverage,
  pipeline: pipelineScreenCoverage,
  automation: automationScreenCoverage,
  performance: performanceScreenCoverage,
  backend: backendScreenCoverage,
  terminal: terminalScreenCoverage,
  contact: contactScreenCoverage
} as const;

type EmbeddedScreenZoomById = Readonly<Partial<Record<EmbeddedScreenId, number>>>;

type EmbeddedScreenMobileCameraConfig = Readonly<{
  maxDistance: number;
  lateralOffset: number;
}>;

// Portrait viewport camera rules stay separate per physical screen.
const automationMobileCamera = {
  maxDistance: 1.02,
  lateralOffset: 0
} as const satisfies EmbeddedScreenMobileCameraConfig;
const backendMobileCamera = {
  // Stay on the screen normal; the wider lens clears the chair without
  // introducing an oblique view of the monitor.
  maxDistance: 0.76,
  lateralOffset: 0
} as const satisfies EmbeddedScreenMobileCameraConfig;

export function PortfolioSceneStage({
  qualityTier = 'high',
  onCriticalProgressChange,
  onEmbeddedScreenReady
}: Readonly<{
  qualityTier?: Portfolio3dQualityTier;
  onCriticalProgressChange?: (progress: Portfolio3dLoadingProgress) => void;
  onEmbeddedScreenReady?: (screenId: EmbeddedScreenId, element: HTMLElement | null) => void;
}>): React.ReactElement {
  const { state } = usePortfolio3dState();
  const [runtimeNodesByAsset, setRuntimeNodesByAsset] = useState<
    Readonly<Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>>>
  >({});
  const [loadedAssetIds, setLoadedAssetIds] = useState<readonly Portfolio3dAssetId[]>([]);
  const [failedAssetIds, setFailedAssetIds] = useState<readonly Portfolio3dAssetId[]>([]);
  const [enabledAnchoredAssetIds, setEnabledAnchoredAssetIds] = useState<readonly Portfolio3dAssetId[]>(initiallyEnabledAnchoredAssetIds);
  const [embeddedScreenZoomById, setEmbeddedScreenZoomById] = useState<EmbeddedScreenZoomById>({});

  const roomNodes = runtimeNodesByAsset['room-shell'];
  const arcadeScreen = useMemo(() => roomNodes ? resolveArcadeScreen(roomNodes.root) : undefined, [roomNodes]);
  const arcadeMarquee = useMemo(() => roomNodes ? resolveArcadeMarquee(roomNodes.root) : undefined, [roomNodes]);
  const automationScreen = useMemo(() => roomNodes ? resolveAutomationScreen(roomNodes.root) : undefined, [roomNodes]);
  const performanceScreen = useMemo(() => roomNodes ? resolvePerformanceScreen(roomNodes.root) : undefined, [roomNodes]);
  const apiScreen = useMemo(() => roomNodes ? resolveApiScreen(roomNodes.root) : undefined, [roomNodes]);
  const terminalScreen = useMemo(() => roomNodes ? resolveTerminalScreen(roomNodes.root) : undefined, [roomNodes]);
  const profileArtworkScreen = useMemo(() => roomNodes ? resolveProfileArtworkScreen(roomNodes.root) : undefined, [roomNodes]);
  const experienceArtworkScreen = useMemo(() => roomNodes ? resolveExperienceArtworkScreen(roomNodes.root) : undefined, [roomNodes]);
  const architectureArtworkScreen = useMemo(() => roomNodes ? resolveArchitectureArtworkScreen(roomNodes.root) : undefined, [roomNodes]);
  const contactBookScreen = useMemo(() => roomNodes ? resolveContactBookScreen(roomNodes.root) : undefined, [roomNodes]);
  const embeddedScreens = useMemo(
    () => ({
      profile: architectureArtworkScreen,
      experience: experienceArtworkScreen,
      architecture: profileArtworkScreen,
      pipeline: arcadeScreen,
      automation: automationScreen,
      performance: performanceScreen,
      backend: apiScreen,
      terminal: terminalScreen,
      contact: contactBookScreen
    }),
    [arcadeScreen, apiScreen, architectureArtworkScreen, automationScreen, contactBookScreen, experienceArtworkScreen, performanceScreen, profileArtworkScreen, terminalScreen]
  );
  const canRenderAnchoredAssets = Boolean(roomNodes);
  const loadedCriticalAssetIds = criticalPortfolio3dAssetIds.filter((assetId) => loadedAssetIds.includes(assetId));
  const failedCriticalAssetIds = criticalPortfolio3dAssetIds.filter((assetId) => failedAssetIds.includes(assetId));
  const criticalComplete = loadedCriticalAssetIds.length + failedCriticalAssetIds.length >= criticalAssets.length;
  const enabledAssetsSettled = enabledAnchoredAssetIds.every(
    (assetId) => Boolean(runtimeNodesByAsset[assetId]) || failedAssetIds.includes(assetId)
  );

  const activePrimaryAssetId = useMemo(
    () =>
      portfolio3dSectionContracts.find((contract) => contract.id === state.activeSectionId)
        ?.primaryAssetId,
    [state.activeSectionId]
  );
  const enabledAnchoredAssetIdSet = useMemo(
    () => new Set<Portfolio3dAssetId>(enabledAnchoredAssetIds),
    [enabledAnchoredAssetIds]
  );

  const visibleAnchoredAssets = useMemo(
    () =>
      anchoredSceneAssets.filter((asset) =>
        shouldRenderSceneAsset({
          asset,
          activePrimaryAssetId,
          enabledAnchoredAssetIds: enabledAnchoredAssetIdSet,
          qualityTier
        })
      ),
    [activePrimaryAssetId, enabledAnchoredAssetIdSet, qualityTier]
  );

  useEffect(() => {
    onCriticalProgressChange?.({
      totalCriticalAssets: criticalAssets.length,
      loadedCriticalAssets: loadedCriticalAssetIds.length,
      failedCriticalAssets: failedCriticalAssetIds.length,
      isCriticalComplete: criticalComplete
    });
  }, [criticalComplete, failedCriticalAssetIds.length, loadedCriticalAssetIds.length, onCriticalProgressChange]);

  useEffect(() => {
    if (!criticalComplete || !canRenderAnchoredAssets) {
      return;
    }

    const isActiveAssetMissing = Boolean(
      activePrimaryAssetId &&
      activePrimaryAssetId !== 'room-shell' &&
      !enabledAnchoredAssetIds.includes(activePrimaryAssetId)
    );

    if (!isActiveAssetMissing && !enabledAssetsSettled) {
      return;
    }

    const nextAssetId = getNextProgressiveAssetId(enabledAnchoredAssetIds, activePrimaryAssetId);
    if (!nextAssetId) {
      return;
    }

    const delayMs = enabledAnchoredAssetIds.length === 0 || nextAssetId === activePrimaryAssetId ? 180 : 780;
    const enableNextAsset = (): void => {
      setEnabledAnchoredAssetIds((current) =>
        current.includes(nextAssetId) ? current : [...current, nextAssetId]
      );
    };

    if (nextAssetId === activePrimaryAssetId) {
      const timeoutId = window.setTimeout(enableNextAsset, 0);
      return () => window.clearTimeout(timeoutId);
    }

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(enableNextAsset, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(enableNextAsset, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [
    activePrimaryAssetId,
    canRenderAnchoredAssets,
    criticalComplete,
    enabledAnchoredAssetIds,
    enabledAssetsSettled
  ]);

  const handleNodesMapped = useCallback((nodes: AssetRuntimeNodeMap): void => {
    setRuntimeNodesByAsset((current) => ({ ...current, [nodes.assetId]: nodes }));
  }, []);

  const handleNodesUnmapped = useCallback((assetId: Portfolio3dAssetId): void => {
    setRuntimeNodesByAsset((current) => {
      if (!current[assetId]) {
        return current;
      }

      const next: Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>> = { ...current };
      delete next[assetId];

      return next;
    });
  }, []);

  const handleAssetReady = useCallback((assetId: Portfolio3dAssetId): void => {
    setLoadedAssetIds((current) => current.includes(assetId) ? current : [...current, assetId]);
  }, []);

  const handleAssetError = useCallback((assetId: Portfolio3dAssetId): void => {
    setFailedAssetIds((current) => current.includes(assetId) ? current : [...current, assetId]);
  }, []);

  const handleEmbeddedScreenZoomChange = useCallback((screenId: EmbeddedScreenId, scale: number): void => {
    const nextScale = clampEmbeddedScreenZoom(scale);
    setEmbeddedScreenZoomById((current) => {
      const currentScale = current[screenId] ?? 1;
      return Math.abs(currentScale - nextScale) < 0.005
        ? current
        : { ...current, [screenId]: nextScale };
    });
  }, []);

  return (
    <>
      <InteractiveOrbitControls />
      <SceneInvalidationController
        qualityTier={qualityTier}
        runtimeNodesByAsset={runtimeNodesByAsset}
      />
      <SceneShaderWarmup ready={criticalComplete && Boolean(roomNodes)} />
      <CameraNavigationRig
        runtimeNodesByAsset={runtimeNodesByAsset}
        embeddedScreens={embeddedScreens}
        embeddedScreenZoomById={embeddedScreenZoomById}
      />
      <CameraDebugOverlay />
      <SceneAssetBoundary asset={roomShellAsset} onError={handleAssetError}>
        <SceneAsset
          asset={roomShellAsset}
          onReady={handleAssetReady}
          onNodesMapped={handleNodesMapped}
          onNodesUnmapped={handleNodesUnmapped}
        />
      </SceneAssetBoundary>

      {canRenderAnchoredAssets && visibleAnchoredAssets.length > 0
        ? visibleAnchoredAssets.map((asset) => (
            <SceneAssetBoundary key={asset.id} asset={asset} onError={handleAssetError}>
              <Suspense fallback={null}>
                <SceneAsset
                  asset={asset}
                  roomAnchors={roomNodes?.anchors}
                  onReady={handleAssetReady}
                  onNodesMapped={handleNodesMapped}
                  onNodesUnmapped={handleNodesUnmapped}
                />
              </Suspense>
            </SceneAssetBoundary>
          ))
        : null}

      <EmbeddedScreenLayer>
        {arcadeScreen ? (
          <ArcadeScreenSurface screen={arcadeScreen} screenId="pipeline" onScreenReady={onEmbeddedScreenReady} onScreenZoomChange={handleEmbeddedScreenZoomChange} />
        ) : null}
        {automationScreen ? (
          <ArcadeScreenSurface screen={automationScreen} screenId="automation" onScreenReady={onEmbeddedScreenReady} onScreenZoomChange={handleEmbeddedScreenZoomChange} />
        ) : null}
        {performanceScreen ? (
          <ArcadeScreenSurface screen={performanceScreen} screenId="performance" onScreenReady={onEmbeddedScreenReady} onScreenZoomChange={handleEmbeddedScreenZoomChange} />
        ) : null}
        {apiScreen ? (
          <ArcadeScreenSurface screen={apiScreen} screenId="backend" onScreenReady={onEmbeddedScreenReady} onScreenZoomChange={handleEmbeddedScreenZoomChange} />
        ) : null}
        {terminalScreen ? (
          <ArcadeScreenSurface screen={terminalScreen} screenId="terminal" onScreenReady={onEmbeddedScreenReady} onScreenZoomChange={handleEmbeddedScreenZoomChange} />
        ) : null}
        {architectureArtworkScreen ? (
          <ArcadeScreenSurface screen={architectureArtworkScreen} screenId="profile" onScreenReady={onEmbeddedScreenReady} onScreenZoomChange={handleEmbeddedScreenZoomChange} />
        ) : null}
        {experienceArtworkScreen ? (
          <ArcadeScreenSurface screen={experienceArtworkScreen} screenId="experience" onScreenReady={onEmbeddedScreenReady} onScreenZoomChange={handleEmbeddedScreenZoomChange} />
        ) : null}
        {profileArtworkScreen ? (
          <ArcadeScreenSurface screen={profileArtworkScreen} screenId="architecture" onScreenReady={onEmbeddedScreenReady} onScreenZoomChange={handleEmbeddedScreenZoomChange} />
        ) : null}
        {contactBookScreen ? (
          <ArcadeScreenSurface screen={contactBookScreen} screenId="contact" onScreenReady={onEmbeddedScreenReady} onScreenZoomChange={handleEmbeddedScreenZoomChange} />
        ) : null}
      </EmbeddedScreenLayer>
      {arcadeMarquee ? <ArcadeMarqueeDisplay marquee={arcadeMarquee} /> : null}

      {!isSingleRoomPreview ? (
        <DynamicScreenLayer runtimeNodesByAsset={runtimeNodesByAsset} />
      ) : null}
      {qualityTier === 'high' && !isSingleRoomPreview ? (
        <HotspotInteractionLayer runtimeNodesByAsset={runtimeNodesByAsset} />
      ) : null}
    </>
  );
}

function CameraDebugOverlay(): null {
  const { camera } = useThree();
  const { state } = usePortfolio3dState();

  useFrame(() => {
    // Expose camera position on window for live debugging via DevTools console.
    // Open browser console and run: setInterval(() => console.log(window.__dbgCam), 500)
    (window as unknown as Record<string, unknown>).__dbgCam = {
      pos: camera.position.toArray().map((v: number) => +v.toFixed(3)),
      section: state.activeSectionId,
      navState: state.navigationState,
    };
  });

  return null;
}

// Shared ref so CameraNavigationRig can disable/update OrbitControls during transitions.
const sharedOrbitControlsRef: { current: OrbitControlsImpl | null } = { current: null };
const overviewOrbitZoomBounds = {
  minDistance: 2.8,
  maxDistance: 8,
  minDistanceScale: 0.55,
  maxDistanceScale: 1.25,
  mobileMinDistanceScale: 0.42,
  mobileMaxDistanceScale: 1.02
} as const;

function InteractiveOrbitControls(): null {
  const { camera, gl, invalidate } = useThree();
  const { state } = usePortfolio3dState();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    const controls = new OrbitControlsImpl(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.5;
    controls.panSpeed = 0.8;
    controls.enablePan = false;
    controls.minDistance = overviewOrbitZoomBounds.minDistance;
    controls.maxDistance = overviewOrbitZoomBounds.maxDistance;
    controls.minPolarAngle = 1.04;
    controls.maxPolarAngle = 1.4;

    const onChange = (): void => {
      invalidate();
    };

    controls.addEventListener('change', onChange);
    sharedOrbitControlsRef.current = controls;
    controlsRef.current = controls;

    return () => {
      controls.removeEventListener('change', onChange);
      controls.dispose();
      sharedOrbitControlsRef.current = null;
      controlsRef.current = null;
    };
  }, [camera, gl.domElement, invalidate]);

  useFrame(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    // Only run orbit damping in overview — prevent fighting camera animation.
    if (state.navigationState === 'overview') {
      ctrl.enabled = true;
      ctrl.update();
    } else {
      ctrl.enabled = false;
    }
  }, -2);

  return null;
}

function SceneInvalidationController({
  qualityTier,
  runtimeNodesByAsset
}: Readonly<{
  qualityTier: Portfolio3dQualityTier;
  runtimeNodesByAsset: Readonly<Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>>>;
}>): null {
  const { invalidate } = useThree();
  const { state } = usePortfolio3dState();

  useEffect(() => {
    invalidate();
  }, [
    invalidate,
    qualityTier,
    runtimeNodesByAsset,
    state.activeSectionId,
    state.ceilingLightAim,
    state.ceilingLightingLevel,
    state.deskTaskLightingLevel,
    state.focusedHotspotId,
    state.hoveredHotspotId,
    state.lightingMode,
    state.navigationState,
    state.roomLightingLevel
  ]);

  return null;
}

function SceneShaderWarmup({ ready }: Readonly<{
  ready: boolean;
}>): null {
  const { camera, gl, invalidate, scene } = useThree();
  const warmedUpRef = useRef(false);

  useEffect(() => {
    if (!ready || warmedUpRef.current) return;

    let cancelled = false;
    const warmUp = (): void => {
      if (cancelled) return;
      warmedUpRef.current = true;
      // Prepare materials after the full room and environment are mounted so
      // the first screen transition is not where shader compilation happens.
      void gl.compileAsync(scene, camera)
        .then(() => {
          if (!cancelled) invalidate();
        })
        .catch(() => {
          // Rendering remains functional when a browser cannot compile early.
        });
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(warmUp, { timeout: 1200 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(warmUp, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [camera, gl, invalidate, ready, scene]);

  return null;
}

function shouldRenderSceneAsset({
  asset,
  activePrimaryAssetId,
  enabledAnchoredAssetIds,
  qualityTier
}: Readonly<{
  asset: SceneAssetDefinition;
  activePrimaryAssetId?: Portfolio3dAssetId;
  enabledAnchoredAssetIds: ReadonlySet<Portfolio3dAssetId>;
  qualityTier: Portfolio3dQualityTier;
}>): boolean {

  if (!asset.qualityVisibility[qualityTier]) {
    return false;
  }

  if (activePrimaryAssetId === asset.id) {
    return true;
  }

  return enabledAnchoredAssetIds.has(asset.id);
}

function getNextProgressiveAssetId(
  enabledAssetIds: readonly Portfolio3dAssetId[],
  activePrimaryAssetId?: Portfolio3dAssetId
): Portfolio3dAssetId | undefined {
  if (progressiveAssetOrder.length === 0) {
    return undefined;
  }

  if (activePrimaryAssetId && activePrimaryAssetId !== 'room-shell' && !enabledAssetIds.includes(activePrimaryAssetId)) {
    return activePrimaryAssetId;
  }

  return progressiveAssetOrder.find((assetId) => !enabledAssetIds.includes(assetId));
}

interface CameraTransitionState {
  readonly activeSectionId: string;
  readonly finalNavigationState: 'overview' | 'section-open';
  readonly startedAt: number;
  readonly durationMs: number;
  readonly startPosition: THREE.Vector3;
  readonly targetPosition: THREE.Vector3;
  readonly targetLookAt: THREE.Vector3;
  readonly startQuaternion: THREE.Quaternion;
  readonly targetQuaternion: THREE.Quaternion;
  readonly smoothLens: boolean;
  readonly startFov: number;
  readonly targetFov: number;
}

function CameraNavigationRig({
  runtimeNodesByAsset,
  embeddedScreens,
  embeddedScreenZoomById
}: Readonly<{
  runtimeNodesByAsset: Readonly<Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>>>;
  embeddedScreens: Readonly<Partial<Record<EmbeddedScreenId, ArcadeScreenPlacement>>>;
  embeddedScreenZoomById: EmbeddedScreenZoomById;
}>): null {
  const { camera, invalidate, size } = useThree();
  const { state, setNavigationState } = usePortfolio3dState();
  const prefersReducedMotion = useReducedMotion();
  const transitionRef = useRef<CameraTransitionState | null>(null);
  const initializedRef = useRef(false);
  const overviewBoundsAppliedRef = useRef(false);
  const overviewViewportRef = useRef('');
  const screenJourneyRef = useRef(false);

  useEffect(() => {
    const isMobileViewport = size.width < 768;
    const isPortraitMobile = isMobileViewport && size.height > size.width;
    const preset = getPortfolio3dCameraPresetForSection(state.activeSectionId);
    const embeddedScreenId = getEmbeddedScreenId(state.activeSectionId);
    const embeddedScreen = embeddedScreenId ? embeddedScreens[embeddedScreenId] : undefined;
    if (embeddedScreenId && !runtimeNodesByAsset['room-shell']) return;
    const target = embeddedScreen ? embeddedScreen.position : resolveCameraTarget(preset, runtimeNodesByAsset);
    const screenCoverageConfig = embeddedScreenId
      ? embeddedScreenCoverageById[embeddedScreenId]
      : undefined;
    const screenCoverage = screenCoverageConfig;
    const mobileScreenCamera = getEmbeddedScreenMobileCameraConfig(
      embeddedScreenId,
      size.width,
      size.height
    );
    const baseTargetFov = getEmbeddedScreenTargetFov(
      preset.fov,
      embeddedScreen,
      screenCoverage,
      mobileScreenCamera,
      size.width,
      size.height
    );
    const targetFov = embeddedScreenId
      ? getEmbeddedScreenZoomedFov(baseTargetFov, embeddedScreenZoomById[embeddedScreenId] ?? 1)
      : baseTargetFov;
    const isArtworkScreen = embeddedScreenId === 'profile' || embeddedScreenId === 'experience' || embeddedScreenId === 'architecture' || embeddedScreenId === 'contact';
    const targetPosition = embeddedScreen
      ? getArcadeCameraPosition(
        embeddedScreen,
        size.width / Math.max(size.height, 1),
        baseTargetFov,
        screenCoverage
      )
      : constrainPortfolio3dCameraPosition(new THREE.Vector3(...preset.position));
    if (embeddedScreen && mobileScreenCamera?.lateralOffset) {
      const screenRight = new THREE.Vector3(1, 0, 0)
        .applyQuaternion(embeddedScreen.quaternion)
        .normalize();
      targetPosition.addScaledVector(screenRight, mobileScreenCamera.lateralOffset);
    }
    if (preset.id === 'overview' && isPortraitMobile) {
      const direction = targetPosition.clone().sub(target);
      const framingScale = Math.min(3.2, Math.max(1, 1.35 * size.height / Math.max(size.width, 1)));
      targetPosition.copy(target).addScaledVector(direction, framingScale);
    }
    const targetQuaternion = createLookAtQuaternion(
      targetPosition,
      target,
      isArtworkScreen && embeddedScreen
        ? new THREE.Vector3(0, 1, 0).applyQuaternion(embeddedScreen.quaternion)
        : undefined
    );
    const hasRoomBounds = Boolean(runtimeNodesByAsset['room-shell']?.bounds);
    const viewportKey = `${size.width}:${size.height}`;

    if (!initializedRef.current && state.activeSectionId === 'overview') {
      initializedRef.current = true;
      overviewBoundsAppliedRef.current = hasRoomBounds;
      overviewViewportRef.current = viewportKey;
      applyCameraState(camera, preset, targetPosition, targetQuaternion, targetFov);
      syncOverviewOrbitControls(camera, target, isMobileViewport);
      invalidate();
      return;
    }

    initializedRef.current = true;

    if (
      state.activeSectionId === 'overview' &&
      state.navigationState === 'overview' &&
      hasRoomBounds &&
      (!overviewBoundsAppliedRef.current || overviewViewportRef.current !== viewportKey)
    ) {
      overviewBoundsAppliedRef.current = true;
      overviewViewportRef.current = viewportKey;
      applyCameraState(camera, preset, targetPosition, targetQuaternion, targetFov);
      syncOverviewOrbitControls(camera, target, isMobileViewport);
      invalidate();
      return;
    }

    if (embeddedScreen && state.navigationState === 'section-open') {
      applyCameraState(camera, preset, targetPosition, targetQuaternion, targetFov);
      invalidate();
      return;
    }

    if (state.navigationState !== 'focusing' && state.navigationState !== 'returning') {
      return;
    }

    const isScreenJourney = Boolean(embeddedScreenId) ||
      (state.activeSectionId === 'overview' && screenJourneyRef.current);
    screenJourneyRef.current = isScreenJourney;

    transitionRef.current = {
      activeSectionId: state.activeSectionId,
      finalNavigationState: state.activeSectionId === 'overview' ? 'overview' : 'section-open',
      startedAt: performance.now(),
      durationMs: prefersReducedMotion ? preset.reducedMotionMs : isScreenJourney ? Math.max(900, preset.transitionMs) : preset.transitionMs,
      startPosition: camera.position.clone(),
      targetPosition,
      targetLookAt: target.clone(),
      startQuaternion: camera.quaternion.clone(),
      targetQuaternion,
      smoothLens: isScreenJourney,
      startFov: camera instanceof THREE.PerspectiveCamera ? camera.fov : targetFov,
      targetFov
    };

    // Disable OrbitControls immediately so it doesn't fight the transition.
    if (sharedOrbitControlsRef.current) {
      sharedOrbitControlsRef.current.enabled = false;
    }

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.near = preset.near;
      camera.far = preset.far;
      if (!isScreenJourney) camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
    invalidate();
  }, [camera, embeddedScreenZoomById, embeddedScreens, invalidate, prefersReducedMotion, runtimeNodesByAsset, size.width, size.height, state.activeSectionId, state.navigationState]);

  useFrame((rootState) => {
    const transition = transitionRef.current;
    if (!transition) {
      return;
    }

    const progress = transition.durationMs <= 0
      ? 1
      : (performance.now() - transition.startedAt) / transition.durationMs;
    const easedProgress = transition.smoothLens
      ? THREE.MathUtils.smootherstep(progress, 0, 1)
      : easePortfolio3dCameraTransition(progress);

    camera.position.lerpVectors(transition.startPosition, transition.targetPosition, easedProgress);
    camera.quaternion.slerpQuaternions(transition.startQuaternion, transition.targetQuaternion, easedProgress);
    if (transition.smoothLens && camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(transition.startFov, transition.targetFov, easedProgress);
      camera.updateProjectionMatrix();
    }

    if (progress < 1) {
      rootState.invalidate();
      return;
    }

    camera.position.copy(transition.targetPosition);
    camera.quaternion.copy(transition.targetQuaternion);
    transitionRef.current = null;

    // After landing, update OrbitControls target so it orbits around the look-at point.
    // Only re-enable controls in overview; in section views keep them off.
    if (sharedOrbitControlsRef.current) {
      sharedOrbitControlsRef.current.target.copy(transition.targetLookAt);
      sharedOrbitControlsRef.current.enabled = transition.finalNavigationState === 'overview';
      // OrbitControls.lookAt uses world-up and would undo the artwork's camera roll.
      if (transition.finalNavigationState === 'overview') {
        syncOverviewOrbitControls(
          camera,
          transition.targetLookAt,
          size.width < 768
        );
      }
    }

    if (transition.finalNavigationState === 'overview') screenJourneyRef.current = false;
    setNavigationState(transition.finalNavigationState);
    rootState.invalidate();
  }, -1);

  return null;
}

function syncOverviewOrbitControls(
  camera: THREE.Camera,
  target: THREE.Vector3,
  isMobileViewport = false
): void {
  const controls = sharedOrbitControlsRef.current;
  if (!controls) {
    return;
  }

  // OrbitControls keeps drag and wheel momentum in private runtime fields.
  // Clear them before syncing so the next frame cannot re-apply the old view.
  const internals = controls as unknown as {
    _sphericalDelta?: THREE.Spherical;
    _panOffset?: THREE.Vector3;
    _scale?: number;
    _zoomChanged?: boolean;
  };
  internals._sphericalDelta?.set(0, 0, 0);
  internals._panOffset?.set(0, 0, 0);
  if (internals._scale !== undefined) internals._scale = 1;
  if (internals._zoomChanged !== undefined) internals._zoomChanged = false;

  controls.target.copy(target);
  const offset = camera.position.clone().sub(target);
  const overviewDistance = offset.length();
  const overviewAzimuth = Math.atan2(offset.x, offset.z);
  const azimuthRange = 0.32;
  const minDistanceScale = isMobileViewport
    ? overviewOrbitZoomBounds.mobileMinDistanceScale
    : overviewOrbitZoomBounds.minDistanceScale;
  const maxDistanceScale = isMobileViewport
    ? overviewOrbitZoomBounds.mobileMaxDistanceScale
    : overviewOrbitZoomBounds.maxDistanceScale;

  controls.minDistance = Math.max(
    overviewOrbitZoomBounds.minDistance,
    overviewDistance * minDistanceScale
  );
  controls.maxDistance = Math.max(
    overviewOrbitZoomBounds.maxDistance,
    overviewDistance * maxDistanceScale
  );
  controls.minAzimuthAngle = overviewAzimuth - azimuthRange;
  controls.maxAzimuthAngle = overviewAzimuth + azimuthRange;

  controls.update();
}

function getEmbeddedScreenId(sectionId: string): EmbeddedScreenId | undefined {
  return sectionId === 'profile' || sectionId === 'experience' || sectionId === 'architecture' || sectionId === 'pipeline' || sectionId === 'automation' || sectionId === 'performance' || sectionId === 'backend' || sectionId === 'terminal' || sectionId === 'contact'
    ? sectionId
    : undefined;
}

function getEmbeddedScreenMobileCameraConfig(
  screenId: EmbeddedScreenId | undefined,
  viewportWidth: number,
  viewportHeight: number
): EmbeddedScreenMobileCameraConfig | undefined {
  if (viewportWidth >= 768 || viewportHeight <= viewportWidth) {
    return undefined;
  }

  if (screenId === 'automation') return automationMobileCamera;
  if (screenId === 'backend') return backendMobileCamera;
  return undefined;
}

function getEmbeddedScreenTargetFov(
  presetFov: number,
  screen: ArcadeScreenPlacement | undefined,
  coverage: ArcadeScreenCoverage | undefined,
  mobileCamera: EmbeddedScreenMobileCameraConfig | undefined,
  viewportWidth: number,
  viewportHeight: number
): number {
  if (!screen || !coverage || !mobileCamera) {
    return presetFov;
  }

  // The derived FOV keeps the camera in front of the physical monitor.
  const aspect = viewportWidth / Math.max(viewportHeight, 1);
  const horizontalCoverage = Math.max(coverage.horizontalCoverage, 0.1);
  const fovTangent = screen.width / (
    2 *
    mobileCamera.maxDistance *
    Math.max(aspect, 0.1) *
    horizontalCoverage
  );
  const fittingFov = THREE.MathUtils.radToDeg(2 * Math.atan(fovTangent));

  // Keep the result usable on small phones without changing desktop optics.
  return Math.min(82, Math.max(presetFov, fittingFov));
}

function getEmbeddedScreenZoomedFov(baseFov: number, zoom: number): number {
  // Camera FOV controls the CSS3D document and the GLB together, so the
  // physical bezel and nearby room remain locked to the enlarged page.
  return Math.min(baseFov, Math.max(12, baseFov / clampEmbeddedScreenZoom(zoom)));
}

function clampEmbeddedScreenZoom(value: number): number {
  return Number.isFinite(value)
    ? Math.min(Math.max(value, 1), maximumMobileScreenZoom)
    : 1;
}

function applyCameraState(
  camera: THREE.Camera,
  preset: Portfolio3dCameraPreset,
  position: THREE.Vector3,
  quaternion: THREE.Quaternion,
  fov = preset.fov
): void {
  camera.position.copy(position);
  camera.quaternion.copy(quaternion);

  if (camera instanceof THREE.PerspectiveCamera) {
    camera.near = preset.near;
    camera.far = preset.far;
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}

function resolveCameraTarget(
  preset: Portfolio3dCameraPreset,
  _runtimeNodesByAsset: Readonly<Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>>>
): THREE.Vector3 {
  return new THREE.Vector3(...preset.target);
}

function findRuntimeNode(
  nodeName: string,
  runtimeNodesByAsset: Readonly<Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>>>
): THREE.Object3D | undefined {
  for (const nodes of Object.values(runtimeNodesByAsset)) {
    if (!nodes) {
      continue;
    }

    const mappedNode =
      nodes.anchors.get(nodeName) ?? nodes.hotspots.get(nodeName) ?? nodes.screens.get(nodeName);

    if (mappedNode) {
      return mappedNode;
    }

    if (nodes.root.name === nodeName) {
      return nodes.root;
    }

    const foundInRoot = nodes.root.getObjectByName(nodeName);
    if (foundInRoot) {
      return foundInRoot;
    }
  }

  return undefined;
}

function getObjectFocusPoint(object: THREE.Object3D): THREE.Vector3 {
  const bounds = new THREE.Box3().setFromObject(object);
  const target = new THREE.Vector3();

  if (!bounds.isEmpty()) {
    bounds.getCenter(target);
    return target;
  }

  object.getWorldPosition(target);
  return target;
}


export function getPortfolioSceneCriticalAssets(): readonly SceneAssetDefinition[] {
  return criticalAssets;
}
