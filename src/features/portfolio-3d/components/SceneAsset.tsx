'use client';

import { useLoader, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { getPortfolio3dAssetUrl } from '../asset-url';
import {
  PORTFOLIO_3D_HOTSPOT_NODE_USER_DATA_KEY,
  PORTFOLIO_3D_INTERACTION_LAYER
} from '../interaction-layer';
import { resolvePortfolio3dNodeName } from '../node-aliases';
import type { SceneAssetDefinition, Transform3d } from '../types';

export interface AssetRuntimeNodeMap {
  readonly assetId: SceneAssetDefinition['id'];
  readonly root: THREE.Group;
  readonly anchors: ReadonlyMap<string, THREE.Object3D>;
  readonly hotspots: ReadonlyMap<string, THREE.Object3D>;
  readonly screens: ReadonlyMap<string, THREE.Object3D>;
  readonly colliders: ReadonlyMap<string, THREE.Object3D>;
  readonly navMeshes: ReadonlyMap<string, THREE.Object3D>;
  readonly lights: ReadonlyMap<string, THREE.Light>;
  readonly bounds: THREE.Box3;
}

const warnedMissingAnchors = new Set<string>();
const warnedMissingNodes = new Set<string>();
const authoredRenderAssetFileNames = new Set<SceneAssetDefinition['fileName']>(['haker_room.glb']);

let dracoLoaderInstance: DRACOLoader | null = null;

function getDracoLoader(): DRACOLoader {
  if (!dracoLoaderInstance) {
    dracoLoaderInstance = new DRACOLoader();
    dracoLoaderInstance.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  }
  return dracoLoaderInstance;
}

export function SceneAsset({
  asset,
  roomAnchors,
  onReady,
  onNodesMapped,
  onNodesUnmapped
}: Readonly<{
  asset: SceneAssetDefinition;
  roomAnchors?: ReadonlyMap<string, THREE.Object3D>;
  onReady?: (assetId: SceneAssetDefinition['id']) => void;
  onNodesMapped?: (nodes: AssetRuntimeNodeMap) => void;
  onNodesUnmapped?: (assetId: SceneAssetDefinition['id']) => void;
}>): React.ReactElement {
  const { invalidate } = useThree();
  const gltf = useLoader(GLTFLoader, getPortfolio3dAssetUrl(asset.id), (loader) => {
    loader.setDRACOLoader(getDracoLoader());
  });
  const runtime = useMemo(
    () => createSceneAssetRuntime(asset, gltf.scene, roomAnchors),
    [asset, gltf.scene, roomAnchors]
  );

  useLayoutEffect(() => {
    onNodesMapped?.(runtime.nodes);
    onReady?.(asset.id);
    invalidate();

    return () => onNodesUnmapped?.(asset.id);
  }, [asset.id, invalidate, onNodesMapped, onNodesUnmapped, onReady, runtime.nodes]);

  useEffect(() => () => disposeClonedMaterials(runtime.clonedMaterials), [runtime.clonedMaterials]);

  return <primitive object={runtime.scene} dispose={null} />;
}

export function createSceneAssetRuntime(
  asset: SceneAssetDefinition,
  sourceScene: THREE.Group,
  roomAnchors?: ReadonlyMap<string, THREE.Object3D>
): {
  readonly scene: THREE.Group;
  readonly nodes: AssetRuntimeNodeMap;
  readonly clonedMaterials: readonly THREE.Material[];
} {
  const shouldPreserveAuthoredRenderState = authoredRenderAssetFileNames.has(asset.fileName);
  const scene = sourceScene.clone(true);
  const clonedMaterials = shouldPreserveAuthoredRenderState ? [] : cloneSceneMaterials(scene);

  if (!shouldPreserveAuthoredRenderState) {
    configureRuntimeMeshRenderState(scene);
  }

  applySceneAssetPlacement(scene, asset, roomAnchors);

  scene.updateMatrixWorld(true);
  const nodes = mapSceneAssetNodes(asset, scene);

  return { scene, nodes, clonedMaterials };
}

function cloneSceneMaterials(scene: THREE.Object3D): readonly THREE.Material[] {
  const clonedMaterials = new Map<string, THREE.Material>();

  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return;
    }

    const role = getRuntimeMeshRole(object);
    const getClone = (material: THREE.Material): THREE.Material => {
      const key = `${material.uuid}:${role.key}`;
      const existing = clonedMaterials.get(key);
      if (existing) {
        return existing;
      }

      const clone = material.clone();
      clonedMaterials.set(key, clone);
      return clone;
    };

    if (Array.isArray(object.material)) {
      object.material = object.material.map(getClone);
      return;
    }

    object.material = getClone(object.material);
  });

  return [...clonedMaterials.values()];
}

