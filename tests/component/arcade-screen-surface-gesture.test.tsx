import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { ArcadeScreenSurface, type EmbeddedScreenPan } from '../../src/features/portfolio-3d/components/ArcadeScreenSurface';
import type { EmbeddedScreenRegistration } from '../../src/features/portfolio-3d/components/EmbeddedScreenLayer';
import type { ArcadeScreenPlacement, EmbeddedScreenId } from '../../src/features/portfolio-3d/arcade-screen';
import { captureEmbeddedScreenSnapshot } from '../../src/features/portfolio-3d/components/EmbeddedScreenSnapshot';

const harness = vi.hoisted(() => ({
  root: {} as {
    gl: { domElement: HTMLCanvasElement; capabilities: { getMaxAnisotropy: () => number } };
    invalidate: ReturnType<typeof vi.fn>;
    setEvents: ReturnType<typeof vi.fn>;
    get: () => { events: { enabled: boolean } };
  },
  runtime: undefined as EmbeddedScreenRegistration | undefined,
  state: { activeSectionId: 'architecture', navigationState: 'section-open' },
  scheduledPreviewCaptures: [] as { capture: () => Promise<void>; delayMs: number }[],
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
    schedulePreviewCapture: vi.fn((capture: () => Promise<void>, delayMs: number) => {
      const job = { capture, delayMs };
      harness.scheduledPreviewCaptures.push(job);
      return () => {
        harness.scheduledPreviewCaptures = harness.scheduledPreviewCaptures.filter(
          (entry) => entry !== job
        );
      };
    }),
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

function setScrollMetrics(
  element: HTMLElement,
  metrics: Readonly<{ clientHeight: number; scrollHeight: number; clientWidth?: number; scrollWidth?: number }>
): void {
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: metrics.clientHeight },
    scrollHeight: { configurable: true, value: metrics.scrollHeight },
    clientWidth: { configurable: true, value: metrics.clientWidth ?? 100 },
    scrollWidth: { configurable: true, value: metrics.scrollWidth ?? 100 }
  });
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
    harness.scheduledPreviewCaptures = [];
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

  it('scrolls embedded frame content before panning the zoomed viewport', async () => {
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
    const scrollContainer = document.createElement('div');
    scrollContainer.style.overflowY = 'auto';
    setScrollMetrics(scrollContainer, { clientHeight: 100, scrollHeight: 300 });
    screenTarget = document.createElement('button');
    scrollContainer.appendChild(screenTarget);
    harness.runtime!.content.appendChild(scrollContainer);
    onScreenZoomChangeMock.mockClear();
    onScreenPanChangeMock.mockClear();

    const firstStart = createTouch(screenTarget, 1, 100, 100);
    const secondStart = createTouch(screenTarget, 2, 120, 100);
    dispatchTouchEvent(screenTarget, 'touchstart', [firstStart, secondStart]);
    dispatchTouchEvent(screenTarget, 'touchmove', [
      createTouch(screenTarget, 1, 90, 100),
      createTouch(screenTarget, 2, 130, 100)
    ]);
    await act(async () => { await vi.advanceTimersByTimeAsync(20); });
    expect(onScreenZoomChangeMock).toHaveBeenLastCalledWith('architecture', 2);
    dispatchTouchEvent(screenTarget, 'touchend', []);
    onScreenPanChangeMock.mockClear();

    const scrollStart = createTouch(screenTarget, 3, 140, 180);
    dispatchTouchEvent(screenTarget, 'touchstart', [scrollStart]);
    const scrollMove = dispatchTouchEvent(screenTarget, 'touchmove', [
      createTouch(screenTarget, 3, 140, 130)
    ]);
    expect(scrollMove.defaultPrevented).toBe(true);
    expect(scrollContainer.scrollTop).toBe(100);
    await act(async () => { await vi.advanceTimersByTimeAsync(20); });
    expect(onScreenPanChangeMock).not.toHaveBeenCalled();
    dispatchTouchEvent(screenTarget, 'touchend', []);

    scrollContainer.scrollTop = 200;
    onScreenPanChangeMock.mockClear();
    const bottomPanStart = createTouch(screenTarget, 4, 140, 180);
    dispatchTouchEvent(screenTarget, 'touchstart', [bottomPanStart]);
    const bottomPanMove = dispatchTouchEvent(screenTarget, 'touchmove', [
      createTouch(screenTarget, 4, 140, 130)
    ]);
    expect(bottomPanMove.defaultPrevented).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(20); });
    expect(onScreenPanChangeMock).toHaveBeenLastCalledWith(
      'architecture',
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) })
    );

    dispatchTouchEvent(screenTarget, 'touchend', []);
    scrollContainer.scrollTop = 100;
    onScreenPanChangeMock.mockClear();
    dispatchTouchEvent(screenTarget, 'touchstart', [createTouch(screenTarget, 5, 120, 150)]);
    const horizontalPanMove = dispatchTouchEvent(screenTarget, 'touchmove', [
      createTouch(screenTarget, 5, 170, 152)
    ]);
    expect(horizontalPanMove.defaultPrevented).toBe(true);
    expect(scrollContainer.scrollTop).toBe(100);
  });

  it('keeps the live frame visible but defers the return snapshot work off the camera transition', async () => {
    const snapshotCanvas = document.createElement('canvas');
    vi.mocked(captureEmbeddedScreenSnapshot).mockResolvedValue(snapshotCanvas);
    const { rerender } = render(
      <ArcadeScreenSurface
        screen={placement}
        screenId="architecture"
        onScreenZoomChange={onScreenZoomChange}
        onScreenPanChange={onScreenPanChange}
      />
    );
    expect(harness.runtime).toBeDefined();
    harness.runtime!.content.appendChild(document.createElement('section'));

    harness.state = { activeSectionId: 'overview', navigationState: 'returning' };
    rerender(
      <ArcadeScreenSurface
        screen={placement}
        screenId="architecture"
        onScreenZoomChange={onScreenZoomChange}
        onScreenPanChange={onScreenPanChange}
      />
    );

    expect(harness.screenLayer.setPreviewCapturePending).toHaveBeenCalledWith(
      harness.runtime,
      true
    );
    expect(captureEmbeddedScreenSnapshot).not.toHaveBeenCalled();

    const returnCapture = harness.scheduledPreviewCaptures.find((job) => job.delayMs === 0);
    expect(returnCapture).toBeDefined();
    await act(async () => { await returnCapture?.capture(); });

    expect(captureEmbeddedScreenSnapshot).toHaveBeenCalledWith(harness.runtime!.content);
  });
});
