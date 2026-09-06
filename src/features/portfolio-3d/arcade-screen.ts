import * as THREE from 'three';

export type EmbeddedScreenId = 'pipeline' | 'automation';

export interface ArcadeScreenPlacement {
  readonly position: THREE.Vector3;
  readonly quaternion: THREE.Quaternion;
  readonly normal: THREE.Vector3;
  readonly width: number;
  readonly height: number;
}

export function resolveArcadeScreen(root: THREE.Object3D): ArcadeScreenPlacement | undefined {
  return resolveScreenByMaterial(root, ['gaming_mashine', 'gaming mashine'], 'Material.013');
}

export function resolveAutomationScreen(root: THREE.Object3D): ArcadeScreenPlacement | undefined {
  return resolveScreenByMaterial(root, [], 'screen.002');
}

function resolveScreenByMaterial(
  root: THREE.Object3D,
  nodeNames: readonly string[],
  materialName: string
): ArcadeScreenPlacement | undefined {
  // GLTFLoader sanitizes spaces in Blender node names.
  const cabinet = nodeNames.length > 0
    ? nodeNames.map((nodeName) => root.getObjectByName(nodeName)).find(Boolean)
    : root;
  let screen: THREE.Mesh | undefined;
  cabinet?.traverse((object) => {
    const materials = object instanceof THREE.Mesh
      ? Array.isArray(object.material) ? object.material : [object.material]
      : [];
    if (object instanceof THREE.Mesh && materials.some((material) => material.name === materialName)) {
      screen = object;
    }
  });
  if (!screen) return undefined;

  const positions = screen.geometry.getAttribute('position');
  if (!positions || positions.count === 0) return undefined;
  screen.updateWorldMatrix(true, false);
  screen.geometry.computeBoundingBox();
  const bounds = screen.geometry.boundingBox!;
  const top = new THREE.Vector3();
  const bottom = new THREE.Vector3();
  const vertex = new THREE.Vector3();
  let topCount = 0;
  let bottomCount = 0;

  // Fit the authored CRT rim; the center bulges beyond its outer corners.
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    if (Math.abs(vertex.y - bounds.max.y) < 0.001) {
      top.add(vertex);
      topCount++;
    }
    if (Math.abs(vertex.y - bounds.min.y) < 0.001) {
      bottom.add(vertex);
      bottomCount++;
    }
  }
  if (!topCount || !bottomCount) return undefined;
  top.divideScalar(topCount).setZ((bounds.min.z + bounds.max.z) / 2);
  bottom.divideScalar(bottomCount).setZ(top.z);
  const center = top.clone().add(bottom).multiplyScalar(0.5);
  const up = top.clone().sub(bottom);
  const right = new THREE.Vector3(0, 0, -1);
  const normal = new THREE.Vector3().crossVectors(right, up).normalize();
  let front = -Infinity;
  for (let i = 0; i < positions.count; i++) {
    front = Math.max(front, vertex.fromBufferAttribute(positions, i).dot(normal));
  }
  center.addScaledVector(normal, front - center.dot(normal) + 0.006);

  const position = center.clone().applyMatrix4(screen.matrixWorld);
  const worldRight = center.clone().addScaledVector(right, bounds.max.z - bounds.min.z)
    .applyMatrix4(screen.matrixWorld).sub(position);
  const worldUp = center.clone().add(up).applyMatrix4(screen.matrixWorld).sub(position);
  const width = worldRight.length() * 0.98;
  const height = worldUp.length() * 0.98;
  if (width <= 0 || height <= 0) return undefined;
  worldRight.normalize();
  worldUp.normalize();
  const worldNormal = new THREE.Vector3().crossVectors(worldRight, worldUp).normalize();

  return {
    position,
    quaternion: new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(worldRight, worldUp, worldNormal)
    ),
    normal: worldNormal,
    width,
    height
  };
}

export function getArcadeCameraPosition(
  screen: ArcadeScreenPlacement,
  aspect: number,
  fov: number
): THREE.Vector3 {
  const tangent = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const distance = Math.max(
    screen.height / (2 * tangent * 0.72),
    screen.width / (2 * tangent * Math.max(aspect, 0.1) * 0.88)
  );
  return screen.position.clone().addScaledVector(screen.normal, distance);
}
