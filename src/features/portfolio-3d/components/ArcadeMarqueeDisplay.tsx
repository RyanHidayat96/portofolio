'use client';

import { useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ArcadeScreenPlacement } from '../arcade-screen';

const marqueeMessage = 'Ryan Hidayat - 087775009393';
const marqueeCanvasWidth = 640;
const marqueeCanvasHeight = 144;
const marqueeDotPitch = 10;
// One animation step equals one physical LED-dot column, keeping the running
// sign crisp while avoiding an unnecessary full-room redraw every 50 ms.
const marqueeFrameIntervalMs = 100;
const marqueeScrollPixelsPerSecond = marqueeDotPitch * 10;
const marqueeGlyphWidth = 5;
const marqueeGlyphHeight = 7;
const marqueeCharacterAdvance = marqueeDotPitch * 6;
const marqueeMessageWidth = marqueeMessage.length * marqueeCharacterAdvance;
const marqueeMessageGap = 90;
const marqueeBorderVerticalInset = 25;
const marqueeContentVerticalInset = 37;

const ledGlyphs: Readonly<Record<string, readonly string[]>> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '11100'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000']
};

export function ArcadeMarqueeDisplay({ marquee }: Readonly<{
  marquee: ArcadeScreenPlacement;
}>): React.ReactElement | null {
  const { camera, invalidate } = useThree();
  const runtimeRef = useRef<MarqueeRuntime | null>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = marqueeCanvasWidth;
    canvas.height = marqueeCanvasHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    const nextTexture = new THREE.CanvasTexture(canvas);
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.generateMipmaps = false;
    nextTexture.minFilter = THREE.LinearFilter;
    nextTexture.magFilter = THREE.LinearFilter;
    const layout = createMarqueeCanvasLayout(marquee);
    const backgroundCanvas = createMarqueeBackground(layout);
    const messageCanvas = createMarqueeMessage();
    const projection = new THREE.Vector3();
    runtimeRef.current = {
      context,
      texture: nextTexture,
      backgroundCanvas,
      messageCanvas,
      projection,
      layout
    };

    const paint = (): void => {
      const runtime = runtimeRef.current;
      if (!runtime || document.hidden || !isMarqueeVisible(camera, marquee, runtime.projection)) return;
      drawMarquee(runtime, performance.now());
      runtime.texture.needsUpdate = true;
      invalidate();
    };

    paint();
    const intervalId = window.setInterval(paint, marqueeFrameIntervalMs);
    const onVisibilityChange = (): void => {
      if (!document.hidden) paint();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    setTexture(nextTexture);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      runtimeRef.current = null;
      nextTexture.dispose();
    };
  }, [camera, invalidate, marquee]);

  if (!texture) return null;

  return (
    <mesh
      name="Arcade_Running_LED_Marquee"
      position={marquee.position}
      quaternion={marquee.quaternion}
      renderOrder={3}
    >
      <planeGeometry args={[marquee.width, marquee.height]} />
      <meshBasicMaterial
        map={texture}
        toneMapped={false}
        side={THREE.DoubleSide}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}

interface MarqueeRuntime {
  readonly context: CanvasRenderingContext2D;
  readonly texture: THREE.CanvasTexture;
  readonly backgroundCanvas: HTMLCanvasElement;
  readonly messageCanvas: HTMLCanvasElement;
  readonly projection: THREE.Vector3;
  readonly layout: MarqueeCanvasLayout;
}

interface MarqueeCanvasLayout {
  readonly borderHorizontalInset: number;
  readonly borderVerticalInset: number;
  readonly contentHorizontalInset: number;
  readonly contentVerticalInset: number;
}

function createMarqueeCanvasLayout(marquee: ArcadeScreenPlacement): MarqueeCanvasLayout {
  // Vertical values are the master controls. Deriving the horizontal values
  // from the actual 3D plane gives all four margins the same physical size.
  const toHorizontalInset = (verticalInset: number): number => (
    marqueeCanvasWidth * marquee.height * verticalInset /
    (marqueeCanvasHeight * Math.max(marquee.width, Number.EPSILON))
  );

  return {
    borderHorizontalInset: toHorizontalInset(marqueeBorderVerticalInset),
    borderVerticalInset: marqueeBorderVerticalInset,
    contentHorizontalInset: toHorizontalInset(marqueeContentVerticalInset),
    contentVerticalInset: marqueeContentVerticalInset
  };
}

function createMarqueeBackground(layout: MarqueeCanvasLayout): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = marqueeCanvasWidth;
  canvas.height = marqueeCanvasHeight;
  const context = canvas.getContext('2d');
  if (!context) return canvas;

  const background = context.createLinearGradient(0, 0, marqueeCanvasWidth, marqueeCanvasHeight);
  background.addColorStop(0, '#180302');
  background.addColorStop(0.5, '#050101');
  background.addColorStop(1, '#210402');
  context.fillStyle = background;
  context.fillRect(0, 0, marqueeCanvasWidth, marqueeCanvasHeight);

  context.fillStyle = 'rgba(255, 76, 24, 0.09)';
  for (let y = 7; y < marqueeCanvasHeight; y += 8) {
    context.fillRect(0, y, marqueeCanvasWidth, 1);
  }

  drawLedBorder(context, layout, 0);
  return canvas;
}

