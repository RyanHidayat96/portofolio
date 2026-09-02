'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from '@/features/interaction/hooks/useReducedMotion';
import { usePortfolio3dPreload } from '../hooks/usePortfolio3dPreload';
import {
  constrainPortfolio3dCameraPosition,
  createLookAtQuaternion,
  easePortfolio3dCameraTransition,
  getPortfolio3dCameraPresetForSection
} from '../camera-navigation';
import {
  criticalPortfolio3dAssetIds,
  portfolio3dAssetById,
  portfolio3dAssets
} from '../scene-manifest';
import { portfolio3dSectionContracts } from '../section-contracts';
import { usePortfolio3dState } from '../state/Portfolio3dState';
import type {
  Portfolio3dAssetId,
  Portfolio3dCameraPreset,
  Portfolio3dEnvironmentVariant,
  Portfolio3dLoadingProgress,
  Portfolio3dQualityTier,
  SceneAssetDefinition
} from '../types';
import { DynamicScreenLayer } from './DynamicScreenLayer';
import { HotspotInteractionLayer } from './HotspotInteractionLayer';
import { PortfolioLightingRig } from './PortfolioLightingRig';
import { ProceduralWorkspaceScene } from './ProceduralWorkspaceScene';
import { SceneAsset, type AssetRuntimeNodeMap } from './SceneAsset';
import { SceneAssetBoundary } from './SceneAssetBoundary';

const roomShellAsset = portfolio3dAssetById['room-shell'];
const criticalAssets = criticalPortfolio3dAssetIds.map((assetId) => portfolio3dAssetById[assetId]);
const criticalAssetIdSet = new Set<Portfolio3dAssetId>(criticalPortfolio3dAssetIds);
const anchoredSceneAssets = portfolio3dAssets.filter((asset) => asset.id !== 'room-shell');
const doorOpenRotationOffset = -1.08;
// Imported GLB room is retained as an asset contract, but disabled by default because it blocks first paint on local hardware.
const enableImportedGlbScene = false;

