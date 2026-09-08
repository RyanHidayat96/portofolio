import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { ArcadeScreenSurface, type EmbeddedScreenPan } from '../../src/features/portfolio-3d/components/ArcadeScreenSurface';
import type { EmbeddedScreenRegistration } from '../../src/features/portfolio-3d/components/EmbeddedScreenLayer';
import type { ArcadeScreenPlacement, EmbeddedScreenId } from '../../src/features/portfolio-3d/arcade-screen';

const harness = vi.hoisted(() => ({
  root: {} as {
    gl: { domElement: HTMLCanvasElement; capabilities: { getMaxAnisotropy: () => number } };
    invalidate: ReturnType<typeof vi.fn>;
    setEvents: ReturnType<typeof vi.fn>;
    get: () => { events: { enabled: boolean } };
  },
  runtime: undefined as EmbeddedScreenRegistration | undefined,
  state: { activeSectionId: 'architecture', navigationState: 'section-open' },
  screenLayer: {
    registerScreen: vi.fn((screen: EmbeddedScreenRegistration) => {
      harness.runtime = screen;
    }),
    unregisterScreen: vi.fn(),
    configureScreen: vi.fn(),
    setInteractive: vi.fn((screen: EmbeddedScreenRegistration, isInteractive: boolean) => {
      screen.isInteractive = isInteractive;
    }),
    setPreviewCapturePending: vi.fn(),
    setPreviewAvailable: vi.fn(),
    schedulePreviewCapture: vi.fn(() => () => {}),
    render: vi.fn()
  },
  setActiveSection: vi.fn()
}));

vi.mock('@react-three/fiber', () => ({
  useThree: () => harness.root
}));

vi.mock('../../src/features/portfolio-3d/state/Portfolio3dState', () => ({
  usePortfolio3dState: () => ({
    state: harness.state,
    setActiveSection: harness.setActiveSection
  })
}));

vi.mock('../../src/features/portfolio-3d/components/EmbeddedScreenLayer', () => ({
  useEmbeddedScreenLayer: () => harness.screenLayer
}));

vi.mock('../../src/features/portfolio-3d/components/EmbeddedScreenSnapshot', () => ({
  captureEmbeddedScreenSnapshot: vi.fn()
}));

const placement = {
  position: new THREE.Vector3(),
  quaternion: new THREE.Quaternion(),
  normal: new THREE.Vector3(0, 0, 1),
  width: 2,
  height: 1.2
} as const satisfies ArcadeScreenPlacement;

function createMatchMedia(matches: boolean): typeof window.matchMedia {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));
}

function createTouch(
  target: EventTarget,
  identifier: number,
  clientX: number,
  clientY: number
): Touch {
  return {
    identifier,
    target,
    clientX,
    clientY,
    screenX: clientX,
    screenY: clientY,
    pageX: clientX,
    pageY: clientY,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1
  } as Touch;
}

function createTouchList(touches: readonly Touch[]): TouchList {
  const touchList = [...touches] as unknown as TouchList & { item: (index: number) => Touch | null };
  touchList.item = (index: number) => touches[index] ?? null;
  return touchList;
}

function dispatchTouchEvent(
  target: HTMLElement,
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: readonly Touch[]
): TouchEvent {
  const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent;
  const touchList = createTouchList(touches);
  Object.defineProperties(event, {
    touches: { value: touchList },
    targetTouches: { value: touchList },
    changedTouches: { value: touchList }
  });
  target.dispatchEvent(event);
  return event;
}

describe('ArcadeScreenSurface mobile gestures', () => {
  let host: HTMLDivElement;
  let screenTarget: HTMLButtonElement;
  let onScreenZoomChange: (screenId: EmbeddedScreenId, scale: number) => void;
  let onScreenPanChange: (screenId: EmbeddedScreenId, pan: EmbeddedScreenPan) => void;
  let onScreenZoomChangeMock: ReturnType<typeof vi.fn>;
  let onScreenPanChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    harness.runtime = undefined;
    harness.state = { activeSectionId: 'architecture', navigationState: 'section-open' };
    harness.setActiveSection.mockClear();
    Object.values(harness.screenLayer).forEach((entry) => {
      if (typeof entry === 'function' && 'mockClear' in entry) entry.mockClear();
    });

    host = document.createElement('div');
    const canvas = document.createElement('canvas');
    host.appendChild(canvas);
    document.body.appendChild(host);
    harness.root = {
      gl: {
        domElement: canvas,
        capabilities: { getMaxAnisotropy: () => 8 }
      },
      invalidate: vi.fn(),
      setEvents: vi.fn(),
      get: () => ({ events: { enabled: true } })
    };
    vi.stubGlobal('matchMedia', createMatchMedia(true));
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(performance.now()), 16)
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));
    onScreenZoomChangeMock = vi.fn();
    onScreenPanChangeMock = vi.fn();
    onScreenZoomChange = onScreenZoomChangeMock as typeof onScreenZoomChange;
    onScreenPanChange = onScreenPanChangeMock as typeof onScreenPanChange;
  });

  afterEach(() => {
    cleanup();
    document.body.replaceChildren();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('pinches from inside the live frame and then pans that zoomed frame with one finger', async () => {
    render(
      <ArcadeScreenSurface
        screen={placement}
        screenId="architecture"
        onScreenZoomChange={onScreenZoomChange}
        onScreenPanChange={onScreenPanChange}
      />
    );
    expect(harness.runtime).toBeDefined();
    host.appendChild(harness.runtime!.object.element);
    screenTarget = document.createElement('button');
    harness.runtime!.content.appendChild(screenTarget);
    onScreenZoomChangeMock.mockClear();
    onScreenPanChangeMock.mockClear();

    const firstStart = createTouch(screenTarget, 1, 100, 100);
    dispatchTouchEvent(screenTarget, 'touchstart', [firstStart]);
    const secondStart = createTouch(screenTarget, 2, 120, 100);
    const pinchStart = dispatchTouchEvent(screenTarget, 'touchstart', [firstStart, secondStart]);
    expect(pinchStart.defaultPrevented).toBe(true);
    expect(harness.runtime!.object.element.dataset.gestureMode).toBe('viewport');

    const firstMove = createTouch(screenTarget, 1, 90, 100);
    const secondMove = createTouch(screenTarget, 2, 130, 100);
    const pinchMove = dispatchTouchEvent(screenTarget, 'touchmove', [firstMove, secondMove]);
    expect(pinchMove.defaultPrevented).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(20); });
    expect(onScreenZoomChangeMock).toHaveBeenLastCalledWith('architecture', 2);

    dispatchTouchEvent(screenTarget, 'touchend', []);
    const panStart = createTouch(screenTarget, 3, 140, 120);
    dispatchTouchEvent(screenTarget, 'touchstart', [panStart]);
    const panMove = createTouch(screenTarget, 3, 180, 120);
    const panEvent = dispatchTouchEvent(screenTarget, 'touchmove', [panMove]);
    expect(panEvent.defaultPrevented).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(20); });
    expect(onScreenPanChangeMock).toHaveBeenLastCalledWith(
      'architecture',
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) })
    );
  });
});
