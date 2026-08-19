import type { Metadata } from "next";
import { getWorkspaceRouteMetadata } from "@/config/site";
import { RyanOSApp } from "@/features/workspace/components/RyanOSApp";
import {
  getStaticWorkspacePaths,
  resolveWorkspaceRouteFromSegments
} from "@/features/workspace/routing";
import { notFound } from "next/navigation";

interface DeepLinkPageProps {
  readonly params: Promise<{
    readonly slug: string[];
  }>;
}

export function generateStaticParams(): Array<{ slug: string[] }> {
  return getStaticWorkspacePaths()
    .filter((path) => path !== "/")
    .map((path) => ({
      slug: path.split("/").filter(Boolean)
    }));
}

export async function generateMetadata({ params }: DeepLinkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const initialRoute = resolveWorkspaceRouteFromSegments(slug);

  if (!initialRoute.isKnownRoute) {
    return {};
  }

  return getWorkspaceRouteMetadata(initialRoute);
}

export default async function DeepLinkPage({
  params
}: DeepLinkPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const initialRoute = resolveWorkspaceRouteFromSegments(slug);

  if (!initialRoute.isKnownRoute) {
    notFound();
  }

  return <RyanOSApp initialRoute={initialRoute} />;
}