export function PortfolioSceneStage({
  qualityTier = 'high',
  onCriticalProgressChange
}: Readonly<{
  qualityTier?: Portfolio3dQualityTier;
  onCriticalProgressChange?: (progress: Portfolio3dLoadingProgress) => void;
}>): React.ReactElement {
  const { state } = usePortfolio3dState();
  const [runtimeNodesByAsset, setRuntimeNodesByAsset] = useState<
    Readonly<Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>>>
  >({});
  const [loadedCriticalAssetIds, setLoadedCriticalAssetIds] = useState<readonly Portfolio3dAssetId[]>([]);
  const [failedCriticalAssetIds, setFailedCriticalAssetIds] = useState<readonly Portfolio3dAssetId[]>([]);

  const roomNodes = runtimeNodesByAsset['room-shell'];
  const useImportedAssets = enableImportedGlbScene ? qualityTier === 'high' : false;
  const canRenderAnchoredAssets = useImportedAssets && (Boolean(roomNodes) || failedCriticalAssetIds.includes('room-shell'));
  const criticalComplete =
    !useImportedAssets || loadedCriticalAssetIds.length + failedCriticalAssetIds.length >= criticalAssets.length;
  const tierAvailability = usePortfolio3dPreload(criticalComplete, qualityTier);

  const activePrimaryAssetId = useMemo(
    () =>
      portfolio3dSectionContracts.find((contract) => contract.id === state.activeSectionId)
        ?.primaryAssetId,
    [state.activeSectionId]
  );

  const visibleAnchoredAssets = useMemo(
    () =>
      anchoredSceneAssets.filter((asset) =>
        shouldRenderSceneAsset({
          asset,
          activePrimaryAssetId,
          criticalComplete,
          qualityTier,
          tierAvailability
        })
      ),
    [activePrimaryAssetId, criticalComplete, qualityTier, tierAvailability]
  );

  useEffect(() => {
    onCriticalProgressChange?.({
      totalCriticalAssets: useImportedAssets ? criticalAssets.length : 0,
      loadedCriticalAssets: useImportedAssets ? loadedCriticalAssetIds.length : 0,
      failedCriticalAssets: useImportedAssets ? failedCriticalAssetIds.length : 0,
      isCriticalComplete: criticalComplete
    });
  }, [criticalComplete, failedCriticalAssetIds.length, loadedCriticalAssetIds.length, onCriticalProgressChange, useImportedAssets]);

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
    setLoadedCriticalAssetIds((current) =>
      current.includes(assetId) || !criticalAssetIdSet.has(assetId)
        ? current
        : [...current, assetId]
    );
  }, []);

  const handleAssetError = useCallback((assetId: Portfolio3dAssetId): void => {
    setFailedCriticalAssetIds((current) =>
      current.includes(assetId) || !criticalAssetIdSet.has(assetId)
        ? current
        : [...current, assetId]
    );
  }, []);

  return (
    <>
      <SceneInvalidationController
        qualityTier={qualityTier}
        runtimeNodesByAsset={runtimeNodesByAsset}
      />
      <CameraNavigationRig runtimeNodesByAsset={runtimeNodesByAsset} />
      <PortfolioLightingRig
        runtimeNodesByAsset={runtimeNodesByAsset}
        qualityTier={qualityTier}
        lightingMode={state.lightingMode}
        roomLightingLevel={state.roomLightingLevel}
        ceilingLightingLevel={state.ceilingLightingLevel}
        ceilingLightAim={state.ceilingLightAim}
        deskTaskLightingLevel={state.deskTaskLightingLevel}
      />

      <ProceduralWorkspaceScene qualityTier={qualityTier} />

      {useImportedAssets ? (
        <SceneAssetBoundary asset={roomShellAsset} onError={handleAssetError}>
          <SceneAsset
            asset={roomShellAsset}
            onReady={handleAssetReady}
            onNodesMapped={handleNodesMapped}
            onNodesUnmapped={handleNodesUnmapped}
          />
        </SceneAssetBoundary>
      ) : null}

      {canRenderAnchoredAssets
        ? visibleAnchoredAssets.map((asset) => (
            <SceneAssetBoundary key={asset.id} asset={asset} onError={handleAssetError}>
              <SceneAsset
                asset={asset}
                roomAnchors={roomNodes?.anchors}
                onReady={handleAssetReady}
                onNodesMapped={handleNodesMapped}
                onNodesUnmapped={handleNodesUnmapped}
              />
            </SceneAssetBoundary>
          ))
        : null}

      {useImportedAssets ? <DynamicScreenLayer runtimeNodesByAsset={runtimeNodesByAsset} /> : null}
      {useImportedAssets && qualityTier === 'high' ? (
        <HotspotInteractionLayer runtimeNodesByAsset={runtimeNodesByAsset} />
      ) : null}
      {useImportedAssets ? <RoomInteractionController roomNodes={roomNodes} isDoorOpen={state.isDoorOpen} /> : null}
      {useImportedAssets && roomNodes ? (
        <WindowBackdropLayer
          anchor={roomNodes.anchors.get('Anchor_WindowBackdrop')}
          environmentVariant={state.environmentVariant}
        />
      ) : null}
    </>
  );
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
    state.environmentVariant,
    state.focusedHotspotId,
    state.hoveredHotspotId,
    state.isDoorOpen,
    state.lightingMode,
    state.navigationState,
    state.roomLightingLevel
  ]);

  return null;
}

function shouldRenderSceneAsset({
  asset,
  activePrimaryAssetId,
  criticalComplete,
  qualityTier,
  tierAvailability
}: Readonly<{
  asset: SceneAssetDefinition;
  activePrimaryAssetId?: Portfolio3dAssetId;
  criticalComplete: boolean;
  qualityTier: Portfolio3dQualityTier;
  tierAvailability: Readonly<{ near: boolean; deferred: boolean }>;
}>): boolean {
  if (asset.loadingTier === 'critical') {
    return true;
  }

  if (!criticalComplete) {
    return false;
  }

  if (activePrimaryAssetId === asset.id) {
    return true;
  }

  if (!asset.qualityVisibility[qualityTier]) {
    return false;
  }

  return asset.loadingTier === 'near' ? tierAvailability.near : tierAvailability.deferred;
}

