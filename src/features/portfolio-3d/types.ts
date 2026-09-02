import type { WorkspaceSection } from '@/features/workspace/types';

export type Vector3Tuple = readonly [number, number, number];

export interface Transform3d {
  readonly position: Vector3Tuple;
  readonly rotation: Vector3Tuple;
  readonly scale: Vector3Tuple;
}

export interface BoundingBox3d {
  readonly min: Vector3Tuple;
  readonly max: Vector3Tuple;
}

export type Portfolio3dAssetId =
  | 'architecture-screen'
  | 'ceiling-lights'
  | 'chair'
  | 'desk-accessories'
  | 'desk-lamp'
  | 'desk'
  | 'hologram-projector'
  | 'keyboard-mouse'
  | 'laptop'
  | 'main-monitor'
  | 'pipeline-console'
  | 'plants'
  | 'room-shell'
  | 'server-rack'
  | 'storage-shelf';

export type Portfolio3dAssetFileName = `${string}.glb`;
export type Portfolio3dSourcePath = `assets/${Portfolio3dAssetFileName}`;
export type Portfolio3dPublicPath = `/models/portfolio-3d/${Portfolio3dAssetFileName}`;
export type Portfolio3dLoadingTier = 'critical' | 'near' | 'deferred';
export type Portfolio3dQualityTier = 'low' | 'medium' | 'high';
export type Portfolio3dLightingMode = 'studio' | 'focus' | 'ambient';
export type Portfolio3dEnvironmentVariant = 'studio' | 'dawn' | 'night';
export type Portfolio3dCeilingLightAim = 'desk' | 'rack' | 'wide';
export type Portfolio3dLightingGroup =
  | 'ambient-cove'
  | 'key-pendant'
  | 'rail-spot'
  | 'screen-accent'
  | 'desk-task'
  | 'fallback-fill';
export type Portfolio3dAnchorName = `Anchor_${string}`;
export type Portfolio3dHotspotNodeName = `Hotspot_${string}`;
export type Portfolio3dScreenNodeName = `Screen_${string}` | 'Hologram_Surface' | 'Phone_Display';

export type Portfolio3dSectionId =
  | WorkspaceSection
  | 'fullstack'
  | 'backend'
  | 'quality'
  | 'delivery'
  | 'room';

export interface SceneAssetPlacement {
  readonly strategy: 'root' | 'room-anchor';
  readonly anchorNodeName?: Portfolio3dAnchorName;
  readonly parentAssetId?: Portfolio3dAssetId;
  readonly localTransform?: Transform3d;
}

export interface SceneNodeInventory {
  readonly anchors?: readonly Portfolio3dAnchorName[];
  readonly hotspots?: readonly Portfolio3dHotspotNodeName[];
  readonly screens?: readonly Portfolio3dScreenNodeName[];
  readonly colliders?: readonly string[];
  readonly navMeshes?: readonly string[];
  readonly doors?: readonly string[];
  readonly lights?: readonly string[];
  readonly runtimeHidden?: readonly string[];
}

export interface SceneAssetDefinition {
  readonly id: Portfolio3dAssetId;
  readonly fileName: Portfolio3dAssetFileName;
  readonly sourcePath: Portfolio3dSourcePath;
  readonly publicPath: Portfolio3dPublicPath;
  readonly byteSize: number;
  readonly sceneName: string;
  readonly rootNodeName: string;
  readonly loadingTier: Portfolio3dLoadingTier;
  readonly qualityVisibility: Readonly<Record<Portfolio3dQualityTier, boolean>>;
  readonly placement: SceneAssetPlacement;
  readonly fallbackTransform: Transform3d;
  readonly boundingBox: BoundingBox3d;
  readonly nodes: SceneNodeInventory;
  readonly extensions: readonly string[];
}

