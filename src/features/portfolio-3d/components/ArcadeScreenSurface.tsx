'use client';

import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import type { ArcadeScreenPlacement, EmbeddedScreenId } from '../arcade-screen';
import { usePortfolio3dState } from '../state/Portfolio3dState';
import {
  type EmbeddedScreenRegistration,
  useEmbeddedScreenLayer
} from './EmbeddedScreenLayer';
import { captureEmbeddedScreenSnapshot } from './EmbeddedScreenSnapshot';

const desktopScreenPixelWidth = 1000;
const mobileViewportBreakpoint = 768;
export const maximumMobileScreenZoom = 2.5;
const minimumMobileCameraPanDistance = 8;
const initialPreviewCaptureIntervalMs = 420;
const previewCaptureRetryDelayMs = 360;
const initialPreviewCaptureOrder: readonly EmbeddedScreenId[] = [
  'pipeline',
  'automation',
  'performance',
  'backend',
  'terminal',
  'profile',
  'experience',
  'architecture',
  'contact'
];

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
  readonly isPanning: boolean;
}

export function ArcadeScreenSurface({ screen, screenId, onScreenReady, onScreenZoomChange, onScreenPanChange }: Readonly<{
  screen: ArcadeScreenPlacement;
  screenId: EmbeddedScreenId;
  onScreenReady?: (screenId: EmbeddedScreenId, element: HTMLElement | null) => void;
  onScreenZoomChange?: (screenId: EmbeddedScreenId, scale: number) => void;
  onScreenPanChange?: (screenId: EmbeddedScreenId, pan: EmbeddedScreenPan) => void;
}>): React.ReactElement {
  const { gl, invalidate, setEvents, get } = useThree();
  const { state, setActiveSection } = usePortfolio3dState();
  const screenLayer = useEmbeddedScreenLayer();
  const runtimeRef = useRef<EmbeddedScreenRegistration | null>(null);
  const previewTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const previewCaptureRequestRef = useRef(0);
  const wasInteractiveRef = useRef(false);
  const [previewTexture, setPreviewTexture] = useState<THREE.CanvasTexture | null>(null);
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
      isInteractive: false,
      hasPreview: false,
      isPreviewCapturePending: false
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

    const isMobileViewport = (): boolean => window.matchMedia(`(max-width: ${mobileViewportBreakpoint - 1}px)`).matches;

    const syncGestureTouchAction = (): void => {
      // Before zoom, keep native vertical document scrolling available. Once
      // enlarged, the same page surface owns one-finger camera panning in all
      // directions while controls outside the frame remain untouched.
      element.style.touchAction = isInteractive && isMobileViewport()
        ? scale > 1 ? 'none' : 'pan-y'
        : '';
    };

    const resetZoom = (): void => {
      scale = 1;
      pan = { x: 0, y: 0 };
      syncGestureTouchAction();
      onScreenZoomChange?.(screenId, scale);
      onScreenPanChange?.(screenId, pan);
      if (isInteractive) screenLayer.render();
    };

    const applyViewport = (): void => {
      syncGestureTouchAction();
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
      // pan its camera viewport too. Do not capture on pointerdown: a touch
      // without meaningful movement must remain a click on the live document.
      if (activePointers.size === 1 && scale > 1) {
        panGesture = {
          initialPoint: { x: event.clientX, y: event.clientY },
          initialPan: pan,
          isPanning: false
        };
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
        const point = activePointers.values().next().value;
        if (!point) return;

        if (!panGesture.isPanning) {
          const dragDistance = getTouchDistance(panGesture.initialPoint, point);
          if (dragDistance < minimumMobileCameraPanDistance) return;

          panGesture = { ...panGesture, isPanning: true };
          if (!element.hasPointerCapture(event.pointerId)) element.setPointerCapture(event.pointerId);
        }

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
            initialPan: pan,
            isPanning: false
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

  const capturePreview = useCallback(async (): Promise<boolean> => {
    const runtime = runtimeRef.current;
    if (!runtime || !runtime.content.firstElementChild) {
      return false;
    }

    const requestId = ++previewCaptureRequestRef.current;
    // A returning screen has already been restored to its hidden room state by
    // the layout effect above. Briefly restore only its CSS3D backing so the
    // capture sees the current scroll position and DOM state, then hide it
    // again as soon as the WebGL preview texture is ready.
    screenLayer.setPreviewCapturePending(runtime, true);

    try {
      const canvas = await captureEmbeddedScreenSnapshot(runtime.content);
      if (previewCaptureRequestRef.current !== requestId || runtimeRef.current !== runtime) {
        return false;
      }

      const nextTexture = createScreenPreviewTexture(canvas, gl);
      const previousTexture = previewTextureRef.current;
      previewTextureRef.current = nextTexture;
      setPreviewTexture(nextTexture);
      previousTexture?.dispose();
      screenLayer.setPreviewAvailable(runtime, true);
      invalidate();

      return true;
    } catch {
      if (previewCaptureRequestRef.current === requestId && runtimeRef.current === runtime) {
        screenLayer.setPreviewCapturePending(runtime, false);
      }

      return false;
    }
  }, [gl, invalidate, screenLayer]);

  useEffect(() => {
    if (isInteractive || previewTextureRef.current) {
      return;
    }

    let isCancelled = false;
    let attempts = 0;
    let cancelScheduledCapture = (): void => {};

    const scheduleCapture = (delayMs: number): void => {
      cancelScheduledCapture = scheduleIdlePreviewCapture(() => {
        if (isCancelled || isInteractive || previewTextureRef.current) {
          return;
        }

        void capturePreview().then((didCapture) => {
          if (isCancelled || didCapture || attempts >= 2) {
            return;
          }

          attempts += 1;
          scheduleCapture(previewCaptureRetryDelayMs);
        });
      }, delayMs);
    };

    scheduleCapture(getInitialPreviewCaptureDelay(screenId));

    return () => {
      isCancelled = true;
      cancelScheduledCapture();
    };
  }, [capturePreview, isInteractive, screenId]);

  useEffect(() => {
    if (isInteractive) {
      wasInteractiveRef.current = true;
      return;
    }

    if (!wasInteractiveRef.current) {
      return;
    }

    wasInteractiveRef.current = false;
    void capturePreview();
  }, [capturePreview, isInteractive]);

  useEffect(() => {
    return () => {
      previewCaptureRequestRef.current += 1;
      previewTextureRef.current?.dispose();
      previewTextureRef.current = null;
    };
  }, []);

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
        {previewTexture ? (
          <meshBasicMaterial
            key={`screen-preview-${previewTexture.uuid}`}
            map={previewTexture}
            color="#ffffff"
            toneMapped={false}
            fog={false}
            depthTest
            depthWrite
            side={THREE.DoubleSide}
          />
        ) : (
          /* This clears the canvas only inside the display while preserving its depth. */
          <meshBasicMaterial
            key="live-screen-depth"
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
        )}
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

function createScreenPreviewTexture(
  canvas: HTMLCanvasElement,
  renderer: THREE.WebGLRenderer
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;

  return texture;
}

function getInitialPreviewCaptureDelay(screenId: EmbeddedScreenId): number {
  const screenIndex = initialPreviewCaptureOrder.indexOf(screenId);
  return Math.max(screenIndex, 0) * initialPreviewCaptureIntervalMs;
}

function scheduleIdlePreviewCapture(callback: () => void, delayMs: number): () => void {
  let idleCallbackId: number | undefined;
  const timeoutId = window.setTimeout(() => {
    if (typeof window.requestIdleCallback === 'function') {
      idleCallbackId = window.requestIdleCallback(callback, { timeout: 1200 });
      return;
    }

    callback();
  }, delayMs);

  return () => {
    window.clearTimeout(timeoutId);
    if (idleCallbackId !== undefined && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(idleCallbackId);
    }
  };
}