function configureRuntimeMeshRenderState(scene: THREE.Object3D): void {
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return;
    }

    const { isRuntimeOnly, isGlass, isDisplaySurface } = getRuntimeMeshRole(object);

    object.castShadow = !isRuntimeOnly && !isGlass && !isDisplaySurface;
    object.receiveShadow = !isRuntimeOnly && !isGlass;

    if (isGlass) {
      object.renderOrder = 2;
      setMaterialDepthWrite(object.material, false);
    }

    if (isDisplaySurface) {
      object.renderOrder = Math.max(object.renderOrder, 3);
    }

    tuneRuntimeMaterial(object.material, isRuntimeOnly, isGlass, isDisplaySurface);
  });
}

function getRuntimeMeshRole(object: THREE.Object3D): {
  readonly key: string;
  readonly isRuntimeOnly: boolean;
  readonly isGlass: boolean;
  readonly isDisplaySurface: boolean;
} {
  const nodeName = object.name.toLowerCase();
  const isRuntimeOnly =
    nodeName.startsWith('anchor_') ||
    nodeName.startsWith('hotspot_') ||
    nodeName.startsWith('collider_') ||
    nodeName === 'room_colliders' ||
    nodeName === 'navmesh_room';
  const isGlass = nodeName.includes('glass') || nodeName.includes('hologram');
  const isDisplaySurface =
    nodeName.startsWith('screen_') || nodeName.includes('display') || nodeName.includes('led');

  return {
    key: `${isRuntimeOnly ? 'runtime' : 'visible'}:${isGlass ? 'glass' : 'solid'}:${isDisplaySurface ? 'display' : 'surface'}`,
    isRuntimeOnly,
    isGlass,
    isDisplaySurface
  };
}

function tuneRuntimeMaterial(
  material: THREE.Material | THREE.Material[],
  isRuntimeOnly: boolean,
  isGlass: boolean,
  isDisplaySurface: boolean
): void {
  const materials = Array.isArray(material) ? material : [material];

  materials.forEach((entry) => {
    if (entry instanceof THREE.MeshStandardMaterial) {
      entry.envMapIntensity = Math.max(entry.envMapIntensity, isRuntimeOnly ? 1 : 1.2);
    }

    if (isDisplaySurface) {
      entry.toneMapped = false;
    }

    if (isGlass) {
      entry.transparent = true;
    }

    entry.needsUpdate = true;
  });
}

function setMaterialDepthWrite(material: THREE.Material | THREE.Material[], depthWrite: boolean): void {
  const materials = Array.isArray(material) ? material : [material];

  materials.forEach((entry) => {
    entry.depthWrite = depthWrite;
    entry.needsUpdate = true;
  });
}

function disposeClonedMaterials(materials: readonly THREE.Material[]): void {
  materials.forEach((material) => material.dispose());
}

function applySceneAssetPlacement(
  scene: THREE.Group,
  asset: SceneAssetDefinition,
  roomAnchors?: ReadonlyMap<string, THREE.Object3D>
): void {
  if (asset.placement.strategy === 'root') {
    applyFallbackTransform(scene, asset.fallbackTransform);
    return;
  }

  const anchorName = asset.placement.anchorNodeName;
  const anchor = anchorName ? roomAnchors?.get(anchorName) : undefined;

  if (!anchor) {
    warnMissingAnchor(asset.id, anchorName ?? 'unknown');
    applyFallbackTransform(scene, asset.fallbackTransform);
    return;
  }

  anchor.updateWorldMatrix(true, false);
  anchor.matrixWorld.decompose(scene.position, scene.quaternion, scene.scale);

  if (asset.placement.localTransform) {
    applyLocalAnchorTransform(scene, asset.placement.localTransform);
  }
}

function applyFallbackTransform(scene: THREE.Object3D, transform: Transform3d): void {
  scene.position.set(...transform.position);
  scene.rotation.set(...transform.rotation);
  scene.scale.set(...transform.scale);
}

function applyLocalAnchorTransform(scene: THREE.Object3D, transform: Transform3d): void {
  const localPosition = new THREE.Vector3(...transform.position);
  localPosition.multiply(scene.scale).applyQuaternion(scene.quaternion);
  scene.position.add(localPosition);

  const localRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(...transform.rotation));
  scene.quaternion.multiply(localRotation);
  scene.scale.multiply(new THREE.Vector3(...transform.scale));
}

