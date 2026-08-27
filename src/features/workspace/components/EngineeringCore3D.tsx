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
      <pointLight position={[-3.2, -1.8, 2.4]} intensity={1.45} color="#90a4bf" />
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
        color={isActive ? "#87e8ff" : "#243044"}
        transparent
        opacity={isActive ? 0.92 : 0.28}
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
  const scale = isActive ? 1.08 : 1;
  const moduleOpacity = isDimmed ? 0.5 : 0.96;
  const edgeOpacity = isActive ? 0.72 : isDimmed ? 0.18 : 0.34;
  const signalOpacity = isActive ? 0.92 : isDimmed ? 0.28 : 0.52;

  return (
    <group position={node.position} scale={scale}>
      <mesh onClick={onSelect} onPointerOver={onSelect}>
        <boxGeometry args={[1.08, 0.72, 0.34]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh>
        <boxGeometry args={[0.86, 0.42, 0.16]} />
        <meshStandardMaterial
          color={isActive ? "#102335" : "#08111b"}
          emissive={tone.emissive}
          emissiveIntensity={isActive ? 0.38 : 0.12}
          roughness={0.52}
          metalness={0.34}
          transparent
          opacity={moduleOpacity}
        />
      </mesh>

      <mesh scale={[1.04, 1.08, 1.08]}>
        <boxGeometry args={[0.86, 0.42, 0.16]} />
        <meshBasicMaterial color={tone.accent} wireframe transparent opacity={edgeOpacity} />
      </mesh>

      <CoreNodeGlyph
        nodeId={node.id}
        tone={tone}
        isDimmed={isDimmed}
        signalOpacity={signalOpacity}
        edgeOpacity={edgeOpacity}
      />
    </group>
  );
}

