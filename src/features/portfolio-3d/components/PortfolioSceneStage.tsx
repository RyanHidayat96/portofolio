'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import { useReducedMotion } from '@/features/interaction/hooks/useReducedMotion';
import {
  getArcadeCameraPosition,
  resolveArcadeScreen,
  resolveArchitectureArtworkScreen,
  resolveApiScreen,
  resolveAutomationScreen,
  resolveContactBookScreen,
  resolveExperienceArtworkScreen,
  resolvePerformanceScreen,
  resolveProfileArtworkScreen,
  resolveTerminalScreen,
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
import { ArcadeScreenSurface } from './ArcadeScreenSurface';
import { HotspotInteractionLayer } from './HotspotInteractionLayer';
import { PortfolioLightingRig } from './PortfolioLightingRig';
import { SceneAsset, type AssetRuntimeNodeMap } from './SceneAsset';
import { SceneAssetBoundary } from './SceneAssetBoundary';

const roomShellAsset = portfolio3dAssetById['room-shell'];
const criticalAssets = criticalPortfolio3dAssetIds.map((assetId) => portfolio3dAssetById[assetId]);
// Modular GLB assets are paused while the full-room haker_room.glb preview is evaluated.
const anchoredSceneAssets: readonly SceneAssetDefinition[] = [];
const initiallyEnabledAnchoredAssetIds = [] as const satisfies readonly Portfolio3dAssetId[];
const progressiveAssetOrder = [] as const satisfies readonly Portfolio3dAssetId[];
const isSingleRoomPreview = anchoredSceneAssets.length === 0;

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

  const roomNodes = runtimeNodesByAsset['room-shell'];
  const arcadeScreen = useMemo(() => roomNodes ? resolveArcadeScreen(roomNodes.root) : undefined, [roomNodes]);
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

  return (
    <>
      <InteractiveOrbitControls />
      <SceneInvalidationController
        qualityTier={qualityTier}
        runtimeNodesByAsset={runtimeNodesByAsset}
      />
      <CameraNavigationRig
        runtimeNodesByAsset={runtimeNodesByAsset}
        embeddedScreens={embeddedScreens}
      />
      <CameraDebugOverlay />
      {isSingleRoomPreview ? (
        <SingleRoomPreviewLighting />
      ) : (
        <PortfolioLightingRig
          runtimeNodesByAsset={runtimeNodesByAsset}
          qualityTier={qualityTier}
          lightingMode={state.lightingMode}
          roomLightingLevel={state.roomLightingLevel}
          ceilingLightingLevel={state.ceilingLightingLevel}
          ceilingLightAim={state.ceilingLightAim}
          deskTaskLightingLevel={state.deskTaskLightingLevel}
        />
      )}

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

      {arcadeScreen ? (
        <ArcadeScreenSurface screen={arcadeScreen} screenId="pipeline" onScreenReady={onEmbeddedScreenReady} />
      ) : null}
      {automationScreen ? (
        <ArcadeScreenSurface screen={automationScreen} screenId="automation" onScreenReady={onEmbeddedScreenReady} />
      ) : null}
      {performanceScreen ? (
        <ArcadeScreenSurface screen={performanceScreen} screenId="performance" onScreenReady={onEmbeddedScreenReady} />
      ) : null}
      {apiScreen ? (
        <ArcadeScreenSurface screen={apiScreen} screenId="backend" onScreenReady={onEmbeddedScreenReady} />
      ) : null}
      {terminalScreen ? (
        <ArcadeScreenSurface screen={terminalScreen} screenId="terminal" onScreenReady={onEmbeddedScreenReady} />
      ) : null}
      {architectureArtworkScreen ? (
        <ArcadeScreenSurface screen={architectureArtworkScreen} screenId="profile" onScreenReady={onEmbeddedScreenReady} />
      ) : null}
      {experienceArtworkScreen ? (
        <ArcadeScreenSurface screen={experienceArtworkScreen} screenId="experience" onScreenReady={onEmbeddedScreenReady} />
      ) : null}
      {profileArtworkScreen ? (
        <ArcadeScreenSurface screen={profileArtworkScreen} screenId="architecture" onScreenReady={onEmbeddedScreenReady} />
      ) : null}
      {contactBookScreen ? (
        <ArcadeScreenSurface screen={contactBookScreen} screenId="contact" onScreenReady={onEmbeddedScreenReady} />
      ) : null}

      {!isSingleRoomPreview ? (
        <DynamicScreenLayer runtimeNodesByAsset={runtimeNodesByAsset} />
      ) : null}
      {qualityTier === 'high' && !isSingleRoomPreview ? (
        <HotspotInteractionLayer runtimeNodesByAsset={runtimeNodesByAsset} />
      ) : null}
    </>
  );
}

