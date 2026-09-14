import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-09-14T03:22:27.894Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: '007233a12408898e' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: '7573dd8ffa4c7d57' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: '67eedb058331ec1b' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '59267c804f428dea' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: '28a4e703b52d4b2c' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: '38d6587f44430554' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: 'f5c2e20855839448' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '2685100f0ca55b2e' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: '61fb702a737f6e84' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
