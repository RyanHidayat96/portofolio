import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-10-26T14:40:22.026Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: '2451b6426c2006e3' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: '2c8f1b1e40511598' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: '6cd2f8d15fcf1fef' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '7cce15003091c129' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: 'e88188a89dceca1d' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: 'a6911077c9e6f05b' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '4060dd7450c9ef08' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '7885beeafa0f73be' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: '1c6f3171c7c6e5dd' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
