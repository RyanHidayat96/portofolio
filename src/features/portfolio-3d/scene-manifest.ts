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

const fullRoomPreviewTransform: Transform3d = {
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

const chairAnchorTransform: Transform3d = {
  position: [2.34, -0.008, -3.305],
  rotation: [0, Math.PI, 0],
  scale: [0.01, 0.01, 0.01]
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
    fileName: 'haker_room.glb',
    sourcePath: 'assets/haker_room.glb',
    publicPath: '/models/portfolio-3d/haker_room.glb',
    byteSize: 5534084,
    sceneName: 'Scene',
    rootNodeName: 'Scene',
    loadingTier: 'critical',
    qualityVisibility: visibleAll,
    placement: { strategy: 'root' },
    fallbackTransform: fullRoomPreviewTransform,
    boundingBox: { min: [-43.886, -10.948, -72.448], max: [13.842, 75.673, 36.833] },
    nodes: {},
    extensions: ['KHR_materials_emissive_strength']
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
    byteSize: 5354108,
    sceneName: 'AuxScene',
    rootNodeName: 'empty_1',
    loadingTier: 'near',
    qualityVisibility: visibleMediumHigh,
    placement: roomAnchor('Anchor_Chair', chairAnchorTransform),
    fallbackTransform: chairAnchorTransform,
    boundingBox: { min: [198.263, 0.819, -362.974], max: [269.737, 122.013, -298.026] },
    nodes: {},
    extensions: []
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
    id: 'ceiling-lights',
    fileName: 'ceiling-lights.glb',
    sourcePath: 'assets/ceiling-lights.glb',
    publicPath: '/models/portfolio-3d/ceiling-lights.glb',
    byteSize: 3294500,
    sceneName: 'Ceiling_Lights_Scene',
    rootNodeName: 'Ceiling_Lights_Root',
    loadingTier: 'near',
    qualityVisibility: visibleMediumHigh,
    placement: roomAnchor('Anchor_CeilingLights'),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-1.86, -1.464, -1.921], max: [1.86, 0.626, 1.66] },
    nodes: {
      hotspots: [
        'Hotspot_Pendant',
        'Hotspot_Spot_01',
        'Hotspot_Spot_02',
        'Hotspot_Spot_03',
        'Hotspot_Spot_04',
        'Hotspot_Spot_05',
        'Hotspot_Spot_06'
      ],
      lights: [
        'Pendant_Light_01',
        'Pendant_Light_02',
        'Pendant_Light_03',
        'Pendant_Light_04',
        'Spot_01_Light',
        'Spot_02_Light',
        'Spot_03_Light',
        'Spot_04_Light',
        'Spot_05_Light',
        'Spot_06_Light'
      ]
    },
    extensions: [
      'KHR_lights_punctual',
      'KHR_materials_clearcoat',
      'KHR_materials_emissive_strength',
      'KHR_materials_transmission'
    ]
  },
  {
    id: 'pipeline-console',
    fileName: 'pipeline-console.glb',
    sourcePath: 'assets/pipeline-console.glb',
    publicPath: '/models/portfolio-3d/pipeline-console.glb',
    byteSize: 3015672,
    sceneName: 'RyanOS_PipelineConsole',
    rootNodeName: 'PipelineConsole_Root',
    loadingTier: 'deferred',
    qualityVisibility: visibleMediumHigh,
    placement: roomAnchor('Anchor_PipelineConsole'),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-0.412, 0, -0.304], max: [0.412, 0.542, 0.226] },
    nodes: {
      anchors: ['Anchor_PipelineConsole', 'Anchor_DisplayCenter'],
      hotspots: ['Hotspot_CICDPipeline']
    },
    extensions: ['KHR_materials_emissive_strength']
  },
  {
    id: 'keyboard-mouse',
    fileName: 'keyboard-mouse.glb',
    sourcePath: 'assets/keyboard-mouse.glb',
    publicPath: '/models/portfolio-3d/keyboard-mouse.glb',
    byteSize: 5074116,
    sceneName: 'RyanOS_KeyboardMouse',
    rootNodeName: 'KeyboardMouse_Root',
    loadingTier: 'deferred',
    qualityVisibility: visibleHighOnly,
    placement: roomAnchor('Anchor_Desk', keyboardMouseDeskTransform),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-0.256, 0, -0.08], max: [0.259, 0.059, 0.075] },
    nodes: {
      anchors: ['Anchor_KeyboardCenter', 'Anchor_MouseCenter'],
      hotspots: ['Hotspot_Terminal']
    },
    extensions: ['KHR_materials_emissive_strength']
  },
  {
    id: 'storage-shelf',
    fileName: 'storage-shelf.glb',
    sourcePath: 'assets/storage-shelf.glb',
    publicPath: '/models/portfolio-3d/storage-shelf.glb',
    byteSize: 4137028,
    sceneName: 'RyanOS_StorageShelf',
    rootNodeName: 'StorageShelf_Root',
    loadingTier: 'deferred',
    qualityVisibility: visibleHighOnly,
    placement: roomAnchor('Anchor_StorageShelf'),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-0.755, 0, -0.255], max: [0.755, 2.118, 0.222] },
    nodes: {
      anchors: ['Anchor_StorageShelf', 'Anchor_ShelfLighting'],
      hotspots: ['Hotspot_EngineeringLab']
    },
    extensions: ['KHR_materials_emissive_strength']
  },
  {
    id: 'desk-lamp',
    fileName: 'desk-lamp.glb',
    sourcePath: 'assets/desk-lamp.glb',
    publicPath: '/models/portfolio-3d/desk-lamp.glb',
    byteSize: 2492032,
    sceneName: 'RyanOS_DeskLamp',
    rootNodeName: 'DeskLamp_Root',
    loadingTier: 'deferred',
    qualityVisibility: visibleHighOnly,
    placement: roomAnchor('Anchor_Desk', deskLampTransform),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-0.151, 0, -0.151], max: [0.817, 0.773, 0.153] },
    nodes: {
      anchors: ['Anchor_LampBase', 'Anchor_SpotLight', 'Anchor_LightTarget'],
      hotspots: []
    },
    extensions: ['KHR_materials_emissive_strength']
  },
  {
    id: 'desk-accessories',
    fileName: 'desk-accessories.glb',
    sourcePath: 'assets/desk-accessories.glb',
    publicPath: '/models/portfolio-3d/desk-accessories.glb',
    byteSize: 2680564,
    sceneName: 'RyanOS_DeskAccessories',
    rootNodeName: 'DeskAccessories_Root',
    loadingTier: 'deferred',
    qualityVisibility: visibleHighOnly,
    placement: roomAnchor('Anchor_Desk', deskAccessoriesTransform),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-0.432, 0, -0.167], max: [0.432, 0.251, 0.186] },
    nodes: {
      anchors: ['Anchor_Mug', 'Anchor_Phone', 'Anchor_Notebook'],
      hotspots: ['Hotspot_DeskAccessories'],
      screens: ['Phone_Display']
    },
    extensions: ['KHR_materials_emissive_strength']
  },
  {
    id: 'plants',
    fileName: 'plants.glb',
    sourcePath: 'assets/plants.glb',
    publicPath: '/models/portfolio-3d/plants.glb',
    byteSize: 5341308,
    sceneName: 'RyanOS_Plants',
    rootNodeName: 'Plants_Root',
    loadingTier: 'deferred',
    qualityVisibility: visibleHighOnly,
    placement: roomAnchor('Anchor_WindowBackdrop', plantsWindowTransform),
    fallbackTransform: identityTransform,
    boundingBox: { min: [-0.831, 0, -0.264], max: [0.749, 1.646, 0.548] },
    nodes: {
      anchors: ['Anchor_TallPlant', 'Anchor_DeskPlant', 'Anchor_PothosPlant'],
      hotspots: ['Hotspot_Plants']
    },
    extensions: ['KHR_materials_emissive_strength']
  }
] as const satisfies readonly SceneAssetDefinition[];

