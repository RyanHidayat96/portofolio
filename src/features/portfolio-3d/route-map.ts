import { getWorkspacePath } from '@/features/workspace/routing';
import type { WorkspaceSection } from '@/features/workspace/types';
import type { Portfolio3dRouteTarget, Portfolio3dSectionId } from './types';

const routePathFor = (section: WorkspaceSection): string =>
  section === 'overview' ? '/workspace' : getWorkspacePath({ section });

const routeTargets = [
  { sectionId: 'overview', workspaceSection: 'overview', cameraPresetId: 'overview' },
  { sectionId: 'profile', workspaceSection: 'profile', cameraPresetId: 'profile' },
  { sectionId: 'experience', workspaceSection: 'experience', cameraPresetId: 'experience' },
  { sectionId: 'projects', workspaceSection: 'projects', cameraPresetId: 'projects' },
  { sectionId: 'fullstack', workspaceSection: 'profile', cameraPresetId: 'fullstack' },
  { sectionId: 'backend', workspaceSection: 'api', cameraPresetId: 'backend' },
  { sectionId: 'architecture', workspaceSection: 'architecture', cameraPresetId: 'architecture' },
  { sectionId: 'automation', workspaceSection: 'automation', cameraPresetId: 'automation' },
  { sectionId: 'performance', workspaceSection: 'performance', cameraPresetId: 'performance' },
  { sectionId: 'pipeline', workspaceSection: 'pipeline', cameraPresetId: 'pipeline' },
  { sectionId: 'terminal', workspaceSection: 'terminal', cameraPresetId: 'terminal' },
  { sectionId: 'contact', workspaceSection: 'contact', cameraPresetId: 'contact' }
] as const;

export const portfolio3dSectionQueryParam = 'section';

export const portfolio3dRouteTargets = routeTargets.map((target) => ({
  ...target,
  path: routePathFor(target.workspaceSection),
  queryValue: target.sectionId
})) as readonly Portfolio3dRouteTarget[];

export const portfolio3dRouteTargetBySectionId = Object.fromEntries(
  portfolio3dRouteTargets.map((target) => [target.sectionId, target])
) as Record<(typeof portfolio3dRouteTargets)[number]['sectionId'], (typeof portfolio3dRouteTargets)[number]>;


export function getPortfolio3dRouteTarget(
  sectionId: Portfolio3dSectionId
): Portfolio3dRouteTarget | undefined {
  return portfolio3dRouteTargets.find((target) => target.sectionId === sectionId);
}

export function isPortfolio3dRouteQueryValue(value: string | undefined): boolean {
  return Boolean(findPortfolio3dRouteTargetByQueryValue(value?.trim()));
}

export function resolvePortfolio3dSectionFromLocation(
  search: string,
  hash: string
): Portfolio3dSectionId {
  const searchParams = new URLSearchParams(search);
  const queryValue = searchParams.get(portfolio3dSectionQueryParam)?.trim();
  const hashValue = hash.replace(/^#/, '').trim();
  const target = findPortfolio3dRouteTargetByQueryValue(queryValue ?? hashValue);

  return target?.sectionId ?? 'overview';
}

export function createPortfolio3dLocationPath(
  sectionId: Portfolio3dSectionId,
  pathname: string,
  currentSearch = ''
): string {
  const target = getPortfolio3dRouteTarget(sectionId);
  const searchParams = new URLSearchParams(currentSearch);
  searchParams.delete(portfolio3dSectionQueryParam);

  if (target && target.sectionId !== 'overview') {
    searchParams.set(portfolio3dSectionQueryParam, target.queryValue);
  }

  const search = searchParams.toString();
  return `${pathname}${search ? `?${search}` : ''}`;
}
function findPortfolio3dRouteTargetByQueryValue(
  queryValue: string | undefined
): Portfolio3dRouteTarget | undefined {
  if (!queryValue) {
    return undefined;
  }

  return portfolio3dRouteTargets.find((target) => target.queryValue === queryValue);
}