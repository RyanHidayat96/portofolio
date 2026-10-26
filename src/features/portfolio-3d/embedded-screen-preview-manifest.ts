import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-10-15T09:20:38.411Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: '452f073569292f7b' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: '8d8e2dfbcefbc41d' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: 'c382387a60c1a193' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '036d4cb35e2ef005' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: 'f081631d3ae95bd0' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: '1facc38e6bd75180' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '6b7825c27d8f29a3' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '7b422d4a0e7bfba9' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: '303ccadaf0755c55' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
