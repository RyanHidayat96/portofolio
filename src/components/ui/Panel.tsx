import { cn } from "@/lib/cn";

export function Panel({
  children,
  className,
  as: Component = "section"
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
}>): React.ReactElement {
  return <Component className={cn("panel-surface", className)}>{children}</Component>;
}
