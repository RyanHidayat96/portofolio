import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-10-27T09:09:06.633Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: '4f3ce5ad35b24ed0' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: '07f14dbf61a5712c' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: 'a3e3599e5af02a79' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '66a94db1c908cee2' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: '052ed222bb090c03' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: 'aa729b97346609b9' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: '0a95d922ce3a28b0' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '656d293348125571' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: 'd7111b1bc1443e59' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