function mapSceneAssetNodes(
  asset: SceneAssetDefinition,
  scene: THREE.Group
): AssetRuntimeNodeMap {
  const anchors = new Map<string, THREE.Object3D>();
  const hotspots = new Map<string, THREE.Object3D>();
  const screens = new Map<string, THREE.Object3D>();
  const colliders = new Map<string, THREE.Object3D>();
  const navMeshes = new Map<string, THREE.Object3D>();
  const lights = new Map<string, THREE.Light>();

  scene.traverse((object) => {
    const name = object.name;

    if (name.startsWith('Anchor_')) {
      anchors.set(name, object);
      object.visible = false;
    }

    if (name.startsWith('Hotspot_')) {
      hotspots.set(name, object);
      configureHotspotInteractionTarget(object, name);
    }

    if (name.startsWith('Screen_') || name === 'Hologram_Surface' || name === 'Phone_Display') {
      screens.set(name, object);
    }

    if (name === 'Room_Colliders' || name.startsWith('Collider_')) {
      colliders.set(name, object);
      object.visible = false;
    }

    if (name === 'NavMesh_Room') {
      navMeshes.set(name, object);
      object.visible = false;
    }

    if (asset.nodes.runtimeHidden?.includes(name)) {
      object.visible = false;
    }

    if (object instanceof THREE.Light) {
      lights.set(name || object.uuid, object);
    }
  });

  asset.nodes.anchors?.forEach((nodeName) => warnIfMissing(asset, nodeName, anchors));
  asset.nodes.hotspots?.forEach((nodeName) => {
    const actualName = resolvePortfolio3dNodeName(asset.id, nodeName, new Set(hotspots.keys()));
    warnIfMissing(asset, actualName, hotspots);
  });
  asset.nodes.screens?.forEach((nodeName) => warnIfMissing(asset, nodeName, screens));
  asset.nodes.navMeshes?.forEach((nodeName) => warnIfMissing(asset, nodeName, navMeshes));
  asset.nodes.colliders?.forEach((nodeName) => warnIfMissing(asset, nodeName, colliders));

  return {
    assetId: asset.id,
    root: scene,
    anchors,
    hotspots,
    screens,
    colliders,
    navMeshes,
    lights,
    bounds: new THREE.Box3().setFromObject(scene)
  };
}

function configureHotspotInteractionTarget(object: THREE.Object3D, nodeName: string): void {
  object.visible = true;
  object.userData[PORTFOLIO_3D_HOTSPOT_NODE_USER_DATA_KEY] = nodeName;
  object.layers.set(PORTFOLIO_3D_INTERACTION_LAYER);

  object.traverse((child) => {
    child.visible = true;
    child.userData[PORTFOLIO_3D_HOTSPOT_NODE_USER_DATA_KEY] = nodeName;
    child.layers.set(PORTFOLIO_3D_INTERACTION_LAYER);

    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.castShadow = false;
    child.receiveShadow = false;
    child.renderOrder = Math.max(child.renderOrder, 120);
    setMaterialAsInvisibleHitTarget(child.material);
  });
}

function setMaterialAsInvisibleHitTarget(material: THREE.Material | THREE.Material[]): void {
  const materials = Array.isArray(material) ? material : [material];

  materials.forEach((entry) => {
    entry.transparent = true;
    entry.opacity = 0;
    entry.depthWrite = false;
    entry.colorWrite = false;
    entry.needsUpdate = true;
  });
}

function warnIfMissing(
  asset: SceneAssetDefinition,
  nodeName: string,
  map: ReadonlyMap<string, THREE.Object3D>
): void {
  if (!map.has(nodeName)) {
    warnMissingNode(asset.id, nodeName);
  }
}

function warnMissingAnchor(assetId: SceneAssetDefinition['id'], anchorName: string): void {
  const key = `${assetId}:${anchorName}`;
  if (process.env.NODE_ENV === 'production' || warnedMissingAnchors.has(key)) {
    return;
  }

  warnedMissingAnchors.add(key);
  console.warn(`[portfolio-3d] Missing anchor for ${assetId}: ${anchorName}. Using fallback transform.`);
}

function warnMissingNode(assetId: SceneAssetDefinition['id'], nodeName: string): void {
  const key = `${assetId}:${nodeName}`;
  if (process.env.NODE_ENV === 'production' || warnedMissingNodes.has(key)) {
    return;
  }

  warnedMissingNodes.add(key);
  console.warn(`[portfolio-3d] Missing node for ${assetId}: ${nodeName}.`);
}
