'use client';

import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  getPortfolio3dTierValue,
  portfolio3dDeskTaskLight,
  portfolio3dImportedLightConfigs,
  portfolio3dLightingProfiles,
  portfolio3dScreenAccentLights,
  portfolio3dShadowSettings
} from '../lighting-config';
import type {
  Portfolio3dAssetId,
  Portfolio3dCeilingLightAim,
  Portfolio3dLightingMode,
  Portfolio3dQualityTier,
  Vector3Tuple
} from '../types';
import type { AssetRuntimeNodeMap } from './SceneAsset';

type RuntimeNodesByAsset = Readonly<Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>>>;
type MutableVector3Tuple = [number, number, number];

type ScreenAccentLight = Readonly<{
  key: string;
  position: MutableVector3Tuple;
  color: string;
  intensity: number;
  distance: number;
  decay: number;
}>;

type CeilingAimConfig = Readonly<{
  assetId?: Portfolio3dAssetId;
  anchorNodeName?: string;
  fallbackTarget: Vector3Tuple;
}>;

export function PortfolioLightingRig({
  runtimeNodesByAsset,
  qualityTier,
  lightingMode,
  roomLightingLevel,
  ceilingLightingLevel,
  ceilingLightAim,
  deskTaskLightingLevel
}: Readonly<{
  runtimeNodesByAsset: RuntimeNodesByAsset;
  qualityTier: Portfolio3dQualityTier;
  lightingMode: Portfolio3dLightingMode;
  roomLightingLevel: number;
  ceilingLightingLevel: number;
  ceilingLightAim: Portfolio3dCeilingLightAim;
  deskTaskLightingLevel: number;
}>): React.ReactElement {
  const { gl, scene } = useThree();
  const profile = portfolio3dLightingProfiles[lightingMode];
  const clampedLightingLevel = clamp01(roomLightingLevel);
  const clampedCeilingLightingLevel = clamp01(ceilingLightingLevel);
  const clampedDeskTaskLightingLevel = clamp01(deskTaskLightingLevel);
  const ceilingAimTarget = useMemo(
    () => resolveCeilingAimTarget(runtimeNodesByAsset, ceilingLightAim),
    [ceilingLightAim, runtimeNodesByAsset]
  );

  useEffect(() => {
    gl.toneMappingExposure = profile.exposure;
  }, [gl, profile.exposure]);

  useEffect(() => {
    const aimTargets = configureImportedLights(
      runtimeNodesByAsset,
      qualityTier,
      profile.importedIntensityMultiplier,
      clampedLightingLevel,
      clampedCeilingLightingLevel,
      ceilingAimTarget,
      scene
    );

    return () => {
      aimTargets.forEach((target) => target.removeFromParent());
    };
  }, [
    ceilingAimTarget,
    clampedCeilingLightingLevel,
    clampedLightingLevel,
    profile.importedIntensityMultiplier,
    qualityTier,
    runtimeNodesByAsset,
    scene
  ]);

  const screenAccentLights = useMemo(
    () =>
      resolveScreenAccentLights(
        runtimeNodesByAsset,
        qualityTier,
        profile.screenAccentMultiplier * clampedLightingLevel
      ),
    [clampedLightingLevel, profile.screenAccentMultiplier, qualityTier, runtimeNodesByAsset]
  );

  return (
    <>
      <color attach="background" args={[profile.background]} />
      <fog attach="fog" args={[profile.fogColor, profile.fogNear, profile.fogFar]} />
      <ambientLight
        intensity={getPortfolio3dTierValue(profile.ambientIntensity, qualityTier) * clampedLightingLevel}
        color={profile.ambientColor}
      />
      <hemisphereLight
        color={profile.hemisphereSkyColor}
        groundColor={profile.hemisphereGroundColor}
        intensity={getPortfolio3dTierValue(profile.hemisphereIntensity, qualityTier) * clampedLightingLevel}
      />
      <directionalLight
        position={profile.fallbackKeyPosition}
        intensity={getPortfolio3dTierValue(profile.fallbackKeyIntensity, qualityTier) * clampedLightingLevel}
        color={profile.fallbackKeyColor}
      />
      <directionalLight
        position={[-3.2, 2.4, 3.1]}
        intensity={0.52 * clampedLightingLevel}
        color="#95d9ff"
      />
      <pointLight
        position={[0, 1.34, 1.35]}
        intensity={0.78 * clampedLightingLevel}
        color="#9feaff"
        distance={4.8}
        decay={2}
      />
      {screenAccentLights.map((light) => (
        <pointLight
          key={light.key}
          position={light.position}
          color={light.color}
          intensity={light.intensity}
          distance={light.distance}
          decay={light.decay}
        />
      ))}
      <DeskTaskLight
        runtimeNodesByAsset={runtimeNodesByAsset}
        qualityTier={qualityTier}
        intensityMultiplier={profile.deskTaskMultiplier * clampedLightingLevel * clampedDeskTaskLightingLevel}
      />
    </>
  );
}

