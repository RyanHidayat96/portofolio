import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-09-14T04:52:58.611Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: 'c656f1ef3752ba43' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: '5c84c282afb24788' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: '0d42083d6fa20008' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '2b011b195125bfdf' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: 'f7e0f8ef65ad4da7' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: '92f939cfab1ea53f' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '07f692cf843148f4' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '13342a35c14fd63a' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: 'c9a243a86911b7b4' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
