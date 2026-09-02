import type {
  Portfolio3dAnchorName,
  Portfolio3dHotspotDefinition,
  SceneAssetDefinition,
  SceneAssetPlacement,
  Transform3d
} from './types';

const identityTransform: Transform3d = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1]
};

const visibleAll = { low: true, medium: true, high: true } as const;
const visibleMediumHigh = { low: false, medium: true, high: true } as const;
const visibleHighOnly = { low: false, medium: false, high: true } as const;

function roomAnchor(
  anchorNodeName: Portfolio3dAnchorName,
  localTransform?: Transform3d
): SceneAssetPlacement {
  return {
    strategy: 'room-anchor',
    parentAssetId: 'room-shell',
    anchorNodeName,
    ...(localTransform ? { localTransform } : {})
  };
}

const laptopDeskTransform: Transform3d = {
  position: [-0.52, 0.765, 0.16],
  rotation: [0, 0.08, 0],
  scale: [1, 1, 1]
};

const keyboardMouseDeskTransform: Transform3d = {
  position: [-0.02, 0.765, 0.31],
  rotation: [0, 0, 0],
  scale: [1, 1, 1]
};

const deskLampTransform: Transform3d = {
  position: [0.18, 0.755, 0.12],
  rotation: [0, -0.18, 0],
  scale: [1, 1, 1]
};

const deskAccessoriesTransform: Transform3d = {
  position: [0.42, 0.755, 0.24],
  rotation: [0, -0.08, 0],
  scale: [1, 1, 1]
};

const plantsWindowTransform: Transform3d = {
  position: [0.56, -1.55, 0.82],
  rotation: [0, 0.08, 0],
  scale: [1, 1, 1]
};