function configureImportedLights(
  runtimeNodesByAsset: RuntimeNodesByAsset,
  qualityTier: Portfolio3dQualityTier,
  importedIntensityMultiplier: number,
  roomLightingLevel: number,
  ceilingLightingLevel: number,
  ceilingAimTarget: THREE.Vector3,
  scene: THREE.Scene
): readonly THREE.Object3D[] {
  const configuredLightKeys = new Set<string>();
  const aimTargets: THREE.Object3D[] = [];

  portfolio3dImportedLightConfigs.forEach((config) => {
    const light = runtimeNodesByAsset[config.assetId]?.lights.get(config.nodeName);
    if (!light) {
      return;
    }

    configuredLightKeys.add(getImportedLightKey(config.assetId, config.nodeName));
    const groupLightingLevel = config.assetId === 'ceiling-lights' ? ceilingLightingLevel : 1;
    const intensity =
      getPortfolio3dTierValue(config.intensity, qualityTier) *
      importedIntensityMultiplier *
      roomLightingLevel *
      groupLightingLevel;

    light.visible = intensity > 0;
    light.intensity = intensity;
    light.color.set(config.color);
    light.castShadow = false;

    if (light instanceof THREE.SpotLight) {
      light.angle = config.angle ?? light.angle;
      light.penumbra = config.penumbra ?? light.penumbra;

      if (config.group === 'rail-spot') {
        aimTargets.push(configureCeilingSpotAim(light, ceilingAimTarget, scene));
      }
    }

    if (light instanceof THREE.PointLight || light instanceof THREE.SpotLight) {
      light.distance = config.distance ?? light.distance;
      light.decay = config.decay ?? light.decay;
    }

    configureLightShadow(light, qualityTier);
  });

  Object.entries(runtimeNodesByAsset).forEach(([assetId, nodes]) => {
    nodes?.lights.forEach((light, nodeName) => {
      if (configuredLightKeys.has(getImportedLightKey(assetId, nodeName))) {
        return;
      }

      light.visible = false;
      light.castShadow = false;
    });
  });

  return aimTargets;
}

function configureCeilingSpotAim(
  light: THREE.SpotLight,
  aimTarget: THREE.Vector3,
  scene: THREE.Scene
): THREE.Object3D {
  const target = getOrCreateSpotAimTarget(light);

  target.position.copy(aimTarget);
  if (!target.parent) {
    scene.add(target);
  }

  light.target = target;
  light.target.updateMatrixWorld();
  return target;
}

function getOrCreateSpotAimTarget(light: THREE.SpotLight): THREE.Object3D {
  const existingTarget = light.userData.portfolio3dAimTarget;
  if (existingTarget instanceof THREE.Object3D) {
    return existingTarget;
  }

  const target = new THREE.Object3D();
  target.name = `Portfolio3D_AimTarget_${light.name || light.uuid}`;
  light.userData.portfolio3dAimTarget = target;
  return target;
}

function resolveCeilingAimTarget(
  runtimeNodesByAsset: RuntimeNodesByAsset,
  aim: Portfolio3dCeilingLightAim
): THREE.Vector3 {
  const config = ceilingAimTargets[aim];
  const anchor = config.assetId && config.anchorNodeName
    ? runtimeNodesByAsset[config.assetId]?.anchors.get(config.anchorNodeName)
    : undefined;
  const target = new THREE.Vector3(...config.fallbackTarget);

  if (anchor) {
    anchor.getWorldPosition(target);
  }

  return target;
}

function resolveScreenAccentLights(
  runtimeNodesByAsset: RuntimeNodesByAsset,
  qualityTier: Portfolio3dQualityTier,
  intensityMultiplier: number
): readonly ScreenAccentLight[] {
  return portfolio3dScreenAccentLights.flatMap((config) => {
    const anchor = runtimeNodesByAsset[config.assetId]?.anchors.get(config.anchorNodeName);
    if (!anchor) {
      return [];
    }

    const intensity = getPortfolio3dTierValue(config.intensity, qualityTier) * intensityMultiplier;
    if (intensity <= 0) {
      return [];
    }

    return [
      {
        key: `${config.assetId}:${config.anchorNodeName}`,
        position: getWorldPosition(anchor, config.offset),
        color: config.color,
        intensity,
        distance: config.distance,
        decay: config.decay
      }
    ];
  });
}