function createMarqueeMessage(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = marqueeMessageWidth;
  canvas.height = marqueeGlyphHeight * marqueeDotPitch;
  const context = canvas.getContext('2d');
  if (context) drawLedMessage(context, marqueeMessage, 0, 0, 0);
  return canvas;
}

function drawMarquee(runtime: MarqueeRuntime, timestamp: number): void {
  const { backgroundCanvas, context, layout, messageCanvas } = runtime;
  context.drawImage(backgroundCanvas, 0, 0);

  const messageOffset = (timestamp / 1000 * marqueeScrollPixelsPerSecond) % (
    marqueeMessageWidth + marqueeCanvasWidth + marqueeMessageGap
  );
  const startX = marqueeCanvasWidth - messageOffset;
  const baselineY = Math.round((marqueeCanvasHeight - marqueeGlyphHeight * marqueeDotPitch) / 2);
  context.save();
  context.beginPath();
  context.rect(
    layout.contentHorizontalInset,
    layout.contentVerticalInset,
    marqueeCanvasWidth - layout.contentHorizontalInset * 2,
    marqueeCanvasHeight - layout.contentVerticalInset * 2
  );
  context.clip();
  context.drawImage(messageCanvas, startX, baselineY);
  context.drawImage(messageCanvas, startX + marqueeMessageWidth + marqueeMessageGap, baselineY);
  context.restore();
}

function isMarqueeVisible(
  camera: THREE.Camera,
  marquee: ArcadeScreenPlacement,
  projection: THREE.Vector3
): boolean {
  camera.updateMatrixWorld();
  projection.copy(marquee.position).project(camera);
  return projection.z >= -1 && projection.z <= 1 &&
    projection.x >= -1.08 && projection.x <= 1.08 &&
    projection.y >= -1.08 && projection.y <= 1.08;
}

function drawLedBorder(
  context: CanvasRenderingContext2D,
  layout: MarqueeCanvasLayout,
  timestamp: number
): void {
  const left = layout.borderHorizontalInset;
  const right = marqueeCanvasWidth - layout.borderHorizontalInset;
  const top = layout.borderVerticalInset;
  const bottom = marqueeCanvasHeight - layout.borderVerticalInset;
  drawLedLine(context, left, top, right, top, timestamp);
  drawLedLine(context, right, top, right, bottom, timestamp);
  drawLedLine(context, right, bottom, left, bottom, timestamp);
  drawLedLine(context, left, bottom, left, top, timestamp);
}

function drawLedLine(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  timestamp: number
): void {
  const length = Math.hypot(endX - startX, endY - startY);
  const dotCount = Math.max(1, Math.round(length / 10));

  for (let index = 0; index <= dotCount; index++) {
    const progress = index / dotCount;
    drawLedDot(
      context,
      THREE.MathUtils.lerp(startX, endX, progress),
      THREE.MathUtils.lerp(startY, endY, progress),
      timestamp,
      0.86
    );
  }
}

function drawLedMessage(
  context: CanvasRenderingContext2D,
  message: string,
  startX: number,
  startY: number,
  timestamp: number
): void {
  message.toUpperCase().split('').forEach((character, characterIndex) => {
    const glyph = ledGlyphs[character] ?? ledGlyphs[' '];
    const glyphX = startX + characterIndex * marqueeCharacterAdvance;
    if (glyphX > context.canvas.width || glyphX + marqueeCharacterAdvance < 0) return;

    glyph.forEach((row, rowIndex) => {
      row.split('').forEach((pixel, columnIndex) => {
        if (pixel !== '1') return;
        const phase = characterIndex * 0.73 + rowIndex * 0.37 + columnIndex * 0.19;
        drawLedDot(
          context,
          glyphX + columnIndex * marqueeDotPitch + marqueeDotPitch / 2,
          startY + rowIndex * marqueeDotPitch + marqueeDotPitch / 2,
          timestamp + phase * 900,
          0.94
        );
      });
    });
  });
}

function drawLedDot(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  timestamp: number,
  intensity: number
): void {
  const flicker = 0.87 + Math.sin(timestamp / 170 + x * 0.03 + y * 0.08) * 0.13;
  const alpha = Math.max(0.25, Math.min(1, intensity * flicker));
  const radius = 3.1;

  context.save();
  context.shadowColor = `rgba(255, 39, 8, ${alpha * 0.9})`;
  context.shadowBlur = 7;
  context.fillStyle = `rgba(255, 58, 18, ${alpha})`;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = `rgba(255, 239, 190, ${alpha * 0.9})`;
  context.beginPath();
  context.arc(x - 0.65, y - 0.65, 0.95, 0, Math.PI * 2);
  context.fill();
  context.restore();
}
