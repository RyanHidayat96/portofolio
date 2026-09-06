import * as THREE from 'three';

export type EmbeddedScreenId = 'profile' | 'experience' | 'architecture' | 'pipeline' | 'automation' | 'performance' | 'backend' | 'terminal' | 'contact';

export interface ArcadeScreenPlacement {
  readonly position: THREE.Vector3;
  readonly quaternion: THREE.Quaternion;
  readonly normal: THREE.Vector3;
  readonly width: number;
  readonly height: number;
}

// Artwork screens sit inside the GLB's physical picture frames, not over their outer edge.
const profileArtworkContentInset = 0.965;
const experienceArtworkContentInset = 0.96;
const architectureArtworkContentInset = 0.9;
const contactBookContentInset = 0.78;

export function resolveArcadeScreen(root: THREE.Object3D): ArcadeScreenPlacement | undefined {
  return resolveScreenByMaterial(root, ['gaming_mashine', 'gaming mashine'], 'Material.013');
}

export function resolveAutomationScreen(root: THREE.Object3D): ArcadeScreenPlacement | undefined {
  return resolveScreenByMaterial(root, [], 'screen.002');
}

export function resolvePerformanceScreen(root: THREE.Object3D): ArcadeScreenPlacement | undefined {
  return resolveScreenByMaterial(root, [], 'screen.001');
}

export function resolveApiScreen(root: THREE.Object3D): ArcadeScreenPlacement | undefined {
  return resolveScreenByMaterial(root, [], 'Material');
}

export function resolveTerminalScreen(root: THREE.Object3D): ArcadeScreenPlacement | undefined {
  return resolveScreenByMaterial(root, [], 'screen');
}

export function resolveProfileArtworkScreen(root: THREE.Object3D): ArcadeScreenPlacement | undefined {
  return resolveArtworkScreen(root, 'poster 3', profileArtworkContentInset);
}

export function resolveExperienceArtworkScreen(root: THREE.Object3D): ArcadeScreenPlacement | undefined {
  return resolveArtworkScreen(root, 'poster 2', experienceArtworkContentInset);
}

export function resolveArchitectureArtworkScreen(root: THREE.Object3D): ArcadeScreenPlacement | undefined {
  return resolveArtworkScreen(root, 'poster', architectureArtworkContentInset);
}

export function resolveContactBookScreen(root: THREE.Object3D): ArcadeScreenPlacement | undefined {
  return resolveArtworkScreen(root, 'RealisticNotebookAndPaper', contactBookContentInset);
}

function resolveArtworkScreen(
  root: THREE.Object3D,
  materialName: string,
  contentInset = 0.98,
  surfaceOffset = 0.006
): ArcadeScreenPlacement | undefined {
  const artwork = findScreenMesh(root, [], materialName);
  if (!artwork) return undefined;

  const placement = resolveArtworkScreenPlacement(artwork, materialName, contentInset, surfaceOffset)
    ?? resolveMaterialScreenPlacement(artwork, materialName)
    ?? resolveWholeMeshScreenPlacement(artwork);

  return placement
    ? orientScreenUpright(
      orientScreenTowardPoint(placement, new THREE.Vector3(0, placement.position.y, 0))
    )
    : undefined;
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
  const screen = findScreenMesh(cabinet, [], materialName);
  if (!screen) return undefined;

  return resolveMaterialScreenPlacement(screen, materialName)
    ?? resolveWholeMeshScreenPlacement(screen);
}

function findScreenMesh(
  root: THREE.Object3D | undefined,
  nodeNames: readonly string[],
  materialName: string
): THREE.Mesh | undefined {
  const container = nodeNames.length > 0
    ? nodeNames.map((nodeName) => root?.getObjectByName(nodeName)).find(Boolean)
    : root;
  let screen: THREE.Mesh | undefined;
  container?.traverse((object) => {
    const materials = object instanceof THREE.Mesh
      ? Array.isArray(object.material) ? object.material : [object.material]
      : [];
    if (object instanceof THREE.Mesh && materials.some((material) => material.name === materialName)) {
      screen = object;
    }
  });
  return screen;
}

