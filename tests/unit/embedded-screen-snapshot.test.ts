import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toSvg } from 'html-to-image';
import { captureEmbeddedScreenSnapshot } from '../../src/features/portfolio-3d/components/EmbeddedScreenSnapshot';

vi.mock('html-to-image', () => ({ toSvg: vi.fn() }));

const scrollAttribute = 'data-embedded-snapshot-scroll';
let serializedSnapshot = '';
const drawImage = vi.fn();
let canvasContext: {
  fillRect: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  fillStyle: string;
  imageSmoothingEnabled: boolean;
  imageSmoothingQuality: ImageSmoothingQuality;
};

function createSource(): HTMLDivElement {
  const source = document.createElement('div');
  source.innerHTML = '<div class="scroll" style="overflow: auto"><section style="transform: scale(1)">Last page state</section></div>';
  Object.defineProperties(source, {
    clientWidth: { value: 1000 },
    clientHeight: { value: 800 }
  });
  document.body.appendChild(source);
  return source;
}

beforeEach(() => {
  vi.clearAllMocks();
  serializedSnapshot = '';
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    queueMicrotask(() => callback(0));
    return 1;
  });
  vi.stubGlobal('Image', class {
    src = '';
    async decode() {
      serializedSnapshot = decodeURIComponent(this.src.slice(this.src.indexOf(',') + 1));
    }
  });
  canvasContext = {
    fillRect: vi.fn(),
    drawImage,
    fillStyle: '',
    imageSmoothingEnabled: false,
    imageSmoothingQuality: 'low'
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(canvasContext as unknown as CanvasRenderingContext2D);
  vi.mocked(toSvg).mockImplementation(async (source) => {
    await Promise.resolve();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg"><foreignObject>${new XMLSerializer().serializeToString(source)}</foreignObject></svg>`
    )}`;
  });
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('embedded screen snapshot', () => {
  it('translates only the snapshot clone, keeping the visible page and its nested scroll unchanged', async () => {
    const source = createSource();
    const scroll = source.querySelector<HTMLDivElement>('.scroll')!;
    const content = scroll.firstElementChild as HTMLElement;
    scroll.scrollTop = 600;
    scroll.scrollLeft = 24;
    content.scrollTop = 15;
    content.innerHTML = '<div class="nested">Nested scrolled content</div>';
    const stylesBefore = [scroll.style.cssText, content.style.cssText];
    const originalClone = vi.mocked(toSvg).getMockImplementation()!;
    vi.mocked(toSvg).mockImplementation(async (node, options) => {
      expect(scroll.scrollTop).toBe(600);
      expect([scroll.style.cssText, content.style.cssText]).toEqual(stylesBefore);
      return originalClone(node, options);
    });

    const canvas = await captureEmbeddedScreenSnapshot(source);
    const clone = new DOMParser().parseFromString(serializedSnapshot, 'image/svg+xml');
    expect(clone.querySelector<HTMLElement>('section')!.style.transform).toBe('translate(-24px, -600px) scale(1)');
    expect(clone.querySelector<HTMLElement>('.nested')!.style.transform).toBe('translate(0px, -15px)');
    expect(source.querySelector(`[${scrollAttribute}]`)).toBeNull();
    expect([scroll.style.cssText, content.style.cssText]).toEqual(stylesBefore);
    expect(scroll.scrollTop).toBe(600);
    expect(canvas.width).toBe(1800);
    expect(canvas.height).toBe(1440);
    expect(canvasContext.imageSmoothingEnabled).toBe(true);
    expect(canvasContext.imageSmoothingQuality).toBe('high');
    expect(drawImage).toHaveBeenCalledOnce();
  });

  it('captures the updated scroll offset again on the next return', async () => {
    const source = createSource();
    const scroll = source.querySelector<HTMLDivElement>('.scroll')!;
    scroll.scrollTop = 200;
    await captureEmbeddedScreenSnapshot(source);
    expect(serializedSnapshot).toContain('translate(0px, -200px)');
    scroll.scrollTop = 500;
    await captureEmbeddedScreenSnapshot(source);
    expect(serializedSnapshot).toContain('translate(0px, -500px)');
    expect(serializedSnapshot).not.toContain('translate(0px, -200px)');
    expect(scroll.scrollTop).toBe(500);
  });

  it('cleans temporary markers without changing live styles when capture fails', async () => {
    const source = createSource();
    const scroll = source.querySelector<HTMLDivElement>('.scroll')!;
    scroll.scrollTop = 300;
    vi.mocked(toSvg).mockRejectedValueOnce(new Error('Capture failed'));
    await expect(captureEmbeddedScreenSnapshot(source)).rejects.toThrow('Capture failed');
    expect(source.querySelector(`[${scrollAttribute}]`)).toBeNull();
    expect(scroll.style.overflow).toBe('auto');
    expect(scroll.scrollTop).toBe(300);
    expect((scroll.firstElementChild as HTMLElement).style.transform).toBe('scale(1)');
  });

  it('cancels before DOM serialization when the room starts moving or focusing', async () => {
    const source = createSource();
    await expect(captureEmbeddedScreenSnapshot(source, { shouldContinue: () => false }))
      .rejects.toThrow('cancelled');
    expect(toSvg).not.toHaveBeenCalled();
  });
});
