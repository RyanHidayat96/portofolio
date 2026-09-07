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

interface TouchPoint {
  readonly x: number;
  readonly y: number;
}

interface TouchZoomGesture {
  readonly initialDistance: number;
  readonly initialScale: number;
}

export function ArcadeScreenSurface({ screen, screenId, onScreenReady, onScreenZoomChange }: Readonly<{
  screen: ArcadeScreenPlacement;
  screenId: EmbeddedScreenId;
  onScreenReady?: (screenId: EmbeddedScreenId, element: HTMLElement | null) => void;
  onScreenZoomChange?: (screenId: EmbeddedScreenId, scale: number) => void;
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
    let scale = 1;

    const resetZoom = (): void => {
      scale = 1;
      onScreenZoomChange?.(screenId, scale);
      if (isInteractive) screenLayer.render();
    };

    const isMobileViewport = (): boolean => window.matchMedia(`(max-width: ${mobileViewportBreakpoint - 1}px)`).matches;

    const applyZoom = (): void => {
      onScreenZoomChange?.(screenId, scale);
      screenLayer.render();
    };

    const beginGesture = (): void => {
      if (!isMobileViewport() || activePointers.size !== 2) return;

      const [first, second] = [...activePointers.values()];
      if (!first || !second) return;

      gesture = {
        initialDistance: getTouchDistance(first, second),
        initialScale: scale
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
      applyZoom();
    };

    const onPointerDown = (event: PointerEvent): void => {
      if (event.pointerType !== 'touch' || !isMobileViewport()) return;
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
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
      if (!gesture) return;
      event.preventDefault();
      updateGesture();
    };

    const endGesture = (event: PointerEvent): void => {
      activePointers.delete(event.pointerId);
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      if (activePointers.size < 2) gesture = undefined;
    };

    const onViewportChange = (): void => {
      activePointers.clear();
      gesture = undefined;
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
  }, [isInteractive, onScreenZoomChange, screenId, screenLayer]);

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

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
