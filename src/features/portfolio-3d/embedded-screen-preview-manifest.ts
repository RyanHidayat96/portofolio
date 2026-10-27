import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-10-27T08:40:56.137Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: '452fd59b3fe5017c' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: 'cffd2aee79e4d3ae' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: '2aa900d08c3410f0' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '993500fd47f33e7c' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: '8ebbf9a3ae93f982' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: 'e196388da463f9fa' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '7d81511a64e986de' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: 'a1110623fd430272' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: '389f72d9f48c2065' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
