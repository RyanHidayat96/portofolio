'use client';

const snapshotTextureScale = 1.8;
const maximumSnapshotDimension = 1800;
const snapshotBackgroundColor = '#0f1b29';
const snapshotScrollAttribute = 'data-embedded-snapshot-scroll';

export async function captureEmbeddedScreenSnapshot(source: HTMLElement): Promise<HTMLCanvasElement> {
  await waitForEmbeddedScreenPaint();
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
  const restoreScrollMarkers = markScrolledContent(source);
  let svg: string;

  try {
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

  // Apply scroll offsets only to the serialized clone. Changing transforms on
  // the live page would visibly scroll it a second time during camera return.
  const snapshot = new DOMParser().parseFromString(
    decodeURIComponent(svg.slice(svg.indexOf(',') + 1)),
    'image/svg+xml'
  );
  for (const element of snapshot.querySelectorAll<HTMLElement>(`[${snapshotScrollAttribute}]`)) {
    const [left, top] = JSON.parse(element.getAttribute(snapshotScrollAttribute)!) as [number, number];
    element.removeAttribute(snapshotScrollAttribute);
    element.style.overflow = 'hidden';
    for (const child of Array.from(element.children)) {
      const style = (child as HTMLElement | SVGElement).style;
      if (!style) continue;
      const transform = style.transform === 'none' ? '' : style.transform;
      style.transform = `translate(${-left}px, ${-top}px) ${transform}`.trim();
      style.transformOrigin = 'top left';
    }
  }

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(snapshot))}`;
  await image.decode();

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

function markScrolledContent(source: HTMLElement): () => void {
  const markers: { element: HTMLElement; previous: string | null }[] = [];
  for (const element of [source, ...source.querySelectorAll<HTMLElement>('*')]) {
    const top = Math.round(element.scrollTop);
    const left = Math.round(element.scrollLeft);
    if (top === 0 && left === 0) continue;
    markers.push({ element, previous: element.getAttribute(snapshotScrollAttribute) });
    element.setAttribute(snapshotScrollAttribute, JSON.stringify([left, top]));
  }
  return () => {
    for (const { element, previous } of markers) {
      if (previous === null) element.removeAttribute(snapshotScrollAttribute);
      else element.setAttribute(snapshotScrollAttribute, previous);
    }
  };
}

function waitForEmbeddedScreenPaint(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}
