import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-09-14T04:08:52.689Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: 'dca1d5192cad2b1f' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: '4c7fcd4d34cb50f4' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: 'de949c5baf876d2e' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '47489055011a5ee8' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: 'a471507c8aa00cdf' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: 'e5d702223e117c81' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: 'ede9dd845686d1e8' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: 'f1312b42a782d573' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: '0e8c4fd942fbe0fd' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
