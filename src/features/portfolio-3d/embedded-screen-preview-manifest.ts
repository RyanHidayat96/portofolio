import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-10-29T08:42:09.959Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: '8234433aa7d04417' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: 'b3bd36c09a8aaa58' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: '7c6e8f3fa3f8ba4d' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '101824e2751a3e89' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: 'c6c9a439f53b64ff' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: '7aaa0405de650677' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '652d514ef813ac80' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '3196e670dea11092' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: 'cbaca5e58b070b75' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
