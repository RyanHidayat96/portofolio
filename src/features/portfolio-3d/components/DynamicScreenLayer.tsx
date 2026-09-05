'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { portfolio3dScreenPreviews } from '../screen-content';
import type { Portfolio3dAssetId, Portfolio3dScreenNodeName } from '../types';
import type { AssetRuntimeNodeMap } from './SceneAsset';

type RuntimeNodesByAsset = Readonly<Partial<Record<Portfolio3dAssetId, AssetRuntimeNodeMap>>>;

type ScreenPreview = (typeof portfolio3dScreenPreviews)[number];

interface ScreenMaterialBinding {
  readonly mesh: THREE.Mesh;
  readonly originalMaterial: THREE.Material | THREE.Material[];
  readonly previewMaterial: THREE.Material;
}

const screenCanvasWidth = 512;
const screenCanvasHeight = 288;

export function DynamicScreenLayer({
  runtimeNodesByAsset
}: Readonly<{
  runtimeNodesByAsset: RuntimeNodesByAsset;
}>): React.ReactElement {
  return (
    <>
      {portfolio3dScreenPreviews.map((preview) => (
        <DynamicScreenBinding
          key={preview.screenNodeName}
          preview={preview}
          screen={findRuntimeScreen(preview.screenNodeName, runtimeNodesByAsset)}
        />
      ))}
    </>
  );
}

function DynamicScreenBinding({
  preview,
  screen
}: Readonly<{
  preview: ScreenPreview;
  screen?: THREE.Object3D;
}>): null {
  const { invalidate } = useThree();

  useEffect(() => {
    if (!screen) {
      return;
    }

    const bindings: ScreenMaterialBinding[] = [];

    collectScreenMeshes(screen).forEach((mesh) => {
      const originalMaterial = mesh.material;
      const previewMaterial = createPreviewMaterial(originalMaterial, preview);

      mesh.material = Array.isArray(originalMaterial)
        ? [previewMaterial, ...originalMaterial.slice(1)]
        : previewMaterial;
      mesh.renderOrder = Math.max(mesh.renderOrder, 4);
      mesh.userData.portfolio3dDynamicScreen = preview.screenNodeName;

      bindings.push({ mesh, originalMaterial, previewMaterial });
    });

    if (bindings.length > 0) {
      invalidate();
    }

    return () => {
      bindings.forEach(({ mesh, originalMaterial, previewMaterial }) => {
        mesh.material = originalMaterial;
        disposeScreenMaterial(previewMaterial);
      });
      invalidate();
    };
  }, [invalidate, preview, screen]);

  return null;
}

function findRuntimeScreen(
  screenNodeName: Portfolio3dScreenNodeName,
  runtimeNodesByAsset: RuntimeNodesByAsset
): THREE.Object3D | undefined {
  for (const nodes of Object.values(runtimeNodesByAsset)) {
    const screen = nodes?.screens.get(screenNodeName);
    if (screen) {
      return screen;
    }
  }

  return undefined;
}

function collectScreenMeshes(screen: THREE.Object3D): readonly THREE.Mesh[] {
  if (screen instanceof THREE.Mesh) {
    return [screen];
  }

  const meshes: THREE.Mesh[] = [];
  screen.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes.push(child);
    }
  });

  return meshes;
}

function createPreviewMaterial(
  originalMaterial: THREE.Material | THREE.Material[],
  preview: ScreenPreview
): THREE.Material {
  const sourceMaterial = Array.isArray(originalMaterial) ? originalMaterial[0] : originalMaterial;
  const texture = createPreviewTexture(preview);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  if (sourceMaterial instanceof THREE.MeshStandardMaterial) {
    const material = sourceMaterial.clone();
    material.map = texture;
    material.emissive = new THREE.Color(preview.accent);
    material.emissiveMap = texture;
    material.emissiveIntensity = 0.28;
    material.metalness = Math.min(material.metalness, 0.18);
    material.roughness = Math.max(material.roughness, 0.58);
    material.transparent = true;
    material.opacity = Math.max(material.opacity, 0.94);
    material.needsUpdate = true;

    return material;
  }

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: '#ffffff',
    toneMapped: false,
    transparent: true,
    opacity: 0.96
  });
  material.needsUpdate = true;

  return material;
}