export type Portfolio3dHotspotId =
  | 'profile'
  | 'projects'
  | 'architecture'
  | 'fullstack'
  | 'backend'
  | 'performance'
  | 'pipeline'
  | 'terminal'
  | 'automation'
  | 'contact'
  | 'window'
  | 'door'
  | 'room-lighting'
  | 'ceiling-lights'
  | 'desk-lamp'
  | 'plants';

export type Portfolio3dInteractionKind =
  | 'open-section'
  | 'inspect-prop'
  | 'cycle-environment'
  | 'toggle-door'
  | 'toggle-lighting';

export interface Portfolio3dHotspotDefinition {
  readonly id: Portfolio3dHotspotId;
  readonly label: string;
  readonly nodeName: Portfolio3dHotspotNodeName;
  readonly assetId: Portfolio3dAssetId;
  readonly sectionId?: Portfolio3dSectionId;
  readonly workspaceSection?: WorkspaceSection;
  readonly interactionKind: Portfolio3dInteractionKind;
}

export interface Portfolio3dDataSourceRef {
  readonly modulePath: string;
  readonly exportName: string;
  readonly usage: string;
}

export interface Portfolio3dSectionContract {
  readonly id: Portfolio3dSectionId;
  readonly label: string;
  readonly workspaceSection: WorkspaceSection;
  readonly routePath: string;
  readonly cameraPresetId: Portfolio3dCameraPresetId;
  readonly dataSources: readonly Portfolio3dDataSourceRef[];
  readonly primaryAssetId?: Portfolio3dAssetId;
  readonly hotspotId?: Portfolio3dHotspotId;
  readonly screenNodeName?: Portfolio3dScreenNodeName;
  readonly contentStrategy: string;
}

export type Portfolio3dCameraPresetId = Portfolio3dSectionId | 'overview';

export interface Portfolio3dCameraPreset {
  readonly id: Portfolio3dCameraPresetId;
  readonly label: string;
  readonly position: Vector3Tuple;
  readonly target: Vector3Tuple;
  readonly fov: number;
  readonly near: number;
  readonly far: number;
  readonly targetNodeName?: string;
  readonly screenNodeName?: Portfolio3dScreenNodeName;
  readonly reducedMotionMs: number;
  readonly transitionMs: number;
}

export type Portfolio3dNavigationState = 'overview' | 'focusing' | 'section-open' | 'returning';

export interface Portfolio3dRouteTarget {
  readonly sectionId: Portfolio3dSectionId;
  readonly workspaceSection: WorkspaceSection;
  readonly path: string;
  readonly queryValue: string;
  readonly cameraPresetId: Portfolio3dCameraPresetId;
}

export interface NodeAliasDefinition {
  readonly assetId: Portfolio3dAssetId;
  readonly requestedName: string;
  readonly actualName: string;
  readonly reason: string;
}

export type Portfolio3dInputSource = 'pointer' | 'keyboard' | 'route' | 'system';

export type Portfolio3dInteractionEvent =
  | {
      readonly type: 'hotspot.focus';
      readonly hotspotId: Portfolio3dHotspotId;
      readonly source: Portfolio3dInputSource;
    }
  | {
      readonly type: 'hotspot.activate';
      readonly hotspotId: Portfolio3dHotspotId;
      readonly source: Portfolio3dInputSource;
    }
  | {
      readonly type: 'camera.transition';
      readonly from: Portfolio3dCameraPresetId;
      readonly to: Portfolio3dCameraPresetId;
      readonly state: Portfolio3dNavigationState;
    }
  | {
      readonly type: 'route.sync';
      readonly sectionId: Portfolio3dSectionId;
      readonly path: string;
    }
  | {
      readonly type: 'room.toggle';
      readonly target: 'door' | 'window' | 'lighting';
      readonly enabled: boolean;
    };

export interface Portfolio3dLoadingProgress {
  readonly totalCriticalAssets: number;
  readonly loadedCriticalAssets: number;
  readonly failedCriticalAssets: number;
  readonly isCriticalComplete: boolean;
}


