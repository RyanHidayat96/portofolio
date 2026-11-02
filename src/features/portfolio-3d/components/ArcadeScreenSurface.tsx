"use client";

import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import type { ArcadeScreenPlacement, EmbeddedScreenId } from "../arcade-screen";
import { withPortfolio3dBasePath } from "../asset-url";
import { usePortfolio3dState } from "../state/Portfolio3dState";
import { type EmbeddedScreenRegistration, useEmbeddedScreenLayer } from "./EmbeddedScreenLayer";
import { captureEmbeddedScreenSnapshot } from "./EmbeddedScreenSnapshot";
import { CrtScreenSurface } from "./CrtScreenSurface";

const desktopScreenPixelWidth = 1000;
const mobileScreenPixelWidth = 500;
const mobileViewportBreakpoint = 768;
export const maximumMobileScreenZoom = 2.5;
const minimumMobileCameraPanDistance = 8;
const minimumEmbeddedContentScrollDistance = 1;
const embeddedContentScrollEdgeTolerance = 1;
const mobileRoomPreviewCaptureEvent = "portfolio-3d:prepare-mobile-room-preview";
const mobileRoomPreviewMaxDimension = 500;

const mobileInitialPreviewPathByScreen: Readonly<Record<EmbeddedScreenId, string>> = {
  profile: "/models/portfolio-3d/previews/profile-initial.png",
  experience: "/models/portfolio-3d/previews/experience-initial.png",
  architecture: "/models/portfolio-3d/previews/architecture-initial.png",
  pipeline: "/models/portfolio-3d/previews/pipeline-initial.png",
  automation: "/models/portfolio-3d/previews/automation-initial.png",
  performance: "/models/portfolio-3d/previews/performance-initial.png",
  backend: "/models/portfolio-3d/previews/backend-initial.png",
  terminal: "/models/portfolio-3d/previews/terminal-initial.png",
  contact: "/models/portfolio-3d/previews/contact-initial.png"
};

interface MobileRoomPreviewCaptureRequest {
  readonly screenId: EmbeddedScreenId;
  claimed: boolean;
  ready: () => void;
}

