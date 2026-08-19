import { cn } from "@/lib/cn";

type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

const toneClass: Record<BadgeTone, string> = {
  neutral: "border-[var(--border)] text-[var(--text-muted)]",
  info: "border-[rgba(85,215,255,0.4)] text-[var(--accent)]",
  success: "border-[rgba(110,231,168,0.4)] text-[var(--success)]",
  warning: "border-[rgba(255,211,110,0.4)] text-[var(--warning)]",
  danger: "border-[rgba(255,111,125,0.4)] text-[var(--danger)]"
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
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 text-xs font-semibold",
        toneClass[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
