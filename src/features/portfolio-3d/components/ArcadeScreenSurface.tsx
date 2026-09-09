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
const minimumEmbeddedContentScrollDistance = 1;
const embeddedContentScrollEdgeTolerance = 1;
const initialPreviewCaptureIntervalMs = 260;
const previewCaptureRetryDelayMs = 360;
const returnPreviewCaptureDelayMs = 0;
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
  readonly scrollTarget?: HTMLElement;
  readonly initialScrollLeft?: number;
  readonly initialScrollTop?: number;
  readonly maxScrollLeft?: number;
  readonly maxScrollTop?: number;
  readonly hasScrolledContent?: boolean;
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
  const cancelReturnPreviewCaptureRef = useRef<(() => void) | null>(null);
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
    let isTouchEventGestureActive = false;
    let isViewportGestureActive = false;
    let ownsGestureHostTouchAction = false;
    let scale = 1;
    let pan: EmbeddedScreenPan = { x: 0, y: 0 };

    const isMobileViewport = (): boolean =>
      window.matchMedia(`(max-width: ${mobileViewportBreakpoint - 1}px)`).matches;

    const syncGestureTouchAction = (): void => {
      // Before zoom, keep native vertical document scrolling available. Once
      // enlarged, the complete focused room owns one-finger camera panning,
      // including the visible model around the flattened CSS3D page.
      const isViewportGesture = isViewportGestureActive || scale > 1;
      const touchAction = isInteractive && isMobileViewport() ? (isViewportGesture ? "none" : "pan-y") : "";
      element.style.touchAction = touchAction;
      runtime.content.style.touchAction = touchAction;
      if (touchAction === "none") element.dataset.gestureMode = "viewport";
      else delete element.dataset.gestureMode;
      if (isInteractive && gestureHost) {
        gestureHost.style.touchAction = touchAction;
        ownsGestureHostTouchAction = true;
      }
    };

    const restoreGestureTouchAction = (): void => {
      element.style.touchAction = "";
      runtime.content.style.touchAction = "";
      delete element.dataset.gestureMode;
      if (gestureHost && ownsGestureHostTouchAction) {
        gestureHost.style.touchAction = previousGestureHostTouchAction ?? "";
        ownsGestureHostTouchAction = false;
      }
    };

    const isGestureTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof Node)) return false;
      return gestureHost ? gestureHost.contains(target) : element.contains(target);
    };

    const isScrollableOverflow = (overflow: string): boolean =>
      overflow === "auto" || overflow === "scroll" || overflow === "overlay";

    const findScrollableGestureTarget = (target: EventTarget | null): HTMLElement | undefined => {
      if (!(target instanceof Node) || !element.contains(target)) return undefined;

      const start = target instanceof Element ? target : target.parentElement;
      for (
        let current: Element | null = start;
        current && current !== element;
        current = current.parentElement
      ) {
        if (!(current instanceof HTMLElement) || !runtime.content.contains(current)) continue;

        const style = window.getComputedStyle(current);
        const hasVerticalScroll =
          isScrollableOverflow(style.overflowY) &&
          current.scrollHeight > current.clientHeight + embeddedContentScrollEdgeTolerance;
        const hasHorizontalScroll =
          isScrollableOverflow(style.overflowX) &&
          current.scrollWidth > current.clientWidth + embeddedContentScrollEdgeTolerance;
        if (hasVerticalScroll || hasHorizontalScroll) return current;
      }

      return undefined;
    };

    const beginPanGesture = (
      initialPoint: TouchPoint,
      target: EventTarget | null
    ): TouchPanGesture => {
      const scrollTarget = findScrollableGestureTarget(target);
      const maxScrollLeft = scrollTarget
        ? Math.max(0, scrollTarget.scrollWidth - scrollTarget.clientWidth)
        : undefined;
      const maxScrollTop = scrollTarget
        ? Math.max(0, scrollTarget.scrollHeight - scrollTarget.clientHeight)
        : undefined;
      return {
        initialPoint,
        initialPan: pan,
        isPanning: false,
        scrollTarget,
        initialScrollLeft: scrollTarget?.scrollLeft,
        initialScrollTop: scrollTarget?.scrollTop,
        maxScrollLeft,
        maxScrollTop
      };
    };

    const applyContentScrollAxis = (
      scrollTarget: HTMLElement,
      axis: "x" | "y",
      initialScrollPosition: number,
      maxScrollPosition: number,
      gestureDelta: number
    ): boolean => {
      if (Math.abs(gestureDelta) < minimumEmbeddedContentScrollDistance) return false;

      if (maxScrollPosition <= embeddedContentScrollEdgeTolerance) return false;

      const currentScrollPosition =
        axis === "y" ? scrollTarget.scrollTop : scrollTarget.scrollLeft;
      const nextScrollPosition = clamp(
        initialScrollPosition - gestureDelta,
        0,
        maxScrollPosition
      );
      if (Math.abs(nextScrollPosition - currentScrollPosition) > embeddedContentScrollEdgeTolerance) {
        if (axis === "y") scrollTarget.scrollTop = nextScrollPosition;
        else scrollTarget.scrollLeft = nextScrollPosition;
        return true;
      }

      if (gestureDelta < 0) {
        return currentScrollPosition < maxScrollPosition - embeddedContentScrollEdgeTolerance;
      }
      if (gestureDelta > 0) {
        return currentScrollPosition > embeddedContentScrollEdgeTolerance;
      }

      return false;
    };

    const scrollEmbeddedContentBeforePan = (point: TouchPoint): boolean => {
      if (!panGesture?.scrollTarget) return false;

      const deltaX = point.x - panGesture.initialPoint.x;
      const deltaY = point.y - panGesture.initialPoint.y;
      const didScroll =
        Math.abs(deltaY) >= Math.abs(deltaX)
          ? applyContentScrollAxis(
              panGesture.scrollTarget,
              "y",
              panGesture.initialScrollTop ?? panGesture.scrollTarget.scrollTop,
              panGesture.maxScrollTop ??
                Math.max(0, panGesture.scrollTarget.scrollHeight - panGesture.scrollTarget.clientHeight),
              deltaY
            )
          : applyContentScrollAxis(
              panGesture.scrollTarget,
              "x",
              panGesture.initialScrollLeft ?? panGesture.scrollTarget.scrollLeft,
              panGesture.maxScrollLeft ??
                Math.max(0, panGesture.scrollTarget.scrollWidth - panGesture.scrollTarget.clientWidth),
              deltaX
            );

      if (didScroll) panGesture = { ...panGesture, hasScrolledContent: true };
      return didScroll;
    };

    const resetZoom = (): void => {
      if (viewportFrame !== undefined) {
        window.cancelAnimationFrame(viewportFrame);
        viewportFrame = undefined;
      }
      scale = 1;
      pan = { x: 0, y: 0 };
      isTouchEventGestureActive = false;
      isViewportGestureActive = false;
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

    const beginZoomGestureFromPoints = (first: TouchPoint, second: TouchPoint): void => {
      gesture = {
        initialDistance: getTouchDistance(first, second),
        initialScale: scale,
        initialCenter: getTouchCenter(first, second),
        initialPan: pan
      };
    };

    const updateZoomGestureFromPoints = (first: TouchPoint, second: TouchPoint): void => {
      if (!gesture) return;

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

    const updatePanFromPoint = (point: TouchPoint): void => {
      if (!panGesture) return;

      pan = getPannedViewportOffset(panGesture.initialPan, panGesture.initialPoint, point, scale);
      applyViewport();
    };

    const getFirstTouchPoint = (touches: TouchList): TouchPoint | undefined => {
      const touch = touches.item(0);
      return touch ? { x: touch.clientX, y: touch.clientY } : undefined;
    };

    const getFirstTwoTouchPoints = (
      touches: TouchList
    ): readonly [TouchPoint, TouchPoint] | undefined => {
      const first = touches.item(0);
      const second = touches.item(1);
      return first && second
        ? [{ x: first.clientX, y: first.clientY }, { x: second.clientX, y: second.clientY }]
        : undefined;
    };

    const beginTouchZoomGesture = (touches: TouchList): boolean => {
      const points = getFirstTwoTouchPoints(touches);
      if (!points) return false;

      activePointers.clear();
      panGesture = undefined;
      isTouchEventGestureActive = true;
      isViewportGestureActive = true;
      beginZoomGestureFromPoints(points[0], points[1]);
      syncGestureTouchAction();
      return true;
    };

    const onPointerDown = (event: PointerEvent): void => {
      if (isTouchEventGestureActive) return;
      if (event.pointerType !== "touch" || !isMobileViewport() || !isGestureTarget(event.target))
        return;
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      // Once the focused screen is enlarged, a new single-finger drag should
      // pan its camera viewport too. Do not capture on pointerdown: a touch
      // without meaningful movement must remain a click on the live document.
      if (activePointers.size === 1 && scale > 1) {
        panGesture = beginPanGesture({ x: event.clientX, y: event.clientY }, event.target);
        return;
      }

      if (activePointers.size === 2) {
        event.preventDefault();
        beginGesture();
      }
    };

    const onPointerMove = (event: PointerEvent): void => {
      if (isTouchEventGestureActive) return;
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

        if (!panGesture.isPanning && scrollEmbeddedContentBeforePan(point)) {
          event.preventDefault();
          return;
        }

        if (!panGesture.isPanning) {
          const dragDistance = getTouchDistance(panGesture.initialPoint, point);
          if (dragDistance < minimumMobileCameraPanDistance) return;

          panGesture = panGesture.hasScrolledContent
            ? { initialPoint: point, initialPan: pan, isPanning: true }
            : { ...panGesture, isPanning: true, scrollTarget: undefined };
        }

        event.preventDefault();
        updatePanFromPoint(point);
      }
    };

    const endGesture = (event: PointerEvent): void => {
      const wasPinching = Boolean(gesture);
      activePointers.delete(event.pointerId);
      if (activePointers.size === 1 && wasPinching && scale > 1) {
        const remainingPoint = activePointers.values().next().value;
        if (remainingPoint) {
          panGesture = beginPanGesture(remainingPoint, event.target);
        }
      } else if (activePointers.size === 0) {
        panGesture = undefined;
      }
      if (activePointers.size < 2) gesture = undefined;
    };

    const onTouchStart = (event: TouchEvent): void => {
      if (!isMobileViewport() || !isGestureTarget(event.target)) return;

      if (event.touches.length >= 2) {
        if (beginTouchZoomGesture(event.touches)) event.preventDefault();
        return;
      }

      if (event.touches.length === 1 && scale > 1) {
        const point = getFirstTouchPoint(event.touches);
        if (!point) return;

        activePointers.clear();
        gesture = undefined;
        isTouchEventGestureActive = true;
        isViewportGestureActive = true;
        panGesture = beginPanGesture(point, event.target);
        syncGestureTouchAction();
      }
    };

    const onTouchMove = (event: TouchEvent): void => {
      if (!isMobileViewport() || !isGestureTarget(event.target)) return;

      if (event.touches.length >= 2) {
        if (!gesture && !beginTouchZoomGesture(event.touches)) return;
        const points = getFirstTwoTouchPoints(event.touches);
        if (!points) return;

        event.preventDefault();
        isTouchEventGestureActive = true;
        isViewportGestureActive = true;
        updateZoomGestureFromPoints(points[0], points[1]);
        return;
      }

      if (event.touches.length === 1 && scale > 1) {
        const point = getFirstTouchPoint(event.touches);
        if (!point) return;

        isTouchEventGestureActive = true;
        isViewportGestureActive = true;
        if (!panGesture) {
          panGesture = beginPanGesture(point, event.target);
          syncGestureTouchAction();
          return;
        }

        if (!panGesture.isPanning && scrollEmbeddedContentBeforePan(point)) {
          event.preventDefault();
          return;
        }

        if (!panGesture.isPanning) {
          const dragDistance = getTouchDistance(panGesture.initialPoint, point);
          if (dragDistance < minimumMobileCameraPanDistance) return;

          panGesture = panGesture.hasScrolledContent
            ? { initialPoint: point, initialPan: pan, isPanning: true }
            : { ...panGesture, isPanning: true, scrollTarget: undefined };
        }

        event.preventDefault();
        updatePanFromPoint(point);
      }
    };

    const onTouchEnd = (event: TouchEvent): void => {
      if (!isTouchEventGestureActive) return;
      if (event.touches.length >= 2 && beginTouchZoomGesture(event.touches)) return;
      gesture = undefined;
      const remainingPoint = scale > 1 ? getFirstTouchPoint(event.touches) : undefined;
      panGesture = remainingPoint ? beginPanGesture(remainingPoint, event.target) : undefined;
      isTouchEventGestureActive = Boolean(remainingPoint);
      isViewportGestureActive = scale > 1;
      syncGestureTouchAction();
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
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: false });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
    window.addEventListener("touchend", onTouchEnd, { capture: true, passive: false });
    window.addEventListener("touchcancel", onTouchEnd, { capture: true, passive: false });
    window.addEventListener("resize", onViewportChange);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", endGesture, true);
      window.removeEventListener("pointercancel", endGesture, true);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("touchend", onTouchEnd, true);
      window.removeEventListener("touchcancel", onTouchEnd, true);
      window.removeEventListener("resize", onViewportChange);
      resetZoom();
      restoreGestureTouchAction();
    };
  }, [gl, isInteractive, onScreenPanChange, onScreenZoomChange, screenId, screenLayer]);

  const cancelReturnPreviewCapture = useCallback((): void => {
    cancelReturnPreviewCaptureRef.current?.();
    cancelReturnPreviewCaptureRef.current = null;
  }, []);

  const capturePreview = useCallback(async (): Promise<boolean> => {
    const runtime = runtimeRef.current;
    if (!runtime || !runtime.content.firstElementChild) {
      return false;
    }

    const requestId = ++previewCaptureRequestRef.current;
    const clearPendingCapture = (): void => {
      if (previewCaptureRequestRef.current === requestId && runtimeRef.current === runtime) {
        setIsPreviewCapturePending(false);
        screenLayer.setPreviewCapturePending(runtime, false);
      }
    };
    const shouldContinueCapture = (): boolean =>
      previewCaptureRequestRef.current === requestId &&
      runtimeRef.current === runtime &&
      !runtime.isInteractive &&
      screenLayer.canCapturePreview();
    if (!shouldContinueCapture()) {
      clearPendingCapture();
      return false;
    }

    // Keep the current CSS3D viewport visible through the depth-tested opening
    // until its replacement texture has committed. Never reveal the old preview.
    setIsPreviewCapturePending(true);
    screenLayer.setPreviewCapturePending(runtime, true);

    try {
      const canvas = await captureEmbeddedScreenSnapshot(runtime.content, {
        shouldContinue: shouldContinueCapture
      });
      if (!shouldContinueCapture()) {
        return false;
      }

      const nextTexture = createScreenPreviewTexture(canvas, gl);
      previewTextureRef.current = nextTexture;
      setPreviewTexture(nextTexture);
      setIsPreviewCapturePending(false);
      invalidate();

      return true;
    } catch {
      clearPendingCapture();

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

  const scheduleReturnPreviewCapture = useCallback((): void => {
    const runtime = runtimeRef.current;
    if (!runtime || !runtime.content.firstElementChild) {
      return;
    }

    cancelReturnPreviewCapture();

    // Keep the latest live page visible, but move DOM-to-image work away from
    // camera animation and active room input so transitions remain smooth.
    setIsPreviewCapturePending(true);
    screenLayer.setPreviewCapturePending(runtime, true);
    let attempts = 0;
    const scheduleCapture = (delayMs: number): void => {
      cancelReturnPreviewCaptureRef.current = screenLayer.schedulePreviewCapture(async () => {
        cancelReturnPreviewCaptureRef.current = null;
        const didCapture = await capturePreview();
        if (didCapture || runtimeRef.current !== runtime || runtime.isInteractive) return;
        if (attempts >= 3) return;

        attempts += 1;
        scheduleCapture(previewCaptureRetryDelayMs);
      }, delayMs);
    };

    scheduleCapture(returnPreviewCaptureDelayMs);
  }, [cancelReturnPreviewCapture, capturePreview, screenLayer]);

  useLayoutEffect(() => {
    if (isInteractive) {
      cancelReturnPreviewCapture();
      wasInteractiveRef.current = true;
      return;
    }

    if (!wasInteractiveRef.current) {
      return;
    }

    wasInteractiveRef.current = false;
    scheduleReturnPreviewCapture();
  }, [cancelReturnPreviewCapture, isInteractive, scheduleReturnPreviewCapture]);

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
      cancelReturnPreviewCapture();
      previewCaptureRequestRef.current += 1;
      previewTextureRef.current = null;
    };
  }, [cancelReturnPreviewCapture]);

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
  texture.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;

  return texture;
}

function getInitialPreviewCaptureDelay(screenId: EmbeddedScreenId): number {
  const screenIndex = initialPreviewCaptureOrder.indexOf(screenId);
  return Math.max(screenIndex, 0) * initialPreviewCaptureIntervalMs;
}
