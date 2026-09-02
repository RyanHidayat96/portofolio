import type { NodeAliasDefinition, Portfolio3dAssetId } from './types';

export const portfolio3dNodeAliases = [
  {
    assetId: 'pipeline-console',
    requestedName: 'Hotspot_Pipeline',
    actualName: 'Hotspot_CICDPipeline',
    reason: 'Stage 0 GLB audit found the pipeline hotspot under the CI/CD-specific node name.'
  }
] as const satisfies readonly NodeAliasDefinition[];

const warnedAliases = new Set<string>();

export function getPortfolio3dNodeAlias(
  assetId: Portfolio3dAssetId,
  requestedName: string
): NodeAliasDefinition | undefined {
  return portfolio3dNodeAliases.find(
    (alias) => alias.assetId === assetId && alias.requestedName === requestedName
  );
}

export function resolvePortfolio3dNodeName(
  assetId: Portfolio3dAssetId,
  requestedName: string,
  availableNodeNames?: ReadonlySet<string>
): string {
  if (availableNodeNames?.has(requestedName)) {
    return requestedName;
  }

  const alias = getPortfolio3dNodeAlias(assetId, requestedName);
  if (!alias) {
    return requestedName;
  }

  if (!availableNodeNames || availableNodeNames.has(alias.actualName)) {
    warnPortfolio3dNodeAliasUse(alias);
    return alias.actualName;
  }

  return requestedName;
}

export function warnPortfolio3dNodeAliasUse(alias: NodeAliasDefinition): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const warningKey = `${alias.assetId}:${alias.requestedName}:${alias.actualName}`;
  if (warnedAliases.has(warningKey)) {
    return;
  }

  warnedAliases.add(warningKey);
  console.warn(
    `[portfolio-3d] Using node alias for ${alias.assetId}: ${alias.requestedName} -> ${alias.actualName}. ${alias.reason}`
  );
}