function resolveArtworkScreenPlacement(
  screen: THREE.Mesh,
  materialName: string,
  contentInset: number,
  surfaceOffset: number
): ArcadeScreenPlacement | undefined {
  const fallback = resolveMaterialScreenPlacement(screen, materialName);
  const geometry = screen.geometry;
  const positions = geometry.getAttribute('position');
  const uvs = geometry.getAttribute('uv');
  if (!fallback || !positions || !uvs) return fallback;

  const materials = Array.isArray(screen.material) ? screen.material : [screen.material];
  const materialIndexes = new Set<number>();
  materials.forEach((material, index) => {
    if (material.name === materialName) materialIndexes.add(index);
  });
  const triangles = collectMaterialTriangles(geometry, materialIndexes);
  const textureRight = getTextureRightAxis(positions, uvs, triangles);
  if (!textureRight) return fallback;

  screen.updateWorldMatrix(true, false);
  const right = textureRight.transformDirection(screen.matrixWorld)
    .projectOnPlane(fallback.normal)
    .normalize();
  if (right.lengthSq() < 0.000001) return fallback;

  const up = new THREE.Vector3().crossVectors(fallback.normal, right).normalize();
  const vertices = triangles.flatMap(([ai, bi, ci]) => [
    new THREE.Vector3().fromBufferAttribute(positions, ai).applyMatrix4(screen.matrixWorld),
    new THREE.Vector3().fromBufferAttribute(positions, bi).applyMatrix4(screen.matrixWorld),
    new THREE.Vector3().fromBufferAttribute(positions, ci).applyMatrix4(screen.matrixWorld)
  ]);
  const ranges = getProjectionRanges(vertices, right, up, fallback.normal);
  const width = ranges.right.max - ranges.right.min;
  const height = ranges.up.max - ranges.up.min;
  if (width <= 0 || height <= 0) return fallback;

  const position = right.clone().multiplyScalar((ranges.right.min + ranges.right.max) / 2)
    .add(up.clone().multiplyScalar((ranges.up.min + ranges.up.max) / 2))
    .add(fallback.normal.clone().multiplyScalar(ranges.normal.max + surfaceOffset));

  return {
    position,
    quaternion: new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(right, up, fallback.normal)
    ),
    normal: fallback.normal,
    width: width * contentInset,
    height: height * contentInset
  };
}

function getTextureRightAxis(
  positions: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  uvs: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  triangles: readonly (readonly [number, number, number])[]
): THREE.Vector3 | undefined {
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();

  for (const [ai, bi, ci] of triangles) {
    a.fromBufferAttribute(positions, ai);
    b.fromBufferAttribute(positions, bi);
    c.fromBufferAttribute(positions, ci);
    const du1 = uvs.getX(bi) - uvs.getX(ai);
    const dv1 = uvs.getY(bi) - uvs.getY(ai);
    const du2 = uvs.getX(ci) - uvs.getX(ai);
    const dv2 = uvs.getY(ci) - uvs.getY(ai);
    const determinant = du1 * dv2 - du2 * dv1;
    if (Math.abs(determinant) < 0.000001) continue;

    const tangent = new THREE.Vector3()
      .subVectors(b, a)
      .multiplyScalar(dv2)
      .sub(new THREE.Vector3().subVectors(c, a).multiplyScalar(dv1))
      .multiplyScalar(1 / determinant);
    if (tangent.lengthSq() > 0.000001) return tangent.normalize();
  }

  return undefined;
}

function resolveMaterialScreenPlacement(
  screen: THREE.Mesh,
  materialName: string
): ArcadeScreenPlacement | undefined {
  const geometry = screen.geometry;
  const positions = geometry.getAttribute('position');
  if (!positions || positions.count === 0) return undefined;

  const materials = Array.isArray(screen.material) ? screen.material : [screen.material];
  const materialIndexes = new Set<number>();
  materials.forEach((material, index) => {
    if (material.name === materialName) {
      materialIndexes.add(index);
    }
  });
  if (materialIndexes.size === 0) return undefined;

  const triangles = collectMaterialTriangles(geometry, materialIndexes);
  if (triangles.length === 0) return undefined;

  const vertices: THREE.Vector3[] = [];
  const normal = new THREE.Vector3();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();

  triangles.forEach(([ai, bi, ci]) => {
    a.fromBufferAttribute(positions, ai);
    b.fromBufferAttribute(positions, bi);
    c.fromBufferAttribute(positions, ci);
    vertices.push(a.clone(), b.clone(), c.clone());
    normal.add(new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)));
  });

  if (normal.lengthSq() < 0.000001) return undefined;
  normal.normalize();

  let up = new THREE.Vector3(0, 1, 0).projectOnPlane(normal);
  if (up.lengthSq() < 0.000001) {
    up = new THREE.Vector3(0, 0, 1).projectOnPlane(normal);
  }
  if (up.lengthSq() < 0.000001) return undefined;
  up.normalize();

  const right = new THREE.Vector3().crossVectors(up, normal).normalize();
  const ranges = getProjectionRanges(vertices, right, up, normal);
  const width = ranges.right.max - ranges.right.min;
  const height = ranges.up.max - ranges.up.min;
  if (width <= 0 || height <= 0) return undefined;

  const center = right.clone().multiplyScalar((ranges.right.min + ranges.right.max) / 2)
    .add(up.clone().multiplyScalar((ranges.up.min + ranges.up.max) / 2))
    .add(normal.clone().multiplyScalar(ranges.normal.max + 0.006));

  return toWorldScreenPlacement(screen, center, right, up, width, height);
}