function createPreviewTexture(preview: ScreenPreview): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = screenCanvasWidth;
  canvas.height = screenCanvasHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  drawPreviewCanvas(context, preview);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 2;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

function drawPreviewCanvas(context: CanvasRenderingContext2D, preview: ScreenPreview): void {
  const gradient = context.createLinearGradient(0, 0, screenCanvasWidth, screenCanvasHeight);
  gradient.addColorStop(0, '#07111a');
  gradient.addColorStop(0.58, '#0b1721');
  gradient.addColorStop(1, '#081018');
  context.fillStyle = gradient;
  context.fillRect(0, 0, screenCanvasWidth, screenCanvasHeight);

  drawGrid(context);

  context.strokeStyle = withAlpha(preview.accent, 0.72);
  context.lineWidth = 2;
  context.strokeRect(20, 20, screenCanvasWidth - 40, screenCanvasHeight - 40);

  context.fillStyle = preview.accent;
  context.font = '600 18px monospace';
  context.fillText(preview.eyebrow.toUpperCase(), 38, 52);

  context.fillStyle = '#eaf2ff';
  context.font = '700 36px Inter, Arial, sans-serif';
  wrapCanvasText(context, preview.title, 38, 100, 420, 39, 2);

  const lineStartY = 168;
  preview.lines.slice(0, 4).forEach((line, index) => {
    const y = lineStartY + index * 25;
    context.fillStyle = withAlpha(preview.accent, 0.92);
    context.fillRect(38, y - 8, 14, 2);
    context.fillStyle = '#aeb9ca';
    context.font = '500 16px Inter, Arial, sans-serif';
    context.fillText(truncateText(context, line, 398), 62, y);
  });

  context.fillStyle = withAlpha(preview.accent, 0.18);
  context.beginPath();
  context.arc(444, 58, 28, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = withAlpha(preview.accent, 0.86);
  context.lineWidth = 2;
  context.stroke();
}

function drawGrid(context: CanvasRenderingContext2D): void {
  context.save();
  context.strokeStyle = 'rgba(116, 155, 179, 0.12)';
  context.lineWidth = 1;

  for (let x = 0; x <= screenCanvasWidth; x += 64) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, screenCanvasHeight);
    context.stroke();
  }

  for (let y = 0; y <= screenCanvasHeight; y += 54) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(screenCanvasWidth, y);
    context.stroke();
  }

  context.restore();
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): void {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;

  for (const [index, word] of words.entries()) {
    const testLine = line ? `${line} ${word}` : word;
    const isLastWord = index === words.length - 1;

    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, y + lineCount * lineHeight);
      line = word;
      lineCount += 1;
    } else {
      line = testLine;
    }

    if ((isLastWord || lineCount >= maxLines - 1) && line && lineCount < maxLines) {
      context.fillText(truncateText(context, line, maxWidth), x, y + lineCount * lineHeight);
      line = '';
      lineCount += 1;
    }
  }
}

function truncateText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (context.measureText(text).width <= maxWidth) {
    return text;
  }

  let value = text;
  while (value.length > 3 && context.measureText(`${value}...`).width > maxWidth) {
    value = value.slice(0, -1);
  }

  return `${value}...`;
}

function withAlpha(hexColor: string, alpha: number): string {
  const hex = hexColor.replace('#', '');
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function disposeScreenMaterial(material: THREE.Material): void {
  const mappedMaterial = material as THREE.Material & {
    readonly map?: THREE.Texture;
    readonly emissiveMap?: THREE.Texture;
  };
  const map = mappedMaterial.map;
  const emissiveMap = mappedMaterial.emissiveMap;

  if (map) {
    map.dispose();
  }

  if (emissiveMap && emissiveMap !== map) {
    emissiveMap.dispose();
  }

  material.dispose();
}
