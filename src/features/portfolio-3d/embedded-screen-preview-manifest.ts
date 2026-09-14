import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-09-14T03:54:00.081Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: 'e6fba8fb47dca9fc' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: '64b4aa5d99276f9b' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: '1795b69ea8cdd931' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: 'e9a9d7263a0b2c04' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: '715db71345ed69c9' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: '910cb85f2d56e00f' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '69ca58bfd4ba7696' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '345c1fc81ff72769' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: '7c6538f5b895af9e' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