function collectMaterialTriangles(
  geometry: THREE.BufferGeometry,
  materialIndexes: ReadonlySet<number>
): Array<readonly [number, number, number]> {
  const index = geometry.index;
  const triangles: Array<readonly [number, number, number]> = [];
  const groups = geometry.groups.length > 0
    ? geometry.groups
    : [{ start: 0, count: index ? index.count : geometry.getAttribute('position').count, materialIndex: 0 }];

  groups.forEach((group) => {
    if (!materialIndexes.has(group.materialIndex ?? 0)) return;

    const end = group.start + group.count;
    for (let offset = group.start; offset + 2 < end; offset += 3) {
      triangles.push(index
        ? [index.getX(offset), index.getX(offset + 1), index.getX(offset + 2)]
        : [offset, offset + 1, offset + 2]);
    }
  });

  return triangles;
}

function getProjectionRanges(
  vertices: readonly THREE.Vector3[],
  right: THREE.Vector3,
  up: THREE.Vector3,
  normal: THREE.Vector3
): {
  readonly right: { min: number; max: number };
  readonly up: { min: number; max: number };
  readonly normal: { min: number; max: number };
} {
  const ranges = {
    right: { min: Infinity, max: -Infinity },
    up: { min: Infinity, max: -Infinity },
    normal: { min: Infinity, max: -Infinity }
  };

  vertices.forEach((vertex) => {
    const rightValue = vertex.dot(right);
    const upValue = vertex.dot(up);
    const normalValue = vertex.dot(normal);
    ranges.right.min = Math.min(ranges.right.min, rightValue);
    ranges.right.max = Math.max(ranges.right.max, rightValue);
    ranges.up.min = Math.min(ranges.up.min, upValue);
    ranges.up.max = Math.max(ranges.up.max, upValue);
    ranges.normal.min = Math.min(ranges.normal.min, normalValue);
    ranges.normal.max = Math.max(ranges.normal.max, normalValue);
  });

  return ranges;
}

function toWorldScreenPlacement(
  screen: THREE.Mesh,
  center: THREE.Vector3,
  right: THREE.Vector3,
  up: THREE.Vector3,
  width: number,
  height: number
): ArcadeScreenPlacement | undefined {
  screen.updateWorldMatrix(true, false);
  const position = center.clone().applyMatrix4(screen.matrixWorld);
  const worldRight = center.clone().addScaledVector(right, width)
    .applyMatrix4(screen.matrixWorld).sub(position);
  const worldUp = center.clone().addScaledVector(up, height)
    .applyMatrix4(screen.matrixWorld).sub(position);
  const worldWidth = worldRight.length() * 0.98;
  const worldHeight = worldUp.length() * 0.98;
  if (worldWidth <= 0 || worldHeight <= 0) return undefined;
  worldRight.normalize();
  worldUp.normalize();
  const worldNormal = new THREE.Vector3().crossVectors(worldRight, worldUp).normalize();

  return {
    position,
    quaternion: new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(worldRight, worldUp, worldNormal)
    ),
    normal: worldNormal,
    width: worldWidth,
    height: worldHeight
  };
}

function orientScreenTowardPoint(
  screen: ArcadeScreenPlacement,
  point: THREE.Vector3
): ArcadeScreenPlacement {
  const towardPoint = point.clone().sub(screen.position);
  if (screen.normal.dot(towardPoint) >= 0) {
    return screen;
  }

  const normal = screen.normal.clone().negate().normalize();
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(screen.quaternion).normalize();
  const right = new THREE.Vector3().crossVectors(up, normal).normalize();

  return {
    ...screen,
    position: screen.position.clone().addScaledVector(normal, 0.012),
    normal,
    quaternion: new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(right, up, normal)
    )
  };
}

function orientScreenUpright(screen: ArcadeScreenPlacement): ArcadeScreenPlacement {
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(screen.quaternion);
  if (up.y >= 0) {
    return screen;
  }

  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(screen.quaternion).negate();
  const upright = up.negate();

  return {
    ...screen,
    quaternion: new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(right, upright, screen.normal)
    )
  };
}

function resolveWholeMeshScreenPlacement(screen: THREE.Mesh): ArcadeScreenPlacement | undefined {
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

export type ArcadeScreenCoverage = Readonly<{
  horizontalCoverage: number;
  verticalCoverage: number;
}>;

const defaultArcadeScreenCoverage: ArcadeScreenCoverage = {
  horizontalCoverage: 0.88,
  verticalCoverage: 0.72
};

export function getArcadeCameraPosition(
  screen: ArcadeScreenPlacement,
  aspect: number,
  fov: number,
  coverage: ArcadeScreenCoverage = defaultArcadeScreenCoverage
): THREE.Vector3 {
  const horizontalCoverage = Math.max(coverage.horizontalCoverage, 0.1);
  const verticalCoverage = Math.max(coverage.verticalCoverage, 0.1);
  const tangent = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const distance = Math.max(
    screen.height / (2 * tangent * verticalCoverage),
    screen.width / (2 * tangent * Math.max(aspect, 0.1) * horizontalCoverage)
  );
  return screen.position.clone().addScaledVector(screen.normal, distance);
}
