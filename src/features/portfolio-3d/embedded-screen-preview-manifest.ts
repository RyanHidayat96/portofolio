import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-09-14T04:29:56.237Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: '04e578dd7be3ad7f' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: 'f344ac22ae044b33' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: 'b5a56b656a3fe42e' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '646662a69d0ea1f9' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: '74b67261449466c7' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: '68ce289f042aaf58' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '5359440997173f2b' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: 'e3ccad5b1c2f76a0' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: 'e4b99c1e38143be5' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
