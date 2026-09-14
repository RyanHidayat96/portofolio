'use client';

const snapshotTextureScale = 1.8;
const maximumSnapshotDimension = 1800;
const snapshotBackgroundColor = '#0f1b29';
const snapshotScrollAttribute = 'data-embedded-snapshot-scroll';

interface EmbeddedScreenSnapshotOptions {
  readonly shouldContinue?: () => boolean;
}

interface ScrollSnapshotStyle {
  readonly thumb: string;
  readonly track: string;
  readonly thickness: number;
  readonly thumbInset: number;
  readonly minimumThumbLength: number;
}

interface ScrollSnapshotMetrics {
  readonly left: number;
  readonly top: number;
  readonly clientWidth: number;
  readonly clientHeight: number;
  readonly scrollWidth: number;
  readonly scrollHeight: number;
  readonly style: ScrollSnapshotStyle;
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
    appendSnapshotScrollIndicators(element, metrics);
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
    scrollHeight,
    style: getSnapshotScrollbarStyle(element)
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
    scrollHeight: parsed.scrollHeight ?? parsed.clientHeight ?? 0,
    style: parsed.style ?? getDefaultSnapshotScrollbarStyle()
  };
}

function appendSnapshotScrollIndicators(element: HTMLElement, metrics: ScrollSnapshotMetrics): void {
  const hasVerticalScroll = metrics.scrollHeight > metrics.clientHeight + 1;
  const hasHorizontalScroll = metrics.scrollWidth > metrics.clientWidth + 1;
  appendVerticalScrollIndicator(element, metrics, hasHorizontalScroll);
  appendHorizontalScrollIndicator(element, metrics, hasVerticalScroll);
  if (hasVerticalScroll && hasHorizontalScroll) appendScrollbarCorner(element, metrics.style);
}

function appendVerticalScrollIndicator(
  element: HTMLElement,
  metrics: ScrollSnapshotMetrics,
  hasHorizontalScroll: boolean
): void {
  if (metrics.scrollHeight <= metrics.clientHeight + 1 || metrics.clientHeight < 16) return;

  const { style } = metrics;
  const thickness = Math.min(style.thickness, Math.max(1, metrics.clientWidth));
  const thumbInset = clamp(style.thumbInset, 0, Math.max(0, Math.floor((thickness - 1) / 2)));
  const thumbThickness = Math.max(1, thickness - thumbInset * 2);
  const trackLength = Math.max(1, metrics.clientHeight - (hasHorizontalScroll ? thickness : 0));
  const thumbLength = clamp(
    Math.round((metrics.clientHeight / metrics.scrollHeight) * trackLength),
    Math.min(style.minimumThumbLength, trackLength),
    trackLength
  );
  const maxScroll = Math.max(1, metrics.scrollHeight - metrics.clientHeight);
  const maxTravel = Math.max(0, trackLength - thumbLength);
  const thumbOffset = Math.round((clamp(metrics.top, 0, maxScroll) / maxScroll) * maxTravel);

  const track = createSnapshotElement(
    element,
    'embedded-screen-snapshot-scrollbar embedded-screen-snapshot-scrollbar--vertical',
    [
      'position:absolute',
      'top:0px',
      'right:0px',
      `width:${thickness}px`,
      `height:${trackLength}px`,
      `background:${style.track}`,
      'pointer-events:none',
      'z-index:2147483647'
    ]
  );
  const thumb = createSnapshotElement(
    element,
    'embedded-screen-snapshot-scrollbar-thumb embedded-screen-snapshot-scrollbar-thumb--vertical',
    [
      'position:absolute',
      `left:${thumbInset}px`,
      `top:${thumbOffset}px`,
      `width:${thumbThickness}px`,
      `height:${thumbLength}px`,
      'border-radius:999px',
      `background:${style.thumb}`
    ]
  );
  track.appendChild(thumb);
  element.appendChild(track);
}

