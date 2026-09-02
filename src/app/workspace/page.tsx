import { RyanOSApp } from '@/features/workspace/components/RyanOSApp';
import { homeWorkspaceRoute } from '@/features/workspace/routing';

export default function WorkspacePage(): React.ReactElement {
  return <RyanOSApp initialRoute={homeWorkspaceRoute} />;
}