export const portfolio3dHotspots = [
  {
    id: 'profile',
    label: 'Profile',
    nodeName: 'Hotspot_Profile',
    assetId: 'room-shell',
    sectionId: 'profile',
    workspaceSection: 'profile',
    interactionKind: 'open-section'
  },
  {
    id: 'projects',
    label: 'Projects',
    nodeName: 'Hotspot_Projects',
    assetId: 'main-monitor',
    sectionId: 'projects',
    workspaceSection: 'projects',
    interactionKind: 'open-section'
  },
  {
    id: 'architecture',
    label: 'Architecture',
    nodeName: 'Hotspot_Architecture',
    assetId: 'architecture-screen',
    sectionId: 'architecture',
    workspaceSection: 'architecture',
    interactionKind: 'open-section'
  },
  {
    id: 'fullstack',
    label: 'Full Stack',
    nodeName: 'Hotspot_Fullstack',
    assetId: 'laptop',
    sectionId: 'fullstack',
    workspaceSection: 'profile',
    interactionKind: 'open-section'
  },
  {
    id: 'backend',
    label: 'Backend and API',
    nodeName: 'Hotspot_Backend',
    assetId: 'server-rack',
    sectionId: 'backend',
    workspaceSection: 'api',
    interactionKind: 'open-section'
  },
  {
    id: 'performance',
    label: 'Performance',
    nodeName: 'Hotspot_Performance',
    assetId: 'hologram-projector',
    sectionId: 'performance',
    workspaceSection: 'performance',
    interactionKind: 'open-section'
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    nodeName: 'Hotspot_CICDPipeline',
    assetId: 'pipeline-console',
    sectionId: 'pipeline',
    workspaceSection: 'pipeline',
    interactionKind: 'open-section'
  },
  {
    id: 'terminal',
    label: 'Terminal',
    nodeName: 'Hotspot_Terminal',
    assetId: 'keyboard-mouse',
    sectionId: 'terminal',
    workspaceSection: 'terminal',
    interactionKind: 'open-section'
  },
  {
    id: 'automation',
    label: 'Automation',
    nodeName: 'Hotspot_EngineeringLab',
    assetId: 'storage-shelf',
    sectionId: 'automation',
    workspaceSection: 'automation',
    interactionKind: 'open-section'
  },
  {
    id: 'contact',
    label: 'Contact',
    nodeName: 'Hotspot_DeskAccessories',
    assetId: 'desk-accessories',
    sectionId: 'contact',
    workspaceSection: 'contact',
    interactionKind: 'open-section'
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
