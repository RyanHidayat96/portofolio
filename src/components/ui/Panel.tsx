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
  return (
    <Component
      className={cn(
        "rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-panel)]",
        className
      )}
    >
      {children}
    </Component>
  );
}
