'use client';

import { useFrame, useThree } from '@react-three/fiber';
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode
} from 'react';
import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import type { ArcadeScreenPlacement, EmbeddedScreenId } from '../arcade-screen';
import { createPreviewCaptureQueue } from '../preview-capture-queue';
import { usePortfolio3dState } from '../state/Portfolio3dState';

// CSS3D pages use pixel coordinates while the GLB continues to use meters.
const cssWorldScale = 1000;
const screenLayerZIndex = '0';
const screenOverlayLayerZIndex = '2';

export interface EmbeddedScreenRegistration {
  readonly screenId: EmbeddedScreenId;
  readonly object: CSS3DObject;
  readonly content: HTMLDivElement;
  screen: ArcadeScreenPlacement;
  pixelWidth: number;
  pixelHeight: number;
  isInteractive: boolean;
  hasPreview: boolean;
  isPreviewCapturePending: boolean;
  isFlattenedForInteraction?: boolean;
  cssTransform?: string;
}

export interface EmbeddedScreenOverlayRegistration {
  readonly object: CSS3DObject;
  placement: ArcadeScreenPlacement;
  pixelWidth: number;
  pixelHeight: number;
}

interface EmbeddedScreenLayerRuntime {
  readonly renderer: CSS3DRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.Camera;
  readonly screens: Set<EmbeddedScreenRegistration>;
  readonly overlays: Set<EmbeddedScreenOverlayRegistration>;
  readonly screenUp: THREE.Vector3;
  readonly screenRight: THREE.Vector3;
  readonly topLeft: THREE.Vector3;
  readonly topRight: THREE.Vector3;
  readonly lastCameraMatrix: THREE.Matrix4;
  readonly lastProjectionMatrix: THREE.Matrix4;
  lastCameraChangeAt: number;
  readonly previewQueue: ReturnType<typeof createPreviewCaptureQueue>;
  activeScreen?: EmbeddedScreenRegistration;
  activationRevealFrame?: number;
  width: number;
  height: number;
}

interface EmbeddedScreenLayerController {
  registerScreen: (screen: EmbeddedScreenRegistration) => void;
  unregisterScreen: (screen: EmbeddedScreenRegistration) => void;
  configureScreen: (
    screen: EmbeddedScreenRegistration,
    placement: ArcadeScreenPlacement,
    pixelWidth: number,
    pixelHeight: number
  ) => void;
  setInteractive: (screen: EmbeddedScreenRegistration, isInteractive: boolean) => void;
  setPreviewCapturePending: (screen: EmbeddedScreenRegistration, isPending: boolean) => void;
  setPreviewAvailable: (screen: EmbeddedScreenRegistration, isAvailable: boolean) => void;
  registerOverlay: (overlay: EmbeddedScreenOverlayRegistration) => void;
  unregisterOverlay: (overlay: EmbeddedScreenOverlayRegistration) => void;
  configureOverlay: (
    overlay: EmbeddedScreenOverlayRegistration,
    placement: ArcadeScreenPlacement,
    pixelWidth: number,
    pixelHeight: number
  ) => void;
  forceRepaint: () => void;
  schedulePreviewCapture: (capture: () => Promise<void>, delayMs: number) => () => void;
  render: () => void;
}

const EmbeddedScreenLayerContext = createContext<EmbeddedScreenLayerController | null>(null);

