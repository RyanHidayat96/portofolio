import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-09-14T05:45:39.324Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: 'f78f23c54b9e83fc' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: 'c7d9a4e0898cc060' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: '34cf02c0ba0df709' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '162441a27019b1a4' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: 'a1008c2701a0f6ad' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: '8226493d0e737498' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '4270e1e2de9eb5b0' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '64b79f460d78572f' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: 'e876c18d8b31f3e9' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
