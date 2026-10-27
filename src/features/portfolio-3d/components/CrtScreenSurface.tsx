"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ArcadeScreenPlacement } from "../arcade-screen";

const pipelineScreenCurveDepthRatio = 0.052;
const pipelineScreenSegments = 32;

export function CrtScreenSurface({
  screen,
  texture,
  showPreview,
  isInteractive = false,
  onActivate
}: Readonly<{
  screen: ArcadeScreenPlacement;
  texture: THREE.Texture | null;
  showPreview: boolean;
  isInteractive?: boolean;
  onActivate: (delta: number) => void;
}>): React.ReactElement {
  const geometry = useMemo(
    () => createConvexScreenGeometry(screen.width, screen.height),
    [screen.height, screen.width]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group position={screen.position} quaternion={screen.quaternion}>
      {/* Primary Screen Mesh with preview texture or live depth punch */}
      <mesh
        name="Embedded_pipeline_CrtSurface"
        geometry={geometry}
        onClick={(event) => {
          event.stopPropagation();
          onActivate(event.delta);
        }}
      >
        {showPreview && texture ? (
          <meshBasicMaterial
            key="pipeline-crt-preview"
            map={texture}
            color="#ffffff"
            depthTest
            depthWrite
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
            toneMapped={false}
            fog={false}
            side={THREE.FrontSide}
          />
        ) : (
          <meshBasicMaterial
            key="pipeline-live-screen-depth"
            color="#000000"
            blending={THREE.NoBlending}
            opacity={0}
            transparent={false}
            toneMapped={false}
            fog={false}
            depthTest
            depthWrite
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
            side={THREE.FrontSide}
          />
        )}
      </mesh>

      {/* Lightweight dynamic specular glass sheen: reflects room lighting across the convex dome as the user rotates/pans */}
      {!isInteractive ? (
        <mesh geometry={geometry} position={[0, 0, 0.001]} raycast={() => null}>
          <meshPhongMaterial
            key="pipeline-crt-specular-glint"
            color="#000000"
            specular="#ffd24d"
            shininess={100}
            transparent
            opacity={0.38}
            blending={THREE.AdditiveBlending}
            depthTest
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-2}
            side={THREE.FrontSide}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function createConvexScreenGeometry(width: number, height: number): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(width, height, pipelineScreenSegments, pipelineScreenSegments);
  const positions = geometry.getAttribute("position");
  const halfWidth = Math.max(width / 2, Number.EPSILON);
  const halfHeight = Math.max(height / 2, Number.EPSILON);
  const curveDepth = Math.min(width, height) * pipelineScreenCurveDepthRatio;

  for (let index = 0; index < positions.count; index += 1) {
    const xRatio = positions.getX(index) / halfWidth;
    const yRatio = positions.getY(index) / halfHeight;
    // Cosine spherical dome creates seamless C1-continuous curvature with realistic optical normals
    const bowX = Math.cos((Math.PI / 2) * Math.min(1, Math.max(-1, xRatio)));
    const bowY = Math.cos((Math.PI / 2) * Math.min(1, Math.max(-1, yRatio)));
    const bow = Math.max(0, bowX * bowY);
    positions.setZ(index, curveDepth * bow);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