export function EmbeddedScreenLayer({ children }: Readonly<{
  children: ReactNode;
}>): ReactElement {
  const { camera, gl, invalidate, size } = useThree();
  const { state } = usePortfolio3dState();
  const navigationStateRef = useRef(state.navigationState);
  useLayoutEffect(() => {
    navigationStateRef.current = state.navigationState;
  }, [state.navigationState]);
  const runtimeRef = useRef<EmbeddedScreenLayerRuntime | null>(null);
  const [runtime, setRuntime] = useState<EmbeddedScreenLayerRuntime | null>(null);
  const repaintFrameRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const canvas = gl.domElement;
    const parent = canvas.parentElement;
    if (!parent) return;

    const renderer = new CSS3DRenderer();
    renderer.domElement.className = 'arcade-css-layer';
    renderer.domElement.style.zIndex = screenLayerZIndex;
    renderer.domElement.style.pointerEvents = 'none';
    const previousPosition = canvas.style.position;
    const previousZIndex = canvas.style.zIndex;
    canvas.style.position = 'relative';
    canvas.style.zIndex = '1';
    parent.insertBefore(renderer.domElement, canvas);

    const nextRuntime: EmbeddedScreenLayerRuntime = {
      renderer,
      scene: new THREE.Scene(),
      camera: camera.clone(),
      screens: new Set(),
      overlays: new Set(),
      screenUp: new THREE.Vector3(),
      screenRight: new THREE.Vector3(),
      topLeft: new THREE.Vector3(),
      topRight: new THREE.Vector3(),
      lastCameraMatrix: new THREE.Matrix4(),
      lastProjectionMatrix: new THREE.Matrix4(),
      lastCameraChangeAt: performance.now(),
      previewQueue: createPreviewCaptureQueue(() => {
        const activeRuntime = runtimeRef.current;
        return activeRuntime !== null && !document.hidden &&
          navigationStateRef.current === 'overview' &&
          performance.now() - activeRuntime.lastCameraChangeAt >= 180;
      }),
      width: 0,
      height: 0
    };
    runtimeRef.current = nextRuntime;
    setRuntime(nextRuntime);
    invalidate();

    return () => {
      if (repaintFrameRef.current !== null) {
        cancelAnimationFrame(repaintFrameRef.current);
        repaintFrameRef.current = null;
      }
      if (nextRuntime.activationRevealFrame !== undefined) {
        cancelAnimationFrame(nextRuntime.activationRevealFrame);
        nextRuntime.activationRevealFrame = undefined;
      }
      runtimeRef.current = null;
      nextRuntime.previewQueue.dispose();
      renderer.domElement.remove();
      canvas.style.position = previousPosition;
      canvas.style.zIndex = previousZIndex;
    };
  }, [camera, gl, invalidate]);

  useLayoutEffect(() => {
    if (!runtime) return;

    runtime.width = size.width;
    runtime.height = size.height;
    runtime.renderer.setSize(size.width, size.height);
    renderEmbeddedScreenLayer(runtime, camera);
    invalidate();
  }, [camera, invalidate, runtime, size.height, size.width]);

  useFrame(() => {
    const activeRuntime = runtimeRef.current;
    if (!activeRuntime) return;
    camera.updateMatrixWorld();
    const cameraChanged = !activeRuntime.lastCameraMatrix.equals(camera.matrixWorld) ||
      !activeRuntime.lastProjectionMatrix.equals(camera.projectionMatrix);
    if (!cameraChanged) return;
    activeRuntime.lastCameraMatrix.copy(camera.matrixWorld);
    activeRuntime.lastProjectionMatrix.copy(camera.projectionMatrix);
    activeRuntime.lastCameraChangeAt = performance.now();
    if (hasVisibleCssScreens(activeRuntime)) renderEmbeddedScreenLayer(activeRuntime, camera);
  });

  const controller = useMemo<EmbeddedScreenLayerController | null>(() => {
    if (!runtime) return null;

    const render = (): void => {
      renderEmbeddedScreenLayer(runtime, camera);
      invalidate();
    };

    const triggerForceRepaint = (): void => {
      if (repaintFrameRef.current !== null) {
        cancelAnimationFrame(repaintFrameRef.current);
      }

      // Android Chrome evicts raster tiles of off-screen 3D preserve-3d layers.
      // Applying a sub-pixel transform jitter across two animation frames forces
      // Chromium's compositor to re-rasterize all tile backings immediately.
      let step = 0;
      const applyJitter = (): void => {
        step += 1;
        const offset = step === 1 ? ' translateZ(0.0005px)' : '';

        for (const s of runtime.screens) {
          if (!s.isInteractive && s.object.visible) {
            const baseTransform = s.cssTransform ?? s.object.element.style.transform;
            if (baseTransform) {
              s.object.element.style.transform = baseTransform.replace(/\s*translateZ\([^)]*\)/g, '') + offset;
            }
          }
        }

        renderEmbeddedScreenLayer(runtime, camera);
        invalidate();

        if (step < 2) {
          repaintFrameRef.current = requestAnimationFrame(applyJitter);
        } else {
          repaintFrameRef.current = null;
        }
      };

      repaintFrameRef.current = requestAnimationFrame(applyJitter);
    };

    return {
      registerScreen: (screen): void => {
        if (runtime.screens.has(screen)) return;
        runtime.screens.add(screen);
        runtime.scene.add(screen.object);
        configureScreen(screen, screen.screen, screen.pixelWidth, screen.pixelHeight);
        render();
      },
      unregisterScreen: (screen): void => {
        if (!runtime.screens.has(screen)) return;
        restoreScreenToLayer(runtime, screen);
        runtime.screens.delete(screen);
        runtime.scene.remove(screen.object);
        syncLayerPointerEvents(runtime);
        render();
      },
      configureScreen: (screen, placement, pixelWidth, pixelHeight): void => {
        if (!runtime.screens.has(screen)) return;
        configureScreen(screen, placement, pixelWidth, pixelHeight);
        render();
      },
      setInteractive: (screen, isInteractive): void => {
        if (!runtime.screens.has(screen) || screen.isInteractive === isInteractive) return;
        const scrollPositions = [screen.content, ...screen.content.querySelectorAll<HTMLElement>('*')]
          .filter((element) => element.scrollTop !== 0 || element.scrollLeft !== 0)
          .map((element) => ({ element, top: element.scrollTop, left: element.scrollLeft }));

        if (runtime.activationRevealFrame !== undefined) {
          cancelAnimationFrame(runtime.activationRevealFrame);
          runtime.activationRevealFrame = undefined;
        }
        let shouldRevealActiveScreenAfterProjection = false;

        if (isInteractive) {
          if (runtime.activeScreen && runtime.activeScreen !== screen) {
            restoreScreenToLayer(runtime, runtime.activeScreen);
          }

          screen.isInteractive = true;
          runtime.activeScreen = screen;
          screen.object.visible = true;
          screen.object.element.style.display = '';
          shouldRevealActiveScreenAfterProjection =
            screen.hasPreview && !screen.isPreviewCapturePending;
          screen.object.element.style.visibility = shouldRevealActiveScreenAfterProjection ? 'hidden' : '';
          screen.object.element.style.pointerEvents = 'auto';

          // Android Chrome renders this 3D transform correctly but its hit-test
          // resolves to the CSS3D wrapper rather than inputs within the document.
          // Flatten only the focused document so native controls can receive touch.
          runtime.scene.remove(screen.object);
          screen.isFlattenedForInteraction = true;
          screen.cssTransform = screen.object.element.style.transform;
          screen.object.element.style.transformOrigin = '0 0';
          runtime.renderer.domElement.appendChild(screen.object.element);
        } else {
          // The exiting page stays visible until its final screenshot commits.
          screen.isPreviewCapturePending = true;
          restoreScreenToLayer(runtime, screen);
        }

        syncLayerPointerEvents(runtime);
        render();
        // CSS3D reparents the document synchronously. Restore before the browser
        // can paint its reset scroll offset, not on a later animation frame.
        scrollPositions.forEach(({ element, top, left }) => {
          element.scrollTo({ top, left, behavior: 'instant' });
        });
        if (shouldRevealActiveScreenAfterProjection) {
          runtime.activationRevealFrame = requestAnimationFrame(() => {
            runtime.activationRevealFrame = undefined;
            if (runtime.activeScreen !== screen || !screen.isInteractive) return;

            screen.object.element.style.visibility = '';
            render();
          });
        }

        triggerForceRepaint();
      },
      setPreviewCapturePending: (screen, isPending): void => {
        if (!runtime.screens.has(screen) || screen.isPreviewCapturePending === isPending) return;

        screen.isPreviewCapturePending = isPending;
        syncScreenPreviewVisibility(screen);
        render();
      },
      setPreviewAvailable: (screen, isAvailable): void => {
        if (!runtime.screens.has(screen)) return;

        screen.hasPreview = isAvailable;
        screen.isPreviewCapturePending = false;
        syncScreenPreviewVisibility(screen);
        render();
      },
      registerOverlay: (overlay): void => {
        if (runtime.overlays.has(overlay)) return;

        runtime.overlays.add(overlay);
        overlay.object.element.style.pointerEvents = 'none';
        overlay.object.element.setAttribute('aria-hidden', 'true');
        runtime.scene.add(overlay.object);
        configureOverlay(overlay, overlay.placement, overlay.pixelWidth, overlay.pixelHeight);
        syncLayerPointerEvents(runtime);
        render();
      },
      unregisterOverlay: (overlay): void => {
        if (!runtime.overlays.has(overlay)) return;

        runtime.overlays.delete(overlay);
        runtime.scene.remove(overlay.object);
        syncLayerPointerEvents(runtime);
        render();
      },
      configureOverlay: (overlay, placement, pixelWidth, pixelHeight): void => {
        if (!runtime.overlays.has(overlay)) return;

        configureOverlay(overlay, placement, pixelWidth, pixelHeight);
        render();
      },
      forceRepaint: triggerForceRepaint,
      schedulePreviewCapture: runtime.previewQueue.enqueue,
      render
    };
  }, [camera, invalidate, runtime]);

  return (
    <EmbeddedScreenLayerContext.Provider value={controller}>
      {controller ? children : null}
    </EmbeddedScreenLayerContext.Provider>
  );
}

