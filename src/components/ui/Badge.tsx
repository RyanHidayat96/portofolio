import { cn } from "@/lib/cn";

type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

const toneClass: Record<BadgeTone, string> = {
  neutral: "badge-neutral",
  info: "badge-info",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger"
};

export function Badge({
  children,
  tone = "neutral",
  className
}: Readonly<{
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}>): React.ReactElement {
  return <span className={cn("badge-base", toneClass[tone], className)}>{children}</span>;
}
