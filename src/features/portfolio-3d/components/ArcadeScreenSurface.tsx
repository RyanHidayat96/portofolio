'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import type { ArcadeScreenPlacement, EmbeddedScreenId } from '../arcade-screen';
import { usePortfolio3dState } from '../state/Portfolio3dState';

interface ScreenRuntime {
  readonly renderer: CSS3DRenderer;
  readonly scene: THREE.Scene;
  readonly object: CSS3DObject;
  readonly camera: THREE.Camera;
  readonly content: HTMLDivElement;
  projectedTransform?: string;
}

// Keep CSS coordinates in pixel-sized units while the GLB remains in meters.
const cssWorldScale = 1000;
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
  const { camera, gl, size, invalidate, setEvents, get } = useThree();
  const { state, setActiveSection } = usePortfolio3dState();
  const runtimeRef = useRef<ScreenRuntime | null>(null);
  const isInteractive = state.activeSectionId === screenId && state.navigationState === 'section-open';
  // The document always uses desktop coordinates. On phones its visual scale is
  // controlled by the physical frame and the touch zoom below, not responsive reflow.
  const pixelWidth = desktopScreenPixelWidth;
  const pixelHeight = pixelWidth * screen.height / screen.width;

  useLayoutEffect(() => {
    const canvas = gl.domElement;
    const parent = canvas.parentElement;
    if (!parent) return;
    const element = document.createElement('div');
    element.className = `arcade-screen-document arcade-screen-document--${screenId}`;
    const content = document.createElement('div');
    content.className = 'arcade-screen-content';
    element.appendChild(content);
    const object = new CSS3DObject(element);
    const scene = new THREE.Scene();
    scene.add(object);
    const renderer = new CSS3DRenderer();
    renderer.domElement.className = 'arcade-css-layer';
    const previousPosition = canvas.style.position;
    const previousZIndex = canvas.style.zIndex;
    canvas.style.position = 'relative';
    canvas.style.zIndex = '1';
    parent.insertBefore(renderer.domElement, canvas);
    runtimeRef.current = { renderer, scene, object, camera: camera.clone(), content };
    onScreenReady?.(screenId, content);
    invalidate();

    return () => {
      scene.remove(object);
      renderer.domElement.remove();
      canvas.style.position = previousPosition;
      canvas.style.zIndex = previousZIndex;
      runtimeRef.current = null;
      onScreenReady?.(screenId, null);
    };
  }, [camera, gl, invalidate, onScreenReady, screenId]);

  useLayoutEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const { renderer, object } = runtime;
    object.element.style.width = `${pixelWidth}px`;
    object.element.style.height = `${pixelHeight}px`;
    object.position.copy(screen.position).multiplyScalar(cssWorldScale);
    object.quaternion.copy(screen.quaternion);
    object.scale.setScalar(screen.width * cssWorldScale / pixelWidth);
    renderer.setSize(size.width, size.height);
    renderScreen(runtime, camera, screen, pixelWidth, isInteractive);
    runtime.renderer.domElement.style.zIndex = isInteractive ? '2' : '0';
    invalidate();
  }, [camera, invalidate, isInteractive, pixelHeight, pixelWidth, screen, size.width, size.height]);

  useLayoutEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const element = runtime.object.element;
    element.style.pointerEvents = isInteractive ? 'auto' : 'none';
    element.inert = !isInteractive;
    element.setAttribute('aria-hidden', String(!isInteractive));
    const canvas = gl.domElement;
    const previousPointerEvents = canvas.style.pointerEvents;
    const previousEventsEnabled = get().events.enabled;
    const previousLayerPointerEvents = runtime.renderer.domElement.style.pointerEvents;
    runtime.renderer.domElement.style.pointerEvents = isInteractive ? 'auto' : 'none';
    const rendererView = runtime.renderer.domElement.firstElementChild as HTMLElement | null;
    const rendererCamera = rendererView?.firstElementChild as HTMLElement | null;
    const pointerPassthroughElements = [rendererView, rendererCamera].filter(
      (element): element is HTMLElement => element !== null
    );
    const previousWrapperPointerEvents = pointerPassthroughElements.map((element) => element.style.pointerEvents);
    if (isInteractive) pointerPassthroughElements.forEach((element) => { element.style.pointerEvents = 'none'; });
    if (isInteractive) {
      // Let native DOM inputs handle clicks and scrolling without scene raycasts.
      canvas.style.pointerEvents = 'none';
      setEvents({ enabled: false });
    }
    return () => {
      runtime.renderer.domElement.style.pointerEvents = previousLayerPointerEvents;
      pointerPassthroughElements.forEach((element, index) => {
        element.style.pointerEvents = previousWrapperPointerEvents[index] ?? '';
      });
      canvas.style.pointerEvents = previousPointerEvents;
      setEvents({ enabled: previousEventsEnabled });
    };
  }, [get, gl, isInteractive, setEvents]);

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
      if (isInteractive) renderScreen(runtime, camera, screen, pixelWidth, true);
    };

    const isMobileViewport = (): boolean => window.matchMedia(`(max-width: ${mobileViewportBreakpoint - 1}px)`).matches;

    const applyZoom = (): void => {
      onScreenZoomChange?.(screenId, scale);
      renderScreen(runtime, camera, screen, pixelWidth, true);
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
  }, [camera, isInteractive, onScreenZoomChange, pixelWidth, screen, screenId]);

  // The existing demand loop drives projection only while the camera/scene changes.
  useFrame(() => {
    const runtime = runtimeRef.current;
    if (runtime) {
      renderScreen(runtime, camera, screen, pixelWidth, isInteractive);
      runtime.renderer.domElement.style.zIndex = isInteractive ? '2' : '0';
    }
  });

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
        {/* Depth-tested transparent pixels let the GLB bezel and room occlude the HTML. */}
        <meshBasicMaterial
          blending={THREE.NoBlending}
          opacity={0}
          transparent={false}
          toneMapped={false}
          fog={false}
          side={THREE.FrontSide}
        />
      </mesh>
    </>
  );
}

