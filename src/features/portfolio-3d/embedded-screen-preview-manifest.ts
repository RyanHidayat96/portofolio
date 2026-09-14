import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-09-14T04:45:08.457Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: 'a66cca31e8343301' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: 'bd39c51e28d1207f' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: 'c572f7f4529afe62' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '3302722158e1d218' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: '118be6450231e7a1' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: '44175e614696b369' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '7bceb7b3f378d2d9' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '1c3bc422581aad7f' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: 'cb55ece3bc73012d' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
