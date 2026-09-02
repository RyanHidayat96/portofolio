'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  PORTFOLIO_3D_HOTSPOT_NODE_USER_DATA_KEY,
  PORTFOLIO_3D_INTERACTION_LAYER
} from '../interaction-layer';
import { portfolio3dHotspots } from '../scene-manifest';
import { usePortfolio3dState } from '../state/Portfolio3dState';
import type {
  Portfolio3dAssetId,
  Portfolio3dHotspotDefinition,
  Portfolio3dHotspotId
} from '../types';
import type { AssetRuntimeNodeMap } from './SceneAsset';

type RuntimeNodesByAsset = Readonly<Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>>>;

type BoundHotspot = Readonly<{
  definition: Portfolio3dHotspotDefinition;
  object: THREE.Object3D;
}>;

type PointerDownState = Readonly<{
  pointerId: number;
  x: number;
  y: number;
  startedAt: number;
  hotspotId?: Portfolio3dHotspotId;
}>;

type PointerMoveSample = Readonly<{
  x: number;
  y: number;
}>;

const pointerClickThresholdPx = 8;
const pointerClickThresholdMs = 650;

export function HotspotInteractionLayer({
  runtimeNodesByAsset
}: Readonly<{
  runtimeNodesByAsset: RuntimeNodesByAsset;
}>): React.ReactElement | null {
  const { camera, gl, raycaster, invalidate } = useThree();
  const {
    state,
    setHoveredHotspot,
    activateHotspot
  } = usePortfolio3dState();
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const intersections = useMemo<THREE.Intersection[]>(() => [], []);
  const pointerDownRef = useRef<PointerDownState | null>(null);
  const pendingPointerMoveRef = useRef<PointerMoveSample | null>(null);
  const pointerMoveFrameRef = useRef<number | null>(null);
  const hoveredHotspotRef = useRef<Portfolio3dHotspotId | undefined>(undefined);

  const boundHotspots = useMemo(
    () =>
      portfolio3dHotspots.flatMap((definition) => {
        const object = runtimeNodesByAsset[definition.assetId]?.hotspots.get(definition.nodeName);
        return object ? [{ definition, object }] : [];
      }),
    [runtimeNodesByAsset]
  );

  const hitTargets = useMemo(() => boundHotspots.map((hotspot) => hotspot.object), [boundHotspots]);

  const findPointerHitAt = useCallback(
    (clientX: number, clientY: number): BoundHotspot | undefined => {
      const rect = gl.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0 || hitTargets.length === 0) {
        return undefined;
      }

      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      const previousLayerMask = raycaster.layers.mask;
      raycaster.layers.set(PORTFOLIO_3D_INTERACTION_LAYER);
      raycaster.setFromCamera(pointer, camera);
      raycaster.intersectObjects(hitTargets, true, intersections);
      raycaster.layers.mask = previousLayerMask;

      const intersection = intersections[0];
      intersections.length = 0;

      if (!intersection) {
        return undefined;
      }

      const nodeName = findHotspotNodeName(intersection.object);
      if (!nodeName) {
        return undefined;
      }

      return boundHotspots.find((hotspot) => hotspot.definition.nodeName === nodeName);
    },
    [boundHotspots, camera, gl.domElement, hitTargets, intersections, pointer, raycaster]
  );

  const updateHoveredHotspot = useCallback(
    (hotspotId: Portfolio3dHotspotId | undefined): void => {
      if (hoveredHotspotRef.current === hotspotId) {
        return;
      }

      hoveredHotspotRef.current = hotspotId;
      setHoveredHotspot(hotspotId, 'pointer');
      invalidate();
    },
    [invalidate, setHoveredHotspot]
  );

  useEffect(() => {
    const canvas = gl.domElement;

    const processPointerMove = (): void => {
      pointerMoveFrameRef.current = null;
      const sample = pendingPointerMoveRef.current;
      pendingPointerMoveRef.current = null;

      if (!sample) {
        return;
      }

      const pointerDown = pointerDownRef.current;
      if (pointerDown) {
        const movedPx = Math.hypot(sample.x - pointerDown.x, sample.y - pointerDown.y);
        if (movedPx > pointerClickThresholdPx) {
          updateHoveredHotspot(undefined);
          canvas.style.cursor = '';
        }
        return;
      }

      const hit = findPointerHitAt(sample.x, sample.y);
      updateHoveredHotspot(hit?.definition.id);
      canvas.style.cursor = hit ? 'pointer' : '';
    };

    const schedulePointerMove = (): void => {
      if (pointerMoveFrameRef.current !== null) {
        return;
      }

      pointerMoveFrameRef.current = window.requestAnimationFrame(processPointerMove);
    };

    const onPointerMove = (event: PointerEvent): void => {
      pendingPointerMoveRef.current = { x: event.clientX, y: event.clientY };
      schedulePointerMove();
    };

    const onPointerDown = (event: PointerEvent): void => {
      const hit = findPointerHitAt(event.clientX, event.clientY);
      pointerDownRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startedAt: performance.now(),
        hotspotId: hit?.definition.id
      };

      if (hit && canvas.setPointerCapture) {
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch {
          // Browsers may reject capture after pointer cancellation.
        }
      }
    };

    const onPointerUp = (event: PointerEvent): void => {
      const pointerDown = pointerDownRef.current;
      const hit = findPointerHitAt(event.clientX, event.clientY);
      pointerDownRef.current = null;

      if (canvas.releasePointerCapture) {
        try {
          canvas.releasePointerCapture(event.pointerId);
        } catch {
          // Capture may already be gone after touch cancellation.
        }
      }

      const movedPx = pointerDown ? Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) : Infinity;
      const elapsedMs = pointerDown ? performance.now() - pointerDown.startedAt : Infinity;
      const isCleanClick =
        pointerDown &&
        hit &&
        pointerDown.pointerId === event.pointerId &&
        pointerDown.hotspotId === hit.definition.id &&
        movedPx <= pointerClickThresholdPx &&
        elapsedMs <= pointerClickThresholdMs;

      if (!isCleanClick) {
        return;
      }

      event.preventDefault();
      activateHotspot(hit.definition, 'pointer');
      invalidate();
    };

    const onPointerLeave = (): void => {
      pointerDownRef.current = null;
      pendingPointerMoveRef.current = null;
      updateHoveredHotspot(undefined);
      canvas.style.cursor = '';
    };

    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave, { passive: true });
    canvas.addEventListener('pointercancel', onPointerLeave, { passive: true });

    return () => {
      if (pointerMoveFrameRef.current !== null) {
        window.cancelAnimationFrame(pointerMoveFrameRef.current);
      }

      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointercancel', onPointerLeave);
      canvas.style.cursor = '';
    };
  }, [activateHotspot, findPointerHitAt, gl.domElement, invalidate, updateHoveredHotspot]);

  if (boundHotspots.length === 0) {
    return null;
  }

  return (
    <>
      {boundHotspots.map(({ definition, object }) => {
        const isHighlighted =
          state.hoveredHotspotId === definition.id || state.focusedHotspotId === definition.id;
        const isActive = isHotspotActive(definition, state.activeSectionId, state.isDoorOpen, state.environmentVariant);

        return (
          <HotspotMarker
            key={definition.id}
            definition={definition}
            target={object}
            isActive={isActive}
            isHighlighted={isHighlighted}
          />
        );
      })}
    </>
  );
}