function renderScreen(runtime: ScreenRuntime, camera: THREE.Camera, screen: ArcadeScreenPlacement, pixelWidth: number, interactive: boolean): void {
  const element = runtime.object.element;
  if (interactive) {
    // Once face-on, flatten the same DOM at its exact projected bounds for native hit testing.
    if (runtime.projectedTransform === undefined) runtime.projectedTransform = element.style.transform;
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(screen.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(screen.quaternion);
    camera.updateMatrixWorld(true);
    const topLeft = screen.position.clone().addScaledVector(right, -screen.width / 2)
      .addScaledVector(up, screen.height / 2).project(camera);
    const topRight = screen.position.clone().addScaledVector(right, screen.width / 2)
      .addScaledVector(up, screen.height / 2).project(camera);
    const size = runtime.renderer.getSize();
    const x = (topLeft.x + 1) * size.width / 2;
    const y = (1 - topLeft.y) * size.height / 2;
    const projectedScale = (topRight.x - topLeft.x) * size.width / (2 * pixelWidth);
    runtime.renderer.domElement.style.zIndex = '2';
    if (element.parentElement !== runtime.renderer.domElement) runtime.renderer.domElement.appendChild(element);
    element.style.transformOrigin = '0 0';
    element.style.transform = `translate(${x}px, ${y}px) scale(${projectedScale})`;
    return;
  }
  if (runtime.projectedTransform !== undefined) {
    element.style.transform = runtime.projectedTransform;
    element.style.transformOrigin = '';
    runtime.projectedTransform = undefined;
  }
  runtime.renderer.domElement.style.zIndex = '0';
  runtime.camera.copy(camera, false);
  camera.getWorldPosition(runtime.camera.position).multiplyScalar(cssWorldScale);
  camera.getWorldQuaternion(runtime.camera.quaternion);
  runtime.camera.updateMatrixWorld(true);
  runtime.renderer.render(runtime.scene, runtime.camera);
}

function getTouchDistance(first: TouchPoint, second: TouchPoint): number {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
