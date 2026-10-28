"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ArcadeScreenPlacement } from "../arcade-screen";

export function CrtScreenSurface({
  screen,
  texture,
  showPreview,
  isInteractive = false,
  screenId = "pipeline",
  onActivate
}: Readonly<{
  screen: ArcadeScreenPlacement;
  texture: THREE.Texture | null;
  showPreview: boolean;
  isInteractive?: boolean;
  screenId?: string;
  onActivate: (delta: number) => void;
}>): React.ReactElement {
  const baseGeometry = useMemo(
    () => new THREE.PlaneGeometry(screen.width, screen.height),
    [screen.height, screen.width]
  );
  useEffect(() => () => baseGeometry.dispose(), [baseGeometry]);

  // Spherical convex normal vectors across flat rectangular boundaries:
  // Normals curve outward like a real spherical CRT monitor faceplate,
  // allowing specular room lighting to smoothly glide in all directions as the room is orbited,
  // while the physical perimeter remains 100% flush and rectangular with the 3D cabinet bezel.
  const glassGeometry = useMemo(
    () => createCrtGlassGeometry(screen.width, screen.height),
    [screen.height, screen.width]
  );
  useEffect(() => () => glassGeometry.dispose(), [glassGeometry]);

  return (
    <group position={screen.position} quaternion={screen.quaternion}>
      {/* Primary Screen Mesh with preview texture or live depth punch */}
      <mesh
        name={`Embedded_${screenId}_CrtSurface`}
        geometry={baseGeometry}
        onClick={(event) => {
          event.stopPropagation();
          onActivate(event.delta);
        }}
      >
        {showPreview && texture ? (
          <meshBasicMaterial
            key={`${screenId}-crt-preview`}
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
            key={`${screenId}-live-screen-depth`}
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

      {/* Dynamic Specular Glass Sheen:
          Reflects room lighting across the CRT faceplate smoothly in ALL directions
          as the user rotates or pans the room, without harsh hotspots or bezel clipping */}
      {!isInteractive ? (
        <mesh
          geometry={glassGeometry}
          position={[0, 0, 0.0003]}
          scale={[0.99, 0.99, 1]}
          raycast={() => null}
        >
          <meshPhongMaterial
            key={`${screenId}-crt-specular-sheen`}
            color="#000000"
            specular="#ffd24d"
            shininess={60}
            transparent
            opacity={0.22}
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

function createCrtGlassGeometry(width: number, height: number): THREE.PlaneGeometry {
  const segments = 16;
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
  const positions = geometry.getAttribute("position");
  const normals = geometry.getAttribute("normal");
  const sphereRadius = Math.max(width, height) * 1.5;
  const normal = new THREE.Vector3();

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    // Outward spherical normal at (x, y)
    normal.set(x / sphereRadius, y / sphereRadius, 1.0).normalize();
    normals.setXYZ(i, normal.x, normal.y, normal.z);
  }

  normals.needsUpdate = true;
  return geometry;
}
