'use client';

import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import type { ArcadeScreenPlacement, EmbeddedScreenId } from '../arcade-screen';
import { usePortfolio3dState } from '../state/Portfolio3dState';
import {
  type EmbeddedScreenRegistration,
  useEmbeddedScreenLayer
} from './EmbeddedScreenLayer';

const desktopScreenPixelWidth = 1000;
const mobileViewportBreakpoint = 768;
export const maximumMobileScreenZoom = 2.5;

export interface EmbeddedScreenPan {
  readonly x: number;
  readonly y: number;
}

interface TouchPoint {
  readonly x: number;
  readonly y: number;
}

interface TouchZoomGesture {
  readonly initialDistance: number;
  readonly initialScale: number;
  readonly initialCenter: TouchPoint;
  readonly initialPan: EmbeddedScreenPan;
}

interface TouchPanGesture {
  readonly initialPoint: TouchPoint;
  readonly initialPan: EmbeddedScreenPan;
}

export function ArcadeScreenSurface({ screen, screenId, onScreenReady, onScreenZoomChange, onScreenPanChange }: Readonly<{
  screen: ArcadeScreenPlacement;
  screenId: EmbeddedScreenId;
  onScreenReady?: (screenId: EmbeddedScreenId, element: HTMLElement | null) => void;
  onScreenZoomChange?: (screenId: EmbeddedScreenId, scale: number) => void;
  onScreenPanChange?: (screenId: EmbeddedScreenId, pan: EmbeddedScreenPan) => void;
}>): React.ReactElement {
  const { gl, setEvents, get } = useThree();
  const { state, setActiveSection } = usePortfolio3dState();
  const screenLayer = useEmbeddedScreenLayer();
  const runtimeRef = useRef<EmbeddedScreenRegistration | null>(null);
  const isInteractive = state.activeSectionId === screenId && state.navigationState === 'section-open';
  // The document always uses desktop coordinates. On phones its visual scale is
  // controlled by the physical frame and the touch zoom below, not responsive reflow.
  const pixelWidth = desktopScreenPixelWidth;
  const pixelHeight = pixelWidth * screen.height / screen.width;

  useLayoutEffect(() => {
    const element = document.createElement('div');
    element.className = `arcade-screen-document arcade-screen-document--${screenId}`;
    const content = document.createElement('div');
    content.className = 'arcade-screen-content';
    element.appendChild(content);
    const object = new CSS3DObject(element);
    const runtime: EmbeddedScreenRegistration = {
      screenId,
      object,
      content,
      screen,
      pixelWidth,
      pixelHeight,
      isInteractive: false
    };
    runtimeRef.current = runtime;
    screenLayer.registerScreen(runtime);
    onScreenReady?.(screenId, content);

    return () => {
      screenLayer.unregisterScreen(runtime);
      runtimeRef.current = null;
      onScreenReady?.(screenId, null);
    };
  }, [onScreenReady, screenId, screenLayer]);

  useLayoutEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    screenLayer.configureScreen(runtime, screen, pixelWidth, pixelHeight);
  }, [pixelHeight, pixelWidth, screen, screenLayer]);

  useLayoutEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const element = runtime.object.element;
    const selectionMode = isInteractive ? 'text' : 'none';
    runtime.object.visible = true;
    element.style.pointerEvents = isInteractive ? 'auto' : 'none';
    // CSS3DObject defaults to user-select: none. Let the focused document use
    // native selection and copy, while the room preview remains non-selectable.
    element.style.userSelect = selectionMode;
    element.style.setProperty('-webkit-user-select', selectionMode);
    element.inert = !isInteractive;
    element.setAttribute('aria-hidden', String(!isInteractive));
    const canvas = gl.domElement;
    const previousPointerEvents = canvas.style.pointerEvents;
    const previousEventsEnabled = get().events.enabled;
    screenLayer.setInteractive(runtime, isInteractive);
    screenLayer.render();
    if (isInteractive) {
      // Let native DOM inputs handle clicks and scrolling without scene raycasts.
      canvas.style.pointerEvents = 'none';
      setEvents({ enabled: false });
    }
    return () => {
      screenLayer.setInteractive(runtime, false);
      canvas.style.pointerEvents = previousPointerEvents;
      setEvents({ enabled: previousEventsEnabled });
    };
  }, [get, gl, isInteractive, screenLayer, setEvents]);

  useLayoutEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    const { object } = runtime;
    const element = object.element;
    const activePointers = new Map<number, TouchPoint>();
    let gesture: TouchZoomGesture | undefined;
    let panGesture: TouchPanGesture | undefined;
    let scale = 1;
    let pan: EmbeddedScreenPan = { x: 0, y: 0 };

    const resetZoom = (): void => {
      scale = 1;
      pan = { x: 0, y: 0 };
      onScreenZoomChange?.(screenId, scale);
      onScreenPanChange?.(screenId, pan);
      if (isInteractive) screenLayer.render();
    };

    const isMobileViewport = (): boolean => window.matchMedia(`(max-width: ${mobileViewportBreakpoint - 1}px)`).matches;

    const applyViewport = (): void => {
      onScreenZoomChange?.(screenId, scale);
      onScreenPanChange?.(screenId, pan);
      screenLayer.render();
    };

    const beginGesture = (): void => {
      if (!isMobileViewport() || activePointers.size !== 2) return;

      const [first, second] = [...activePointers.values()];
      if (!first || !second) return;

      gesture = {
        initialDistance: getTouchDistance(first, second),
        initialScale: scale,
        initialCenter: getTouchCenter(first, second),
        initialPan: pan
      };
    };

    const updateGesture = (): void => {
      if (!gesture || activePointers.size !== 2) return;

      const [first, second] = [...activePointers.values()];
      if (!first || !second) return;

      const nextScale = clamp(
        gesture.initialScale * getTouchDistance(first, second) / Math.max(gesture.initialDistance, 1),
        1,
        maximumMobileScreenZoom
      );
      scale = nextScale;
      pan = getPannedViewportOffset(
        gesture.initialPan,
        gesture.initialCenter,
        getTouchCenter(first, second),
        scale
      );
      applyViewport();
    };

    const updatePan = (): void => {
      if (!panGesture || activePointers.size !== 1) return;

      const point = activePointers.values().next().value;
      if (!point) return;

      pan = getPannedViewportOffset(panGesture.initialPan, panGesture.initialPoint, point, scale);
      applyViewport();
    };

    const onPointerDown = (event: PointerEvent): void => {
      if (event.pointerType !== 'touch' || !isMobileViewport()) return;
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      // Once the focused screen is enlarged, a new single-finger drag should
      // pan its camera viewport too. A touch without movement still reaches
      // the embedded document as a regular click.
      if (activePointers.size === 1 && scale > 1) {
        panGesture = {
          initialPoint: { x: event.clientX, y: event.clientY },
          initialPan: pan
        };
        if (!element.hasPointerCapture(event.pointerId)) element.setPointerCapture(event.pointerId);
        return;
      }

      if (activePointers.size === 2) {
        event.preventDefault();
        activePointers.forEach((_, pointerId) => {
          if (!element.hasPointerCapture(pointerId)) element.setPointerCapture(pointerId);
        });
        beginGesture();
      }
    };

    const onPointerMove = (event: PointerEvent): void => {
      if (!activePointers.has(event.pointerId)) return;
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (gesture && activePointers.size === 2) {
        event.preventDefault();
        updateGesture();
        return;
      }

      if (panGesture && activePointers.size === 1) {
        event.preventDefault();
        updatePan();
      }
    };

    const endGesture = (event: PointerEvent): void => {
      const wasPinching = Boolean(gesture);
      activePointers.delete(event.pointerId);
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      if (activePointers.size === 1 && wasPinching && scale > 1) {
        const remainingPoint = activePointers.values().next().value;
        if (remainingPoint) {
          panGesture = {
            initialPoint: remainingPoint,
            initialPan: pan
          };
        }
      } else if (activePointers.size === 0) {
        panGesture = undefined;
      }
      if (activePointers.size < 2) gesture = undefined;
    };

    const onViewportChange = (): void => {
      activePointers.clear();
      gesture = undefined;
      panGesture = undefined;
      resetZoom();
    };

    resetZoom();
    if (!isInteractive) return resetZoom;

    element.addEventListener('pointerdown', onPointerDown, { passive: false });
    element.addEventListener('pointermove', onPointerMove, { passive: false });
    element.addEventListener('pointerup', endGesture);
    element.addEventListener('pointercancel', endGesture);
    window.addEventListener('resize', onViewportChange);

    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', endGesture);
      element.removeEventListener('pointercancel', endGesture);
      window.removeEventListener('resize', onViewportChange);
      resetZoom();
    };
  }, [isInteractive, onScreenPanChange, onScreenZoomChange, screenId, screenLayer]);

  return (
    <>
      <mesh
        name={`Embedded_${screenId}_Surface`}
        position={screen.position}
        quaternion={screen.quaternion}
        onClick={(event) => {
          event.stopPropagation();
          if (event.delta <= 5 && state.navigationState === 'overview') setActiveSection(screenId);
        }}
      >
        <planeGeometry args={[screen.width, screen.height]} />
        {/* This clears the canvas only inside the display while preserving its depth. */}
        <meshBasicMaterial
          color="#000000"
          blending={THREE.NoBlending}
          opacity={0}
          transparent={false}
          toneMapped={false}
          fog={false}
          depthTest
          depthWrite
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

function getTouchDistance(first: TouchPoint, second: TouchPoint): number {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function getTouchCenter(first: TouchPoint, second: TouchPoint): TouchPoint {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2
  };
}

function getPannedViewportOffset(
  initialPan: EmbeddedScreenPan,
  initialPoint: TouchPoint,
  currentPoint: TouchPoint,
  scale: number
): EmbeddedScreenPan {
  const zoomOverflow = Math.max(scale - 1, 0);
  if (zoomOverflow < 0.01) return { x: 0, y: 0 };

  // This maps a full drag across the zoomed-overflow area to the camera's
  // initial screen bounds. A fresh one-finger touch remains native page scroll.
  const maxDragX = Math.max(1, window.innerWidth * zoomOverflow / 2);
  const maxDragY = Math.max(1, window.innerHeight * zoomOverflow / 2);

  return {
    x: clamp(initialPan.x - (currentPoint.x - initialPoint.x) / maxDragX, -1, 1),
    y: clamp(initialPan.y + (currentPoint.y - initialPoint.y) / maxDragY, -1, 1)
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