export const portfolio3dAssets = [
  {
    id: 'room-shell',
    fileName: 'room-shell.glb',
    sourcePath: 'assets/room-shell.glb',
    publicPath: '/models/portfolio-3d/room-shell.glb',
    byteSize: 3910936,
    sceneName: 'Room_Shell_Scene',
    rootNodeName: 'Room_Shell_Root',
    loadingTier: 'critical',
    qualityVisibility: visibleAll,
    placement: { strategy: 'root' },
    fallbackTransform: identityTransform,
    boundingBox: { min: [-3.12, -0.098, -2.37], max: [3.12, 3.12, 2.25] },
    nodes: {
      anchors: [
        'Anchor_Desk',
        'Anchor_Chair',
        'Anchor_MainMonitor',
        'Anchor_ArchitectureScreen',
        'Anchor_ServerRack',
        'Anchor_HologramProjector',
        'Anchor_StorageShelf',
        'Anchor_PipelineConsole',
        'Anchor_CeilingLights',
        'Anchor_WindowBackdrop'
      ],
      hotspots: ['Hotspot_Profile', 'Hotspot_Window', 'Hotspot_Door', 'Hotspot_RoomLighting'],
      colliders: [
        'Room_Colliders',
        'Collider_Floor',
        'Collider_BackWall',
        'Collider_LeftWall_Back',
        'Collider_LeftWall_Front',
        'Collider_RightWall_Back',
        'Collider_Ceiling'
      ],
      navMeshes: ['NavMesh_Room'],
      doors: ['Door_Pivot'],
      lights: ['Cove_WallWash_1', 'Cove_WallWash_2', 'Cove_WallWash_3', 'Cove_WallWash_4'],
      runtimeHidden: ['Room_Colliders', 'NavMesh_Room']
    },
    extensions: [
      'KHR_lights_punctual',
      'KHR_materials_clearcoat',
      'KHR_materials_emissive_strength',
      'KHR_materials_transmission'
    ]
  },
  {
    id: 'desk',
    fileName: 'desk.glb',
    sourcePath: 'assets/desk.glb',
    publicPath: '/models/portfolio-3d/desk.glb',
    byteSize: 1049196,
    sceneName: 'RyanOS_Desk',
    rootNodeName: 'Desk_Root',
    loadingTier: 'near',
    qualityVisibility: visibleMediumHigh,
    placement: roomAnchor('Anchor_Desk'),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-1.1, 0, -0.425], max: [1.1, 0.759, 0.434] },
    nodes: {},
    extensions: ['KHR_materials_emissive_strength']
  },
  {
    id: 'chair',
    fileName: 'chair.glb',
    sourcePath: 'assets/chair.glb',
    publicPath: '/models/portfolio-3d/chair.glb',
    byteSize: 2765540,
    sceneName: 'RyanOS_Chair',
    rootNodeName: 'Chair_Root',
    loadingTier: 'near',
    qualityVisibility: visibleMediumHigh,
    placement: roomAnchor('Anchor_Chair'),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-0.381, 0, -0.394], max: [0.381, 1.328, 0.339] },
    nodes: {},
    extensions: ['KHR_materials_emissive_strength']
  },
  {
    id: 'main-monitor',
    fileName: 'main-monitor.glb',
    sourcePath: 'assets/main-monitor.glb',
    publicPath: '/models/portfolio-3d/main-monitor.glb',
    byteSize: 2310888,
    sceneName: 'RyanOS_MainMonitor',
    rootNodeName: 'MainMonitor_Root',
    loadingTier: 'near',
    qualityVisibility: visibleMediumHigh,
    placement: roomAnchor('Anchor_MainMonitor'),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-0.627, 0, -0.195], max: [0.627, 0.656, 0.117] },
    nodes: {
      anchors: ['Anchor_DisplayCenter', 'Anchor_CameraFocus'],
      hotspots: ['Hotspot_Projects'],
      screens: ['Screen_Projects', 'Screen_AntiGlareGlass']
    },
    extensions: ['KHR_materials_emissive_strength']
  },
  {
    id: 'architecture-screen',
    fileName: 'architecture-screen.glb',
    sourcePath: 'assets/architecture-screen.glb',
    publicPath: '/models/portfolio-3d/architecture-screen.glb',
    byteSize: 1274148,
    sceneName: 'RyanOS_ArchitectureScreen',
    rootNodeName: 'ArchitectureScreen_Root',
    loadingTier: 'near',
    qualityVisibility: visibleMediumHigh,
    placement: roomAnchor('Anchor_ArchitectureScreen'),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-0.93, -0.744, -0.179], max: [0.93, 0.48, 0.096] },
    nodes: {
      anchors: ['Anchor_DisplayCenter', 'Anchor_CameraFocus'],
      hotspots: ['Hotspot_Architecture'],
      screens: ['Screen_Architecture', 'Screen_ProtectiveGlass']
    },
    extensions: ['KHR_materials_emissive_strength']
  },
  {
    id: 'laptop',
    fileName: 'laptop.glb',
    sourcePath: 'assets/laptop.glb',
    publicPath: '/models/portfolio-3d/laptop.glb',
    byteSize: 2727076,
    sceneName: 'RyanOS_Laptop',
    rootNodeName: 'Laptop_Root',
    loadingTier: 'near',
    qualityVisibility: visibleMediumHigh,
    placement: roomAnchor('Anchor_Desk', laptopDeskTransform),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-0.184, 0, -0.164], max: [0.184, 0.258, 0.127] },
    nodes: {
      anchors: ['Anchor_DisplayCenter', 'Anchor_CameraFocus'],
      hotspots: ['Hotspot_Fullstack'],
      screens: ['Screen_Fullstack', 'Screen_DisplayGlass']
    },
    extensions: ['KHR_materials_emissive_strength']
  },
  {
    id: 'server-rack',
    fileName: 'server-rack.glb',
    sourcePath: 'assets/server-rack.glb',
    publicPath: '/models/portfolio-3d/server-rack.glb',
    byteSize: 4920588,
    sceneName: 'RyanOS_ServerRack',
    rootNodeName: 'ServerRack_Root',
    loadingTier: 'near',
    qualityVisibility: visibleMediumHigh,
    placement: roomAnchor('Anchor_ServerRack'),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-0.343, 0, -0.43], max: [0.33, 2.023, 0.507] },
    nodes: {
      anchors: ['Anchor_DisplayCenter', 'Anchor_CameraFocus'],
      hotspots: ['Hotspot_Backend'],
      screens: ['Screen_Backend', 'Screen_BackendGlass']
    },
    extensions: ['KHR_materials_emissive_strength']
  },
  {
    id: 'hologram-projector',
    fileName: 'hologram-projector.glb',
    sourcePath: 'assets/hologram-projector.glb',
    publicPath: '/models/portfolio-3d/hologram-projector.glb',
    byteSize: 2512136,
    sceneName: 'RyanOS_HologramProjector',
    rootNodeName: 'HologramProjector_Root',
    loadingTier: 'near',
    qualityVisibility: visibleMediumHigh,
    placement: roomAnchor('Anchor_HologramProjector'),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-0.235, 0, -0.233], max: [0.235, 0.666, 0.236] },
    nodes: {
      anchors: ['Anchor_HologramCenter', 'Anchor_CameraFocus'],
      hotspots: ['Hotspot_Performance'],
      screens: ['Hologram_Surface']
    },
    extensions: ['KHR_materials_emissive_strength']
  },
  {
    id: 'plants',
    label: 'Plants',
    nodeName: 'Hotspot_Plants',
    assetId: 'plants',
    interactionKind: 'inspect-prop'
  }
] as const satisfies readonly Portfolio3dHotspotDefinition[];

export const criticalPortfolio3dAssetIds = portfolio3dAssets
  .filter((asset) => asset.loadingTier === 'critical')
  .map((asset) => asset.id);

export const portfolio3dAssetById = Object.fromEntries(
  portfolio3dAssets.map((asset) => [asset.id, asset])
) as Record<(typeof portfolio3dAssets)[number]['id'], (typeof portfolio3dAssets)[number]>;

