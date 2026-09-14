'use client';

const snapshotTextureScale = 1.8;
const maximumSnapshotDimension = 1800;
const snapshotBackgroundColor = '#0f1b29';
const snapshotScrollAttribute = 'data-embedded-snapshot-scroll';

interface EmbeddedScreenSnapshotOptions {
  readonly shouldContinue?: () => boolean;
}

interface ScrollSnapshotMetrics {
  readonly left: number;
  readonly top: number;
  readonly clientWidth: number;
  readonly clientHeight: number;
  readonly scrollWidth: number;
  readonly scrollHeight: number;
}

export async function captureEmbeddedScreenSnapshot(
  source: HTMLElement,
  options: EmbeddedScreenSnapshotOptions = {}
): Promise<HTMLCanvasElement> {
  await waitForEmbeddedScreenPaint();
  assertSnapshotCanContinue(options);
  const sourceWidth = Math.round(source.clientWidth);
  const sourceHeight = Math.round(source.clientHeight);
  if (sourceWidth < 1 || sourceHeight < 1) {
    throw new Error('Embedded screen is not measurable for a snapshot.');
  }
  const snapshotScale = Math.min(
    snapshotTextureScale,
    maximumSnapshotDimension / Math.max(sourceWidth, sourceHeight)
  );
  const { toSvg } = await import('html-to-image');
  assertSnapshotCanContinue(options);
  const restoreScrollMarkers = markScrolledContent(source);
  let svg: string;

  try {
    assertSnapshotCanContinue(options);
    svg = await toSvg(source, {
      width: sourceWidth,
      height: sourceHeight,
      backgroundColor: snapshotBackgroundColor,
      cacheBust: false,
      style: { transform: 'none', transformOrigin: 'top left' }
    });
  } finally {
    restoreScrollMarkers();
  }
  assertSnapshotCanContinue(options);

  // Apply scroll offsets only to the serialized clone. Changing transforms on
  // the live page would visibly scroll it a second time during camera return.
  const snapshot = new DOMParser().parseFromString(
    decodeURIComponent(svg.slice(svg.indexOf(',') + 1)),
    'image/svg+xml'
  );
  for (const element of snapshot.querySelectorAll<HTMLElement>(`[${snapshotScrollAttribute}]`)) {
    const metrics = parseScrollSnapshotMetrics(element.getAttribute(snapshotScrollAttribute)!);
    element.removeAttribute(snapshotScrollAttribute);
    element.style.overflow = 'hidden';
    if (!element.style.position || element.style.position === 'static') element.style.position = 'relative';
    for (const child of Array.from(element.children)) {
      const style = (child as HTMLElement | SVGElement).style;
      if (!style) continue;
      const transform = style.transform === 'none' ? '' : style.transform;
      style.transform = `translate(${-metrics.left}px, ${-metrics.top}px) ${transform}`.trim();
      style.transformOrigin = 'top left';
    }
  }

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(snapshot))}`;
  await image.decode();
  assertSnapshotCanContinue(options);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(sourceWidth * snapshotScale));
  canvas.height = Math.max(1, Math.round(sourceHeight * snapshotScale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Embedded screen snapshot canvas is unavailable.');
  context.fillStyle = snapshotBackgroundColor;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function assertSnapshotCanContinue(options: EmbeddedScreenSnapshotOptions): void {
  if (options.shouldContinue && !options.shouldContinue()) {
    throw new Error('Embedded screen snapshot capture was cancelled.');
  }
}

function markScrolledContent(source: HTMLElement): () => void {
  const markers: { element: HTMLElement; previous: string | null }[] = [];
  for (const element of [source, ...source.querySelectorAll<HTMLElement>('*')]) {
    const metrics = getScrollSnapshotMetrics(element);
    if (!metrics) continue;
    markers.push({ element, previous: element.getAttribute(snapshotScrollAttribute) });
    element.setAttribute(snapshotScrollAttribute, JSON.stringify(metrics));
  }
  return () => {
    for (const { element, previous } of markers) {
      if (previous === null) element.removeAttribute(snapshotScrollAttribute);
      else element.setAttribute(snapshotScrollAttribute, previous);
    }
  };
}

function getScrollSnapshotMetrics(element: HTMLElement): ScrollSnapshotMetrics | undefined {
  const top = Math.round(element.scrollTop);
  const left = Math.round(element.scrollLeft);
  const clientWidth = Math.round(element.clientWidth);
  const clientHeight = Math.round(element.clientHeight);
  const scrollWidth = Math.round(element.scrollWidth);
  const scrollHeight = Math.round(element.scrollHeight);
  const style = window.getComputedStyle(element);
  const hasVerticalScroll =
    isScrollableOverflow(style.overflowY || style.overflow) && scrollHeight > clientHeight + 1;
  const hasHorizontalScroll =
    isScrollableOverflow(style.overflowX || style.overflow) && scrollWidth > clientWidth + 1;

  if (top === 0 && left === 0 && !hasVerticalScroll && !hasHorizontalScroll) {
    return undefined;
  }

  return {
    left,
    top,
    clientWidth,
    clientHeight,
    scrollWidth,
    scrollHeight
  };
}

function parseScrollSnapshotMetrics(value: string): ScrollSnapshotMetrics {
  const parsed = JSON.parse(value) as ScrollSnapshotMetrics;
  return {
    left: parsed.left ?? 0,
    top: parsed.top ?? 0,
    clientWidth: parsed.clientWidth ?? 0,
    clientHeight: parsed.clientHeight ?? 0,
    scrollWidth: parsed.scrollWidth ?? parsed.clientWidth ?? 0,
    scrollHeight: parsed.scrollHeight ?? parsed.clientHeight ?? 0
  };
}

function isScrollableOverflow(value: string): boolean {
  return value === 'auto' || value === 'scroll' || value === 'overlay';
}

function waitForEmbeddedScreenPaint(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}