interface CameraTransitionState {
  readonly activeSectionId: string;
  readonly finalNavigationState: 'overview' | 'section-open';
  readonly startedAt: number;
  readonly durationMs: number;
  readonly startPosition: THREE.Vector3;
  readonly targetPosition: THREE.Vector3;
  readonly startQuaternion: THREE.Quaternion;
  readonly targetQuaternion: THREE.Quaternion;
}

function CameraNavigationRig({
  runtimeNodesByAsset
}: Readonly<{
  runtimeNodesByAsset: Readonly<Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>>>;
}>): null {
  const { camera, invalidate } = useThree();
  const { state, setNavigationState } = usePortfolio3dState();
  const prefersReducedMotion = useReducedMotion();
  const transitionRef = useRef<CameraTransitionState | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const preset = getPortfolio3dCameraPresetForSection(state.activeSectionId);
    const target = resolveCameraTarget(preset, runtimeNodesByAsset);
    const targetPosition = constrainPortfolio3dCameraPosition(new THREE.Vector3(...preset.position));
    const targetQuaternion = createLookAtQuaternion(targetPosition, target);

    if (!initializedRef.current && state.activeSectionId === 'overview') {
      initializedRef.current = true;
      applyCameraState(camera, preset, targetPosition, targetQuaternion);
      invalidate();
      return;
    }

    initializedRef.current = true;

    if (state.navigationState !== 'focusing' && state.navigationState !== 'returning') {
      return;
    }

    transitionRef.current = {
      activeSectionId: state.activeSectionId,
      finalNavigationState: state.activeSectionId === 'overview' ? 'overview' : 'section-open',
      startedAt: performance.now(),
      durationMs: prefersReducedMotion ? preset.reducedMotionMs : preset.transitionMs,
      startPosition: camera.position.clone(),
      targetPosition,
      startQuaternion: camera.quaternion.clone(),
      targetQuaternion
    };

    camera.near = preset.near;
    camera.far = preset.far;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = preset.fov;
    }
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate, prefersReducedMotion, runtimeNodesByAsset, state.activeSectionId, state.navigationState]);

  useFrame((rootState) => {
    const transition = transitionRef.current;
    if (!transition) {
      return;
    }

    const progress = transition.durationMs <= 0
      ? 1
      : (performance.now() - transition.startedAt) / transition.durationMs;
    const easedProgress = easePortfolio3dCameraTransition(progress);

    camera.position.lerpVectors(transition.startPosition, transition.targetPosition, easedProgress);
    camera.quaternion.slerpQuaternions(transition.startQuaternion, transition.targetQuaternion, easedProgress);

    if (progress < 1) {
      rootState.invalidate();
      return;
    }

    camera.position.copy(transition.targetPosition);
    camera.quaternion.copy(transition.targetQuaternion);
    transitionRef.current = null;
    setNavigationState(transition.finalNavigationState);
    rootState.invalidate();
  });

  return null;
}