export function prepareMobileRoomPreview(screenId: EmbeddedScreenId): Promise<void> {
  if (
    typeof window === "undefined" ||
    !window.matchMedia(`(max-width: ${mobileViewportBreakpoint - 1}px)`).matches
  ) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve();
    };
    const request: MobileRoomPreviewCaptureRequest = {
      screenId,
      claimed: false,
      ready: finish
    };
    const timeout = window.setTimeout(finish, 100);
    window.dispatchEvent(new CustomEvent<MobileRoomPreviewCaptureRequest>(
      mobileRoomPreviewCaptureEvent,
      { detail: request }
    ));

    if (!request.claimed) finish();
  });
}

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
  const mobilePreviewTextureRef = useRef<THREE.Texture | null>(null);
  const captureRequestRef = useRef(0);
  const hasPreExitCaptureRef = useRef(false);
  const hasSessionMobileRoomPreviewRef = useRef(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobileRoomPreview, setMobileRoomPreview] = useState<THREE.Texture | null>(null);
  const isInteractive =
    state.activeSectionId === screenId && state.navigationState === "section-open";
  const usesCrtSurface =
    screenId === "pipeline" ||
    screenId === "terminal" ||
    screenId === "automation" ||
    screenId === "backend" ||
    screenId === "performance";
  // The document always uses desktop coordinates (1000px) so the layout,
  // typography, and proportions are 100% identical to what is seen in the room.
  const pixelWidth = desktopScreenPixelWidth;
  const pixelHeight = Math.round((pixelWidth * screen.height) / screen.width);
  const usesMobileRoomPreview = isMobileViewport;

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${mobileViewportBreakpoint - 1}px)`);
    const updateViewport = (): void => setIsMobileViewport(media.matches);
    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

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

  const captureMobileRoomPreview = useCallback(async (): Promise<boolean> => {
    const runtime = runtimeRef.current;
    if (!usesMobileRoomPreview || !runtime || !runtime.content.firstElementChild) return false;

    const requestId = ++captureRequestRef.current;
    const previewSource = cloneMobileRoomPreviewSource(runtime.object.element, pixelWidth, pixelHeight);
    try {
      runtime.object.element.dataset.mobileRoomPreview = "capturing";
      const canvas = await captureEmbeddedScreenSnapshot(previewSource, {
        // Match the 500px mobile DOM width for readable room-monitor text.
        maxDimension: mobileRoomPreviewMaxDimension,
        scale: 1
      });
      if (runtimeRef.current !== runtime || requestId !== captureRequestRef.current) return false;

      const texture = createMobileRoomPreviewTexture(canvas, gl);
      const previousTexture = mobilePreviewTextureRef.current;
      mobilePreviewTextureRef.current = texture;
      hasSessionMobileRoomPreviewRef.current = true;
      setMobileRoomPreview(texture);
      invalidate();
      window.requestAnimationFrame(() => {
        if (mobilePreviewTextureRef.current === texture) previousTexture?.dispose();
      });
      runtime.object.element.dataset.mobileRoomPreview = "ready";

      // Let React attach texture before caller restores 3D room layer.
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      return true;
    } catch (error) {
      runtime.object.element.dataset.mobileRoomPreview = "failed";
      runtime.object.element.dataset.mobileRoomPreviewError =
        error instanceof Error ? error.message : "unknown capture error";
      return false;
    } finally {
      previewSource.remove();
    }
  }, [gl, invalidate, pixelHeight, pixelWidth, usesMobileRoomPreview]);

  useEffect(() => {
    if (!usesMobileRoomPreview) return;

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const initialPreviewUrl = withPortfolio3dBasePath(mobileInitialPreviewPathByScreen[screenId]);

    loader.load(
      initialPreviewUrl,
      (texture) => {
        if (cancelled || hasSessionMobileRoomPreviewRef.current) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.anisotropy = Math.min(2, gl.capabilities.getMaxAnisotropy());
        texture.needsUpdate = true;

        const previousTexture = mobilePreviewTextureRef.current;
        mobilePreviewTextureRef.current = texture;
        setMobileRoomPreview(texture);
        invalidate();
        window.requestAnimationFrame(() => {
          if (mobilePreviewTextureRef.current === texture) previousTexture?.dispose();
        });

        runtimeRef.current?.object.element.setAttribute("data-mobile-room-preview", "initial-ready");
      },
      undefined,
      () => runtimeRef.current?.object.element.setAttribute("data-mobile-room-preview", "initial-failed")
    );

    return () => {
      cancelled = true;
    };
  }, [gl, screenId, usesMobileRoomPreview]);

  useLayoutEffect(() => {
    if (!usesMobileRoomPreview || !isInteractive) return;

    const onPrepareRoomPreview = (event: Event): void => {
      const request = (event as CustomEvent<MobileRoomPreviewCaptureRequest>).detail;
      if (!request || request.screenId !== screenId) return;

      request.claimed = true;
      hasPreExitCaptureRef.current = true;
      // `captureMobileRoomPreview` synchronously clones focused document
      // before its first await. The room can therefore start moving now while
      // bitmap work continues against clone, not reparented CSS3D node.
      void captureMobileRoomPreview();
      request.ready();
    };

    window.addEventListener(mobileRoomPreviewCaptureEvent, onPrepareRoomPreview);
    return () => {
      window.removeEventListener(mobileRoomPreviewCaptureEvent, onPrepareRoomPreview);
    };
  }, [captureMobileRoomPreview, isInteractive, screenId, usesMobileRoomPreview]);

  const previousInteractiveRef = useRef(isInteractive);
  useEffect(() => {
    if (previousInteractiveRef.current && !isInteractive && usesMobileRoomPreview) {
      // Back to Room already captured this screen while it was focused. A
      // second capture after CSS3D reparenting was both expensive and could
      // replace the correct viewport with the page's default scroll position.
      if (hasPreExitCaptureRef.current) {
        hasPreExitCaptureRef.current = false;
      } else {
        void captureMobileRoomPreview();
      }
    }
    previousInteractiveRef.current = isInteractive;
  }, [captureMobileRoomPreview, isInteractive, usesMobileRoomPreview]);

  useLayoutEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    screenLayer.setRoomPreview?.(
      runtime,
      Boolean(usesMobileRoomPreview && mobileRoomPreview && !isInteractive)
    );
  }, [isInteractive, mobileRoomPreview, screenLayer, usesMobileRoomPreview]);

  useEffect(() => () => {
    captureRequestRef.current += 1;
    mobilePreviewTextureRef.current?.dispose();
    mobilePreviewTextureRef.current = null;
  }, []);

  useLayoutEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const element = runtime.object.element;
    const selectionMode = isInteractive ? "text" : "none";
    element.style.pointerEvents = isInteractive ? "auto" : "none";
    // CSS3DObject defaults to user-select: none. Let the focused document use
    // native selection and copy, while room documents remain non-selectable.
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

  return (
    <>
      {usesCrtSurface ? (
        <CrtScreenSurface
          screen={screen}
          roomPreview={usesMobileRoomPreview && !isInteractive ? mobileRoomPreview : null}
          screenId={screenId}
          onActivate={(delta) => {
            if (delta <= 5 && state.navigationState === "overview") setActiveSection(screenId);
          }}
        />
      ) : (
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
          {usesMobileRoomPreview && !isInteractive && mobileRoomPreview ? (
            <meshBasicMaterial
              key={`${screenId}-mobile-room-preview-${mobileRoomPreview.id}`}
              map={mobileRoomPreview}
              color="#ffffff"
              toneMapped={false}
              fog={false}
              depthTest
              depthWrite
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
              side={THREE.DoubleSide}
            />
          ) : (
            /* Preserve model depth while CSS3D paints every live screen. */
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
          )}
        </mesh>
      )}
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

function cloneMobileRoomPreviewSource(
  source: HTMLElement,
  pixelWidth: number,
  pixelHeight: number
): HTMLElement {
  const previewSource = source.cloneNode(true) as HTMLElement;
  previewSource.inert = false;
  previewSource.removeAttribute("aria-hidden");
  Object.assign(previewSource.style, {
    height: `${pixelHeight}px`,
    // Keep clone paintable, but behind the document background. A transparent
    // WebGL canvas would otherwise reveal it for one frame during a scroll.
    left: "0",
    opacity: "1",
    pointerEvents: "none",
    position: "fixed",
    top: "0",
    transform: "none",
    transformOrigin: "top left",
    visibility: "visible",
    width: `${pixelWidth}px`,
    zIndex: "-1"
  });

  document.body.appendChild(previewSource);

  const sourceElements = [source, ...source.querySelectorAll<HTMLElement>("*")];
  const previewElements = [previewSource, ...previewSource.querySelectorAll<HTMLElement>("*")];
  sourceElements.forEach((element, index) => {
    const previewElement = previewElements[index];
    if (!previewElement) return;

    // Preserve dynamic interactive input/select states
    if (element instanceof HTMLInputElement && previewElement instanceof HTMLInputElement) {
      previewElement.value = element.value;
      previewElement.checked = element.checked;
    } else if (element instanceof HTMLTextAreaElement && previewElement instanceof HTMLTextAreaElement) {
      previewElement.value = element.value;
    } else if (element instanceof HTMLSelectElement && previewElement instanceof HTMLSelectElement) {
      previewElement.selectedIndex = element.selectedIndex;
      previewElement.value = element.value;
    }

    // cloneNode does not retain native scroll offsets. Preserve them as data
    // for the SVG snapshot serializer so every mobile screen captures the
    // same viewport the visitor last saw, not its initial scroll position.
    const scrollTop = element.scrollTop || Number(element.dataset.scrollTop || 0);
    const scrollLeft = element.scrollLeft || Number(element.dataset.scrollLeft || 0);
    if (scrollTop !== 0) previewElement.dataset.scrollTop = String(scrollTop);
    if (scrollLeft !== 0) previewElement.dataset.scrollLeft = String(scrollLeft);
  });

  return previewSource;
}

function createMobileRoomPreviewTexture(
  canvas: HTMLCanvasElement,
  renderer: THREE.WebGLRenderer
): THREE.Texture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.anisotropy = Math.min(2, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;
  return texture;
}
