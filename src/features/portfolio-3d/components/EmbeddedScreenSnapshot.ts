'use client';

const maximumSnapshotDimension = 640;
const snapshotBackgroundColor = '#0f1b29';

export async function captureEmbeddedScreenSnapshot(source: HTMLElement): Promise<HTMLCanvasElement> {
  // Let a just-restored CSS3D document complete its scroll-session frame
  // before reading offsets for the static room preview.
  await waitForEmbeddedScreenPaint();
  const restoreScrolledContent = materializeScrolledContent(source);

  try {
    const sourceWidth = Math.round(source.clientWidth);
    const sourceHeight = Math.round(source.clientHeight);
    if (sourceWidth < 1 || sourceHeight < 1) {
      throw new Error('Embedded screen is not measurable for a snapshot.');
    }
    const snapshotScale = Math.min(1, maximumSnapshotDimension / Math.max(sourceWidth, sourceHeight));
    const canvasWidth = Math.max(1, Math.round(sourceWidth * snapshotScale));
    const canvasHeight = Math.max(1, Math.round(sourceHeight * snapshotScale));
    const { toCanvas } = await import('html-to-image');

    return await toCanvas(source, {
      width: sourceWidth,
      height: sourceHeight,
      canvasWidth,
      canvasHeight,
      pixelRatio: 1,
      backgroundColor: snapshotBackgroundColor,
      cacheBust: false,
      skipAutoScale: true,
      // The focused document is enlarged through its outer transform. Capture
      // its logical layout instead of that temporary camera-facing scale.
      style: {
        transform: 'none',
        transformOrigin: 'top left'
      }
    });
  } finally {
    restoreScrolledContent();
  }
}

interface ScrollMaterialization {
  readonly element: HTMLElement;
  readonly overflow: string;
  readonly children: readonly ChildTransform[];
}

interface ChildTransform {
  readonly element: HTMLElement;
  readonly transform: string;
  readonly transformOrigin: string;
}

function materializeScrolledContent(source: HTMLElement): () => void {
  const scrollables = [source, ...source.querySelectorAll<HTMLElement>('*')];
  const materializations: ScrollMaterialization[] = [];

  for (const element of scrollables) {
    const scrollTop = Math.round(element.scrollTop);
    const scrollLeft = Math.round(element.scrollLeft);
    if (scrollTop === 0 && scrollLeft === 0) {
      continue;
    }

    const children = [...element.children].filter((child): child is HTMLElement => child instanceof HTMLElement);
    if (children.length === 0) {
      continue;
    }

    const childTransforms = children.map((child) => {
      const transform = child.style.transform;
      const transformOrigin = child.style.transformOrigin;
      child.style.transform = `translate3d(${-scrollLeft}px, ${-scrollTop}px, 0) ${transform}`.trim();
      child.style.transformOrigin = 'top left';
      return { element: child, transform, transformOrigin };
    });

    materializations.push({
      element,
      overflow: element.style.overflow,
      children: childTransforms
    });
    // html-to-image clones nodes but not their scroll offsets. The translated
    // children preserve the exact visible viewport in that clone.
    element.style.overflow = 'hidden';
  }

  return () => {
    materializations.forEach(({ element, overflow, children }) => {
      element.style.overflow = overflow;
      children.forEach(({ element: child, transform, transformOrigin }) => {
        child.style.transform = transform;
        child.style.transformOrigin = transformOrigin;
      });
    });
  };
}

function waitForEmbeddedScreenPaint(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}
