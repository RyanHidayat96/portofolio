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

// CSS3D pages use pixel coordinates while the GLB continues to use meters.
const cssWorldScale = 1000;
const screenLayerZIndex = '0';

export interface EmbeddedScreenRegistration {
  readonly screenId: EmbeddedScreenId;
  readonly object: CSS3DObject;
  readonly content: HTMLDivElement;
  screen: ArcadeScreenPlacement;
  pixelWidth: number;
  pixelHeight: number;
  isInteractive: boolean;
  cssTransform?: string;
}

interface EmbeddedScreenLayerRuntime {
  readonly renderer: CSS3DRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.Camera;
  readonly screens: Set<EmbeddedScreenRegistration>;
  readonly screenUp: THREE.Vector3;
  readonly screenRight: THREE.Vector3;
  readonly topLeft: THREE.Vector3;
  readonly topRight: THREE.Vector3;
  activeScreen?: EmbeddedScreenRegistration;
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
  render: () => void;
}

const EmbeddedScreenLayerContext = createContext<EmbeddedScreenLayerController | null>(null);

export function EmbeddedScreenLayer({ children }: Readonly<{
  children: ReactNode;
}>): ReactElement {
  const { camera, gl, invalidate, size } = useThree();
  const runtimeRef = useRef<EmbeddedScreenLayerRuntime | null>(null);
  const [runtime, setRuntime] = useState<EmbeddedScreenLayerRuntime | null>(null);

  useLayoutEffect(() => {
    const canvas = gl.domElement;
    const parent = canvas.parentElement;
    if (!parent) return;

    const renderer = new CSS3DRenderer();
    renderer.domElement.className = 'arcade-css-layer';
    renderer.domElement.style.zIndex = screenLayerZIndex;
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
      screenUp: new THREE.Vector3(),
      screenRight: new THREE.Vector3(),
      topLeft: new THREE.Vector3(),
      topRight: new THREE.Vector3(),
      width: 0,
      height: 0
    };
    runtimeRef.current = nextRuntime;
    setRuntime(nextRuntime);
    invalidate();

    return () => {
      runtimeRef.current = null;
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
    if (activeRuntime) renderEmbeddedScreenLayer(activeRuntime, camera);
  });

  const controller = useMemo<EmbeddedScreenLayerController | null>(() => {
    if (!runtime) return null;

    const render = (): void => {
      renderEmbeddedScreenLayer(runtime, camera);
      invalidate();
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

        if (isInteractive) {
          if (runtime.activeScreen && runtime.activeScreen !== screen) {
            restoreScreenToLayer(runtime, runtime.activeScreen);
          }

          runtime.scene.remove(screen.object);
          screen.isInteractive = true;
          runtime.activeScreen = screen;
          screen.cssTransform = screen.object.element.style.transform;
          screen.object.element.style.transformOrigin = '0 0';
          screen.object.element.style.pointerEvents = 'auto';
          runtime.renderer.domElement.appendChild(screen.object.element);
        } else {
          restoreScreenToLayer(runtime, screen);
        }

        syncLayerPointerEvents(runtime);
        render();
      },
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

function restoreScreenToLayer(
  runtime: EmbeddedScreenLayerRuntime,
  screen: EmbeddedScreenRegistration
): void {
  if (runtime.activeScreen === screen) runtime.activeScreen = undefined;
  screen.isInteractive = false;
  if (screen.cssTransform !== undefined) {
    // CSS3DRenderer caches transforms. Restore the exact prior value so a
    // cached matrix still leaves the DOM display in the correct position.
    screen.object.element.style.transform = screen.cssTransform;
    screen.cssTransform = undefined;
  }
  screen.object.element.style.transformOrigin = '';
  screen.object.element.style.pointerEvents = 'none';
  if (screen.object.parent !== runtime.scene) runtime.scene.add(screen.object);
}

function syncLayerPointerEvents(runtime: EmbeddedScreenLayerRuntime): void {
  // The layer covers the viewport, so it must never capture clicks outside the
  // flattened active document. The document itself explicitly opts into auto.
  runtime.renderer.domElement.style.pointerEvents = 'none';
  const rendererView = runtime.renderer.domElement.firstElementChild as HTMLElement | null;
  const rendererCamera = rendererView?.firstElementChild as HTMLElement | null;
  rendererView?.style.setProperty('pointer-events', 'none');
  rendererCamera?.style.setProperty('pointer-events', 'none');
}

function renderEmbeddedScreenLayer(
  runtime: EmbeddedScreenLayerRuntime,
  camera: THREE.Camera
): void {
  const activeScreen = runtime.activeScreen;
  if (activeScreen) renderInteractiveScreen(runtime, activeScreen, camera);

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
  screen.object.element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}