function RoomInteractionController({
  roomNodes,
  isDoorOpen
}: Readonly<{
  roomNodes?: AssetRuntimeNodeMap;
  isDoorOpen: boolean;
}>): null {
  const { invalidate } = useThree();
  const prefersReducedMotion = useReducedMotion();
  const closedDoorRotationRef = useRef<number | null>(null);
  const isDoorOpenRef = useRef(isDoorOpen);
  const shouldAnimateDoorRef = useRef(false);

  useEffect(() => {
    isDoorOpenRef.current = isDoorOpen;
    shouldAnimateDoorRef.current = true;
    invalidate();
  }, [invalidate, isDoorOpen]);

  useEffect(() => {
    const doorPivot = roomNodes?.doorPivot;
    if (!doorPivot || closedDoorRotationRef.current !== null) {
      return;
    }

    closedDoorRotationRef.current = doorPivot.rotation.y;
  }, [roomNodes]);

  useFrame((rootState, delta) => {
    if (!shouldAnimateDoorRef.current) {
      return;
    }

    const doorPivot = roomNodes?.doorPivot;
    const closedRotation = closedDoorRotationRef.current;
    if (!doorPivot || closedRotation === null) {
      shouldAnimateDoorRef.current = false;
      return;
    }

    const targetRotation = isDoorOpenRef.current
      ? closedRotation + doorOpenRotationOffset
      : closedRotation;

    if (prefersReducedMotion) {
      doorPivot.rotation.y = targetRotation;
      shouldAnimateDoorRef.current = false;
      rootState.invalidate();
      return;
    }

    doorPivot.rotation.y = THREE.MathUtils.lerp(
      doorPivot.rotation.y,
      targetRotation,
      1 - Math.exp(-delta * 8)
    );

    if (Math.abs(doorPivot.rotation.y - targetRotation) <= 0.002) {
      doorPivot.rotation.y = targetRotation;
      shouldAnimateDoorRef.current = false;
    }

    rootState.invalidate();
  });

  return null;
}

function applyCameraState(
  camera: THREE.Camera,
  preset: Portfolio3dCameraPreset,
  position: THREE.Vector3,
  quaternion: THREE.Quaternion
): void {
  camera.position.copy(position);
  camera.quaternion.copy(quaternion);
  camera.near = preset.near;
  camera.far = preset.far;

  if (camera instanceof THREE.PerspectiveCamera) {
    camera.fov = preset.fov;
  }

  camera.updateProjectionMatrix();
}

function resolveCameraTarget(
  preset: Portfolio3dCameraPreset,
  runtimeNodesByAsset: Readonly<Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>>>
): THREE.Vector3 {
  if (preset.id === 'overview') {
    const target = new THREE.Vector3(...preset.target);
    const roomBounds = runtimeNodesByAsset['room-shell']?.bounds;

    if (roomBounds && !roomBounds.isEmpty()) {
      roomBounds.getCenter(target);
      target.y = 1.18;
    }

    return target;
  }

  const screenNode = preset.screenNodeName
    ? findRuntimeNode(preset.screenNodeName, runtimeNodesByAsset)
    : undefined;
  const targetNode = preset.targetNodeName
    ? findRuntimeNode(preset.targetNodeName, runtimeNodesByAsset)
    : undefined;
  const runtimeTarget = screenNode ?? targetNode;

  if (!runtimeTarget) {
    return new THREE.Vector3(...preset.target);
  }

  return getObjectFocusPoint(runtimeTarget);
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

function WindowBackdropLayer({
  anchor,
  environmentVariant
}: Readonly<{
  anchor?: THREE.Object3D;
  environmentVariant: Portfolio3dEnvironmentVariant;
}>): React.ReactElement {
  const position = useMemo(() => {
    const worldPosition = new THREE.Vector3(0, 1.55, -2.26);
    anchor?.getWorldPosition(worldPosition);
    return [worldPosition.x, worldPosition.y, worldPosition.z - 0.04] as [number, number, number];
  }, [anchor]);
  const backdrop = windowBackdropByEnvironment[environmentVariant];

  return (
    <mesh position={position} rotation={[0, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[2.8, 1.45]} />
      <meshBasicMaterial
        color={backdrop.color}
        transparent
        opacity={backdrop.opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

const windowBackdropByEnvironment = {
  studio: { color: '#07131c', opacity: 0.62 },
  dawn: { color: '#263750', opacity: 0.7 },
  night: { color: '#030814', opacity: 0.78 }
} as const satisfies Record<Portfolio3dEnvironmentVariant, { readonly color: string; readonly opacity: number }>;

export function getPortfolioSceneCriticalAssets(): readonly SceneAssetDefinition[] {
  return criticalAssets;
}