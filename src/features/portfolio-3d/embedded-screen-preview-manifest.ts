import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-10-14T16:54:44.195Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: '9f7b45a337ec69fe' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: 'd86082c858b36eca' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: '751b07aa500b87ab' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: '1e030b0701118f63' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: 'f2ddbcf857e57ad8' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: '63299c3f59d10b2a' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: 'd36f55fc92774b95' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '8c14be1f211c7502' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: '4db6052a55a9ed01' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
