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
        "border border-[var(--border)] bg-[var(--panel)] shadow-[0_24px_80px_rgba(0,0,0,0.22)]",
        className
      )}
    >
      {children}
    </Component>
  );
}
