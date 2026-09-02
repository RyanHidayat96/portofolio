import * as THREE from 'three';
import { portfolio3dCameraPresetById, portfolio3dCameraPresets } from './camera-presets';
import { getPortfolio3dRouteTarget } from './route-map';
import type {
  Portfolio3dCameraPreset,
  Portfolio3dCameraPresetId,
  Portfolio3dSectionId,
  Vector3Tuple
} from './types';

export const portfolio3dCameraBounds = {
  min: [-2.75, 0.72, -1.85],
  max: [2.95, 2.72, 5.8]
} as const satisfies Readonly<{ min: Vector3Tuple; max: Vector3Tuple }>;

export function getPortfolio3dCameraPresetForSection(
  sectionId: Portfolio3dSectionId
): Portfolio3dCameraPreset {
  const routeTarget = getPortfolio3dRouteTarget(sectionId);
  const presetId: Portfolio3dCameraPresetId = routeTarget?.cameraPresetId ?? 'overview';
  return (
    portfolio3dCameraPresets.find((preset) => preset.id === presetId) ?? portfolio3dCameraPresetById.overview
  );
}

export function constrainPortfolio3dCameraPosition(position: THREE.Vector3): THREE.Vector3 {
  position.x = THREE.MathUtils.clamp(position.x, portfolio3dCameraBounds.min[0], portfolio3dCameraBounds.max[0]);
  position.y = THREE.MathUtils.clamp(position.y, portfolio3dCameraBounds.min[1], portfolio3dCameraBounds.max[1]);
  position.z = THREE.MathUtils.clamp(position.z, portfolio3dCameraBounds.min[2], portfolio3dCameraBounds.max[2]);
  return position;
}

export function createLookAtQuaternion(position: THREE.Vector3, target: THREE.Vector3): THREE.Quaternion {
  const matrix = new THREE.Matrix4();
  matrix.lookAt(position, target, new THREE.Vector3(0, 1, 0));
  return new THREE.Quaternion().setFromRotationMatrix(matrix);
}

export function easePortfolio3dCameraTransition(progress: number): number {
  const clampedProgress = THREE.MathUtils.clamp(progress, 0, 1);
  return clampedProgress < 0.5
    ? 4 * clampedProgress * clampedProgress * clampedProgress
    : 1 - Math.pow(-2 * clampedProgress + 2, 3) / 2;
}