function CoreNodeGlyph({
  nodeId,
  tone,
  isDimmed,
  signalOpacity,
  edgeOpacity
}: Readonly<{
  nodeId: EngineeringCoreNodeId;
  tone: CoreToneColors;
  isDimmed: boolean;
  signalOpacity: number;
  edgeOpacity: number;
}>): React.ReactElement {
  const textOpacity = isDimmed ? 0.2 : 0.48;
  const mutedOpacity = isDimmed ? 0.18 : 0.38;

  if (nodeId === "frontend") {
    return (
      <group>
        <mesh position={[0, 0.04, 0.105]}>
          <boxGeometry args={[0.48, 0.25, 0.03]} />
          <meshBasicMaterial color={tone.accent} wireframe transparent opacity={edgeOpacity + 0.2} />
        </mesh>
        <mesh position={[0, -0.13, 0.11]}>
          <boxGeometry args={[0.12, 0.08, 0.035]} />
          <meshBasicMaterial color={tone.accent} transparent opacity={signalOpacity * 0.74} />
        </mesh>
        <mesh position={[0, -0.21, 0.11]}>
          <boxGeometry args={[0.32, 0.035, 0.035]} />
          <meshBasicMaterial color="#dbe7ff" transparent opacity={textOpacity} />
        </mesh>
      </group>
    );
  }

  if (nodeId === "api") {
    return (
      <group>
        <mesh position={[-0.25, 0, 0.11]}>
          <boxGeometry args={[0.06, 0.3, 0.035]} />
          <meshBasicMaterial color={tone.accent} transparent opacity={signalOpacity} />
        </mesh>
        <mesh position={[0.25, 0, 0.11]}>
          <boxGeometry args={[0.06, 0.3, 0.035]} />
          <meshBasicMaterial color={tone.accent} transparent opacity={signalOpacity} />
        </mesh>
        <mesh position={[0, 0.11, 0.11]}>
          <boxGeometry args={[0.35, 0.035, 0.035]} />
          <meshBasicMaterial color="#dbe7ff" transparent opacity={textOpacity} />
        </mesh>
        <mesh position={[0, -0.11, 0.11]}>
          <boxGeometry args={[0.35, 0.035, 0.035]} />
          <meshBasicMaterial color="#90a4bf" transparent opacity={mutedOpacity} />
        </mesh>
      </group>
    );
  }

  if (nodeId === "backend") {
    return (
      <group>
        {[-0.13, 0, 0.13].map((y, index) => (
          <group key={y} position={[0, y, 0.11]}>
            <mesh>
              <boxGeometry args={[0.5, 0.075, 0.035]} />
              <meshBasicMaterial color={index === 1 ? tone.accent : "#dbe7ff"} transparent opacity={index === 1 ? signalOpacity : textOpacity} />
            </mesh>
            <mesh position={[-0.27, 0, 0.005]}>
              <boxGeometry args={[0.045, 0.045, 0.035]} />
              <meshBasicMaterial color={tone.accent} transparent opacity={signalOpacity} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (nodeId === "test") {
    return (
      <group>
        <mesh position={[0, 0.01, 0.105]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.36, 0.36, 0.025]} />
          <meshBasicMaterial color={tone.accent} wireframe transparent opacity={edgeOpacity + 0.24} />
        </mesh>
        <mesh position={[-0.08, -0.04, 0.12]} rotation={[0, 0, -0.72]}>
          <boxGeometry args={[0.16, 0.04, 0.035]} />
          <meshBasicMaterial color={tone.accent} transparent opacity={signalOpacity} />
        </mesh>
        <mesh position={[0.08, 0.03, 0.12]} rotation={[0, 0, 0.72]}>
          <boxGeometry args={[0.34, 0.04, 0.035]} />
          <meshBasicMaterial color={tone.accent} transparent opacity={signalOpacity} />
        </mesh>
      </group>
    );
  }

  if (nodeId === "database") {
    return (
      <group>
        {[-0.14, 0, 0.14].map((y, index) => (
          <mesh key={y} position={[0, y, 0.11]}>
            <boxGeometry args={[0.46 - index * 0.04, 0.08, 0.035]} />
            <meshBasicMaterial color={index === 0 ? "#dbe7ff" : tone.accent} transparent opacity={index === 0 ? textOpacity : signalOpacity * (0.86 - index * 0.14)} />
          </mesh>
        ))}
        <mesh position={[-0.28, 0, 0.115]}>
          <boxGeometry args={[0.045, 0.34, 0.035]} />
          <meshBasicMaterial color={tone.accent} transparent opacity={signalOpacity * 0.78} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      {[-0.24, 0, 0.24].map((x, index) => (
        <mesh key={x} position={[x, 0, 0.11]}>
          <boxGeometry args={[0.13, 0.13, 0.035]} />
          <meshBasicMaterial color={index === 1 ? tone.accent : "#dbe7ff"} transparent opacity={index === 1 ? signalOpacity : textOpacity} />
        </mesh>
      ))}
      <mesh position={[-0.12, 0, 0.105]}>
        <boxGeometry args={[0.14, 0.035, 0.03]} />
        <meshBasicMaterial color={tone.accent} transparent opacity={signalOpacity * 0.7} />
      </mesh>
      <mesh position={[0.12, 0, 0.105]}>
        <boxGeometry args={[0.14, 0.035, 0.03]} />
        <meshBasicMaterial color={tone.accent} transparent opacity={signalOpacity * 0.7} />
      </mesh>
      <mesh position={[0.34, 0, 0.11]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.055, 0.12, 3]} />
        <meshBasicMaterial color={tone.accent} transparent opacity={signalOpacity} />
      </mesh>
    </group>
  );
}

interface CoreToneColors {
  readonly accent: string;
  readonly emissive: string;
}
function getToneColors(tone: EngineeringCoreNodeTone): CoreToneColors {
  if (tone === "quality") {
    return { accent: "#7ee7b4", emissive: "#123629" };
  }

  if (tone === "ship") {
    return { accent: "#f6d16f", emissive: "#3d3316" };
  }

  if (tone === "data") {
    return { accent: "#9db8ff", emissive: "#182744" };
  }

  return { accent: "#66d9ff", emissive: "#103247" };
}
