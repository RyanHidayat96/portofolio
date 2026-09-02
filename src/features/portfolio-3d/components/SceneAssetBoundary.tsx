'use client';

import { Component, Suspense } from 'react';
import type { SceneAssetDefinition } from '../types';

interface SceneAssetErrorBoundaryProps {
  readonly asset: SceneAssetDefinition;
  readonly children: React.ReactNode;
  readonly onError?: (assetId: SceneAssetDefinition['id'], error: unknown) => void;
}

interface SceneAssetErrorBoundaryState {
  readonly hasError: boolean;
}

export function SceneAssetBoundary({
  asset,
  children,
  onError
}: Readonly<{
  asset: SceneAssetDefinition;
  children: React.ReactNode;
  onError?: (assetId: SceneAssetDefinition['id'], error: unknown) => void;
}>): React.ReactElement {
  const loadingPlaceholder = asset.loadingTier === 'critical' ? (
    <SceneAssetPlaceholder asset={asset} state="loading" />
  ) : null;

  return (
    <SceneAssetErrorBoundary asset={asset} onError={onError}>
      <Suspense fallback={loadingPlaceholder}>{children}</Suspense>
    </SceneAssetErrorBoundary>
  );
}

class SceneAssetErrorBoundary extends Component<
  Readonly<SceneAssetErrorBoundaryProps>,
  SceneAssetErrorBoundaryState
> {
  readonly state: SceneAssetErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SceneAssetErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    this.props.onError?.(this.props.asset.id, error);

    if (process.env.NODE_ENV !== 'production') {
      console.error(`[portfolio-3d] Asset failed: ${this.props.asset.id}`, error);
    }
  }

  componentDidUpdate(previousProps: Readonly<SceneAssetErrorBoundaryProps>): void {
    if (previousProps.asset.id !== this.props.asset.id && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.asset.loadingTier === 'critical' ? (
        <SceneAssetPlaceholder asset={this.props.asset} state="error" />
      ) : null;
    }

    return this.props.children;
  }
}

function SceneAssetPlaceholder({
  asset,
  state
}: Readonly<{
  asset: SceneAssetDefinition;
  state: 'loading' | 'error';
}>): React.ReactElement {
  const color = state === 'error' ? '#ff6b6b' : '#4bd8ff';
  const opacity = state === 'error' ? 0.32 : 0.18;
  const [width, height, depth] = getPlaceholderSize(asset);

  return (
    <group
      position={asset.fallbackTransform.position}
      rotation={asset.fallbackTransform.rotation}
      scale={asset.fallbackTransform.scale}
    >
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} wireframe />
      </mesh>
    </group>
  );
}

function getPlaceholderSize(asset: SceneAssetDefinition): readonly [number, number, number] {
  const width = Math.max(0.18, asset.boundingBox.max[0] - asset.boundingBox.min[0]);
  const height = Math.max(0.18, asset.boundingBox.max[1] - asset.boundingBox.min[1]);
  const depth = Math.max(0.08, asset.boundingBox.max[2] - asset.boundingBox.min[2]);
  return [width, height, depth];
}