export function useEmbeddedScreenLayer(): EmbeddedScreenLayerController {
  const controller = useContext(EmbeddedScreenLayerContext);
  if (!controller) {
    throw new Error('ArcadeScreenSurface must be rendered inside EmbeddedScreenLayer.');
  }

  return controller;
}

function configureScreen(
  screen: EmbeddedScreenRegistration,
  placement: ArcadeScreenPlacement,
  pixelWidth: number,
  pixelHeight: number
): void {
  screen.screen = placement;
  screen.pixelWidth = pixelWidth;
  screen.pixelHeight = pixelHeight;
  const element = screen.object.element;
  element.style.width = `${pixelWidth}px`;
  element.style.height = `${pixelHeight}px`;
  screen.object.position.copy(placement.position).multiplyScalar(cssWorldScale);
  screen.object.quaternion.copy(placement.quaternion);
  screen.object.scale.setScalar(placement.width * cssWorldScale / pixelWidth);
}

function configureOverlay(
  overlay: EmbeddedScreenOverlayRegistration,
  placement: ArcadeScreenPlacement,
  pixelWidth: number,
  pixelHeight: number
): void {
  overlay.placement = placement;
  overlay.pixelWidth = pixelWidth;
  overlay.pixelHeight = pixelHeight;
  overlay.object.position.copy(placement.position).multiplyScalar(cssWorldScale);
  overlay.object.quaternion.copy(placement.quaternion);
  overlay.object.scale.set(
    placement.width * cssWorldScale / pixelWidth,
    placement.height * cssWorldScale / pixelHeight,
    1
  );
}

