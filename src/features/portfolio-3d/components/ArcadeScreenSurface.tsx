"use client";

import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import type { ArcadeScreenPlacement, EmbeddedScreenId } from "../arcade-screen";
import { usePortfolio3dState } from "../state/Portfolio3dState";
import { type EmbeddedScreenRegistration, useEmbeddedScreenLayer } from "./EmbeddedScreenLayer";
import { captureEmbeddedScreenSnapshot } from "./EmbeddedScreenSnapshot";

const desktopScreenPixelWidth = 1000;
const mobileViewportBreakpoint = 768;
export const maximumMobileScreenZoom = 2.5;
const minimumMobileCameraPanDistance = 8;
const initialPreviewCaptureIntervalMs = 420;
const previewCaptureRetryDelayMs = 360;
const initialPreviewCaptureOrder: readonly EmbeddedScreenId[] = [
  "pipeline",
  "automation",
  "performance",
  "backend",
  "terminal",
  "profile",
  "experience",
  "architecture",
  "contact"
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

export function ArcadeScreenSurface({
  screen,
  screenId,
  onScreenReady,
  onScreenZoomChange,
  onScreenPanChange
}: Readonly<{
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
  const [isPreviewCapturePending, setIsPreviewCapturePending] = useState(false);
  const isInteractive =
    state.activeSectionId === screenId && state.navigationState === "section-open";
  const isMonitor =
    screenId === "pipeline" ||
    screenId === "terminal" ||
    screenId === "automation" ||
    screenId === "backend" ||
    screenId === "performance";
  // The document always uses desktop coordinates. On phones its visual scale is
  // controlled by the physical frame and the touch zoom below, not responsive reflow.
  const pixelWidth = desktopScreenPixelWidth;
  const pixelHeight = (pixelWidth * screen.height) / screen.width;

  useLayoutEffect(() => {
    const element = document.createElement("div");
    element.className = `arcade-screen-document arcade-screen-document--${screenId}`;
    const content = document.createElement("div");
    content.className = "arcade-screen-content";
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
    const selectionMode = isInteractive ? "text" : "none";
    element.style.pointerEvents = isInteractive ? "auto" : "none";
    // CSS3DObject defaults to user-select: none. Let the focused document use
    // native selection and copy, while the room preview remains non-selectable.
    element.style.userSelect = selectionMode;
    element.style.setProperty("-webkit-user-select", selectionMode);
    element.inert = !isInteractive;
    element.setAttribute("aria-hidden", String(!isInteractive));
    const canvas = gl.domElement;
    const previousPointerEvents = canvas.style.pointerEvents;
    const previousEventsEnabled = get().events.enabled;
    screenLayer.setInteractive(runtime, isInteractive);
    screenLayer.render();
    if (isInteractive) {
      // Let native DOM inputs handle clicks and scrolling without scene raycasts.
      canvas.style.pointerEvents = "none";
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
    const gestureHost = gl.domElement.parentElement;
    const previousGestureHostTouchAction = gestureHost?.style.touchAction;
    const activePointers = new Map<number, TouchPoint>();
    let gesture: TouchZoomGesture | undefined;
    let panGesture: TouchPanGesture | undefined;
    let viewportFrame: number | undefined;
    let ownsGestureHostTouchAction = false;
    let scale = 1;
    let pan: EmbeddedScreenPan = { x: 0, y: 0 };

    const isMobileViewport = (): boolean =>
      window.matchMedia(`(max-width: ${mobileViewportBreakpoint - 1}px)`).matches;

    const syncGestureTouchAction = (): void => {
      // Before zoom, keep native vertical document scrolling available. Once
      // enlarged, the complete focused room owns one-finger camera panning,
      // including the visible model around the flattened CSS3D page.
      const touchAction = isInteractive && isMobileViewport() ? (scale > 1 ? "none" : "pan-y") : "";
      element.style.touchAction = touchAction;
      if (isInteractive && gestureHost) {
        gestureHost.style.touchAction = touchAction;
        ownsGestureHostTouchAction = true;
      }
    };

    const restoreGestureTouchAction = (): void => {
      if (gestureHost && ownsGestureHostTouchAction) {
        gestureHost.style.touchAction = previousGestureHostTouchAction ?? "";
        ownsGestureHostTouchAction = false;
      }
    };

    const isGestureTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof Node)) return false;
      return gestureHost ? gestureHost.contains(target) : element.contains(target);
    };

    const resetZoom = (): void => {
      if (viewportFrame !== undefined) {
        window.cancelAnimationFrame(viewportFrame);
        viewportFrame = undefined;
      }
      scale = 1;
      pan = { x: 0, y: 0 };
      syncGestureTouchAction();
      onScreenZoomChange?.(screenId, scale);
      onScreenPanChange?.(screenId, pan);
      if (isInteractive) screenLayer.render();
    };

    const applyViewport = (): void => {
      syncGestureTouchAction();
      if (viewportFrame !== undefined) return;
      // Multiple touch events can arrive before one display frame. Commit only
      // the latest pose; the camera rig then updates WebGL and CSS3D together.
      viewportFrame = window.requestAnimationFrame(() => {
        viewportFrame = undefined;
        onScreenZoomChange?.(screenId, scale);
        onScreenPanChange?.(screenId, pan);
      });
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
        (gesture.initialScale * getTouchDistance(first, second)) /
          Math.max(gesture.initialDistance, 1),
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
      if (event.pointerType !== "touch" || !isMobileViewport() || !isGestureTarget(event.target))
        return;
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
        }

        event.preventDefault();
        updatePan();
      }
    };

    const endGesture = (event: PointerEvent): void => {
      const wasPinching = Boolean(gesture);
      activePointers.delete(event.pointerId);
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
    if (!isInteractive) {
      return () => {
        resetZoom();
        restoreGestureTouchAction();
      };
    }

    // The flattened CSS3D document covers only the physical monitor. Listen at
    // the room host in capture phase so a pan can start in the surrounding 3D
    // model too, while controls rendered outside that host remain untouched.
    window.addEventListener("pointerdown", onPointerDown, { capture: true, passive: false });
    window.addEventListener("pointermove", onPointerMove, { capture: true, passive: false });
    window.addEventListener("pointerup", endGesture, true);
    window.addEventListener("pointercancel", endGesture, true);
    window.addEventListener("resize", onViewportChange);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", endGesture, true);
      window.removeEventListener("pointercancel", endGesture, true);
      window.removeEventListener("resize", onViewportChange);
      resetZoom();
      restoreGestureTouchAction();
    };
  }, [gl, isInteractive, onScreenPanChange, onScreenZoomChange, screenId, screenLayer]);

  const capturePreview = useCallback(async (): Promise<boolean> => {
    const runtime = runtimeRef.current;
    if (!runtime || !runtime.content.firstElementChild) {
      return false;
    }

    const requestId = ++previewCaptureRequestRef.current;
    // Keep the current CSS3D viewport visible through the depth-tested opening
    // until its replacement texture has committed. Never reveal the old preview.
    setIsPreviewCapturePending(true);
    screenLayer.setPreviewCapturePending(runtime, true);

    try {
      const canvas = await captureEmbeddedScreenSnapshot(runtime.content);
      if (previewCaptureRequestRef.current !== requestId || runtimeRef.current !== runtime) {
        return false;
      }

      const nextTexture = createScreenPreviewTexture(canvas, gl);
      previewTextureRef.current = nextTexture;
      setPreviewTexture(nextTexture);
      setIsPreviewCapturePending(false);
      invalidate();

      return true;
    } catch {
      if (previewCaptureRequestRef.current === requestId && runtimeRef.current === runtime) {
        setIsPreviewCapturePending(false);
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
      cancelScheduledCapture = screenLayer.schedulePreviewCapture(async () => {
        if (isCancelled || isInteractive || previewTextureRef.current) {
          return;
        }

        const didCapture = await capturePreview();
        if (isCancelled || didCapture || attempts >= 2) return;
        attempts += 1;
        scheduleCapture(previewCaptureRetryDelayMs);
      }, delayMs);
    };

    scheduleCapture(getInitialPreviewCaptureDelay(screenId));

    return () => {
      isCancelled = true;
      cancelScheduledCapture();
    };
  }, [capturePreview, isInteractive, screenId, screenLayer]);

  useLayoutEffect(() => {
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

  useLayoutEffect(() => {
    const runtime = runtimeRef.current;
    if (runtime && previewTexture) {
      // React has now installed the new map, so hiding the live page cannot
      // expose the previous snapshot for a frame during the camera return.
      screenLayer.setPreviewAvailable(runtime, true);
      invalidate();
    }
  }, [invalidate, previewTexture, screenLayer]);

  useEffect(() => () => previewTexture?.dispose(), [previewTexture]);

  useEffect(() => {
    return () => {
      previewCaptureRequestRef.current += 1;
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
          if (event.delta <= 5 && state.navigationState === "overview") setActiveSection(screenId);
        }}
      >
        <planeGeometry args={[screen.width, screen.height]} />
        {previewTexture && !isPreviewCapturePending ? (
          <meshBasicMaterial
            key="screen-preview"
            polygonOffset={isMonitor}
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
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
            polygonOffset={isMonitor}
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
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
  const maxDragX = Math.max(1, (window.innerWidth * zoomOverflow) / 2);
  const maxDragY = Math.max(1, (window.innerHeight * zoomOverflow) / 2);

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