function DeskTaskLight({
  runtimeNodesByAsset,
  qualityTier,
  intensityMultiplier
}: Readonly<{
  runtimeNodesByAsset: RuntimeNodesByAsset;
  qualityTier: Portfolio3dQualityTier;
  intensityMultiplier: number;
}>): React.ReactElement | null {
  const { scene } = useThree();
  const lightRef = useRef<THREE.SpotLight | null>(null);
  const targetRef = useRef<THREE.Object3D | null>(null);

  if (!targetRef.current) {
    targetRef.current = new THREE.Object3D();
  }

  const target = targetRef.current;
  const placement = useMemo(() => resolveDeskTaskPlacement(runtimeNodesByAsset), [runtimeNodesByAsset]);
  const intensity = getPortfolio3dTierValue(portfolio3dDeskTaskLight.intensity, qualityTier) * intensityMultiplier;
  const castShadow = false;

  useEffect(() => {
    target.position.set(...placement.target);
    scene.add(target);

    return () => {
      scene.remove(target);
    };
  }, [placement.target, scene, target]);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) {
      return;
    }

    light.target = target;
    light.target.updateMatrixWorld();
    configureLightShadow(light, qualityTier);
  }, [castShadow, placement.target, qualityTier, target]);

  if (intensity <= 0) {
    return null;
  }

  return (
    <spotLight
      ref={lightRef}
      position={placement.position}
      color={portfolio3dDeskTaskLight.color}
      intensity={intensity}
      angle={portfolio3dDeskTaskLight.angle}
      penumbra={portfolio3dDeskTaskLight.penumbra}
      distance={portfolio3dDeskTaskLight.distance}
      decay={portfolio3dDeskTaskLight.decay}
      castShadow={castShadow}
    />
  );
}

function resolveDeskTaskPlacement(
  runtimeNodesByAsset: RuntimeNodesByAsset
): { readonly position: MutableVector3Tuple; readonly target: MutableVector3Tuple } {
  const nodes = runtimeNodesByAsset[portfolio3dDeskTaskLight.assetId];
  const sourceAnchor = nodes?.anchors.get(portfolio3dDeskTaskLight.sourceAnchorNodeName);
  const targetAnchor = nodes?.anchors.get(portfolio3dDeskTaskLight.targetAnchorNodeName);

  return {
    position: sourceAnchor
      ? getWorldPosition(sourceAnchor)
      : toMutableTuple(portfolio3dDeskTaskLight.fallbackPosition),
    target: targetAnchor
      ? getWorldPosition(targetAnchor)
      : toMutableTuple(portfolio3dDeskTaskLight.fallbackTarget)
  };
}

function configureLightShadow(light: THREE.Light, qualityTier: Portfolio3dQualityTier): void {
  const shadow = (light as THREE.Light & { shadow?: THREE.LightShadow }).shadow;
  if (!shadow || !light.castShadow) {
    return;
  }

  const mapSize = portfolio3dShadowSettings.mapSize[qualityTier];
  shadow.mapSize.set(mapSize, mapSize);
  shadow.bias = portfolio3dShadowSettings.bias;
  shadow.normalBias = portfolio3dShadowSettings.normalBias;
  shadow.radius = portfolio3dShadowSettings.radius;
  shadow.camera.near = portfolio3dShadowSettings.near;
  shadow.camera.far = portfolio3dShadowSettings.far;
  shadow.camera.updateProjectionMatrix();
}

function getWorldPosition(anchor: THREE.Object3D, offset?: Vector3Tuple): MutableVector3Tuple {
  const position = new THREE.Vector3();
  anchor.getWorldPosition(position);

  if (offset) {
    position.add(new THREE.Vector3(...offset));
  }

  return [position.x, position.y, position.z];
}

function toMutableTuple(tuple: Vector3Tuple): MutableVector3Tuple {
  return [tuple[0], tuple[1], tuple[2]];
}

function getImportedLightKey(assetId: string, nodeName: string): string {
  return `${assetId}:${nodeName}`;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

const ceilingAimTargets = {
  desk: {
    assetId: 'main-monitor',
    anchorNodeName: 'Anchor_DisplayCenter',
    fallbackTarget: [0, 1.08, 0.06]
  },
  rack: {
    assetId: 'server-rack',
    anchorNodeName: 'Anchor_DisplayCenter',
    fallbackTarget: [2.05, 1.12, -0.88]
  },
  wide: {
    fallbackTarget: [0, 1.18, -0.72]
  }
} as const satisfies Record<Portfolio3dCeilingLightAim, CeilingAimConfig>;