function restoreScreenToLayer(
  runtime: EmbeddedScreenLayerRuntime,
  screen: EmbeddedScreenRegistration
): void {
  if (runtime.activeScreen === screen) runtime.activeScreen = undefined;
  screen.isInteractive = false;
  if (screen.isFlattenedForInteraction) {
    if (screen.cssTransform !== undefined) {
      screen.object.element.style.transform = screen.cssTransform;
      screen.cssTransform = undefined;
    }
    screen.object.element.style.transformOrigin = '';
    if (screen.object.parent !== runtime.scene) runtime.scene.add(screen.object);
  }
  screen.isFlattenedForInteraction = false;
  screen.object.element.style.pointerEvents = 'none';
  screen.object.element.style.visibility = '';
  syncScreenPreviewVisibility(screen);
}

function syncScreenPreviewVisibility(screen: EmbeddedScreenRegistration): void {
  const shouldRenderCss = screen.isInteractive || screen.isPreviewCapturePending || !screen.hasPreview;
  screen.object.visible = shouldRenderCss;
  screen.object.element.style.display = shouldRenderCss ? '' : 'none';
}

function hasVisibleCssScreens(runtime: EmbeddedScreenLayerRuntime): boolean {
  return Boolean(runtime.activeScreen) ||
    [...runtime.screens].some((screen) => screen.object.visible) ||
    [...runtime.overlays].some((overlay) => overlay.object.visible);
}

