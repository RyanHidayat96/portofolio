"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ArcadeScreenPlacement } from "../arcade-screen";

export function CrtScreenSurface({
  screen,
  screenId = "pipeline",
  onActivate
}: Readonly<{
  screen: ArcadeScreenPlacement;
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

  const materialRef = useRef<THREE.MeshPhongMaterial | null>(null);

  useFrame(({ camera }) => {
    const mat = materialRef.current;
    if (!mat) return;

    // Physically accurate distance-based specular fade:
    // When far away in the room (> 2.6m), full reflective sheen is rendered.
    // As the camera moves closer (transitioning into the screen between 2.6m and 1.15m),
    // the specular reflection smoothly and continuously dims down ("berangsur meredup").
    // When settled in front of the screen (<= 1.15m), the reflection dims to 0 so the
    // telemetry interface has 100% crystal-clear contrast and readability without any abrupt jump!
    const distance = camera.position.distanceTo(screen.position);
    const minDistance = 1.15;
    const maxDistance = 2.6;
    const fadeRatio = THREE.MathUtils.clamp(
      (distance - minDistance) / (maxDistance - minDistance),
      0,
      1
    );
    const smoothRatio = THREE.MathUtils.smootherstep(fadeRatio, 0, 1);
    const nextOpacity = 0.26 * smoothRatio;

    if (Math.abs(mat.opacity - nextOpacity) > 0.002) {
      mat.opacity = nextOpacity;
      mat.visible = nextOpacity > 0.005;
    }
  });

  return (
    <group position={screen.position} quaternion={screen.quaternion}>
      {/* Keep model depth while the live CSS3D document paints the screen. */}
      <mesh
        name={`Embedded_${screenId}_CrtSurface`}
        geometry={baseGeometry}
        onClick={(event) => {
          event.stopPropagation();
          onActivate(event.delta);
        }}
      >
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
      </mesh>

      {/* Dynamic Real-Time Specular Glass Sheen:
          Reflects 3D room lighting across the CRT faceplate smoothly in ALL directions,
          seamlessly tracking the camera transition from the room to in front of the screen */}
      <mesh
        geometry={glassGeometry}
        position={[0, 0, 0.0003]}
        scale={[0.99, 0.99, 1]}
        raycast={() => null}
      >
        <meshPhongMaterial
          ref={materialRef}
          key={`${screenId}-crt-specular-sheen`}
          color="#000000"
          specular="#ffd24d"
          shininess={60}
          transparent
          opacity={0.26}
          blending={THREE.AdditiveBlending}
          depthTest
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
          side={THREE.FrontSide}
        />
      </mesh>
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