function appendHorizontalScrollIndicator(
  element: HTMLElement,
  metrics: ScrollSnapshotMetrics,
  hasVerticalScroll: boolean
): void {
  if (metrics.scrollWidth <= metrics.clientWidth + 1 || metrics.clientWidth < 16) return;

  const { style } = metrics;
  const thickness = Math.min(style.thickness, Math.max(1, metrics.clientHeight));
  const thumbInset = clamp(style.thumbInset, 0, Math.max(0, Math.floor((thickness - 1) / 2)));
  const thumbThickness = Math.max(1, thickness - thumbInset * 2);
  const trackLength = Math.max(1, metrics.clientWidth - (hasVerticalScroll ? thickness : 0));
  const thumbLength = clamp(
    Math.round((metrics.clientWidth / metrics.scrollWidth) * trackLength),
    Math.min(style.minimumThumbLength, trackLength),
    trackLength
  );
  const maxScroll = Math.max(1, metrics.scrollWidth - metrics.clientWidth);
  const maxTravel = Math.max(0, trackLength - thumbLength);
  const thumbOffset = Math.round((clamp(metrics.left, 0, maxScroll) / maxScroll) * maxTravel);

  const track = createSnapshotElement(
    element,
    'embedded-screen-snapshot-scrollbar embedded-screen-snapshot-scrollbar--horizontal',
    [
      'position:absolute',
      'left:0px',
      'bottom:0px',
      `width:${trackLength}px`,
      `height:${thickness}px`,
      `background:${style.track}`,
      'pointer-events:none',
      'z-index:2147483647'
    ]
  );
  const thumb = createSnapshotElement(
    element,
    'embedded-screen-snapshot-scrollbar-thumb embedded-screen-snapshot-scrollbar-thumb--horizontal',
    [
      'position:absolute',
      `left:${thumbOffset}px`,
      `top:${thumbInset}px`,
      `width:${thumbLength}px`,
      `height:${thumbThickness}px`,
      'border-radius:999px',
      `background:${style.thumb}`
    ]
  );
  track.appendChild(thumb);
  element.appendChild(track);
}

function appendScrollbarCorner(element: HTMLElement, style: ScrollSnapshotStyle): void {
  element.appendChild(
    createSnapshotElement(
      element,
      'embedded-screen-snapshot-scrollbar-corner',
      [
        'position:absolute',
        'right:0px',
        'bottom:0px',
        `width:${style.thickness}px`,
        `height:${style.thickness}px`,
        `background:${style.track}`,
        'pointer-events:none',
        'z-index:2147483647'
      ]
    )
  );
}

function createSnapshotElement(
  owner: HTMLElement,
  className: string,
  declarations: readonly string[]
): HTMLElement {
  const element = owner.ownerDocument.createElementNS(
    'http://www.w3.org/1999/xhtml',
    'div'
  ) as HTMLElement;
  element.className = className;
  element.setAttribute('aria-hidden', 'true');
  element.setAttribute('style', declarations.join(';'));
  return element;
}

function getSnapshotScrollbarStyle(element: HTMLElement): ScrollSnapshotStyle {
  const style = window.getComputedStyle(element);
  const readColor = (propertyName: string, fallback: string): string => {
    const value = style.getPropertyValue(propertyName).trim();
    return value || fallback;
  };
  const readPixels = (propertyName: string, fallback: number): number => {
    const parsed = Number.parseFloat(style.getPropertyValue(propertyName));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  return {
    thumb: readColor('--embedded-screen-scrollbar-thumb', '#66ddff'),
    track: readColor('--embedded-screen-scrollbar-track', '#081014'),
    thickness: readPixels('--embedded-screen-scrollbar-size', 8),
    thumbInset: readPixels('--embedded-screen-scrollbar-thumb-inset', 1),
    minimumThumbLength: readPixels('--embedded-screen-scrollbar-min-thumb', 28)
  };
}

function getDefaultSnapshotScrollbarStyle(): ScrollSnapshotStyle {
  return {
    thumb: '#66ddff',
    track: '#081014',
    thickness: 8,
    thumbInset: 1,
    minimumThumbLength: 28
  };
}

function isScrollableOverflow(value: string): boolean {
  return value === 'auto' || value === 'scroll' || value === 'overlay';
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function waitForEmbeddedScreenPaint(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}
