import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-09-14T10:50:59.507Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: '2eba3ae5cda62c41' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: 'fdf2220c000d3f22' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: '3108908a9d516505' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '6361c5c6a5012ae3' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: 'bf33825d8eabc339' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: '88f3db2c496a3712' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '2ccec1eff2da3b16' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: 'bfe62626af37367e' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: 'c572b533e5cd1d41' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
