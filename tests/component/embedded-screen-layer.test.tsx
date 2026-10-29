import { act, cleanup, render } from '@testing-library/react';
import { useLayoutEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import {
  EmbeddedScreenLayer, useEmbeddedScreenLayer, type EmbeddedScreenRegistration
} from '../../src/features/portfolio-3d/components/EmbeddedScreenLayer';
import type { EmbeddedScreenId } from '../../src/features/portfolio-3d/arcade-screen';

const embeddedScreenIds = [
  'pipeline',
  'automation',
  'performance',
  'backend',
  'terminal',
  'profile',
  'experience',
  'architecture',
  'contact'
] as const satisfies readonly EmbeddedScreenId[];

const harness = vi.hoisted(() => ({
  frame: () => {},
  root: {} as { camera: THREE.PerspectiveCamera; gl: { domElement: HTMLCanvasElement }; invalidate: () => void; size: { width: number; height: number } },
  renderCss: vi.fn()
}));

vi.mock('@react-three/fiber', () => ({
  useThree: () => harness.root,
  useFrame: (callback: () => void) => { harness.frame = callback; }
}));
vi.mock('three/examples/jsm/renderers/CSS3DRenderer.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three/examples/jsm/renderers/CSS3DRenderer.js')>();
  return { ...actual, CSS3DRenderer: class extends actual.CSS3DRenderer {
    constructor() {
      super();
      const render = this.render.bind(this);
      this.render = (scene, camera) => { harness.renderCss(); render(scene, camera); };
    }
  } };
});

let layer: ReturnType<typeof useEmbeddedScreenLayer>;
let screen: EmbeddedScreenRegistration;
function ScreenProbe() {
  const controller = useEmbeddedScreenLayer();
  useLayoutEffect(() => {
    layer = controller;
    controller.registerScreen(screen);
    return () => controller.unregisterScreen(screen);
  }, [controller]);
  return null;
}
function Subject() { return <EmbeddedScreenLayer><ScreenProbe /></EmbeddedScreenLayer>; }

beforeEach(() => {
  vi.useFakeTimers();
  harness.renderCss.mockClear();
  const host = document.createElement('div');
  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  document.body.appendChild(host);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 5;
  harness.root = { camera, gl: { domElement: canvas }, invalidate: vi.fn(), size: { width: 400, height: 800 } };
  const element = document.createElement('div');
  const content = document.createElement('div');
  element.appendChild(content);
  screen = {
    screenId: 'performance', object: new CSS3DObject(element), content,
    screen: { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), normal: new THREE.Vector3(0, 0, 1), width: 2, height: 1.5 },
    pixelWidth: 1000, pixelHeight: 750, isInteractive: false
  };
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: function (this: HTMLElement, options: ScrollToOptions) {
    this.scrollTop = options.top ?? 0;
    this.scrollLeft = options.left ?? 0;
  } });
});
afterEach(() => {
  cleanup();
  document.body.replaceChildren();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('embedded screen render scheduling', () => {
  it('skips repeated idle renders but updates live screens for movement and zoom', () => {
    render(<Subject />);
    act(() => harness.frame());
    harness.renderCss.mockClear();
    act(() => { for (let frame = 0; frame < 120; frame++) harness.frame(); });
    expect(harness.renderCss).not.toHaveBeenCalled();
    act(() => { harness.root.camera.position.x += 1; harness.frame(); });
    expect(harness.renderCss).toHaveBeenCalledTimes(1);
    act(() => { harness.root.camera.fov = 35; harness.root.camera.updateProjectionMatrix(); harness.frame(); });
    expect(harness.renderCss).toHaveBeenCalledTimes(2);
    act(() => layer.setInteractive(screen, true));
    expect(screen.object.element.style.display).toBe('');
    expect(screen.object.element.style.visibility).toBe('');
    const transform = screen.object.element.style.transform;
    act(() => { harness.root.camera.position.y += 1; harness.frame(); });
    expect(screen.object.element.style.transform).not.toBe(transform);
  });

  it('keeps uncaptured first-time screens visible immediately', () => {
    render(<Subject />);
    act(() => layer.setInteractive(screen, true));
    expect(screen.object.element.style.visibility).toBe('');
  });

  it('keeps the last live frame behind the depth-tested room canvas', async () => {
    render(<Subject />);
    const cssLayer = harness.root.gl.domElement.parentElement?.querySelector<HTMLElement>('.arcade-css-layer');
    expect(cssLayer).toBeTruthy();
    act(() => layer.setInteractive(screen, true));
    screen.content.scrollTop = 450;
    screen.content.scrollLeft = 20;
    act(() => layer.setInteractive(screen, false));
    expect(screen.content.scrollTop).toBe(450);
    expect(screen.content.scrollLeft).toBe(20);
    expect(screen.object.visible).toBe(true);
    expect(cssLayer?.style.zIndex).toBe('0');
    await act(async () => { await vi.advanceTimersByTimeAsync(20); });
    expect(screen.content.scrollTop).toBe(450);
    expect(screen.content.scrollLeft).toBe(20);
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(screen.object.visible).toBe(true);
    expect(screen.content.scrollTop).toBe(450);
    expect(cssLayer?.style.zIndex).toBe('0');
    act(() => layer.setInteractive(screen, true));
    expect(screen.content.scrollTop).toBe(450);
    expect(screen.object.visible).toBe(true);
  });

  it.each(embeddedScreenIds)(
    'projects flattened interactive %s screens with both screen axes',
    (screenId) => {
      screen = { ...screen, screenId };
      render(<Subject />);
      screen.screen = {
        ...screen.screen,
        quaternion: new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 0, 1),
          Math.PI / 12
        )
      };

      act(() => layer.setInteractive(screen, true));

      const matrixValues = screen.object.element.style.transform.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/gi)?.map(Number);
      expect(screen.object.element.style.transform).toMatch(/^matrix\(/);
      expect(Math.abs(matrixValues?.[1] ?? 0)).toBeGreaterThan(0.001);
      expect(Math.abs(matrixValues?.[2] ?? 0)).toBeGreaterThan(0.001);
    }
  );

});
