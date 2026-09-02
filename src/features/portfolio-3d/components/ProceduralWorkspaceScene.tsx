'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { usePortfolio3dState } from '../state/Portfolio3dState';
import type { Portfolio3dQualityTier, Portfolio3dSectionId, Vector3Tuple } from '../types';

type MutableVector3Tuple = [number, number, number];

const activeColorBySection: Partial<Record<Portfolio3dSectionId, string>> = {
  overview: '#4bd8ff',
  profile: '#a8d5ee',
  experience: '#74f0b2',
  projects: '#4bd8ff',
  fullstack: '#6ee7ff',
  backend: '#88a8ff',
  architecture: '#7dd3fc',
  automation: '#6ef0b1',
  performance: '#f8d86a',
  pipeline: '#f7b955',
  terminal: '#c7d2fe',
  contact: '#fda4af'
};

const architectureNodes = [
  { key: 'frontend', position: [-0.98, 2.02, -2.03] as MutableVector3Tuple, size: [0.58, 0.28, 0.02] as MutableVector3Tuple, section: 'fullstack' as Portfolio3dSectionId },
  { key: 'api', position: [0, 2.04, -2.03] as MutableVector3Tuple, size: [0.46, 0.28, 0.02] as MutableVector3Tuple, section: 'backend' as Portfolio3dSectionId },
  { key: 'backend', position: [0.94, 2.02, -2.03] as MutableVector3Tuple, size: [0.58, 0.28, 0.02] as MutableVector3Tuple, section: 'backend' as Portfolio3dSectionId },
  { key: 'database', position: [-0.38, 1.55, -2.02] as MutableVector3Tuple, size: [0.54, 0.26, 0.02] as MutableVector3Tuple, section: 'projects' as Portfolio3dSectionId },
  { key: 'pipeline', position: [0.55, 1.54, -2.02] as MutableVector3Tuple, size: [0.52, 0.26, 0.02] as MutableVector3Tuple, section: 'pipeline' as Portfolio3dSectionId }
] as const;

const architectureLines = [
  ['frontend', 'api'],
  ['api', 'backend'],
  ['api', 'database'],
  ['api', 'pipeline'],
  ['database', 'pipeline']
] as const;

const architectureNodePositionByKey = new Map<string, Vector3Tuple>(
  architectureNodes.map((node) => [node.key, node.position])
);
const fallbackPosition = [0, 0, 0] as const satisfies Vector3Tuple;
const serverRows = Array.from({ length: 9 }, (_, index) => index);
const cityDots = Array.from({ length: 48 }, (_, index) => ({
  key: index,
  x: -2.9 + (index % 8) * 0.17,
  y: 0.92 + Math.floor(index / 8) * 0.16,
  intensity: index % 5 === 0 ? 0.95 : 0.45
}));

export function ProceduralWorkspaceScene({
  qualityTier
}: Readonly<{
  qualityTier: Portfolio3dQualityTier;
}>): React.ReactElement {
  const { state } = usePortfolio3dState();
  const activeColor = activeColorBySection[state.activeSectionId] ?? '#4bd8ff';
  const detailLevel = qualityTier === 'low' ? 0.82 : qualityTier === 'medium' ? 0.94 : 1;

  return (
    <group name="Procedural_RyanOS_Workspace">
      <ambientLight intensity={0.28 * detailLevel} color="#dcecff" />
      <pointLight position={[0, 2.42, 1.05]} intensity={2.1 * detailLevel} color="#d9f6ff" distance={5.8} />
      <pointLight position={[-1.9, 1.55, -0.3]} intensity={0.8 * detailLevel} color="#58d8ff" distance={3.8} />
      <pointLight position={[1.8, 1.15, 0.1]} intensity={0.58 * detailLevel} color="#f7d77a" distance={3.2} />

      <RoomEnvelope activeColor={activeColor} />
      <CityWindow />
      <DeskCluster activeSectionId={state.activeSectionId} activeColor={activeColor} />
      <ArchitectureWall activeSectionId={state.activeSectionId} activeColor={activeColor} />
      <ServerRack activeSectionId={state.activeSectionId} />
      <HologramColumn activeSectionId={state.activeSectionId} activeColor={activeColor} />
    </group>
  );
}

