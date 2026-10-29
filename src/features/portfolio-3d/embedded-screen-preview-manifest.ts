import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-10-29T02:59:36.354Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: '037ed3ee35d870ea' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: '573f9972bf590106' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: 'c40f62f787bd4247' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '33355c4b8d67088c' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: '0d3e42500b869d4d' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: 'ff55f52d27a7a9fb' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '957e7c6f816ecfdb' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '2072138ed2e6d5f0' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: 'b01a48c350abd5a1' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
