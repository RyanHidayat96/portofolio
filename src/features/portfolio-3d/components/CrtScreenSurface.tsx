"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ArcadeScreenPlacement } from "../arcade-screen";

const pipelineScreenCurveDepthRatio = 0.028;
const pipelineScreenSegments = 24;

export function CrtScreenSurface({
  screen,
  texture,
  showPreview,
  onActivate
}: Readonly<{
  screen: ArcadeScreenPlacement;
  texture: THREE.Texture | null;
  showPreview: boolean;
  onActivate: (delta: number) => void;
}>): React.ReactElement {
  const geometry = useMemo(
    () => createConvexScreenGeometry(screen.width, screen.height),
    [screen.height, screen.width]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group position={screen.position} quaternion={screen.quaternion}>
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
    const horizontal = positions.getX(index) / halfWidth;
    const vertical = positions.getY(index) / halfHeight;
    const bow = Math.max(0, 1 - horizontal * horizontal) * Math.max(0, 1 - vertical * vertical);
    positions.setZ(index, curveDepth * bow);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