function SingleRoomPreviewLighting(): React.ReactElement {
  const { gl } = useThree();

  useEffect(() => {
    const previousExposure = gl.toneMappingExposure;
    gl.toneMappingExposure = 1.15;

    return () => {
      gl.toneMappingExposure = previousExposure;
    };
  }, [gl]);

  return (
    <>
      <color attach="background" args={['#060a10']} />
      <fog attach="fog" args={['#060a10', 15, 45]} />
      <ambientLight intensity={0.65} color="#dbe8f5" />
      <hemisphereLight
        color="#eaf4ff"
        groundColor="#1a2634"
        intensity={0.6}
      />
      <directionalLight
        position={[4.0, 5.0, 5.0]}
        intensity={1.1}
        color="#ffffff"
      />
      <directionalLight
        position={[-4.0, 3.0, 3.0]}
        intensity={0.45}
        color="#70d6ff"
      />
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

function InteractiveOrbitControls(): null {
  const { camera, gl, invalidate } = useThree();
  const { state } = usePortfolio3dState();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    const controls = new OrbitControlsImpl(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.8;
    controls.enablePan = false;
    controls.minDistance = 3.7;
    controls.maxDistance = 6.2;
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
  embeddedScreens
}: Readonly<{
  runtimeNodesByAsset: Readonly<Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>>>;
  embeddedScreens: Readonly<Partial<Record<EmbeddedScreenId, ArcadeScreenPlacement>>>;
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
    const preset = getPortfolio3dCameraPresetForSection(state.activeSectionId);
    const embeddedScreenId = getEmbeddedScreenId(state.activeSectionId);
    const embeddedScreen = embeddedScreenId ? embeddedScreens[embeddedScreenId] : undefined;
    if (embeddedScreenId && !runtimeNodesByAsset['room-shell']) return;
    const target = embeddedScreen ? embeddedScreen.position : resolveCameraTarget(preset, runtimeNodesByAsset);
    const artworkFraming = embeddedScreenId === 'profile'
      ? { horizontalCoverage: 0.84, verticalCoverage: 0.8 }
      : embeddedScreenId === 'experience'
        ? { horizontalCoverage: 0.84, verticalCoverage: 0.8 }
        : embeddedScreenId === 'architecture'
          ? { horizontalCoverage: 0.86, verticalCoverage: 0.8 }
          : embeddedScreenId === 'contact'
            ? { horizontalCoverage: 0.82, verticalCoverage: 0.76 }
            : undefined;
    const isArtworkScreen = embeddedScreenId === 'profile' || embeddedScreenId === 'experience' || embeddedScreenId === 'architecture' || embeddedScreenId === 'contact';
    const targetPosition = embeddedScreen
      ? getArcadeCameraPosition(
        embeddedScreen,
        size.width / Math.max(size.height, 1),
        preset.fov,
        artworkFraming
      )
      : constrainPortfolio3dCameraPosition(new THREE.Vector3(...preset.position));
    if (preset.id === 'overview' && size.width < 768) {
      const direction = targetPosition.clone().sub(target);
      const framingScale = Math.max(1, 1.1 * size.height / Math.max(size.width, 1));
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
      applyCameraState(camera, preset, targetPosition, targetQuaternion);
      syncOverviewOrbitControls(camera, target);
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
      applyCameraState(camera, preset, targetPosition, targetQuaternion);
      syncOverviewOrbitControls(camera, target);
      invalidate();
      return;
    }

    if (embeddedScreen && state.navigationState === 'section-open') {
      applyCameraState(camera, preset, targetPosition, targetQuaternion);
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
      startFov: camera instanceof THREE.PerspectiveCamera ? camera.fov : preset.fov,
      targetFov: preset.fov
    };

    // Disable OrbitControls immediately so it doesn't fight the transition.
    if (sharedOrbitControlsRef.current) {
      sharedOrbitControlsRef.current.enabled = false;
    }

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.near = preset.near;
      camera.far = preset.far;
      if (!isScreenJourney) camera.fov = preset.fov;
      camera.updateProjectionMatrix();
    }
    invalidate();
  }, [camera, embeddedScreens, invalidate, prefersReducedMotion, runtimeNodesByAsset, size.width, size.height, state.activeSectionId, state.navigationState]);

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
        syncOverviewOrbitControls(camera, transition.targetLookAt);
      }
    }

    if (transition.finalNavigationState === 'overview') screenJourneyRef.current = false;
    setNavigationState(transition.finalNavigationState);
    rootState.invalidate();
  }, -1);

  return null;
}

function syncOverviewOrbitControls(camera: THREE.Camera, target: THREE.Vector3): void {
  const controls = sharedOrbitControlsRef.current;
  if (!controls) {
    return;
  }

  controls.target.copy(target);
  const offset = camera.position.clone().sub(target);
  const overviewAzimuth = Math.atan2(offset.x, offset.z);
  const azimuthRange = 0.32;

  controls.minAzimuthAngle = overviewAzimuth - azimuthRange;
  controls.maxAzimuthAngle = overviewAzimuth + azimuthRange;

  // Clear residual drag deltas before OrbitControls resumes damping.
  const dampingEnabled = controls.enableDamping;
  controls.enableDamping = false;
  controls.update();
  controls.enableDamping = dampingEnabled;
}

function getEmbeddedScreenId(sectionId: string): EmbeddedScreenId | undefined {
  return sectionId === 'profile' || sectionId === 'experience' || sectionId === 'architecture' || sectionId === 'pipeline' || sectionId === 'automation' || sectionId === 'performance' || sectionId === 'backend' || sectionId === 'terminal' || sectionId === 'contact'
    ? sectionId
    : undefined;
}

function applyCameraState(
  camera: THREE.Camera,
  preset: Portfolio3dCameraPreset,
  position: THREE.Vector3,
  quaternion: THREE.Quaternion
): void {
  camera.position.copy(position);
  camera.quaternion.copy(quaternion);

  if (camera instanceof THREE.PerspectiveCamera) {
    camera.near = preset.near;
    camera.far = preset.far;
    camera.fov = preset.fov;
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
