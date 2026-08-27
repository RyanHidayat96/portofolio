"use client";

import type {
  EngineeringCoreEdge,
  EngineeringCoreNode,
  EngineeringCoreNodeId,
  EngineeringCoreNodeTone
} from "@/features/workspace/engineering-core-data";
import { isEngineeringCoreEdgeActive } from "@/features/workspace/engineering-core-data";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export interface EngineeringCore3DProps {
  readonly nodes: readonly EngineeringCoreNode[];
  readonly edges: readonly EngineeringCoreEdge[];
  readonly activeNodeId: EngineeringCoreNodeId;
  readonly onNodeSelect: (nodeId: EngineeringCoreNodeId) => void;
}

export function EngineeringCore3D({
  nodes,
  edges,
  activeNodeId,
  onNodeSelect
}: EngineeringCore3DProps): React.ReactElement {
  return (
    <>
      <div className="hero-core-3d-shell" aria-hidden="true">
        <Canvas
          className="hero-core-canvas"
          dpr={[1, 1.25]}
          performance={{ min: 0.6, debounce: 240 }}
          camera={{ position: [0, 0, 6.8], fov: 46 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <EngineeringCoreScene
            nodes={nodes}
            edges={edges}
            activeNodeId={activeNodeId}
            onNodeSelect={onNodeSelect}
          />
        </Canvas>
      </div>

      <div className="hero-core-3d-controls" role="group" aria-label="Engineering core nodes">
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            aria-pressed={node.id === activeNodeId}
            data-active={node.id === activeNodeId}
            data-cursor-intent="node"
            data-cursor-label="NODE"
            onClick={() => onNodeSelect(node.id)}
          >
            {node.label}
          </button>
        ))}
      </div>
    </>
  );
}

function EngineeringCoreScene({
  nodes,
  edges,
  activeNodeId,
  onNodeSelect
}: EngineeringCore3DProps): React.ReactElement {
  const groupRef = useRef<THREE.Group>(null);
  const activeNode = nodes.find((node) => node.id === activeNodeId) ?? nodes[0];
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  useFrame(({ camera, pointer, clock }) => {
    const group = groupRef.current;
    if (group) {
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, pointer.y * 0.08, 0.055);
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, pointer.x * 0.12, 0.055);
      group.position.y = Math.sin(clock.elapsedTime * 0.45) * 0.035;
    }

    if (activeNode) {
      const [x, y] = activeNode.position;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, x * 0.12, 0.04);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, y * 0.08, 0.04);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 6.35, 0.04);
      camera.lookAt(x * 0.08, y * 0.06, 0);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.62} />
      <pointLight position={[0, 2.6, 3.4]} intensity={6.8} color="#55d7ff" />
      <pointLight position={[-3.2, -1.8, 2.4]} intensity={2.1} color="#6ee7a8" />
      <directionalLight position={[3.5, 2, 4]} intensity={2.4} color="#ffffff" />

      <CorePlane />

      {edges.map((edge) => {
        const source = nodeById.get(edge.source);
        const target = nodeById.get(edge.target);
        if (!source || !target) {
          return null;
        }

        return (
          <CoreConnection
            key={edge.id}
            source={source}
            target={target}
            isActive={isEngineeringCoreEdgeActive(edge, activeNodeId)}
          />
        );
      })}

      {nodes.map((node) => (
        <CoreNode
          key={node.id}
          node={node}
          isActive={node.id === activeNodeId}
          isDimmed={
            node.id !== activeNodeId &&
            !edges.some(
              (edge) =>
                isEngineeringCoreEdgeActive(edge, activeNodeId) &&
                (edge.source === node.id || edge.target === node.id)
            )
          }
          onSelect={() => onNodeSelect(node.id)}
        />
      ))}
    </group>
  );
}

function CorePlane(): React.ReactElement {
  return (
    <group position={[0, -0.12, -0.32]} rotation={[0, 0, 0]}>
      <mesh rotation={[-0.18, 0, 0]}>
        <planeGeometry args={[5.8, 5.4, 8, 8]} />
        <meshStandardMaterial
          color="#08111a"
          roughness={0.86}
          metalness={0.18}
          transparent
          opacity={0.38}
          wireframe
        />
      </mesh>
      <mesh position={[0, 0, -0.05]} rotation={[-0.18, 0, 0]}>
        <planeGeometry args={[5.8, 5.4]} />
        <meshStandardMaterial
          color="#061018"
          roughness={0.92}
          metalness={0.08}
          transparent
          opacity={0.24}
        />
      </mesh>
    </group>
  );
}

function CoreConnection({
  source,
  target,
  isActive
}: Readonly<{
  source: EngineeringCoreNode;
  target: EngineeringCoreNode;
  isActive: boolean;
}>): React.ReactElement {
  const positions = useMemo(
    () => new Float32Array([...source.position, ...target.position]),
    [source.position, target.position]
  );

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color={isActive ? "#55d7ff" : "#273449"}
        transparent
        opacity={isActive ? 0.94 : 0.36}
      />
    </line>
  );
}

function CoreNode({
  node,
  isActive,
  isDimmed,
  onSelect
}: Readonly<{
  node: EngineeringCoreNode;
  isActive: boolean;
  isDimmed: boolean;
  onSelect: () => void;
}>): React.ReactElement {
  const tone = getToneColors(node.tone);
  const scale = isActive ? 1.18 : 1;
  const opacity = isDimmed ? 0.42 : 1;

  return (
    <group
      position={node.position}
      scale={scale}
      onClick={onSelect}
      onPointerOver={onSelect}
    >
      <mesh>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          color={tone.color}
          emissive={tone.emissive}
          emissiveIntensity={isActive ? 1.1 : 0.42}
          roughness={0.34}
          metalness={0.54}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.27, 32]} />
        <meshBasicMaterial
          color={tone.color}
          transparent
          opacity={isActive ? 0.5 : 0.18}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function getToneColors(tone: EngineeringCoreNodeTone): { color: string; emissive: string } {
  if (tone === "quality") {
    return { color: "#6ee7a8", emissive: "#184b34" };
  }

  if (tone === "ship") {
    return { color: "#ffd36e", emissive: "#5a4218" };
  }

  if (tone === "data") {
    return { color: "#9bbcff", emissive: "#1e2d53" };
  }

  return { color: "#55d7ff", emissive: "#123d4b" };
}
