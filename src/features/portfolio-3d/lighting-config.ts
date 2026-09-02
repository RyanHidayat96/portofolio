import type {
  Portfolio3dAssetId,
  Portfolio3dLightingGroup,
  Portfolio3dLightingMode,
  Portfolio3dQualityTier,
  Vector3Tuple
} from './types';

export type Portfolio3dTierValue = Readonly<Record<Portfolio3dQualityTier, number>>;

export interface Portfolio3dLightingProfile {
  readonly background: string;
  readonly fogColor: string;
  readonly fogNear: number;
  readonly fogFar: number;
  readonly ambientColor: string;
  readonly ambientIntensity: Portfolio3dTierValue;
  readonly hemisphereSkyColor: string;
  readonly hemisphereGroundColor: string;
  readonly hemisphereIntensity: Portfolio3dTierValue;
  readonly fallbackKeyColor: string;
  readonly fallbackKeyPosition: Vector3Tuple;
  readonly fallbackKeyIntensity: Portfolio3dTierValue;
  readonly importedIntensityMultiplier: number;
  readonly screenAccentMultiplier: number;
  readonly deskTaskMultiplier: number;
  readonly exposure: number;
}

export interface Portfolio3dImportedLightConfig {
  readonly assetId: Portfolio3dAssetId;
  readonly nodeName: string;
  readonly group: Portfolio3dLightingGroup;
  readonly color: string;
  readonly intensity: Portfolio3dTierValue;
  readonly castShadowIn: readonly Portfolio3dQualityTier[];
  readonly angle?: number;
  readonly penumbra?: number;
  readonly distance?: number;
  readonly decay?: number;
}

export interface Portfolio3dScreenAccentLightConfig {
  readonly assetId: Portfolio3dAssetId;
  readonly anchorNodeName: string;
  readonly group: Portfolio3dLightingGroup;
  readonly color: string;
  readonly intensity: Portfolio3dTierValue;
  readonly offset: Vector3Tuple;
  readonly distance: number;
  readonly decay: number;
}

export interface Portfolio3dDeskTaskLightConfig {
  readonly assetId: Portfolio3dAssetId;
  readonly sourceAnchorNodeName: string;
  readonly targetAnchorNodeName: string;
  readonly group: Portfolio3dLightingGroup;
  readonly color: string;
  readonly intensity: Portfolio3dTierValue;
  readonly fallbackPosition: Vector3Tuple;
  readonly fallbackTarget: Vector3Tuple;
  readonly angle: number;
  readonly penumbra: number;
  readonly distance: number;
  readonly decay: number;
  readonly castShadowIn: readonly Portfolio3dQualityTier[];
}

const tier = (low: number, medium: number, high: number): Portfolio3dTierValue => ({
  low,
  medium,
  high
});

export const portfolio3dShadowSettings = {
  mapSize: { low: 512, medium: 768, high: 1024 },
  bias: -0.00018,
  normalBias: 0.018,
  radius: 3,
  near: 0.08,
  far: 8
} as const;