function RoomEnvelope({ activeColor }: Readonly<{ activeColor: string }>): React.ReactElement {
  return (
    <group>
      <mesh position={[0, -0.08, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.5, 4.7]} />
        <meshStandardMaterial color="#071019" roughness={0.78} metalness={0.08} />
      </mesh>
      <mesh position={[0, 1.5, -2.12]}>
        <planeGeometry args={[6.4, 3.2]} />
        <meshStandardMaterial color="#08111b" roughness={0.72} metalness={0.12} emissive="#060d14" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[-3.18, 1.42, -0.2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.9, 3.05]} />
        <meshStandardMaterial color="#050b12" roughness={0.76} metalness={0.14} />
      </mesh>
      <mesh position={[3.18, 1.42, -0.2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.9, 3.05]} />
        <meshStandardMaterial color="#060b12" roughness={0.76} metalness={0.14} />
      </mesh>
      <mesh position={[0, 3.08, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.5, 4.6]} />
        <meshStandardMaterial color="#05080d" roughness={0.86} metalness={0.18} />
      </mesh>
      <NeonLine from={[-2.4, 2.86, -1.48]} to={[2.4, 2.86, -1.48]} color="#eefaff" opacity={0.78} widthHint={0.018} />
      <NeonLine from={[-2.65, 0.68, 0.92]} to={[2.65, 0.68, 0.92]} color={activeColor} opacity={0.62} widthHint={0.014} />
      <NeonLine from={[-2.95, 2.5, 1.4]} to={[-1.5, 1.75, 0.72]} color="#b7f3ff" opacity={0.3} widthHint={0.012} />
      <NeonLine from={[2.95, 2.5, 1.4]} to={[1.45, 1.75, 0.72]} color="#b7f3ff" opacity={0.3} widthHint={0.012} />
    </group>
  );
}

function CityWindow(): React.ReactElement {
  return (
    <group position={[-2.35, 1.55, -2.07]}>
      <mesh>
        <planeGeometry args={[1.35, 1.25]} />
        <meshBasicMaterial color="#071725" transparent opacity={0.78} />
      </mesh>
      {cityDots.map((dot) => (
        <mesh key={dot.key} position={[dot.x + 2.35, dot.y - 1.55, 0.012]}>
          <boxGeometry args={[0.035, 0.018, 0.004]} />
          <meshBasicMaterial color="#a8d9ff" transparent opacity={dot.intensity} />
        </mesh>
      ))}
    </group>
  );
}

function DeskCluster({
  activeSectionId,
  activeColor
}: Readonly<{
  activeSectionId: Portfolio3dSectionId;
  activeColor: string;
}>): React.ReactElement {
  const monitorActive = activeSectionId === 'projects' || activeSectionId === 'overview';
  const laptopActive = activeSectionId === 'fullstack' || activeSectionId === 'contact';

  return (
    <group>
      <mesh position={[0, 0.62, 0.02]}>
        <boxGeometry args={[2.72, 0.14, 1.02]} />
        <meshStandardMaterial color="#121821" roughness={0.42} metalness={0.36} emissive="#06121b" emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, 0.54, 0.48]}>
        <boxGeometry args={[2.88, 0.07, 0.06]} />
        <meshBasicMaterial color="#d7f8ff" transparent opacity={0.7} />
      </mesh>
      <mesh position={[-1.1, 0.27, 0.05]}>
        <boxGeometry args={[0.18, 0.58, 0.82]} />
        <meshStandardMaterial color="#090e15" roughness={0.64} metalness={0.28} />
      </mesh>
      <mesh position={[1.1, 0.27, 0.05]}>
        <boxGeometry args={[0.18, 0.58, 0.82]} />
        <meshStandardMaterial color="#090e15" roughness={0.64} metalness={0.28} />
      </mesh>
      <mesh position={[0, 0.77, 0.82]}>
        <boxGeometry args={[0.52, 0.82, 0.15]} />
        <meshStandardMaterial color="#0b111a" roughness={0.56} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.52, 0.95]}>
        <boxGeometry args={[0.82, 0.16, 0.58]} />
        <meshStandardMaterial color="#070b11" roughness={0.52} metalness={0.22} />
      </mesh>
      <ScreenPanel
        position={[0, 1.08, -0.5]}
        rotation={[-0.03, 0, 0]}
        size={[1.28, 0.68, 0.05]}
        color={monitorActive ? activeColor : '#4bd8ff'}
        active={monitorActive}
      />
      <mesh position={[0, 0.73, -0.26]}>
        <boxGeometry args={[0.18, 0.26, 0.08]} />
        <meshStandardMaterial color="#111923" roughness={0.54} metalness={0.28} />
      </mesh>
      <mesh position={[0, 0.7, -0.12]}>
        <boxGeometry args={[0.7, 0.06, 0.24]} />
        <meshStandardMaterial color="#0b1018" roughness={0.58} metalness={0.2} />
      </mesh>
      <ScreenPanel
        position={[1.15, 0.92, -0.08]}
        rotation={[-0.5, -0.34, 0]}
        size={[0.56, 0.34, 0.035]}
        color={laptopActive ? activeColor : '#72e5ff'}
        active={laptopActive}
      />
      <mesh position={[1.13, 0.68, 0.14]} rotation={[0, -0.24, 0]}>
        <boxGeometry args={[0.64, 0.04, 0.38]} />
        <meshStandardMaterial color="#0c121c" roughness={0.5} metalness={0.26} />
      </mesh>
    </group>
  );
}

