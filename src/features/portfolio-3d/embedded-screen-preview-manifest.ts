import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-10-15T07:55:54.817Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: '9f869777fac3e5bb' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: '339b98038d7f1d31' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: 'e67f492309782c1f' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '91545005f0b2b284' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: '30c00e2a422eccee' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: 'd42f239794c22e46' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '5c6d83d9417b65a9' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: 'fb382cb93e53cd75' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: 'd58365b232857237' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