function syncLayerPointerEvents(runtime: EmbeddedScreenLayerRuntime): void {
  const activeScreen = runtime.activeScreen;
  const isInteractive = Boolean(activeScreen);
  // Elevate z-index above the canvas container when interactive so mobile touch gestures
  // and scroll hit the active document directly. CSS overlays use the same layer while
  // inactive screens stay hidden below their static WebGL previews.
  runtime.renderer.domElement.style.zIndex = isInteractive || runtime.overlays.size > 0
    ? screenOverlayLayerZIndex
    : screenLayerZIndex;
  runtime.renderer.domElement.style.pointerEvents = 'none';
  const rendererView = runtime.renderer.domElement.firstElementChild as HTMLElement | null;
  const rendererCamera = rendererView?.firstElementChild as HTMLElement | null;
  rendererView?.style.setProperty('pointer-events', 'none');
  rendererCamera?.style.setProperty('pointer-events', 'none');

  for (const s of runtime.screens) {
    s.object.element.style.pointerEvents = s === activeScreen ? 'auto' : 'none';
  }
}

function renderEmbeddedScreenLayer(
  runtime: EmbeddedScreenLayerRuntime,
  camera: THREE.Camera
): void {
  const activeScreen = runtime.activeScreen;
  if (activeScreen?.isFlattenedForInteraction) {
    renderInteractiveScreen(runtime, activeScreen, camera);
  }

  runtime.camera.copy(camera, false);
  camera.getWorldPosition(runtime.camera.position).multiplyScalar(cssWorldScale);
  camera.getWorldQuaternion(runtime.camera.quaternion);
  runtime.camera.updateMatrixWorld(true);
  runtime.renderer.render(runtime.scene, runtime.camera);
}

function renderInteractiveScreen(
  runtime: EmbeddedScreenLayerRuntime,
  screen: EmbeddedScreenRegistration,
  camera: THREE.Camera
): void {
  const { screenUp, screenRight, topLeft, topRight } = runtime;
  const placement = screen.screen;
  screenUp.set(0, 1, 0).applyQuaternion(placement.quaternion);
  screenRight.set(1, 0, 0).applyQuaternion(placement.quaternion);
  camera.updateMatrixWorld(true);
  topLeft
    .copy(placement.position)
    .addScaledVector(screenRight, -placement.width / 2)
    .addScaledVector(screenUp, placement.height / 2)
    .project(camera);
  topRight
    .copy(placement.position)
    .addScaledVector(screenRight, placement.width / 2)
    .addScaledVector(screenUp, placement.height / 2)
    .project(camera);

  const x = (topLeft.x + 1) * runtime.width / 2;
  const y = (1 - topLeft.y) * runtime.height / 2;
  const scale = (topRight.x - topLeft.x) * runtime.width / (2 * screen.pixelWidth);
  const transform = `translate(${x}px, ${y}px) scale(${scale})`;
  if (screen.object.element.style.transform !== transform) {
    screen.object.element.style.transform = transform;
  }
}