function HotspotMarker({
  definition,
  target,
  isActive,
  isHighlighted
}: Readonly<{
  definition: Portfolio3dHotspotDefinition;
  target: THREE.Object3D;
  isActive: boolean;
  isHighlighted: boolean;
}>): React.ReactElement {
  const groupRef = useRef<THREE.Group | null>(null);
  const worldPosition = useMemo(() => new THREE.Vector3(), []);
  const offset = useMemo(() => new THREE.Vector3(0, getHotspotVerticalOffset(definition), 0), [definition]);
  const color = isActive ? '#66f2ff' : isHighlighted ? '#46dfff' : '#8fb5c3';
  const opacity = isActive ? 0.9 : isHighlighted ? 0.78 : 0.46;

  useFrame(({ camera }) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    target.getWorldPosition(worldPosition);
    group.position.copy(worldPosition).add(offset);
    group.quaternion.copy(camera.quaternion);
    group.scale.setScalar(isActive ? 1.12 : isHighlighted ? 1 : 0.82);
  });

  return (
    <group ref={groupRef} userData={{ portfolio3dHotspotId: definition.id }}>
      <mesh renderOrder={150}>
        <ringGeometry args={[0.034, 0.048, 28]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh renderOrder={151}>
        <circleGeometry args={[0.011, 18]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={Math.min(1, opacity + 0.12)}
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function findHotspotNodeName(object: THREE.Object3D): string | undefined {
  let current: THREE.Object3D | null = object;

  while (current) {
    const nodeName = current.userData[PORTFOLIO_3D_HOTSPOT_NODE_USER_DATA_KEY];
    if (typeof nodeName === 'string') {
      return nodeName;
    }

    current = current.parent;
  }

  return undefined;
}

function getHotspotVerticalOffset(definition: Portfolio3dHotspotDefinition): number {
  if (definition.interactionKind === 'toggle-lighting') {
    return -0.035;
  }

  return definition.interactionKind === 'open-section' ? 0.065 : 0.045;
}

function isHotspotActive(
  definition: Portfolio3dHotspotDefinition,
  activeSectionId: string,
  isDoorOpen: boolean,
  environmentVariant: string
): boolean {
  if (definition.sectionId === activeSectionId) {
    return true;
  }

  if (definition.id === 'door') {
    return isDoorOpen;
  }

  if (definition.id === 'window') {
    return environmentVariant !== 'studio';
  }

  return false;
}