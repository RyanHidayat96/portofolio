'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import type { ArcadeScreenPlacement } from '../arcade-screen';
import { usePortfolio3dState } from '../state/Portfolio3dState';

interface ScreenRuntime {
  readonly renderer: CSS3DRenderer;
  readonly scene: THREE.Scene;
  readonly object: CSS3DObject;
  readonly camera: THREE.Camera;
  projectedTransform?: string;
}

// Keep CSS coordinates in pixel-sized units while the GLB remains in meters.
const cssWorldScale = 1000;

export function ArcadeScreenSurface({ screen, onScreenReady }: Readonly<{
  screen: ArcadeScreenPlacement;
  onScreenReady?: (element: HTMLElement | null) => void;
}>): React.ReactElement {
  const { camera, gl, size, invalidate, setEvents, get } = useThree();
  const { state, setActiveSection } = usePortfolio3dState();
  const runtimeRef = useRef<ScreenRuntime | null>(null);
  const isInteractive = state.activeSectionId === 'pipeline' && state.navigationState === 'section-open';
  const pixelWidth = size.width < 768 ? 480 : 1000;
  const pixelHeight = pixelWidth * screen.height / screen.width;

  useLayoutEffect(() => {
    const canvas = gl.domElement;
    const parent = canvas.parentElement;
    if (!parent) return;
    const element = document.createElement('div');
    element.className = 'arcade-screen-document';
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
    runtimeRef.current = { renderer, scene, object, camera: camera.clone() };
    onScreenReady?.(element);
    invalidate();

    return () => {
      scene.remove(object);
      renderer.domElement.remove();
      canvas.style.position = previousPosition;
      canvas.style.zIndex = previousZIndex;
      runtimeRef.current = null;
      onScreenReady?.(null);
    };
  }, [camera, gl, invalidate, onScreenReady]);

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
    if (isInteractive) {
      // Let native DOM inputs handle clicks and scrolling without scene raycasts.
      canvas.style.pointerEvents = 'none';
      setEvents({ enabled: false });
    }
    return () => {
      canvas.style.pointerEvents = previousPointerEvents;
      setEvents({ enabled: previousEventsEnabled });
    };
  }, [get, gl, isInteractive, setEvents]);

  // The existing demand loop drives projection only while the camera/scene changes.
  useFrame(() => {
    const runtime = runtimeRef.current;
    if (runtime) renderScreen(runtime, camera, screen, pixelWidth, isInteractive);
  });

  return (
    <>
      <mesh
        name="Arcade_Pipeline_Surface"
        position={screen.position}
        quaternion={screen.quaternion}
        onClick={(event) => {
          event.stopPropagation();
          if (event.delta <= 5 && state.navigationState === 'overview') setActiveSection('pipeline');
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
    const scale = (topRight.x - topLeft.x) * size.width / (2 * pixelWidth);
    runtime.renderer.domElement.style.zIndex = '2';
    if (element.parentElement !== runtime.renderer.domElement) runtime.renderer.domElement.appendChild(element);
    element.style.transformOrigin = '0 0';
    element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
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
