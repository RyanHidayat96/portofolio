"use client";

const snapshotBackgroundColor = "#0b0703";
const snapshotScrollAttribute = "data-embedded-snapshot-scroll";

interface EmbeddedScreenSnapshotOptions {
  readonly scale: number;
  readonly maxDimension: number;
}

interface ScrollPosition {
  readonly left: number;
  readonly top: number;
}

/**
 * Serializes the focused screen into SVG before rasterizing it. Unlike
 * html2canvas, this preserves the full CSS height on Android Chromium.
 */
export async function captureEmbeddedScreenSnapshot(
  source: HTMLElement,
  options: EmbeddedScreenSnapshotOptions
): Promise<HTMLCanvasElement> {
  await nextPaint();
  const width = Math.round(source.clientWidth);
  const height = Math.round(source.clientHeight);
  if (width < 1 || height < 1) {
    throw new Error("Embedded screen is not measurable for a snapshot.");
  }

  const restoreScrollMarkers = markScrollOffsets(source);
  let svg: string;
  try {
    const { toSvg } = await import("html-to-image");
    svg = await toSvg(source, {
      backgroundColor: snapshotBackgroundColor,
      cacheBust: false,
      height,
      style: { transform: "none", transformOrigin: "top left" },
      width
    });
  } finally {
    restoreScrollMarkers();
  }

  const snapshot = new DOMParser().parseFromString(
    decodeURIComponent(svg.slice(svg.indexOf(",") + 1)),
    "image/svg+xml"
  );
  applyScrollOffsets(snapshot);

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    new XMLSerializer().serializeToString(snapshot)
  )}`;
  await image.decode();

  const scale = Math.min(options.scale, options.maxDimension / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Embedded screen snapshot canvas is unavailable.");
  context.fillStyle = snapshotBackgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function markScrollOffsets(source: HTMLElement): () => void {
  const restores: Array<{ element: HTMLElement; previous: string | null }> = [];
  for (const element of [source, ...source.querySelectorAll<HTMLElement>("*")]) {
    const top = element.scrollTop || Number(element.dataset.scrollTop || 0);
    const left = element.scrollLeft;
    if (top === 0 && left === 0) continue;
    restores.push({ element, previous: element.getAttribute(snapshotScrollAttribute) });
    element.setAttribute(snapshotScrollAttribute, JSON.stringify({ left, top } satisfies ScrollPosition));
  }
  return () => {
    for (const { element, previous } of restores) {
      if (previous === null) element.removeAttribute(snapshotScrollAttribute);
      else element.setAttribute(snapshotScrollAttribute, previous);
    }
  };
}

function applyScrollOffsets(snapshot: Document): void {
  for (const element of snapshot.querySelectorAll<HTMLElement>(`[${snapshotScrollAttribute}]`)) {
    const value = element.getAttribute(snapshotScrollAttribute);
    element.removeAttribute(snapshotScrollAttribute);
    if (!value) continue;

    try {
      const { left = 0, top = 0 } = JSON.parse(value) as Partial<ScrollPosition>;
      element.style.overflow = "hidden";
      if (!element.style.position || element.style.position === "static") {
        element.style.position = "relative";
      }
      for (const child of Array.from(element.children)) {
        const childElement = child as HTMLElement;
        const currentTransform = childElement.style.transform === "none" ? "" : childElement.style.transform;
        childElement.style.transform = `translate(${-left}px, ${-top}px) ${currentTransform}`.trim();
        childElement.style.transformOrigin = "top left";
      }
    } catch {
      // Ignore a malformed marker; never block Back to Room.
    }
  }
}

async function nextPaint(): Promise<void> {
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  await document.fonts?.ready;
}