export const portfolio3dLightingProfiles = {
  studio: {
    background: '#05070b',
    fogColor: '#05070b',
    fogNear: 7.5,
    fogFar: 18,
    ambientColor: '#dce8ff',
    ambientIntensity: tier(1.24, 1.12, 1.04),
    hemisphereSkyColor: '#dce8ff',
    hemisphereGroundColor: '#101923',
    hemisphereIntensity: tier(0.78, 0.68, 0.62),
    fallbackKeyColor: '#fff7e8',
    fallbackKeyPosition: [2.4, 3.1, 3.6],
    fallbackKeyIntensity: tier(2.15, 1.86, 1.62),
    importedIntensityMultiplier: 1.32,
    screenAccentMultiplier: 0.92,
    deskTaskMultiplier: 1.2,
    exposure: 1.55
  },
  focus: {
    background: '#04060a',
    fogColor: '#04060a',
    fogNear: 6.2,
    fogFar: 15.5,
    ambientColor: '#c9dcff',
    ambientIntensity: tier(0.86, 0.76, 0.68),
    hemisphereSkyColor: '#cfe3ff',
    hemisphereGroundColor: '#0b121b',
    hemisphereIntensity: tier(0.4, 0.35, 0.32),
    fallbackKeyColor: '#fff1d5',
    fallbackKeyPosition: [2.2, 3.35, 2.65],
    fallbackKeyIntensity: tier(1.34, 1.1, 0.92),
    importedIntensityMultiplier: 1.02,
    screenAccentMultiplier: 1.18,
    deskTaskMultiplier: 1.08,
    exposure: 1.12
  },
  ambient: {
    background: '#06090e',
    fogColor: '#06090e',
    fogNear: 6,
    fogFar: 15,
    ambientColor: '#d8e6ff',
    ambientIntensity: tier(0.76, 0.66, 0.6),
    hemisphereSkyColor: '#dce9ff',
    hemisphereGroundColor: '#152234',
    hemisphereIntensity: tier(0.48, 0.42, 0.38),
    fallbackKeyColor: '#fff8eb',
    fallbackKeyPosition: [2.8, 3.4, 3.1],
    fallbackKeyIntensity: tier(0.96, 0.78, 0.64),
    importedIntensityMultiplier: 0.82,
    screenAccentMultiplier: 0.72,
    deskTaskMultiplier: 0.66,
    exposure: 1.08
  }
} satisfies Readonly<Record<Portfolio3dLightingMode, Portfolio3dLightingProfile>>;
export const portfolio3dImportedLightConfigs = [
  {
    assetId: 'room-shell',
    nodeName: 'Cove_WallWash_1',
    group: 'ambient-cove',
    color: '#8ccfff',
    intensity: tier(0.18, 0.26, 0.32),
    castShadowIn: [],
    distance: 4.2,
    decay: 2
  },
  {
    assetId: 'room-shell',
    nodeName: 'Cove_WallWash_2',
    group: 'ambient-cove',
    color: '#7fbef1',
    intensity: tier(0.16, 0.24, 0.3),
    castShadowIn: [],
    distance: 4,
    decay: 2
  },
  {
    assetId: 'room-shell',
    nodeName: 'Cove_WallWash_3',
    group: 'ambient-cove',
    color: '#b8d7ff',
    intensity: tier(0.16, 0.22, 0.28),
    castShadowIn: [],
    distance: 4,
    decay: 2
  },
  {
    assetId: 'room-shell',
    nodeName: 'Cove_WallWash_4',
    group: 'ambient-cove',
    color: '#9bd7ff',
    intensity: tier(0.16, 0.23, 0.28),
    castShadowIn: [],
    distance: 4,
    decay: 2
  },
  {
    assetId: 'ceiling-lights',
    nodeName: 'Pendant_Light_02',
    group: 'key-pendant',
    color: '#fff1d6',
    intensity: tier(0.42, 0.82, 1),
    castShadowIn: ['medium', 'high'],
    distance: 4.8,
    decay: 2
  },
  {
    assetId: 'ceiling-lights',
    nodeName: 'Pendant_Light_03',
    group: 'key-pendant',
    color: '#f7fbff',
    intensity: tier(0.3, 0.56, 0.68),
    castShadowIn: [],
    distance: 4.4,
    decay: 2
  },
  {
    assetId: 'ceiling-lights',
    nodeName: 'Spot_02_Light',
    group: 'rail-spot',
    color: '#cdefff',
    intensity: tier(0.18, 0.46, 0.58),
    castShadowIn: [],
    angle: 0.58,
    penumbra: 0.72,
    distance: 4.6,
    decay: 2
  },
  {
    assetId: 'ceiling-lights',
    nodeName: 'Spot_04_Light',
    group: 'rail-spot',
    color: '#fff5df',
    intensity: tier(0.16, 0.42, 0.54),
    castShadowIn: ['high'],
    angle: 0.54,
    penumbra: 0.78,
    distance: 4.4,
    decay: 2
  },
  {
    assetId: 'ceiling-lights',
    nodeName: 'Spot_05_Light',
    group: 'rail-spot',
    color: '#bfe8ff',
    intensity: tier(0.14, 0.36, 0.48),
    castShadowIn: [],
    angle: 0.5,
    penumbra: 0.8,
    distance: 4.2,
    decay: 2
  }
] satisfies readonly Portfolio3dImportedLightConfig[];

export const portfolio3dScreenAccentLights = [
  { assetId: 'main-monitor', anchorNodeName: 'Anchor_DisplayCenter', group: 'screen-accent', color: '#48d5ff', intensity: tier(0.14, 0.2, 0.24), offset: [0, 0.02, 0.14], distance: 1.25, decay: 2 },
  { assetId: 'architecture-screen', anchorNodeName: 'Anchor_DisplayCenter', group: 'screen-accent', color: '#5edcff', intensity: tier(0.08, 0.16, 0.2), offset: [0, 0.02, 0.12], distance: 1.15, decay: 2 },
  { assetId: 'laptop', anchorNodeName: 'Anchor_DisplayCenter', group: 'screen-accent', color: '#63dfff', intensity: tier(0.06, 0.12, 0.16), offset: [0, 0.04, 0.08], distance: 0.85, decay: 2 },
  { assetId: 'server-rack', anchorNodeName: 'Anchor_DisplayCenter', group: 'screen-accent', color: '#59d7ff', intensity: tier(0.06, 0.14, 0.18), offset: [0, 0.03, 0.1], distance: 1.05, decay: 2 },
  { assetId: 'hologram-projector', anchorNodeName: 'Anchor_HologramCenter', group: 'screen-accent', color: '#72ffd5', intensity: tier(0.05, 0.12, 0.18), offset: [0, 0.14, 0], distance: 1.05, decay: 2 },
  { assetId: 'pipeline-console', anchorNodeName: 'Anchor_DisplayCenter', group: 'screen-accent', color: '#52d9ff', intensity: tier(0.04, 0.1, 0.14), offset: [0, 0.04, 0.08], distance: 0.9, decay: 2 },
  { assetId: 'desk-accessories', anchorNodeName: 'Anchor_Phone', group: 'screen-accent', color: '#49d8ff', intensity: tier(0.03, 0.08, 0.1), offset: [0, 0.1, 0.04], distance: 0.65, decay: 2 }
] satisfies readonly Portfolio3dScreenAccentLightConfig[];

export const portfolio3dDeskTaskLight = {
  assetId: 'desk-lamp',
  sourceAnchorNodeName: 'Anchor_SpotLight',
  targetAnchorNodeName: 'Anchor_LightTarget',
  group: 'desk-task',
  color: '#ffe0a3',
  intensity: tier(0.24, 0.52, 0.82),
  fallbackPosition: [0.68, 1.42, 0.24],
  fallbackTarget: [0.34, 0.76, 0.24],
  angle: 0.62,
  penumbra: 0.55,
  distance: 3,
  decay: 2,
  castShadowIn: ['high']
} satisfies Portfolio3dDeskTaskLightConfig;

export function getPortfolio3dTierValue(
  value: Portfolio3dTierValue,
  qualityTier: Portfolio3dQualityTier
): number {
  return value[qualityTier];
}