function ScreenPanel({
  position,
  rotation,
  size,
  color,
  active
}: Readonly<{
  position: MutableVector3Tuple;
  rotation: MutableVector3Tuple;
  size: MutableVector3Tuple;
  color: string;
  active: boolean;
}>): React.ReactElement {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#0a111b" roughness={0.34} metalness={0.38} emissive="#07131f" emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[0, 0, size[2] / 2 + 0.004]}>
        <planeGeometry args={[size[0] * 0.88, size[1] * 0.72]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.36 : 0.18} />
      </mesh>
      <mesh position={[0, 0, size[2] / 2 + 0.006]}>
        <planeGeometry args={[size[0] * 0.7, 0.018]} />
        <meshBasicMaterial color="#e5fbff" transparent opacity={active ? 0.82 : 0.38} />
      </mesh>
      <mesh position={[0.18, -0.1, size[2] / 2 + 0.007]}>
        <planeGeometry args={[size[0] * 0.42, 0.014]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.78 : 0.38} />
      </mesh>
    </group>
  );
}

function ArchitectureWall({
  activeSectionId,
  activeColor
}: Readonly<{
  activeSectionId: Portfolio3dSectionId;
  activeColor: string;
}>): React.ReactElement {
  const nodePositionByKey = new Map(architectureNodes.map((node) => [node.key, node.position]));

  return (
    <group>
      <mesh position={[0, 1.82, -2.045]}>
        <planeGeometry args={[2.35, 1.28]} />
        <meshBasicMaterial color="#0b1824" transparent opacity={0.24} />
      </mesh>
      {architectureLines.map(([fromKey, toKey]) => {
        const from = nodePositionByKey.get(fromKey) ?? [0, 0, 0];
        const to = nodePositionByKey.get(toKey) ?? [0, 0, 0];
        return <NeonLine key={`${fromKey}-${toKey}`} from={from} to={to} color="#7fe7ff" opacity={0.5} widthHint={0.006} />;
      })}
      {architectureNodes.map((node) => {
        const active = activeSectionId === node.section || activeSectionId === 'architecture';
        return (
          <mesh key={node.key} position={node.position}>
            <boxGeometry args={node.size} />
            <meshBasicMaterial color={active ? activeColor : '#214157'} transparent opacity={active ? 0.82 : 0.46} />
          </mesh>
        );
      })}
    </group>
  );
}

function ServerRack({ activeSectionId }: Readonly<{ activeSectionId: Portfolio3dSectionId }>): React.ReactElement {
  const active = activeSectionId === 'backend' || activeSectionId === 'pipeline' || activeSectionId === 'performance';

  return (
    <group position={[2.26, 0.94, -1.22]} rotation={[0, -0.16, 0]}>
      <mesh>
        <boxGeometry args={[0.58, 1.56, 0.34]} />
        <meshStandardMaterial color="#070c13" roughness={0.5} metalness={0.46} emissive="#06131d" emissiveIntensity={active ? 0.42 : 0.2} />
      </mesh>
      {serverRows.map((row) => (
        <mesh key={row} position={[0, -0.64 + row * 0.15, 0.18]}>
          <boxGeometry args={[0.44, 0.035, 0.018]} />
          <meshBasicMaterial color={row % 3 === 0 ? '#f6d365' : '#4bd8ff'} transparent opacity={active ? 0.9 : 0.42} />
        </mesh>
      ))}
    </group>
  );
}

function HologramColumn({
  activeSectionId,
  activeColor
}: Readonly<{
  activeSectionId: Portfolio3dSectionId;
  activeColor: string;
}>): React.ReactElement {
  const active = activeSectionId === 'performance' || activeSectionId === 'automation' || activeSectionId === 'pipeline';

  return (
    <group position={[1.55, 0.86, 0.24]}>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.08, 32]} />
        <meshStandardMaterial color="#101723" roughness={0.36} metalness={0.44} emissive="#0b2632" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.34, 0.24, 0.64, 48, 1, true]} />
        <meshBasicMaterial color={activeColor} transparent opacity={active ? 0.22 : 0.12} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.26, 42]} />
        <meshBasicMaterial color={activeColor} transparent opacity={active ? 0.78 : 0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function NeonLine({
  from,
  to,
  color,
  opacity,
  widthHint
}: Readonly<{
  from: Vector3Tuple;
  to: Vector3Tuple;
  color: string;
  opacity: number;
  widthHint: number;
}>): React.ReactElement {
  const midpoint = useMemo(
    () => [
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2,
      (from[2] + to[2]) / 2
    ] as MutableVector3Tuple,
    [from, to]
  );
  const length = useMemo(() => new THREE.Vector3(...from).distanceTo(new THREE.Vector3(...to)), [from, to]);
  const rotation = useMemo(() => {
    const direction = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(1, 0, 0),
      direction.normalize()
    );
    return new THREE.Euler().setFromQuaternion(quaternion);
  }, [from, to]);

  return (
    <mesh position={midpoint} rotation={rotation}>
      <boxGeometry args={[length, widthHint, widthHint]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}