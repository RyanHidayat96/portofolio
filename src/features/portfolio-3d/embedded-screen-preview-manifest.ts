import type { EmbeddedScreenId } from './arcade-screen';

export interface EmbeddedScreenPreviewEntry {
  readonly publicPath: string;
  readonly sourceHash: string;
}

export const embeddedScreenPreviewGeneratedAt =
  '2026-10-14T16:02:49.180Z';

export const embeddedScreenPreviewManifest = {
  pipeline: { publicPath: '/portfolio-screen-previews/pipeline.webp', sourceHash: 'b470a9a4c9d9f7ab' },
  automation: { publicPath: '/portfolio-screen-previews/automation.webp', sourceHash: 'bdd7864cf9bf3cd4' },
  performance: { publicPath: '/portfolio-screen-previews/performance.webp', sourceHash: 'e7060fd26bc702d1' },
  backend: { publicPath: '/portfolio-screen-previews/backend.webp', sourceHash: 'edda7d3077895855' },
  terminal: { publicPath: '/portfolio-screen-previews/terminal.webp', sourceHash: 'c04a7cc026a206f3' },
  profile: { publicPath: '/portfolio-screen-previews/profile.webp', sourceHash: '72d1a70463eef5ca' },
  experience: { publicPath: '/portfolio-screen-previews/experience.webp', sourceHash: 'c87aaf29a97b0b02' },
  architecture: { publicPath: '/portfolio-screen-previews/architecture.webp', sourceHash: '59aa6cec9a18c8aa' },
  contact: { publicPath: '/portfolio-screen-previews/contact.webp', sourceHash: 'd1c502f720c67886' },
} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;

export function getEmbeddedScreenStaticPreview(
  screenId: EmbeddedScreenId
): EmbeddedScreenPreviewEntry | undefined {
  return embeddedScreenPreviewManifest[screenId];
}
