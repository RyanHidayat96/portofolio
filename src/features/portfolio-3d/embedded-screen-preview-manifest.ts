import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-10-27T09:34:19.089Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: '681fe0c6f18691c1' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: 'a5555de55f5c9d09' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: 'd0051eddf75be1ee' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '13a03f661fec2849' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: 'd4519958f22ee328' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: '72f092447e5db951' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: 'aa409184f47c8457' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '3fa1dfc2829caba5' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: '220a0680982e4686' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
