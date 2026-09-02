import type { Metadata } from 'next';
import { PortfolioExperience } from '@/features/portfolio-3d/components/PortfolioExperience';

export const metadata: Metadata = {
  title: '3D Portfolio',
  description: 'Progressive 3D portfolio runtime for RyanOS.'
};

export default function Portfolio3dPage(): React.ReactElement {
  return <PortfolioExperience />;
}
