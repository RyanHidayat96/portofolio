import { PortfolioApp } from '@/features/workspace/components/PortfolioApp';
import { homeWorkspaceRoute } from '@/features/workspace/routing';

export default function WorkspacePage(): React.ReactElement {
  return <PortfolioApp initialRoute={homeWorkspaceRoute} />;
}
