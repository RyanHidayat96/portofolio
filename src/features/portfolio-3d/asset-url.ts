import { portfolio3dAssetById } from './scene-manifest';
import type { Portfolio3dAssetId } from './types';

const absolutePathPattern = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export const portfolio3dPublicAssetDirectory = '/models/portfolio-3d';

export function normalizePortfolio3dBasePath(
  rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH
): string {
  const trimmed = rawBasePath?.trim() ?? '';

  if (!trimmed || trimmed === '/') {
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    return normalizePathname(parsed.pathname);
  } catch {
    return normalizePathname(trimmed);
  }
}

export function withPortfolio3dBasePath(
  path: string,
  basePath = normalizePortfolio3dBasePath()
): string {
  if (absolutePathPattern.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedBasePath = normalizePortfolio3dBasePath(basePath);

  if (!normalizedBasePath) {
    return normalizedPath;
  }

  if (normalizedPath === '/') {
    return normalizedBasePath;
  }

  return `${normalizedBasePath}${normalizedPath}`;
}

export function getPortfolio3dAssetUrl(
  assetId: Portfolio3dAssetId,
  options: Readonly<{ basePath?: string }> = {}
): string {
  const asset = portfolio3dAssetById[assetId];
  return withPortfolio3dBasePath(asset.publicPath, options.basePath);
}

function normalizePathname(value: string): string {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/u, '');
  return withoutTrailingSlash === '' || withoutTrailingSlash === '/' ? '' : withoutTrailingSlash;
}
